import React, { useState, useEffect } from 'react'

// AI 助手组件 - 阿尼亚 MOMO（墨镜酷酷版 + 多彩渐变光晕）
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

  // 阿尼亚精致 SVG - 时尚太阳镜版
  const getAnyaSVG = () => {
    const hairPink = '#ff85b3'
    const hairShadow = '#ff5c8a'
    const hairHighlight = '#ffb3d9'
    const skinColor = '#fff5eb'
    const blushColor = '#ffb6c1'
    const mouthColor = '#ff6b9d'
    const bowRed = '#ff4757'
    const sunglassesDark = '#0f0f1a'
    const sunglassesGradient = 'url(#sunglassesGradient)'

    let expression = ''
    switch (emotion) {
      case 'thinking':
        // 思考时太阳镜微微下滑
        expression = `
          <g transform="translate(0, 3)">
            <!-- 太阳镜框架 -->
            <path d="M 22 48 Q 35 45 45 48 Q 55 45 68 48 L 70 52 Q 55 58 45 55 Q 35 58 20 52 Z" fill="${sunglassesDark}"/>
            <!-- 镜片渐变 -->
            <ellipse cx="35" cy="51" rx="11" ry="7" fill="url(#lensGradient)"/>
            <ellipse cx="55" cy="51" rx="11" ry="7" fill="url(#lensGradient)"/>
            <!-- 镜腿 -->
            <path d="M 22 50 Q 16 48 14 46" stroke="#2d2d44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M 68 50 Q 74 48 76 46" stroke="#2d2d44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <!-- 反光 -->
            <path d="M 30 49 L 38 49" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
            <path d="M 50 49 L 58 49" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
          </g>
          <path d="M 45 68 Q 48 70 51 68" stroke="${mouthColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <ellipse cx="70" cy="48" rx="5" ry="7" fill="#87ceeb" opacity="0.5"/>
        `
        break
      case 'excited':
        // 兴奋时太阳镜反光增强
        expression = `
          <!-- 太阳镜框架 -->
          <path d="M 22 46 Q 35 43 45 46 Q 55 43 68 46 L 70 50 Q 55 56 45 53 Q 35 56 20 50 Z" fill="${sunglassesDark}"/>
          <!-- 镜片渐变 -->
          <ellipse cx="35" cy="49" rx="11" ry="7" fill="url(#lensGradient)"/>
          <ellipse cx="55" cy="49" rx="11" ry="7" fill="url(#lensGradient)"/>
          <!-- 镜腿 -->
          <path d="M 22 48 Q 16 46 14 44" stroke="#2d2d44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 68 48 Q 74 46 76 44" stroke="#2d2d44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 强反光 -->
            <ellipse cx="33" cy="47" rx="5" ry="3" fill="white" opacity="0.6"/>
            <ellipse cx="53" cy="47" rx="5" ry="3" fill="white" opacity="0.6"/>
          <ellipse cx="48" cy="70" rx="5" ry="3" fill="${mouthColor}"/>
          <circle cx="30" cy="64" r="4" fill="${blushColor}" opacity="0.4"/>
          <circle cx="62" cy="64" r="4" fill="${blushColor}" opacity="0.4"/>
          <ellipse cx="72" cy="46" rx="6" ry="8" fill="#87ceeb" opacity="0.6"/>
        `
        break
      default:
        // 默认酷酷表情 - 时尚太阳镜
        expression = `
          <!-- 太阳镜框架 -->
          <path d="M 22 46 Q 35 43 45 46 Q 55 43 68 46 L 70 50 Q 55 56 45 53 Q 35 56 20 50 Z" fill="url(#frameGradient)"/>
          <!-- 镜片渐变 -->
          <ellipse cx="35" cy="49" rx="11" ry="7" fill="url(#lensGradient)"/>
          <ellipse cx="55" cy="49" rx="11" ry="7" fill="url(#lensGradient)"/>
          <!-- 镜腿 -->
          <path d="M 22 48 Q 16 46 14 44" stroke="#2d2d44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 68 48 Q 74 46 76 44" stroke="#2d2d44" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 时尚反光 -->
          <path d="M 28 47 Q 35 46 40 47" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
          <path d="M 48 47 Q 55 46 60 47" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
          <path d="M 44 68 Q 48 70 52 68" stroke="${mouthColor}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <circle cx="30" cy="64" r="3" fill="${blushColor}" opacity="0.3"/>
          <circle cx="62" cy="64" r="3" fill="${blushColor}" opacity="0.3"/>
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
          
          <!-- 太阳镜镜片渐变 -->
          <linearGradient id="lensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2d2d44;stop-opacity:0.95" />
            <stop offset="50%" style="stop-color:#1a1a2e;stop-opacity:0.98" />
            <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
          </linearGradient>
          
          <!-- 太阳镜框架渐变 -->
          <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#3d3d5c;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#2d2d44;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- 后发 -->
        <ellipse cx="45" cy="48" rx="36" ry="34" fill="${hairShadow}"/>
        <ellipse cx="45" cy="45" rx="33" ry="30" fill="url(#hairGradient)"/>
        
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
        
        <!-- 刘海 -->
        <path d="M 20 42 Q 28 32 36 44 Q 41 28 45 42 Q 49 28 54 44 Q 62 32 70 42" fill="url(#hairGradient)"/>
        
        <!-- 脸 -->
        <ellipse cx="45" cy="60" rx="25" ry="23" fill="url(#skinGradient)"/>
        
        <!-- 耳朵 -->
        <ellipse cx="20" cy="60" rx="4" ry="6" fill="${skinColor}"/>
        <ellipse cx="70" cy="60" rx="4" ry="6" fill="${skinColor}"/>
        
        <!-- 眉毛（酷酷的平眉） -->
        <path d="M 30 46 Q 38 45 46 46" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M 44 46 Q 52 45 60 46" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
        
        <!-- 表情（墨镜） -->
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
          border: '2px solid #ffd700'
        }}>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>
            😎 嘿主人~ 我是超酷的阿尼亚 MOMO，有什么可以帮您 ✨
          </div>
          <div style={{
            position: 'absolute',
            bottom: -6,
            right: 35,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #ffd700'
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
          boxShadow: analyzing ? '0 0 0 0 rgba(255, 215, 0, 0)' : '0 3px 12px rgba(0,0,0,0.15)',
          animation: isDancing ? 'dance 0.6s ease infinite' : (isHovering ? 'bounce 0.5s ease' : 'none'),
          position: 'relative',
          border: '2.5px solid #ffd700',
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
              background: 'radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, rgba(102, 126, 234, 0.3) 40%, rgba(118, 75, 162, 0.1) 70%, transparent 100%)',
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
              borderImage: 'linear-gradient(45deg, #ffd700, #667eea, #00b894, #fd79a8) 1',
              animation: 'rippleBorder 1.5s ease-out infinite'
            }}/>
            <div style={{
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #ffd700, #667eea, #00b894, #fd79a8, #ffd700)',
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
        {analyzing ? '🤔 思考中...' : selectedText ? '✨ 点我分析文字' : locationTitle ? '✨ 点我分析位置' : '😎 点我打招呼'}
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
