import { get, post, put, del } from '@/utils/request';

// 角色数字码：1 超级管理员 / 2 管理员 / 3 普通用户
export const ROLE_MAP = {
  1: '超级管理员',
  2: '管理员',
  3: '普通用户',
};

export const ROLE_OPTIONS = [
  { value: 1, label: '超级管理员' },
  { value: 2, label: '管理员' },
  { value: 3, label: '普通用户' },
];

export function getRoleLabel(code) {
  return ROLE_MAP[code] ?? '未知角色';
}

/**
 * 登录
 * POST /api/auth/login  body: { name, password }
 * 返回用户信息（不含密码），role 为角色数字码 1|2|3
 */
export const login = (name, password) => post('/auth/login', { name, password });

/** 免登录恢复：商城跳转携带的 JWT 换取用户信息 POST /api/auth/restore */
export const restoreByToken = (token) => post('/auth/restore', { token });

/** 用户列表 GET /api/users/list */
export const getUserList = () => get('/users/list');

/** 新增用户 POST /api/users/add */
export const postUser = (data) => post('/users/add', data);

/** 查询单个用户 GET /api/users/detail/:id */
export const getUserById = (id) => get(`/users/detail/${id}`);

/** 修改用户 PUT /api/users/update/:id */
export const putUserById = (id, data) => put(`/users/update/${id}`, data);

/** 删除用户 DELETE /api/users/delete/:id */
export const deleteUserById = (id) => del(`/users/delete/${id}`);
