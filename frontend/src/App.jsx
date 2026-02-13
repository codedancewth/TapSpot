import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, Star, MapPin, X, Plus, Globe, TrendingUp, ZoomIn, ZoomOut, RotateCw, Send, Heart, MessageCircle, User, Check } from 'lucide-react'
import './styles/modern.css'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 自定义标记图标
const createCustomIcon = (type = 'spot', rating = 0) => {
  const colors = {
    spot: '#3b82f6',
    post: '#ec4899',
    food: '#f97316',
    hotel: '#8b5cf6',
    shop: '#06b6d4'
  }
  const icons = {
    spot: '📍',
    post: '📝',
    food: '🍜',
    hotel: '🏨',
    shop: '🛍️'
  }
  const color = type === 'spot' 
    ? (rating >= 4.5 ? '#10b981' : rating >= 4 ? '#3b82f6' : rating >= 3 ? '#f59e0b' : '#3b82f6')
    : (colors[type] || colors.spot)
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:14px;">${icons[type] || '📍'}</div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

// 地图事件组件
function MapEvents({ onMapClick, onBoundsChange, onMapReady, onZoomChange }) {
  const map = useMap()
  
  useEffect(() => {
    if (onMapReady) onMapReady(map)
  }, [map, onMapReady])
  
  useMapEvents({
    click: (e) => { if (onMapClick) onMapClick(e.latlng) },
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds()
        onBoundsChange({ min_lat: bounds.getSouth(), max_lat: bounds.getNorth(), min_lng: bounds.getWest(), max_lng: bounds.getEast() })
      }
    },
    zoomend: () => { if (onZoomChange) onZoomChange(map.getZoom()) },
  })
  return null
}

function App() {
  const [spots, setSpots] = useState([])
  const [posts, setPosts] = useState([
    { id: 1, title: '故宫打卡', content: '太美了！', type: 'post', author: '小王', latitude: 39.9163, longitude: 116.3972, location_name: '故宫', likes: 128, comments: 23 },
    { id: 2, title: '重庆火锅', content: '辣得过瘾！', type: 'food', author: '小李', latitude: 29.5630, longitude: 106.5516, location_name: '重庆', likes: 256, comments: 45 },
    { id: 3, title: '外滩夜景', content: '绝美！', type: 'post', author: '小张', latitude: 31.2397, longitude: 121.4909, location_name: '上海外滩', likes: 512, comments: 67 },
  ])
  const [stats, setStats] = useState({ total_spots: 0, total_reviews: 0, total_countries: 0 })
  const [countries, setCountries] = useState([])
  const [showStats, setShowStats] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [mapCenter] = useState([35.8617, 104.1954])
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [newCoords, setNewCoords] = useState(null)
  
  // 模态框状态
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [showDetail, setShowDetail] = useState(null)
  
  // 表单状态
  const [spotForm, setSpotForm] = useState({ name: '', country: '', city: '', category: 'Attraction', description: '' })
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'post', location_name: '' })

  const API_BASE = 'http://43.130.53.168:8080/api/v1'

  // 加载数据
  const loadSpots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/spots?page_size=100`)
      if (res.data?.success) {
        const data = res.data.data
        setSpots(Array.isArray(data) ? data : (data?.spots || []))
      }
    } catch (e) { console.error('加载失败', e) }
  }

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stats`)
      if (res.data?.success) setStats(res.data.data)
    } catch (e) {}
  }

  const loadCountries = async () => {
    try {
      const res = await axios.get(`${API_BASE}/countries`)
      if (res.data?.success) setCountries(res.data.data || [])
    } catch (e) {}
  }

  useEffect(() => { loadSpots(); loadStats(); loadCountries() }, [])

  // 地图点击
  const handleMapClick = (latlng) => {
    setNewCoords(latlng)
    setShowAddSpot(true)
  }

  // 添加地点
  const handleAddSpot = async () => {
    if (!spotForm.name || !spotForm.country) {
      alert('请填写名称和国家')
      return
    }
    try {
      await axios.post(`${API_BASE}/spots`, {
        ...spotForm,
        latitude: newCoords.lat,
        longitude: newCoords.lng,
        rating: 0,
        review_count: 0
      })
      loadSpots()
      loadStats()
      loadCountries()
      setShowAddSpot(false)
      setSpotForm({ name: '', country: '', city: '', category: 'Attraction', description: '' })
      alert('添加成功！')
    } catch (e) {
      // 如果API失败，本地添加
      const newSpot = {
        id: spots.length + 100,
        ...spotForm,
        latitude: newCoords.lat,
        longitude: newCoords.lng,
        rating: 0,
        review_count: 0
      }
      setSpots([...spots, newSpot])
      setShowAddSpot(false)
      setSpotForm({ name: '', country: '', city: '', category: 'Attraction', description: '' })
      alert('添加成功！')
    }
  }

  // 发帖
  const handlePost = () => {
    if (!postForm.title || !postForm.content) {
      alert('请填写标题和内容')
      return
    }
    const newPost = {
      id: posts.length + 100,
      ...postForm,
      author: '匿名用户',
      latitude: newCoords?.lat || mapCenter[0],
      longitude: newCoords?.lng || mapCenter[1],
      likes: 0,
      comments: 0
    }
    setPosts([newPost, ...posts])
    setShowPost(false)
    setPostForm({ title: '', content: '', type: 'post', location_name: '' })
    alert('发布成功！')
  }

  // 点赞
  const handleLike = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  // 地图控制
  const handleZoomIn = () => { if (mapRef) mapRef.setZoom(mapZoom + 1) }
  const handleZoomOut = () => { if (mapRef) mapRef.setZoom(mapZoom - 1) }
  const handleReset = () => { if (mapRef) mapRef.setView(mapCenter, 4) }

  // 合并所有标记
  const allMarkers = [
    ...(Array.isArray(spots) ? spots.map(s => ({ ...s, _type: 'spot' })) : []),
    ...(Array.isArray(posts) ? posts.map(p => ({ ...p, _type: p.type || 'post' })) : [])
  ]

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 导航栏 */}
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
            <div className="search-box">
              <Search className="search-icon" size={18} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索..." className="search-input" />
            </div>
          </div>
          <div className="nav-actions">
            <button onClick={() => setShowPost(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Plus size={16} /> 发帖
            </button>
            <button onClick={() => setShowStats(!showStats)} className={`nav-btn ${showStats ? 'active' : ''}`}>
              <TrendingUp size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* 统计面板 */}
      {showStats && (
        <div className="side-panel panel-left">
          <div className="stats-card">
            <div className="stats-title"><TrendingUp size={16} /> 统计</div>
            <div className="stats-grid">
              <div className="stat-item"><div className="stat-value">{spots.length}</div><div className="stat-label">地点</div></div>
              <div className="stat-item"><div className="stat-value">{posts.length}</div><div className="stat-label">帖子</div></div>
              <div className="stat-item"><div className="stat-value">{posts.reduce((s, p) => s + p.likes, 0)}</div><div className="stat-label">点赞</div></div>
              <div className="stat-item"><div className="stat-value">∞</div><div className="stat-label">探索</div></div>
            </div>
          </div>
          <div className="stats-card">
            <div className="stats-title"><MessageCircle size={16} /> 最新帖子</div>
            {posts.slice(0, 5).map(p => (
              <div key={p.id} className="country-item" onClick={() => { if (mapRef) mapRef.setView([p.latitude, p.longitude], 12) }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.author} · ❤️ {p.likes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 地图 */}
      <MapContainer center={mapCenter} zoom={mapZoom} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer
          attribution='&copy; GeoQ'
          url="https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}"
        />
        <MapEvents onMapClick={handleMapClick} onMapReady={setMapRef} onZoomChange={setMapZoom} />
        {allMarkers.map((item, i) => (
          <Marker key={`${item._type}-${item.id}-${i}`} position={[item.latitude, item.longitude]} icon={createCustomIcon(item._type, item.rating)}>
            <Popup>
              <div style={{ padding: '12px', minWidth: '200px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{item.name || item.title}</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {item.location_name || item.country} {item.city && `· ${item.city}`}
                </p>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                  {item.description || item.content?.substring(0, 80)}{item.content?.length > 80 ? '...' : ''}
                </p>
                {item._type !== 'spot' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleLike(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ec4899' }}>
                      <Heart size={16} /> {item.likes}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666' }}>
                      <MessageCircle size={16} /> {item.comments || 0}
                    </span>
                  </div>
                )}
                {item._type === 'spot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontWeight: '600' }}>{item.rating > 0 ? item.rating.toFixed(1) : '暂无评分'}</span>
                    <span style={{ fontSize: '12px', color: '#999' }}>({item.review_count || 0})</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 地图控制 */}
      <div className="map-controls">
        <div className="control-panel">
          <div className="control-buttons">
            <button onClick={handleZoomIn} className="control-btn"><ZoomIn size={18} /></button>
            <button onClick={handleZoomOut} className="control-btn"><ZoomOut size={18} /></button>
            <button onClick={handleReset} className="control-btn"><RotateCw size={18} /></button>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="map-hint">
        <div className="hint-content">
          <Plus className="hint-icon" size={18} />
          <span className="hint-text">点击地图添加地点 | 点击发帖分享发现</span>
        </div>
      </div>

      {/* 添加地点模态框 */}
      {showAddSpot && newCoords && (
        <div className="modal-overlay" onClick={() => setShowAddSpot(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">添加新地点</h2>
              <button className="modal-close" onClick={() => setShowAddSpot(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">名称 *</label>
                <input type="text" className="input" placeholder="地点名称" value={spotForm.name} onChange={(e) => setSpotForm({...spotForm, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">国家 *</label>
                  <input type="text" className="input" placeholder="国家" value={spotForm.country} onChange={(e) => setSpotForm({...spotForm, country: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">城市</label>
                  <input type="text" className="input" placeholder="城市" value={spotForm.city} onChange={(e) => setSpotForm({...spotForm, city: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">分类</label>
                <select className="input" value={spotForm.category} onChange={(e) => setSpotForm({...spotForm, category: e.target.value})}>
                  <option value="Attraction">景点</option>
                  <option value="Restaurant">餐厅</option>
                  <option value="Hotel">酒店</option>
                  <option value="Shopping">购物</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">描述</label>
                <textarea className="input" rows="3" placeholder="描述这个地点..." value={spotForm.description} onChange={(e) => setSpotForm({...spotForm, description: e.target.value})} />
              </div>
              <div style={{ padding: '12px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                📍 位置: {newCoords.lat.toFixed(4)}, {newCoords.lng.toFixed(4)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddSpot(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAddSpot}><Check size={16} /> 添加</button>
            </div>
          </div>
        </div>
      )}

      {/* 发帖模态框 */}
      {showPost && (
        <div className="modal-overlay" onClick={() => setShowPost(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">发布帖子</h2>
              <button className="modal-close" onClick={() => setShowPost(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{type:'post',label:'📝 日常'},{type:'food',label:'🍜 美食'},{type:'hotel',label:'🏨 住宿'},{type:'shop',label:'🛍️ 购物'}].map(item => (
                  <button key={item.type} onClick={() => setPostForm({...postForm, type: item.type})} style={{flex:1,padding:'12px',background:postForm.type===item.type?'var(--primary-gradient)':'rgba(255,255,255,0.05)',border:'1px solid',borderColor:postForm.type===item.type?'transparent':'var(--border-color)',borderRadius:'8px',color:'white',cursor:'pointer'}}>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">标题 *</label>
                <input type="text" className="input" placeholder="标题" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} maxLength={50} />
              </div>
              <div className="form-group">
                <label className="form-label">内容 *</label>
                <textarea className="input" rows="4" placeholder="分享你的发现..." value={postForm.content} onChange={(e) => setPostForm({...postForm, content: e.target.value})} maxLength={500} />
              </div>
              <div className="form-group">
                <label className="form-label">地点</label>
                <input type="text" className="input" placeholder="地点名称" value={postForm.location_name} onChange={(e) => setPostForm({...postForm, location_name: e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPost(false)}>取消</button>
              <button className="btn btn-primary" onClick={handlePost}><Send size={16} /> 发布</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App