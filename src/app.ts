import Fastify, { type FastifyInstance } from 'fastify'

/**
 * App factory — creates and configures the Fastify instance.
 * Kept separate from the server start so tests can use app.inject()
 * without binding to a real port.
 */
export function buildApp(opts: { logger?: boolean } = {}): FastifyInstance {
  const app = Fastify({ logger: opts.logger ?? false })

  app.get('/api/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return app
}
