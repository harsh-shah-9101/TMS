import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000', // Assumes backend runs on port 3000
  headers: {
    'Content-Type': 'application/json'
  }
})

// Basic interceptor to add token if it exists (mocking auth for now)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
