import type { SentimentResult, ReplyDraft } from '../ai/types.js'

export interface CommentAlertPayload {
  commentId: string
  videoId: string
  commentText: string
  author: string
  analysis: SentimentResult
  replyDraft: ReplyDraft
}

export interface DailySummaryStats {
  date: string
  totalComments: number
  bysentiment: Record<string, number>
  byCategory: Record<string, number>
  repliesGenerated: number
  repliesPosted: number
  topPriorityCount: number
}
