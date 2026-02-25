import React, { useState, useEffect } from 'react'

// AI 助手组件 - 间谍过家家阿尼亚风格
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

  // 阿尼亚风格 SVG
  const getAnyaSVG = () => {
    // 阿尼亚特征：粉色头发、绿色大眼睛、可爱表情
    const hairColor = '#ff6b9d'      // 粉色头发
    const hairDark = '#ff4d7d'       // 深粉色阴影
    const eyeColor = '#4ecdc4'       // 青绿色大眼睛
    const eyeWhite = '#ffffff'
    const skinColor = '#ffe4d6'      // 白皙皮肤
    const blushColor = '#ffb6c1'     // 腮红
    
    let expression = ''
    switch (emotion) {
      case 'thinking':
        // 思考表情 - 歪头 + 思考眼神
        expression = `
          <!-- 眼睛 -->
          <ellipse cx="42" cy="58" rx="9" ry="11" fill="${eyeWhite}"/>
          <ellipse cx="58" cy="58" rx="9" ry="11" fill="${eyeWhite}"/>
          <circle cx="44" cy="58" r="5" fill="${eyeColor}"/>
          <circle cx="60" cy="58" r="5" fill="${eyeColor}"/>
          <circle cx="46" cy="56" r="2" fill="white"/>
          <circle cx="62" cy="56" r="2" fill="white"/>
          <!-- 小嘴巴 -->
          <path d="M 48 68 Q 50 70 52 68" stroke="#ff6b9d" stroke-width="2" fill="none"/>
          <!-- 思考汗滴 -->
          <ellipse cx="70" cy="48" rx="6" ry="8" fill="#87ceeb" opacity="0.6"/>
        `
        break
      case 'excited':
        // 兴奋表情 - 星星眼！
        expression = `
          <!-- 星星眼 -->
          <g transform="translate(42,58)">
            <polygon points="0,-8 2,-3 8,-3 4,1 6,7 0,3 -6,7 -4,1 -8,-3 -2,-3" fill="${eyeColor}"/>
            <circle cx="0" cy="0" r="2" fill="white"/>
          </g>
          <g transform="translate(58,58)">
            <polygon points="0,-8 2,-3 8,-3 4,1 6,7 0,3 -6,7 -4,1 -8,-3 -2,-3" fill="${eyeColor}"/>
            <circle cx="0" cy="0" r="2" fill="white"/>
          </g>
          <!-- 开心嘴巴 -->
          <ellipse cx="50" cy="70" rx="6" ry="4" fill="#ff6b9d"/>
          <!-- 脸颊红晕 -->
          <ellipse cx="35" cy="65" rx="5" ry="3" fill="${blushColor}" opacity="0.5"/>
          <ellipse cx="65" cy="65" rx="5" ry="3" fill="${blushColor}" opacity="0.5"/>
          <!-- 兴奋汗滴 -->
          <ellipse cx="72" cy="45" rx="5" ry="7" fill="#87ceeb" opacity="0.7"/>
        `
        break
      case 'surprised':
        // 惊讶表情 - 哇库哇库！
        expression = `
          <!-- 大眼睛 -->
          <ellipse cx="42" cy="58" rx="10" ry="12" fill="${eyeWhite}"/>
          <ellipse cx="58" cy="58" rx="10" ry="12" fill="${eyeWhite}"/>
          <circle cx="44" cy="58" r="6" fill="${eyeColor}"/>
          <circle cx="60" cy="58" r="6" fill="${eyeColor}"/>
          <circle cx="46" cy="56" r="3" fill="white"/>
          <circle cx="62" cy="56" r="3" fill="white"/>
          <!-- 惊讶嘴巴 -->
          <ellipse cx="50" cy="72" rx="5" ry="6" fill="#ff6b9d"/>
          <!-- 惊讶线 -->
          <line x1="30" y1="50" x2="35" y2="45" stroke="#ff6b9d" stroke-width="2"/>
          <line x1="70" y1="50" x2="65" y2="45" stroke="#ff6b9d" stroke-width="2"/>
        `
        break
      default: // happy
        // 默认开心表情
        expression = `
          <!-- 大眼睛 -->
          <ellipse cx="42" cy="58" rx="9" ry="11" fill="${eyeWhite}"/>
          <ellipse cx="58" cy="58" rx="9" ry="11" fill="${eyeWhite}"/>
          <circle cx="44" cy="58" r="5" fill="${eyeColor}"/>
          <circle cx="60" cy="58" r="5" fill="${eyeColor}"/>
          <circle cx="46" cy="56" r="2" fill="white"/>
          <circle cx="62" cy="56" r="2" fill="white"/>
          <!-- 微笑嘴巴 -->
          <path d="M 46 68 Q 50 72 54 68" stroke="#ff6b9d" stroke-width="2" fill="none"/>
          <!-- 脸颊红晕 -->
          <ellipse cx="35" cy="65" rx="4" ry="2" fill="${blushColor}" opacity="0.4"/>
          <ellipse cx="65" cy="65" rx="4" ry="2" fill="${blushColor}" opacity="0.4"/>
        `
    }

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- 后发 -->
        <ellipse cx="50" cy="45" rx="38" ry="32" fill="${hairDark}"/>
        
        <!-- 头发主体 -->
        <ellipse cx="50" cy="42" rx="35" ry="28" fill="${hairColor}"/>
        
        <!-- 两侧头发 -->
        <ellipse cx="25" cy="50" rx="12" ry="22" fill="${hairColor}"/>
        <ellipse cx="75" cy="50" rx="12" ry="22" fill="${hairColor}"/>
        
        <!-- 刘海 -->
        <path d="M 20 40 Q 30 30 40 42 Q 45 25 50 40 Q 55 25 60 42 Q 70 30 80 40" fill="${hairColor}"/>
        
        <!-- 脸 -->
        <ellipse cx="50" cy="58" rx="26" ry="24" fill="${skinColor}"/>
        
        <!-- 耳朵 -->
        <ellipse cx="24" cy="58" rx="5" ry="8" fill="${skinColor}"/>
        <ellipse cx="76" cy="58" rx="5" ry="8" fill="${skinColor}"/>
        
        <!-- 表情 -->
        ${expression}
        
        <!-- 眉毛 -->
        <path d="M 38 48 Q 42 46 46 48" stroke="${hairDark}" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M 54 48 Q 58 46 62 48" stroke="${hairDark}" stroke-width="2" fill="none" opacity="0.6"/>
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
          border: '2px solid #ff6b9d'
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
            borderTop: '8px solid #ff6b9d'
          }}/>
        </div>
      )}

      {/* AI 助手形象 */}
      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => locationName && !analyzing && onAnalyze(locationName)}
        style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locationName ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isHovering ? 'scale(1.1)' : 'scale(1)',
          boxShadow: analyzing
            ? '0 0 30px rgba(255, 107, 157, 0.6)'
            : '0 4px 15px rgba(0,0,0,0.2)',
          animation: analyzing ? 'pulse 1s infinite' : (isHovering ? 'bounce 0.5s ease' : 'none'),
          position: 'relative',
          border: '3px solid #ff6b9d',
          overflow: 'hidden'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%' }} />
        
        {analyzing && (
          <div style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 28,
            height: 28,
            background: '#ff6b9d',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
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
        {analyzing ? '🤔 阿尼亚思考中...' : locationName ? '✨ 点击分析' : '📍 选择位置后分析'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255, 107, 157, 0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 107, 157, 0.8); }
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
