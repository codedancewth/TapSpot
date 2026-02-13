import React, { useState } from 'react'
import { X, MapPin, Globe, Building, Tag, FileText } from 'lucide-react'
import axios from 'axios'

function CreateSpotModal({ coords, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    city: '',
    address: '',
    category: '',
    latitude: coords.lat,
    longitude: coords.lng,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 常见国家列表
  const countries = [
    'United States', 'China', 'Japan', 'Germany', 'United Kingdom',
    'France', 'Italy', 'Canada', 'Australia', 'South Korea',
    'Spain', 'Mexico', 'Brazil', 'India', 'Russia'
  ]

  // 常见分类
  const categories = [
    'Restaurant', 'Hotel', 'Attraction', 'Park', 'Museum',
    'Shopping', 'Cafe', 'Bar', 'Beach', 'Mountain',
    'Historical', 'Nature', 'Urban', 'Rural', 'Other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await axios.post('/api/v1/spots', formData)
      
      if (response.data.success) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create spot:', error)
      setError(error.response?.data?.message || 'Failed to create spot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full max-w-md glass rounded-2xl">
        {/* 头部 */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Add New Spot</h2>
                <p className="text-sm text-slate-400">
                  {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* 名称 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Spot Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter spot name"
                className="w-full glass px-4 py-3 rounded-lg"
                required
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe this place..."
                rows="3"
                className="w-full glass px-4 py-3 rounded-lg resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 国家 */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full glass px-4 py-3 rounded-lg"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* 城市 */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City name"
                  className="w-full glass px-4 py-3 rounded-lg"
                />
              </div>
            </div>

            {/* 地址 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
                className="w-full glass px-4 py-3 rounded-lg"
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full glass px-4 py-3 rounded-lg"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 坐标信息 */}
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <div className="text-sm text-slate-400 mb-2">Location Coordinates</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Latitude</div>
                  <div className="font-mono text-sm">{coords.lat.toFixed(6)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Longitude</div>
                  <div className="font-mono text-sm">{coords.lng.toFixed(6)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Creating...' : 'Create Spot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSpotModal
