// TikTok Research API v2 response types

export interface TikTokApiError {
  code: string
  message: string
  log_id: string
}

export interface TikTokApiBase<T> {
  data: T
  error: TikTokApiError
}

// /v2/research/video/comment/list/
export interface TikTokComment {
  id: string
  video_id: string
  text: string
  like_count: number
  reply_count: number
  parent_comment_id: string | null
  create_time: number  // unix timestamp
}

export interface TikTokCommentListData {
  comments: TikTokComment[]
  cursor: number
  has_more: boolean
  search_id: string
}

export type TikTokCommentListResponse = TikTokApiBase<TikTokCommentListData>

export interface FetchCommentsParams {
  video_id: string
  max_count?: number   // 1–100, default 20
  cursor?: number      // pagination cursor (0 = first page)
}

// OAuth token endpoints
export interface TikTokTokenResponse {
  access_token: string
  expires_in: number       // seconds until expiry
  open_id: string
  refresh_expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

export interface TikTokTokenData {
  access_token: string
  expires_in: number
  open_id: string
  refresh_expires_in: number
  refresh_token: string
  scope: string
  token_type: string
}

export type TikTokTokenApiResponse = TikTokApiBase<TikTokTokenData>

// Rate limit tracking
export interface RateLimitState {
  dailyRemaining: number
  resetAt: Date
}
