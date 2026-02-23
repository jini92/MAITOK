export interface WatchedVideo {
  id: number
  video_id: string
  video_url: string | null
  seller_id: number | null
  last_cursor: number
  poll_interval_sec: number
  active: boolean
  created_at: string
}

export interface TikTokComment {
  id: string
  video_id: string
  text: string
  parent_id: string | null
  like_count: number
  reply_count: number
  created_at: number  // unix timestamp
}

export interface PollResult {
  videoId: string
  newComments: number
  nextCursor: number
}
