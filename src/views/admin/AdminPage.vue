<template>
  <el-container class="admin-page">
    <!-- 顶部栏 -->
    <el-header class="admin-header" height="56px">
      <div class="header-inner">
        <div class="admin-brand">
          <el-icon :size="20"><Monitor /></el-icon>
          <span class="brand-text">优选商城 · 管理后台</span>
        </div>
        <div class="admin-actions">
          <!-- 头像 + 昵称：hover 展开操作菜单（纯 CSS 实现，不依赖组件库） -->
          <div class="user-wrap">
            <div class="admin-user">
              <span class="user-avatar">
                <el-icon><User /></el-icon>
              </span>
              <span class="user-name">{{ userStore.userInfo?.nickname }}</span>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </div>
            <ul class="user-menu">
              <li class="user-menu-item" @click="toggleTheme">
                <el-icon>
                  <Sunny v-if="isDark" />
                  <Moon v-else />
                </el-icon>
                <span>{{ isDark ? '切换到亮色模式' : '切换到暗色模式' }}</span>
              </li>
              <li class="user-menu-item" @click="backToShop">
                <el-icon><Shop /></el-icon>
                <span>返回商城</span>
              </li>
              <li class="user-menu-item is-danger" @click="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-header>

    <el-container class="admin-body">
      <!-- 左侧菜单：贴最左边 -->
      <el-aside width="200px" class="admin-menu">
        <el-menu
          :default-active="activeMenu"
          router
          class="menu"
        >
          <el-menu-item v-for="item in adminRoutes" :key="item.path" :index="`/${item.path}`">
            <el-icon><component :is="item.meta.icon" /></el-icon>
            <span>{{ item.meta.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容区：铺满剩余空间，滚动收敛到各表格内部 -->
      <el-main class="admin-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// ElMessage / ElMessageBox 由 unplugin-auto-import 按需自动引入
import {
  Monitor,
  User,
  ArrowDown,
  Sunny,
  Moon,
  Shop,
  SwitchButton,
} from '@element-plus/icons-vue';
import { useUserStore } from '@/store/user';
import { adminRoutes } from '@/router';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => {
  // 高亮当前子路由对应的菜单
  const matched = adminRoutes.find((r) => route.path.startsWith(`/${r.path}`));
  return matched ? `/${matched.path}` : '/user';
});

/* ================= 主题切换（由 src/assets/styles/index.scss 的 $themes / useTheme / getVar 驱动） ================= */
// 当前是否暗色：读取启动时写入 document 的 data-theme
const isDark = ref(document.documentElement.getAttribute('data-theme') === 'dark');

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  // 只切换 html 上的 data-theme，样式由 useTheme mixin 生成的
  // html[data-theme="light"] / html[data-theme="dark"] 规则自动生效
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('admin_theme', theme);
};

const backToShop = () => {
  // 跳转到商城项目（开发环境为 5173，生产可配置为商城域名）
  const shopUrl = import.meta.env.VITE_SHOP_URL || 'http://localhost:5173';
  // 已登录时携带商城 JWT（?token={JWT}），商城交由后端 /auth/restore 校验后免登录恢复
  const token = userStore.token;
  const url = token ? shopUrl + '/?token=' + encodeURIComponent(token) : shopUrl;
  window.open(url, '_blank');
};

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' });
    userStore.logout();
    ElMessage.success('已退出登录');
    router.push('/login');
  } catch (error) {
    if (error === 'cancel') {
      return;
    }
  }
};
</script>

<style scoped lang="scss">
.admin-page {
  height: 100vh;
  overflow: hidden; /* 页面整体不出现滚动条 */
  @include useTheme($themes) {
    background: getVar('pageColor');
  }
}

.admin-header {
  background: #1a1b1c;
  color: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-text {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ===== 头像 + 昵称：hover 展开操作菜单（纯 CSS） ===== */
.user-wrap {
  position: relative;
  /* 透明桥接层：鼠标从头像移到菜单时保持 hover，不会中途收起 */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    height: 10px;
  }
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 15px;
  }
}

.user-arrow {
  font-size: 12px;
  transition: transform 0.25s;
}

.user-wrap:hover .user-arrow {
  transform: rotate(180deg);
}

.user-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  min-width: 172px;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition:
    opacity 0.18s,
    transform 0.18s,
    visibility 0.18s;
  @include useTheme($themes) {
    background: getVar('bgColor');
    border: 1px solid getVar('borderColor');
    color: getVar('textColor');
  }
}

.user-wrap:hover .user-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  font-size: 13px;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(64, 158, 255, 0.1);
    color: #409eff;
  }

  &.is-danger:hover {
    background: rgba(245, 108, 108, 0.1);
    color: #f56c6c;
  }
}

/* 主体：菜单贴最左，内容铺满剩余 */
.admin-body {
  flex: 1;
  min-height: 0;
}

.admin-menu {
  overflow: auto;
  @include useTheme($themes) {
    background: getVar('bgColor');
    border-right: 1px solid getVar('borderColor');
  }
}

.menu {
  border-right: none;
  height: 100%;
  /* 让 Element Plus 菜单跟随本项目的主题变量（light / dark） */
  @include useTheme($themes) {
    --el-menu-bg-color: #{getVar('bgColor')};
    --el-menu-text-color: #{getVar('textColor')};
    --el-menu-hover-bg-color: #{rgba(getVar('textColor'), 0.06)};
    --el-menu-active-color: #409eff;
  }
}

.admin-content {
  padding: 0;
  overflow: hidden; /* 滚动收敛到表格内部 */
  @include useTheme($themes) {
    background: getVar('pageColor');
  }
}
</style>
