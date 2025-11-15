import { NextResponse } from 'next/server'

// Simulate balloon data - in production, this would connect to real WindBorne API
function generateBalloonData() {
  const balloons = []
  const numBalloons = Math.floor(Math.random() * 5) + 8 // 8-12 balloons

  for (let i = 0; i < numBalloons; i++) {
    balloons.push({
      id: `W-${1100 + i}`,
      lat: Math.random() * 140 - 70, // -70 to 70
      lon: Math.random() * 360 - 180, // -180 to 180
      altitude: Math.random() * 15 + 10, // 10-25 km
      temperature: Math.random() * 80 - 60, // -60 to 20°C
      pressure: Math.random() * 500 + 200, // 200-700 hPa
      windSpeed: Math.random() * 100 + 20, // 20-120 km/h
      windDirection: Math.random() * 360,
      humidity: Math.random() * 100,
      lastUpdate: new Date().toISOString(),
      trajectory: generateTrajectory(),
      location: getLocationName()
    })
  }

  return balloons
}

function generateTrajectory() {
  const points = []
  const numPoints = 24 // Last 24 hours
  for (let i = 0; i < numPoints; i++) {
    points.push({
      time: new Date(Date.now() - i * 3600000).toISOString(),
      altitude: Math.random() * 15 + 10
    })
  }
  return points
}

function getLocationName() {
  const locations = [
    'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean',
    'North America', 'South America', 'Europe',
    'Africa', 'Asia', 'Australia', 'Antarctica'
  ]
  return locations[Math.floor(Math.random() * locations.length)]
}

export async function GET() {
  try {
    const balloons = generateBalloonData()
    return NextResponse.json(balloons)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch balloon data' },
      { status: 500 }
    )
  }
}