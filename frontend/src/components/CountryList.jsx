import React from 'react'
import { ChevronRight } from 'lucide-react'

function CountryList({ countries }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <span className="gradient-text">Countries</span>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
          {countries.length}
        </span>
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {countries.map((country, index) => (
          <div
            key={country.country || index}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold">
                  {country.country ? country.country.substring(0, 2).toUpperCase() : '??'}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm">
                  {country.country || 'Unknown'}
                </div>
                <div className="text-xs text-slate-400">
                  {country.count} spots
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
        ))}
        
        {countries.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            <p>No countries found</p>
            <p className="text-xs mt-1">Add spots to see countries</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-400 text-center">
          Click a country to filter spots
        </p>
      </div>
    </div>
  )
}

export default CountryList
