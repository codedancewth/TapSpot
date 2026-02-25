import React, { useState, useEffect } from 'react'

// AI 助手组件 - 阿尼亚·福杰（官方形象版）
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

  // 阿尼亚精致 SVG - 官方形象版（翡翠绿大眼睛 + 粉色长发）
  const getAnyaSVG = () => {
    const hairPink = '#ff85b3'
    const hairShadow = '#ff5c8a'
    const hairHighlight = '#ffb3d9'
    const skinColor = '#fff5eb'
    const blushColor = '#ffb6c1'
    const mouthColor = '#ff6b9d'
    const bowRed = '#ff4757'
    const eyeGreen = '#50c878' // 翡翠绿
    const eyeDark = '#2d5a3d'
    const hatBlack = '#1a1a2e'

    let expression = ''
    switch (emotion) {
      case 'thinking':
        // 思考时严肃认真，微微眯眼（花生模式）
        expression = `
          <!-- 翡翠绿大眼睛（思考时眯起） -->
          <ellipse cx="35" cy="55" rx="8" ry="6" fill="white"/>
          <ellipse cx="55" cy="55" rx="8" ry="6" fill="white"/>
          <circle cx="36" cy="55" r="4" fill="${eyeGreen}"/>
          <circle cx="56" cy="55" r="4" fill="${eyeGreen}"/>
          <circle cx="37" cy="53" r="2" fill="white"/>
          <circle cx="57" cy="53" r="2" fill="white"/>
          <!-- 认真眉毛 -->
          <path d="M 30 47 Q 35 49 40 47" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M 50 47 Q 55 49 60 47" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- 抿嘴思考 -->
          <path d="M 42 68 Q 48 70 54 68" stroke="${mouthColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <!-- 思考气泡 -->
          <ellipse cx="70" cy="46" rx="5" ry="7" fill="#87ceeb" opacity="0.6"/>
        `
        break
      case 'excited':
        // 兴奋时得意狡黠的"呵"式微笑
        expression = `
          <!-- 翡翠绿大眼睛（兴奋时闪亮） -->
          <ellipse cx="35" cy="55" rx="10" ry="8" fill="white"/>
          <ellipse cx="55" cy="55" rx="10" ry="8" fill="white"/>
          <circle cx="36" cy="55" r="5" fill="${eyeGreen}"/>
          <circle cx="56" cy="55" r="5" fill="${eyeGreen}"/>
          <circle cx="38" cy="53" r="3" fill="white"/>
          <circle cx="58" cy="53" r="3" fill="white"/>
          <circle cx="34" cy="57" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="54" cy="57" r="1.5" fill="white" opacity="0.8"/>
          <!-- 得意眉毛 -->
          <path d="M 28 46 Q 35 44 42 46" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M 48 46 Q 55 44 62 46" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- "呵"式狡黠微笑 -->
          <path d="M 40 67 Q 48 74 56 67" fill="${mouthColor}"/>
          <path d="M 42 67 Q 48 72 54 67" fill="white"/>
          <!-- 开心腮红 -->
          <circle cx="28" cy="63" r="5" fill="${blushColor}" opacity="0.5"/>
          <circle cx="62" cy="63" r="5" fill="${blushColor}" opacity="0.5"/>
          <!-- 兴奋汗珠 -->
          <ellipse cx="72" cy="44" rx="6" ry="8" fill="#87ceeb" opacity="0.7"/>
        `
        break
      default:
        // 默认天真无邪的笑容
        expression = `
          <!-- 翡翠绿大眼睛（清澈机敏） -->
          <ellipse cx="35" cy="55" rx="9" ry="7" fill="white"/>
          <ellipse cx="55" cy="55" rx="9" ry="7" fill="white"/>
          <circle cx="36" cy="55" r="4.5" fill="${eyeGreen}"/>
          <circle cx="56" cy="55" r="4.5" fill="${eyeGreen}"/>
          <circle cx="37" cy="53" r="2.5" fill="white"/>
          <circle cx="57" cy="53" r="2.5" fill="white"/>
          <circle cx="35" cy="57" r="1.5" fill="white" opacity="0.6"/>
          <circle cx="55" cy="57" r="1.5" fill="white" opacity="0.6"/>
          <!-- 自然眉毛 -->
          <path d="M 30 47 Q 35 46 40 47" stroke="${hairShadow}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <path d="M 50 47 Q 55 46 60 47" stroke="${hairShadow}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <!-- 天真笑容 -->
          <path d="M 40 67 Q 48 72 56 67" stroke="${mouthColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <!-- 可爱腮红 -->
          <circle cx="28" cy="63" r="4" fill="${blushColor}" opacity="0.35"/>
          <circle cx="62" cy="63" r="4" fill="${blushColor}" opacity="0.35"/>
        `
    }

    return `
      <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- 头发渐变 -->
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${hairHighlight};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${hairPink};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${hairShadow};stop-opacity:1" />
          </linearGradient>
          
          <!-- 皮肤渐变 -->
          <radialGradient id="skinGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#fff9f3;stop-opacity:1" />
            <stop offset="100%" style="stop-color:${skinColor};stop-opacity:1" />
          </radialGradient>
        </defs>
        
        <!-- 后发 -->
        <ellipse cx="45" cy="48" rx="36" ry="34" fill="${hairShadow}"/>
        <ellipse cx="45" cy="45" rx="33" ry="30" fill="url(#hairGradient)"/>
        
        <!-- 小黑帽/发饰（头顶） -->
        <path d="M 35 20 Q 45 16 55 20 L 58 24 Q 45 20 32 24 Z" fill="${hatBlack}"/>
        <circle cx="45" cy="19" r="3" fill="${bowRed}"/>
        
        <!-- 双马尾（左侧） -->
        <ellipse cx="16" cy="55" rx="9" ry="18" fill="url(#hairGradient)"/>
        <ellipse cx="14" cy="72" rx="5" ry="10" fill="url(#hairGradient)"/>
        <path d="M 10 60 L 6 54 L 14 58 Z" fill="${bowRed}"/>
        <path d="M 10 60 L 14 54 L 8 58 Z" fill="${bowRed}"/>
        <circle cx="10" cy="60" r="2" fill="#ff6b7a"/>
        
        <!-- 双马尾（右侧） -->
        <ellipse cx="74" cy="55" rx="9" ry="18" fill="url(#hairGradient)"/>
        <ellipse cx="76" cy="72" rx="5" ry="10" fill="url(#hairGradient)"/>
        <path d="M 80 60 L 84 54 L 76 58 Z" fill="${bowRed}"/>
        <path d="M 80 60 L 76 54 L 82 58 Z" fill="${bowRed}"/>
        <circle cx="80" cy="60" r="2" fill="#ff6b7a"/>
        
        <!-- 刘海（齐眉） -->
        <path d="M 20 42 Q 28 32 36 44 Q 41 28 45 42 Q 49 28 54 44 Q 62 32 70 42" fill="url(#hairGradient)"/>
        
        <!-- 两侧垂下的长发 -->
        <path d="M 20 50 Q 16 60 18 70" stroke="url(#hairGradient)" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M 70 50 Q 74 60 72 70" stroke="url(#hairGradient)" stroke-width="6" fill="none" stroke-linecap="round"/>
        
        <!-- 脸 -->
        <ellipse cx="45" cy="60" rx="25" ry="23" fill="url(#skinGradient)"/>
        
        <!-- 耳朵 -->
        <ellipse cx="20" cy="60" rx="4" ry="6" fill="${skinColor}"/>
        <ellipse cx="70" cy="60" rx="4" ry="6" fill="${skinColor}"/>
        
        <!-- 表情 -->
        ${expression}
        
        <!-- 鼻子 -->
        <circle cx="45" cy="64" r="1" fill="${blushColor}" opacity="0.3"/>
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
          border: '2px solid #50c878'
        }}>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>
            👋 哇库哇库~ 我是阿尼亚·福杰，有什么可以帮您 ✨
          </div>
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 35,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #50c878'
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
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  animation: 'pulse 1s ease infinite'
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

      {/* 阿尼亚形象 + 多彩渐变光晕 */}
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
          boxShadow: analyzing ? '0 0 0 0 rgba(80, 200, 120, 0)' : '0 3px 12px rgba(0,0,0,0.15)',
          animation: isDancing ? 'dance 0.6s ease infinite' : (isHovering ? 'bounce 0.5s ease' : 'none'),
          position: 'relative',
          border: '2.5px solid #50c878',
          overflow: 'visible'
        }}
      >
        {/* 多彩渐变光晕波纹效果（分析时显示） */}
        {analyzing && (
          <>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(80, 200, 120, 0.5) 0%, rgba(102, 126, 234, 0.3) 40%, rgba(118, 75, 162, 0.1) 70%, transparent 100%)',
              animation: 'ripple 1.5s ease-out infinite'
            }}/>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderImage: 'linear-gradient(45deg, #50c878, #667eea, #ffd700, #fd79a8) 1',
              animation: 'rippleBorder 1.5s ease-out infinite'
            }}/>
            <div style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #50c878, #667eea, #ffd700, #fd79a8, #50c878)',
              filter: 'blur(8px)',
              opacity: 0.6,
              animation: 'rotateGradient 3s linear infinite'
            }}/>
          </>
        )}
        
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }} />
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
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes rippleBorder {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes rotateGradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1.08) translateY(0); }
          50% { transform: scale(1.08) translateY(-4px); }
        }
        @keyframes dance {
          0%, 100% { transform: scale(1.08) translateY(0); }
          25% { transform: scale(1.08) translateY(-6px); }
          50% { transform: scale(1.08) translateY(0); }
          75% { transform: scale(1.08) translateY(-6px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
