import type {
  FetchCommentsParams,
  TikTokComment,
  TikTokCommentListResponse,
  TikTokTokenApiResponse,
  TikTokTokenData,
  RateLimitState,
} from './types.js'

const BASE_URL = 'https://open.tiktokapis.com'

// TikTok Research API daily limit
const DAILY_LIMIT = 1_000

export class TikTokRateLimitError extends Error {
  constructor(public readonly resetAt: Date) {
    super(`TikTok Research API daily quota exhausted. Resets at ${resetAt.toISOString()}`)
    this.name = 'TikTokRateLimitError'
  }
}

export class TikTokApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly logId: string,
  ) {
    super(`TikTok API error [${code}]: ${message} (log_id=${logId})`)
    this.name = 'TikTokApiError'
  }
}

export class TikTokClient {
  private accessToken: string
  private rateLimit: RateLimitState

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.rateLimit = {
      dailyRemaining: DAILY_LIMIT,
      resetAt: nextMidnightPST(),
    }
  }

  /**
   * Fetch comments for a video from the Research API.
   * Uses cursor-based pagination; pass the cursor from the previous response
   * to retrieve the next page. Omit cursor (or pass 0) for the first page.
   *
   * @throws {TikTokRateLimitError} when the daily quota is exhausted
   * @throws {TikTokApiError} on API-level errors returned by TikTok
   */
  async fetchComments(
    videoId: string,
    cursor = 0,
    maxCount = 20,
  ): Promise<{ comments: TikTokComment[]; nextCursor: number; hasMore: boolean }> {
    this.checkRateLimit()

    const params: FetchCommentsParams = {
      video_id: videoId,
      max_count: Math.min(Math.max(1, maxCount), 100),
      cursor,
    }

    const url = new URL(`${BASE_URL}/v2/research/video/comment/list/`)
    // Fields to request (TikTok Research API uses a fields query param)
    url.searchParams.set(
      'fields',
      'id,video_id,text,like_count,reply_count,parent_comment_id,create_time',
    )

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(params),
    })

    this.decrementRateLimit()

    if (!response.ok) {
      await this.handleHttpError(response)
    }

    const json = (await response.json()) as TikTokCommentListResponse

    if (json.error?.code && json.error.code !== 'ok') {
      if (json.error.code === 'rate_limit_exceeded') {
        throw new TikTokRateLimitError(this.rateLimit.resetAt)
      }
      throw new TikTokApiError(json.error.code, json.error.message, json.error.log_id)
    }

    return {
      comments: json.data.comments ?? [],
      nextCursor: json.data.cursor,
      hasMore: json.data.has_more,
    }
  }

  /**
   * Exchange a refresh token for a new access token.
   * Updates the internal access token on success.
   *
   * @throws {TikTokApiError} on failure
   */
  async refreshToken(refreshToken: string): Promise<TikTokTokenData> {
    const clientId = process.env.TIKTOK_CLIENT_ID
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error('TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET must be set in environment')
    }

    const body = new URLSearchParams({
      client_key: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await fetch(`${BASE_URL}/v2/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      await this.handleHttpError(response)
    }

    const json = (await response.json()) as TikTokTokenApiResponse

    if (json.error?.code && json.error.code !== 'ok') {
      throw new TikTokApiError(json.error.code, json.error.message, json.error.log_id)
    }

    // Update the internal token so subsequent calls use the refreshed token
    this.accessToken = json.data.access_token

    return json.data
  }

  /** Remaining daily API calls available */
  get remainingQuota(): number {
    return this.rateLimit.dailyRemaining
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private checkRateLimit(): void {
    const now = new Date()
    if (now >= this.rateLimit.resetAt) {
      // New day: reset counter
      this.rateLimit = { dailyRemaining: DAILY_LIMIT, resetAt: nextMidnightPST() }
    }
    if (this.rateLimit.dailyRemaining <= 0) {
      throw new TikTokRateLimitError(this.rateLimit.resetAt)
    }
  }

  private decrementRateLimit(): void {
    this.rateLimit.dailyRemaining = Math.max(0, this.rateLimit.dailyRemaining - 1)
  }

  private async handleHttpError(response: Response): Promise<never> {
    let body = ''
    try {
      body = await response.text()
    } catch {
      // ignore read errors
    }
    if (response.status === 429) {
      throw new TikTokRateLimitError(this.rateLimit.resetAt)
    }
    throw new TikTokApiError(
      `HTTP_${response.status}`,
      `HTTP ${response.status} ${response.statusText}: ${body}`,
      '',
    )
  }
}

/** Returns the next midnight in PST (UTC-8), which is when TikTok resets daily quotas. */
function nextMidnightPST(): Date {
  const now = new Date()
  // PST offset: UTC-8
  const pstOffset = -8 * 60 * 60 * 1000
  const pstNow = new Date(now.getTime() + pstOffset)
  const midnight = new Date(pstNow)
  midnight.setUTCHours(24, 0, 0, 0)
  // Convert back to UTC
  return new Date(midnight.getTime() - pstOffset)
}
