import { defineConfig } from 'vitest/config'

// Separate from vite.config.js so the PWA plugin and app build pipeline don't
// load during tests. These are fast, pure unit tests — no DOM needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
})
