import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { 
  Search, Star, MapPin, X, Plus, Send, Globe, Users, MessageCircle, 
  TrendingUp, ZoomIn, ZoomOut, RotateCw, MapPin as LocationIcon, 
  Maximize, Heart, Eye, Navigation, Compass
} from 'lucide-react'
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
  const color = rating >= 4.5 ? '#10b981' : rating >= 4 ? '#3b82f6' : rating >= 3 ? '#f59e0b' : rating > 0 ? '#ef4444' : '#667eea'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: 700;
          font-size: 13px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">
          ${rating > 0 ? rating.toFixed(1) : '★'}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
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
      onMapClick(e.latlng)
    },
    moveend: () => {
      const bounds = map.getBounds()
      onBoundsChange({
        min_lat: bounds.getSouth(),
        max_lat: bounds.getNorth(),
        min_lng: bounds.getWest(),
        max_lng: bounds.getEast(),
      })
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
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [showSpotModal, setShowSpotModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSpotCoords, setNewSpotCoords] = useState(null)
  const [stats, setStats] = useState({ total_spots: 0, total_reviews: 0, total_countries: 0 })
  const [countries, setCountries] = useState([])
  const [showStats, setShowStats] = useState(true)
  const [showCountries, setShowCountries] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [mapCenter, setMapCenter] = useState([20, 0])
  const [mapZoom, setMapZoom] = useState(2)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapRef, setMapRef] = useState(null)

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
      if (response.data.success) {
        setSpots(response.data.data)
      }
    } catch (error) {
      console.error('加载地点失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`)
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  // 加载国家数据
  const loadCountries = async () => {
    try {
      const response = await axios.get(`${API_BASE}/countries`)
      if (response.data.success) {
        setCountries(response.data.data)
      }
    } catch (error) {
      console.error('加载国家失败:', error)
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
  const handleMarkerClick = async (spot) => {
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
      if (response.data.success) {
        setSpots(response.data.data)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 创建新位置成功后刷新
  const handleSpotCreated = () => {
    loadSpots()
    loadStats()
    loadCountries()
    setShowCreateModal(false)
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

  const handleCenterOnUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapRef) {
            mapRef.setView([position.coords.latitude, position.coords.longitude], 12)
          }
        },
        (error) => {
          console.error('定位失败:', error)
          alert('无法获取您的位置，请检查位置权限')
        }
      )
    } else {
      alert('您的浏览器不支持定位功能')
    }
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('全屏失败:', err)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

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
                <div className="stat-value">{stats.total_spots}</div>
                <div className="stat-label">地点总数</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.total_reviews}</div>
                <div className="stat-label">评论总数</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.total_countries}</div>
                <div className="stat-label">国家数量</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">∞</div>
                <div className="stat-label">探索可能</div>
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="stats-card">
            <div className="stats-title">
              <Navigation size={16} />
              快捷操作
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleCenterOnUser}>
                <LocationIcon size={16} />
                定位我的位置
              </button>
              <button className="btn btn-secondary" onClick={handleResetView}>
                <Compass size={16} />
                重置视图
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右侧国家列表 */}
      {showCountries && (
        <div className="side-panel panel-right">
          <div className="country-list">
            <div className="stats-title">
              <Globe size={16} />
              热门国家 ({countries.length})
            </div>
            {countries.map((country, index) => (
              <div
                key={index}
                className="country-item"
                onClick={() => {
                  if (mapRef) {
                    mapRef.setView([country.center_lat || 0, country.center_lng || 0], 6)
                  }
                }}
              >
                <div className="country-name">
                  <span className="country-flag">{country.flag || '🌍'}</span>
                  {country.name}
                </div>
                <div className="country-count">{country.spot_count}</div>
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
          dragging={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          boxZoom={true}
          keyboard={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
              <Popup className="custom-popup">
                <div style={{ padding: '16px', minWidth: '240px' }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    marginBottom: '8px',
                    color: 'white'
                  }}>
                    {spot.name}
                  </h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-secondary)',
                    marginBottom: '12px'
                  }}>
                    {spot.country} {spot.city && `· ${spot.city}`}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <Star size={16} style={{ color: '#f59e0b' }} />
                    <span style={{ fontWeight: '600', color: 'white' }}>
                      {spot.rating > 0 ? spot.rating.toFixed(1) : '暂无评分'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({spot.review_count} 条评论)
                    </span>
                  </div>
                  <button 
                    style={{
                      width: '100%',
                      padding: '8px',
                      background: 'var(--primary-gradient)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                    onClick={() => handleMarkerClick(spot)}
                  >
                    查看详情
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 地图控制面板 */}
      <div className="map-controls">
        <div className="control-panel">
          <div className="zoom-display">
            <span className="zoom-label">缩放</span>
            <span className="zoom-value">{mapZoom}</span>
            <div className="zoom-bar">
              <div 
                className="zoom-progress"
                style={{ width: `${((mapZoom - 2) / (18 - 2)) * 100}%` }}
              />
            </div>
          </div>
          
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
            <button onClick={handleCenterOnUser} className="control-btn" title="定位">
              <LocationIcon size={18} />
            </button>
            <button onClick={handleToggleFullscreen} className="control-btn control-btn-full" title="全屏">
              <Maximize size={16} />
              <span style={{ marginLeft: '8px' }}>全屏模式</span>
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

      {/* 加载状态 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2000
        }}>
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

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
                  <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                  <span>{selectedSpot.country} {selectedSpot.city && `· ${selectedSpot.city}`}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} style={{ color: '#f59e0b' }} />
                  <span style={{ fontWeight: '600' }}>
                    {selectedSpot.rating > 0 ? selectedSpot.rating.toFixed(1) : '暂无评分'}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    ({selectedSpot.review_count} 条评论)
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                {selectedSpot.description || '暂无描述'}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span className="badge badge-primary">{selectedSpot.category || '景点'}</span>
                <span className="badge badge-success">热门</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSpotModal(false)}>
                关闭
              </button>
              <button className="btn btn-primary">
                <Heart size={16} />
                收藏
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
              <div className="form-group">
                <label className="form-label">地点名称</label>
                <input
                  type="text"
                  className="input"
                  placeholder="输入地点名称"
                  id="spotName"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">国家</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="国家"
                    id="spotCountry"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">城市</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="城市"
                    id="spotCity"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">分类</label>
                <select className="input" id="spotCategory">
                  <option value="Attraction">景点</option>
                  <option value="Restaurant">餐厅</option>
                  <option value="Hotel">酒店</option>
                  <option value="Shopping">购物</option>
                  <option value="Entertainment">娱乐</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">描述</label>
                <textarea
                  className="input"
                  rows="3"
                  placeholder="描述这个地点..."
                  id="spotDescription"
                />
              </div>
              <div style={{ 
                padding: '12px', 
                background: 'rgba(102, 126, 234, 0.1)', 
                borderRadius: '8px',
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}>
                📍 坐标: {newSpotCoords.lat.toFixed(6)}, {newSpotCoords.lng.toFixed(6)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                取消
              </button>
              <button 
                className="btn btn-primary"
                onClick={async () => {
                  const name = document.getElementById('spotName').value
                  const country = document.getElementById('spotCountry').value
                  const city = document.getElementById('spotCity').value
                  const category = document.getElementById('spotCategory').value
                  const description = document.getElementById('spotDescription').value
                  
                  if (!name || !country) {
                    alert('请填写地点名称和国家')
                    return
                  }
                  
                  try {
                    await axios.post(`${API_BASE}/spots`, {
                      name,
                      country,
                      city,
                      category,
                      description,
                      latitude: newSpotCoords.lat,
                      longitude: newSpotCoords.lng,
                    })
                    handleSpotCreated()
                    alert('地点添加成功！')
                  } catch (error) {
                    console.error('添加失败:', error)
                    alert('添加失败，请重试')
                  }
                }}
              >
                <Plus size={16} />
                添加地点
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App