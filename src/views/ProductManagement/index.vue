<template>
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title">商品管理</span>
      <el-button type="danger" size="small" @click="openAdd">＋ 新增商品</el-button>
    </div>

    <div class="table-wrap">
      <el-table
        :data="tableData"
        row-key="id"
        border
        stripe
        height="calc(100% - 60px)"
        style="width: 100%"
      >
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
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :size="size"
          :disabled="disabled"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 商品编辑弹窗 -->
      <el-dialog
        v-model="showEdit"
        :title="isEditMode ? '编辑商品' : '新增商品'"
        width="720px"
        destroy-on-close
      >
        <el-form v-if="editing" label-width="90px">
          <el-form-item label="商品类型">
            <el-select v-model="editing.type" placeholder="请选择商品类型" style="width: 100%">
              <el-option
                v-for="c in categories"
                :key="c.id"
                :label="c.name"
                :value="String(c.id)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="商品名称">
            <el-input v-model="editing.name" placeholder="请输入商品名称" />
          </el-form-item>
          <el-form-item label="商品图片">
            <div class="img-upload">
              <span class="upload-thumb" :style="{ background: editing.bg }">
                <img
                  v-if="isImgUrl(editing.emoji)"
                  :src="editing.emoji"
                  class="upload-img"
                  alt=""
                />
                <span v-else class="upload-emoji">{{ editing.emoji || '📦' }}</span>
              </span>
              <el-button
                size="small"
                type="primary"
                plain
                :loading="uploading"
                @click="triggerUpload"
              >
                上传图片
              </el-button>
              <el-button v-if="editing.emoji" size="small" @click="editing.emoji = ''"
                >移除</el-button
              >
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                hidden
                @change="onFileChange"
              />
            </div>
          </el-form-item>
          <el-form-item label="现价">
            <el-input-number
              v-model="editing.price"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="原价">
            <el-input-number
              v-model="editing.originPrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="秒杀价">
            <el-input-number
              v-model="editing.flashPrice"
              :min="0"
              :precision="2"
              controls-position="right"
              style="width: 100%"
            />
            <div class="form-tip">0 表示不参与秒杀</div>
          </el-form-item>
          <el-form-item label="销量">
            <el-input-number
              v-model="editing.sales"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="图片背景">
            <div class="bg-list">
              <span
                v-for="bg in GOODS_BG_PRESETS"
                :key="bg"
                class="bg-item"
                :class="{ active: editing.bg === bg }"
                :style="{ background: bg }"
                @click="editing.bg = bg"
              ></span>
            </div>
          </el-form-item>

          <!-- 商品图集（多图，关联表） -->
          <el-form-item label="商品图集">
            <div class="gallery-box">
              <div class="gallery-list">
                <div v-for="(img, i) in editing.images" :key="i" class="gallery-item">
                  <img :src="img" class="gallery-img" alt="" />
                  <el-icon class="gallery-del" @click="editing.images.splice(i, 1)"><Close /></el-icon>
                  <span class="gallery-order">{{ i + 1 }}</span>
                </div>
                <div class="gallery-add" @click="triggerGalleryUpload">
                  <el-icon :class="{ loading: galleryUploading }"><Plus /></el-icon>
                  <span>添加图片</span>
                </div>
              </div>
              <div class="form-tip">可上传多张商品图，详情页将轮播展示（第一张为主图）</div>
              <input
                ref="galleryInputRef"
                type="file"
                accept="image/*"
                hidden
                @change="onGalleryFileChange"
              />
            </div>
          </el-form-item>

          <!-- 商品介绍（数组，每条可文字/图片） -->
          <el-form-item label="商品介绍">
            <div class="intro-box">
              <div v-for="(item, i) in editing.intro" :key="i" class="intro-item">
                <div class="intro-head">
                  <el-radio-group v-model="item.type" size="small">
                    <el-radio-button value="text">文字</el-radio-button>
                    <el-radio-button value="image">图片</el-radio-button>
                  </el-radio-group>
                  <div class="intro-ops">
                    <el-button size="small" text :disabled="i === 0" @click="moveIntro(i, -1)">上移</el-button>
                    <el-button size="small" text :disabled="i === editing.intro.length - 1" @click="moveIntro(i, 1)">下移</el-button>
                    <el-button size="small" type="danger" text @click="editing.intro.splice(i, 1)">删除</el-button>
                  </div>
                </div>
                <div v-if="item.type === 'text'" class="intro-body">
                  <el-input
                    v-model="item.content"
                    type="textarea"
                    :rows="2"
                    maxlength="1000"
                    show-word-limit
                    placeholder="输入介绍文字，如：高清音质，支持蓝牙5.3"
                  />
                </div>
                <div v-else class="intro-body">
                  <div class="intro-img-row">
                    <img v-if="item.imageUrl" :src="item.imageUrl" class="intro-img" alt="" />
                    <span v-else class="intro-img-empty">暂无图片</span>
                    <el-button size="small" type="primary" plain :loading="introUploadingIndex === i" @click="triggerIntroUpload(i)">
                      上传图片
                    </el-button>
                    <el-button v-if="item.imageUrl" size="small" @click="item.imageUrl = ''">移除</el-button>
                  </div>
                </div>
              </div>
              <el-button size="small" type="primary" plain class="intro-add" @click="addIntroItem">
                ＋ 添加介绍条目
              </el-button>
              <div class="form-tip">介绍按顺序展示在详情页「商品介绍」区块，支持文字与图片混排</div>
              <input
                ref="introInputRef"
                type="file"
                accept="image/*"
                hidden
                @change="onIntroFileChange"
              />
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
import { onMounted, ref } from 'vue';
import { Plus, Close } from '@element-plus/icons-vue';
import { GOODS_BG_PRESETS } from '@/store/goods';
import {
  getProductList,
  getProductById,
  postProduct,
  putProductById,
  deleteProductById,
  uploadImage,
} from '@/api/product';
import { getCategoryList } from '@/api/category';
import { isImgUrl } from '@/utils/img';

/* ================= 表格 ================= */
const tableData = ref([]);
/* ================= 商品类型（来自分类接口） ================= */
const categories = ref([]);

const editGoods = async (row) => {
  editing.value = { ...row, images: [], intro: [] };
  isEditMode.value = true;
  showEdit.value = true;
  // 编辑时拉详情，回显图集与介绍（关联表数据）
  try {
    const { code, data } = await getProductById(row.id);
    if (code === 200 && data) {
      editing.value = {
        ...editing.value,
        images: Array.isArray(data.images) ? data.images : [],
        intro: Array.isArray(data.intro) ? data.intro : [],
      };
    }
  } catch (error) {
    console.error('拉取商品详情失败：', error);
  }
};

const removeGoods = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除商品「${row.name}」吗？`, '删除商品', { type: 'warning' });
    await deleteProductById(row.id);
    ElMessage.success('已删除');
    await initProductList();
  } catch (error) {
    // 重点：ElMessageBox取消时 reject 值是 "cancel"，这种情况不报错提示
    if (error === 'cancel') {
      return;
    }
    console.error('删除商品失败：', error);
    ElMessage.error(error.response?.data?.msg || error.message || '删除失败，请重试');
  }
};

/* ================= 编辑 / 新增 ================= */
const editing = ref(null);
const isEditMode = ref(false);
const showEdit = ref(false);
const saving = ref(false);
const uploading = ref(false);
const fileInputRef = ref();

const openAdd = () => {
  editing.value = {
    id: Date.now(),
    name: '新商品',
    type: '',
    emoji: '',
    bg: GOODS_BG_PRESETS[0],
    price: 99,
    originPrice: 129,
    flashPrice: 0,
    sales: 0,
    images: [],
    intro: [],
  };
  isEditMode.value = false;
  showEdit.value = true;
};

/* ================= 图片上传 ================= */
const triggerUpload = () => fileInputRef.value?.click();

const onFileChange = async (e) => {
  const input = e.target;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5MB');
    input.value = '';
    return;
  }
  uploading.value = true;
  try {
    const { code, data } = await uploadImage(file);
    if (code !== 200 || !data) {
      ElMessage.error('上传失败');
      return;
    }
    if (editing.value) editing.value.emoji = data.url;
    ElMessage.success('图片已上传');
  } catch (error) {
    console.error('图片上传失败：', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    uploading.value = false;
    input.value = '';
  }
};

/* ================= 商品图集（多图）上传 ================= */
const galleryInputRef = ref();
const galleryUploading = ref(false);
const triggerGalleryUpload = () => galleryInputRef.value?.click();

const onGalleryFileChange = async (e) => {
  const input = e.target;
  const file = input.files?.[0];
  if (!file) return;
  input.value = '';
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5MB');
    return;
  }
  galleryUploading.value = true;
  try {
    const { code, data } = await uploadImage(file);
    if (code !== 200 || !data) {
      ElMessage.error('上传失败');
      return;
    }
    editing.value.images.push(data.url);
    ElMessage.success('图片已添加');
  } catch (error) {
    console.error('图片上传失败：', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    galleryUploading.value = false;
  }
};

/* ================= 商品介绍（数组）维护 ================= */
const introInputRef = ref();
const introUploadingIndex = ref(-1);

const addIntroItem = () => {
  editing.value.intro.push({ type: 'text', content: '', imageUrl: '' });
};

const moveIntro = (i, dir) => {
  const arr = editing.value.intro;
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  const t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
};

const triggerIntroUpload = (i) => {
  introUploadingIndex.value = i;
  introInputRef.value?.click();
};

const onIntroFileChange = async (e) => {
  const input = e.target;
  const file = input.files?.[0];
  const idx = introUploadingIndex.value;
  input.value = '';
  introUploadingIndex.value = -1;
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 5MB');
    return;
  }
  try {
    const { code, data } = await uploadImage(file);
    if (code !== 200 || !data) {
      ElMessage.error('上传失败');
      return;
    }
    if (editing.value.intro[idx]) {
      editing.value.intro[idx].type = 'image';
      editing.value.intro[idx].imageUrl = data.url;
      ElMessage.success('图片已上传');
    }
  } catch (error) {
    console.error('图片上传失败：', error);
    ElMessage.error('上传失败，请重试');
  }
};

/* ================= 保存 ================= */
const saveGoods = async () => {
  if (!editing.value) return;
  const g = editing.value;
  if (!g.name.trim()) {
    ElMessage.warning('请输入商品名称');
    return;
  }
  if (!g.type) {
    ElMessage.warning('请选择商品类型');
    return;
  }
  if (g.price <= 0 || g.originPrice <= 0) {
    ElMessage.warning('价格必须大于 0');
    return;
  }
  if (g.flashPrice < 0) {
    ElMessage.warning('秒杀价不能为负数');
    return;
  }
  const payload = {
    type: String(g.type),
    name: g.name.trim(),
    price: g.price,
    seckillPrice: g.flashPrice || null,
    emoji: g.emoji || null,
    originPrice: g.originPrice,
    bg: g.bg,
    // 关联表数据：图集数组 + 介绍数组（每条 {type, content, imageUrl}）
    images: (g.images || []).filter(Boolean),
    intro: (g.intro || [])
      .map((it) => ({
        type: it.type === 'image' ? 'image' : 'text',
        content: it.type === 'image' ? '' : it.content || '',
        imageUrl: it.type === 'image' ? it.imageUrl || '' : '',
      }))
      .filter((it) => (it.type === 'image' ? it.imageUrl : it.content)),
  };
  saving.value = true;
  try {
    if (isEditMode.value) {
      await putProductById(g.id, payload);
      ElMessage.success('商品已更新');
    } else {
      await postProduct(payload);
      ElMessage.success('商品已新增');
    }
    showEdit.value = false;
    await initProductList();
  } catch (error) {
    console.error('保存商品失败：', error);
    ElMessage.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
};
const currentPage = ref(1);
const pageSize = ref(10);
const size = ref('small');
const disabled = ref(false);
const total = ref(0);
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  initProductList();
};
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  initProductList();
};
const initCategoryList = async () => {
  try {
    const { code, data } = await getCategoryList({ pageNum: 1, pageSize: 100 });
    if (code === 200) {
      categories.value = data.list || [];
    }
  } catch (error) {
    console.error('获取商品类型失败：', error);
  }
};

const initProductList = async () => {
  const params = { pageNum: currentPage.value, pageSize: pageSize.value };
  try {
    const { code, data, msg } = await getProductList(params);
    if (code !== 200) {
      ElMessage.error(msg || '获取商品列表失败');
      return;
    }
    tableData.value = data.list;
    total.value = data.total;
  } catch (error) {
    console.error('获取商品列表失败，错误信息：', error);
  }
};

onMounted(() => {
  initProductList();
  initCategoryList();
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

/* ===== 商品图集 ===== */
.gallery-box {
  width: 100%;
}

.gallery-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gallery-item {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.gallery-order {
  position: absolute;
  left: 2px;
  bottom: 2px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 10px;
  line-height: 14px;
  padding: 0 4px;
  border-radius: 4px;
}

.gallery-add {
  width: 64px;
  height: 64px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #909399;
  cursor: pointer;
  font-size: 12px;
}

.gallery-add:hover {
  border-color: #409eff;
  color: #409eff;
}

.gallery-add .el-icon {
  font-size: 20px;
}

.gallery-add .el-icon.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 商品介绍 ===== */
.intro-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intro-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 8px;
  background: #fafafa;
}

.intro-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.intro-ops {
  display: flex;
  align-items: center;
}

.intro-body {
  width: 100%;
}

.intro-img-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.intro-img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ebeef5;
}

.intro-img-empty {
  width: 64px;
  height: 64px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #c0c4cc;
}

.intro-add {
  align-self: flex-start;
}
</style>
