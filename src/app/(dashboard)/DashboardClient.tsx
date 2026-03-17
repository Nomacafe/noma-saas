'use client'

import { useState, useCallback, useTransition } from 'react'
import { SessionWithDetails, DrinkCatalog, ExtraCatalog, KPIData } from '@/types'
import Header from '@/components/layout/Header'
import KPIBar from '@/components/dashboard/KPIBar'
import SessionCard from '@/components/sessions/SessionCard'
import CreateSessionModal from '@/components/sessions/CreateSessionModal'
import AddDrinkModal from '@/components/sessions/AddDrinkModal'
import AddExtraModal from '@/components/sessions/AddExtraModal'
import StopSessionModal from '@/components/sessions/StopSessionModal'
import EditSessionModal from '@/components/sessions/EditSessionModal'
import BarQueue from '@/components/bar/BarQueue'
import Button from '@/components/ui/Button'
import { Plus, Search, RefreshCw, Coffee } from 'lucide-react'
import { getSessionsForDate, getKPIForDate } from '@/app/actions/sessions'
import { todayISO } from '@/lib/utils'

interface Props {
  initialSessions: SessionWithDetails[]
  initialKpi: KPIData
  drinks: DrinkCatalog[]
  extras: ExtraCatalog[]
  addons: import('@/types').DrinkAddon[]
}

type ModalState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'drink'; session: SessionWithDetails }
  | { type: 'extra'; session: SessionWithDetails }
  | { type: 'stop'; session: SessionWithDetails }
  | { type: 'cancel'; session: SessionWithDetails }
  | { type: 'edit'; session: SessionWithDetails }

export default function DashboardClient({ initialSessions, initialKpi, drinks, extras, addons }: Props) {
  const [sessions, setSessions] = useState<SessionWithDetails[]>(initialSessions)
  const [kpi, setKpi] = useState<KPIData>(initialKpi)
  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'finished'>('all')
  const [isRefreshing, startRefresh] = useTransition()

  const refresh = useCallback(() => {
    const today = todayISO()
    startRefresh(async () => {
      const [{ data }, freshKpi] = await Promise.all([
        getSessionsForDate(today),
        getKPIForDate(today),
      ])
      setSessions(data as SessionWithDetails[])
      if (freshKpi) setKpi(freshKpi)
    })
  }, [])

  const activeSessions = sessions.filter(s => s.status === 'active')
  const finishedSessions = sessions.filter(s => s.status === 'finished')

  const barItems = activeSessions.flatMap(session =>
    session.session_drinks
      .filter(d => d.bar_status === 'preparing')
      .map(drink => ({ drink, session }))
  )

  const filteredSessions = sessions
    .filter(s => {
      if (filter === 'active') return s.status === 'active'
      if (filter === 'finished') return s.status === 'finished'
      return s.status !== 'cancelled'
    })
    .filter(s => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        s.first_name.toLowerCase().includes(q) ||
        (s.last_name?.toLowerCase() ?? '').includes(q)
      )
    })

  function closeModal() {
    setModal({ type: 'none' })
  }

  return (
    <>
      <Header
        title="Dashboard du jour"
        subtitle="Sessions actives et terminées aujourd'hui"
        actions={
          <>
            <button
              onClick={refresh}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <Button variant="primary" size="md" onClick={() => setModal({ type: 'create' })}>
              <Plus size={18} />
              Nouvelle session
            </Button>
          </>
        }
      />

      <div className="flex-1 px-8 py-6 space-y-6">
        {/* KPIs */}
        <KPIBar kpi={kpi} />

        <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
          {/* Sessions panel */}
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par prénom..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-noma-400 focus:border-transparent"
                />
              </div>
              <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
                {(['all', 'active', 'finished'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-noma-500 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f === 'all' ? 'Toutes' : f === 'active' ? `En cours (${activeSessions.length})` : `Terminées (${finishedSessions.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Session grid */}
            {filteredSessions.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Coffee size={40} className="mx-auto mb-3 text-slate-200" />
                <p className="font-medium">Aucune session</p>
                <p className="text-sm mt-1">
                  {search ? 'Aucun résultat pour cette recherche' : 'Démarrez une nouvelle session ci-dessus'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onAddDrink={s => setModal({ type: 'drink', session: s })}
                    onAddExtra={s => setModal({ type: 'extra', session: s })}
                    onStop={s => setModal({ type: 'stop', session: s })}
                    onCancel={s => setModal({ type: 'cancel', session: s })}
                    onEdit={s => setModal({ type: 'edit', session: s })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bar queue sidebar */}
          <div className="space-y-3 sticky top-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Coffee size={18} className="text-noma-500" />
                File bar
              </h2>
              {barItems.length > 0 && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                  {barItems.length} en attente
                </span>
              )}
            </div>
            <BarQueue items={barItems} onRefresh={refresh} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateSessionModal
        open={modal.type === 'create'}
        onClose={closeModal}
        onSuccess={refresh}
      />

      <AddDrinkModal
        open={modal.type === 'drink'}
        onClose={closeModal}
        onSuccess={refresh}
        session={modal.type === 'drink' ? modal.session : null}
        drinks={drinks}
        addons={addons}
      />

      <AddExtraModal
        open={modal.type === 'extra'}
        onClose={closeModal}
        onSuccess={refresh}
        session={modal.type === 'extra' ? modal.session : null}
        extras={extras}
      />

      <StopSessionModal
        open={modal.type === 'stop' || modal.type === 'cancel'}
        onClose={closeModal}
        onSuccess={refresh}
        session={modal.type === 'stop' ? modal.session : modal.type === 'cancel' ? modal.session : null}
        mode={modal.type === 'cancel' ? 'cancel' : 'stop'}
      />

      <EditSessionModal
        open={modal.type === 'edit'}
        onClose={closeModal}
        onSuccess={refresh}
        session={modal.type === 'edit' ? modal.session : null}
      />
    </>
  )
}
