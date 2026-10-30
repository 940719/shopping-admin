import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 清掉已失效的登录态，避免残留导致一直 401
function clearAuth() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
}

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      if (res.code === 401) {
        // token过期或未登录：清理登录态并明确提示，再跳登录页
        clearAuth();
        ElMessage.error(res.msg || '登录已过期，请重新登录');
        router.push({ path: '/login' });
      }
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const get = (url, config) => request.get(url, config);
export const post = (url, data, config) => request.post(url, data, config);
export const put = (url, data, config) => request.put(url, data, config);
export const del = (url, config) => request.delete(url, config);

export default request;
