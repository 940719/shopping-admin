<template>
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">商品管理</span>
      <el-button type="danger" size="small" @click="openAdd">＋ 新增商品</el-button>
    </div>

    <div class="table-wrap">
      <el-table :data="tableData" row-key="id" border stripe height="calc(100% - 60px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <img v-if="isImgUrl(row.emoji)" :src="row.emoji" class="cell-thumb" alt="" />
            <span v-else class="cell-emoji">{{ row.emoji }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="现价" width="90" />
        <el-table-column prop="originPrice" label="原价" width="90" />
        <el-table-column prop="flashPrice" label="秒杀价" width="90" />
        <el-table-column prop="sales" label="销量" width="90" />
        <el-table-column label="背景色" width="110">
          <template #default="{ row }">
            <span class="bg-dot" :style="{ background: row.bg }"></span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="editGoods(row)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="removeGoods(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="table-pafination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :size="size" :disabled="disabled" background layout="total, sizes, prev, pager, next, jumper" :total="total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 商品编辑弹窗 -->
      <el-dialog v-model="showEdit" :title="isEditMode ? '编辑商品' : '新增商品'" width="520px" destroy-on-close>
        <el-form v-if="editing" label-width="90px">
          <el-form-item label="商品名称">
            <el-input v-model="editing.name" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="商品图片">
            <div class="img-upload">
              <span class="upload-thumb" :style="{ background: editing.bg }">
                <img v-if="isImgUrl(editing.emoji)" :src="editing.emoji" class="upload-img" alt="" />
                <span v-else class="upload-emoji">{{ editing.emoji || '📦' }}</span>
              </span>
              <el-button size="small" type="primary" plain :loading="uploading" @click="triggerUpload">
                上传图片
              </el-button>
              <el-button v-if="editing.emoji" size="small" @click="editing.emoji = ''">移除</el-button>
              <input ref="fileInputRef" type="file" accept="image/*" hidden @change="onFileChange" />
            </div>
          </el-form-item>
          <el-form-item label="现价">
            <el-input-number v-model="editing.price" :min="0" :precision="2" controls-position="right"
              style="width: 100%" />
          </el-form-item>
          <el-form-item label="原价">
            <el-input-number v-model="editing.originPrice" :min="0" :precision="2" controls-position="right"
              style="width: 100%" />
          </el-form-item>
          <el-form-item label="秒杀价">
            <el-input-number v-model="editing.flashPrice" :min="0" :precision="2" controls-position="right"
              style="width: 100%" />
            <div class="form-tip">0 表示不参与秒杀</div>
          </el-form-item>
          <el-form-item label="销量">
            <el-input-number v-model="editing.sales" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
          <el-form-item label="图片背景">
            <div class="bg-list">
              <span v-for="bg in GOODS_BG_PRESETS" :key="bg" class="bg-item" :class="{ active: editing.bg === bg }"
                :style="{ background: bg }" @click="editing.bg = bg"></span>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showEdit = false">取消</el-button>
          <el-button type="danger" :loading="saving" @click="saveGoods">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GOODS_BG_PRESETS } from '@/store/goods'
import { getProductList, postProduct, putProductById, uploadImage } from '@/api/product'
import { isImgUrl } from '@/utils/img'

/* ================= 表格 ================= */
const tableData = ref([])

const editGoods = (row) => {
  editing.value = { ...row }
  isEditMode.value = true
  showEdit.value = true
}

const removeGoods = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除商品「${row.name}」吗？`, '删除商品', { type: 'warning' })
  } catch {
    return
  }
  ElMessage.success('已删除')
}

/* ================= 编辑 / 新增 ================= */
const editing = ref(null)
const isEditMode = ref(false)
const showEdit = ref(false)
const saving = ref(false)
const uploading = ref(false)
const fileInputRef = ref()

const openAdd = () => {
  editing.value = {
    id: Date.now(),
    name: '新商品',
    type: 1,
    emoji: '',
    bg: GOODS_BG_PRESETS[0],
    price: 99,
    originPrice: 129,
    flashPrice: 0,
    sales: 0,
  }
  isEditMode.value = false
  showEdit.value = true
}

/* ================= 图片上传 ================= */
const triggerUpload = () => fileInputRef.value?.click()

const onFileChange = async (e) => {
  const input = e.target
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5MB')
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const { code, data } = await uploadImage(file)
    if (code !== 200 || !data) {
      ElMessage.error('上传失败')
      return
    }
    if (editing.value) editing.value.emoji = data.url
    ElMessage.success('图片已上传')
  } catch (error) {
    console.error('图片上传失败：', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

/* ================= 保存 ================= */
const saveGoods = async () => {
  if (!editing.value) return
  const g = editing.value
  if (!g.name.trim()) {
    ElMessage.warning('请输入商品名称')
    return
  }
  if (g.price <= 0 || g.originPrice <= 0) {
    ElMessage.warning('价格必须大于 0')
    return
  }
  if (g.flashPrice < 0) {
    ElMessage.warning('秒杀价不能为负数')
    return
  }
  const payload = {
    type: String(g.type),
    name: g.name.trim(),
    price: g.price,
    seckillPrice: g.flashPrice || null,
    emoji: g.emoji || null,
    originPrice: g.originPrice,
  }
  saving.value = true
  try {
    if (isEditMode.value) {
      await putProductById(g.id, payload)
      ElMessage.success('商品已更新')
    } else {
      await postProduct(payload)
      ElMessage.success('商品已新增')
    }
    showEdit.value = false
    await initProductList()
  } catch (error) {
    console.error('保存商品失败：', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
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
const initProductList = async () => {
  const params = { pageNum: currentPage.value, pageSize: pageSize.value };
  try {
    const { code, data, msg } = await getProductList(params)
    if (code !== 200) {
      ElMessage.error(msg || '获取商品列表失败')
      return
    }
    tableData.value = data.list
    total.value = data.total;
  } catch (error) {
    console.error('获取商品列表失败，错误信息：', error)
  }
}

onMounted(() => {
  initProductList()
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

/* 表格图片缩略图 */
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

.bg-dot {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

/* 上传控件 */
.img-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 4px 0;
}

.upload-thumb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  font-size: 24px;
  overflow: hidden;
  flex-shrink: 0;
}

.upload-emoji {
  font-size: 24px;
}

.upload-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
}

.bg-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bg-item {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
}

.bg-item.active {
  border-color: #409eff;
}

.table-pafination {
  height: 60px;
  line-height: 60px;
}
</style>
