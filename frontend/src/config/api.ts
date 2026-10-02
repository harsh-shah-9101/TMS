import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT token from localStorage ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tms_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 Unauthorized globally ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth data
      localStorage.removeItem('tms_token')
      localStorage.removeItem('tms_user')
      // Redirect to login
      router.push('/auth/login')
    }
    return Promise.reject(error)
  }
)

export default api
