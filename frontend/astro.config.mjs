// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// Dev-only Vite proxy. Defaults to production so `npm run dev` works without local backend.
const apiProxyTarget =
  process.env.DEV_API_PROXY || 'https://eduardoos.com';
const telemetryProxyTarget =
  process.env.PUBLIC_TELEMETRY_BASE || 'http://localhost:8100';

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [react()],

  vite: {
    server: {
      proxy: {
        '/api/server/health': {
          target: telemetryProxyTarget,
          changeOrigin: true,
        },
        '/api/server/health/': {
          target: telemetryProxyTarget,
          changeOrigin: true,
        },
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  },
});
