import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { apiDevPlugin } from './server/vite-api-plugin.js';

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  server: {
    // O drive de rede do projeto não emite eventos de arquivo: usa polling.
    watch: { usePolling: true, interval: 400, ignored: ['**/.data/**', '**/assets-src/**', '**/node_modules/**'] },
  },
  test: {
    include: ['src/**/__tests__/**/*.test.ts', 'server/**/__tests__/**/*.test.ts'],
  },
});
