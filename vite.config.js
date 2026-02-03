import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Will-you-be-my-valantine/',
  server: {
    host: true,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
