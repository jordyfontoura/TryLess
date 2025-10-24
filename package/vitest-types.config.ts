import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['__tests__/types/**/*.test-d.ts'],
    exclude: ['__tests__/**/*.spec.ts', 'node_modules/**'],
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test.json',
      include: ['__tests__/types/**/*.test-d.ts'],
      exclude: ['__tests__/**/*.spec.ts'],
    },
  },
});

