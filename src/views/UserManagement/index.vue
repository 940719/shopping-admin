<template>
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">用户管理</span>
      <div class="header-right">
        <span class="panel-count">共 {{ usersList.length }} 个用户</span>
        <el-button type="danger" size="small" @click="openAdd">＋ 新增用户</el-button>
      </div>
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

    <!-- 新增用户弹窗 -->
    <el-dialog v-model="showAdd" title="新增用户" width="420px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="addForm.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="addForm.nickname" placeholder="请输入昵称（不填默认用户名）" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="addForm.phone" placeholder="请输入手机号（选填）" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="addForm.role" style="width: 100%">
            <el-option :value="2" label="管理员" />
            <el-option :value="3" label="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="addForm.password" placeholder="不填默认 123456" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="danger" :loading="saving" @click="saveAdd">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// ElMessage / ElMessageBox 由 unplugin-auto-import 按需自动引入
import { getUserList, postUser, deleteUserById, ROLE_MAP } from '@/api/user';
import { useUserStore } from '@/store/user';

const userStore = useUserStore();
const usersList = ref([]);

const toggleUser = (u) => {
  u.status = u.status === 'normal' ? 'disabled' : 'normal';
  ElMessage.success(u.status === 'normal' ? '已启用' : '已禁用');
};

const removeUser = async (u) => {
  // 保护：不能删除当前登录账号（删了会把自己锁在后台外）
  if (u.name === userStore.userInfo?.username) {
    ElMessage.warning('不能删除当前登录的账号');
    return;
  }
  // 保护：不能删除超级管理员（系统保护账号）
  if (u.role === 1) {
    ElMessage.warning('不能删除超级管理员账号');
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除用户「${u.nickname}」吗？`, '删除用户', {
      type: 'warning',
    });
    // 调用后端删除接口 DELETE /api/users/delete/:id
    await deleteUserById(u.id);
    ElMessage.success('已删除');
    await initUserList();
  } catch (error) {
    // 重点：ElMessageBox取消时 reject 值是 "cancel"，这种情况不报错提示
    if (error === 'cancel') {
      return;
    }
    console.error('删除用户失败：', error);
    ElMessage.error(error.response?.data?.msg || error.message || '删除失败，请重试');
  }
};

/* ================= 新增用户 ================= */
const showAdd = ref(false);
const saving = ref(false);
const addForm = ref({ name: '', nickname: '', phone: '', role: 3, password: '' });

const openAdd = () => {
  addForm.value = { name: '', nickname: '', phone: '', role: 3, password: '' };
  showAdd.value = true;
};

const saveAdd = async () => {
  const f = addForm.value;
  if (!f.name.trim()) {
    ElMessage.warning('请输入用户名');
    return;
  }
  saving.value = true;
  try {
    const { code, msg } = await postUser({
      name: f.name.trim(),
      nickname: f.nickname.trim() || undefined,
      phone: f.phone.trim() || undefined,
      role: f.role,
      password: f.password || '123456',
    });
    if (code !== 200) {
      ElMessage.error(msg || '新增失败');
      return;
    }
    ElMessage.success('用户已新增');
    showAdd.value = false;
    await initUserList();
  } catch (error) {
    console.error('新增用户失败：', error);
    ElMessage.error(error.response?.data?.msg || error.message || '新增失败，请重试');
  } finally {
    saving.value = false;
  }
};

const initUserList = async () => {
  const res = await getUserList();
  if (res.code === 200) {
    usersList.value = res.data;
  } else {
    ElMessage.error(res.msg || '获取用户列表失败');
  }
};

onMounted(() => {
  initUserList();
});
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
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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
