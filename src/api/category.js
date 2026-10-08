import { get, post, put, del } from '@/utils/request';

/** 商品类型列表 GET /api/getCategories?page=&pageSize= → { code, data: { list } } */
export const getCategoryList = (data) => get('/getCategories', { params: data });

/* 以下增删改接口后端暂未提供（点击时会提示失败），接口路径按 RESTful 预留 */

/** 新增类型 POST /api/addCategory */
export const addCategory = (data) => post('/addCategory', data);

/** 修改类型 PUT /api/updateCategoryById/:id */
export const updateCategoryById = (id, data) => put(`/updateCategoryById/${id}`, data);

/** 删除类型 DELETE /api/deleteCategoryById/:id */
export const deleteCategoryById = (id) => del(`/deleteCategoryById/${id}`);
