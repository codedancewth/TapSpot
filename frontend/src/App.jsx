import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, Star, MapPin, X, Plus, Globe, TrendingUp, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import './styles/modern.css'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// 自定义标记图标
const createCustomIcon = (rating = 0) => {
  const color = rating >= 4.5 ? '#10b981' : rating >= 4 ? '#3b82f6' : rating >= 3 ? '#f59e0b' : '#667eea'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${rating > 0 ? rating.toFixed(1) : '★'}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

// 地图事件组件
function MapEvents({ onMapClick, onBoundsChange, onMapReady, onZoomChange }) {
  const map = useMap()
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])
  
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng)
      }
    },
    moveend: () => {
      if (onBoundsChange) {
        const bounds = map.getBounds()
        onBoundsChange({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lng: bounds.getWest(),
          max_lng: bounds.getEast(),
        })
      }
    },
    zoomend: () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom())
      }
    },
  })
  
  return null
}

function App() {
  const [spots, setSpots] = useState([])
  const [stats, setStats] = useState({ total_spots: 0, total_reviews: 0, total_countries: 0 })
  const [countries, setCountries] = useState([])
  const [showStats, setShowStats] = useState(true)
  const [showCountries, setShowCountries] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [mapCenter] = useState([20, 0])
  const [mapZoom, setMapZoom] = useState(2)
  const [mapRef, setMapRef] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [showSpotModal, setShowSpotModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSpotCoords, setNewSpotCoords] = useState(null)

  // API 基础 URL
  const API_BASE = 'http://43.130.53.168:8080/api/v1'

  // 加载spots数据
  const loadSpots = async (bounds = null) => {
    setLoading(true)
    try {
      let url = `${API_BASE}/spots?page_size=100`
      
      if (bounds) {
        url += `&min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lng=${bounds.min_lng}&max_lng=${bounds.max_lng}`
      }
      
      const response = await axios.get(url)
      if (response.data && response.data.success) {
        setSpots(response.data.data || [])
      }
    } catch (error) {
      console.error('加载地点失败:', error)
      setSpots([])
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`)
      if (response.data && response.data.success) {
        setStats(response.data.data || { total_spots: 0, total_reviews: 0, total_countries: 0 })
      }
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  // 加载国家数据
  const loadCountries = async () => {
    try {
      const response = await axios.get(`${API_BASE}/countries`)
      if (response.data && response.data.success) {
        setCountries(response.data.data || [])
      }
    } catch (error) {
      console.error('加载国家失败:', error)
      setCountries([])
    }
  }

  // 初始化
  useEffect(() => {
    loadSpots()
    loadStats()
    loadCountries()
  }, [])

  // 地图点击事件
  const handleMapClick = (latlng) => {
    setNewSpotCoords(latlng)
    setShowCreateModal(true)
  }

  // 地图边界变化事件
  const handleBoundsChange = (bounds) => {
    loadSpots(bounds)
  }

  // 标记点击事件
  const handleMarkerClick = (spot) => {
    setSelectedSpot(spot)
    setShowSpotModal(true)
  }

  // 搜索功能
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/spots?search=${encodeURIComponent(searchQuery)}`)
      if (response.data && response.data.success) {
        setSpots(response.data.data || [])
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 地图控制函数
  const handleZoomIn = () => {
    if (mapRef && mapZoom < 18) {
      mapRef.setZoom(mapZoom + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef && mapZoom > 2) {
      mapRef.setZoom(mapZoom - 1)
    }
  }

  const handleResetView = () => {
    if (mapRef) {
      mapRef.setView([20, 0], 2)
    }
  }

  // 更新地图引用
  const updateMapRef = (map) => {
    setMapRef(map)
  }

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <nav className="navbar">
        <div className="navbar-content">
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">📍</div>
            <div>
              <div className="logo-text">TapSpot</div>
              <div className="logo-subtitle">Discover Amazing Places</div>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-box">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索地点、国家..."
                className="search-input"
              />
            </form>
          </div>

          {/* 快捷按钮 */}
          <div className="nav-actions">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`nav-btn ${showStats ? 'active' : ''}`}
              title="统计数据"
            >
              <TrendingUp size={18} />
            </button>
            <button
              onClick={() => setShowCountries(!showCountries)}
              className={`nav-btn ${showCountries ? 'active' : ''}`}
              title="国家列表"
            >
              <Globe size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* 左侧统计面板 */}
      {showStats && (
        <div className="side-panel panel-left">
          <div className="stats-card">
            <div className="stats-title">
              <TrendingUp size={16} />
              实时统计
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.total_spots || 0}</div>
                <div className="stat-label">地点总数</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.total_reviews || 0}</div>
                <div className="stat-label">评论总数</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.total_countries || 0}</div>
                <div className="stat-label">国家数量</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">∞</div>
                <div className="stat-label">探索可能</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 右侧国家列表 */}
      {showCountries && countries.length > 0 && (
        <div className="side-panel panel-right">
          <div className="country-list">
            <div className="stats-title">
              <Globe size={16} />
              热门国家 ({countries.length})
            </div>
            {countries.map((country, index) => (
              <div key={index} className="country-item">
                <div className="country-name">
                  <span className="country-flag">{country.flag || '🌍'}</span>
                  {country.name || 'Unknown'}
                </div>
                <div className="country-count">{country.spot_count || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 地图 */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapEvents 
            onMapClick={handleMapClick} 
            onBoundsChange={handleBoundsChange}
            onMapReady={updateMapRef}
            onZoomChange={setMapZoom}
          />

          {/* 位置标记 */}
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={[spot.latitude, spot.longitude]}
              icon={createCustomIcon(spot.rating)}
              eventHandlers={{
                click: () => handleMarkerClick(spot),
              }}
            >
              <Popup>
                <div style={{ padding: '8px', minWidth: '200px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {spot.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    {spot.country} {spot.city && `· ${spot.city}`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontWeight: '600' }}>
                      {spot.rating > 0 ? spot.rating.toFixed(1) : '暂无评分'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      ({spot.review_count || 0} 条评论)
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 地图控制面板 */}
      <div className="map-controls">
        <div className="control-panel">
          <div className="control-buttons">
            <button onClick={handleZoomIn} className="control-btn" title="放大">
              <ZoomIn size={18} />
            </button>
            <button onClick={handleZoomOut} className="control-btn" title="缩小">
              <ZoomOut size={18} />
            </button>
            <button onClick={handleResetView} className="control-btn" title="重置视图">
              <RotateCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 底部提示 */}
      <div className="map-hint">
        <div className="hint-content">
          <Plus className="hint-icon" size={18} />
          <span className="hint-text">点击地图任意位置添加新地点</span>
        </div>
      </div>

      {/* 详情模态框 */}
      {showSpotModal && selectedSpot && (
        <div className="modal-overlay" onClick={() => setShowSpotModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedSpot.name}</h2>
              <button className="modal-close" onClick={() => setShowSpotModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <MapPin size={16} style={{ color: '#666' }} />
                  <span>{selectedSpot.country} {selectedSpot.city && `· ${selectedSpot.city}`}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: '600' }}>
                    {selectedSpot.rating > 0 ? selectedSpot.rating.toFixed(1) : '暂无评分'}
                  </span>
                  <span style={{ color: '#999', fontSize: '13px' }}>
                    ({selectedSpot.review_count || 0} 条评论)
                  </span>
                </div>
              </div>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                {selectedSpot.description || '暂无描述'}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSpotModal(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建地点模态框 */}
      {showCreateModal && newSpotCoords && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">添加新地点</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#666', marginBottom: '16px' }}>
                坐标: {newSpotCoords.lat.toFixed(4)}, {newSpotCoords.lng.toFixed(4)}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowCreateModal(false)
                  alert('地点添加功能开发中...')
                }}
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App