import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Heart, X, Plus, ZoomIn, ZoomOut, Compass, User, LogOut, MapPin, Clock, ChevronRight, Search, Loader2, MessageCircle, Send } from 'lucide-react'
import './styles/modern.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// API 配置
const API_BASE = '/api'

// 配色方案
const COLORS = {
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

const createIcon = (type, isNew = false, isMyPost = false, isHovered = false) => {
  const config = {
    post: { color: '#3b82f6', icon: '📝' },
    food: { color: '#ef4444', icon: '🍜' },
    hotel: { color: '#8b5cf6', icon: '🏨' },
    shop: { color: '#f59e0b', icon: '🛍️' },
  }
  const c = config[type] || config.post
  const borderColor = isMyPost ? COLORS.gold : '#ffffff'
  const baseShadow = isMyPost ? `0 0 20px ${COLORS.gold}` : '0 3px 10px rgba(0,0,0,0.3)'
  const shadow = isHovered ? `0 0 25px ${c.color}, 0 0 40px ${c.color}80` : baseShadow
  const scale = isHovered ? 1.2 : 1
  const transition = 'transition: all 0.2s ease;'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="marker-wrapper" style="
      width: 48px; height: 48px;
      background: linear-gradient(135deg, ${c.color} 0%, ${c.color}dd 100%);
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg) scale(${scale});
      border: 3px solid ${borderColor};
      box-shadow: ${shadow};
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      ${transition}
      ${isNew ? 'animation: bounce 0.6s ease infinite;' : ''}
    ">
      ${isMyPost ? `<div style="position:absolute;top:-10px;right:-10px;width:20px;height:20px;background:${COLORS.gold};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:10;">⭐</div>` : ''}
      <div style="transform: rotate(45deg); font-size: 20px;">${c.icon}</div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
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

// API 请求辅助函数
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('tapspot_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '请求失败')
  return data
}

export default function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('tapspot_token'))
  const [showLogin, setShowLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [isRegister, setIsRegister] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapZoom, setMapZoom] = useState(4)
  const [mapRef, setMapRef] = useState(null)
  const [showPost, setShowPost] = useState(false)
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'post', location_name: '' })
  const [postCoords, setPostCoords] = useState(null)
  const [selectingLocation, setSelectingLocation] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [newPostId, setNewPostId] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPostDetail, setShowPostDetail] = useState(null)
  const [comments, setComments] = useState([])
  const [commentCounts, setCommentCounts] = useState({})
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyTo, setReplyTo] = useState(null) // 回复对象
  const [activeTab, setActiveTab] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [submitting, setSubmitting] = useState(false)

  // 检测移动端
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 获取当前用户
  useEffect(() => {
    if (token) {
      api('/me').then(data => {
        setUser(data.user)
        // 获取用户点赞
        api('/likes/my').then(likeData => {
          setLikedPosts(new Set(likeData.liked))
        }).catch(() => {})
      }).catch(() => {
        localStorage.removeItem('tapspot_token')
        setToken(null)
      })
    }
    setLoading(false)
  }, [token])

  // 获取帖子
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (searchQuery) params.append('search', searchQuery)
      if (activeTab === 'mine' && user) params.append('userId', user.id)
      
      const data = await api(`/posts?${params.toString()}`)
      
      let fetchedPosts = data.posts
      
      // 如果是"喜欢"标签，过滤已点赞的
      if (activeTab === 'liked') {
        fetchedPosts = fetchedPosts.filter(p => likedPosts.has(p.id))
      }
      
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('获取帖子失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filterType, activeTab, user])

  // 获取评论数
  useEffect(() => {
    if (posts.length > 0) {
      const postIds = posts.map(p => p.id).join(',')
      api(`/posts/comments/count?postIds=${postIds}`).then(data => {
        setCommentCounts(data.counts || {})
      }).catch(() => {})
    }
  }, [posts])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab !== 'liked') fetchPosts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 登录
  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      return alert('请填写用户名和密码')
    }
    try {
      const data = await api('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      })
      localStorage.setItem('tapspot_token', data.token)
      setToken(data.token)
      setUser(data.user)
      setShowLogin(false)
      setLoginForm({ username: '', password: '' })
    } catch (error) {
      alert(error.message)
    }
  }

  // 注册
  const handleRegister = async () => {
    if (!loginForm.username || !loginForm.password) {
      return alert('请填写用户名和密码')
    }
    if (loginForm.username.length < 3) return alert('用户名至少3个字符')
    if (loginForm.password.length < 3) return alert('密码至少3个字符')
    
    try {
      const data = await api('/register', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      })
      localStorage.setItem('tapspot_token', data.token)
      setToken(data.token)
      setUser(data.user)
      setShowLogin(false)
      setLoginForm({ username: '', password: '' })
    } catch (error) {
      alert(error.message)
    }
  }

  // 退出
  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('tapspot_token')
    setShowUserMenu(false)
    setActiveTab('all')
    setLikedPosts(new Set())
  }

  // 获取评论
  const fetchComments = async (postId) => {
    setLoadingComments(true)
    try {
      const data = await api(`/posts/${postId}/comments`)
      setComments(data.comments)
    } catch (error) {
      console.error('获取评论失败:', error)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  // 打开帖子详情
  const openPostDetail = (post) => {
    setShowPostDetail(post)
    setComments([])
    setNewComment('')
    setReplyTo(null)
    fetchComments(post.id)
  }

  // 发表评论（支持回复）
  const handleComment = async () => {
    if (!user) { setShowLogin(true); return }
    if (!newComment.trim()) return
    
    setSubmittingComment(true)
    try {
      const body = { content: newComment }
      if (replyTo) {
        body.replyToId = replyTo.id
        body.replyToUser = replyTo.author
      }
      const data = await api(`/posts/${showPostDetail.id}/comments`, {
        method: 'POST',
        body: JSON.stringify(body)
      })
      setComments(prev => [...prev, data.comment])
      setCommentCounts(prev => ({ ...prev, [showPostDetail.id]: (prev[showPostDetail.id] || 0) + 1 }))
      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    if (!user) return
    if (!confirm('确定要删除这条评论吗？')) return
    
    try {
      await api(`/comments/${commentId}`, { method: 'DELETE' })
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (error) {
      alert(error.message)
    }
  }

  // 发布帖子
  const handlePost = async () => {
    if (!user) { setShowLogin(true); return }
    if (!postForm.title || !postForm.content) return alert('请填写标题和内容')
    if (!postCoords) return alert('请在地图上选择位置！')
    
    setSubmitting(true)
    try {
      const data = await api('/posts', {
        method: 'POST',
        body: JSON.stringify({
          ...postForm,
          latitude: postCoords.lat,
          longitude: postCoords.lng
        })
      })
      setNewPostId(data.post.id)
      setTimeout(() => setNewPostId(null), 5000)
      if (mapRef) mapRef.setView([postCoords.lat, postCoords.lng], 12)
      setShowPost(false)
      setPostForm({ title: '', content: '', type: 'post', location_name: '' })
      setPostCoords(null)
      fetchPosts()
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 删除帖子
  const handleDeletePost = async (id) => {
    if (!user) return
    const post = posts.find(p => p.id === id)
    if (post.authorId !== user.id) return
    if (!confirm('确定要删除这篇帖子吗？')) return
    
    try {
      await api(`/posts/${id}`, { method: 'DELETE' })
      fetchPosts()
    } catch (error) {
      alert(error.message)
    }
  }

  // 点赞
  const handleLike = async (id) => {
    if (!user) {
      setShowLogin(true)
      return
    }
    try {
      const data = await api(`/posts/${id}/like`, { method: 'POST' })
      if (data.liked) {
        setLikedPosts(prev => new Set([...prev, id]))
      } else {
        setLikedPosts(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
      fetchPosts()
    } catch (error) {
      console.error(error)
    }
  }

  const formatTime = (timestamp) => {
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

  const myPostsCount = user ? posts.filter(p => p.authorId === user.id).length : 0

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: COLORS.cardBgDark }}>
      
      {/* 侧边栏 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: isMobile ? (showSidebar ? '100%' : 0) : (showSidebar ? 360 : 0),
        background: COLORS.primary,
        zIndex: 1001,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      }}>
        {showSidebar && (
          <>
            {/* 头部 */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${COLORS.border}`,
              background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                    boxShadow: `0 4px 15px ${COLORS.accent}40`,
                  }}>📍</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 20, color: COLORS.text }}>TapSpot</div>
                    <div style={{ fontSize: 11, color: '#888' }}>发现精彩地点</div>
                  </div>
                </div>
                {isMobile && (
                  <button onClick={() => setShowSidebar(false)} style={{
                    background: COLORS.border, border: 'none', borderRadius: 8,
                    width: 32, height: 32, cursor: 'pointer', color: COLORS.text,
                  }}><X size={16} /></button>
                )}
              </div>

              {/* Tab */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[
                  { key: 'all', label: '全部', count: posts.length },
                  { key: 'mine', label: '我的', count: myPostsCount },
                  { key: 'liked', label: '喜欢', count: likedPosts.size },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      if (tab.key !== 'all' && !user) { setShowLogin(true); return }
                      setActiveTab(tab.key)
                    }}
                    style={{
                      flex: 1, padding: '10px 8px',
                      background: activeTab === tab.key ? COLORS.accent : COLORS.cardBgDark,
                      border: 'none', borderRadius: 10, cursor: 'pointer',
                      color: activeTab === tab.key ? '#fff' : '#888',
                      fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                    }}
                  >
                    {tab.label}
                    <span style={{
                      marginLeft: 4, padding: '2px 6px',
                      background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : COLORS.border,
                      borderRadius: 6, fontSize: 11,
                    }}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* 类型筛选 */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: '全部', icon: '🌐' },
                  { key: 'post', label: '日常', icon: '📝' },
                  { key: 'food', label: '美食', icon: '🍜' },
                  { key: 'hotel', label: '住宿', icon: '🏨' },
                  { key: 'shop', label: '购物', icon: '🛍️' },
                ].map(type => (
                  <button
                    key={type.key}
                    onClick={() => setFilterType(type.key)}
                    style={{
                      padding: '6px 10px',
                      background: filterType === type.key ? COLORS.secondary : 'transparent',
                      border: filterType === type.key ? `1px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                      borderRadius: 16, cursor: 'pointer',
                      color: filterType === type.key ? COLORS.accent : '#888',
                      fontSize: 12, transition: 'all 0.2s',
                    }}
                  >{type.icon} {type.label}</button>
                ))}
              </div>
            </div>

            {/* 搜索 */}
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  placeholder="搜索帖子、地点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px',
                    background: COLORS.cardBgDark, border: `1px solid ${COLORS.border}`,
                    borderRadius: 10, color: COLORS.text, fontSize: 14,
                  }}
                />
              </div>
            </div>

            {/* 帖子列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ marginTop: 12 }}>加载中...</div>
                </div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>暂无帖子</div>
                </div>
              ) : (
                posts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => {
                      if (mapRef) mapRef.setView([post.latitude, post.longitude], 12)
                      if (isMobile) setShowSidebar(false)
                    }}
                    style={{
                      background: post.id === newPostId ? `${COLORS.accent}20` : COLORS.cardBgDark,
                      borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer',
                      border: post.id === newPostId ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { if (post.id !== newPostId) e.currentTarget.style.borderColor = COLORS.accent }}
                    onMouseLeave={(e) => { if (post.id !== newPostId) e.currentTarget.style.borderColor = COLORS.border }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        width: 44, height: 44,
                        background: `linear-gradient(135deg, ${post.type === 'food' ? '#ef4444' : post.type === 'hotel' ? '#8b5cf6' : post.type === 'shop' ? '#f59e0b' : '#3b82f6'} 0%, ${post.type === 'food' ? '#dc2626' : post.type === 'hotel' ? '#7c3aed' : post.type === 'shop' ? '#d97706' : '#2563eb'} 100%)`,
                        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                      }}>{post.type === 'food' ? '🍜' : post.type === 'hotel' ? '🏨' : post.type === 'shop' ? '🛍️' : '📝'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          {post.id === newPostId && <span style={{ background: COLORS.accent, color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>NEW</span>}
                          {user && post.authorId === user.id && <span style={{ color: COLORS.gold, fontSize: 12 }}>⭐</span>}
                          <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#888', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#666' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> {post.location_name || '未知地点'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {formatTime(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: `1px solid ${COLORS.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 20, height: 20, background: COLORS.secondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>👤</div>
                        <span style={{ fontSize: 12, color: '#888' }}>{post.author}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={(e) => { e.stopPropagation(); handleLike(post.id) }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: likedPosts.has(post.id) ? COLORS.accent : '#666', fontSize: 12 }}>
                          <Heart size={14} fill={likedPosts.has(post.id) ? COLORS.accent : 'none'} /> {post.likes}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openPostDetail(post) }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 12 }}>
                          <MessageCircle size={14} /> 评论
                        </button>
                        {user && post.authorId === user.id && (
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id) }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 11 }}>🗑️</button>
                        )}
                        <ChevronRight size={16} color="#444" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* 地图 */}
      <div style={{
        position: 'absolute', top: 0,
        left: isMobile ? 0 : (showSidebar ? 360 : 0),
        right: 0, bottom: 0,
        transition: 'left 0.3s ease',
      }}>
        <MapContainer center={[35.8617, 104.1954]} zoom={mapZoom} style={{ width: '100%', height: '100%' }} zoomControl={false}>
          <TileLayer url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}" subdomains="1234" attribution='&copy; 高德地图' maxZoom={18} />
          <MapEvents onClick={(latlng) => { 
            // 只有点击空白区域才新建帖子，点击标记会触发Popup
            if (!selectingLocation) return
            if (user) { setPostCoords(latlng); setShowPost(true) } else { setShowLogin(true) }
          }} onReady={setMapRef} onZoom={setMapZoom} />
          {posts.map(item => (
            <Marker 
              key={`post-${item.id}`} 
              position={[item.latitude, item.longitude]} 
              icon={createIcon(item.type, item.id === newPostId, user && item.authorId === user.id)}
              eventHandlers={{
                click: () => {
                  // 点击标记时，打开详情弹窗（Leaflet会自动打开Popup，这里额外打开详情）
                },
              }}
            >
              <Popup maxWidth={300} minWidth={260}>
                <div style={{ minWidth: 240, maxWidth: 280, padding: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {item.id === newPostId && <span style={{ background: COLORS.accent, color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>NEW</span>}
                    {user && item.authorId === user.id && <span style={{ color: COLORS.gold }}>⭐</span>}
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 6, lineHeight: 1.4 }}>{item.content?.substring(0, 80)}{item.content?.length > 80 ? '...' : ''}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>📍 {item.location_name} · 👤 {item.author}</div>
                  
                  {/* 评论预览 */}
                  {commentCounts[item.id] > 0 && (
                    <div style={{ background: '#f8f8f8', borderRadius: 6, padding: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>💬 {commentCounts[item.id]} 条评论</div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => handleLike(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: likedPosts.has(item.id) ? `${COLORS.accent}20` : '#f5f5f5', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: likedPosts.has(item.id) ? COLORS.accent : '#666', fontSize: 12 }}>
                      <Heart size={14} fill={likedPosts.has(item.id) ? COLORS.accent : 'none'} /> {item.likes}
                    </button>
                    <button onClick={() => openPostDetail(item)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f5f5f5', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#666', fontSize: 12 }}>
                      <MessageCircle size={14} /> {commentCounts[item.id] || 0} 评论
                    </button>
                    <button onClick={() => { setPostCoords({ lat: item.latitude, lng: item.longitude }); setPostForm({ title: '', content: '', type: item.type, location_name: item.location_name }); setShowPost(true) }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>
                      <Plus size={14} /> 在此发帖
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 工具栏 */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ width: 44, height: 44, background: COLORS.cardBg, border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textDark} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
          </button>
          <div style={{ flex: 1 }} />
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ padding: '8px 14px', background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, boxShadow: `0 4px 15px ${COLORS.accent}40` }}>
                <User size={16} />
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nickname}</span>
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: COLORS.cardBg, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: 160, overflow: 'hidden', zIndex: 1002 }}>
                  <div style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: '#666' }}>@{user.username}</div>
                  <button onClick={handleLogout} style={{ width: '100%', padding: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.accent, fontSize: 13 }}><LogOut size={16} /> 退出登录</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ padding: '10px 18px', background: COLORS.cardBg, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textDark, fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><User size={16} /> 登录</button>
          )}
          <button onClick={() => { if (!user) { setShowLogin(true); return }; setShowPost(true) }} style={{ padding: '10px 18px', background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, boxShadow: `0 4px 15px ${COLORS.accent}40` }}><Plus size={18} /> 发帖</button>
        </div>

        {/* 缩放控制 */}
        <div style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => mapRef?.setZoom(mapZoom + 1)} style={{ width: 40, height: 40, background: COLORS.cardBg, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomIn size={18} color={COLORS.textDark} /></button>
          <button onClick={() => mapRef?.setZoom(mapZoom - 1)} style={{ width: 40, height: 40, background: COLORS.cardBg, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomOut size={18} color={COLORS.textDark} /></button>
          <button onClick={() => mapRef?.setView([35.8617, 104.1954], 4)} style={{ width: 40, height: 40, background: COLORS.cardBg, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Compass size={18} color={COLORS.textDark} /></button>
        </div>

        {/* 底部提示 */}
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: COLORS.cardBg, padding: '10px 20px', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: 13, color: '#666', zIndex: 1000 }}>📍 点击地图添加新地点</div>
      </div>

      {/* 登录弹窗 */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowLogin(false)}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 340, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18, color: COLORS.textDark }}>{isRegister ? '注册账号' : '登录'}</b>
              <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <input placeholder="用户名" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} />
              <input type="password" placeholder="密码" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} />
              {!isRegister && <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 12, color: '#1565c0' }}>🔑 测试账号: <b>root</b> / <b>root</b></div>}
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={isRegister ? handleRegister : handleLogin} style={{ width: '100%', padding: 14, background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>{isRegister ? '注册' : '登录'}</button>
              <button onClick={() => setIsRegister(!isRegister)} style={{ width: '100%', padding: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13 }}>{isRegister ? '已有账号？去登录' : '没有账号？去注册'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 发帖弹窗 */}
      {showPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => { setShowPost(false); setPostCoords(null) }}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18, color: COLORS.textDark }}>发布帖子</b>
              <button onClick={() => { setShowPost(false); setPostCoords(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[{ type: 'post', label: '📝 日常' }, { type: 'food', label: '🍜 美食' }, { type: 'hotel', label: '🏨 住宿' }, { type: 'shop', label: '🛍️ 购物' }].map(item => (
                  <button key={item.type} onClick={() => setPostForm({ ...postForm, type: item.type })} style={{ padding: '10px 16px', background: postForm.type === item.type ? `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)` : '#f5f5f5', border: 'none', borderRadius: 10, color: postForm.type === item.type ? 'white' : '#666', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>{item.label}</button>
                ))}
              </div>
              <input placeholder="标题 *" value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} />
              <textarea placeholder="分享你的发现... *" value={postForm.content} onChange={e => setPostForm({ ...postForm, content: e.target.value })} rows={4} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, resize: 'none', boxSizing: 'border-box' }} />
              <input placeholder="地点名称（如：北京故宫）" value={postForm.location_name} onChange={e => setPostForm({ ...postForm, location_name: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} />
              
              {/* 位置选择区域 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setPostCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                          if (mapRef) mapRef.setView([pos.coords.latitude, pos.coords.longitude], 14)
                        },
                        (err) => {
                          alert('获取位置失败: ' + err.message + '\n请允许浏览器访问您的位置')
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                      )
                    } else {
                      alert('您的浏览器不支持定位功能')
                    }
                  }}
                  style={{ 
                    flex: 1, padding: 12, 
                    background: '#e3f2fd', 
                    border: '2px solid #2196f3', 
                    borderRadius: 10, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6 
                  }}
                >
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span style={{ color: '#1565c0', fontWeight: 500, fontSize: 13 }}>获取我的位置</span>
                </button>
                <button 
                  onClick={() => { setShowPost(false); setSelectingLocation(true) }} 
                  style={{ 
                    flex: 1, padding: 12, 
                    background: '#fff3e0', 
                    border: '2px dashed #ff9800', 
                    borderRadius: 10, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6 
                  }}
                >
                  <MapPin size={16} color="#ff9800" />
                  <span style={{ color: '#e65100', fontWeight: 500, fontSize: 13 }}>地图选点</span>
                </button>
              </div>
              
              {/* 已选位置显示 */}
              {postCoords && (
                <div style={{ padding: 12, background: '#e8f5e9', border: `2px solid ${COLORS.success}`, borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.success, fontWeight: 500 }}>已选择位置</div>
                      <div style={{ fontSize: 11, color: '#666' }}>{postCoords.lat.toFixed(6)}, {postCoords.lng.toFixed(6)}</div>
                    </div>
                  </div>
                  <button onClick={() => setPostCoords(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={16} /></button>
                </div>
              )}
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPost(false); setPostCoords(null); setPostForm({ title: '', content: '', type: 'post', location_name: '' }) }} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>取消</button>
              <button onClick={handlePost} disabled={!postCoords || submitting} style={{ flex: 1, padding: 14, background: postCoords ? `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)` : '#ccc', color: 'white', border: 'none', borderRadius: 10, cursor: postCoords && !submitting ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: 14, opacity: submitting ? 0.7 : 1 }}>{submitting ? '发布中...' : '发布'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 选择位置提示 */}
      {selectingLocation && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, color: 'white', padding: '14px 28px', borderRadius: 30, boxShadow: `0 4px 20px ${COLORS.accent}60`, fontSize: 15, fontWeight: 500, zIndex: 2001, display: 'flex', alignItems: 'center', gap: 10 }}>
          <MapPin size={20} /> 点击地图选择位置
          <button onClick={() => setSelectingLocation(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'white', fontSize: 12 }}>取消</button>
        </div>
      )}

      {/* 帖子详情弹窗（评论） */}
      {showPostDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowPostDetail(null)}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            {/* 帖子内容 */}
            <div style={{ padding: 20, borderBottom: `1px solid #eee` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${showPostDetail.type === 'food' ? '#ef4444' : showPostDetail.type === 'hotel' ? '#8b5cf6' : showPostDetail.type === 'shop' ? '#f59e0b' : '#3b82f6'} 0%, ${showPostDetail.type === 'food' ? '#dc2626' : showPostDetail.type === 'hotel' ? '#7c3aed' : showPostDetail.type === 'shop' ? '#d97706' : '#2563eb'} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {showPostDetail.type === 'food' ? '🍜' : showPostDetail.type === 'hotel' ? '🏨' : showPostDetail.type === 'shop' ? '🛍️' : '📝'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.textDark }}>{showPostDetail.title}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>@{showPostDetail.author} · {formatTime(showPostDetail.createdAt)}</div>
                  </div>
                </div>
                <button onClick={() => setShowPostDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
              </div>
              <div style={{ fontSize: 14, color: '#333', lineHeight: 1.6, marginBottom: 12 }}>{showPostDetail.content}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#888' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {showPostDetail.location_name || '未知地点'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => handleLike(showPostDetail.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: likedPosts.has(showPostDetail.id) ? COLORS.accent : '#888', fontSize: 12 }}>
                    <Heart size={14} fill={likedPosts.has(showPostDetail.id) ? COLORS.accent : 'none'} /> {showPostDetail.likes}
                  </button>
                </span>
              </div>
            </div>
            
            {/* 评论区 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', background: '#fafafa' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#333' }}>
                💬 评论 ({comments.length})
              </div>
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 13 }}>
                  暂无评论，来说点什么吧~
                </div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 24, height: 24, background: COLORS.secondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>👤</div>
                        <span style={{ fontWeight: 500, fontSize: 13, color: COLORS.textDark }}>{comment.author}</span>
                        <span style={{ fontSize: 11, color: '#aaa' }}>{formatTime(comment.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {user && (
                          <button onClick={() => setReplyTo({ id: comment.id, author: comment.author })} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11 }}>回复</button>
                        )}
                        {user && comment.authorId === user.id && (
                          <button onClick={() => handleDeleteComment(comment.id)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 11 }}>🗑️</button>
                        )}
                      </div>
                    </div>
                    {/* 回复提示 */}
                    {comment.replyToUser && (
                      <div style={{ fontSize: 11, color: '#888', paddingLeft: 32, marginBottom: 2 }}>
                        ↩️ 回复 <span style={{ color: COLORS.accent }}>@{comment.replyToUser}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: '#333', paddingLeft: 32 }}>{comment.content}</div>
                  </div>
                ))
              )}
            </div>
            
            {/* 发表评论 */}
            <div style={{ padding: 16, borderTop: `1px solid #eee`, background: 'white' }}>
              {/* 回复提示 */}
              {replyTo && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f5', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>↩️ 回复 <span style={{ color: COLORS.accent, fontWeight: 500 }}>@{replyTo.author}</span></span>
                  <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><X size={14} /></button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder={user ? (replyTo ? `回复 @${replyTo.author}...` : "发表评论...") : "登录后发表评论"}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={!user}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
                  style={{ flex: 1, padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 14 }}
                />
                <button
                  onClick={handleComment}
                  disabled={!user || !newComment.trim() || submittingComment}
                  style={{
                    padding: '12px 16px',
                    background: user && newComment.trim() && !submittingComment ? `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)` : '#ccc',
                    border: 'none', borderRadius: 10, cursor: user && newComment.trim() && !submittingComment ? 'pointer' : 'not-allowed',
                    color: 'white', display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  {submittingComment ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%, 100% { transform: rotate(-45deg) translateY(0); } 50% { transform: rotate(-45deg) translateY(-8px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 10px currentColor; } 50% { box-shadow: 0 0 25px currentColor, 0 0 40px currentColor; } }
        
        .leaflet-popup-content-wrapper { border-radius: 12px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important; }
        .leaflet-popup-content { margin: 0 !important; }
        
        /* 标记悬停效果 */
        .custom-marker { 
          cursor: pointer !important; 
          transition: all 0.2s ease;
        }
        .custom-marker:hover .marker-wrapper {
          transform: rotate(-45deg) scale(1.25) !important;
          filter: brightness(1.2);
        }
        .custom-marker:hover .marker-wrapper::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(233,69,96,0.3) 0%, transparent 70%);
          animation: pulse-glow 1s ease infinite;
        }
        
        /* 增大点击区域 */
        .leaflet-marker-icon {
          width: 60px !important;
          height: 60px !important;
          margin-left: -12px !important;
          margin-top: -12px !important;
        }
        
        /* 标记悬停高亮效果 */
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-marker:hover .marker-wrapper,
        .leaflet-marker-icon:hover .marker-wrapper {
          transform: rotate(-45deg) scale(1.3) !important;
          box-shadow: 0 0 30px currentColor, 0 0 50px rgba(233, 69, 96, 0.5) !important;
          z-index: 1000 !important;
        }
        .leaflet-marker-icon {
          cursor: pointer !important;
        }
        .leaflet-marker-icon:hover {
          z-index: 1000 !important;
        }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.accent}; }
      `}</style>
    </div>
  )
}