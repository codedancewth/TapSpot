import React, { useState, useEffect } from 'react'

// AI 助手组件 - 间谍过家家阿尼亚风格（优化版）
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

  // 阿尼亚风格 SVG - 更精细的绘制
  const getAnyaSVG = () => {
    const hairPink = '#ff6b9d'
    const hairDark = '#e84a7f'
    const eyeGreen = '#00b894'
    const skinColor = '#ffeaa7'
    const blushPink = '#fd79a8'
    
    let expression = ''
    switch (emotion) {
      case 'thinking':
        expression = `
          <ellipse cx="42" cy="60" rx="8" ry="10" fill="white"/>
          <ellipse cx="58" cy="60" rx="8" ry="10" fill="white"/>
          <circle cx="43" cy="60" r="4" fill="${eyeGreen}"/>
          <circle cx="59" cy="60" r="4" fill="${eyeGreen}"/>
          <circle cx="45" cy="58" r="2" fill="white"/>
          <circle cx="61" cy="58" r="2" fill="white"/>
          <path d="M 48 70 Q 50 71 52 70" stroke="#e84a7f" stroke-width="1.5" fill="none"/>
          <ellipse cx="72" cy="50" rx="5" ry="7" fill="#74b9ff" opacity="0.5"/>
        `
        break
      case 'excited':
        expression = `
          <ellipse cx="42" cy="60" rx="9" ry="11" fill="white"/>
          <ellipse cx="58" cy="60" rx="9" ry="11" fill="white"/>
          <circle cx="43" cy="60" r="5" fill="${eyeGreen}"/>
          <circle cx="59" cy="60" r="5" fill="${eyeGreen}"/>
          <circle cx="45" cy="58" r="2.5" fill="white"/>
          <circle cx="61" cy="58" r="2.5" fill="white"/>
          <ellipse cx="50" cy="72" rx="5" ry="3" fill="#e84a7f"/>
          <circle cx="35" cy="66" r="4" fill="${blushPink}" opacity="0.4"/>
          <circle cx="65" cy="66" r="4" fill="${blushPink}" opacity="0.4"/>
          <ellipse cx="74" cy="48" rx="6" ry="8" fill="#74b9ff" opacity="0.6"/>
        `
        break
      case 'surprised':
        expression = `
          <ellipse cx="42" cy="60" rx="10" ry="12" fill="white"/>
          <ellipse cx="58" cy="60" rx="10" ry="12" fill="white"/>
          <circle cx="43" cy="60" r="6" fill="${eyeGreen}"/>
          <circle cx="59" cy="60" r="6" fill="${eyeGreen}"/>
          <circle cx="45" cy="58" r="3" fill="white"/>
          <circle cx="61" cy="58" r="3" fill="white"/>
          <ellipse cx="50" cy="74" rx="4" ry="5" fill="#e84a7f"/>
        `
        break
      default:
        expression = `
          <ellipse cx="42" cy="60" rx="8" ry="10" fill="white"/>
          <ellipse cx="58" cy="60" rx="8" ry="10" fill="white"/>
          <circle cx="43" cy="60" r="4" fill="${eyeGreen}"/>
          <circle cx="59" cy="60" r="4" fill="${eyeGreen}"/>
          <circle cx="45" cy="58" r="2" fill="white"/>
          <circle cx="61" cy="58" r="2" fill="white"/>
          <path d="M 47 70 Q 50 73 53 70" stroke="#e84a7f" stroke-width="1.5" fill="none"/>
          <circle cx="35" cy="66" r="3" fill="${blushPink}" opacity="0.3"/>
          <circle cx="65" cy="66" r="3" fill="${blushPink}" opacity="0.3"/>
        `
    }

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- 后发 -->
        <ellipse cx="50" cy="48" rx="40" ry="35" fill="${hairDark}"/>
        
        <!-- 头发主体 -->
        <ellipse cx="50" cy="45" rx="36" ry="30" fill="${hairPink}"/>
        
        <!-- 两侧头发 -->
        <ellipse cx="22" cy="55" rx="14" ry="24" fill="${hairPink}"/>
        <ellipse cx="78" cy="55" rx="14" ry="24" fill="${hairPink}"/>
        
        <!-- 刘海 -->
        <path d="M 18 42 Q 28 32 38 44 Q 43 28 50 42 Q 57 28 62 44 Q 72 32 82 42" fill="${hairPink}"/>
        
        <!-- 脸 -->
        <ellipse cx="50" cy="62" rx="28" ry="26" fill="${skinColor}"/>
        
        <!-- 耳朵 -->
        <ellipse cx="22" cy="62" rx="6" ry="9" fill="${skinColor}"/>
        <ellipse cx="78" cy="62" rx="6" ry="9" fill="${skinColor}"/>
        
        <!-- 表情 -->
        ${expression}
        
        <!-- 眉毛 -->
        <path d="M 38 50 Q 42 48 46 50" stroke="${hairDark}" stroke-width="1.5" fill="none" opacity="0.5"/>
        <path d="M 54 50 Q 58 48 62 50" stroke="${hairDark}" stroke-width="1.5" fill="none" opacity="0.5"/>
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
          border: '2px solid #ff6b9d'
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
            borderTop: '8px solid #ff6b9d'
          }}/>
        </div>
      )}

      <div
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => locationName && !analyzing && onAnalyze(locationName)}
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: locationName ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isHovering ? 'scale(1.1)' : 'scale(1)',
          boxShadow: analyzing ? '0 0 30px rgba(255, 107, 157, 0.6)' : '0 4px 15px rgba(0,0,0,0.2)',
          animation: analyzing ? 'pulse 1s infinite' : (isHovering ? 'bounce 0.5s ease' : 'none'),
          position: 'relative',
          border: '3px solid #ff6b9d',
          overflow: 'hidden'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: getAnyaSVG() }} style={{ width: '100%', height: '100%' }} />
        {analyzing && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            width: 30, height: 30,
            background: '#ff6b9d', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, animation: 'spin 1s linear infinite'
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
