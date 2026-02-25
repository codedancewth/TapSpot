import React, { useState, useEffect, useRef } from 'react'

// 阿尼亚聊天组件
export default function AnyaChat({ isOpen, onClose, userId, userLocation }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const messagesEndRef = useRef(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 加载聊天历史
  useEffect(() => {
    if (isOpen && userId) {
      loadChatHistory()
    }
  }, [isOpen, userId])

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/chat/history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error)
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim()
    }

    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)
    setRecommendations([])

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          user_id: userId,
          latitude: userLocation?.lat || 0,
          longitude: userLocation?.lng || 0
        })
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMsg = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.data?.reply || '阿尼亚在想事情...'
        }
        setMessages(prev => [...prev, assistantMsg])

        // 如果有推荐
        if (data.data?.recommendations && data.data.recommendations.length > 0) {
          setRecommendations(data.data.recommendations)
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: '阿尼亚网络不太好，请稍后再试~ 😢'
        }])
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '阿尼亚出错了，请稍后再试~ 😢'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理按键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 打开地图导航
  const openNavigation = (lat, lng, name) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${name}`
    window.open(url, '_blank')
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      right: 100,
      bottom: 16,
      width: 400,
      height: 600,
      background: 'white',
      borderRadius: 16,
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '2px solid #50c878'
    }}>
      {/* 聊天头部 */}
      <div style={{
        background: 'linear-gradient(135deg, #50c878 0%, #667eea 100%)',
        padding: 16,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20
          }}>🥜</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>阿尼亚·福杰</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>在线 | 随时为您服务 ✨</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* 聊天消息区域 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        background: '#f8f9fa'
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#999',
            marginTop: 60,
            fontSize: 14
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
            <div>和阿尼亚聊聊天吧~</div>
            <div style={{ fontSize: 12, marginTop: 5 }}>问问她有什么好玩的打卡点！</div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: 16,
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'white',
              color: msg.role === 'user' ? 'white' : '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: 14,
              lineHeight: 1.5,
              wordBreak: 'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: 12
          }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: 16,
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              gap: 5
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#50c878',
                animation: 'bounce 1.4s infinite ease-in-out both'
              }}/>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#50c878',
                animation: 'bounce 1.4s infinite ease-in-out both 0.2s'
              }}/>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#50c878',
                animation: 'bounce 1.4s infinite ease-in-out both 0.4s'
              }}/>
            </div>
          </div>
        )}

        {/* 推荐打卡点 */}
        {recommendations.length > 0 && (
          <div style={{
            marginTop: 16,
            padding: 12,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontWeight: 'bold',
              marginBottom: 10,
              color: '#50c878',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              📍 阿尼亚推荐的打卡点
            </div>
            {recommendations.map((rec, index) => (
              <div
                key={rec.id || index}
                style={{
                  padding: 10,
                  marginBottom: index < recommendations.length - 1 ? 8 : 0,
                  borderRadius: 8,
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => openNavigation(rec.latitude, rec.longitude, rec.name)}
              >
                <div style={{ fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                  {rec.name}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  {rec.address || rec.description?.substring(0, 50)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: '#50c878' }}>
                    ⭐ {rec.rating?.toFixed(1) || 'N/A'} · 👍 {rec.like_count || 0}
                  </div>
                  {rec.distance && (
                    <div style={{ fontSize: 12, color: '#999' }}>
                      📍 {rec.distance.toFixed(2)}km
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{
        padding: 12,
        background: 'white',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        gap: 8
      }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="和阿尼亚聊天，问问有什么好玩的~"
          style={{
            flex: 1,
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 20,
            resize: 'none',
            height: 40,
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none'
          }}
          rows={1}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          style={{
            padding: '0 20px',
            background: inputMessage.trim() && !isLoading
              ? 'linear-gradient(135deg, #50c878 0%, #667eea 100%)'
              : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          发送
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
