'use client'

import { useState, useCallback, useTransition } from 'react'
import { SessionWithDetails, DrinkCatalog, ExtraCatalog, KPIData } from '@/types'
import Header from '@/components/layout/Header'
import KPIBar from '@/components/dashboard/KPIBar'
import SessionRow from '@/components/sessions/SessionRow'
import CreateSessionModal from '@/components/sessions/CreateSessionModal'
import AddDrinkModal from '@/components/sessions/AddDrinkModal'
import AddExtraModal from '@/components/sessions/AddExtraModal'
import StopSessionModal from '@/components/sessions/StopSessionModal'
import EditSessionModal from '@/components/sessions/EditSessionModal'
import Button from '@/components/ui/Button'
import {
  Plus, Search, RefreshCw, Coffee, ChevronLeft, ChevronRight,
  Download, FileSpreadsheet, BarChart2,
} from 'lucide-react'
import {
  getSessionsForDate, getKPIForDate,
} from '@/app/actions/sessions'
import {
  todayISO, formatTime, formatDuration, calcDurationMinutes,
  formatDateShort, generateCSV, generateExcel,
} from '@/lib/utils'
import { format, parseISO, addDays, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Props {
  initialSessions: SessionWithDetails[]
  initialKpi: KPIData
  initialDate: string
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

function parseSafeDate(iso: string): Date {
  return parseISO(iso + 'T12:00:00')
}

function formatNavDate(iso: string): string {
  const d = parseSafeDate(iso)
  const today = todayISO()
  if (iso === today) return "Aujourd'hui"
  return format(d, 'EEEE d MMM', { locale: fr })
}

function formatInputDate(iso: string): string {
  return iso // yyyy-MM-dd, format natif input[type=date]
}

export default function DashboardClient({
  initialSessions,
  initialKpi,
  initialDate,
  drinks,
  extras,
  addons,
}: Props) {
  const [sessions,     setSessions]    = useState<SessionWithDetails[]>(initialSessions)
  const [kpi,          setKpi]         = useState<KPIData>(initialKpi)
  const [date,         setDate]        = useState(initialDate)
  const [modal,        setModal]       = useState<ModalState>({ type: 'none' })
  const [search,       setSearch]      = useState('')
  const [filter,       setFilter]      = useState<'all' | 'active' | 'finished'>('all')
  const [showKPI,      setShowKPI]     = useState(false)
  const [isRefreshing, startRefresh]  = useTransition()

  const today = todayISO()
  const isToday = date === today

  const loadDate = useCallback((d: string) => {
    startRefresh(async () => {
      const [{ data }, freshKpi] = await Promise.all([
        getSessionsForDate(d),
        getKPIForDate(d),
      ])
      setSessions(data as SessionWithDetails[])
      if (freshKpi) setKpi(freshKpi)
      setDate(d)
    })
  }, [])

  const refresh = useCallback(() => loadDate(date), [date, loadDate])

  function goPrev() { loadDate(format(subDays(parseSafeDate(date), 1), 'yyyy-MM-dd')) }
  function goNext() { if (!isToday) loadDate(format(addDays(parseSafeDate(date), 1), 'yyyy-MM-dd')) }
  function goToday() { if (!isToday) loadDate(today) }

  const activeSessions   = sessions.filter(s => s.status === 'active')
  const finishedSessions = sessions.filter(s => s.status === 'finished')

  const filteredSessions = sessions
    .filter(s => {
      if (filter === 'active')   return s.status === 'active'
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

  function closeModal() { setModal({ type: 'none' }) }

  // ─── Export ───────────────────────────────────────────────────────────────

  function buildExportRows() {
    return filteredSessions.map(s => {
      const drinksCount = s.session_drinks.reduce((acc, d) => acc + d.quantity, 0)
      const extrasCount = s.session_extras.reduce((acc, e) => acc + e.quantity, 0)
      const duration = s.is_day_pass
        ? 'Journée'
        : s.duration_minutes != null
          ? formatDuration(s.duration_minutes)
          : s.status === 'active'
            ? formatDuration(calcDurationMinutes(s.arrival_time))
            : '—'
      return {
        Date:          formatDateShort(s.date),
        Prénom:        s.first_name,
        Nom:           s.last_name ?? '',
        'Zone/Table':  s.zone_name ?? '',
        Arrivée:       formatTime(s.arrival_time),
        Départ:        s.departure_time ? formatTime(s.departure_time) : '',
        Durée:         duration,
        Statut:        s.status === 'active' ? 'En cours' : s.status === 'finished' ? 'Terminée' : 'Annulée',
        Boissons:      drinksCount || 0,
        Extras:        extrasCount || 0,
        'Détail boissons': s.session_drinks.map(d => `${d.quantity}x ${d.drink_name}`).join(' / '),
        'Détail extras':   s.session_extras.map(e => `${e.quantity}x ${e.extra_name}`).join(' / '),
        Notes:         s.notes ?? '',
      }
    })
  }

  function handleExportCSV() {
    generateCSV(buildExportRows(), `noma-sessions-${date}.csv`)
  }

  function handleExportExcel() {
    generateExcel(buildExportRows(), `noma-sessions-${date}.xlsx`, `Sessions ${formatDateShort(date)}`)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Header
        title="NOMA Café Coworking"
        subtitle={
          <span className="capitalize">
            {format(parseSafeDate(date), 'EEEE d MMMM yyyy', { locale: fr })}
            {isToday && (
              <span className="ml-2 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Aujourd'hui
              </span>
            )}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            {/* Compteurs rapides */}
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                {activeSessions.length} actifs
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {finishedSessions.length} terminés
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                {activeSessions.length + finishedSessions.length} total
              </span>
            </div>
            <button
              onClick={refresh}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      <div className="flex-1 px-6 py-5 space-y-4">

        {/* ── Barre d'outils ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          {/* Ligne 1 : actions principales + navigation date */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Bouton principal */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => setModal({ type: 'create' })}
              className="shrink-0 min-h-[44px]"
            >
              <Plus size={20} />
              Nouveau client
            </Button>

            {/* Toggle KPIs */}
            <Button
              variant={showKPI ? 'secondary' : 'outline'}
              size="md"
              onClick={() => setShowKPI(v => !v)}
              className="shrink-0"
            >
              <BarChart2 size={16} />
              {showKPI ? 'Masquer KPIs' : 'Afficher KPIs'}
            </Button>

            {/* Séparateur */}
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />

            {/* Navigation date */}
            <div className="flex items-center gap-1 bg-slate-50 rounded-xl border border-slate-200 p-1 shrink-0">
              <button
                onClick={goPrev}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"
                title="Jour précédent"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToday}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isToday
                    ? 'bg-noma-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:shadow-sm'
                }`}
              >
                Aujourd'hui
              </button>
              <div className="relative">
                <input
                  type="date"
                  value={formatInputDate(date)}
                  max={today}
                  onChange={e => { if (e.target.value) loadDate(e.target.value) }}
                  className="opacity-0 absolute inset-0 w-full cursor-pointer"
                />
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700 block whitespace-nowrap pointer-events-none">
                  {formatDateShort(date)}
                </span>
              </div>
              <span className="text-xs text-slate-400 px-1 hidden md:block capitalize">
                {format(parseSafeDate(date), 'EEE dd/MM', { locale: fr })}
              </span>
              <button
                onClick={goNext}
                disabled={isToday}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all disabled:opacity-30"
                title="Jour suivant"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Filtres statut */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
              {(['all', 'active', 'finished'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap min-h-[40px] ${
                    filter === f
                      ? 'bg-noma-500 text-white'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {f === 'all'
                    ? 'Tous'
                    : f === 'active'
                      ? `Actifs (${activeSessions.length})`
                      : `Terminés (${finishedSessions.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Ligne 2 : recherche + export */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-0 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par prénom..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-noma-400 focus:border-transparent"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={filteredSessions.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 min-h-[40px]"
              >
                <Download size={15} />
                Export CSV
              </button>
              <button
                onClick={handleExportExcel}
                disabled={filteredSessions.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 min-h-[40px]"
              >
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* ── KPIs (toggle) ── */}
        {showKPI && <KPIBar kpi={kpi} />}

        {/* ── Tableau des sessions ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isRefreshing ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <RefreshCw size={20} className="animate-spin mr-2" />
              Chargement...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Coffee size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="font-semibold text-slate-500">Aucune session pour cette date</p>
              {isToday && (
                <button
                  onClick={() => setModal({ type: 'create' })}
                  className="mt-3 text-sm text-noma-600 hover:text-noma-700 font-medium underline underline-offset-2"
                >
                  Créer votre première session →
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Arrivée</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Prénom</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Zone / Table</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Départ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Durée</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Consommations</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSessions.map(session => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      onAddDrink={s => setModal({ type: 'drink', session: s })}
                      onAddExtra={s => setModal({ type: 'extra', session: s })}
                      onStop={s => setModal({ type: 'stop', session: s })}
                      onCancel={s => setModal({ type: 'cancel', session: s })}
                      onEdit={s => setModal({ type: 'edit', session: s })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
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
        session={
          modal.type === 'stop'   ? modal.session :
          modal.type === 'cancel' ? modal.session : null
        }
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
