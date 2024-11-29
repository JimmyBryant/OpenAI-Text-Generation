import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/OpenAI-Text-Generation',  // 设置基础路径
  plugins: [vue()],
})
