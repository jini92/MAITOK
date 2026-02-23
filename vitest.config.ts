import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // No DOM needed — pure Node.js service
    environment: 'node',

    // Make describe/it/expect available without explicit imports
    globals: true,

    // Runs once before all test files
    setupFiles: ['./tests/setup.ts'],

    // Explicit glob keeps vitest fast — only scan tests/
    include: ['tests/**/*.test.ts'],
  },
})
