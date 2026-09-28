import { get, post, put, del } from '@/utils/request'

/** 商品类型列表 GET /api/getCategories?page=&pageSize= → { code, data: { list } } */
export const getCategoryList = (data) =>
  get('/getCategories', { params: data })

/* 以下增删改接口后端暂未提供（点击时会提示失败），接口路径按 RESTful 预留 */

/** 新增类型 POST /api/category */
export const postCategory = (data) => post('/category', data)

/** 修改类型 PUT /api/category/:id */
export const putCategoryById = (id, data) => put(`/category/${id}`, data)

/** 删除类型 DELETE /api/category/:id */
export const deleteCategoryById = (id) => del(`/category/${id}`)
