import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import dayjs from 'dayjs';

const app = createApp(App);
app.config.globalProperties.$dayjs = dayjs;

// 图标全部改为组件内按需引入（见 LoginPage / AdminPage），此处不再全局注册
app.use(createPinia());
app.use(router);
app.mount('#app');
