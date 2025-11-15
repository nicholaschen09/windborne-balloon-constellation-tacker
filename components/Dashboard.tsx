'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />
})

interface DashboardProps {
  balloons: any[]
  loading: boolean
}

export default function Dashboard({ balloons, loading }: DashboardProps) {
  const [view, setView] = useState<'map' | 'list' | 'analytics'>('map')

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Live Atmospheric Data</h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'map'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'analytics'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-gray-500">Loading balloon data...</div>
            </div>
          ) : (
            <>
              {view === 'map' && (
                <div className="rounded-lg overflow-hidden">
                  <MapWithNoSSR height="600px" />
                </div>
              )}

              {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {balloons.map((balloon) => (
                    <div key={balloon.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{balloon.id}</h3>
                          <p className="text-sm text-gray-500">{balloon.location}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Altitude:</span>
                          <span className="font-medium">{balloon.altitude.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temperature:</span>
                          <span className="font-medium">{balloon.temperature.toFixed(1)} °C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wind Speed:</span>
                          <span className="font-medium">{balloon.windSpeed.toFixed(1)} km/h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Altitude Distribution</h3>
                    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Temperature Profile</h3>
                    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Coverage Heatmap</h3>
                    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Data Collection Rate</h3>
                    <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500">Chart placeholder</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}