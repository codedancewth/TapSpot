import React, { useState, useEffect, useRef } from 'react'

// 文字选择 AI 分析组件 - 专业版
export default function TextSelectionAI({ onAnalyzeText }) {
  const [selectedText, setSelectedText] = useState('')
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [showAnalysis, setShowAnalysis] = useState(false)
  const analysisRef = useRef(null)

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
          
          // 计算右上角位置（不遮挡原文字）
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
          
          // 默认显示在右上方
          let top = rect.top + scrollTop - 10
          let left = rect.right + scrollLeft + 15
          
          // 如果右边空间不够，显示在左上方
          if (left + 350 > window.innerWidth + scrollLeft) {
            left = rect.left + scrollLeft - 365
          }
          
          // 如果上方空间不够，显示在下方
          if (top < scrollTop) {
            top = rect.bottom + scrollTop + 10
          }
          
          setTooltipPosition({ top, left })
          setShowTooltip(true)
          setAnalysis('')
          setShowAnalysis(false)
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

  const handleAnalyze = async () => {
    if (!selectedText) return
    
    setAnalyzing(true)
    setAnalysis('')
    setShowAnalysis(true)
    
    try {
      const data = await onAnalyzeText(selectedText)
      if (data && data.analysis) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('AI 分析失败:', error)
      setAnalysis('AI 分析失败：' + (error.message || '请稍后重试'))
    } finally {
      setAnalyzing(false)
    }
  }

  const handleClose = () => {
    setShowAnalysis(false)
    setAnalysis('')
    window.getSelection().removeAllRanges()
    setShowTooltip(false)
  }

  if (!showTooltip) return null

  return (
    <>
      {/* 分析按钮 */}
      {!showAnalysis && (
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
            onClick={handleAnalyze}
            disabled={analyzing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: analyzing ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s ease',
              opacity: analyzing ? 0.7 : 1,
              transform: analyzing ? 'scale(1)' : 'scale(1)',
              outline: 'none'
            }}
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
                <span>阿尼亚分析中...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 14 }}>✨</span>
                <span>AI 解析可玩性</span>
              </>
            )}
          </button>
          
          {/* 小三角指向选区 */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 20,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #667eea'
          }}/>
        </div>
      )}

      {/* 分析结果框 - 显示在选中文字右上角 */}
      {showAnalysis && (
        <div
          ref={analysisRef}
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: 350,
            maxHeight: 500,
            zIndex: 9999,
            animation: 'slideInRight 0.3s ease'
          }}
        >
          <div style={{
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '2px solid #667eea',
            overflow: 'hidden'
          }}>
            {/* 头部 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🤖</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>阿尼亚 AI 分析</span>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 16,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                ×
              </button>
            </div>
            
            {/* 内容区域 */}
            <div style={{
              padding: 16,
              maxHeight: 400,
              overflowY: 'auto'
            }}>
              {analyzing ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '30px 0',
                  gap: 12
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    border: '3px solid #e0e0e0',
                    borderTopColor: '#667eea',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}/>
                  <div style={{ color: '#666', fontSize: 13 }}>阿尼亚正在思考中...</div>
                </div>
              ) : analysis ? (
                <div style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: '#333'
                }}>
                  {analysis}
                </div>
              ) : null}
            </div>
            
            {/* 底部信息 */}
            {!analyzing && analysis && (
              <div style={{
                padding: '10px 16px',
                background: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: 11, color: '#999' }}>
                  📝 已分析 {selectedText.length} 字
                </div>
                <div style={{ fontSize: 11, color: '#999' }}>
                  最多支持 500 字
                </div>
              </div>
            )}
          </div>
          
          {/* 小三角指向选区 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: -8,
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #667eea'
          }}/>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
