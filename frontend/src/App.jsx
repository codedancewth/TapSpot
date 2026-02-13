import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, Star, MapPin, X, Plus, TrendingUp, ZoomIn, ZoomOut, RotateCw, Send, Heart, MessageCircle, Check, Flame } from 'lucide-react'
import './styles/modern.css'

// 修复图标
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 创建标记图标
const createIcon = (type, rating) => {
  const config = {
    spot: { color: '#ff6b35', icon: '📍' },
    post: { color: '#004e89', icon: '📝' },
    food: { color: '#e74c3c', icon: '🍜' },
    hotel: { color: '#9b59b6', icon: '🏨' },
    shop: { color: '#3498db', icon: '🛍️' }
  }
  const c = config[type] || config.spot
  const color = type === 'spot' && rating >= 4 ? '#27ae60' : c.color
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:13px;">${c.icon}</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// 地图事件
function MapEvents({ onClick, onReady, onZoom }) {
  const map = useMap()
  useEffect(() => { if (onReady) onReady(map) }, [map, onReady])
  useMapEvents({
    click: (e) => { if (onClick) onClick(e.latlng) },
    zoomend: () => { if (onZoom) onZoom(map.getZoom()) }
  })
  return null
}

function App() {
  const [spots, setSpots] = useState([])
  const [posts, setPosts] = useState([
    { id: 1, title: '故宫打卡', content: '太美了！推荐大家来', type: 'post', author: '旅行者', latitude: 39.9163, longitude: 116.3972, location_name: '故宫', likes: 128, comments: 23, liked: false },
    { id: 2, title: '重庆火锅', content: '正宗重庆味！', type: 'food', author: '美食家', latitude: 29.5630, longitude: 106.5516, location_name: '重庆', likes: 256, comments: 45, liked: false },
    { id: 3, title: '外滩夜景', content: '夜景绝美！', type: 'post', author: '摄影师', latitude: 31.2397, longitude: 121.4909, location_name: '上海外滩', likes: 512, comments: 67, liked: false },
  ])
  // 已点赞的帖子ID集合（防止重复点赞）
  const [likedPosts, setLikedPosts] = useState(new Set())
  
  const [showStats, setShowStats] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [newCoords, setNewCoords] = useState(null)
  
  // 模态框
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [showPost, setShowPost] = useState(false)
  
  // 表单
  const [spotForm, setSpotForm] = useState({ name: '', country: '', city: '', category: 'Attraction', description: '' })
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'post', location_name: '' })

  const API_BASE = 'http://43.130.53.168:8080/api/v1'

  // 加载spots
  useEffect(() => {
    axios.get(`${API_BASE}/spots?page_size=100`).then(res => {
      if (res.data?.success) {
        const data = res.data.data
        setSpots(Array.isArray(data) ? data : (data?.spots || []))
      }
    }).catch(() => {})
  }, [])

  // 地图点击
  const handleMapClick = (latlng) => {
    setNewCoords(latlng)
    setShowAddSpot(true)
  }

  // 添加地点 - 支持重复经纬度
  const handleAddSpot = async () => {
    if (!spotForm.name || !spotForm.country) {
      alert('请填写名称和国家')
      return
    }
    // 即使坐标相同也允许添加（支持重复保存）
    try {
      await axios.post(`${API_BASE}/spots`, {
        ...spotForm, latitude: newCoords.lat, longitude: newCoords.lng, rating: 0, review_count: 0
      })
      const res = await axios.get(`${API_BASE}/spots?page_size=100`)
      if (res.data?.success) {
        const data = res.data.data
        setSpots(Array.isArray(data) ? data : (data?.spots || []))
      }
    } catch (e) {
      // 本地添加（允许重复坐标）
      setSpots([...spots, {
        id: Date.now(), ...spotForm, latitude: newCoords.lat, longitude: newCoords.lng, rating: 0, review_count: 0
      }])
    }
    setShowAddSpot(false)
    setSpotForm({ name: '', country: '', city: '', category: 'Attraction', description: '' })
    alert('添加成功！')
  }

  // 发帖 - 支持重复经纬度保存
  const handlePost = () => {
    if (!postForm.title || !postForm.content) {
      alert('请填写标题和内容')
      return
    }
    const newPost = {
      id: Date.now(),
      ...postForm,
      author: '我',
      // 允许使用相同坐标（支持重复保存）
      latitude: newCoords?.lat || 35.8617,
      longitude: newCoords?.lng || 104.1954,
      likes: 0,
      comments: 0,
      liked: false
    }
    setPosts(prev => [newPost, ...prev])
    setShowPost(false)
    setPostForm({ title: '', content: '', type: 'post', location_name: '' })
    // 不重置坐标，允许连续在同一位置发帖
    alert('发布成功！帖子已显示在地图上')
  }

  // 点赞 - 防止重复点赞
  const handleLike = (id) => {
    // 检查是否已点赞
    if (likedPosts.has(id)) {
      alert('您已经点赞过了！')
      return
    }
    // 记录已点赞
    setLikedPosts(prev => new Set([...prev, id]))
    // 更新点赞数
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1, liked: true } : p))
  }

  // 地图控制
  const zoomIn = () => mapRef?.setZoom(mapZoom + 1)
  const zoomOut = () => mapRef?.setZoom(mapZoom - 1)
  const resetView = () => mapRef?.setView([35.8617, 104.1954], 4)

  // 热门帖子（点赞数前3）
  const hotPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3)

  // 所有标记
  const allMarkers = [
    ...spots.map(s => ({ ...s, _type: 'spot' })),
    ...posts.map(p => ({ ...p, _type: p.type || 'post' }))
  ]

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
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
              <input className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索地点、帖子..." />
            </div>
          </div>
          <div className="nav-actions">
            <button className="btn btn-primary" onClick={() => setShowPost(true)}>
              <Plus size={16} /> 发帖
            </button>
            <button className={`nav-btn ${showStats ? 'active' : ''}`} onClick={() => setShowStats(!showStats)}>
              <TrendingUp size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* 统计面板 */}
      {showStats && (
        <div className="side-panel panel-left">
          <div className="stats-card">
            <div className="stats-title"><TrendingUp size={16} /> 数据统计</div>
            <div className="stats-grid">
              <div className="stat-item"><div className="stat-value">{spots.length}</div><div className="stat-label">地点</div></div>
              <div className="stat-item"><div className="stat-value">{posts.length}</div><div className="stat-label">帖子</div></div>
              <div className="stat-item"><div className="stat-value">{posts.reduce((s, p) => s + p.likes, 0)}</div><div className="stat-label">点赞</div></div>
              <div className="stat-item"><div className="stat-value">∞</div><div className="stat-label">探索</div></div>
            </div>
          </div>
          
          {/* 热门帖子 */}
          <div className="stats-card">
            <div className="stats-title"><Flame size={16} style={{color: '#ff6b35'}} /> 热门帖子</div>
            {hotPosts.map((p, i) => (
              <div key={p.id} className="country-item" onClick={() => mapRef?.setView([p.latitude, p.longitude], 12)} style={{ borderLeft: i < 3 ? `3px solid ${i === 0 ? '#ff6b35' : i === 1 ? '#f39c12' : '#3498db'}` : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {i === 0 && '🔥'} {i === 1 && '⭐'} {i === 2 && '👍'} {p.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{p.author} · ❤️ {p.likes}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="stats-card">
            <div className="stats-title"><MessageCircle size={16} /> 全部帖子 ({posts.length})</div>
            {posts.slice(0, 5).map(p => (
              <div key={p.id} className="country-item" onClick={() => mapRef?.setView([p.latitude, p.longitude], 12)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.title}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{p.author} · ❤️ {p.likes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 地图 - 使用OpenStreetMap作为备用 */}
      <MapContainer 
        center={[35.8617, 104.1954]} 
        zoom={mapZoom} 
        style={{ width: '100%', height: '100%' }} 
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onClick={handleMapClick} onReady={setMapRef} onZoom={setMapZoom} />
        
        {allMarkers.map((item, i) => (
          <Marker 
            key={`${item._type}-${item.id}-${i}`} 
            position={[item.latitude, item.longitude]} 
            icon={createIcon(item._type, item.rating)}
          >
            <Popup>
              <div style={{ padding: '8px', minWidth: '180px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>{item.name || item.title}</h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{item.location_name || (item.country && `${item.country} ${item.city || ''}`)}</p>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{(item.description || item.content || '').substring(0, 60)}...</p>
                {item._type !== 'spot' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleLike(item.id)} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', 
                        background: likedPosts.has(item.id) ? '#f5f5f5' : 'none', 
                        border: 'none', cursor: likedPosts.has(item.id) ? 'default' : 'pointer', 
                        color: likedPosts.has(item.id) ? '#999' : '#ff6b35' 
                      }}
                    >
                      <Heart size={14} fill={likedPosts.has(item.id) ? '#999' : 'none'} /> {item.likes}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '13px' }}>
                      <MessageCircle size={14} /> {item.comments}
                    </span>
                  </div>
                )}
                {item._type === 'spot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={14} style={{ color: '#f39c12' }} />
                    <span style={{ fontWeight: '600', fontSize: '13px' }}>{item.rating > 0 ? item.rating.toFixed(1) : '暂无'}</span>
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
            <button className="control-btn" onClick={zoomIn} title="放大"><ZoomIn size={18} /></button>
            <button className="control-btn" onClick={zoomOut} title="缩小"><ZoomOut size={18} /></button>
            <button className="control-btn" onClick={resetView} title="重置"><RotateCw size={18} /></button>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="map-hint">
        <div className="hint-content">
          <Plus className="hint-icon" size={16} />
          <span className="hint-text">点击地图添加地点 | 点击发帖分享发现</span>
        </div>
      </div>

      {/* 添加地点 */}
      {showAddSpot && newCoords && (
        <div className="modal-overlay" onClick={() => setShowAddSpot(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">添加地点</h2>
              <button className="modal-close" onClick={() => setShowAddSpot(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">名称 *</label>
                <input className="input" placeholder="地点名称" value={spotForm.name} onChange={e => setSpotForm({...spotForm, name: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">国家 *</label>
                  <input className="input" placeholder="国家" value={spotForm.country} onChange={e => setSpotForm({...spotForm, country: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">城市</label>
                  <input className="input" placeholder="城市" value={spotForm.city} onChange={e => setSpotForm({...spotForm, city: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">分类</label>
                <select className="input" value={spotForm.category} onChange={e => setSpotForm({...spotForm, category: e.target.value})}>
                  <option value="Attraction">景点</option>
                  <option value="Restaurant">餐厅</option>
                  <option value="Hotel">酒店</option>
                  <option value="Shopping">购物</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">描述</label>
                <textarea className="input" rows="3" placeholder="描述..." value={spotForm.description} onChange={e => setSpotForm({...spotForm, description: e.target.value})} />
              </div>
              <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
                📍 {newCoords.lat.toFixed(4)}, {newCoords.lng.toFixed(4)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddSpot(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAddSpot}><Check size={16} /> 添加</button>
            </div>
          </div>
        </div>
      )}

      {/* 发帖 */}
      {showPost && (
        <div className="modal-overlay" onClick={() => setShowPost(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">发布帖子</h2>
              <button className="modal-close" onClick={() => setShowPost(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[{type:'post',label:'📝 日常'},{type:'food',label:'🍜 美食'},{type:'hotel',label:'🏨 住宿'},{type:'shop',label:'🛍️ 购物'}].map(item => (
                  <button key={item.type} onClick={() => setPostForm({...postForm, type: item.type})} style={{flex:1,padding:'10px',background:postForm.type===item.type?'#ff6b35':'#f5f5f5',border:'none',borderRadius:'8px',color:postForm.type===item.type?'white':'#333',cursor:'pointer',fontWeight:'500'}}>
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">标题 *</label>
                <input className="input" placeholder="标题" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} maxLength={50} />
              </div>
              <div className="form-group">
                <label className="form-label">内容 *</label>
                <textarea className="input" rows="4" placeholder="分享你的发现..." value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} maxLength={500} />
              </div>
              <div className="form-group">
                <label className="form-label">地点</label>
                <input className="input" placeholder="地点名称" value={postForm.location_name} onChange={e => setPostForm({...postForm, location_name: e.target.value})} />
              </div>
              <div style={{ padding: '10px', background: '#fff3e0', borderRadius: '8px', fontSize: '12px', color: '#666' }}>
                💡 提示：发帖前可以先点击地图选择位置（支持同一位置多次发帖）
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