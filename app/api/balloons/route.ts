import { NextResponse } from 'next/server'
import { getFleetPayload } from '@/lib/fleet'

export async function GET() {
  try {
    const payload = await getFleetPayload()
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to fetch live fleet data', error)
    return NextResponse.json({ error: 'Failed to fetch fleet data' }, { status: 500 })
  }
}
