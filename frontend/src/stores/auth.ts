import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../config/api'
import router from '../router'

const TOKEN_KEY = 'tms_token'
const USER_KEY = 'tms_user'

// ── Backward-compat migration: move old 'token' key to new 'tms_token' ────────
const _oldToken = localStorage.getItem('token')
if (_oldToken && !localStorage.getItem(TOKEN_KEY)) {
  localStorage.setItem(TOKEN_KEY, _oldToken)
  localStorage.removeItem('token')
}

// ── Global 401 interceptor (placed here to avoid circular dep in api.ts) ──────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      router.push('/auth/login')
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<any>((() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
  })())

  // ── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role?.name || null)
  const organizationId = computed(() => user.value?.organizationId || null)

  // ── Actions ────────────────────────────────────────────────────────────────
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  const setUser = (userData: any) => {
    user.value = userData
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { accessToken, user: userData } = response.data
    setToken(accessToken)
    setUser(userData)
    return response.data
  }

  const fetchProfile = async () => {
    if (!token.value) return null
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      return user.value
    } catch (error) {
      logout()
      throw error
    }
  }

  const can = (permission?: string) => {
    if (!permission) return true;
    const permissions = user.value?.role?.permissions ?? user.value?.permissions;
    if (Array.isArray(permissions)) {
      return permissions.includes(permission) || permissions.includes('*');
    }
    return true; // Default allow for admin/manager
  };

  return {
    token, user,
    isAuthenticated, userRole, organizationId,
    setToken, setUser, login, logout, fetchProfile, can,
  }
})
