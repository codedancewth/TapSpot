import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, X, Plus, ZoomIn, ZoomOut, RotateCw, Heart, List, MapPin, User, LogOut, LogIn } from 'lucide-react'
import './styles/modern.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createIcon = (type, isNew = false, isMyPost = false) => {
  const config = {
    spot: { color: '#ff6b35', icon: '📍' },
    post: { color: '#004e89', icon: '📝' },
    food: { color: '#e74c3c', icon: '🍜' },
    hotel: { color: '#9b59b6', icon: '🏨' },
    shop: { color: '#3498db', icon: '🛍️' }
  }
  const c = config[type] || config.spot
  const borderColor = isMyPost ? '#ffd700' : 'white'
  const shadow = isMyPost ? '0 0 15px #ffd700' : '0 2px 8px rgba(0,0,0,0.3)'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:40px;height:40px;background:${c.color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid ${borderColor};${isNew ? 'animation:pulse 1s infinite;' : ''}box-shadow:${shadow};display:flex;align-items:center;justify-content:center;">${isMyPost ? '<div style="position:absolute;top:-8px;right:-8px;width:16px;height:16px;background:#ffd700;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;">⭐</div>' : ''}<div style="transform:rotate(45deg);font-size:16px;">${c.icon}</div></div>`,
    iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
  })
}

function MapEvents({ onClick, onReady, onZoom }) {
  const map = useMap()
  useEffect(() => { if (onReady) onReady(map) }, [map, onReady])
  useMapEvents({ click: (e) => { if (onClick) onClick(e.latlng) }, zoomend: () => { if (onZoom) onZoom(map.getZoom()) } })
  return null
}

export default function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [isRegister, setIsRegister] = useState(false)
  const [spots, setSpots] = useState([])
  const [posts, setPosts] = useState([
    { id: 1, title: '故宫打卡', content: '太美了！推荐大家来北京一定要去故宫参观', type: 'post', author: '旅行者小王', authorId: null, latitude: 39.9163, longitude: 116.3972, location_name: '故宫博物院', likes: 128 },
    { id: 2, title: '重庆火锅绝了', content: '正宗重庆味！辣得过瘾', type: 'food', author: '美食家小李', authorId: null, latitude: 29.5630, longitude: 106.5516, location_name: '重庆市', likes: 256 },
    { id: 3, title: '外滩夜景太美了', content: '夜景绝美！推荐晚上来拍照打卡', type: 'post', author: '摄影师小张', authorId: null, latitude: 31.2397, longitude: 121.4909, location_name: '上海外滩', likes: 512 },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [showPost, setShowPost] = useState(false)
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'post', location_name: '' })
  const [postCoords, setPostCoords] = useState(null)
  const [selectingLocation, setSelectingLocation] = useState(false)
  const [showList, setShowList] = useState(false)
  const [newPostId, setNewPostId] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [showUserMenu, setShowUserMenu] = useState(false)

  // 初始化
  useEffect(() => {
    const savedUser = localStorage.getItem('tapspot_user')
    if (savedUser) setUser(JSON.parse(savedUser))
    const savedPosts = localStorage.getItem('tapspot_posts')
    if (savedPosts) setPosts(prev => [...JSON.parse(savedPosts), ...prev.filter(p => p.id > 3)])
    const savedLikes = localStorage.getItem('tapspot_likes')
    if (savedLikes) setLikedPosts(new Set(JSON.parse(savedLikes)))
  }, [])

  useEffect(() => { localStorage.setItem('tapspot_posts', JSON.stringify(posts.filter(p => p.authorId))) }, [posts])
  useEffect(() => { localStorage.setItem('tapspot_likes', JSON.stringify([...likedPosts])) }, [likedPosts])
  useEffect(() => { const check = () => setIsMobile(window.innerWidth < 768); check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check) }, [])

  // 登录
  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) return alert('请填写用户名和密码')
    if (loginForm.username === 'root' && loginForm.password === 'root') {
      const rootUser = { id: 1, username: 'root', nickname: '管理员' }
      setUser(rootUser); localStorage.setItem('tapspot_user', JSON.stringify(rootUser))
      setShowLogin(false); setLoginForm({ username: '', password: '' })
      return alert('✅ 登录成功！欢迎，管理员')
    }
    const users = JSON.parse(localStorage.getItem('tapspot_users') || '[]')
    const foundUser = users.find(u => u.username === loginForm.username && u.password === loginForm.password)
    if (foundUser) {
      setUser(foundUser); localStorage.setItem('tapspot_user', JSON.stringify(foundUser))
      setShowLogin(false); setLoginForm({ username: '', password: '' })
      alert(`✅ 登录成功！欢迎，${foundUser.nickname}`)
    } else { alert('用户名或密码错误') }
  }

  // 注册
  const handleRegister = () => {
    if (!loginForm.username || !loginForm.password) return alert('请填写用户名和密码')
    if (loginForm.username.length < 3) return alert('用户名至少3个字符')
    if (loginForm.password.length < 3) return alert('密码至少3个字符')
    const users = JSON.parse(localStorage.getItem('tapspot_users') || '[]')
    if (users.find(u => u.username === loginForm.username)) return alert('用户名已存在')
    const newUser = { id: Date.now(), username: loginForm.username, password: loginForm.password, nickname: loginForm.username }
    users.push(newUser); localStorage.setItem('tapspot_users', JSON.stringify(users))
    setUser(newUser); localStorage.setItem('tapspot_user', JSON.stringify(newUser))
    setShowLogin(false); setLoginForm({ username: '', password: '' })
    alert(`✅ 注册成功！欢迎，${newUser.nickname}`)
  }

  const handleLogout = () => { setUser(null); localStorage.removeItem('tapspot_user'); setShowUserMenu(false) }

  const handlePost = () => {
    if (!user) { alert('请先登录！'); setShowLogin(true); return }
    if (!postForm.title || !postForm.content) return alert('请填写标题和内容')
    if (!postCoords) return alert('请在地图上选择位置！')
    const id = Date.now()
    setPosts(prev => [{ id, ...postForm, author: user.nickname, authorId: user.id, latitude: postCoords.lat, longitude: postCoords.lng, likes: 0 }, ...prev])
    setNewPostId(id); setTimeout(() => setNewPostId(null), 5000)
    if (mapRef) mapRef.setView([postCoords.lat, postCoords.lng], 14)
    setShowPost(false); setPostForm({ title: '', content: '', type: 'post', location_name: '' }); setPostCoords(null); setShowList(true)
    alert(`✅ 发布成功！\n📍 ${postForm.title}`)
  }

  const handleLike = (id) => {
    if (likedPosts.has(id)) return
    setLikedPosts(prev => new Set([...prev, id]))
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) { setSearchResults([]); return }
    const q = query.toLowerCase()
    setSearchResults([...posts.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)).map(p => ({ ...p, _type: 'post' })), ...spots.filter(s => (s.name || '').toLowerCase().includes(q)).map(s => ({ ...s, _type: 'spot' }))])
  }

  const allMarkers = [...spots.map(s => ({ ...s, _type: 'spot' })), ...posts.map(p => ({ ...p, _type: p.type || 'post', isMyPost: user && p.authorId === user.id }))]
  const myPosts = user ? posts.filter(p => p.authorId === user.id) : []

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 顶部栏 */}
      <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, padding: isMobile ? '10px 12px' : '12px 20px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#ff6b35', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📍</div>
          <div><div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 18 }}>TapSpot</div>{!isMobile && <div style={{ fontSize: 10, color: '#999' }}>发现精彩地点</div>}</div>
        </div>
        <div style={{ flex: 1, maxWidth: isMobile ? 80 : 200, margin: '0 10px', position: 'relative' }}>
          <input placeholder="搜索..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onFocus={() => setShowSearch(true)} style={{ width: '100%', padding: isMobile ? '6px 10px' : '8px 14px', border: '1px solid #ddd', borderRadius: 16, fontSize: 13, background: '#f5f5f5' }} />
          {showSearch && searchQuery && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', marginTop: 4, maxHeight: 250, overflowY: 'auto', zIndex: 1002 }}>
              {searchResults.length > 0 ? searchResults.map(item => (
                <div key={`${item._type}-${item.id}`} onClick={() => { if (mapRef) mapRef.setView([item.latitude, item.longitude], 12); setShowSearch(false); setSearchQuery('') }} style={{ padding: 10, borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item._type === 'post' ? '📝' : '📍'} {item.title || item.name}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>{item.location_name}</div>
                </div>
              )) : <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>未找到</div>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ padding: '6px 12px', background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={14} color="#4caf50" /><span style={{ fontWeight: 500, color: '#4caf50', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nickname}</span>
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'white', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', minWidth: 120, zIndex: 1003, overflow: 'hidden' }}>
                  <div style={{ padding: 10, borderBottom: '1px solid #eee', fontSize: 11, color: '#666' }}>@{user.username}</div>
                  <button onClick={handleLogout} style={{ width: '100%', padding: 10, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#e74c3c' }}><LogOut size={14} /> 退出登录</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ padding: '6px 12px', background: '#f5f5f5', border: 'none', borderRadius: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><LogIn size={14} />{!isMobile && <span style={{ fontSize: 13 }}>登录</span>}</button>
          )}
          <button onClick={() => { if (!user) { alert('请先登录！'); setShowLogin(true); return } setShowPost(true) }} style={{ padding: '6px 12px', background: '#ff6b35', color: 'white', border: 'none', borderRadius: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={14} />{!isMobile && '发帖'}</button>
          <button onClick={() => setShowList(!showList)} style={{ width: 32, height: 32, background: showList ? '#ff6b35' : '#f5f5f5', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showList ? 'white' : '#333' }}>{showList ? <X size={14} /> : <List size={14} />}</button>
        </div>
      </nav>

      {/* 列表面板 */}
      {showList && (
        <div style={{ position: 'absolute', top: isMobile ? 48 : 56, left: isMobile ? 0 : 12, width: isMobile ? '100%' : 280, maxHeight: isMobile ? '45vh' : 'calc(100vh - 80px)', background: 'white', zIndex: 1001, borderRadius: isMobile ? 0 : 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span>{user ? `我的帖子 (${myPosts.length})` : `全部帖子 (${posts.length})`}</span>
            {user && myPosts.length > 0 && <span style={{ fontSize: 10, color: '#4caf50' }}>⭐ 金色标记</span>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
            {(user && myPosts.length > 0 ? myPosts : posts).map(p => (
              <div key={p.id} onClick={() => { if (mapRef) mapRef.setView([p.latitude, p.longitude], 14); setShowList(false) }} style={{ padding: 8, margin: '3px 0', background: p.id === newPostId ? '#fff3e0' : '#f8f8f8', borderRadius: 8, cursor: 'pointer', border: p.id === newPostId ? '2px solid #ff6b35' : '2px solid transparent' }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {p.id === newPostId && <span style={{ background: '#ff6b35', color: 'white', padding: '1px 4px', borderRadius: 3, fontSize: 9 }}>NEW</span>}
                  {user && p.authorId === user.id && <span style={{ color: '#ffd700' }}>⭐</span>}
                  {p.title}
                </div>
                <div style={{ fontSize: 10, color: '#666', marginBottom: 3 }}>{p.content.substring(0, 30)}...</div>
                <div style={{ fontSize: 9, color: '#999' }}>📍 {p.location_name || '点击查看'} · by {p.author} · ❤️ {p.likes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 地图 */}
      <MapContainer center={[35.8617, 104.1954]} zoom={mapZoom} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <TileLayer 
          url="/tiles/{z}/{x}/{y}.png"
          attribution='&copy; 高德地图 (本地缓存)'
          maxZoom={10}
          keepBuffer={20}
        />
        <MapEvents onClick={(latlng) => { 
          if (selectingLocation) { 
            setPostCoords(latlng); 
            setSelectingLocation(false); 
            setShowPost(true); 
            return; 
          }
          // 普通点击地图 - 弹出发帖框选位置
          if (user) {
            setPostCoords(latlng);
            setShowPost(true);
          } else {
            alert('请先登录！');
            setShowLogin(true);
          }
        }} onReady={setMapRef} onZoom={setMapZoom} />
        {allMarkers.map(item => (
          <Marker key={`${item._type}-${item.id}`} position={[item.latitude, item.longitude]} icon={createIcon(item._type, item.id === newPostId, item.isMyPost)}>
            <Popup>
              <div style={{ padding: 8, minWidth: 160 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {item.id === newPostId && <span style={{ background: '#ff6b35', color: 'white', padding: '1px 4px', borderRadius: 3, fontSize: 9 }}>NEW</span>}
                  {item.isMyPost && <span style={{ color: '#ffd700' }}>⭐ 我的</span>}
                  {item.title || item.name}
                </div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 3 }}>👤 {item.author || '匿名'}</div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 3 }}>📍 {item.location_name}</div>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 5 }}>{(item.content || '').substring(0, 40)}...</div>
                {item._type !== 'spot' && (
                  <button onClick={() => handleLike(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: likedPosts.has(item.id) ? '#999' : '#ff6b35', fontSize: 11 }}>
                    <Heart size={12} fill={likedPosts.has(item.id) ? '#999' : 'none'} /> {item.likes}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 控制按钮 */}
      <div style={{ position: 'absolute', top: isMobile ? 58 : 68, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={() => mapRef?.setZoom(mapZoom + 1)} style={{ width: 36, height: 36, background: 'white', border: 'none', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><ZoomIn size={16} /></button>
        <button onClick={() => mapRef?.setZoom(mapZoom - 1)} style={{ width: 36, height: 36, background: 'white', border: 'none', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><ZoomOut size={16} /></button>
        <button onClick={() => mapRef?.setView([35.8617, 104.1954], 4)} style={{ width: 36, height: 36, background: 'white', border: 'none', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><RotateCw size={16} /></button>
      </div>

      {/* 提示 */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: selectingLocation ? '#ff6b35' : 'white', color: selectingLocation ? 'white' : '#666', padding: '8px 16px', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: 12 }}>
        {selectingLocation ? '📍 点击地图选择位置' : '点击地图添加地点'}
      </div>

      {/* 登录弹窗 */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowLogin(false)}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 320, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 14, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 16 }}>{isRegister ? '注册账号' : '登录'}</b>
              <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 14 }}>
              <input placeholder="用户名" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, marginBottom: 10, fontSize: 14 }} />
              <input type="password" placeholder="密码" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, marginBottom: 10, fontSize: 14 }} />
              {!isRegister && <div style={{ padding: 8, background: '#e3f2fd', borderRadius: 6, fontSize: 11, color: '#1565c0', marginBottom: 10 }}>🔑 测试账号: root / root</div>}
            </div>
            <div style={{ padding: 14, borderTop: '1px solid #eee' }}>
              <button onClick={isRegister ? handleRegister : handleLogin} style={{ width: '100%', padding: 10, background: '#ff6b35', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>{isRegister ? '注册' : '登录'}</button>
              <button onClick={() => setIsRegister(!isRegister)} style={{ width: '100%', padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 12 }}>{isRegister ? '已有账号？去登录' : '没有账号？去注册'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 发帖弹窗 */}
      {showPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => { setShowPost(false); setSelectingLocation(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 360, maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 14, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 16 }}>发布帖子</b>
              <button onClick={() => { setShowPost(false); setPostCoords(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {[{t:'post',l:'📝 日常'},{t:'food',l:'🍜 美食'},{t:'hotel',l:'🏨 住宿'},{t:'shop',l:'🛍️ 购物'}].map(x => (
                  <button key={x.t} onClick={() => setPostForm({...postForm, type: x.t})} style={{padding:8,background:postForm.type===x.t?'#ff6b35':'#f5f5f5',border:'none',borderRadius:6,color:postForm.type===x.t?'white':'#333',cursor:'pointer',fontWeight:500,fontSize:11}}>{x.l}</button>
                ))}
              </div>
              <input placeholder="标题 *" value={postForm.title} onChange={e => setPostForm({...postForm, title: e.target.value})} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, marginBottom: 8, fontSize: 14 }} />
              <textarea placeholder="内容 *" value={postForm.content} onChange={e => setPostForm({...postForm, content: e.target.value})} rows={3} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, marginBottom: 8, fontSize: 14, resize: 'none' }} />
              <input placeholder="地点名称" value={postForm.location_name} onChange={e => setPostForm({...postForm, location_name: e.target.value})} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8, marginBottom: 8, fontSize: 14 }} />
              <button onClick={() => { setShowPost(false); setSelectingLocation(true) }} style={{ width: '100%', padding: 10, background: postCoords ? '#e8f5e9' : '#fff3e0', border: postCoords ? '2px solid #4caf50' : '2px dashed #ff6b35', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <MapPin size={16} color={postCoords ? '#4caf50' : '#ff6b35'} />
                <span style={{ color: postCoords ? '#4caf50' : '#ff6b35', fontWeight: 500, fontSize: 13 }}>{postCoords ? `✅ ${postCoords.lat.toFixed(4)}, ${postCoords.lng.toFixed(4)}` : '📍 点击选择地图位置（必选）'}</span>
              </button>
              <div style={{ padding: 8, background: '#e3f2fd', borderRadius: 6, fontSize: 10, color: '#1565c0' }}>💡 点击上方按钮 → 在地图上选位置 → 自动返回发帖</div>
            </div>
            <div style={{ padding: 14, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowPost(false); setPostCoords(null); setPostForm({ title: '', content: '', type: 'post', location_name: '' }) }} style={{ flex: 1, padding: 10, background: '#f5f5f5', border: 'none', borderRadius: 8, cursor: 'pointer' }}>取消</button>
              <button onClick={handlePost} style={{ flex: 1, padding: 10, background: postCoords ? '#ff6b35' : '#ccc', color: 'white', border: 'none', borderRadius: 8, cursor: postCoords ? 'pointer' : 'not-allowed', fontWeight: 600 }}>发布</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
    </div>
  )
}
