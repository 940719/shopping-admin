<template>
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">商品类型管理</span>
      <el-button type="danger" size="small" @click="openAdd">＋ 新增类型</el-button>
    </div>

    <div class="table-wrap">
      <el-table :data="tableData" row-key="id" border stripe height="calc(100% - 60px)" style="width: 100%">
        <el-table-column prop="name" label="类型名称" min-width="160" />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="类型图标" width="120">
          <template #default="{ row }">
            <img v-if="isImgUrl(row.img)" :src="row.img" class="cell-thumb" alt="" />
            <span v-else class="cell-emoji">{{ row.img }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">
            {{ row.createTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="editRow(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pafination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :size="size" :disabled="disabled" background layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="showEdit" :title="isEditMode ? '编辑类型' : '新增类型'" width="420px" destroy-on-close>
      <el-form label-width="90px">
        <el-form-item label="类型名称">
          <el-input v-model="editing.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="editing.sort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="danger" :loading="saving" @click="saveRow">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isImgUrl } from '@/utils/img'
import { getCategoryList, postCategory, putCategoryById, deleteCategoryById } from '@/api/category'

const tableData = ref([])
const editing = ref(null)
const isEditMode = ref(false)
const showEdit = ref(false)
const saving = ref(false)

const openAdd = () => {
  editing.value = { name: '', sort: 0 }
  isEditMode.value = false
  showEdit.value = true
}

const editRow = (row) => {
  editing.value = { ...row }
  isEditMode.value = true
  showEdit.value = true
}

const saveRow = async () => {
  if (!editing.value) return
  if (!editing.value.name.trim()) {
    ElMessage.warning('请输入类型名称')
    return
  }
  saving.value = true
  try {
    if (isEditMode.value) {
      await putCategoryById(editing.value.id, editing.value)
      ElMessage.success('类型已更新')
    } else {
      await postCategory(editing.value)
      ElMessage.success('类型已新增')
    }
    showEdit.value = false
    await initCategoryList()
  } catch (error) {
    console.error('保存类型失败：', error)
    // 后端暂未提供增删改接口，给出明确提示
    ElMessage.error(error.response?.data?.msg || error.message || '保存失败：后端接口未开通')
  } finally {
    saving.value = false
  }
}

const removeRow = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除类型「${row.name}」吗？`, '删除类型', { type: 'warning' })
  } catch {
    return
  }
  try {
    await deleteCategoryById(row.id)
    ElMessage.success('已删除')
    await initCategoryList()
  } catch (error) {
    console.error('删除类型失败：', error)
    ElMessage.error(error.response?.data?.msg || error.message || '删除失败：后端接口未开通')
  }
}
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref('small');
const disabled = ref(false);
const total = ref(0);
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  initCategoryList()
};
const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  initCategoryList()
};
const initCategoryList = async () => {
  const params = { pageNum: currentPage.value, pageSize: pageSize.value }
  const { data, code, msg } = await getCategoryList(params)
  if (code === 200) {
    tableData.value = data.list;
    total.value = data.total;
  } else {
    console.error(msg)
    ElMessage.error(msg || '获取类型列表失败')
  }
}

onMounted(() => {
  initCategoryList()
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

/* 表格区域：占满剩余高度，滚动条收敛到表格内部 */
.table-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.cell-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  display: inline-block;
  vertical-align: middle;
}

.cell-emoji {
  font-size: 20px;
}

.table-pafination {
  height: 60px;
  line-height: 60px;
}
</style>
