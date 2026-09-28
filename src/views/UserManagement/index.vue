<template>
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">用户管理</span>
      <span class="panel-count">共 {{ usersList.length }} 个用户</span>
    </div>

    <div class="table-wrap">
      <el-table :data="usersList" row-key="id" border stripe height="100%" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="用户名" min-width="100" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column label="角色" width="110">
          <template #default="{ row }">
            <el-tag :type="row.role === 3 ? 'info' : 'danger'" size="small">
              {{ ROLE_MAP[row.role] || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'info'" size="small">
              {{ row.status === 'normal' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="toggleUser(row)">
              {{ row.status === 'normal' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" plain @click="removeUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, ROLE_MAP } from '@/api/user'

const usersList = ref([])

const toggleUser = (u) => {
  u.status = u.status === 'normal' ? 'disabled' : 'normal'
  ElMessage.success(u.status === 'normal' ? '已启用' : '已禁用')
}

const removeUser = async (u) => {
  try {
    await ElMessageBox.confirm(`确定删除用户「${u.nickname}」吗？`, '删除用户', { type: 'warning' })
  } catch {
    return
  }
  usersList.value = usersList.value.filter((x) => x.id !== u.id)
  ElMessage.success('已删除')
}

const initUserList = async () => {
  const res = await getUserList()
  if (res.code === 200) {
    usersList.value = res.data
  } else {
    ElMessage.error(res.msg || '获取用户列表失败')
  }
}

onMounted(() => {
  initUserList()
})
</script>

<style scoped>
.panel {
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1b1c;
}
.panel-count {
  font-size: 12px;
  color: #909399;
}
/* 表格区域：占满剩余高度，滚动条收敛到表格内部 */
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
