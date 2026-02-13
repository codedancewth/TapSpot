import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import axios from 'axios'
import { Search, Star, MapPin, X, Plus, Send, Globe, Users, MessageCircle, TrendingUp } from 'lucide-react'
import SpotModal from './components/SpotModal'
import CreateSpotModal from './components/CreateSpotModal'
import StatsPanel from './components/StatsPanel'
import CountryList from './components/CountryList'
import MapControls from './components/MapControls'
import './App.css'

// 修复 Leaflet 默认图标问题
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// 自定义标记图标
const createCustomIcon = (rating = 0) => {
  const color = rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : rating > 0 ? '#ef4444' : '#6366f1'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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

  // 加载spots数据
  const loadSpots = async (bounds = null) => {
    try {
      setLoading(true)
      let url = '/api/v1/spots?page_size=100'
      
      if (bounds) {
        url = `/api/v1/spots/bounds?min_lat=${bounds.min_lat}&max_lat=${bounds.max_lat}&min_lng=${bounds.min_lng}&max_lng=${bounds.max_lng}`
      }
      
      const response = await axios.get(url)
      if (response.data.success) {
        setSpots(bounds ? response.data.data : response.data.data.spots)
      }
    } catch (error) {
      console.error('Failed to load spots:', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await axios.get('/api/v1/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // 加载国家列表
  const loadCountries = async () => {
    try {
      const response = await axios.get('/api/v1/countries')
      if (response.data.success) {
        setCountries(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
    }
  }

  useEffect(() => {
    loadSpots()
    loadStats()
    loadCountries()
  }, [])

  // 点击地图创建新位置
  const handleMapClick = (latlng) => {
    setNewSpotCoords({ lat: latlng.lat, lng: latlng.lng })
    setShowCreateModal(true)
  }

  // 地图边界变化时重新加载数据
  const handleBoundsChange = (bounds) => {
    if (mapZoom > 5) {
      loadSpots(bounds)
    }
  }

  // 点击标记
  const handleMarkerClick = async (spot) => {
    try {
      const response = await axios.get(`/api/v1/spots/${spot.id}`)
      if (response.data.success) {
        setSelectedSpot(response.data.data)
        setShowSpotModal(true)
      }
    } catch (error) {
      console.error('Failed to load spot details:', error)
    }
  }

  // 搜索位置
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    try {
      const response = await axios.get(`/api/v1/spots?search=${searchQuery}`)
      if (response.data.success && response.data.data.spots.length > 0) {
        const firstSpot = response.data.data.spots[0]
        setMapCenter([firstSpot.latitude, firstSpot.longitude])
        setMapZoom(10)
      }
    } catch (error) {
      console.error('Search failed:', error)
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
          console.error('Geolocation error:', error)
          alert('Unable to get your location. Please check location permissions.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err)
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
    <div className="relative w-full h-full">
      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 glass px-4 py-3 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">TapSpot</h1>
              <p className="text-xs text-slate-400">Discover the world</p>
            </div>
          </div>

          {/* 搜索栏 */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places, countries..."
                className="w-full glass pl-12 pr-4 py-3 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </form>

          {/* 快捷按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`glass p-3 rounded-xl transition-all ${showStats ? 'ring-2 ring-blue-500/50' : ''}`}
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCountries(!showCountries)}
              className={`glass p-3 rounded-xl transition-all ${showCountries ? 'ring-2 ring-blue-500/50' : ''}`}
            >
              <Globe className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 左侧统计面板 */}
      {showStats && (
        <div className="absolute top-24 left-4 z-[1000] w-72">
          <StatsPanel stats={stats} />
        </div>
      )}

      {/* 右侧国家列表 */}
      {showCountries && (
        <div className="absolute top-24 right-4 z-[1000] w-64 max-h-[calc(100vh-150px)] overflow-y-auto">
          <CountryList countries={countries} />
        </div>
      )}

      {/* 地图 */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        zoomControl={true}
        dragging={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-slate-800">{spot.name}</h3>
                <p className="text-sm text-slate-600">{spot.country} {spot.city && `· ${spot.city}`}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium">{spot.rating > 0 ? spot.rating.toFixed(1) : 'No ratings'}</span>
                  <span className="text-xs text-slate-400">({spot.review_count} reviews)</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 地图控制面板 */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onCenterOnUser={handleCenterOnUser}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        currentZoom={mapZoom}
        maxZoom={18}
        minZoom={2}
      />

      {/* 底部提示 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        <div className="glass px-6 py-3 rounded-full flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-slate-300">Click anywhere on the map to add a new spot</span>
        </div>
      </div>

      {/* Loading指示器 */}
      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000]">
          <div className="glass p-4 rounded-xl">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      )}

      {/* 位置详情模态框 */}
      {showSpotModal && selectedSpot && (
        <SpotModal
          spot={selectedSpot}
          onClose={() => setShowSpotModal(false)}
          onUpdate={() => loadSpots()}
        />
      )}

      {/* 创建新位置模态框 */}
      {showCreateModal && newSpotCoords && (
        <CreateSpotModal
          coords={newSpotCoords}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSpotCreated}
        />
      )}
    </div>
  )
}

export default App
