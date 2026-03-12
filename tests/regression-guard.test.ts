// regression-guard.test.ts — generated 2026-03-12
// Guards critical settings that affect quality metrics in MAITOK (Tikly).
// Run: npx vitest run tests/regression-guard.test.ts

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Regression Guards — MAITOK', () => {
  it('default LLM model must be claude-sonnet-4-6', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../src/ai/pipeline.ts'),
      'utf-8',
    )
    expect(src).toContain("'claude-sonnet-4-6'")
  })

  it('LLM max_tokens must be 256 for both analyze and reply', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../src/ai/pipeline.ts'),
      'utf-8',
    )
    const matches = src.match(/max_tokens:\s*256/g)
    expect(matches).not.toBeNull()
    expect(matches!.length).toBe(2)
  })

  it('TikTok daily rate limit must be 1000', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../src/tiktok/client.ts'),
      'utf-8',
    )
    expect(src).toContain('DAILY_LIMIT = 1_000')
  })

  it('TikTok API base URL must be official endpoint', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../src/tiktok/client.ts'),
      'utf-8',
    )
    expect(src).toContain("'https://open.tiktokapis.com'")
  })

  it('polling intervals must match adaptive schedule (2min/5min/30min)', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../src/poller/scheduler.ts'),
      'utf-8',
    )
    expect(src).toContain('INTERVAL_NEW_MS = 2 * 60 * 1000')
    expect(src).toContain('INTERVAL_DEFAULT_MS = 5 * 60 * 1000')
    expect(src).toContain('INTERVAL_OLD_MS = 30 * 60 * 1000')
  })

  it('server must listen on port 3000', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../src/index.ts'),
      'utf-8',
    )
    expect(src).toContain('port: 3000')
  })
})
