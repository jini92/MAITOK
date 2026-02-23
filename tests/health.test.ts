import { describe, it, expect } from 'vitest'
import { buildApp } from '../src/app.js'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const app = buildApp()
    const res = await app.inject({ method: 'GET', url: '/api/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ status: 'ok' })
  })
})
