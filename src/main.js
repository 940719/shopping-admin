import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import dayjs from 'dayjs';
// 主题变量已由 vite.config.js 的 scss additionalData 全局注入，无需在此引入样式文件

// 启动即恢复上次的主题（light / dark），避免首屏闪烁
// 主题切换完全由 src/assets/styles/index.scss 的 $themes / useTheme / getVar 驱动
const savedTheme = localStorage.getItem('admin_theme') === 'dark' ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const app = createApp(App);
app.config.globalProperties.$dayjs = dayjs;

// 图标全部改为组件内按需引入（见 LoginPage / AdminPage），此处不再全局注册
app.use(createPinia());
app.use(router);
app.mount('#app');
