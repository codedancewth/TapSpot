import React, { useState, useEffect } from 'react'

// AI 助手组件 - 阿尼亚 MOMO（头戴式耳机 + 光圈动画版）
export default function AIAssistant({ analyzing, analysis, onAnalyze, locationTitle, onAnalyzeText, selectedText }) {
  const [isHovering, setIsHovering] = useState(false)
  const [emotion, setEmotion] = useState('happy')
  const [isDancing, setIsDancing] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [greetingTimer, setGreetingTimer] = useState(null)

  // 表情管理
  useEffect(() => {
    if (analyzing) {
      setEmotion('thinking')
      setIsDancing(false)
      setShowGreeting(false)
    } else if (analysis) {
      setEmotion('excited')
      const timer = setTimeout(() => {
        setEmotion('happy')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [analyzing, analysis])

  // 点击阿尼亚
  const handleClick = () => {
    setEmotion('happy')
    
    if (selectedText && !analyzing) {
      setIsDancing(true)
      onAnalyzeText(selectedText)
      setTimeout(() => setIsDancing(false), 2000)
    } else if (locationTitle && !analyzing) {
      setIsDancing(true)
      onAnalyze(locationTitle)
      setTimeout(() => setIsDancing(false), 2000)
    } else {
      setShowGreeting(true)
      if (greetingTimer) clearTimeout(greetingTimer)
      const timer = setTimeout(() => setShowGreeting(false), 4000)
      setGreetingTimer(timer)
    }
  }

  // 悬停时显示微笑
  const handleMouseEnter = () => {
    setIsHovering(true)
    if (!analyzing && !isDancing) {
      setEmotion('happy')
    }
  }

  // 阿尼亚精致 SVG - 双马尾蓝眼睛 + 头戴式耳机
  const getAnyaSVG = () => {
    const hairPink = '#ff85b3'
    const hairShadow = '#ff5c8a'
    const eyeBlue = '#4a9eff'
    const skinColor = '#fff5eb'
    const blushColor = '#ffb6c1'
    const mouthColor = '#ff6b9d'
    const bowRed = '#ff4757'
    const headphoneBlack = '#2d3436'
    const headphoneAccent = '#ff6b9d'

    let expression = ''
    switch (emotion) {
      case 'thinking':
        expression = `
          <ellipse cx="38" cy="55" rx="7" ry="9" fill="white"/>
          <ellipse cx="54" cy="55" rx="7" ry="9" fill="white"/>
          <circle cx="39" cy="56" r="4" fill="${eyeBlue}"/>
          <circle cx="55" cy="56" r="4" fill="${eyeBlue}"/>
          <circle cx="41" cy="54" r="2" fill="white"/>
          <circle cx="57" cy="54" r="2" fill="white"/>
          <path d="M 45 68 Q 48 70 51 68" stroke="${mouthColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <ellipse cx="70" cy="48" rx="5" ry="7" fill="#87ceeb" opacity="0.5"/>
        `
        break
      case 'excited':
        expression = `
          <ellipse cx="38" cy="55" rx="8" ry="10" fill="white"/>
          <ellipse cx="54" cy="55" rx="8" ry="10" fill="white"/>
          <circle cx="39" cy="56" r="5" fill="${eyeBlue}"/>
          <circle cx="55" cy="56" r="5" fill="${eyeBlue}"/>
          <circle cx="41" cy="54" r="2.5" fill="white"/>
          <circle cx="57" cy="54" r="2.5" fill="white"/>
          <ellipse cx="48" cy="70" rx="5" ry="3" fill="${mouthColor}"/>
          <circle cx="30" cy="64" r="4" fill="${blushColor}" opacity="0.4"/>
          <circle cx="62" cy="64" r="4" fill="${blushColor}" opacity="0.4"/>
          <ellipse cx="72" cy="46" rx="6" ry="8" fill="#87ceeb" opacity="0.6"/>
        `
        break
      default:
        expression = `
          <ellipse cx="38" cy="55" rx="7" ry="9" fill="white"/>
          <ellipse cx="54" cy="55" rx="7" ry="9" fill="white"/>
          <circle cx="39" cy="56" r="4" fill="${eyeBlue}"/>
          <circle cx="55" cy="56" r="4" fill="${eyeBlue}"/>
          <circle cx="41" cy="54" r="2" fill="white"/>
          <circle cx="57" cy="54" r="2" fill="white"/>
          <path d="M 44 68 Q 48 72 52 68" stroke="${mouthColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <circle cx="30" cy="64" r="3" fill="${blushColor}" opacity="0.3"/>
          <circle cx="62" cy="64" r="3" fill="${blushColor}" opacity="0.3"/>
        `
    }

    return `
      <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
        <!-- 头戴式耳机（头梁） -->
        <path d="M 15 50 Q 15 25 45 25 Q 75 25 75 50" stroke="${headphoneBlack}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M 15 50 Q 15 30 45 30 Q 75 30 75 50" stroke="${headphoneAccent}" stroke-width="2" fill="none" stroke-linecap="round"/>
        
        <!-- 后发 -->
        <ellipse cx="45" cy="45" rx="35" ry="32" fill="${hairShadow}"/>
        
        <!-- 头发主体 -->
        <ellipse cx="45" cy="42" rx="32" ry="28" fill="${hairPink}"/>
        
        <!-- 双马尾（左侧） -->
        <ellipse cx="18" cy="52" rx="10" ry="20" fill="${hairPink}"/>
        <ellipse cx="16" cy="70" rx="6" ry="12" fill="${hairPink}"/>
        <path d="M 12 58 L 8 52 L 16 56 Z" fill="${bowRed}"/>
        <path d="M 12 58 L 16 52 L 10 56 Z" fill="${bowRed}"/>
        <circle cx="12" cy="58" r="2" fill="#ff6b7a"/>
        
        <!-- 双马尾（右侧） -->
        <ellipse cx="72" cy="52" rx="10" ry="20" fill="${hairPink}"/>
        <ellipse cx="74" cy="70" rx="6" ry="12" fill="${hairPink}"/>
        <path d="M 78 58 L 82 52 L 74 56 Z" fill="${bowRed}"/>
        <path d="M 78 58 L 74 52 L 80 56 Z" fill="${bowRed}"/>
        <circle cx="78" cy="58" r="2" fill="#ff6b7a"/>
        
        <!-- 刘海 -->
        <path d="M 15 40 Q 25 30 35 42 Q 40 26 45 40 Q 50 26 55 42 Q 65 30 75 40" fill="${hairPink}"/>
        
        <!-- 脸 -->
        <ellipse cx="45" cy="58" rx="24" ry="22" fill="${skinColor}"/>
        
        <!-- 耳朵 -->
        <ellipse cx="21" cy="58" rx="5" ry="7" fill="${skinColor}"/>
        <ellipse cx="69" cy="58" rx="5" ry="7" fill="${skinColor}"/>
        
        <!-- 头戴式耳机（耳罩 - 左侧） -->
        <ellipse cx="21" cy="58" rx="8" ry="10" fill="${headphoneBlack}"/>
        <ellipse cx="21" cy="58" rx="5" ry="7" fill="#4a4a4a"/>
        <circle cx="21" cy="58" r="3" fill="${headphoneAccent}" opacity="0.6"/>
        
        <!-- 头戴式耳机（耳罩 - 右侧） -->
        <ellipse cx="69" cy="58" rx="8" ry="10" fill="${headphoneBlack}"/>
        <ellipse cx="69" cy="58" rx="5" ry="7" fill="#4a4a4a"/>
        <circle cx="69" cy="58" r="3" fill="${headphoneAccent}" opacity="0.6"/>
        
        <!-- 眉毛 -->
        <path d="M 33 46 Q 38 44 43 46" stroke="${hairShadow}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 47 46 Q 52 44 57 46" stroke="${hairShadow}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        
        <!-- 表情 -->
        ${expression}
        
        <!-- 鼻子 -->
        <circle cx="45" cy="62" r="1" fill="${blushColor}" opacity="0.3"/>
      </svg>
    `
  }

  return (
    <div style={{
      position: 'fixed',
      right: 16,
      bottom: 16,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }}>
      {/* 问候语气泡 */}
      {showGreeting && !analysis && (
        <div style={{
          background: 'white',
          borderRadius: 14,
          padding: 12,
          maxWidth: 280,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          marginBottom: 6,
          animation: 'popIn 0.3s ease',
          position: 'relative',
          border: '2px solid #ff85b3'
        }}>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>
            👋 您好主人~ 我是您的专属阿尼亚 MOMO，有什么可以帮您 ✨
          </div>
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 35,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #ff85b3'
          }}/>
        </div>
      )}

      {/* AI 分析结果框 - 显示在阿尼亚上方 */}
      {(analyzing || analysis) && (
        <div style={{
          background: 'white',
          borderRadius: 14,
          padding: 12,
          width: 320,
          maxHeight: 400,
          overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          marginBottom: 6,
          animation: 'slideIn 0.3s ease',
          position: 'relative',
          border: '2px solid #667eea'
        }}>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>
            {analyzing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 16,
                  height: 16,
                  border: '2px solid #e0e0e0',
                  borderTopColor: '#667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}/>
                <span>阿尼亚正在思考中...</span>
              </div>
            ) : (
              analysis
            )}
          </div>
          {!analyzing && (
            <button
              onClick={() => onAnalyze(null)}
              style={{
                position: 'absolute',
                top: 6,
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
          )}
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 35,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #667eea'
          }}/>
        </div>
      )}

      {/* 阿尼亚形象 + 光圈动画 */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovering ? 'scale(1.08)' : 'scale(1)',
          boxShadow: analyzing ? '0 0 0 0 rgba(255, 133, 179, 0)' : '0 3px 12px rgba(0,0,0,0.15)',
          animation: isDancing ? 'dance 0.6s ease infinite' : (analyzing ? 'glow 1.5s ease infinite' : (isHovering ? 'bounce 0.5s ease' : 'none')),
          position: 'relative',
          border: '2.5px solid #ff85b3',
          overflow: 'visible'
        }}
      >
        {/* 光圈效果（分析时显示） */}
        {analyzing && (
          <div style={{
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#ff85b3',
            borderRightColor: '#ff85b3',
            animation: 'spin 2s linear infinite'
          }}/>
        )}
        
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }} />
      </div>

      {/* 提示文字 */}
      <div style={{
        fontSize: 10, color: '#666',
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 10px', borderRadius: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
        {analyzing ? '🤔 思考中...' : selectedText ? '✨ 点我分析文字' : locationTitle ? '✨ 点我分析位置' : '👋 点我打招呼'}
      </div>

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 133, 179, 0.4), 0 0 30px rgba(255, 133, 179, 0.2); }
          50% { box-shadow: 0 0 30px rgba(255, 133, 179, 0.6), 0 0 40px rgba(255, 133, 179, 0.4); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1.08) translateY(0); }
          50% { transform: scale(1.08) translateY(-4px); }
        }
        @keyframes dance {
          0%, 100% { transform: scale(1.08) rotate(-5deg) translateY(0); }
          25% { transform: scale(1.08) rotate(5deg) translateY(-6px); }
          50% { transform: scale(1.08) rotate(-5deg) translateY(0); }
          75% { transform: scale(1.08) rotate(5deg) translateY(-6px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
