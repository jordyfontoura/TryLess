import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // include: ['__tests__/types/**/*.test-d.ts'],
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.test-types.json',
    },
  },
});

