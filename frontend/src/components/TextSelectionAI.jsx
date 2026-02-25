import React, { useState, useEffect } from 'react'

// 文字选择 AI 分析组件
export default function TextSelectionAI({ onAnalyzeText }) {
  const [selectedText, setSelectedText] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection.toString().trim()
      
      if (text && text.length > 0 && text.length < 200) {
        setSelectedText(text)
        
        // 获取选区位置
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        setTooltipPosition({
          top: rect.top - 50,
          left: rect.left + (rect.width / 2)
        })
        setShowTooltip(true)
      } else {
        setShowTooltip(false)
        setSelectedText('')
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  const handleAnalyze = async () => {
    if (!selectedText) return
    
    setAnalyzing(true)
    try {
      await onAnalyzeText(selectedText)
    } catch (error) {
      console.error('AI 分析失败:', error)
    } finally {
      setAnalyzing(false)
      setShowTooltip(false)
    }
  }

  if (!showTooltip) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        animation: 'popIn 0.2s ease'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '8px 16px',
        borderRadius: 20,
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
        onClick={handleAnalyze}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
      >
        {analyzing ? (
          <>
            <span style={{ fontSize: 14 }}>🤔</span>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>AI 分析中...</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 14 }}>✨</span>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>AI 解析可玩性</span>
          </>
        )}
      </div>

      {/* 小三角 */}
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid #667eea'
      }}/>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.8); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  )
}
