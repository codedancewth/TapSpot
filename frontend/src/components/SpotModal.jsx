import React, { useState, useEffect } from 'react'
import { X, Star, MapPin, Globe, Calendar, MessageCircle, Heart, Send, Edit, Trash2 } from 'lucide-react'
import axios from 'axios'

function SpotModal({ spot, onClose, onUpdate }) {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ author: '', content: '', rating: 5 })
  const [loading, setLoading] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  // 加载评论
  const loadReviews = async () => {
    try {
      const response = await axios.get(`/api/v1/spots/${spot.id}/reviews`)
      if (response.data.success) {
        setReviews(response.data.data.reviews)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [spot.id])

  // 提交新评论
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!newReview.content.trim() || !newReview.author.trim()) return

    try {
      setLoading(true)
      await axios.post(`/api/v1/spots/${spot.id}/reviews`, newReview)
      setNewReview({ author: '', content: '', rating: 5 })
      loadReviews()
      onUpdate()
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setLoading(false)
    }
  }

  // 点赞评论
  const handleLikeReview = async (reviewId) => {
    try {
      await axios.post(`/api/v1/reviews/${reviewId}/like`)
      loadReviews()
    } catch (error) {
      console.error('Failed to like review:', error)
    }
  }

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 渲染评分星星
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass rounded-2xl">
        {/* 头部 */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{spot.name}</h2>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Globe className="w-4 h-4" />
                    <span>{spot.country} {spot.city && `· ${spot.city}`}</span>
                    {spot.address && <span className="text-sm">· {spot.address}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="text-xl font-bold">{spot.rating > 0 ? spot.rating.toFixed(1) : 'No ratings'}</span>
                  </div>
                  <span className="text-slate-400">({spot.review_count} reviews)</span>
                </div>
                
                {spot.category && (
                  <span className="px-3 py-1 bg-slate-700/50 rounded-full text-sm">
                    {spot.category}
                  </span>
                )}
                
                <div className="text-sm text-slate-400">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Added {formatDate(spot.created_at)}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {spot.description && (
            <div className="mt-4 p-4 bg-slate-800/30 rounded-lg">
              <p className="text-slate-300">{spot.description}</p>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* 评论列表 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Reviews ({reviews.length})
              </h3>
            </div>
            
            {/* 评论表单 */}
            <div className="mb-6 p-4 bg-slate-800/30 rounded-xl">
              <h4 className="font-medium mb-3">Add Your Review</h4>
              <form onSubmit={handleSubmitReview}>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newReview.author}
                    onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                    placeholder="Your name"
                    className="w-full glass px-4 py-2 rounded-lg"
                    required
                  />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating })}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${rating <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    placeholder="Share your experience..."
                    rows="3"
                    className="w-full glass px-4 py-2 rounded-lg resize-none"
                    required
                  />
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {loading ? 'Posting...' : 'Post Review'}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* 评论列表 */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-slate-800/30 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">{review.author}</div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          {renderStars(review.rating)}
                          <span>·</span>
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLikeReview(review.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${review.likes > 0 ? 'fill-red-400 text-red-400' : ''}`} />
                        <span className="text-sm">{review.likes}</span>
                      </button>
                    </div>
                    <p className="text-slate-300">{review.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No reviews yet</p>
                  <p className="text-sm mt-1">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 地图预览 */}
          <div className="w-1/3 p-6 border-l border-slate-700/50">
            <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex flex-col items-center justify-center">
              <div className="text-center p-6">
                <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <div className="text-sm text-slate-400 mb-2">Location</div>
                <div className="text-lg font-semibold mb-1">
                  {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                </div>
                <div className="text-sm text-slate-400">
                  {spot.country} {spot.city && `· ${spot.city}`}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                <div className="text-xs text-slate-400 text-center">
                  This spot is visible to everyone on the map
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpotModal
