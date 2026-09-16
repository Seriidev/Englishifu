import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { vercelApiPlugin } from './vite-plugin-api.ts'

export default defineConfig(({ mode }) => {
  // loadEnv('', ...) copies all of process.env over .env files. A previous
  // Neon URL then sticks across Vite restarts even after .env is edited.
  delete process.env.POSTGRES_URL
  delete process.env.POSTGRES_PRISMA_URL
  delete process.env.DATABASE_URL

  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value
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
