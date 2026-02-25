import React, { useState, useEffect } from 'react'

// AI 助手组件 - 可爱动漫女性形象
export default function AIAssistant({ analyzing, analysis, onAnalyze, locationName }) {
  const [isHovering, setIsHovering] = useState(false)
  const [emotion, setEmotion] = useState('happy') // happy, thinking, excited, surprised

  // 分析时改变状态
  useEffect(() => {
    if (analyzing) {
      setEmotion('thinking')
    } else if (analysis) {
      setEmotion('excited')
      setTimeout(() => setEmotion('happy'), 3000)
    } else {
      setEmotion('happy')
    }
  }, [analyzing, analysis])

  // 获取动漫角色图片（使用 SVG 绘制可爱形象）
  const getAvatarSVG = () => {
    const baseColor = '#ffb6c1' // 粉色系
    const hairColor = '#ff69b4' // 亮粉色头发
    const eyeColor = '#4169e1' // 蓝色大眼睛
    
    let expression = ''
    switch (emotion) {
      case 'thinking':
        expression = `
          <circle cx="75" cy="65" r="3" fill="${eyeColor}"/>
          <circle cx="85" cy="65" r="3" fill="${eyeColor}"/>
          <path d="M 78 72 Q 80 74 82 72" stroke="#ff69b4" stroke-width="2" fill="none"/>
          <circle cx="95" cy="58" r="8" fill="#ffb6c1" opacity="0.6"/>
        `
        break
      case 'excited':
        expression = `
          <circle cx="75" cy="65" r="5" fill="${eyeColor}"/>
          <circle cx="85" cy="65" r="5" fill="${eyeColor}"/>
          <circle cx="77" cy="63" r="2" fill="white"/>
          <circle cx="87" cy="63" r="2" fill="white"/>
          <path d="M 76 74 Q 80 78 84 74" stroke="#ff69b4" stroke-width="2" fill="none"/>
          <circle cx="95" cy="55" r="10" fill="#ffb6c1" opacity="0.8"/>
          <text x="90" y="52" fontSize="10">✨</text>
        `
        break
      case 'surprised':
        expression = `
          <circle cx="75" cy="65" r="6" fill="${eyeColor}"/>
          <circle cx="85" cy="65" r="6" fill="${eyeColor}"/>
          <circle cx="77" cy="63" r="2" fill="white"/>
          <circle cx="87" cy="63" r="2" fill="white"/>
          <ellipse cx="80" cy="75" rx="3" ry="4" fill="#ff69b4"/>
        `
        break
      default: // happy
        expression = `
          <path d="M 72 65 Q 75 62 78 65" stroke="${eyeColor}" stroke-width="2" fill="none"/>
          <path d="M 82 65 Q 85 62 88 65" stroke="${eyeColor}" stroke-width="2" fill="none"/>
          <path d="M 76 73 Q 80 77 84 73" stroke="#ff69b4" stroke-width="2" fill="none"/>
          <circle cx="95" cy="60" r="6" fill="#ffb6c1" opacity="0.5"/>
        `
    }

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- 头发背景 -->
        <ellipse cx="50" cy="45" rx="35" ry="30" fill="${hairColor}"/>
        <ellipse cx="30" cy="50" rx="10" ry="20" fill="${hairColor}"/>
        <ellipse cx="70" cy="50" rx="10" ry="20" fill="${hairColor}"/>
        
        <!-- 脸 -->
        <ellipse cx="50" cy="55" rx="28" ry="25" fill="${baseColor}"/>
        
        <!-- 刘海 -->
        <path d="M 25 45 Q 35 35 45 45 Q 50 30 55 45 Q 65 35 75 45" fill="${hairColor}"/>
        
        <!-- 眼睛和表情 -->
        ${expression}
        
        <!-- 腮红 -->
        <ellipse cx="70" cy="68" rx="4" ry="2" fill="#ff69b4" opacity="0.4"/>
        <ellipse cx="90" cy="68" rx="4" ry="2" fill="#ff69b4" opacity="0.4"/>
      </svg>
    `
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
          borderRadius: 16,
          padding: 14,
          maxWidth: 300,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          marginBottom: 8,
          animation: 'slideIn 0.3s ease',
          position: 'relative',
          border: '2px solid #ffb6c1'
        }}>
          <div style={{
            fontSize: 13,
            color: '#333',
            lineHeight: 1.6
          }}>
            {analysis}
          </div>
          <button
            onClick={() => onAnalyze(null)}
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#999'
            }}
          >
            ×
          </button>
          {/* 小三角 */}
          <div style={{
            position: 'absolute',
            bottom: -8,
            right: 40,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ffb6c1'
          }}/>
        </div>
      )}

      {/* AI 助手形象 */}
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => locationName && !analyzing && onAnalyze(locationName)}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locationName ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isHovering ? 'scale(1.1)' : 'scale(1)',
          boxShadow: analyzing
            ? '0 0 30px rgba(255, 105, 180, 0.6)'
            : '0 4px 15px rgba(0,0,0,0.2)',
          animation: analyzing ? 'pulse 1s infinite' : (isHovering ? 'bounce 0.5s ease' : 'none'),
          position: 'relative',
          border: '3px solid #ffb6c1',
          overflow: 'hidden'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: getAvatarSVG() }} style={{ width: '100%', height: '100%' }} />
        
        {analyzing && (
          <div style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 24,
            height: 24,
            background: '#ff69b4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            animation: 'spin 1s linear infinite'
          }}>
            ⚡
          </div>
        )}
      </div>

      {/* 提示文字 */}
      <div style={{
        fontSize: 11,
        color: '#666',
        background: 'rgba(255,255,255,0.95)',
        padding: '6px 12px',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {analyzing ? '🤔 AI 思考中...' : locationName ? '✨ 点击分析' : '📍 选择位置后分析'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255, 105, 180, 0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 105, 180, 0.8); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1.1) translateY(0); }
          50% { transform: scale(1.1) translateY(-5px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
