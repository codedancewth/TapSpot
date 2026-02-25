import React, { useState, useEffect } from 'react'

// 文字选择 AI 分析组件
export default function TextSelectionAI({ onAnalyzeText }) {
  const [selectedText, setSelectedText] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      const text = selection.toString().trim()
      
      // 检查选中的文字是否在可分析的元素内（帖子内容、评论等）
      if (text && text.length > 0 && text.length < 200) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        
        // 检查是否在有效区域内
        const parentElement = range.commonAncestorContainer.parentElement
        const validTags = ['p', 'div', 'span', 'article', 'section']
        const isValidElement = parentElement && validTags.includes(parentElement.tagName.toLowerCase())
        
        if (isValidElement && rect.width > 0 && rect.height > 0) {
          setSelectedText(text)
          setTooltipPosition({
            top: rect.top - 50 + window.scrollY,
            left: rect.left + (rect.width / 2) + window.scrollX
          })
          setShowTooltip(true)
          return
        }
      }
      
      setShowTooltip(false)
      setSelectedText('')
    }

    // 延迟一点触发，确保选区已经更新
    const debouncedHandler = () => {
      setTimeout(handleSelectionChange, 100)
    }

    document.addEventListener('selectionchange', debouncedHandler)
    return () => document.removeEventListener('selectionchange', debouncedHandler)
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
        cursor: analyzing ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: analyzing ? 0.7 : 1
      }}
        onClick={analyzing ? null : handleAnalyze}
        onMouseEnter={(e) => {
          if (!analyzing) {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}
      >
        {analyzing ? (
          <>
            <span style={{ fontSize: 14 }}>🤔</span>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>阿尼亚分析中...</span>
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
