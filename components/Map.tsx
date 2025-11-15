'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  showBalloons?: boolean
  height?: string
}

export default function Map({ showBalloons = true, height = '500px' }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return

    mapRef.current = L.map(mapContainerRef.current).setView([0, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Always clear existing markers when showBalloons changes
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    if (!showBalloons) return

    const balloonLocations = [
      { lat: 34.05, lon: -118.24, id: 'W-1101' },
      { lat: 40.71, lon: -74.00, id: 'W-1102' },
      { lat: 51.50, lon: -0.12, id: 'W-1103' },
      { lat: 35.68, lon: 139.69, id: 'W-1104' },
      { lat: -33.86, lon: 151.20, id: 'W-1105' },
    ]

    balloonLocations.forEach(balloon => {
      const icon = L.divIcon({
        className: 'balloon-marker',
        html: '<div class="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>',
        iconSize: [12, 12],
      })

      const marker = L.marker([balloon.lat, balloon.lon], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`Balloon ${balloon.id}`)

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
    }
  }, [showBalloons])

  return <div ref={mapContainerRef} style={{ height, width: '100%' }} />
}
