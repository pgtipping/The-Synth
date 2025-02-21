import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/lib/logger': resolve(
        __dirname,
        './src/components/editor/__tests__/mocks/logger.ts'
      ),
    },
  },
});
