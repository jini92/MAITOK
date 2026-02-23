import type { CommentAlertPayload, DailySummaryStats } from './types.js'

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '😊',
  negative: '😞',
  neutral: '😐',
  question: '❓',
}

const CATEGORY_LABEL: Record<string, string> = {
  purchase_intent: '🛒 구매 의향',
  product_question: '📦 제품 문의',
  compliment: '💐 칭찬',
  complaint: '⚠️ 불만',
  spam: '🚫 스팸',
  other: '💬 기타',
}

const PRIORITY_COLOR: Record<number, number> = {
  1: 0x2ecc71, // green
  2: 0x3498db, // blue
  3: 0xf39c12, // orange
  4: 0xe67e22, // dark orange
  5: 0xe74c3c, // red
}

async function post(body: object): Promise<void> {
  if (!WEBHOOK_URL) {
    throw new Error('DISCORD_WEBHOOK_URL is not set')
  }
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Discord webhook failed: ${res.status} ${res.statusText}`)
  }
}

export async function sendCommentAlert(payload: CommentAlertPayload): Promise<void> {
  const { commentId, videoId, commentText, author, analysis, replyDraft } = payload
  const { sentiment, category, language, priority } = analysis

  await post({
    embeds: [
      {
        title: `${SENTIMENT_EMOJI[sentiment]} 새 댓글 알림 — 우선순위 P${priority}`,
        color: PRIORITY_COLOR[priority] ?? 0x95a5a6,
        fields: [
          { name: '댓글', value: commentText, inline: false },
          { name: '작성자', value: author, inline: true },
          { name: '카테고리', value: CATEGORY_LABEL[category] ?? category, inline: true },
          { name: '언어', value: language.toUpperCase(), inline: true },
          {
            name: '📝 AI 대댓글 초안',
            value: `\`\`\`\n${replyDraft.reply_text}\n\`\`\``,
            inline: false,
          },
        ],
        footer: {
          text: `댓글 ID: ${commentId} | 영상 ID: ${videoId}`,
        },
        timestamp: replyDraft.generated_at,
      },
    ],
  })
}

export async function sendDailySummary(stats: DailySummaryStats): Promise<void> {
  const sentimentLines = Object.entries(stats.bysentiment)
    .map(([k, v]) => `${SENTIMENT_EMOJI[k] ?? '•'} ${k}: **${v}**`)
    .join('\n')

  const categoryLines = Object.entries(stats.byCategory)
    .map(([k, v]) => `${CATEGORY_LABEL[k] ?? k}: **${v}**`)
    .join('\n')

  await post({
    embeds: [
      {
        title: `📊 일일 댓글 요약 — ${stats.date}`,
        color: 0x9b59b6,
        fields: [
          {
            name: '총 댓글',
            value: `**${stats.totalComments}**개`,
            inline: true,
          },
          {
            name: '대댓글 생성',
            value: `**${stats.repliesGenerated}**개`,
            inline: true,
          },
          {
            name: '대댓글 게시',
            value: `**${stats.repliesPosted}**개`,
            inline: true,
          },
          {
            name: '감성 분포',
            value: sentimentLines || '없음',
            inline: true,
          },
          {
            name: '카테고리 분포',
            value: categoryLines || '없음',
            inline: true,
          },
          {
            name: '🔴 고우선순위 (P1-P2)',
            value: `**${stats.topPriorityCount}**개`,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
