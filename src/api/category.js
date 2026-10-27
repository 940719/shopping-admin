import { get, post, put, del } from '@/utils/request';

/** 商品类型列表 GET /api/categories/list?page=&pageSize= → { code, data: { list } } */
export const getCategoryList = (data) => get('/categories/list', { params: data });

/** 新增类型 POST /api/categories/add */
export const addCategory = (data) => post('/categories/add', data);

/** 修改类型 PUT /api/categories/update/:id */
export const updateCategoryById = (id, data) => put(`/categories/update/${id}`, data);

/** 删除类型 DELETE /api/categories/delete/:id */
export const deleteCategoryById = (id) => del(`/categories/delete/${id}`);
