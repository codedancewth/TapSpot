import React from 'react'
import { MapPin, MessageCircle, Globe } from 'lucide-react'

function StatsPanel({ stats }) {
  return (
    <div className="space-y-3">
      <div className="stats-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="stats-number">{stats.total_spots.toLocaleString()}</div>
            <div className="stats-label">Total Spots</div>
          </div>
        </div>
      </div>

      <div className="stats-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="stats-number">{stats.total_reviews.toLocaleString()}</div>
            <div className="stats-label">Reviews</div>
          </div>
        </div>
      </div>

      <div className="stats-card">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="stats-number">{stats.total_countries.toLocaleString()}</div>
            <div className="stats-label">Countries</div>
          </div>
        </div>
      </div>

      <div className="stats-card mt-4">
        <div className="text-center">
          <p className="text-xs text-slate-400">Tap anywhere on the map</p>
          <p className="text-xs text-slate-500">to add a new spot</p>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel
