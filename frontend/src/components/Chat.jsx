import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Mail } from 'lucide-react'

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
const WS_URL = `ws://${window.location.host}/ws`

// 聊天组件
export function ChatWindow({ user, peerId, peerName, onClose, onMessageSent }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)

  // 获取历史消息
  useEffect(() => {
    fetchMessages()
    connectWebSocket()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [peerId])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('tapspot_token')
      const res = await fetch(`${API_BASE}/conversations/${peerId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('获取消息失败:', error)
    } finally {
      setLoading(false)
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
      if ((msg.sender_id === peerId && msg.receiver_id === user.id) ||
          (msg.sender_id === user.id && msg.receiver_id === peerId)) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender_id: msg.sender_id,
          sender_name: msg.sender_id === user.id ? user.nickname || user.username : peerName,
          content: msg.content,
          created_at: msg.created_at,
          is_me: msg.sender_id === user.id
        }])
      }
    }

    ws.onclose = () => {
      console.log('WebSocket 已断开')
      setWsConnected(false)
      // 3秒后重连
      setTimeout(connectWebSocket, 3000)
    }

    ws.onerror = (error) => {
      console.error('WebSocket 错误:', error)
    }

    wsRef.current = ws
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const messageData = {
      type: 'chat',
      receiver_id: parseInt(peerId),
      content: newMessage.trim()
    }

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
            receiver_id: parseInt(peerId),
            content: newMessage.trim()
          })
        })
        fetchMessages()
      } catch (error) {
        console.error('发送消息失败:', error)
      }
    }

    setNewMessage('')
    if (onMessageSent) onMessageSent()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 360,
      height: 500,
      background: COLORS.cardBgDark,
      borderRadius: 16,
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 3000,
      border: `1px solid ${COLORS.border}`,
      overflow: 'hidden'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 20px',
        background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            background: COLORS.accent,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16
          }}>👤</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: COLORS.text }}>{peerName}</div>
            <div style={{ fontSize: 11, color: wsConnected ? '#10b981' : '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: wsConnected ? '#10b981' : '#888' }}></span>
              {wsConnected ? '在线' : '离线'}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 8,
          width: 32,
          height: 32,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.text
        }}><X size={18} /></button>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid #333', borderTop: `2px solid ${COLORS.accent}`, borderRadius: '50%', margin: '0 auto 12px' }}></div>
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
              gap: 8
            }}>
              <div style={{
                width: 32,
                height: 32,
                background: msg.is_me ? COLORS.accent : COLORS.secondary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                flexShrink: 0
              }}>👤</div>
              <div style={{ maxWidth: '70%' }}>
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
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            style={{
              width: 44,
              height: 44,
              background: newMessage.trim() ? COLORS.accent : '#444',
              border: 'none',
              borderRadius: '50%',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// 会话列表组件
export function ConversationList({ user, onSelectConversation, onClose, unreadCount }) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
    // 每30秒刷新一次
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [])

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
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
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

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 320,
      maxHeight: 450,
      background: COLORS.cardBgDark,
      borderRadius: 16,
      boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 3000,
      border: `1px solid ${COLORS.border}`,
      overflow: 'hidden'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '16px 20px',
        background: `linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.primary} 100%)`,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mail size={20} color={COLORS.accent} />
          <span style={{ fontWeight: 600, fontSize: 16, color: COLORS.text }}>消息</span>
          {unreadCount > 0 && (
            <span style={{
              background: COLORS.accent,
              color: 'white',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600
            }}>{unreadCount}</span>
          )}
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 8,
          width: 32,
          height: 32,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.text
        }}><X size={18} /></button>
      </div>

      {/* 会话列表 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        maxHeight: 380
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div className="animate-spin" style={{ width: 24, height: 24, border: '2px solid #333', borderTop: `2px solid ${COLORS.accent}`, borderRadius: '50%', margin: '0 auto 12px' }}></div>
            加载中...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>暂无消息</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>去和其他用户聊聊吧~</div>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${COLORS.border}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: conv.unread_count > 0 ? 'rgba(233,69,96,0.1)' : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = COLORS.secondary}
              onMouseLeave={(e) => e.currentTarget.style.background = conv.unread_count > 0 ? 'rgba(233,69,96,0.1)' : 'transparent'}
            >
              <div style={{
                width: 44,
                height: 44,
                background: COLORS.accent,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
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
                  <span style={{ fontSize: 11, color: '#666' }}>{formatTime(conv.last_msg_time)}</span>
                </div>
                <div style={{
                  fontSize: 13,
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
                      fontWeight: 600
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
}

export default { ChatWindow, ConversationList }
