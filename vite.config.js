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
  css: {
    preprocessorOptions: {
      // 全局注入主题变量文件：所有 .scss（含 .vue 的 <style lang="scss">）自动可用
      // 注意：变量文件必须是 scss 花括号语法；注入内容会与源文件拼接成一行，
      // 缩进语法（.sass）不支持一行多语句，故不能指向 .sass 文件
      scss: {
        // 用 @use 现代模块系统注入（@import 已被 Sass 废弃，会报 Deprecation Warning）
        // as * 表示不建命名空间，$themes / useTheme / getVar 可直接使用
        additionalData: `@use "@/assets/styles/index.scss" as *;`,
      },
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
