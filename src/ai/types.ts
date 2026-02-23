export type Sentiment = 'positive' | 'negative' | 'neutral' | 'question'

export type CommentCategory =
  | 'purchase_intent'
  | 'product_question'
  | 'compliment'
  | 'complaint'
  | 'spam'
  | 'other'

export type Language = 'ko' | 'vi' | 'en' | 'other'

export type ReplyStatus = 'draft' | 'approved' | 'posted' | 'rejected'

export type CommentReplyStatus = 'pending' | 'generated' | 'approved' | 'posted' | 'skipped'

export interface SentimentResult {
  sentiment: Sentiment
  category: CommentCategory
  language: Language
  priority: 1 | 2 | 3 | 4 | 5
  needs_reply: boolean
}

export interface ReplyDraft {
  comment_id: string
  reply_text: string
  generated_at: string
}

export interface GenerateReplyOptions {
  commentId: string
  brandName: string
  toneStyle: string
}
