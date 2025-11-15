export interface BalloonHistoryPoint {
  timestamp: string
  lat: number
  lon: number
  altitude: number | null
}

export interface BalloonInsight {
  id: string
  history: BalloonHistoryPoint[]
  current: BalloonHistoryPoint
  driftKm: number
  avgSpeedKph: number
  altitudeRangeKm: number
  altitudeTrend3h: number | null
  hemisphere: 'north' | 'south' | 'equatorial'
}

export interface HazardEvent {
  id: string
  title: string
  category: string
  lat: number
  lon: number
  date: string
  magnitude?: number | null
}

export interface HazardProximity {
  eventId: string
  eventTitle: string
  balloonId: string
  distanceKm: number
  category: string
}

export interface FleetStats {
  totalBalloons: number
  avgAltitude: number
  minAltitude: number
  maxAltitude: number
  coveragePercent: number
  dataPoints: number
  hemisphereSplit: {
    north: number
    south: number
    equatorial: number
  }
  driftLeaders: {
    id: string
    driftKm: number
  }[]
  hazardMatches: number
  hazardEventCount: number
}

export interface FleetPayload {
  balloons: BalloonInsight[]
  stats: FleetStats
  hazardEvents: HazardEvent[]
  hazardProximities: HazardProximity[]
  lastUpdated: string
}
