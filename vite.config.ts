import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/chord-share-tool/', // 設定 GitHub Pages 的 Repository 名稱
})
