// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

const apiProxyTarget = process.env.PUBLIC_API_BASE || 'http://localhost:8080';

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  },
});