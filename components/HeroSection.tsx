'use client'

import { BalloonInsight, FleetStats, HazardEvent } from '@/lib/types'

interface HeroSectionProps {
  balloons: BalloonInsight[]
  stats?: FleetStats
  hazardEvents: HazardEvent[]
}

export default function HeroSection({ balloons, stats, hazardEvents }: HeroSectionProps) {

  const summary = {
    active: stats?.totalBalloons ?? balloons.length ?? 0,
    dataPoints: stats?.dataPoints ? stats.dataPoints.toLocaleString() : '--',
    coverage: stats?.coveragePercent ? `${stats.coveragePercent.toFixed(1)}%` : '--'
  }

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#e4f1ff] via-white to-white">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#b2d7ff]/40 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="space-y-8">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase text-slate-500 mb-4">Live Constellation</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                WindBorne Balloon Tracker
              </h1>
            </div>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>
                WindBorne builds a planetary-scale weather network. Every balloon reports its full 24h history,
                and we merge that telemetry with NASA&apos;s EONET hazard stream (wildfires, storms, volcanoes, sea-ice).
              </p>
              <p>
                The tracker below is purpose-built for this mission: the UI mirrors the name by foregrounding
                real-time trajectories, drift speeds, and hazard overlays so you instantly understand what the fleet is sampling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Active Balloons" value={summary.active || '--'} />
              <StatCard label="Data Points (24h)" value={summary.dataPoints} />
              <StatCard label="Coverage Grid" value={summary.coverage} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-colors">
                Explore Live Data
              </button>
              <button className="px-8 py-3 border-2 border-slate-900 text-slate-900 rounded-xl font-semibold hover:bg-slate-900 hover:text-white transition-colors">
                Download Latest Tracks
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500">
              <span>{hazardEvents.length} NASA hazards monitored</span>
            </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  const isLoading = value === '--'
  return (
    <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-slate-100">
      {isLoading ? (
        <div className="flex justify-center items-center h-9">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-900"></div>
        </div>
      ) : (
        <div className="text-3xl font-semibold text-slate-900">{value}</div>
      )}
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  )
}
