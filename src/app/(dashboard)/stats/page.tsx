import { getStats } from '@/app/actions/sessions'
import StatsClient from './StatsClient'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const stats = await getStats()
  return <StatsClient stats={stats} />
}
