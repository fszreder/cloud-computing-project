import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target:
          'https://cloud-backend-fs-enfyewhphxfjaad8.francecentral-01.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
