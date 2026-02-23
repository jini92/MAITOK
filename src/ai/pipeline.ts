import Anthropic from '@anthropic-ai/sdk'
import type { SentimentResult, ReplyDraft, GenerateReplyOptions } from './types.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = process.env.LLM_MODEL ?? 'claude-sonnet-4-6'

export async function analyzeSentiment(commentText: string): Promise<SentimentResult> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a TikTok comment analyst for a beauty/commerce seller.

Analyze the following comment and return JSON only, no markdown:
{
  "sentiment": "positive" | "negative" | "neutral" | "question",
  "category": "purchase_intent" | "product_question" | "compliment" | "complaint" | "spam" | "other",
  "language": "ko" | "vi" | "en" | "other",
  "priority": 1-5,
  "needs_reply": true | false
}

Comment: "${commentText.replace(/"/g, '\\"')}"`,
      },
    ],
  })

  const raw = (message.content[0] as Anthropic.TextBlock).text
  return JSON.parse(raw) as SentimentResult
}

export async function generateReply(
  commentText: string,
  analysis: SentimentResult,
  options: GenerateReplyOptions,
): Promise<ReplyDraft> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are a friendly TikTok seller assistant for brand "${options.brandName}".

Rules:
- Reply in the SAME language as the comment
- Keep under 150 characters (TikTok comment limit)
- Use 1-2 relevant emojis
- Be warm, authentic, not robotic
- For purchase_intent: include purchase link or DM guidance
- For complaint: empathize first, then offer solution
- For compliment: thank sincerely
- Match the seller's tone: ${options.toneStyle}

Comment: "${commentText.replace(/"/g, '\\"')}"
Sentiment: ${analysis.sentiment}
Category: ${analysis.category}

Reply:`,
      },
    ],
  })

  const reply_text = (message.content[0] as Anthropic.TextBlock).text.trim()

  return {
    comment_id: options.commentId,
    reply_text,
    generated_at: new Date().toISOString(),
  }
}
