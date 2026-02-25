import React, { useState, useEffect } from 'react'

// 文字选择 AI 分析组件 - 简化版（结果显示在阿尼亚处）
export default function TextSelectionAI({ onAnalyzeText }) {
  const [selectedText, setSelectedText] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection.toString().trim()
      
      if (text && text.length > 0 && text.length < 500) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        const parentElement = range.commonAncestorContainer.parentElement
        const validTags = ['p', 'div', 'span', 'article', 'section', 'li']
        const isValidElement = parentElement && validTags.includes(parentElement.tagName.toLowerCase())
        
        if (isValidElement && rect.width > 0 && rect.height > 0) {
          setSelectedText(text)
          
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
          
          // 显示在选区右上方
          let top = rect.top + scrollTop - 40
          let left = rect.right + scrollLeft + 10
          
          if (left + 150 > window.innerWidth + scrollLeft) {
            left = rect.left + scrollLeft - 160
          }
          
          setTooltipPosition({ top, left })
          setShowTooltip(true)
          setAnalyzing(false)
          return
        }
      }
      
      setShowTooltip(false)
      setSelectedText('')
    }

    const debouncedHandler = () => setTimeout(handleSelectionChange, 100)
    document.addEventListener('selectionchange', debouncedHandler)
    return () => document.removeEventListener('selectionchange', debouncedHandler)
  }, [])

  const handleClick = async () => {
    if (!selectedText || analyzing) return
    
    setAnalyzing(true)
    try {
      await onAnalyzeText(selectedText)
    } catch (error) {
      console.error('AI 分析失败:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  if (!showTooltip) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 9998,
        animation: 'popIn 0.2s ease'
      }}
    >
      <button
        onClick={handleClick}
        disabled={analyzing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: analyzing ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 16,
          fontSize: 11,
          fontWeight: 600,
          cursor: analyzing ? 'not-allowed' : 'pointer',
          boxShadow: '0 3px 12px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!analyzing) {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 5px 16px rgba(102, 126, 234, 0.6)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 3px 12px rgba(102, 126, 234, 0.4)'
        }}
      >
        {analyzing ? (
          <>
            <span style={{ fontSize: 12 }}>🤔</span>
            <span>分析中...</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: 12 }}>✨</span>
            <span>AI 解析</span>
          </>
        )}
      </button>
      
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 12,
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid #667eea'
      }}/>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
