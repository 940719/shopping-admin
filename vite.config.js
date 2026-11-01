import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [
    vue(),
    // Element Plus 按需自动导入 API（ElMessage / ElMessageBox 等）
    AutoImport({
      // 自动导入 Vue、Vue Router、Pinia 相关函数，如：ref、reactive、toRef 等
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
    }),
    // 模板中使用的 el-xxx 组件按需自动导入（含组件样式）
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  build: {
    rollupOptions: {
      treeshake: true,
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
