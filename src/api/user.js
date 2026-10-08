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
 * POST /api/login  body: { name, password }
 * 返回用户信息（不含密码），role 为角色数字码 1|2|3
 */
export const login = (name, password) => post('/login', { name, password });

/** 用户列表 GET /api/users */
export const getUserList = () => get('/users');

/** 新增用户 POST /api/user */
export const postUser = (data) => post('/user', data);

/** 查询单个用户 GET /api/user/:id */
export const getUserById = (id) => get(`/user/${id}`);

/** 修改用户 PUT /api/user/:id */
export const putUserById = (id, data) => put(`/user/${id}`, data);

/** 删除用户 DELETE /api/user/:id */
export const deleteUserById = (id) => del(`/user/${id}`);
