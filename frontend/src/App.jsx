import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, Star, MapPin, X, Plus, TrendingUp, ZoomIn, ZoomOut, RotateCw, Send, Heart, MessageCircle, Check, Flame, Menu, List } from 'lucide-react'
import './styles/modern.css'

// 修复图标
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 创建标记图标
const createIcon = (type, rating, isNew = false) => {
  const config = {
    spot: { color: '#ff6b35', icon: '📍' },
    post: { color: '#004e89', icon: '📝' },
    food: { color: '#e74c3c', icon: '🍜' },
    hotel: { color: '#9b59b6', icon: '🏨' },
    shop: { color: '#3498db', icon: '🛍️' }
  }
  const c = config[type] || config.spot
  const color = type === 'spot' && rating >= 4 ? '#27ae60' : c.color
  const ring = isNew ? `border:3px solid #ff6b35;animation:pulse 1s infinite;` : ''
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;${ring}box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:15px;">${c.icon}</div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
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
    { id: 1, title: '故宫打卡', content: '太美了！推荐大家来北京一定要去', type: 'post', author: '旅行者小王', latitude: 39.9163, longitude: 116.3972, location_name: '故宫博物院', likes: 128, comments: 23 },
    { id: 2, title: '重庆火锅绝了', content: '正宗重庆味！辣得过瘾', type: 'food', author: '美食家小李', latitude: 29.5630, longitude: 106.5516, location_name: '重庆市渝中区', likes: 256, comments: 45 },
    { id: 3, title: '外滩夜景太美了', content: '夜景绝美！推荐晚上来拍照', type: 'post', author: '摄影师小张', latitude: 31.2397, longitude: 121.4909, location_name: '上海外滩', likes: 512, comments: 67 },
  ])
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [showStats, setShowStats] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [newCoords, setNewCoords] = useState(null)
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [spotForm, setSpotForm] = useState({ name: '', country: '', city: '', category: 'Attraction', description: '' })
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'post', location_name: '' })
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [newPostId, setNewPostId] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  const API_BASE = 'http://43.130.53.168:8080/api/v1'

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 加载spots
  useEffect(() => {
    axios.get(`${API_BASE}/spots?page_size=100`).then(res => {
      if (res.data?.success) {
        const data = res.data.data
        setSpots(Array.isArray(data) ? data : (data?.spots || []))
      }
    }).catch(() => {})
  }, [])

  const handleMapClick = (latlng) => {
    setNewCoords(latlng)
    setShowAddSpot(true)
  }

  const handleAddSpot = async () => {
    if (!spotForm.name || !spotForm.country) {
      alert('请填写名称和国家')
      return
    }
    try {
      await axios.post(`${API_BASE}/spots`, { ...spotForm, latitude: newCoords.lat, longitude: newCoords.lng, rating: 0, review_count: 0 })
      const res = await axios.get(`${API_BASE}/spots?page_size=100`)
      if (res.data?.success) {
        const data = res.data.data
        setSpots(Array.isArray(data) ? data : (data?.spots || []))
      }
    } catch (e) {
      setSpots([...spots, { id: Date.now(), ...spotForm, latitude: newCoords.lat, longitude: newCoords.lng, rating: 0, review_count: 0 }])
    }
    setShowAddSpot(false)
    setSpotForm({ name: '', country: '', city: '', category: 'Attraction', description: '' })
    alert('添加成功！')
  }

  // 发帖 - 修复：确保帖子立即显示并可定位
  const handlePost = () => {
    if (!postForm.title || !postForm.content) {
      alert('请填写标题和内容')
      return
    }
    const postId = Date.now()
    const lat = newCoords?.lat || 35.8617
    const lng = newCoords?.lng || 104.1954
    
    const newPost = {
      id: postId,
      ...postForm,
      author: '我',
      latitude: lat,
      longitude: lng,
      likes: 0,
      comments: 0
    }
    
    setPosts(prev => [newPost, ...prev])
    setNewPostId(postId) // 标记新帖子
    
    // 3秒后取消新帖子标记
    setTimeout(() => setNewPostId(null), 3000)
    
    // 自动定位到新帖子位置
    if (mapRef) {
      mapRef.setView([lat, lng], 10)
    }
    
    setShowPost(false)
    setPostForm({ title: '', content: '', type: 'post', location_name: '' })
    
    // 在移动端显示列表
    if (isMobile) {
      setShowMobileMenu(true)
    }
    
    alert(`发布成功！帖子"${postForm.title}"已显示在地图上`)
  }

  const handleLike = (id) => {
    if (likedPosts.has(id)) {
      alert('您已经点赞过了！')
      return
    }
    setLikedPosts(prev => new Set([...prev, id]))
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  const zoomIn = () => mapRef?.setZoom(mapZoom + 1)
  const zoomOut = () => mapRef?.setZoom(mapZoom - 1)
  const resetView = () => mapRef?.setView([35.8617, 104.1954], 4)

  const hotPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3)

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
          
          {/* PC端搜索 */}
          {!isMobile && (
            <div className="search-container">
              <div className="search-box">
                <Search className="search-icon" size={18} />
                <input className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索地点、帖子..." />
              </div>
            </div>
          )}
          
          <div className="nav-actions">
            <button className="btn btn-primary" onClick={() => setShowPost(true)}>
              <Plus size={16} /> {!isMobile && '发帖'}
            </button>
            {!isMobile && (
              <button className={`nav-btn ${showStats ? 'active' : ''}`} onClick={() => setShowStats(!showStats)}>
                <TrendingUp size={18} />
              </button>
            )}
            {/* 移动端菜单按钮 */}
            {isMobile && (
              <button className="nav-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                <List size={18} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 移动端底部菜单 */}
      {isMobile && showMobileMenu && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          zIndex: 1001,
          maxHeight: '60vh',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>帖子列表 ({posts.length})</h3>
            <button onClick={() => setShowMobileMenu(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '8px 16px', maxHeight: 'calc(60vh - 60px)', overflowY: 'auto' }}>
            {posts.map(p => (
              <div 
                key={p.id} 
                onClick={() => { mapRef?.setView([p.latitude, p.longitude], 12); setShowMobileMenu(false); }}
                style={{
                  padding: '12px',
                  background: p.id === newPostId ? '#fff3e0' : '#f5f5f5',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: p.id === newPostId ? '2px solid #ff6b35' : 'none'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {p.id === newPostId && <span style={{ color: '#ff6b35', fontSize: '12px' }}>🆕</span>}
                  {p.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {p.content.substring(0, 50)}...
                </div>
                <div style={{ fontSize: '11px', color: '#999', display: 'flex', gap: '12px' }}>
                  <span>📍 {p.location_name || '未设置'}</span>
                  <span>❤️ {p.likes}</span>
                  <span>💬 {p.comments}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PC端侧边栏 */}
      {!isMobile && showStats && (
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
          
          <div className="stats-card">
            <div className="stats-title"><Flame size={16} style={{color: '#ff6b35'}} /> 热门帖子</div>
            {hotPosts.map((p, i) => (
              <div key={p.id} className="country-item" onClick={() => mapRef?.setView([p.latitude, p.longitude], 12)} style={{ borderLeft: `3px solid ${i === 0 ? '#ff6b35' : i === 1 ? '#f39c12' : '#3498db'}` }}>
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
            <div className="stats-title"><MessageCircle size={16} /> 我的帖子 ({posts.filter(p => p.author === '我').length})</div>
            {posts.filter(p => p.author === '我').map(p => (
              <div key={p.id} className="country-item" onClick={() => mapRef?.setView([p.latitude, p.longitude], 12)} style={{ background: '#fff3e0', borderLeft: '3px solid #ff6b35' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>🆕 {p.title}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>📍 {p.location_name || '点击定位'}</div>
                </div>
              </div>
            ))}
            {posts.filter(p => p.author === '我').length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                还没有发布帖子，点击右上角发帖吧！
              </div>
            )}
          </div>
        </div>
      )}

      {/* 地图 */}
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
            key={`${item._type}-${item.id}`} 
            position={[item.latitude, item.longitude]} 
            icon={createIcon(item._type, item.rating, item.id === newPostId)}
          >
            <Popup>
              <div style={{ padding: '12px', minWidth: '200px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.id === newPostId && <span style={{ color: '#ff6b35', fontSize: '12px' }}>🆕 新发布</span>}
                  {item.name || item.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>📍 {item.location_name || (item.country && `${item.country} ${item.city || ''}`)}</p>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px', lineHeight: '1.5' }}>
                  {(item.description || item.content || '').substring(0, 80)}...
                </p>
                {item._type !== 'spot' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleLike(item.id)} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', 
                        background: likedPosts.has(item.id) ? '#f5f5f5' : 'none', 
                        border: 'none', cursor: likedPosts.has(item.id) ? 'default' : 'pointer', 
                        color: likedPosts.has(item.id) ? '#999' : '#ff6b35',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      <Heart size={14} fill={likedPosts.has(item.id) ? '#999' : 'none'} /> {item.likes}
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '13px' }}>
                      <MessageCircle size={14} /> {item.comments}
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 地图控制 */}
      <div className="map-controls" style={{ top: isMobile ? '80px' : '100px' }}>
        <div className="control-panel">
          <div className="control-buttons">
            <button className="control-btn" onClick={zoomIn}><ZoomIn size={18} /></button>
            <button className="control-btn" onClick={zoomOut}><ZoomOut size={18} /></button>
            <button className="control-btn" onClick={resetView}><RotateCw size={18} /></button>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="map-hint" style={{ bottom: isMobile ? (showMobileMenu ? '60vh' : '24px') : '24px' }}>
        <div className="hint-content">
          <Plus className="hint-icon" size={16} />
          <span className="hint-text">{isMobile ? '点击地图添加' : '点击地图添加地点 | 发帖分享发现'}</span>
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
                <label className="form-label">地点名称</label>
                <input className="input" placeholder="如：故宫博物院" value={postForm.location_name} onChange={e => setPostForm({...postForm, location_name: e.target.value})} />
              </div>
              <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '8px', fontSize: '12px', color: '#2e7d32' }}>
                ✅ 发帖后会自动定位到帖子位置，方便你找到！
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