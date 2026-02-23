/**
 * TapSpot 地图标记组件
 * 
 * 创建自定义的地图标记图标
 */

import L from 'leaflet'

// 标记图标 SVG 配置
const ICON_CONFIG = {
  post: { 
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
  },
  food: { 
    color: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`
  },
  hotel: {
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path><path d="M9 22v-4h6v4"></path></svg>`
  },
  shop: {
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>`
  },
  scenic: {
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 3v2"></path><path d="M12 3v2"></path><path d="M16 3v2"></path><path d="M3 8h18"></path></svg>`
  },
  transport: {
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-1.5-3.4C16.1 5.6 15.1 5 14 5H10c-1.1 0-2.1.6-2.5 1.6L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>`
  },
  entertainment: {
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path></svg>`
  },
  work: {
    color: '#6366f1',
    glowColor: 'rgba(99,102,241,0.4)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  },
}

/**
 * 创建自定义地图标记图标
 * @param {string} type - 帖子类型
 * @param {boolean} isNew - 是否为新帖子
 * @param {boolean} isMyPost - 是否为我的帖子
 * @param {number} zoom - 当前缩放级别
 * @returns {L.DivIcon} Leaflet 图标
 */
export const createIcon = (type, isNew = false, isMyPost = false, zoom = 10) => {
  const c = ICON_CONFIG[type] || ICON_CONFIG.post
  
  // 根据缩放级别计算大小
  let size, iconSize
  if (zoom <= 4) { size = 26; iconSize = 12 }
  else if (zoom <= 8) { size = 34; iconSize = 14 }
  else { size = 44; iconSize = 16 }
  
  const border = isMyPost ? '3px solid gold' : '3px solid white'
  const shadow = `0 0 20px ${c.glowColor}, 0 0 40px ${c.glowColor}, 0 4px 15px rgba(0,0,0,0.3)`
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
    <div style="position:relative;">
      <div style="
        width: ${size}px; height: ${size}px;
        background: ${c.color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: ${border};
        box-shadow: ${shadow};
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        ${isNew ? 'animation: bounce 0.6s infinite;' : ''}
      ">
        <div style="transform: rotate(45deg); width: ${iconSize}px; height: ${iconSize}px; display: flex; align-items: center; justify-content: center;">${c.icon}</div>
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
  })
}

export default createIcon
