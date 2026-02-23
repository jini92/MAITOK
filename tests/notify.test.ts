import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { CommentAlertPayload, DailySummaryStats } from '../src/notify/types.js'

const WEBHOOK = 'https://discord.test/webhook'
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Discord notify', () => {
  let sendCommentAlert: (p: CommentAlertPayload) => Promise<void>
  let sendDailySummary: (s: DailySummaryStats) => Promise<void>

  beforeEach(async () => {
    vi.resetModules()
    process.env.DISCORD_WEBHOOK_URL = WEBHOOK
    mockFetch.mockResolvedValue({ ok: true, status: 204, statusText: 'No Content' } as Response)
    const mod = await import('../src/notify/discord.js')
    sendCommentAlert = mod.sendCommentAlert
    sendDailySummary = mod.sendDailySummary
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  const commentPayload: CommentAlertPayload = {
    commentId: 'c1',
    videoId: 'v1',
    commentText: '제품 언제 입고돼요?',
    author: 'user123',
    analysis: {
      sentiment: 'question',
      category: 'product_question',
      language: 'ko',
      priority: 2,
      needs_reply: true,
    },
    replyDraft: {
      comment_id: 'c1',
      reply_text: '안녕하세요! 곧 입고될 예정입니다.',
      generated_at: '2026-02-24T00:00:00.000Z',
    },
  }

  it('sendCommentAlert sends correct embed structure', async () => {
    await sendCommentAlert(commentPayload)

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit & { body: string }]
    expect(url).toBe(WEBHOOK)
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')

    const body = JSON.parse(init.body)
    const embed = body.embeds[0]

    expect(embed.title).toContain('P2')
    expect(embed.color).toBe(0x3498db) // priority 2

    type Field = { name: string; value: string }
    const fieldMap: Record<string, string> = Object.fromEntries(
      embed.fields.map((f: Field) => [f.name, f.value]),
    )
    expect(fieldMap['댓글']).toBe('제품 언제 입고돼요?')
    expect(fieldMap['작성자']).toBe('user123')
    expect(fieldMap['📝 AI 대댓글 초안']).toContain('안녕하세요! 곧 입고될 예정입니다.')
    expect(embed.footer.text).toContain('c1')
    expect(embed.footer.text).toContain('v1')
    expect(embed.timestamp).toBe('2026-02-24T00:00:00.000Z')
  })

  it('sendDailySummary sends correct stats embed', async () => {
    const stats: DailySummaryStats = {
      date: '2026-02-24',
      totalComments: 42,
      bysentiment: { positive: 20, negative: 5, neutral: 15, question: 2 },
      byCategory: { purchase_intent: 10, product_question: 12 },
      repliesGenerated: 30,
      repliesPosted: 28,
      topPriorityCount: 7,
    }

    await sendDailySummary(stats)

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit & { body: string }]
    expect(url).toBe(WEBHOOK)

    const body = JSON.parse(init.body)
    const embed = body.embeds[0]
    expect(embed.title).toContain('2026-02-24')
    expect(embed.color).toBe(0x9b59b6)

    type Field = { name: string; value: string }
    const fieldMap: Record<string, string> = Object.fromEntries(
      embed.fields.map((f: Field) => [f.name, f.value]),
    )
    expect(fieldMap['총 댓글']).toContain('42')
    expect(fieldMap['대댓글 생성']).toContain('30')
    expect(fieldMap['🔴 고우선순위 (P1-P2)']).toContain('7')
    expect(fieldMap['감성 분포']).toContain('positive')
    expect(fieldMap['카테고리 분포']).toContain('구매 의향')
  })
})
