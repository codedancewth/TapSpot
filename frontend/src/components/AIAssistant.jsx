import React, { useState, useEffect } from 'react'

// AI 助手组件 - 精致阿尼亚（双马尾蓝眼睛会跳舞版）
export default function AIAssistant({ analyzing, analysis, onAnalyze, locationName }) {
  const [isHovering, setIsHovering] = useState(false)
  const [emotion, setEmotion] = useState('happy')
  const [isDancing, setIsDancing] = useState(false)

  useEffect(() => {
    if (analyzing) {
      setEmotion('thinking')
      setIsDancing(false)
    } else if (analysis) {
      setEmotion('excited')
      setTimeout(() => setEmotion('happy'), 3000)
    } else {
      setEmotion('happy')
    }
  }, [analyzing, analysis])

  // 点击跳舞
  const handleClick = () => {
    if (locationName && !analyzing) {
      setIsDancing(true)
      onAnalyze(locationName)
      setTimeout(() => setIsDancing(false), 2000)
    }
  }

  // 精致阿尼亚 SVG - 双马尾蓝眼睛
  const getAnyaSVG = () => {
    // 阿尼亚配色
    const hairPink = '#ff85b3'        // 粉色头发
    const hairShadow = '#ff5c8a'      // 头发阴影
    const eyeBlue = '#4a9eff'         // 蓝色大眼睛
    const eyeHighlight = '#ffffff'    // 眼睛高光
    const skinColor = '#fff5eb'       // 白皙皮肤
    const blushColor = '#ffb6c1'      // 腮红
    const mouthColor = '#ff6b9d'      // 嘴巴
    const bowRed = '#ff4757'          // 蝴蝶结红色

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
      case 'surprised':
        expression = `
          <ellipse cx="38" cy="55" rx="9" ry="11" fill="white"/>
          <ellipse cx="54" cy="55" rx="9" ry="11" fill="white"/>
          <circle cx="39" cy="56" r="6" fill="${eyeBlue}"/>
          <circle cx="55" cy="56" r="6" fill="${eyeBlue}"/>
          <circle cx="41" cy="54" r="3" fill="white"/>
          <circle cx="57" cy="54" r="3" fill="white"/>
          <ellipse cx="48" cy="72" rx="4" ry="5" fill="${mouthColor}"/>
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
        <!-- 后发 -->
        <ellipse cx="45" cy="45" rx="35" ry="32" fill="${hairShadow}"/>
        
        <!-- 头发主体 -->
        <ellipse cx="45" cy="42" rx="32" ry="28" fill="${hairPink}"/>
        
        <!-- 双马尾（左侧） -->
        <ellipse cx="18" cy="52" rx="10" ry="20" fill="${hairPink}"/>
        <ellipse cx="16" cy="70" rx="6" ry="12" fill="${hairPink}"/>
        <!-- 左侧蝴蝶结 -->
        <path d="M 12 58 L 8 52 L 16 56 Z" fill="${bowRed}"/>
        <path d="M 12 58 L 16 52 L 10 56 Z" fill="${bowRed}"/>
        <circle cx="12" cy="58" r="2" fill="#ff6b7a"/>
        
        <!-- 双马尾（右侧） -->
        <ellipse cx="72" cy="52" rx="10" ry="20" fill="${hairPink}"/>
        <ellipse cx="74" cy="70" rx="6" ry="12" fill="${hairPink}"/>
        <!-- 右侧蝴蝶结 -->
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
      {analysis && (
        <div style={{
          background: 'white',
          borderRadius: 14,
          padding: 12,
          maxWidth: 280,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          marginBottom: 6,
          animation: 'slideIn 0.3s ease',
          position: 'relative',
          border: '2px solid #ff85b3'
        }}>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.6 }}>{analysis}</div>
          <button onClick={() => onAnalyze(null)} style={{
            position: 'absolute', top: 4, right: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 16, color: '#999'
          }}>×</button>
          <div style={{
            position: 'absolute', bottom: -6, right: 35,
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #ff85b3'
          }}/>
        </div>
      )}

      <div
        onMouseEnter={() => setIsHovering(true)}
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
          cursor: locationName ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isHovering ? 'scale(1.08)' : 'scale(1)',
          boxShadow: analyzing ? '0 0 25px rgba(255, 133, 179, 0.5)' : '0 3px 12px rgba(0,0,0,0.15)',
          animation: isDancing ? 'dance 0.6s ease infinite' : (analyzing ? 'pulse 1s infinite' : (isHovering ? 'bounce 0.5s ease' : 'none')),
          position: 'relative',
          border: '2.5px solid #ff85b3',
          overflow: 'hidden'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%' }} />
        {analyzing && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 24, height: 24,
            background: '#ff85b3', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, animation: 'spin 1s linear infinite'
          }}>⚡</div>
        )}
      </div>

      <div style={{
        fontSize: 10, color: '#666',
        background: 'rgba(255,255,255,0.9)',
        padding: '4px 10px', borderRadius: 10,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
        {analyzing ? '🤔 思考中...' : locationName ? '✨ 点我分析' : '📍 选位置后分析'}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(255, 133, 179, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 35px rgba(255, 133, 179, 0.7); }
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
