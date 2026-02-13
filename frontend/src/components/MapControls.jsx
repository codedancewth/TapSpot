import React from 'react'
import { ZoomIn, ZoomOut, Navigation, Maximize, Minus, Plus, RotateCw, MapPin } from 'lucide-react'

const MapControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onResetView, 
  onToggleFullscreen,
  onCenterOnUser,
  isFullscreen,
  currentZoom,
  maxZoom = 18,
  minZoom = 2
}) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* 地图控制面板 */}
      <div className="glass p-3 rounded-xl shadow-xl">
        <div className="flex flex-col gap-2">
          {/* 缩放控制 */}
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs text-slate-300 font-medium">Zoom: {currentZoom}</div>
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${((currentZoom - minZoom) / (maxZoom - minZoom)) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* 缩放按钮 */}
            <button
              onClick={onZoomIn}
              disabled={currentZoom >= maxZoom}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-blue-400" />
            </button>
            
            <button
              onClick={onZoomOut}
              disabled={currentZoom <= minZoom}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-blue-400" />
            </button>
            
            {/* 导航按钮 */}
            <button
              onClick={onResetView}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center"
              title="Reset view"
            >
              <RotateCw className="w-5 h-5 text-green-400" />
            </button>
            
            <button
              onClick={onCenterOnUser}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center"
              title="Center on my location"
            >
              <MapPin className="w-5 h-5 text-amber-400" />
            </button>
          </div>
          
          {/* 全屏按钮 */}
          <button
            onClick={onToggleFullscreen}
            className="mt-2 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            {isFullscreen ? (
              <>
                <Minus className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-300">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-300">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 拖动提示 */}
      <div className="glass p-3 rounded-xl shadow-xl">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-400 animate-pulse" />
          <div className="text-xs text-slate-300">
            <div className="font-medium">Drag to explore</div>
            <div className="text-slate-400">Scroll to zoom • Double-click to add</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapControls