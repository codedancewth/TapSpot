import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Mail, Search, ChevronLeft } from 'lucide-react'

// 配色方案（与主应用一致）
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

// API 配置
const API_BASE = '/api'
const WS_URL = `ws://${window.location.host}/api/ws`

// 消息中心组件 - 左右分栏布局
export function MessageCenter({ user, onClose, onMessageSent, initialPeerId, initialPeerName }) {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileView, setIsMobileView] = useState(false)
  const [showChat, setShowChat] = useState(false) // 移动端控制显示聊天还是列表
  const [lastMessageId, setLastMessageId] = useState(null) // 最后一条消息ID，用于轮询
  
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  // 检测屏幕宽度
  useEffect(() => {
    const checkWidth = () => {
      setIsMobileView(window.innerWidth < 640)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // 获取会话列表
  useEffect(() => {
    fetchConversations()
    connectWebSocket()
    
    // 每30秒刷新一次会话列表
    const interval = setInterval(fetchConversations, 30000)
    
    return () => {
      clearInterval(interval)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // 如果传入了初始会话对象，自动选中
  useEffect(() => {
    if (initialPeerId && initialPeerName) {
      handleSelectConversation({
        peer_id: initialPeerId,
        peer_name: initialPeerName,
        id: null
      })
    }
  }, [initialPeerId, initialPeerName])

  // 选中会话后加载消息
  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.peer_id)
      setShowChat(true) // 移动端切换到聊天视图
    }
  }, [selectedConv?.peer_id])

  // 轮询新消息（使用 after_id 参数）
  useEffect(() => {
    if (!selectedConv) return
    
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('tapspot_token')
        // 使用 after_id 获取比当前最新消息 ID 更大的消息
        const url = lastMessageId 
          ? `${API_BASE}/conversations/${selectedConv.peer_id}/messages?after_id=${lastMessageId}`
          : `${API_BASE}/conversations/${selectedConv.peer_id}/messages`
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.messages && data.messages.length > 0) {
            // 过滤掉自己发的消息（避免重复）
            const newMsgs = data.messages.filter(m => m.sender_id !== user?.id)
            if (newMsgs.length > 0) {
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => Number(m.id)))
                const uniqueNew = newMsgs.filter(m => !existingIds.has(Number(m.id)))
                if (uniqueNew.length > 0) {
                  return [...prev, ...uniqueNew]
                }
                return prev
              })
            }
            // 更新最后消息ID
            const latestId = data.messages[data.messages.length - 1].id
            if (latestId) {
              setLastMessageId(latestId)
            }
          }
        }
      } catch (e) {
        // 静默失败，不影响用户体验
      }
    }, 2000) // 每2秒轮询一次
    
    return () => clearInterval(pollInterval)
  }, [selectedConv?.peer_id, lastMessageId, user?.id])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('tapspot_token')
      const res = await fetch(`${API_BASE}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('获取会话列表失败:', error)
    } finally {
      setLoadingConvs(false)
    }
  }

  const fetchMessages = async (peerId) => {
    setLoadingMsgs(true)
    try {
      const token = localStorage.getItem('tapspot_token')
      const res = await fetch(`${API_BASE}/conversations/${peerId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        // 记录最后消息ID，用于轮询
        if (data.messages.length > 0) {
          setLastMessageId(data.messages[data.messages.length - 1].id)
        }
      }
      // 标记已读
      if (selectedConv?.id) {
        await fetch(`${API_BASE}/conversations/${selectedConv.id}/read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        fetchConversations() // 刷新会话列表更新未读数
      }
    } catch (error) {
      console.error('获取消息失败:', error)
    } finally {
      setLoadingMsgs(false)
    }
  }

  const connectWebSocket = () => {
    const token = localStorage.getItem('tapspot_token')
    if (!token) return

    const ws = new WebSocket(`${WS_URL}?token=${token}`)
    
    ws.onopen = () => {
      console.log('WebSocket 已连接')
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      // 如果是当前选中的会话，添加消息
      if (selectedConv && msg.sender_id === selectedConv.peer_id) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender_id: msg.sender_id,
          sender_name: selectedConv.peer_name,
          content: msg.content,
          created_at: msg.created_at,
          is_me: false
        }])
      }
      // 刷新会话列表
      fetchConversations()
    }

    ws.onclose = () => {
      console.log('WebSocket 已断开')
      setWsConnected(false)
      setTimeout(connectWebSocket, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
    }

    wsRef.current = ws
  }

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv)
  }

  const handleBackToList = () => {
    setShowChat(false)
    setSelectedConv(null)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return

    const messageData = {
      type: 'chat',
      receiver_id: parseInt(selectedConv.peer_id),
      content: newMessage.trim()
    }

    // 先本地添加消息（乐观更新）
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      sender_name: user.nickname || user.username,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
      is_me: true
    }
    setMessages(prev => [...prev, tempMsg])
    setNewMessage('')

    // 通过 WebSocket 发送
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData))
    } else {
      // WebSocket 不可用，使用 HTTP 备用
      try {
        const token = localStorage.getItem('tapspot_token')
        await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            receiver_id: parseInt(selectedConv.peer_id),
            content: newMessage.trim()
          })
        })
      } catch (error) {
        console.error('发送消息失败:', error)
      }
    }

    if (onMessageSent) onMessageSent()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatConvTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  // 过滤会话列表
  const filteredConvs = conversations.filter(conv => 
    conv.peer_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 计算总未读数
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)

  // 渲染会话列表
  const renderConversationList = () => (
    <div style={{
      width: isMobileView ? '100%' : '280px',
      minWidth: isMobileView ? '100%' : '280px',
      borderRight: isMobileView ? 'none' : `1px solid ${COLORS.border}`,
      display: 'flex',
      flexDirection: 'column',
      background: COLORS.primary,
      height: '100%'
    }}>
      {/* 搜索框 */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: COLORS.cardBgDark,
          borderRadius: 20,
          padding: '8px 14px',
          gap: 8
        }}>
          <Search size={16} color="#666" />
          <input
            type="text"
            placeholder="搜索联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: COLORS.text,
              fontSize: 13,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* 会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loadingConvs ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div style={{
              width: 24,
              height: 24,
              border: '2px solid #333',
              borderTop: `2px solid ${COLORS.accent}`,
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 1s linear infinite'
            }}></div>
            加载中...
          </div>
        ) : filteredConvs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div>{searchQuery ? '没有找到联系人' : '暂无消息'}</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>去和其他用户聊聊吧~</div>
          </div>
        ) : (
          filteredConvs.map((conv) => (
            <div
              key={conv.id || conv.peer_id}
              onClick={() => handleSelectConversation(conv)}
              style={{
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: selectedConv?.peer_id === conv.peer_id 
                  ? COLORS.secondary 
                  : (conv.unread_count > 0 ? 'rgba(233,69,96,0.1)' : 'transparent'),
                borderLeft: selectedConv?.peer_id === conv.peer_id 
                  ? `3px solid ${COLORS.accent}` 
                  : '3px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedConv?.peer_id !== conv.peer_id) {
                  e.currentTarget.style.background = COLORS.secondary
                }
              }}
              onMouseLeave={(e) => {
                if (selectedConv?.peer_id !== conv.peer_id) {
                  e.currentTarget.style.background = conv.unread_count > 0 ? 'rgba(233,69,96,0.1)' : 'transparent'
                }
              }}
            >
              <div style={{
                width: 42,
                height: 42,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0
              }}>👤</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4
                }}>
                  <span style={{
                    fontWeight: conv.unread_count > 0 ? 600 : 500,
                    fontSize: 14,
                    color: COLORS.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{conv.peer_name}</span>
                  <span style={{ fontSize: 11, color: '#666', flexShrink: 0, marginLeft: 8 }}>
                    {formatConvTime(conv.last_msg_time)}
                  </span>
                </div>
                <div style={{
                  fontSize: 12,
                  color: conv.unread_count > 0 ? COLORS.text : '#888',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  {conv.unread_count > 0 && (
                    <span style={{
                      background: COLORS.accent,
                      color: 'white',
                      padding: '1px 6px',
                      borderRadius: 8,
                      fontSize: 10,
                      fontWeight: 600,
                      flexShrink: 0
                    }}>{conv.unread_count}</span>
                  )}
                  {conv.last_message}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  // 渲染聊天区域
  const renderChatArea = () => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: COLORS.cardBgDark,
      height: '100%'
    }}>
      {selectedConv ? (
        <>
          {/* 聊天头部 */}
          <div style={{
            padding: '14px 20px',
            background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            {isMobileView && (
              <button 
                onClick={handleBackToList}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.text,
                  marginRight: 4
                }}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div style={{
              width: 40,
              height: 40,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16
            }}>👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.text }}>
                {selectedConv.peer_name}
              </div>
              <div style={{ 
                fontSize: 11, 
                color: wsConnected ? '#10b981' : '#888', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4 
              }}>
                <span style={{ 
                  width: 6, 
                  height: 6, 
                  borderRadius: '50%', 
                  background: wsConnected ? '#10b981' : '#888' 
                }}></span>
                {wsConnected ? '已连接' : '离线'}
              </div>
            </div>
          </div>

          {/* 消息列表 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            {loadingMsgs ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                <div style={{
                  width: 24,
                  height: 24,
                  border: '2px solid #333',
                  borderTop: `2px solid ${COLORS.accent}`,
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  animation: 'spin 1s linear infinite'
                }}></div>
                加载中...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div>还没有消息</div>
                <div style={{ fontSize: 12, marginTop: 8 }}>开始聊天吧~</div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={msg.id || index} style={{
                  display: 'flex',
                  flexDirection: msg.is_me ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                  gap: 10
                }}>
                  <div style={{
                    width: 34,
                    height: 34,
                    background: msg.is_me 
                      ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`
                      : COLORS.secondary,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    flexShrink: 0
                  }}>👤</div>
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{
                      background: msg.is_me ? COLORS.accent : COLORS.secondary,
                      color: COLORS.text,
                      padding: '10px 14px',
                      borderRadius: msg.is_me ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: 14,
                      lineHeight: 1.5,
                      wordBreak: 'break-word'
                    }}>
                      {msg.content}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: '#666',
                      marginTop: 4,
                      textAlign: msg.is_me ? 'right' : 'left'
                    }}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div style={{
            padding: 16,
            borderTop: `1px solid ${COLORS.border}`,
            background: COLORS.primary
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                placeholder="输入消息..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: COLORS.cardBgDark,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 24,
                  color: COLORS.text,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = COLORS.accent}
                onBlur={(e) => e.target.style.borderColor = COLORS.border}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                style={{
                  width: 46,
                  height: 46,
                  background: newMessage.trim() 
                    ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`
                    : '#444',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'transform 0.2s'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      ) : (
        // 未选中会话时的占位
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          padding: 40
        }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>选择一个会话</div>
          <div style={{ fontSize: 13, textAlign: 'center' }}>
            从左侧列表选择联系人开始聊天
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 20
    }}>
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: 800,
          height: '90vh',
          maxHeight: 700,
          background: COLORS.cardBgDark,
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: `1px solid ${COLORS.border}`
        }}
      >
        {/* 顶部标题栏 */}
        <div style={{
          padding: '16px 20px',
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Mail size={22} color={COLORS.accent} />
            <span style={{ fontWeight: 600, fontSize: 17, color: COLORS.text }}>消息中心</span>
            {totalUnread > 0 && (
              <span style={{
                background: COLORS.accent,
                color: 'white',
                padding: '3px 10px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600
              }}>{totalUnread}</span>
            )}
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 10,
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.text,
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 主体内容区 - 左右分栏 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          overflow: 'hidden',
          flexDirection: isMobileView ? 'column' : 'row'
        }}>
          {/* 移动端：根据状态显示列表或聊天 */}
          {isMobileView ? (
            showChat ? renderChatArea() : renderConversationList()
          ) : (
            <>
              {/* 桌面端：左右分栏 */}
              {renderConversationList()}
              {renderChatArea()}
            </>
          )}
        </div>
      </div>

      {/* 动画样式 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
