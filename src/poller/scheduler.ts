import db from '../db/index.js'
import type { WatchedVideo, TikTokComment, PollResult } from './types.js'

const INTERVAL_NEW_MS = 2 * 60 * 1000   // 2min: video < 24h
const INTERVAL_DEFAULT_MS = 5 * 60 * 1000 // 5min: default
const INTERVAL_OLD_MS = 30 * 60 * 1000  // 30min: video > 7d

const AGE_NEW_THRESHOLD_MS = 24 * 60 * 60 * 1000
const AGE_OLD_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000

function getAdaptiveInterval(videoCreatedAt: number): number {
  const ageMs = Date.now() - videoCreatedAt * 1000
  if (ageMs < AGE_NEW_THRESHOLD_MS) return INTERVAL_NEW_MS
  if (ageMs > AGE_OLD_THRESHOLD_MS) return INTERVAL_OLD_MS
  return INTERVAL_DEFAULT_MS
}

function getActiveVideos(): WatchedVideo[] {
  return db
    .prepare('SELECT * FROM watched_videos WHERE active = 1')
    .all() as WatchedVideo[]
}

function getVideoOldestCommentTimestamp(videoId: string): number {
  const row = db
    .prepare('SELECT MIN(created_at) as min_ts FROM comments WHERE video_id = ?')
    .get(videoId) as { min_ts: number | null } | undefined
  return row?.min_ts ?? Math.floor(Date.now() / 1000)
}

function saveComments(comments: TikTokComment[]): void {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO comments
      (id, video_id, text, parent_id, like_count, reply_count, created_at)
    VALUES
      (@id, @video_id, @text, @parent_id, @like_count, @reply_count, @created_at)
  `)
  const saveAll = db.transaction((rows: TikTokComment[]) => {
    for (const row of rows) insert.run(row)
  })
  saveAll(comments)
}

function updateCursor(videoId: string, cursor: number): void {
  db.prepare('UPDATE watched_videos SET last_cursor = ? WHERE video_id = ?').run(
    cursor,
    videoId
  )
}

// Stub: replace with real TikTok Research API client when available
async function fetchComments(
  videoId: string,
  cursor: number
): Promise<{ comments: TikTokComment[]; nextCursor: number }> {
  void videoId
  void cursor
  return { comments: [], nextCursor: cursor }
}

export async function pollVideo(videoId: string): Promise<PollResult> {
  const row = db
    .prepare('SELECT * FROM watched_videos WHERE video_id = ? AND active = 1')
    .get(videoId) as WatchedVideo | undefined

  if (!row) return { videoId, newComments: 0, nextCursor: 0 }

  const { comments, nextCursor } = await fetchComments(videoId, row.last_cursor)

  if (comments.length > 0) {
    saveComments(comments)
    updateCursor(videoId, nextCursor)
  }

  return { videoId, newComments: comments.length, nextCursor }
}

const timers = new Map<string, ReturnType<typeof setInterval>>()

function scheduleVideo(video: WatchedVideo): void {
  if (timers.has(video.video_id)) return

  // Use oldest known comment timestamp to infer approximate video age
  const oldestTs = getVideoOldestCommentTimestamp(video.video_id)
  const intervalMs = getAdaptiveInterval(oldestTs)

  const timer = setInterval(async () => {
    try {
      await pollVideo(video.video_id)
    } catch (err) {
      console.error(`[poller] error polling ${video.video_id}:`, err)
    }
  }, intervalMs)

  timers.set(video.video_id, timer)
}

export function startPolling(): void {
  const videos = getActiveVideos()
  for (const video of videos) {
    scheduleVideo(video)
  }

  // Refresh video list every 5 minutes to pick up newly watched videos
  setInterval(() => {
    const current = getActiveVideos()
    for (const video of current) {
      scheduleVideo(video)
    }
    // Stop timers for videos that became inactive
    for (const [videoId, timer] of timers) {
      const still = current.find((v) => v.video_id === videoId)
      if (!still) {
        clearInterval(timer)
        timers.delete(videoId)
      }
    }
  }, INTERVAL_DEFAULT_MS)
}

export function stopPolling(): void {
  for (const timer of timers.values()) clearInterval(timer)
  timers.clear()
}
