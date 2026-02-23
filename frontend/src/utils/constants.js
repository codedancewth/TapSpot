/**
 * TapSpot 前端配置文件
 * 
 * 包含所有常量配置：API地址、配色方案、帖子类型等
 */

// API 基础路径
export const API_BASE = '/api'

// 配色方案
export const COLORS = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#e94560',
  gold: '#f4a261',
  text: '#eaeaea',
  textDark: '#1a1a2e',
  cardBg: '#ffffff',
  cardBgDark: '#0f0f23',
  border: '#2d2d44',
  success: '#10b981',
}

// 帖子类型配置
export const POST_TYPES = {
  post: { color: '#3b82f6', colorDark: '#2563eb', icon: '📍', label: '日常' },
  food: { color: '#f97316', colorDark: '#ea580c', icon: '🍽️', label: '美食' },
  hotel: { color: '#8b5cf6', colorDark: '#7c3aed', icon: '🏨', label: '住宿' },
  shop: { color: '#ec4899', colorDark: '#db2777', icon: '🛍️', label: '购物' },
  scenic: { color: '#10b981', colorDark: '#059669', icon: '🏞️', label: '景点' },
  transport: { color: '#06b6d4', colorDark: '#0891b2', icon: '🚗', label: '交通' },
  entertainment: { color: '#f59e0b', colorDark: '#d97706', icon: '🎭', label: '娱乐' },
  work: { color: '#6366f1', colorDark: '#4f46e5', icon: '💼', label: '工作' },
}

// 获取帖子类型配置
export const getTypeConfig = (type) => {
  return POST_TYPES[type] || POST_TYPES.post
}

// 帖子类型选项列表（用于筛选）
export const POST_TYPE_OPTIONS = [
  { key: 'all', label: '全部' },
  ...Object.entries(POST_TYPES).map(([key, value]) => ({
    key,
    label: `${value.icon} ${value.label}`
  }))
]
