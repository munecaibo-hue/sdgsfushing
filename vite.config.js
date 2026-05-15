import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sdgsfushing/', // 必須與你的 GitHub 倉庫名稱完全一致
})
