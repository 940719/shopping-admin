import { get, post, put, del } from '@/utils/request'

/**
 * 商品列表（可按类型过滤）
 * GET /api/products?type=xxx
 */
export const getProductList = (type) =>
  get('/products', { params: type ? { type } : undefined })

/** 根据 id 查询单个商品 GET /api/product/:id */
export const getProductById = (id) => get(`/product/${id}`)

/** 新增商品 POST /api/product */
export const postProduct = (data) => post('/product', data)

/** 修改商品（未传字段保留原值）PUT /api/product/:id */
export const putProductById = (id, data) => put(`/product/${id}`, data)

/** 删除商品 DELETE /api/product/:id */
export const deleteProductById = (id) => del(`/product/${id}`)

/**
 * 通用图片上传（multipart/form-data，字段名 file）
 * POST /api/upload → { url, filename }
 * 后端把文件保存到本地 uploads 目录，url 可直接用于 <img :src> 或存 emoji 字段
 */
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
