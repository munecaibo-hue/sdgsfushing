import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sdgsfushing/', // 依照你的倉庫名稱設定明確路徑
})
