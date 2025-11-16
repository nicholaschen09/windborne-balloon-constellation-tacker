import FleetPageClient from '@/components/FleetPageClient'
import { getFleetPayload } from '@/lib/fleet'
import { FleetPayload } from '@/lib/types'

export const revalidate = 0

export default async function Home() {
  let initialPayload: FleetPayload | null = null
  try {
    initialPayload = await getFleetPayload()
  } catch (error) {
    console.error('Unable to load initial fleet payload', error)
  }

  return <FleetPageClient initialPayload={initialPayload} />
}
