import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vercelApiPlugin } from './vite-plugin-api.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [react(), tailwindcss(), vercelApiPlugin()],
    optimizeDeps: {
      include: ['react-icons/md'],
    },
    server: {
      watch: {
        // Local Postgres writes WAL files every few seconds; watching them
        // full-reloads the app and makes the UI "disappear".
        ignored: ['**/data/pg/**', '**/public/uploads/**'],
      },
    },
  }
})
