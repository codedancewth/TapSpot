import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Heart, X, Plus, ZoomIn, ZoomOut, Compass, User, LogOut, MapPin, Clock, ChevronRight, Search, Loader2, MessageCircle, Send, Mail } from 'lucide-react'
import './styles/modern.css'
import { MessageCenter } from './components/Chat/MessageCenter.jsx'
import AIAssistant from './components/AIAssistant.jsx'
import TextSelectionAI from './components/TextSelectionAI.jsx'

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

const createIcon = (type, isNew = false, isMyPost = false, zoom = 10) => {
  // 单色调亮眼配色 - 饱和度高、视觉舒服
  // 打卡图标 - 专业设计，直观易懂（参考阿里iconfont）
  const config = {
    post: { 
      color: '#3b82f6',       // 明亮蓝
      glowColor: 'rgba(59,130,246,0.4)',
      // 定位针图标 - 打卡地标感
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
    },
    food: { 
      color: '#f97316',       // 明亮橙
      glowColor: 'rgba(249,115,22,0.4)',
      // 叉子勺子图标 - 美食更直观
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>`
    },
    hotel: {
      color: '#8b5cf6',
      glowColor: 'rgba(139,92,246,0.4)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>`
    },
    shop: {
      color: '#ec4899',
      glowColor: 'rgba(236,72,153,0.4)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>`
    },
    scenic: {
      color: '#10b981',
      glowColor: 'rgba(16,185,129,0.4)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v2"></path><path d="M12 3v2"></path><path d="M16 3v2"></path><path d="M3 8h18"></path><path d="M4 11h16"></path><path d="M5 14h14"></path><path d="M6 17h12"></path><path d="M7 20h10"></path></svg>`
    },
    transport: {
      color: '#06b6d4',
      glowColor: 'rgba(6,182,212,0.4)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-1.5-3.4C16.1 5.6 15.1 5 14 5H10c-1.1 0-2.1.6-2.5 1.6L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>`
    },
    entertainment: {
      color: '#f59e0b',
      glowColor: 'rgba(245,158,11,0.4)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>`
    },
    work: {
      color: '#6366f1',
      glowColor: 'rgba(99,102,241,0.4)',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
    },
  }
  const c = config[type] || config.post
  
  // 根据缩放级别计算大小
  let size, iconSize, starSize
  if (zoom <= 4) { size = 26; iconSize = 12; starSize = 12 }
  else if (zoom <= 8) { size = 34; iconSize = 14; starSize = 14 }
  else { size = 44; iconSize = 16; starSize = 16 }
  
  // 我的帖子用金色边框+金色光晕，普通帖子用白色边框+同色光晕
  const border = '3px solid white'
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

// 获取帖子类型配置
const getTypeConfig = (type) => {
  const configs = {
    post: { color: '#3b82f6', colorDark: '#2563eb', icon: '📍' },
    food: { color: '#f97316', colorDark: '#ea580c', icon: '🍽️' },
    hotel: { color: '#8b5cf6', colorDark: '#7c3aed', icon: '🏨' },
    shop: { color: '#ec4899', colorDark: '#db2777', icon: '🛍️' },
    scenic: { color: '#10b981', colorDark: '#059669', icon: '🏞️' },
    transport: { color: '#06b6d4', colorDark: '#0891b2', icon: '🚗' },
    entertainment: { color: '#f59e0b', colorDark: '#d97706', icon: '🎭' },
    work: { color: '#6366f1', colorDark: '#4f46e5', icon: '💼' },
  }
  return configs[type] || configs.post
}

function MapEvents({ onClick, onReady, onZoom, onMouseMove }) {
  const map = useMap()
  useEffect(() => { if (onReady) onReady(map) }, [map, onReady])
  useMapEvents({
    click: (e) => { 
      // 传递原始事件，用于判断点击目标
      if (onClick) onClick(e.latlng, e.originalEvent) 
    },
    zoomend: () => { if (onZoom) onZoom(map.getZoom()) },
    mousemove: (e) => { if (onMouseMove) onMouseMove(e.latlng) },
    mouseout: () => { if (onMouseMove) onMouseMove(null) }
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
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', password_conf: '', nickname: '', gender: 'male', bio: '', email: '', phone: '' })
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
  const [searchType, setSearchType] = useState('posts') // 'posts' | 'users'
  const [userSearchResults, setUserSearchResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingUserPosts, setLoadingUserPosts] = useState(false)
  const [comments, setComments] = useState([])
  const [commentCounts, setCommentCounts] = useState({})
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyTo, setReplyTo] = useState(null) // 回复对象
  const [likedComments, setLikedComments] = useState(new Set()) // 评论点赞状态
  const [bestComment, setBestComment] = useState(null) // 最佳评论（PK胜出者）
  const [pkResult, setPkResult] = useState(null) // PK结果
  const [activeTab, setActiveTab] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [mouseCoords, setMouseCoords] = useState(null) // 鼠标经纬度
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // 删除确认弹框 { id, type: 'post'|'comment' }
  const [deleting, setDeleting] = useState(false) // 删除中状态
  const [showUserProfile, setShowUserProfile] = useState(false) // 编辑个人资料弹窗
  const [profileForm, setProfileForm] = useState({ nickname: '', gender: 'secret', bio: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [showUserSpace, setShowUserSpace] = useState(null) // 查看用户空间 { user, posts }
  const [loadingUserSpace, setLoadingUserSpace] = useState(false)
  
  // AI 分析相关状态
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [locationTitle, setLocationTitle] = useState('')

  // 聊天相关状态
  const [conversations, setConversations] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [initialChatPeer, setInitialChatPeer] = useState(null) // 初始聊天对象 { id, name }
  const [activeConversation, setActiveConversation] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newChatMessage, setNewChatMessage] = useState('')
  const [wsConnected, setWsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef(null)
  const chatEndRef = useRef(null)
  const activeConversationRef = useRef(null) // 用于 WebSocket 回调中获取当前会话

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
        setUser(data.data.user)
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

  // 逆地理编码（根据经纬度获取地点名称）
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`/api/geocode/reverse?location=${lng},${lat}`)
      const data = await response.json()
      if (data.regeocode?.formatted_address) {
        return data.regeocode.formatted_address
      }
      return null
    } catch (error) {
      console.error('逆地理编码失败:', error)
      return null
    }
  }

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

  // 用户搜索
  useEffect(() => {
    if (searchType === 'users' && searchQuery.trim()) {
      setLoadingUsers(true)
      const timer = setTimeout(async () => {
        try {
          const data = await api(`/users/search?q=${encodeURIComponent(searchQuery)}`)
          setUserSearchResults(data.users || [])
        } catch (e) {
          setUserSearchResults([])
        } finally {
          setLoadingUsers(false)
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setUserSearchResults([])
    }
  }, [searchQuery, searchType])

  // 获取用户帖子
  const fetchUserPosts = async (userId) => {
    setLoadingUserPosts(true)
    try {
      const data = await api(`/users/${userId}/posts`)
      setUserPosts(data.posts || [])
    } catch (e) {
      setUserPosts([])
    } finally {
      setLoadingUserPosts(false)
    }
  }

  // 选择用户查看其帖子
  const handleSelectUser = (user) => {
    setSelectedUser(user)
    fetchUserPosts(user.id)
  }

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
      localStorage.setItem('tapspot_token', data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
      setShowLogin(false)
      setLoginForm({ username: '', password: '' })
    } catch (error) {
      alert(error.message)
    }
  }

  // 注册
  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.password || !registerForm.nickname) {
      return alert('请填写用户名、密码和昵称')
    }
    if (registerForm.username.length < 3) return alert('用户名至少 3 个字符')
    if (registerForm.password.length < 6) return alert('密码至少 6 个字符')
    if (registerForm.password !== registerForm.password_conf) return alert('两次输入的密码不一致')
    try {
      const data = await api('/register', {
        method: 'POST',
        body: JSON.stringify(registerForm)
      })
      localStorage.setItem('tapspot_token', data.data.token)
      setToken(data.data.token)
      setUser(data.data.user)
      setShowLogin(false)
      setRegisterForm({ username: '', password: '', password_conf: '', nickname: '', gender: 'male', bio: '', email: '', phone: '' })
    } catch (error) {
      alert(error.message || '注册失败')
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
      // 获取评论点赞状态
      if (user && data.comments.length > 0) {
        const commentIds = data.comments.map(c => c.id).join(',')
        try {
          const likeData = await api(`/comments/likes/check?commentIds=${commentIds}`)
          setLikedComments(new Set(likeData.liked))
        } catch (e) {
          console.error('获取评论点赞状态失败:', e)
        }
      }
    } catch (error) {
      console.error('获取评论失败:', error)
      setComments([])
    } finally {
      setLoadingComments(false)
    }
  }

  // 获取最佳评论（PK逻辑）
  const fetchBestComment = async (postId) => {
    try {
      const data = await api(`/posts/${postId}/best-comment`)
      setBestComment(data.bestComment)
      setPkResult(data.pkResult)
    } catch (error) {
      console.error('获取最佳评论失败:', error)
    }
  }

  // 打开帖子详情
  const openPostDetail = (post) => {
    setShowPostDetail(post)
    setComments([])
    setNewComment('')
    setReplyTo(null)
    setBestComment(null)
    setPkResult(null)
    setLikedComments(new Set())
    fetchComments(post.id)
    fetchBestComment(post.id)
    // 放大地图到帖子位置
    if (mapRef) {
      mapRef.setView([post.latitude, post.longitude], 14)
    }
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
      setComments(prev => [...prev, { ...data.comment, likes: 0 }])
      setCommentCounts(prev => ({ ...prev, [showPostDetail.id]: (prev[showPostDetail.id] || 0) + 1 }))
      setNewComment('')
      setReplyTo(null)
      // 重新获取最佳评论
      fetchBestComment(showPostDetail.id)
    } catch (error) {
      alert(error.message)
    } finally {
      setSubmittingComment(false)
    }
  }

  // 评论点赞
  const handleCommentLike = async (commentId) => {
    if (!user) {
      setShowLogin(true)
      return
    }
    try {
      const data = await api(`/comments/${commentId}/like`, { method: 'POST' })
      if (data.liked) {
        setLikedComments(prev => new Set([...prev, commentId]))
      } else {
        setLikedComments(prev => {
          const next = new Set(prev)
          next.delete(commentId)
          return next
        })
      }
      // 更新评论列表中的点赞数
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, likes: data.liked ? (c.likes || 0) + 1 : Math.max(0, (c.likes || 1) - 1) }
          : c
      ))
      // 重新获取最佳评论
      fetchBestComment(showPostDetail.id)
    } catch (error) {
      console.error('评论点赞失败:', error)
    }
  }

  // 删除评论（打开确认弹框）
  const handleDeleteComment = (commentId) => {
    if (!user) return
    const comment = comments.find(c => c.id === commentId)
    if (comment.authorId !== user.id) return
    setShowDeleteConfirm({ id: commentId, type: 'comment', title: comment.content?.substring(0, 20) + '...' })
  }

  // 确认删除评论
  const confirmDeleteComment = async () => {
    if (!showDeleteConfirm) return
    setDeleting(true)
    try {
      await api(`/comments/${showDeleteConfirm.id}`, { method: 'DELETE' })
      setComments(prev => prev.filter(c => c.id !== showDeleteConfirm.id))
      setCommentCounts(prev => {
        const newCounts = { ...prev }
        if (showPostDetail) {
          newCounts[showPostDetail.id] = Math.max(0, (newCounts[showPostDetail.id] || 0) - 1)
        }
        return newCounts
      })
      setShowDeleteConfirm(null)
    } catch (error) {
      alert(error.message)
    } finally {
      setDeleting(false)
    }
  }

  // AI 分析位置
  const handleAIAnalyze = async (locationName) => {
    if (!locationName) {
      setAiAnalysis('')
      return
    }
    
    setAnalyzing(true)
    try {
      const data = await api('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ location_name: locationName })
      })
      setAiAnalysis(data.analysis || '分析失败')
      console.log('AI 分析结果:', data.analysis)
      // 10 秒后自动隐藏
      setTimeout(() => setAiAnalysis(''), 10000)
    } catch (error) {
      console.error('AI 分析失败:', error)
      setAiAnalysis('AI 分析失败：' + (error.message || '请稍后重试'))
      setTimeout(() => setAiAnalysis(''), 5000)
    } finally {
      setAnalyzing(false)
    }
  }

  // AI 分析选中的文字
  const handleAnalyzeText = async (text) => {
    console.log('分析文字:', text)
    setAnalyzing(true)
    try {
      const data = await api('/ai/analyze', {
        method: 'POST',
        body: JSON.stringify({ location_name: text })
      })
      console.log('文字分析结果:', data)
      // 返回完整数据给 TextSelectionAI 组件
      return data
    } catch (error) {
      console.error('AI 分析失败:', error)
      throw error
    } finally {
      setAnalyzing(false)
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

  // 删除帖子（打开确认弹框）
  const handleDeletePost = (id) => {
    if (!user) return
    const post = posts.find(p => p.id === id)
    if (post.authorId !== user.id) return
    setShowDeleteConfirm({ id, type: 'post', title: post.title })
  }

  // 确认删除帖子
  const confirmDeletePost = async () => {
    if (!showDeleteConfirm) return
    setDeleting(true)
    try {
      await api(`/posts/${showDeleteConfirm.id}`, { method: 'DELETE' })
      setShowDeleteConfirm(null)
      setShowPostDetail(null)
      fetchPosts()
    } catch (error) {
      alert(error.message)
    } finally {
      setDeleting(false)
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

  // 打开个人资料编辑弹窗
  const openUserProfile = () => {
    if (user) {
      setProfileForm({ 
        nickname: user.nickname || '', 
        gender: user.gender || 'secret',
        bio: user.bio || ''
      })
      setShowUserProfile(true)
      setShowUserMenu(false)
    }
  }

  // 保存个人资料
  const handleSaveProfile = async () => {
    if (!profileForm.nickname.trim()) {
      return alert('昵称不能为空')
    }
    setSavingProfile(true)
    try {
      const data = await api('/me', {
        method: 'PUT',
        body: JSON.stringify({ 
          nickname: profileForm.nickname.trim(),
          gender: profileForm.gender,
          bio: profileForm.bio.trim()
        })
      })
      setUser(data.data.user)
      setShowUserProfile(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  // 性别显示文本
  const getGenderText = (gender) => {
    const map = { male: '男', female: '女', secret: '保密' }
    return map[gender] || '保密'
  }

  // 性别图标
  const getGenderIcon = (gender) => {
    if (gender === 'male') return '👨'
    if (gender === 'female') return '👩'
    return '🤫'
  }

  // 查看用户空间（获取用户信息和帖子列表）
  const openUserSpace = async (userId, authorName) => {
    setLoadingUserSpace(true)
    try {
      const [userData, postsData] = await Promise.all([
        api(`/users/${userId}`),
        api(`/users/${userId}/posts`)
      ])
      setShowUserSpace({
        user: userData.data?.user || userData.user,
        posts: postsData.posts || []
      })
    } catch (error) {
      console.error('获取用户空间失败:', error)
      alert('获取用户信息失败')
    } finally {
      setLoadingUserSpace(false)
    }
  }

  // ============ 聊天相关函数 ============

  // 获取会话列表
  const fetchConversations = async () => {
    if (!user) return
    try {
      const data = await api('/conversations')
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('获取会话列表失败:', error)
    }
  }

  // 获取未读消息数
  const fetchUnreadCount = async () => {
    if (!user) return
    try {
      const data = await api('/messages/unread')
      setUnreadCount(data.unread_count || 0)
    } catch (error) {
      console.error('获取未读消息数失败:', error)
    }
  }

  // 连接WebSocket
  const connectWebSocket = () => {
    if (!user || !token) return

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws?token=${token}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket已连接')
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        console.log('收到WebSocket消息:', msg)
        if (msg.type === 'chat') {
          // 使用 ref 获取当前会话
          const currentConv = activeConversationRef.current
          console.log('当前会话:', currentConv, '消息发送者:', msg.sender_id, '接收者:', msg.receiver_id)

          // 判断是否与当前会话相关
          // 条件：当前会话存在，且消息的对方就是当前会话的对方
          const isRelatedToCurrentConv = currentConv && currentConv.other_user && (
            msg.sender_id === currentConv.other_user.id ||  // 对方发来的消息
            msg.receiver_id === currentConv.other_user.id   // 我发给对方的消息
          )

          if (isRelatedToCurrentConv) {
            console.log('消息与当前会话相关，添加到聊天列表')
            setChatMessages(prev => [...prev, {
              id: msg.id || Date.now(),
              sender_id: msg.sender_id,
              sender_name: msg.sender_name,
              content: msg.content,
              created_at: msg.created_at,
              is_me: msg.is_me
            }])
          } else {
            console.log('消息与当前会话无关，不添加')
          }
          // 刷新会话列表
          fetchConversations()
          fetchUnreadCount()
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket已断开')
      setWsConnected(false)
      // 3秒后重连
      setTimeout(() => {
        if (user) connectWebSocket()
      }, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
    }

    wsRef.current = ws
  }

  // 断开WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  // 发送消息
  const sendChatMessage = async () => {
    if (!newChatMessage.trim() || !activeConversation) return

    const content = newChatMessage.trim()
    setNewChatMessage('') // 先清空输入框

    try {
      // 统一使用 HTTP 发送，更可靠
      await api('/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: activeConversation.other_user.id,
          content: content
        })
      })
      // 发送后立即刷新消息列表
      fetchChatMessages(activeConversation.id)
    } catch (error) {
      console.error('发送消息失败:', error)
      alert('发送消息失败')
      setNewChatMessage(content) // 恢复输入内容
    }
  }

  // 获取聊天消息
  const fetchChatMessages = async (conversationId) => {
    try {
      const data = await api(`/conversations/${conversationId}/messages`)
      setChatMessages(data.messages || [])
    } catch (error) {
      console.error('获取消息失败:', error)
    }
  }

  // 打开聊天窗口
  const openChat = async (otherUserId) => {
    if (!user) {
      setShowLogin(true)
      return
    }
    if (otherUserId === user.id) {
      alert('不能给自己发消息')
      return
    }

    try {
      // 获取或创建会话，并获取对方用户名
      const data = await api(`/conversations/with?user_id=${otherUserId}`)
      const conversation = data.conversation

      // 设置初始聊天对象
      setInitialChatPeer({
        id: otherUserId,
        name: conversation.other_user?.nickname || '用户'
      })
      setShowChat(true)
      setShowUserSpace(null) // 关闭用户空间弹窗
    } catch (error) {
      console.error('打开聊天失败:', error)
      alert('打开聊天失败')
    }
  }

  // 打开会话列表
  const openChatList = () => {
    if (!user) {
      setShowLogin(true)
      return
    }
    setInitialChatPeer(null) // 清除初始聊天对象，显示列表
    setShowChat(true)
  }

  // 选择会话
  const selectConversation = async (conversation) => {
    setActiveConversation(conversation)
    activeConversationRef.current = conversation
    fetchChatMessages(conversation.id)
    // 标记为已读
    await api(`/conversations/${conversation.id}/read`, { method: 'POST' })
    fetchUnreadCount()
  }

  // 初始化聊天
  useEffect(() => {
    if (user) {
      fetchConversations()
      fetchUnreadCount()
      connectWebSocket()
    } else {
      disconnectWebSocket()
      setConversations([])
      setUnreadCount(0)
    }

    return () => {
      disconnectWebSocket()
    }
  }, [user])

  // 聊天页面轮询刷新消息（每2秒检查一次）
  useEffect(() => {
    if (!activeConversation || !showChat) return

    const pollInterval = setInterval(() => {
      if (activeConversation) {
        // 静默刷新消息，对比去重
        api(`/conversations/${activeConversation.id}/messages`).then(data => {
          const newMessages = data.messages || []
          setChatMessages(prev => {
            // 合并新旧消息，去重
            const existingIds = new Set(prev.map(m => m.id))
            const merged = [...prev]
            for (const msg of newMessages) {
              if (!existingIds.has(msg.id)) {
                merged.push(msg)
              }
            }
            // 按时间排序
            merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            return merged
          })
        }).catch(err => {
          console.error('轮询消息失败:', err)
        })
      }
    }, 2000) // 每2秒轮询一次

    return () => clearInterval(pollInterval)
  }, [activeConversation, showChat])

  // 滚动到底部
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

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
                  { key: 'all', label: '全部' },
                  { key: 'post', label: '📍 日常' },
                  { key: 'food', label: '🍽️ 美食' },
                  { key: 'hotel', label: '🏨 住宿' },
                  { key: 'shop', label: '🛍️ 购物' },
                  { key: 'scenic', label: '🏞️ 景点' },
                  { key: 'transport', label: '🚗 交通' },
                  { key: 'entertainment', label: '🎭 娱乐' },
                  { key: 'work', label: '💼 工作' },
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
                  >{type.label}</button>
                ))}
              </div>
            </div>

            {/* 搜索 */}
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
              {/* 搜索类型切换 */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button
                  onClick={() => { setSearchType('posts'); setSelectedUser(null); }}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: searchType === 'posts' ? COLORS.accent : 'transparent',
                    color: searchType === 'posts' ? '#fff' : '#888',
                    border: `1px solid ${searchType === 'posts' ? COLORS.accent : COLORS.border}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  📝 帖子
                </button>
                <button
                  onClick={() => { setSearchType('users'); setSelectedUser(null); }}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                    background: searchType === 'users' ? COLORS.accent : 'transparent',
                    color: searchType === 'users' ? '#fff' : '#888',
                    border: `1px solid ${searchType === 'users' ? COLORS.accent : COLORS.border}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  👤 用户
                </button>
              </div>
              {/* 搜索输入框 */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  placeholder={searchType === 'posts' ? "搜索帖子、地点..." : "搜索用户..."}
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

            {/* 帖子列表 / 用户搜索结果 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {/* 用户搜索模式 */}
              {searchType === 'users' ? (
                selectedUser ? (
                  /* 显示选中用户的帖子 */
                  <div>
                    <div 
                      onClick={() => setSelectedUser(null)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer', color: COLORS.accent, fontSize: 13 }}
                    >
                      ← 返回用户列表
                    </div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, 
                      padding: 14, marginBottom: 12, 
                      background: COLORS.cardBgDark, borderRadius: 12, 
                      border: `1px solid ${COLORS.border}` 
                    }}>
                      <div style={{ 
                        width: 50, height: 50, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`, 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24
                      }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.text }}>{selectedUser.username}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{selectedUser.bio || '暂无简介'}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>帖子 ({userPosts.length})</div>
                    {loadingUserPosts ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    ) : userPosts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>该用户暂无帖子</div>
                    ) : (
                      userPosts.map(post => (
                        <div
                          key={post.id}
                          onClick={() => {
                            if (mapRef) {
                              mapRef.setView([post.latitude, post.longitude], 13, { animate: false })
                            }
                          }}
                          style={{
                            background: COLORS.cardBgDark, borderRadius: 10, padding: 12, marginBottom: 8,
                            border: `1px solid ${COLORS.border}`, cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: COLORS.text }}>{post.title}</div>
                          <div style={{ fontSize: 11, color: '#888', display: '-webkit-box', WebkitLineClamp: 2, overflow: 'hidden' }}>{post.content}</div>
                          <div style={{ fontSize: 10, color: '#666', marginTop: 6 }}>
                            📍 {post.location_name} · {formatTime(post.createdAt)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  /* 用户搜索结果列表 */
                  <div>
                    {loadingUsers ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                        <div style={{ marginTop: 8 }}>搜索中...</div>
                      </div>
                    ) : !searchQuery.trim() ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                        <div>输入关键词搜索用户</div>
                      </div>
                    ) : userSearchResults.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                        <div>未找到相关用户</div>
                      </div>
                    ) : (
                      userSearchResults.map(u => (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: 14, marginBottom: 8,
                            background: COLORS.cardBgDark, borderRadius: 12,
                            border: `1px solid ${COLORS.border}`, cursor: 'pointer',
                            transition: 'border-color 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.accent}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = COLORS.border}
                        >
                          <div style={{ 
                            width: 44, height: 44, 
                            background: u.avatar ? `url(${u.avatar})` : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`,
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, color: '#fff'
                          }}>{!u.avatar && '👤'}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{u.username}</div>
                            <div style={{ fontSize: 12, color: '#888' }}>{u.bio || '暂无简介'}</div>
                            <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                              {u.postCount || 0} 帖子
                            </div>
                          </div>
                          <ChevronRight size={16} color="#666" />
                        </div>
                      ))
                    )}
                  </div>
                )
              ) : (
                /* 帖子搜索模式（原有逻辑） */
                loading ? (
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
                      onClick={(e) => {
                        e.stopPropagation()
                        // 直接导航到帖子位置，不受任何状态影响
                        if (mapRef) {
                          mapRef.setView([post.latitude, post.longitude], 13, { animate: false })
                        }
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
                          background: `linear-gradient(135deg, ${getTypeConfig(post.type).color} 0%, ${getTypeConfig(post.type).colorDark} 100%)`,
                          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 22,
                        }}>
                          {getTypeConfig(post.type).icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            {post.id === newPostId && <span style={{ background: COLORS.accent, color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>NEW</span>}
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
                        <div 
                          onClick={(e) => { e.stopPropagation(); openUserSpace(post.authorId, post.author) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                        >
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
                )
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
          <TileLayer 
            url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}" 
            subdomains="1234" 
            attribution='&copy; 高德地图' 
            maxZoom={18}
            minZoom={3}
            keepBuffer={10}
            updateWhenZooming={false}
            crossOrigin="anonymous"
          />
          <MapEvents onClick={async (latlng, originalEvent) => {
            // 如果点击的是 Marker 或 Popup，不处理（由 Leaflet 判断）
            // 只有点击真正的地图空白区域才打开发帖弹窗
            if (!user) { setShowLogin(true); return }

            // 检查是否点击在 Marker 或 Popup 上
            if (originalEvent && (
              originalEvent.target?.closest('.leaflet-marker-icon') ||
              originalEvent.target?.closest('.leaflet-popup') ||
              originalEvent.target?.closest('.leaflet-control')
            )) {
              return
            }

            // 先设置坐标
            setPostCoords(latlng)

            // 尝试获取地点名称
            const locationName = await reverseGeocode(latlng.lat, latlng.lng)
            if (locationName) {
              setPostForm(prev => ({ ...prev, location_name: locationName }))
              setLocationTitle(locationName) // 设置 AI 分析的位置标题
            }

            setShowPost(true)
          }} onReady={setMapRef} onZoom={setMapZoom} onMouseMove={setMouseCoords} />
          {posts.map(item => (
            <Marker 
              key={`post-${item.id}`} 
              position={[item.latitude, item.longitude]} 
              icon={createIcon(item.type, item.id === newPostId, user && item.authorId === user.id, mapZoom)}
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
                      <Plus size={14} /> 在此打卡
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* AI 助手 */}
        <AIAssistant 
          analyzing={analyzing}
          analysis={aiAnalysis}
          locationName={locationTitle}
          onAnalyze={handleAIAnalyze}
        />

        {/* 文字选择 AI 分析 */}
        <TextSelectionAI onAnalyzeText={handleAnalyzeText} />

        {/* 全局 AI 分析结果（用于文字选择分析） */}
        {aiAnalysis && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            background: 'white',
            borderRadius: 20,
            padding: 24,
            maxWidth: 400,
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            border: '3px solid #ff6b9d',
            animation: 'popIn 0.3s ease'
          }}>
            <button
              onClick={() => setAiAnalysis('')}
              style={{
                position: 'absolute',
                top: 10,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: '#999'
              }}
            >
              ×
            </button>
            <div style={{ fontSize: 14, color: '#333', lineHeight: 1.8 }}>
              {aiAnalysis}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#999', textAlign: 'right' }}>
              阿尼亚 AI 分析 · 10 秒后自动关闭
            </div>
          </div>
        )}

        {/* 工具栏 */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 1000, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowSidebar(!showSidebar)} style={{ width: 44, height: 44, background: COLORS.cardBg, border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.textDark} strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
          </button>
          <div style={{ flex: 1 }} />
          {user ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* 消息图标 */}
              <button 
                onClick={openChatList}
                style={{ 
                  width: 44, height: 44, 
                  background: COLORS.cardBg, 
                  border: 'none', 
                  borderRadius: 12, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                <Mail size={20} color={COLORS.textDark} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: COLORS.accent,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 10,
                    minWidth: 18,
                    textAlign: 'center'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ padding: '8px 14px', background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, boxShadow: `0 4px 15px ${COLORS.accent}40` }}>
                <User size={16} />
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nickname}</span>
              </button>
              {showUserMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, background: COLORS.cardBg, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: 160, overflow: 'hidden', zIndex: 1002 }}>
                  <div style={{ padding: 12, borderBottom: `1px solid ${COLORS.border}`, fontSize: 12, color: '#666' }}>@{user.username}</div>
                  <button onClick={openUserProfile} style={{ width: '100%', padding: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textDark, fontSize: 13 }}><User size={16} /> 编辑资料</button>
                  <button onClick={openChatList} style={{ width: '100%', padding: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textDark, fontSize: 13 }}><Mail size={16} /> 消息 {unreadCount > 0 && <span style={{ background: COLORS.accent, color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>{unreadCount}</span>}</button>
                  <button onClick={handleLogout} style={{ width: '100%', padding: 12, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.accent, fontSize: 13 }}><LogOut size={16} /> 退出登录</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ padding: '10px 18px', background: COLORS.cardBg, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textDark, fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><User size={16} /> 登录</button>
          )}
          <button onClick={() => { if (!user) { setShowLogin(true); return }; setShowPost(true) }} style={{ padding: '10px 18px', background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 600, boxShadow: `0 4px 15px ${COLORS.accent}40` }}><Plus size={18} /> 打卡</button>
        </div>

        {/* 缩放控制 */}
        <div style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => mapRef?.setZoom(mapZoom + 1)} style={{ width: 40, height: 40, background: COLORS.cardBg, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomIn size={18} color={COLORS.textDark} /></button>
          <button onClick={() => mapRef?.setZoom(mapZoom - 1)} style={{ width: 40, height: 40, background: COLORS.cardBg, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ZoomOut size={18} color={COLORS.textDark} /></button>
          <button onClick={() => mapRef?.setView([35.8617, 104.1954], 4)} style={{ width: 40, height: 40, background: COLORS.cardBg, border: 'none', borderRadius: 10, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Compass size={18} color={COLORS.textDark} /></button>
        </div>

        {/* 底部提示 */}
        {/* 底部提示/经纬度显示 */}
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: COLORS.cardBg, padding: '10px 20px', borderRadius: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: 13, color: '#666', zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8, minWidth: 200, justifyContent: 'center' }}>
          {mouseCoords ? (
            <>
              <span style={{ color: COLORS.accent }}>📍</span>
              <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                {mouseCoords.lat.toFixed(4)}, {mouseCoords.lng.toFixed(4)}
              </span>
            </>
          ) : (
            '📍 点击地图添加新地点'
          )}
        </div>
      </div>

      {/* 登录弹窗 */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowLogin(false)}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 340, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18, color: COLORS.textDark }}>{isRegister ? '注册账号' : '登录'}</b>
              <button onClick={() => setShowLogin(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
              {isRegister ? (
                <>
                  <input type="text" placeholder="用户名 *" value={registerForm.username} onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <input type="password" placeholder="密码 *" value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <input type="password" placeholder="确认密码 *" value={registerForm.password_conf} onChange={e => setRegisterForm({ ...registerForm, password_conf: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <input type="text" placeholder="昵称 *" value={registerForm.nickname} onChange={e => setRegisterForm({ ...registerForm, nickname: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <select value={registerForm.gender} onChange={e => setRegisterForm({ ...registerForm, gender: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box', background: 'white' }}>
                    <option value="male">♂️ 男</option>
                    <option value="female">♀️ 女</option>
                    <option value="other">🔹 其他</option>
                  </select>
                  <textarea placeholder="个人简介（选填）" value={registerForm.bio} onChange={e => setRegisterForm({ ...registerForm, bio: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box', minHeight: 80, resize: 'vertical' }} />
                  <input type="email" placeholder="邮箱（选填）" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <input type="tel" placeholder="手机号（选填）" value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                </>
              ) : (
                <>
                  <input type="text" placeholder="用户名" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <input type="password" placeholder="密码" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, marginBottom: 12, fontSize: 15, boxSizing: 'border-box' }} autoComplete="off" />
                  <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 8, fontSize: 12, color: '#1565c0' }}>🔑 测试账号：<b>root</b> / <b>root</b></div>
                </>
              )}
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={isRegister ? handleRegister : handleLogin} style={{ width: '100%', padding: 14, background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>{isRegister ? '注册' : '登录'}</button>
              <button onClick={() => setIsRegister(!isRegister)} style={{ width: '100%', padding: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13 }}>{isRegister ? '已有账号？去登录' : '没有账号？去注册'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 打卡弹窗 */}
      {showPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => { setShowPost(false); setPostCoords(null) }}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18, color: COLORS.textDark }}>发布帖子</b>
              <button onClick={() => { setShowPost(false); setPostCoords(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { type: 'post', label: '📍 日常', color: '#3b82f6' },
                  { type: 'food', label: '🍽️ 美食', color: '#f97316' },
                  { type: 'hotel', label: '🏨 住宿', color: '#8b5cf6' },
                  { type: 'shop', label: '🛍️ 购物', color: '#ec4899' },
                  { type: 'scenic', label: '🏞️ 景点', color: '#10b981' },
                  { type: 'transport', label: '🚗 交通', color: '#06b6d4' },
                  { type: 'entertainment', label: '🎭 娱乐', color: '#f59e0b' },
                  { type: 'work', label: '💼 工作', color: '#6366f1' }
                ].map(item => (
                  <button 
                    key={item.type} 
                    onClick={() => setPostForm({ ...postForm, type: item.type })} 
                    style={{ 
                      padding: '10px 16px', 
                      background: postForm.type === item.type ? item.color : '#f5f5f5', 
                      border: postForm.type === item.type ? 'none' : '1px solid #e0e0e0', 
                      borderRadius: 10, 
                      color: postForm.type === item.type ? 'white' : '#666', 
                      cursor: 'pointer', 
                      fontWeight: 500, 
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
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
                  <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, ${getTypeConfig(showPostDetail.type).color} 0%, ${getTypeConfig(showPostDetail.type).colorDark} 100%)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {getTypeConfig(showPostDetail.type).icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: COLORS.textDark }}>{showPostDetail.title}</div>
                    <div 
                      onClick={(e) => { 
                        e.stopPropagation()
                        setShowPostDetail(null)
                        openUserSpace(showPostDetail.authorId, showPostDetail.author)
                      }}
                      style={{ fontSize: 12, color: COLORS.accent, cursor: 'pointer' }}
                    >@{showPostDetail.author} · {formatTime(showPostDetail.createdAt)}</div>
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
                💬 评论 ({comments.length + (bestComment && bestComment.type === 'post' ? 1 : 0)})
                {bestComment && <span style={{ fontSize: 11, color: '#888', fontWeight: 400, marginLeft: 8 }}>🏆 最佳内容已置顶</span>}
              </div>
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <>
                  {/* 最佳评论/帖子 - 作为列表的第一项 */}
                  {bestComment && (
                    <div 
                      style={{ 
                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                        borderRadius: 10, 
                        padding: 12, 
                        marginBottom: 8, 
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                        border: '2px solid #f59e0b'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>🏆</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#92400e' }}>最佳内容</span>
                        <span style={{ 
                          fontSize: 10, 
                          background: bestComment.type === 'comment' ? '#10b981' : '#3b82f6',
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: 4 
                        }}>
                          {bestComment.type === 'comment' ? '评论胜出' : '帖子胜出'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 24, height: 24, background: COLORS.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>👤</div>
                          <span style={{ fontWeight: 500, fontSize: 13, color: COLORS.textDark }}>{bestComment.author}</span>
                          {bestComment.type === 'comment' && bestComment.replyToUser && (
                            <span style={{ fontSize: 10, color: '#888' }}>回复 @{bestComment.replyToUser}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#666' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Heart size={12} fill="#f59e0b" color="#f59e0b" /> {bestComment.likeCount}
                          </span>
                        </div>
                      </div>
                      {bestComment.type === 'post' && bestComment.title && (
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#333', marginBottom: 4, paddingLeft: 32 }}>{bestComment.title}</div>
                      )}
                      <div style={{ fontSize: 13, color: '#333', paddingLeft: 32 }}>{bestComment.content}</div>
                    </div>
                  )}
                  
                  {/* 普通评论列表 */}
                  {comments.length === 0 && !bestComment ? (
                    <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 13 }}>
                      暂无评论，来说点什么吧~
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div 
                            onClick={(e) => { 
                              e.stopPropagation()
                              setShowPostDetail(null)
                              openUserSpace(comment.authorId, comment.author)
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'pointer' }}
                          >
                            <div style={{ width: 24, height: 24, background: COLORS.secondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>👤</div>
                            <span style={{ fontWeight: 500, fontSize: 13, color: COLORS.textDark }}>{comment.author}</span>
                            <span style={{ fontSize: 11, color: '#aaa' }}>{formatTime(comment.createdAt)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button 
                              onClick={() => handleCommentLike(comment.id)} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 3, 
                                background: likedComments.has(comment.id) ? `${COLORS.accent}15` : 'none', 
                                border: 'none', 
                                color: likedComments.has(comment.id) ? COLORS.accent : '#888', 
                                cursor: 'pointer', 
                                fontSize: 11,
                                padding: '2px 6px',
                                borderRadius: 4
                              }}
                            >
                              <Heart size={12} fill={likedComments.has(comment.id) ? COLORS.accent : 'none'} /> {comment.likes || 0}
                            </button>
                            {user && (
                              <button onClick={() => setReplyTo({ id: comment.id, author: comment.author })} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 11 }}>回复</button>
                            )}
                            {user && comment.authorId === user.id && (
                              <button onClick={() => handleDeleteComment(comment.id)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 11 }}>🗑️</button>
                            )}
                          </div>
                        </div>
                        {comment.replyToUser && (
                          <div style={{ fontSize: 11, color: '#888', paddingLeft: 32, marginBottom: 2 }}>
                            ↩️ 回复 <span style={{ color: COLORS.accent }}>@{comment.replyToUser}</span>
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: '#333', paddingLeft: 32 }}>{comment.content}</div>
                      </div>
                    ))
                  )}
                </>
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

      {/* 删除确认弹框 */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => !deleting && setShowDeleteConfirm(null)}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 340, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </div>
              <div style={{ fontWeight: 600, fontSize: 18, color: COLORS.textDark, marginBottom: 8 }}>
                确定删除{showDeleteConfirm.type === 'post' ? '帖子' : '评论'}？
              </div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                {showDeleteConfirm.type === 'post' 
                  ? '删除后将无法恢复，相关的评论也会一起删除。' 
                  : '删除后将无法恢复。'}
              </div>
              {showDeleteConfirm.title && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#f5f5f5', borderRadius: 8, fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  "{showDeleteConfirm.title}"
                </div>
              )}
            </div>
            <div style={{ padding: '16px 20px', borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10 }}>
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                disabled={deleting}
                style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 10, cursor: deleting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500, opacity: deleting ? 0.6 : 1 }}
              >取消</button>
              <button 
                onClick={showDeleteConfirm.type === 'post' ? confirmDeletePost : confirmDeleteComment} 
                disabled={deleting}
                style={{ flex: 1, padding: 14, background: deleting ? '#fca5a5' : '#ef4444', color: 'white', border: 'none', borderRadius: 10, cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    删除中...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path></svg>
                    确定删除
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户资料编辑弹窗 */}
      {showUserProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowUserProfile(false)}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 400, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: 20, borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 18, color: COLORS.textDark }}>编辑资料</b>
              <button onClick={() => setShowUserProfile(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 20 }}>
              {/* 头像预览 */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ 
                  width: 80, height: 80, 
                  background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, 
                  borderRadius: '50%', 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36,
                  boxShadow: `0 4px 20px ${COLORS.accent}40`
                }}>👤</div>
              </div>

              {/* 用户名 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 6 }}>用户名</label>
                <input 
                  value={user?.username || ''} 
                  disabled 
                  style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, background: '#f5f5f5', color: '#999', boxSizing: 'border-box' }} 
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>用户名不可修改</div>
              </div>

              {/* 昵称 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 6 }}>昵称 *</label>
                <input 
                  placeholder="输入你的昵称"
                  value={profileForm.nickname} 
                  onChange={e => setProfileForm({ ...profileForm, nickname: e.target.value })}
                  maxLength={20}
                  style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} 
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{profileForm.nickname.length}/20</div>
              </div>

              {/* 性别 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 6 }}>性别</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'male', label: '男', icon: '👨' },
                    { value: 'female', label: '女', icon: '👩' },
                    { value: 'secret', label: '保密', icon: '🤫' },
                  ].map(item => (
                    <button
                      key={item.value}
                      onClick={() => setProfileForm({ ...profileForm, gender: item.value })}
                      style={{
                        flex: 1, padding: 12,
                        background: profileForm.gender === item.value ? `${COLORS.accent}15` : '#f5f5f5',
                        border: profileForm.gender === item.value ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                        borderRadius: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        color: profileForm.gender === item.value ? COLORS.accent : '#666',
                        fontWeight: 500, fontSize: 14,
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 个人简介 */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 6 }}>个人简介</label>
                <textarea 
                  placeholder="介绍一下自己吧~"
                  value={profileForm.bio} 
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  maxLength={200}
                  rows={3}
                  style={{ width: '100%', padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, resize: 'none', boxSizing: 'border-box' }} 
                />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{profileForm.bio.length}/200</div>
              </div>
            </div>
            <div style={{ padding: 20, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10 }}>
              <button onClick={() => setShowUserProfile(false)} style={{ flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14 }}>取消</button>
              <button onClick={handleSaveProfile} disabled={savingProfile} style={{ flex: 1, padding: 14, background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, color: 'white', border: 'none', borderRadius: 10, cursor: savingProfile ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 14, opacity: savingProfile ? 0.7 : 1 }}>
                {savingProfile ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 用户空间弹窗 */}
      {(showUserSpace || loadingUserSpace) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => !loadingUserSpace && setShowUserSpace(null)}>
          <div style={{ background: COLORS.cardBg, borderRadius: 16, width: '100%', maxWidth: 420, maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            {loadingUserSpace ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: COLORS.accent }} />
                <div style={{ marginTop: 12, color: '#666' }}>加载中...</div>
              </div>
            ) : showUserSpace && (
              <>
                {/* 用户信息头部 */}
                <div style={{ 
                  padding: 24, 
                  background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
                  color: COLORS.text
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ 
                        width: 56, height: 56, 
                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, #ff6b9d 100%)`, 
                        borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24,
                        boxShadow: `0 4px 15px ${COLORS.accent}40`
                      }}>👤</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {showUserSpace.user.nickname}
                          {showUserSpace.user.gender && (
                            <span style={{ fontSize: 16 }}>{getGenderIcon(showUserSpace.user.gender)}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#aaa' }}>@{showUserSpace.user.username}</div>
                      </div>
                    </div>
                    <button onClick={() => setShowUserSpace(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: 6 }}>
                      <X size={18} color={COLORS.text} />
                    </button>
                  </div>
                  
                  {/* 个人简介 */}
                  {showUserSpace.user.bio && (
                    <div style={{ 
                      marginBottom: 16, 
                      padding: '10px 14px', 
                      background: 'rgba(255,255,255,0.1)', 
                      borderRadius: 10,
                      fontSize: 13,
                      lineHeight: 1.5
                    }}>
                      {showUserSpace.user.bio}
                    </div>
                  )}
                  
                  {/* 统计数据 */}
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 22 }}>{showUserSpace.user.postsCount}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>打卡</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 22 }}>{showUserSpace.user.likesCount}</div>
                      <div style={{ fontSize: 12, color: '#aaa' }}>获赞</div>
                    </div>
                    {/* 发消息按钮 */}
                    {user && user.id !== showUserSpace.user.id && (
                      <button
                        onClick={() => openChat(showUserSpace.user.id)}
                        style={{
                          marginLeft: 'auto',
                          padding: '10px 20px',
                          background: COLORS.accent,
                          border: 'none',
                          borderRadius: 20,
                          cursor: 'pointer',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <Mail size={16} />
                        发消息
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 帖子列表 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: '#333' }}>
                    📍 TA的打卡 ({showUserSpace.posts?.length || 0})
                  </div>
                  {(showUserSpace.posts?.length || 0) === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                      <div>还没有打卡记录</div>
                    </div>
                  ) : (
                    showUserSpace.posts?.map(post => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowUserSpace(null)
                          if (mapRef) {
                            mapRef.setView([post.latitude, post.longitude], 13, { animate: false })
                          }
                        }}
                        style={{
                          background: '#f8f8f8', borderRadius: 12, padding: 14, marginBottom: 10, cursor: 'pointer',
                          border: '1px solid #eee', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = COLORS.accent}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#eee'}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{
                            width: 40, height: 40,
                            background: `linear-gradient(135deg, ${getTypeConfig(post.type).color} 0%, ${getTypeConfig(post.type).colorDark} 100%)`,
                            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: 18,
                          }}>
                            {getTypeConfig(post.type).icon}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.textDark, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#666' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> {post.location_name || '未知地点'}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={11} /> {post.likes}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {formatTime(post.createdAt)}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} color="#ccc" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* 消息中心 */}
      {showChat && (
        <MessageCenter
          user={user}
          onClose={() => {
            setShowChat(false)
            setInitialChatPeer(null)
          }}
          onMessageSent={fetchConversations}
          initialPeerId={initialChatPeer?.id}
          initialPeerName={initialChatPeer?.name}
        />
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

// 渲染应用到 DOM
import { createRoot } from 'react-dom/client'
const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<App />)
}