import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5175, // 与商城项目（5174）区分开
    proxy: {
      // 匹配/api开头的请求
      '/api': {
        target: 'http://localhost:3001', // 后端地址
        changeOrigin: true
      }
    }
  }
})
