import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error),
)

export const get = (url, config) => request.get(url, config)
export const post = (url, data, config) => request.post(url, data, config)
export const put = (url, data, config) => request.put(url, data, config)
export const del = (url, config) => request.delete(url, config)

export default request
