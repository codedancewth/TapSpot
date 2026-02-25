import React, { useState, useEffect } from 'react'

// AI 助手组件 - 间谍过家家阿尼亚风格（精致版）
export default function AIAssistant({ analyzing, analysis, onAnalyze, locationName }) {
  const [isHovering, setIsHovering] = useState(false)
  const [emotion, setEmotion] = useState('happy')

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

  // 阿尼亚精致版 SVG
  const getAnyaSVG = () => {
    // 阿尼亚经典配色
    const hairPink = '#ff7eb9'        // 亮粉色头发
    const hairShadow = '#ff5c9d'      // 头发阴影
    const eyeGreen = '#00d9a0'        // 青绿色大眼睛
    const eyeHighlight = '#ffffff'    // 眼睛高光
    const skinColor = '#fff0e3'       // 白皙皮肤
    const blushColor = '#ffb7c5'      // 腮红
    const mouthColor = '#ff6b8a'      // 嘴巴
    
    let expression = ''
    switch (emotion) {
      case 'thinking':
        // 思考表情 - 微微歪头，眼神向上
        expression = `
          <!-- 眼睛 -->
          <ellipse cx="40" cy="58" rx="9" ry="11" fill="white"/>
          <ellipse cx="60" cy="58" rx="9" ry="11" fill="white"/>
          <circle cx="42" cy="60" r="5" fill="${eyeGreen}"/>
          <circle cx="62" cy="60" r="5" fill="${eyeGreen}"/>
          <circle cx="44" cy="57" r="2.5" fill="white"/>
          <circle cx="64" cy="57" r="2.5" fill="white"/>
          <!-- 小嘴巴 -->
          <path d="M 47 72 Q 50 74 53 72" stroke="${mouthColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- 思考汗珠 -->
          <ellipse cx="75" cy="48" rx="6" ry="8" fill="#a8e6ff" opacity="0.6"/>
          <ellipse cx="77" cy="45" rx="3" ry="4" fill="#a8e6ff" opacity="0.5"/>
        `
        break
        
      case 'excited':
        // 兴奋表情 - 哇库哇库！星星眼
        expression = `
          <!-- 星星眼 -->
          <g transform="translate(40,58)">
            <polygon points="0,-10 2,-4 8,-4 4,0 6,8 0,3 -6,8 -4,0 -8,-4 -2,-4" fill="${eyeGreen}"/>
            <circle cx="0" cy="0" r="3" fill="white"/>
          </g>
          <g transform="translate(60,58)">
            <polygon points="0,-10 2,-4 8,-4 4,0 6,8 0,3 -6,8 -4,0 -8,-4 -2,-4" fill="${eyeGreen}"/>
            <circle cx="0" cy="0" r="3" fill="white"/>
          </g>
          <!-- 开心嘴巴 -->
          <ellipse cx="50" cy="74" rx="7" ry="4" fill="${mouthColor}"/>
          <ellipse cx="50" cy="73" rx="5" ry="2" fill="#ff99aa"/>
          <!-- 大红晕 -->
          <circle cx="32" cy="68" r="6" fill="${blushColor}" opacity="0.5"/>
          <circle cx="68" cy="68" r="6" fill="${blushColor}" opacity="0.5"/>
          <!-- 兴奋汗珠 -->
          <ellipse cx="78" cy="45" rx="7" ry="9" fill="#a8e6ff" opacity="0.7"/>
        `
        break
        
      case 'surprised':
        // 惊讶表情 - 哇！
        expression = `
          <!-- 大眼睛 -->
          <ellipse cx="40" cy="58" rx="11" ry="13" fill="white"/>
          <ellipse cx="60" cy="58" rx="11" ry="13" fill="white"/>
          <circle cx="42" cy="60" r="6" fill="${eyeGreen}"/>
          <circle cx="62" cy="60" r="6" fill="${eyeGreen}"/>
          <circle cx="44" cy="57" r="3" fill="white"/>
          <circle cx="64" cy="57" r="3" fill="white"/>
          <!-- 惊讶嘴巴 -->
          <ellipse cx="50" cy="75" rx="5" ry="7" fill="${mouthColor}"/>
          <ellipse cx="50" cy="74" rx="3" ry="4" fill="#ff99aa"/>
          <!-- 惊讶线 -->
          <path d="M 28 48 L 32 43" stroke="${mouthColor}" stroke-width="2" stroke-linecap="round"/>
          <path d="M 72 48 L 68 43" stroke="${mouthColor}" stroke-width="2" stroke-linecap="round"/>
        `
        break
        
      default:
        // 默认开心表情 - 微笑
        expression = `
          <!-- 大眼睛 -->
          <ellipse cx="40" cy="58" rx="9" ry="11" fill="white"/>
          <ellipse cx="60" cy="58" rx="9" ry="11" fill="white"/>
          <circle cx="42" cy="60" r="5" fill="${eyeGreen}"/>
          <circle cx="62" cy="60" r="5" fill="${eyeGreen}"/>
          <circle cx="44" cy="57" r="2.5" fill="white"/>
          <circle cx="64" cy="57" r="2.5" fill="white"/>
          <!-- 睫毛 -->
          <path d="M 31 52 Q 28 48 30 45" stroke="${hairShadow}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M 69 52 Q 72 48 70 45" stroke="${hairShadow}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <!-- 微笑嘴巴 -->
          <path d="M 46 72 Q 50 76 54 72" stroke="${mouthColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- 淡淡腮红 -->
          <ellipse cx="32" cy="68" rx="5" ry="3" fill="${blushColor}" opacity="0.35"/>
          <ellipse cx="68" cy="68" rx="5" ry="3" fill="${blushColor}" opacity="0.35"/>
        `
    }

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- 定义渐变 -->
        <defs>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${hairPink};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${hairShadow};stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 后发 -->
        <ellipse cx="50" cy="50" rx="42" ry="38" fill="${hairShadow}"/>
        
        <!-- 头发主体（带渐变） -->
        <ellipse cx="50" cy="46" rx="38" ry="32" fill="url(#hairGradient)"/>
        
        <!-- 两侧头发（阿尼亚特色小辫子） -->
        <ellipse cx="20" cy="58" rx="15" ry="26" fill="${hairPink}"/>
        <ellipse cx="80" cy="58" rx="15" ry="26" fill="${hairPink}"/>
        
        <!-- 刘海（阿尼亚特色三角形刘海） -->
        <path d="M 15 45 Q 25 32 35 47 Q 42 28 50 45 Q 58 28 65 47 Q 75 32 85 45" fill="${hairPink}"/>
        
        <!-- 小辫子装饰 -->
        <circle cx="20" cy="75" r="6" fill="${hairShadow}"/>
        <circle cx="80" cy="75" r="6" fill="${hairShadow}"/>
        
        <!-- 脸 -->
        <ellipse cx="50" cy="64" rx="30" ry="28" fill="${skinColor}"/>
        
        <!-- 耳朵 -->
        <ellipse cx="20" cy="64" rx="7" ry="10" fill="${skinColor}"/>
        <ellipse cx="80" cy="64" rx="7" ry="10" fill="${skinColor}"/>
        
        <!-- 眉毛 -->
        <path d="M 35 48 Q 40 45 45 48" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M 55 48 Q 60 45 65 48" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
        
        <!-- 表情 -->
        ${expression}
        
        <!-- 鼻子（小点） -->
        <circle cx="50" cy="66" r="1.5" fill="${blushColor}" opacity="0.4"/>
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
          border: '2px solid #ff7eb9'
        }}>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>{analysis}</div>
          <button onClick={() => onAnalyze(null)} style={{
            position: 'absolute', top: 6, right: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: '#999'
          }}>×</button>
          <div style={{
            position: 'absolute', bottom: -8, right: 40,
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ff7eb9'
          }}/>
        </div>
      )}

      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => locationName && !analyzing && onAnalyze(locationName)}
        style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locationName ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isHovering ? 'scale(1.1)' : 'scale(1)',
          boxShadow: analyzing ? '0 0 30px rgba(255, 126, 185, 0.6)' : '0 4px 15px rgba(0,0,0,0.2)',
          animation: analyzing ? 'pulse 1s infinite' : (isHovering ? 'bounce 0.5s ease' : 'none'),
          position: 'relative',
          border: '3px solid #ff7eb9',
          overflow: 'hidden'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%' }} />
        {analyzing && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            width: 32, height: 32,
            background: '#ff7eb9', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, animation: 'spin 1s linear infinite'
          }}>⚡</div>
        )}
      </div>

      <div style={{
        fontSize: 11, color: '#666',
        background: 'rgba(255,255,255,0.95)',
        padding: '6px 12px', borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {analyzing ? '🤔 阿尼亚思考中...' : locationName ? '✨ 点击分析' : '📍 选择位置后分析'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255, 126, 185, 0.6); }
          50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 126, 185, 0.8); }
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
