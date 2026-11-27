import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix → also read non-VITE_ vars; API_PROXY_TARGET is dev-server config, never shipped to the browser
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:5000'

  return {
    plugins: [react()],
    server: {
      // Same-origin in dev: browser calls /api/... on :5173, Vite forwards to Express on :5000
      // → no CORS middleware needed on the backend
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})