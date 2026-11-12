import axios from 'axios'

// In dev, Vite proxies /api to the backend. In production set VITE_API_URL
// (e.g. https://hostelcare-api.onrender.com/api).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hostelcare_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hostelcare_token')
    }
    return Promise.reject(error)
  }
)

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Something went wrong'

export const getUploadUrl = (uploadPath) => {
  if (!uploadPath) return ''
  const apiUrl = import.meta.env.VITE_API_URL || '/api'
  const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : ''
  return `${apiOrigin}${uploadPath}`
}

export default api
