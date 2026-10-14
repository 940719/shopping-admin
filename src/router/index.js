import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';

/** 管理后台子路由（懒加载） */
export const adminRoutes = [
  {
    path: 'user',
    name: 'AdminUser',
    component: () => import('@/views/UserManagement/index.vue'),
    meta: { title: '用户管理', icon: 'User' },
  },
  {
    path: 'goods',
    name: 'AdminGoods',
    component: () => import('@/views/ProductManagement/index.vue'),
    meta: { title: '商品管理', icon: 'Goods' },
  },
  {
    path: 'category',
    name: 'AdminCategory',
    component: () => import('@/views/CategoryManagement/index.vue'),
    meta: { title: '商品类型管理', icon: 'CollectionTag' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/user', // 直接重定向到 /user ，最终地址：/admin/user
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginPage.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/', // 父路由改成 /
      name: 'Admin',
      component: () => import('@/views/admin/AdminPage.vue'),
      redirect: '/user',
      meta: { title: '管理后台', requiresAdmin: true },
      children: [...adminRoutes],
    },
    // 404 兜底
    {
      path: '/:pathMatch(.*)*',
      redirect: '/user',
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

// 全局前置守卫：设置标题 + 登录/管理员鉴权 + 商城跳转免登录恢复
router.beforeEach(async (to, _from, next) => {
  document.title = to.meta.title || '管理后台';
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const userStore = useUserStore();
    // 已登录：直接放行
    if (userStore.isLogin) {
      next(userStore.isAdmin ? undefined : '/login');
      return;
    }
    // 未登录：尝试用 URL 携带的 token 免登录恢复（商城跳转场景）
    const token = to.query.token || to.query.admin_token;
    if (token) {
      const ok = await userStore.loginWithToken(token);
      if (ok && userStore.isAdmin) {
        // 恢复成功：去掉地址栏的 token，避免一直暴露
        next({ path: to.path, replace: true });
        return;
      }
    }
    next({ path: '/login', query: { redirect: to.fullPath } });
    return;
  }
  next();
});

export default router;
