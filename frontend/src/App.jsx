import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, Star, MapPin, X, Plus, Globe, TrendingUp, ZoomIn, ZoomOut, RotateCw, Send, Heart, MessageCircle, Image, User } from 'lucide-react'
import './styles/modern.css'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 自定义标记图标
const createCustomIcon = (rating = 0, type = 'spot') => {
  const colors = {
    spot: rating >= 4.5 ? '#10b981' : rating >= 4 ? '#3b82f6' : rating >= 3 ? '#f59e0b' : '#667eea',
    post: '#ec4899',
    food: '#f97316',
    hotel: '#8b5cf6',
    shop: '#06b6d4'
  }
  const color = colors[type] || colors.spot
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${type === 'post' ? '📝' : type === 'food' ? '🍜' : type === 'hotel' ? '🏨' : type === 'shop' ? '🛍️' : (rating > 0 ? rating.toFixed(1) : '📍')}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

// 地图事件组件
function MapEvents({ onMapClick, onBoundsChange, onMapReady, onZoomChange }) {
  const map = useMap()
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])
  
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng)
      }
    },
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds()
        onBoundsChange({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lng: bounds.getWest(),
          max_lng: bounds.getEast(),
        })
      }
    },
    zoomend: () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom())
      }
    },
  })
  
  return null
}

function App() {
  const [spots, setSpots] = useState([])
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ total_spots: 0, total_reviews: 0, total_countries: 0 })
  const [countries, setCountries] = useState([])
  const [showStats, setShowStats] = useState(true)
  const [showCountries, setShowCountries] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [mapCenter] = useState([35.8617, 104.1954]) // 中国中心
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [showSpotModal, setShowSpotModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSpotCoords, setNewSpotCoords] = useState(null)
  
  // 发帖相关状态
  const [showPostModal, setShowPostModal] = useState(false)
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    type: 'post',
    location_name: '',
    image_url: ''
  })

  // API 基础 URL
  const API_BASE = 'http://43.130.53.168:8080/api/v1'

  // 初始化模拟帖子数据
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        title: '今天在故宫拍的照片',
        content: '故宫真的太美了！推荐大家去打卡',
        type: 'post',
        author: '旅行者小王',
        latitude: 39.9163,
        longitude: 116.3972,
        location_name: '故宫博物院',
        likes: 128,
        comments: 23,
        created_at: '2024-02-13T10:00:00Z'
      },
      {
        id: 2,
        title: '发现一家超好吃的火锅店',
        content: '重庆火锅真的绝了！辣得过瘾！',
        type: 'food',
        author: '美食家小李',
        latitude: 29.5630,
        longitude: 106.5516,
        location_name: '重庆市渝中区',
        likes: 256,
        comments: 45,
        created_at: '2024-02-13T12:00:00Z'
      },
      {
        id: 3,
        title: '外滩夜景太美了',
        content: '上海外滩的夜景真的太美了，推荐晚上来拍照',
        type: 'post',
        author: '摄影师小张',
        latitude: 31.2397,
        longitude: 121.4909,
        location_name: '上海外滩',
        likes: 512,
        comments: 67,
        created_at: '2024-02-13T14:00:00Z'
      }
    ]
    setPosts(mockPosts)
  }, [])

  // 加载spots数据
  const loadSpots = async (bounds = null) => {
    setLoading(true)
    try {
      let url = `${API_BASE}/spots?page_size=100`
      
      if (bounds) {
        url += `&min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lng=${bounds.min_lng}&max_lng=${bounds.max_lng}`
      }
      
      const response = await axios.get(url)
      if (response.data && response.data.success) {
        const spotsData = response.data.data
        if (Array.isArray(spotsData)) {
          setSpots(spotsData)
        } else if (spotsData && spotsData.spots) {
          setSpots(spotsData.spots)
        } else {
          setSpots([])
        }
      } else {
        setSpots([])
      }
    } catch (error) {
      console.error('加载地点失败:', error)
      setSpots([])
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`)
      if (response.data && response.data.success) {
        setStats(response.data.data || { total_spots: 0, total_reviews: 0, total_countries: 0 })
      }
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  // 加载国家数据
  const loadCountries = async () => {
    try {
      const response = await axios.get(`${API_BASE}/countries`)
      if (response.data && response.data.success) {
        setCountries(response.data.data || [])
      }
    } catch (error) {
      console.error('加载国家失败:', error)
      setCountries([])
    }
  }

  // 初始化
  useEffect(() => {
    loadSpots()
    loadStats()
    loadCountries()
  }, [])

  // 地图点击事件
  const handleMapClick = (latlng) => {
    setNewSpotCoords(latlng)
    setShowCreateModal(true)
  }

  // 地图边界变化事件
  const handleBoundsChange = (bounds) => {
    loadSpots(bounds)
  }

  // 发帖功能
  const handleSubmitPost = () => {
    if (!postForm.title || !postForm.content) {
      alert('请填写标题和内容')
      return
    }
    
    const newPost = {
      id: posts.length + 1,
      ...postForm,
      author: '匿名用户',
      latitude: newSpotCoords ? newSpotCoords.lat : mapCenter[0],
      longitude: newSpotCoords ? newSpotCoords.lng : mapCenter[1],
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    }
    
    setPosts([newPost, ...posts])
    setShowPostModal(false)
    setPostForm({
      title: '',
      content: '',
      type: 'post',
      location_name: '',
      image_url: ''
    })
    alert('发布成功！')
  }

  // 点赞功能
  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
  }

  // 地图控制函数
  const handleZoomIn = () => {
    if (mapRef && mapZoom < 18) {
      mapRef.setZoom(mapZoom + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef && mapZoom > 2) {
      mapRef.setZoom(mapZoom - 1)
    }
  }

  const handleResetView = () => {
    if (mapRef) {
      mapRef.setView([35.8617, 104.1954], 4)
    }
  }

  // 更新地图引用
  const updateMapRef = (map) => {
    setMapRef(map)
  }

  // 合并spots和posts用于地图显示
  const allMarkers = [
    ...(spots && Array.isArray(spots) ? spots.map(s => ({ ...s, markerType: 'spot' })) : []),
    ...(posts && Array.isArray(posts) ? posts.map(p => ({ ...p, markerType: 'post' })) : [])
  ]

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <div className="logo-icon">📍</div>
            <div>
              <div className="logo-text">TapSpot</div>
              <div className="logo-subtitle">发现精彩地点</div>
            </div>
          </div>

          <div className="search-container">
            <form onSubmit={(e) => { e.preventDefault(); }} className="search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索地点、帖子..."
                className="search-input"
              />
            </form>
          </div>

          <div className="nav-actions">
            <button
              onClick={() => {
                setNewSpotCoords(null)
                setShowPostModal(true)
              }}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Plus size={16} />
              发帖
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`nav-btn ${showStats ? 'active' : ''}`}
            >
              <TrendingUp size={18} />
            </button>
            <button
              onClick={() => setShowCountries(!showCountries)}
              className={`nav-btn ${showCountries ? 'active' : ''}`}
            >
              <Globe size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* 左侧统计面板 */}
      {showStats && (
        <div className="side-panel panel-left">
          <div className="stats-card">
            <div className="stats-title">
              <TrendingUp size={16} />
              实时统计
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{spots.length}</div>
                <div className="stat-label">地点</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{posts.length}</div>
                <div className="stat-label">帖子</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{posts.reduce((sum, p) => sum + p.likes, 0)}</div>
                <div className="stat-label">点赞</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">∞</div>
                <div className="stat-label">探索</div>
              </div>
            </div>
          </div>
          
          {/* 最新帖子 */}
          <div className="stats-card">
            <div className="stats-title">
              <MessageCircle size={16} />
              最新帖子
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {posts.slice(0, 5).map(post => (
                <div 
                  key={post.id} 
                  className="country-item"
                  onClick={() => {
                    if (mapRef) {
                      mapRef.setView([post.latitude, post.longitude], 12)
                    }
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {post.author} · ❤️ {post.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 地图 */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* 使用GeoQ地图 - 国内可用 */}
          <TileLayer
            attribution='&copy; <a href="http://geoq.cn">GeoQ</a>'
            url="https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}"
          />
          
          <MapEvents 
            onMapClick={handleMapClick} 
            onBoundsChange={handleBoundsChange}
            onMapReady={updateMapRef}
            onZoomChange={setMapZoom}
          />

          {/* 所有标记 */}
          {allMarkers.map((item) => (
            <Marker
              key={`${item.markerType}-${item.id}`}
              position={[item.latitude, item.longitude]}
              icon={createCustomIcon(item.rating || 0, item.markerType === 'post' ? item.type : 'spot')}
            >
              <Popup>
                <div style={{ padding: '12px', minWidth: '220px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {item.name || item.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    {item.description || item.content?.substring(0, 50)}...
                  </p>
                  {item.markerType === 'post' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <button 
                        onClick={() => handleLike(item.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#ec4899'
                        }}
                      >
                        <Heart size={16} />
                        {item.likes}
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                        <MessageCircle size={16} />
                        {item.comments}
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 地图控制面板 */}
      <div className="map-controls">
        <div className="control-panel">
          <div className="control-buttons">
            <button onClick={handleZoomIn} className="control-btn" title="放大">
              <ZoomIn size={18} />
            </button>
            <button onClick={handleZoomOut} className="control-btn" title="缩小">
              <ZoomOut size={18} />
            </button>
            <button onClick={handleResetView} className="control-btn" title="重置视图">
              <RotateCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="map-hint">
        <div className="hint-content">
          <Plus className="hint-icon" size={18} />
          <span className="hint-text">点击地图添加地点 | 点击发帖分享你的发现</span>
        </div>
      </div>

      {/* 发帖模态框 */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">发布新帖子</h2>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {/* 帖子类型选择 */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[
                  { type: 'post', label: '📝 日常', icon: '📝' },
                  { type: 'food', label: '🍜 美食', icon: '🍜' },
                  { type: 'hotel', label: '🏨 住宿', icon: '🏨' },
                  { type: 'shop', label: '🛍️ 购物', icon: '🛍️' }
                ].map(item => (
                  <button
                    key={item.type}
                    onClick={() => setPostForm({ ...postForm, type: item.type })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: postForm.type === item.type ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid',
                      borderColor: postForm.type === item.type ? 'transparent' : 'var(--border-color)',
                      borderRadius: '8px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">标题 *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="给帖子起个标题"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label className="form-label">内容 *</label>
                <textarea
                  className="input"
                  rows="4"
                  placeholder="分享你的发现、体验或推荐..."
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  maxLength={500}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {postForm.content.length}/500
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">地点名称</label>
                <input
                  type="text"
                  className="input"
                  placeholder="例如：故宫博物院"
                  value={postForm.location_name}
                  onChange={(e) => setPostForm({ ...postForm, location_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">图片链接（可选）</label>
                <input
                  type="text"
                  className="input"
                  placeholder="粘贴图片URL"
                  value={postForm.image_url}
                  onChange={(e) => setPostForm({ ...postForm, image_url: e.target.value })}
                />
              </div>

              {newSpotCoords && (
                <div style={{ 
                  padding: '12px', 
                  background: 'rgba(102, 126, 234, 0.1)', 
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  marginBottom: '16px'
                }}>
                  📍 已选择位置: {newSpotCoords.lat.toFixed(4)}, {newSpotCoords.lng.toFixed(4)}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPostModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={handleSubmitPost}>
                <Send size={16} />
                发布
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App