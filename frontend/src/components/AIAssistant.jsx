import React, { useState, useEffect } from 'react'

// AI 助手组件 - 阿尼亚·福杰（官方形象版）
export default function AIAssistant({ analyzing, analysis, onAnalyze, locationTitle, onAnalyzeText, selectedText, onOpenChat }) {
  const [isHovering, setIsHovering] = useState(false)
  const [emotion, setEmotion] = useState('happy')
  const [isDancing, setIsDancing] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)
  const [greetingTimer, setGreetingTimer] = useState(null)
  const [isSinging, setIsSinging] = useState(false)
  const [hoverText, setHoverText] = useState('') // 悬停时的动态话语
  const [showHoverText, setShowHoverText] = useState(false) // 是否显示悬停话语

  // 阿尼亚悬停动态话语库
  const hoverTexts = [
    '哇~ 被发现啦！阿尼亚在这里等你哦~ ✨',
    '嘿嘿~ 想和阿尼亚一起玩吗？点我点我！🥜',
    '阿尼亚知道你在想什么哦...呵~ 😏'
  ]

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

  // 阿尼亚自动卖萌动作 - 每 10 秒随机做一次动作
  useEffect(() => {
    const autoActInterval = setInterval(() => {
      // 如果正在分析或跳舞，跳过
      if (analyzing || isDancing) return
      
      // 随机选择动作：0=眯眯眼卖萌，1=闭眼唱歌
      const randomAction = Math.random()
      
      if (randomAction < 0.5) {
        // 眯眯眼卖萌
        setEmotion('cute')
        setTimeout(() => {
          setEmotion('happy')
        }, 2000)
      } else {
        // 闭眼唱歌玩
        setIsSinging(true)
        setEmotion('singing')
        setTimeout(() => {
          setIsSinging(false)
          setEmotion('happy')
        }, 2500)
      }
    }, 10000) // 10 秒间隔
    
    return () => clearInterval(autoActInterval)
  }, [analyzing, isDancing])

  // 点击阿尼亚 - 直接打开聊天框
  const handleClick = () => {
    setEmotion('happy')
    
    // 优先打开聊天窗口
    if (onOpenChat) {
      onOpenChat()
      return
    }
    
    // 有选中文字时触发 AI 分析
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

  // 悬停时闭眼唱歌 + 显示动态话语
  const handleMouseEnter = () => {
    setIsHovering(true)
    
    // 随机选择一句动态话语
    const randomIndex = Math.floor(Math.random() * hoverTexts.length)
    setHoverText(hoverTexts[randomIndex])
    setShowHoverText(true)
    
    // 5 秒后自动消失
    const timer = setTimeout(() => {
      setShowHoverText(false)
    }, 5000)
    
    if (!analyzing && !isDancing) {
      setIsSinging(true)
      setEmotion('singing')
    }
    
    return () => clearTimeout(timer)
  }

  // 鼠标离开时停止唱歌
  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!analyzing && !isDancing) {
      setIsSinging(false)
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
      case 'singing':
        // 闭眼唱歌（可爱表情）
        expression = `
          <!-- 闭眼（弯弯的弧线） -->
          <path d="M 28 55 Q 35 52 42 55" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M 48 55 Q 55 52 62 55" stroke="${hairShadow}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- 开心唱歌嘴型 -->
          <ellipse cx="48" cy="70" rx="5" ry="4" fill="${mouthColor}"/>
          <!-- 陶醉腮红 -->
          <circle cx="28" cy="63" r="5" fill="${blushColor}" opacity="0.5"/>
          <circle cx="62" cy="63" r="5" fill="${blushColor}" opacity="0.5"/>
          <!-- 漂浮音符 -->
          <g class="singing-notes">
            <text x="70" y="40" font-size="14" fill="#50c878" opacity="0.8" class="floating-note">♪</text>
            <text x="75" y="35" font-size="12" fill="#667eea" opacity="0.6" class="floating-note-delay">♫</text>
            <text x="18" y="38" font-size="13" fill="#ffd700" opacity="0.7" class="floating-note-left">♬</text>
          </g>
        `
        break
      case 'cute':
        // 眯眯眼卖萌（超可爱）
        expression = `
          <!-- 眯眯眼（弯弯的月牙眼） -->
          <path d="M 30 55 Q 35 51 40 55" stroke="${eyeGreen}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M 50 55 Q 55 51 60 55" stroke="${eyeGreen}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 开心眯眯眼皱纹 -->
          <path d="M 32 52 Q 35 50 38 52" stroke="${eyeGreen}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
          <path d="M 52 52 Q 55 50 58 52" stroke="${eyeGreen}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/>
          <!-- 卖萌嘴型（小 O 型） -->
          <ellipse cx="48" cy="70" rx="3" ry="3.5" fill="${mouthColor}"/>
          <!-- 超红腮红 -->
          <circle cx="28" cy="63" r="6" fill="${blushColor}" opacity="0.6"/>
          <circle cx="62" cy="63" r="6" fill="${blushColor}" opacity="0.6"/>
          <!-- 卖萌星星 -->
          <text x="70" y="45" font-size="12" fill="#ffd700" opacity="0.9">✨</text>
          <text x="15" y="48" font-size="10" fill="#ffd700" opacity="0.7">⭐</text>
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
        onMouseLeave={handleMouseLeave}
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
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(80, 200, 120, 0.6) 0%, rgba(102, 126, 234, 0.4) 30%, rgba(118, 75, 162, 0.2) 60%, transparent 70%)',
              animation: 'ripple 1.5s ease-out infinite',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center'
            }}/>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(80, 200, 120, 0.5)',
              animation: 'rippleBorder 1.5s ease-out infinite',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center'
            }}/>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              animation: 'rippleBorder 1.5s ease-out 0.3s infinite',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center'
            }}/>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '140%',
              height: '140%',
              borderRadius: '50%',
              border: '2px solid rgba(255, 215, 0, 0.2)',
              animation: 'rippleBorder 1.5s ease-out 0.6s infinite',
              transform: 'translate(-50%, -50%)',
              transformOrigin: 'center'
            }}/>
          </>
        )}

        {/* 唱歌时的声波波纹 */}
        {isSinging && (
          <>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '2px solid rgba(80, 200, 120, 0.4)',
              animation: 'soundWave 1s ease-out infinite'
            }}/>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '2px solid rgba(102, 126, 234, 0.3)',
              animation: 'soundWave 1s ease-out 0.3s infinite'
            }}/>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              border: '2px solid rgba(255, 215, 0, 0.2)',
              animation: 'soundWave 1s ease-out 0.6s infinite'
            }}/>
          </>
        )}
        
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }} />
      </div>

      {/* 悬停动态话语泡泡 - 调整位置避免遮挡 */}
      {showHoverText && (
        <div style={{
          position: 'absolute',
          top: -60,
          left: '45%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #50c878 0%, #667eea 100%)',
          color: 'white',
          padding: '8px 14px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          boxShadow: '0 4px 15px rgba(80, 200, 120, 0.4)',
          whiteSpace: 'nowrap',
          zIndex: 10,
          animation: 'hoverTextPop 0.3s ease-out',
          maxWidth: '200px'
        }}>
          {hoverText}
          {/* 小三角 */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '55%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #50c878'
          }}/>
        </div>
      )}

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
        @keyframes hoverTextPop {
          0% { transform: translateX(-50%) translateY(10px) scale(0.9); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; }
        }
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          50% { opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        @keyframes rippleBorder {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
          50% { opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
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

      {/* 唱歌音符动画样式 */}
      <style>{`
        .singing-notes {
          animation: noteFloat 2s ease-in-out infinite;
        }
        .floating-note {
          animation: noteFloatUp 1.5s ease-out infinite;
        }
        .floating-note-delay {
          animation: noteFloatUp 1.5s ease-out 0.5s infinite;
        }
        .floating-note-left {
          animation: noteFloatUpLeft 1.5s ease-out 0.3s infinite;
        }
        @keyframes soundWave {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes noteFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(5deg); }
        }
        @keyframes noteFloatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-15px) scale(1.2); opacity: 0; }
        }
        @keyframes noteFloatUpLeft {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-12px) translateX(-5px) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
