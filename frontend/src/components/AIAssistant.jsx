import React, { useState, useEffect } from 'react'

// AI 助手组件 - 活泼可爱的 AI 形象
export default function AIAssistant({ analyzing, analysis, onAnalyze, locationName }) {
  const [isJumping, setIsJumping] = useState(false)
  const [emotion, setEmotion] = useState('happy') // happy, thinking, excited

  // 分析时改变状态
  useEffect(() => {
    if (analyzing) {
      setEmotion('thinking')
      setIsJumping(true)
    } else if (analysis) {
      setEmotion('excited')
      setTimeout(() => setEmotion('happy'), 2000)
    } else {
      setEmotion('happy')
      setIsJumping(false)
    }
  }, [analyzing, analysis])

  // 自动跳动动画
  useEffect(() => {
    const interval = setInterval(() => {
      if (!analyzing) {
        setIsJumping(prev => !prev)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [analyzing])

  const getEmotion = () => {
    switch (emotion) {
      case 'thinking': return '🤔'
      case 'excited': return '✨'
      default: return '😊'
    }
  }

  const getBackgroundColor = () => {
    switch (emotion) {
      case 'thinking': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      case 'excited': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      default: return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 20,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }}>
      {/* 分析结果气泡 */}
      {analysis && (
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: 12,
          maxWidth: 280,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          marginBottom: 8,
          animation: 'fadeIn 0.3s ease',
          position: 'relative'
        }}>
          <div style={{
            fontSize: 13,
            color: '#333',
            lineHeight: 1.5
          }}>
            {analysis}
          </div>
          <button
            onClick={() => onAnalyze(null)}
            style={{
              position: 'absolute',
              top: 4,
              right: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              color: '#999'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* AI 助手形象 */}
      <div
        onClick={() => locationName && !analyzing && onAnalyze(locationName)}
        style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: getBackgroundColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          cursor: locationName ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isJumping ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
          boxShadow: analyzing
            ? '0 0 20px rgba(102, 126, 234, 0.6)'
            : '0 4px 12px rgba(0,0,0,0.2)',
          animation: analyzing ? 'pulse 1s infinite' : 'none',
          position: 'relative'
        }}
      >
        {getEmotion()}
        {analyzing && (
          <div style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 20,
            height: 20,
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12
          }}>
            ⚡
          </div>
        )}
      </div>

      {/* 提示文字 */}
      <div style={{
        fontSize: 11,
        color: '#666',
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 8px',
        borderRadius: 8
      }}>
        {analyzing ? 'AI 分析中...' : locationName ? '点击 AI 分析' : '选择位置后分析'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
