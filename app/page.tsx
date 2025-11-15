'use client'

import { useCallback, useEffect, useState } from 'react'
import HeroSection from '@/components/HeroSection'
import Dashboard from '@/components/Dashboard'
import { BalloonInsight, FleetPayload } from '@/lib/types'

export default function Home() {
  const [payload, setPayload] = useState<FleetPayload | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBalloonData = useCallback(async () => {
    try {
      const response = await fetch('/api/balloons', { cache: 'no-store' })
      if (!response.ok) throw new Error('Fleet request failed')
      const data: FleetPayload = await response.json()
      setPayload(data)
    } catch (error) {
      console.error('Error fetching balloon data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalloonData()
    const interval = setInterval(fetchBalloonData, 60000)
    return () => clearInterval(interval)
  }, [fetchBalloonData])

  const balloons: BalloonInsight[] = payload?.balloons ?? []

  return (
    <>
      <HeroSection
        balloons={balloons}
        stats={payload?.stats}
        hazardEvents={payload?.hazardEvents ?? []}
      />
      <Dashboard
        balloons={balloons}
        hazardEvents={payload?.hazardEvents ?? []}
        hazardProximities={payload?.hazardProximities ?? []}
        stats={payload?.stats}
        lastUpdated={payload?.lastUpdated}
        loading={loading}
      />
    </>
  )
}
