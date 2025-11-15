'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-2xl" />
})

interface HeroSectionProps {
  balloonCount: number
}

export default function HeroSection({ balloonCount }: HeroSectionProps) {
  const [dataPoints, setDataPoints] = useState('--')
  const [coverage, setCoverage] = useState('--')

  useEffect(() => {
    // Simulate data points calculation
    if (balloonCount > 0) {
      setDataPoints((balloonCount * Math.floor(Math.random() * 100 + 50)).toLocaleString())
      setCoverage(`${Math.floor(Math.random() * 30 + 40)}%`)
    }
  }, [balloonCount])

  return (
    <section className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-white/30 backdrop-blur-sm"
           style={{
             clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)'
           }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Real Data + AI
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Atmospheric data is the biggest missing piece to improving modern forecasts.
              We fuse data from our constellation of weather balloons with state-of-the-art AI models
              to produce the most accurate weather forecasts.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-white/50 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-gray-900">{balloonCount || '--'}</div>
                <div className="text-sm text-gray-600 mt-1">Active Balloons</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-white/50 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-gray-900">{dataPoints}</div>
                <div className="text-sm text-gray-600 mt-1">Data Points Today</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-white/50 hover:scale-105 transition-transform">
                <div className="text-3xl font-bold text-gray-900">{coverage}</div>
                <div className="text-sm text-gray-600 mt-1">Global Coverage</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                EXPLORE LIVE DATA
              </button>
              <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-colors">
                LEARN MORE
              </button>
            </div>
          </div>

          {/* Right Map */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/50">
              <MapWithNoSSR showBalloons={true} height="500px" />
            </div>

            {/* Floating Balloon Info Card */}
            <div className="absolute top-4 right-4 bg-white rounded-xl p-4 shadow-lg max-w-xs animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-lg font-semibold">Pacific Ocean</div>
                  <div className="text-sm text-gray-500">Real-time tracking</div>
                </div>
                <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">W-1115</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ALTITUDE</span>
                  <span className="font-semibold">14.1 km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TEMPERATURE</span>
                  <span className="font-semibold">-53.9 °C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PRESSURE</span>
                  <span className="font-semibold">130.3 hPa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}