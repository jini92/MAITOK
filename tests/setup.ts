/**
 * Global test setup — runs once before every test file.
 *
 * Keep external API keys out of tests; real network calls are
 * handled by integration/e2e suites, not unit/component tests.
 */

// Ensure tests never accidentally hit real external services
process.env.NODE_ENV = 'test'
