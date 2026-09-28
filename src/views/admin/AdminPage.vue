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
          <span class="admin-user">
            <el-icon><User /></el-icon>
            {{ userStore.userInfo?.nickname }}
          </span>
          <el-button size="small" @click="backToShop">返回商城</el-button>
          <el-button size="small" type="danger" plain @click="logout">退出登录</el-button>
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
          background-color="#fff"
          text-color="#444"
          active-text-color="#409eff"
        >
          <el-menu-item v-for="item in adminRoutes" :key="item.path" :index="`/admin/${item.path}`">
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { adminRoutes } from '@/router'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  // 高亮当前子路由对应的菜单
  const matched = adminRoutes.find((r) => route.path.startsWith(`/admin/${r.path}`))
  return matched ? `/admin/${matched.path}` : '/admin/user'
})

const backToShop = () => {
  // 跳转到商城项目（开发环境为 5174，生产可配置为商城域名）
  const shopUrl = import.meta.env.VITE_SHOP_URL || 'http://localhost:5174'
  window.open(shopUrl, '_blank')
}

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
  } catch {
    return
  }
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<style scoped>
.admin-page {
  height: 100vh;
  overflow: hidden; /* 页面整体不出现滚动条 */
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

.admin-user {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

/* 主体：菜单贴最左，内容铺满剩余 */
.admin-body {
  flex: 1;
  min-height: 0;
}

.admin-menu {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow: auto;
}

.menu {
  border-right: none;
  height: 100%;
}

.admin-content {
  padding: 0;
  overflow: hidden; /* 滚动收敛到表格内部 */
  background: #f0f2f5;
}
</style>
