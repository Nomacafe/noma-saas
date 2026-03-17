import { getSessionsForDate } from '@/app/actions/sessions'
import { todayISO } from '@/lib/utils'
import BarPageClient from './BarPageClient'

export const dynamic = 'force-dynamic'

export default async function BarPage() {
  const today = todayISO()
  const { data: sessions } = await getSessionsForDate(today)

  return <BarPageClient initialSessions={sessions as never} />
}
