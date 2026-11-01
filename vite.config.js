import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [vue()],
  build: {
    rollupOptions: {
      // 可选值：true / false / 'smallest' / 'safest'
      treeshake: 'smallest',
      output: {
        manualChunks(id) {
          // 只处理 node_modules 里的第三方包
          if (id.includes('node_modules')) {
            // UI库单独分包
            if (id.includes('element-plus')) {
              return 'vendor-element';
            }
            // vue全家桶放一块
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-vue';
            }
            // 其余所有第三方依赖统一打包
            return 'vendor-other';
          }
          // 业务代码（非node_modules）返回undefined，不手动分包
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5175, // 与商城项目（5173）区分开
    proxy: {
      // 匹配/api开头的请求
      '/api': {
        target: 'http://localhost:3001', // 后端地址
        changeOrigin: true,
      },
    },
  },
});
