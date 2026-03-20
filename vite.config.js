import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { env } from 'node:process'

const repoName = env.GITHUB_REPOSITORY?.split('/')[1]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
})
