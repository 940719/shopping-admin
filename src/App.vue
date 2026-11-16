<template>
  <!-- el-config-provider 提供中文 locale（按需引入后全局 locale 改由它接管） -->
  <el-config-provider :locale="zhCn">
    <suspense>
      <template #default>
        <RouterView />
      </template>
      <template #fallback>
        <!-- 骨架屏，DOM 结构尽量与目标页一致，避免布局抖动 -->
        <dashboard-skeleton />
      </template>
    </suspense>
  </el-config-provider>
</template>

<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import DashboardSkeleton from './components/DashboardSkeleton/index.vue';
</script>

<style lang="scss">
/* 全局基础样式 */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

/* 主题色：@include useTheme 会分别为 html[data-theme="light"] / [data-theme="dark"] 生成规则 */
body {
  @include useTheme($themes) {
    background-color: getVar('bgColor');
    color: getVar('textColor');
  }
}
</style>
