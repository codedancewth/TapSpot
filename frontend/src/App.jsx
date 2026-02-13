import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, X, Plus, ZoomIn, ZoomOut, RotateCw, Send, Heart, MessageCircle, Check, List, Close } from 'lucide-react'
import './styles/modern.css'

// 修复图标
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 创建标记图标
const createIcon = (type, isNew = false) => {
  const config = {
    spot: { color: '#ff6b35', icon: '📍' },
    post: { color: '#004e89', icon: '📝' },
    food: { color: '#e74c3c', icon: '🍜' },
    hotel: { color: '#9b59b6', icon: '🏨' },
    shop: { color: '#3498db', icon: '🛍️' }
  }
  const c = config[type] || config.spot
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:40px;height:40px;background:${c.color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;${isNew ? 'animation:pulse 1s infinite;box-shadow:0 0 10px #ff6b35;' : 'box-shadow:0 2px 8px rgba(0,0,0,0.3);'}display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:16px;">${c.icon}</div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

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
    { id: 1, title: '故宫打卡', content: '太美了！推荐大家来北京一定要去故宫参观', type: 'post', author: '旅行者小王', latitude: 39.9163, longitude: 116.3972, location_name: '故宫博物院', likes: 128, comments: 23 },
    { id: 2, title: '重庆火锅绝了', content: '正宗重庆味！辣得过瘾，推荐大家来试试', type: 'food', author: '美食家小李', latitude: 29.5630, longitude: 106.5516, location_name: '重庆市', likes: 256, comments: 45 },
    { id: 3, title: '外滩夜景太美了', content: '夜景绝美！推荐晚上来拍照打卡', type: 'post', author: '摄影师小张', latitude: 31.2397, longitude: 121.4909, location_name: '上海外滩', likes: 512, comments: 67 },
  ])
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [newCoords, setNewCoords] = useState(null)
  const [showAddSpot, setShowAddSpot] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const [spotForm, setSpotForm] = useState({ name: '', country: '', city: '', category: 'Attraction', description: '' })
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'post', location_name: '' })
  const [showList, setShowList] = useState(false)
  const [newPostId, setNewPostId] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  const API_BASE = 'http://43.130.53.168:8080/api/v1'

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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
    if (!spotForm.name || !spotForm.country) return alert('请填写名称和国家')
    try {
      await axios.post(`${API_BASE}/spots`, { ...spotForm, latitude: newCoords.lat, longitude: newCoords.lng, rating: 0, review_count: 0 })
    } catch (e) {}
    setSpots([...spots, { id: Date.now(), ...spotForm, latitude: newCoords.lat, longitude: newCoords.lng, rating: 0, review_count: 0 }])
    setShowAddSpot(false)
    setSpotForm({ name: '', country: '', city: '', category: 'Attraction', description: '' })
    alert('✅ 添加成功！')
  }

  const handlePost = () => {
    if (!postForm.title || !postForm.content) return alert('请填写标题和内容')
    const id = Date.now()
    const lat = newCoords?.lat || 35.8617
    const lng = newCoords?.lng || 104.1954
    
    setPosts(prev => [{ id, ...postForm, author: '我', latitude: lat, longitude: lng, likes: 0, comments: 0 }, ...prev])
    setNewPostId(id)
    setTimeout(() => setNewPostId(null), 5000)
    
    if (mapRef) mapRef.setView([lat, lng], 12)
    
    setShowPost(false)
    setPostForm({ title: '', content: '', type: 'post', location_name: '' })
    setShowList(true) // 自动打开列表
    
    alert(`✅ 发布成功！\n📍 "${postForm.title}"\n已定位到地图位置`)
  }

  const handleLike = (id) => {
    if (likedPosts.has(id)) return alert('已点赞过')
    setLikedPosts(prev => new Set([...prev, id]))
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  const goToPost = (p) => {
    if (mapRef) mapRef.setView([p.latitude, p.longitude], 12)
    setShowList(false)
  }

  const allMarkers = [
    ...spots.map(s => ({ ...s, _type: 'spot' })),
    ...posts.map(p => ({ ...p, _type: p.type || 'post' }))
  ]

  const myPosts = posts.filter(p => p.author === '我')

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 顶部栏 */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: isMobile ? '10px 12px' : '16px 24px',
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, background: '#ff6b35', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📍</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 16 : 20 }}>TapSpot</div>
            {!isMobile && <div style={{ fontSize: 11, color: '#999' }}>发现精彩地点</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowPost(true)} style={{
            padding: isMobile ? '8px 12px' : '10px 20px',
            background: '#ff6b35', color: 'white', border: 'none',
            borderRadius: 20, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Plus size={16} /> {isMobile ? '' : '发帖'}
          </button>
          <button onClick={() => setShowList(!showList)} style={{
            width: 40, height: 40, background: showList ? '#ff6b35' : '#f5f5f5',
            border: 'none', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: showList ? 'white' : '#333'
          }}>
            {showList ? <Close size={18} /> : <List size={18} />}
          </button>
        </div>
      </nav>

      {/* 列表面板 */}
      {showList && (
        <div style={{
          position: 'absolute', top: isMobile ? 56 : 72, left: isMobile ? 0 : 16,
          width: isMobile ? '100%' : 320, maxHeight: isMobile ? '50vh' : 'calc(100vh - 100px)',
          background: 'white', zIndex: 1001,
          borderRadius: isMobile ? 0 : 16,
          boxShadow: isMobile ? '0 -4px 20px rgba(0,0,0,0.15)' : '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 600 }}>
            {isMobile ? '帖子列表' : '我的帖子'} ({myPosts.length > 0 ? myPosts.length : posts.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {(myPosts.length > 0 ? myPosts : posts).map(p => (
              <div key={p.id} onClick={() => goToPost(p)} style={{
                padding: 12, margin: '4px 0', background: p.id === newPostId ? '#fff3e0' : '#f8f8f8',
                borderRadius: 12, cursor: 'pointer',
                border: p.id === newPostId ? '2px solid #ff6b35' : '2px solid transparent'
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {p.id === newPostId && <span style={{ background: '#ff6b35', color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>NEW</span>}
                  {p.author === '我' && <span style={{ color: '#ff6b35' }}>⭐</span>}
                  {p.title}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{p.content.substring(0, 40)}...</div>
                <div style={{ fontSize: 11, color: '#999' }}>📍 {p.location_name || '点击查看'} · ❤️ {p.likes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 地图 */}
      <MapContainer center={[35.8617, 104.1954]} zoom={mapZoom} style={{ width: '100%', height: '100%' }} zoomControl={false} preferCanvas>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents onClick={handleMapClick} onReady={setMapRef} onZoom={setMapZoom} />
        {allMarkers.map(item => (
          <Marker key={`${item._type}-${item.id}`} position={[item.latitude, item.longitude]} icon={createIcon(item._type, item.id === newPostId)}>
            <Popup>
              <div style={{ padding: 12, minWidth: 200 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.id === newPostId && <span style={{ background: '#ff6b35', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>NEW</span>}
                  {item.name || item.title}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 6 }}>📍 {item.location_name || (item.country && `${item.country} ${item.city || ''}`)}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{(item.description || item.content || '').substring(0, 60)}...</div>
                {item._type !== 'spot' && (
                  <button onClick={() => handleLike(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 4, background: likedPosts.has(item.id) ? '#f5f5f5' : 'none',
                    border: 'none', cursor: 'pointer', color: likedPosts.has(item.id) ? '#999' : '#ff6b35'
                  }}>
                    <Heart size={14} fill={likedPosts.has(item.id) ? '#999' : 'none'} /> {item.likes}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 控制按钮 */}
      <div style={{ position: 'absolute', top: isMobile ? 68 : 88, right: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => mapRef?.setZoom(mapZoom + 1)} style={{ width: 44, height: 44, background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><ZoomIn size={20} /></button>
        <button onClick={() => mapRef?.setZoom(mapZoom - 1)} style={{ width: 44, height: 44, background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><ZoomOut size={20} /></button>
        <button onClick={() => mapRef?.setView([35.8617, 104.1954], 4)} style={{ width: 44, height: 44, background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><RotateCw size={20} /></button>
      </div>

      {/* 提示 */}
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'white', padding: '10px 20px', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: 13, color: '#666' }}>
        点击地图添加地点
      </div>

      {/* 发帖弹窗 */}
      {showPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowPost(false)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18 }}>发布帖子</b>
              <button onClick={() => setShowPost(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[{t:'post',l:'📝 日常'},{t:'food',l:'🍜 美食'},{t:'hotel',l:'🏨 住宿'},{t:'shop',l:'🛍️ 购物'}].map(x => (
                  <button key={x.t} onClick={() => setPostForm({...postForm, type: x.t})} style={{flex:1,padding:10,background:postForm.type===x.t?'#ff6b35':'#f5f5f5',border:'none',borderRadius:8,color:postForm.type===x.t?'white':'#333',cursor:'pointer',fontWeight:500}}>{x.l}</button>
                ))}
              </div>
              <input placeholder="标题 *" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 12, fontSize: 14 }} />
              <textarea placeholder="内容 *" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} rows={4} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 12, fontSize: 14, resize: 'none' }} />
              <input placeholder="地点名称" value={postForm.location_name} onChange={e => setPostForm({...postForm, location_name: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 12, fontSize: 14 }} />
              <div style={{ padding: 10, background: '#e8f5e9', borderRadius: 8, fontSize: 12, color: '#2e7d32', marginBottom: 12 }}>
                ✅ 发帖后自动打开列表，方便你找到帖子！
              </div>
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex', gap: 12 }}>
              <button onClick={() => setShowPost(false)} style={{ flex: 1, padding: 12, background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer' }}>取消</button>
              <button onClick={handlePost} style={{ flex: 1, padding: 12, background: '#ff6b35', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>发布</button>
            </div>
          </div>
        </div>
      )}

      {/* 添加地点弹窗 */}
      {showAddSpot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowAddSpot(false)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18 }}>添加地点</b>
              <button onClick={() => setShowAddSpot(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <input placeholder="名称 *" value={spotForm.name} onChange={e => setSpotForm({...spotForm, name: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input placeholder="国家 *" value={spotForm.country} onChange={e => setSpotForm({...spotForm, country: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
                <input placeholder="城市" value={spotForm.city} onChange={e => setSpotForm({...spotForm, city: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8 }} />
              </div>
              <select value={spotForm.category} onChange={e => setSpotForm({...spotForm, category: e.target.value})} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 12 }}>
                <option value="Attraction">景点</option>
                <option value="Restaurant">餐厅</option>
                <option value="Hotel">酒店</option>
                <option value="Shopping">购物</option>
              </select>
              <textarea placeholder="描述" value={spotForm.description} onChange={e => setSpotForm({...spotForm, description: e.target.value})} rows={3} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, resize: 'none' }} />
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #eee', display: 'flex', gap: 12 }}>
              <button onClick={() => setShowAddSpot(false)} style={{ flex: 1, padding: 12, background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer' }}>取消</button>
              <button onClick={handleAddSpot} style={{ flex: 1, padding: 12, background: '#ff6b35', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>添加</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  )
}

export default App