/**
 * TapSpot API 请求工具
 * 
 * 封装所有 HTTP 请求，自动处理 token 和错误
 */

import { API_BASE } from './constants'

/**
 * 发送 API 请求
 * @param {string} endpoint - API 端点（如 '/posts'）
 * @param {object} options - fetch 选项
 * @returns {Promise<object>} 响应数据
 */
export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('tapspot_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

/**
 * 获取存储的 token
 */
export const getToken = () => localStorage.getItem('tapspot_token')

/**
 * 设置 token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('tapspot_token', token)
  } else {
    localStorage.removeItem('tapspot_token')
  }
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = () => !!getToken()
