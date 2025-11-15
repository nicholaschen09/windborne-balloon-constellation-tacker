'use client'

import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BalloonInsight, HazardEvent } from '@/lib/types'

interface MapProps {
  balloons: BalloonInsight[]
  hazardEvents: HazardEvent[]
  height?: string
}

export default function Map({ balloons, hazardEvents, height = '500px' }: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markerLayersRef = useRef<L.Layer[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([20, 0], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current)
    L.control
      .zoom({
        position: 'topright'
      })
      .addTo(mapRef.current)

    return () => {
      markerLayersRef.current.forEach((layer) => layer.remove())
      markerLayersRef.current = []
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  const altitudeDomain = useMemo(() => {
    const altitudes = balloons.map((balloon) => balloon.current.altitude).filter((alt): alt is number => typeof alt === 'number')
    if (!altitudes.length) return [0, 25]
    return [Math.min(...altitudes), Math.max(...altitudes)]
  }, [balloons])

  useEffect(() => {
    if (!mapRef.current) return

    markerLayersRef.current.forEach((layer) => layer.remove())
    markerLayersRef.current = []

    balloons.forEach((balloon) => {
      const color = altitudeToColor(balloon.current.altitude ?? 0, altitudeDomain)
      const icon = L.divIcon({
        className: 'balloon-marker',
        html: `<div style="width:14px;height:14px;border-radius:9999px;border:2px solid white;background:${color};box-shadow:0 0 6px rgba(0,0,0,0.25)"></div>`,
        iconSize: [14, 14]
      })

      const marker = L.marker([balloon.current.lat, balloon.current.lon], { icon })
        .bindPopup(`
          <strong>${balloon.id}</strong><br/>
          Alt: ${balloon.current.altitude?.toFixed(1) ?? '--'} km<br/>
          Drift: ${balloon.driftKm.toFixed(1)} km / 24h
        `)
        .addTo(mapRef.current!)
      markerLayersRef.current.push(marker)

      if (balloon.history.length > 1) {
        const path = L.polyline(balloon.history.map((p) => [p.lat, p.lon]), {
          color,
          weight: 1.2,
          opacity: 0.35
        }).addTo(mapRef.current!)
        markerLayersRef.current.push(path)
      }
    })

    hazardEvents.forEach((event) => {
      const hazardColor = getHazardColor(event.category)
      const hazardMarker = L.circleMarker([event.lat, event.lon], {
        radius: 9,
        color: hazardColor,
        weight: 2,
        fillColor: hazardColor,
        fillOpacity: 0.45
      })
        .addTo(mapRef.current!)
        .bindPopup(`<strong>${event.title}</strong><br/>Category: ${event.category}`)
      markerLayersRef.current.push(hazardMarker)
    })

    if (balloons.length) {
      const latLngs = balloons.map((balloon) => [balloon.current.lat, balloon.current.lon]) as [number, number][]
      const bounds = L.latLngBounds(latLngs)
      const currentZoom = mapRef.current.getZoom()
      const targetZoom = Math.min(mapRef.current.getBoundsZoom(bounds, false, [60, 60]), 4)
      if (balloons.length === 1) {
        mapRef.current.setView(bounds.getCenter(), 5)
      } else {
        mapRef.current.flyTo(bounds.getCenter(), currentZoom === targetZoom ? targetZoom : targetZoom, {
          duration: 0.5
        })
      }
    }
  }, [balloons, hazardEvents, altitudeDomain])

  return <div ref={mapContainerRef} style={{ height, width: '100%' }} />
}

function altitudeToColor(value: number, [min, max]: number[]) {
  if (max === min) return '#0ea5e9'
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const start = [14, 165, 233]
  const end = [147, 51, 234]
  const color = start.map((base, idx) => Math.round(base + (end[idx] - base) * ratio))
  return `rgb(${color.join(',')})`
}

function getHazardColor(category: string) {
  const palette: Record<string, string> = {
    Wildfires: '#f97316',
    'Severe Storms': '#0ea5e9',
    Volcanoes: '#e11d48',
    'Sea and Lake Ice': '#14b8a6'
  }
  return palette[category] ?? '#f43f5e'
}
