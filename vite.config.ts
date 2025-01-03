import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    silent: true,
    exclude: [...configDefaults.exclude, 'db/**'],
    coverage: {
      all: true,
      provider: 'v8',
      exclude: [
        ...configDefaults.exclude,
        'tests/**/*.ts',
        '**/contracts/**',
        '**/errors/**',
        '**/factories/**',
        'db/**',
        'src/main/**', // TODO: Remove when e2e tests are implemented
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@/tests': path.resolve(__dirname, './tests'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
