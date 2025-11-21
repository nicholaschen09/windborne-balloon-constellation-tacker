'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { BalloonInsight, FleetStats, HazardEvent, HazardProximity } from '@/lib/types'

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />
})

interface DashboardProps {
  balloons: BalloonInsight[]
  hazardEvents: HazardEvent[]
  hazardProximities: HazardProximity[]
  stats?: FleetStats
  lastUpdated?: string
  loading: boolean
}

export default function Dashboard({
  balloons,
  hazardEvents,
  hazardProximities,
  stats,
  lastUpdated,
  loading
}: DashboardProps) {
  const [view, setView] = useState<'map' | 'list' | 'analytics'>('map')

  const featuredBalloons = useMemo(() => {
    const sorted = [...balloons].sort((a, b) => b.driftKm - a.driftKm)
    return sorted.slice(0, 36)
  }, [balloons])

  return (
    <section className="py-8 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-slate-400 mb-2">WindBorne Tracker</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Atmospheric Data</h2>
            <p className="text-xs text-gray-500">
              Real-time balloon telemetry with hazard overlays so the UI always reflects what the project captures.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['map', 'list', 'analytics'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  view === mode
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)} View
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/70 p-6 min-h-[20rem] border border-slate-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-500 space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
              <p className="text-sm">Loading balloon data...</p>
            </div>
          ) : (
            <>
              {view === 'map' && (
                <div className="rounded-lg overflow-hidden">
                  <MapWithNoSSR balloons={balloons} hazardEvents={hazardEvents} height="500px" />
                </div>
              )}

              {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[32rem] overflow-y-auto pr-2">
                  {featuredBalloons.map((balloon) => (
                    <div
                      key={balloon.id}
                      className="border border-slate-100 rounded-xl p-3 hover:shadow-md transition-shadow bg-slate-50/60"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900">{balloon.id}</h3>
                          <p className="text-xs text-gray-500">
                            {balloon.current.lat.toFixed(2)}°, {balloon.current.lon.toFixed(2)}°
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-full capitalize">
                          {balloon.hemisphere}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <MetricRow label="Altitude" value={`${balloon.current.altitude?.toFixed(1) ?? '--'} km`} />
                        <MetricRow label="24h Drift" value={`${balloon.driftKm.toFixed(1)} km`} />
                        <MetricRow label="Avg Speed" value={`${balloon.avgSpeedKph.toFixed(1)} km/h`} />
                        <MetricRow
                          label="Altitude Trend (3h)"
                          value={
                            balloon.altitudeTrend3h != null
                              ? `${balloon.altitudeTrend3h >= 0 ? '+' : ''}${balloon.altitudeTrend3h.toFixed(1)} km`
                              : 'N/A'
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[32rem] overflow-y-auto pr-2">
                  <AnalyticsCard title="Altitude Snapshot">
                    <div className="space-y-1.5 text-xs">
                      <MetricRow label="Average altitude" value={`${stats?.avgAltitude?.toFixed(1) ?? '--'} km`} />
                      <MetricRow
                        label="Range"
                        value={`${stats?.minAltitude?.toFixed(1) ?? '--'} – ${stats?.maxAltitude?.toFixed(1) ?? '--'} km`}
                      />
                      <MetricRow label="Data points" value={stats?.dataPoints?.toLocaleString() ?? '--'} />
                      <MetricRow label="Grid coverage (10°)" value={`${stats?.coveragePercent?.toFixed(1) ?? '--'}%`} />
                    </div>
                  </AnalyticsCard>

                  <AnalyticsCard title="Hemisphere Split">
                    <div className="space-y-2 text-xs">
                      {(['north', 'equatorial', 'south'] as const).map((region) => {
                        const total = stats?.totalBalloons ?? 0
                        const value = stats?.hemisphereSplit?.[region] ?? 0
                        const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
                        return (
                          <div key={region}>
                            <div className="flex justify-between text-gray-600 capitalize">
                              <span>{region}</span>
                              <span>
                                {value} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded">
                              <div className="h-2 bg-gray-900 rounded" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AnalyticsCard>

                  <AnalyticsCard title="Hazards within 500 km">
                    {hazardProximities.length === 0 ? (
                      <p className="text-xs text-gray-500">No NASA hazards are currently within 500 km of a balloon.</p>
                    ) : (
                      <div className="space-y-2 text-xs">
                        {hazardProximities.map((match) => (
                          <div key={match.eventId} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between text-sm font-medium text-gray-900">
                              <span>{match.eventTitle}</span>
                              <span>{match.distanceKm} km</span>
                            </div>
                            <p className="text-xs text-gray-500 uppercase mt-1">
                              {match.category} • {match.balloonId}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </AnalyticsCard>

                  <AnalyticsCard title="Top Drift Leaders (24h)">
                    {stats?.driftLeaders?.length ? (
                      <div className="space-y-2 text-xs">
                        {stats.driftLeaders.map((leader) => (
                          <div key={leader.id} className="flex justify-between border-b border-gray-200 pb-2 last:border-b-0 last:pb-0 text-gray-900">
                            <span className="font-medium">{leader.id}</span>
                            <span>{leader.driftKm} km</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No drift data yet.</p>
                    )}
                  </AnalyticsCard>
                </div>
              )}
            </>
          )}
        </div>

        {lastUpdated && (
          <p className="text-[10px] text-gray-400 mt-2 text-right">
            refreshed {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </section>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function AnalyticsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
      <h3 className="text-sm font-semibold mb-3 text-gray-900">{title}</h3>
      {children}
    </div>
  )
}
