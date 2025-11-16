'use client'

import { useCallback, useEffect, useState } from 'react'
import HeroSection from '@/components/HeroSection'
import Dashboard from '@/components/Dashboard'
import { BalloonInsight, FleetPayload } from '@/lib/types'

interface FleetPageClientProps {
  initialPayload: FleetPayload | null
}

export default function FleetPageClient({ initialPayload }: FleetPageClientProps) {
  const [payload, setPayload] = useState<FleetPayload | null>(initialPayload)
  const [loading, setLoading] = useState(!initialPayload)

  const fetchBalloonData = useCallback(async (options?: { showSpinner?: boolean }) => {
    const showSpinner = options?.showSpinner ?? false
    if (showSpinner) setLoading(true)
    try {
      const response = await fetch('/api/balloons?fresh=1', { cache: 'no-store' })
      if (!response.ok) throw new Error('Fleet request failed')
      const data: FleetPayload = await response.json()
      setPayload(data)
    } catch (error) {
      console.error('Error fetching balloon data:', error)
    } finally {
      if (showSpinner) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalloonData({ showSpinner: !initialPayload })
    const interval = setInterval(() => fetchBalloonData(), 60000)
    return () => clearInterval(interval)
  }, [fetchBalloonData, initialPayload])

  const balloons: BalloonInsight[] = payload?.balloons ?? []

  return (
    <>
      <HeroSection balloons={balloons} stats={payload?.stats} hazardEvents={payload?.hazardEvents ?? []} />
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
