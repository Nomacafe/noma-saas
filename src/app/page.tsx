import { getSessionsForDate, getKPIForDate, getCatalog } from '@/app/actions/sessions'
import { todayISO } from '@/lib/utils'
import DashboardClient from './(dashboard)/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const today = todayISO()
  const [{ data: sessions }, kpi, catalog] = await Promise.all([
    getSessionsForDate(today),
    getKPIForDate(today),
    getCatalog(),
  ])
  const { drinks, extras, addons } = catalog ?? { drinks: [], extras: [], addons: [] }

  return (
    <DashboardClient
      initialSessions={sessions as never}
      initialKpi={kpi ?? {
        total_sessions: 0, active_sessions: 0, finished_sessions: 0,
        cancelled_sessions: 0, total_drinks: 0, total_extras: 0,
      }}
      drinks={drinks}
      extras={extras}
      addons={addons}
    />
  )
}
