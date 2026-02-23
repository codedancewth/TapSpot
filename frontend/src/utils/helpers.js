/**
 * TapSpot 工具函数
 */

/**
 * 格式化时间为相对时间
 * @param {string|Date} timestamp - 时间戳
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return date.toLocaleDateString()
}

/**
 * 性别显示文本
 */
export const getGenderText = (gender) => {
  const map = { male: '男', female: '女', secret: '保密' }
  return map[gender] || '保密'
}

/**
 * 性别图标
 */
export const getGenderIcon = (gender) => {
  if (gender === 'male') return '👨'
  if (gender === 'female') return '👩'
  return '🤫'
}
