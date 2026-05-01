import axios from 'axios'
import { supabase } from '../utils/supabase'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) {
        const config = error.config
        config.headers.Authorization = `Bearer ${data.session.access_token}`
        return api(config)
      } else {
        await supabase.auth.signOut()
      }
    }
    return Promise.reject(error)
  }
)
