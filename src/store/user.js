import { defineStore } from 'pinia';
import { login as loginRequest, restoreByToken } from '@/api/user';

/** 从 localStorage 恢复登录态（统一使用 admin_token，与登录写入保持一致） */
function readStored() {
  let userInfo = null;
  try {
    const raw = localStorage.getItem('userInfo');
    userInfo = raw ? JSON.parse(raw) : null;
  } catch {
    userInfo = null;
  }
  return {
    token: localStorage.getItem('admin_token') || '',
    userInfo,
  };
}

export const useUserStore = defineStore('user', {
  state: () => readStored(),
  getters: {
    isLogin: (s) => !!s.token && !!s.userInfo,
    isAdmin: (s) => s.userInfo?.role === 'admin',
  },
  actions: {
    /**
     * 真实登录：调用后端 POST /api/auth/login 校验数据库账号密码
     * 后端返回角色数字码：1 超级管理员 / 2 管理员 / 3 普通用户
     * 前端映射：1、2 → admin（可进入管理后台），3 → user（无权限）
     */
    async login(username, password) {
      try {
        const res = await loginRequest(username.trim(), password);
        if (res.code !== 200 || !res.data) {
          return { ok: false, msg: res.msg || '登录失败' };
        }
        const u = res.data;
        const role = u.role === 3 ? 'user' : 'admin';
        this.token = res.data.token;
        this.userInfo = { username: u.name, nickname: u.nickname || u.name, role };
        localStorage.setItem('admin_token', this.token);
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        return { ok: true, msg: '' };
      } catch (error) {
        console.error('登录失败：', error);
        return { ok: false, msg: '网络异常，请稍后重试' };
      }
    },
    /**
     * 免登录恢复：商城跳转时携带商城登录的 JWT（?admin_token={JWT}），
     * 交给后端 POST /api/auth/restore 校验签名并返回用户信息
     * （仅管理员放行，普通用户会被拦截）
     */
    async loginWithToken(token) {
      if (!token) return false;
      try {
        const res = await restoreByToken(token);
        if (res.code !== 200 || !res.data) return false;
        const u = res.data;
        const role = u.role === 3 ? 'user' : 'admin';
        // 非管理员不恢复登录态（普通用户的 token 不能进入后台）
        if (role !== 'admin') return false;
        this.token = token;
        this.userInfo = { username: u.name, nickname: u.nickname || u.name, role };
        localStorage.setItem('admin_token', token);
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        return true;
      } catch (error) {
        console.error('token 恢复登录失败：', error);
        return false;
      }
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
  },
});
