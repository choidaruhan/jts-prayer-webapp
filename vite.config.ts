import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 로컬 개발에서 /audio/* (Pages Functions + R2)를 배포 사이트로 프록시
      '/audio': 'https://prayer-app-dyc.pages.dev',
    },
  },
  preview: {
    proxy: {
      '/audio': 'https://prayer-app-dyc.pages.dev',
    },
  },
})
