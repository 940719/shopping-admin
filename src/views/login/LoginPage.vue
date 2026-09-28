<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">
        <el-icon :size="34" color="#409eff"><Shop /></el-icon>
        <span class="logo-text">优选商城 · 管理后台</span>
      </div>
      <div class="login-title">账号登录</div>
      <div class="login-sub">请输入管理员账号与密码</div>

      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="onLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" clearable />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="onLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="onLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-tip">账号示例：admin / 123456</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const onLogin = async () => {
  if (loading.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const res = await userStore.login(form.username, form.password)
    if (!res.ok) {
      ElMessage.error(res.msg)
      return
    }
    if (!userStore.isAdmin) {
      ElMessage.warning('该账号不是管理员，无权限进入管理后台')
      userStore.logout()
      return
    }
    ElMessage.success(`欢迎，${userStore.userInfo?.nickname}`)
    const redirect = route.query.redirect
    if (redirect && redirect.startsWith('/')) {
      router.push(redirect)
    } else {
      router.push('/admin/user')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #1a1b1c 0%, #2b3a55 60%, #f0f2f5 60%, #f0f2f5 100%);
  box-sizing: border-box;
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 36px 32px 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
}
.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1b1c;
}
.login-title {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: #303133;
}
.login-sub {
  font-size: 13px;
  color: #909399;
  text-align: center;
  margin: 6px 0 24px;
}
.login-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 4px;
}
.login-tip {
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
