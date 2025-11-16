import { NextResponse } from 'next/server'
import { BalloonHistoryPoint, BalloonInsight, FleetPayload, FleetStats, HazardEvent, HazardProximity } from '@/lib/types'

const WINDBORNE_BASE_URL = 'https://a.windbornesystems.com/treasure'
const HOUR_FILES = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const GRID_DEG = 10
const EARTH_RADIUS_KM = 6371
const COVERAGE_CELLS = (180 / GRID_DEG) * (360 / GRID_DEG)

type RawPoint = [number, number, number?]
type ClosestMatch = { balloonId: string; distance: number }

export async function GET() {
  try {
    const [snapshots, hazardEvents] = await Promise.all([fetchSnapshots(), fetchHazardEvents()])
    const balloons = buildFleetFromSnapshots(snapshots)
    const hazardProximities = matchBalloonsToHazards(balloons, hazardEvents)
    const stats = buildFleetStats(balloons, hazardEvents.length, hazardProximities.length)

    const payload: FleetPayload = {
      balloons,
      stats,
      hazardEvents,
      hazardProximities,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to fetch live fleet data', error)
    return NextResponse.json({ error: 'Failed to fetch fleet data' }, { status: 500 })
  }
}

async function fetchSnapshots() {
  const now = Date.now()
  const requests = HOUR_FILES.map(async (hourKey) => {
    const offsetHours = parseInt(hourKey, 10)
    const url = `${WINDBORNE_BASE_URL}/${hourKey}.json`
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Snapshot ${hourKey} failed with status ${response.status}`)
      }
      const body = await response.json()
      if (!Array.isArray(body)) return null
      const timestamp = new Date(now - offsetHours * 3600000).toISOString()
      const points = body.filter(isValidPoint)
      return { timestamp, offsetHours, points }
    } catch (error) {
      console.warn(`Unable to load snapshot ${hourKey}`, error)
      return null
    }
  })

  const results = await Promise.all(requests)
  return results.filter(Boolean) as { timestamp: string; offsetHours: number; points: RawPoint[] }[]
}

function isValidPoint(point: unknown): point is RawPoint {
  return (
    Array.isArray(point) &&
    point.length >= 2 &&
    typeof point[0] === 'number' &&
    typeof point[1] === 'number' &&
    (typeof point[2] === 'number' || point[2] === undefined)
  )
}

function buildFleetFromSnapshots(snapshots: { timestamp: string; offsetHours: number; points: RawPoint[] }[]) {
  const map = new Map<number, BalloonHistoryPoint[]>()

  const orderedSnapshots = snapshots.sort((a, b) => a.offsetHours - b.offsetHours)
  orderedSnapshots.forEach(({ timestamp, points }) => {
    points.forEach((point, index) => {
      const [lat, lon, altitude] = point
      if (!map.has(index)) {
        map.set(index, [])
      }
      const history = map.get(index)!
      history.push({
        timestamp,
        lat,
        lon,
        altitude: typeof altitude === 'number' ? altitude : null
      })
    })
  })

  const balloons: BalloonInsight[] = []
  for (const [index, history] of map.entries()) {
    if (history.length === 0) continue
    const sortedHistory = history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const current = sortedHistory[sortedHistory.length - 1]
    const start = sortedHistory[0]
    const driftKm = start ? haversineKm(start, current) : 0
    const hoursCovered = sortedHistory.length - 1
    const avgSpeedKph = hoursCovered > 0 ? driftKm / hoursCovered : 0
    const altitudes = sortedHistory.map((p) => p.altitude).filter((v): v is number => typeof v === 'number')
    const altitudeRangeKm = altitudes.length
      ? Math.max(...altitudes) - Math.min(...altitudes)
      : 0
    const trendPoint = sortedHistory[Math.max(0, sortedHistory.length - 4)]
    const altitudeTrend3h =
      current.altitude != null && trendPoint?.altitude != null
        ? current.altitude - trendPoint.altitude
        : null
    const hemisphere: BalloonInsight['hemisphere'] =
      current.lat > 5 ? 'north' : current.lat < -5 ? 'south' : 'equatorial'

    balloons.push({
      id: `WB-${index.toString().padStart(4, '0')}`,
      history: sortedHistory,
      current,
      driftKm,
      avgSpeedKph,
      altitudeRangeKm,
      altitudeTrend3h,
      hemisphere
    })
  }

  return balloons
}

function buildFleetStats(balloons: BalloonInsight[], hazardEventCount: number, hazardMatches: number): FleetStats {
  const coverageCells = new Set<string>()
  let altitudeSum = 0
  let altitudeMin = Number.POSITIVE_INFINITY
  let altitudeMax = Number.NEGATIVE_INFINITY
  let altitudeCount = 0
  let dataPoints = 0
  const hemisphereSplit = { north: 0, south: 0, equatorial: 0 }

  balloons.forEach((balloon) => {
    dataPoints += balloon.history.length
    balloon.history.forEach((point) => {
      const cellKey = `${Math.floor((point.lat + 90) / GRID_DEG)}-${Math.floor((point.lon + 180) / GRID_DEG)}`
      coverageCells.add(cellKey)
      if (typeof point.altitude === 'number') {
        altitudeSum += point.altitude
        altitudeMin = Math.min(altitudeMin, point.altitude)
        altitudeMax = Math.max(altitudeMax, point.altitude)
        altitudeCount += 1
      }
    })
    hemisphereSplit[balloon.hemisphere] += 1
  })

  const driftLeaders = [...balloons]
    .sort((a, b) => b.driftKm - a.driftKm)
    .slice(0, 5)
    .map((balloon) => ({ id: balloon.id, driftKm: Number(balloon.driftKm.toFixed(1)) }))

  return {
    totalBalloons: balloons.length,
    avgAltitude: altitudeCount ? altitudeSum / altitudeCount : 0,
    minAltitude: altitudeCount ? altitudeMin : 0,
    maxAltitude: altitudeCount ? altitudeMax : 0,
    coveragePercent: COVERAGE_CELLS ? (coverageCells.size / COVERAGE_CELLS) * 100 : 0,
    dataPoints,
    hemisphereSplit,
    driftLeaders,
    hazardMatches,
    hazardEventCount
  }
}

interface EonetGeometry {
  coordinates: number[]
  date: string
  magnitudeValue?: number | null
}

async function fetchHazardEvents(): Promise<HazardEvent[]> {
  const allowedCategories = new Set(['wildfires', 'severeStorms', 'volcanoes', 'seaLakeIce'])
  try {
    const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open', { cache: 'no-store' })
    if (!response.ok) throw new Error(`EONET request failed ${response.status}`)
    const body = await response.json()
    if (!body?.events) return []
    const events: HazardEvent[] = []
    for (const event of body.events) {
      const category = event.categories?.[0]?.id
      if (!category || !allowedCategories.has(category)) continue
      const geometries: EonetGeometry[] = Array.isArray(event.geometry) ? event.geometry : []
      const latestGeometry = geometries
        .filter(isValidGeometry)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      if (!latestGeometry) continue
      const [lon, lat] = latestGeometry.coordinates
      events.push({
        id: event.id,
        title: event.title,
        category: event.categories?.[0]?.title ?? 'Hazard',
        lat,
        lon,
        date: latestGeometry.date,
        magnitude: latestGeometry.magnitudeValue ?? null
      })
    }
    return events.slice(0, 40)
  } catch (error) {
    console.warn('Falling back: hazard feed unavailable', error)
    return []
  }
}

function isValidGeometry(geo: EonetGeometry): geo is EonetGeometry & { coordinates: [number, number] } {
  return Array.isArray(geo.coordinates) && geo.coordinates.length >= 2 && geo.coordinates.every((value) => typeof value === 'number')
}

function matchBalloonsToHazards(balloons: BalloonInsight[], hazardEvents: HazardEvent[]): HazardProximity[] {
  if (!balloons.length || !hazardEvents.length) return []
  const proximities: HazardProximity[] = []
  hazardEvents.forEach((event) => {
    let closest: ClosestMatch | null = null
    balloons.forEach((balloon) => {
      const distance = haversineLatLon(event.lat, event.lon, balloon.current.lat, balloon.current.lon)
      if (!closest || distance < closest.distance) {
        closest = { balloonId: balloon.id, distance }
      }
    })
    if (closest) {
      const match = closest as ClosestMatch
      if (match.distance <= 500) {
        proximities.push({
          eventId: event.id,
          eventTitle: event.title,
          category: event.category,
          balloonId: match.balloonId,
          distanceKm: Number(match.distance.toFixed(1))
        })
      }
    }
  })
  return proximities
}

function isClosestMatch(candidate: ClosestMatch | null): candidate is ClosestMatch {
  return candidate !== null
}

function haversineKm(a: BalloonHistoryPoint, b: BalloonHistoryPoint) {
  return haversineLatLon(a.lat, a.lon, b.lat, b.lon)
}

function haversineLatLon(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const rLat1 = toRad(lat1)
  const rLat2 = toRad(lat2)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}
