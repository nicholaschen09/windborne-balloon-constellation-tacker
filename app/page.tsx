'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import HeroSection from '@/components/HeroSection'
import Dashboard from '@/components/Dashboard'

const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />
})

export default function Home() {
  const [balloonData, setBalloonData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBalloonData()
    const interval = setInterval(fetchBalloonData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchBalloonData = async () => {
    try {
      const response = await fetch('/api/balloons')
      const data = await response.json()
      setBalloonData(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching balloon data:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <HeroSection balloonCount={balloonData.length} />
      <Dashboard balloons={balloonData} loading={loading} />
    </>
  )
}
