'use client'

import { useState, useEffect, useTransition } from 'react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { SessionWithDetails } from '@/types'
import { getSessionsForRange } from '@/app/actions/sessions'
import {
  todayISO, formatTime, formatDuration, calcDurationMinutes,
  formatDateShort, generateCSV,
} from '@/lib/utils'
import { ChevronLeft, ChevronRight, Download, Coffee, Cookie, Clock, MapPin } from 'lucide-react'
import {
  format, parseISO,
  subDays, addDays,
  subWeeks, addWeeks, startOfWeek, endOfWeek,
  subMonths, addMonths, startOfMonth, endOfMonth,
  eachDayOfInterval,
} from 'date-fns'
import { fr } from 'date-fns/locale'

type ViewMode = 'day' | 'week' | 'month'

const STATUS_BADGE: Record<string, { variant: 'green' | 'slate' | 'red'; label: string }> = {
  active:    { variant: 'green', label: 'En cours' },
  finished:  { variant: 'slate', label: 'Terminée' },
  cancelled: { variant: 'red',   label: 'Annulée' },
}

/** Parse une date ISO locale sans décalage UTC (évite les bugs de timezone) */
function safeDate(iso: string): Date {
  return parseISO(iso + 'T12:00:00')
}

function computeRange(refDate: string, mode: ViewMode): { start: string; end: string } {
  const d = safeDate(refDate)
  if (mode === 'day') return { start: refDate, end: refDate }
  if (mode === 'week') {
    const start = startOfWeek(d, { weekStartsOn: 1 })
    const end   = endOfWeek(d,   { weekStartsOn: 1 })
    return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') }
  }
  const start = startOfMonth(d)
  const end   = endOfMonth(d)
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') }
}

function rangeLabel(refDate: string, mode: ViewMode): string {
  const d = safeDate(refDate)
  const today = todayISO()
  if (mode === 'day') return refDate === today ? "Aujourd'hui" : format(d, 'd MMMM yyyy', { locale: fr })
  if (mode === 'week') {
    const start = startOfWeek(d, { weekStartsOn: 1 })
    const end   = endOfWeek(d,   { weekStartsOn: 1 })
    return `${format(start, 'd MMM', { locale: fr })} – ${format(end, 'd MMM yyyy', { locale: fr })}`
  }
  return format(d, 'MMMM yyyy', { locale: fr })
}

function isMaxReached(refDate: string, mode: ViewMode): boolean {
  const today = todayISO()
  if (mode === 'day') return refDate >= today
  const d = safeDate(refDate)
  const t = safeDate(today)
  if (mode === 'week')  return startOfWeek(d, { weekStartsOn: 1 }) >= startOfWeek(t, { weekStartsOn: 1 })
  return startOfMonth(d) >= startOfMonth(t)
}

function navigateDate(refDate: string, mode: ViewMode, dir: 'prev' | 'next'): string {
  const d = safeDate(refDate)
  let next: Date
  if (mode === 'day')   next = dir === 'prev' ? subDays(d, 1)   : addDays(d, 1)
  else if (mode === 'week') next = dir === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1)
  else                  next = dir === 'prev' ? subMonths(d, 1) : addMonths(d, 1)
  return format(next, 'yyyy-MM-dd')
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HistoriqueClient() {
  const [viewMode, setViewMode]   = useState<ViewMode>('day')
  const [refDate,  setRefDate]    = useState(todayISO)
  const [sessions, setSessions]   = useState<SessionWithDetails[]>([])
  const [search,   setSearch]     = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const { start, end } = computeRange(refDate, viewMode)
    startTransition(async () => {
      const { data } = await getSessionsForRange(start, end)
      setSessions(data as SessionWithDetails[])
    })
  }, [refDate, viewMode])

  const filtered = sessions.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.first_name.toLowerCase().includes(q) || (s.last_name?.toLowerCase() ?? '').includes(q)
  })

  function handleExport() {
    const rows = filtered.map(s => ({
      Date:       formatDateShort(s.date),
      Prénom:     s.first_name,
      Nom:        s.last_name ?? '',
      Zone:       s.zone_name ?? '',
      Arrivée:    formatTime(s.arrival_time),
      Départ:     s.departure_time ? formatTime(s.departure_time) : '',
      'Durée (min)': s.duration_minutes ?? '',
      Statut:     s.status,
      Boissons:   s.session_drinks.map(d => `${d.quantity}x ${d.drink_name}`).join(' / '),
      Extras:     s.session_extras.map(e => `${e.quantity}x ${e.extra_name}`).join(' / '),
      Notes:      s.notes ?? '',
    }))
    const { start, end } = computeRange(refDate, viewMode)
    generateCSV(rows, `noma-sessions-${start}${start !== end ? '-' + end : ''}.csv`)
  }

  // Groupement par date pour les vues semaine/mois
  const grouped: Record<string, SessionWithDetails[]> = {}
  for (const s of filtered) {
    if (!grouped[s.date]) grouped[s.date] = []
    grouped[s.date].push(s)
  }
  const { start: rangeStart, end: rangeEnd } = computeRange(refDate, viewMode)
  const days = viewMode !== 'day'
    ? eachDayOfInterval({ start: parseISO(rangeStart), end: parseISO(rangeEnd) })
    : []

  return (
    <>
      <Header
        title="Historique"
        subtitle="Sessions par jour, semaine ou mois"
        actions={
          <Button variant="outline" size="md" onClick={handleExport}>
            <Download size={16} /> Exporter CSV
          </Button>
        }
      />

      <div className="flex-1 px-8 py-6 space-y-5">
        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">

          {/* Tabs vue */}
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0">
            {(['day', 'week', 'month'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === v ? 'bg-noma-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {v === 'day' ? 'Jour' : v === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          {/* Navigation date */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shrink-0">
            <button
              onClick={() => setRefDate(r => navigateDate(r, viewMode, 'prev'))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-sm font-semibold text-slate-900 min-w-[200px] text-center capitalize">
              {rangeLabel(refDate, viewMode)}
            </span>
            <button
              onClick={() => setRefDate(r => navigateDate(r, viewMode, 'next'))}
              disabled={isMaxReached(refDate, viewMode)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Recherche */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-noma-400 focus:border-transparent w-48"
          />

          <div className="ml-auto text-sm text-slate-400 font-medium">
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Contenu */}
        {isPending ? (
          <div className="flex items-center justify-center py-20 text-slate-400">Chargement…</div>
        ) : viewMode === 'day' ? (
          <DayTable sessions={filtered} />
        ) : viewMode === 'week' ? (
          <WeekView days={days} grouped={grouped} />
        ) : (
          <MonthView days={days} grouped={grouped} />
        )}
      </div>
    </>
  )
}

// ─── Vue Jour ─────────────────────────────────────────────────────────────────

function DayTable({ sessions }: { sessions: SessionWithDetails[] }) {
  if (sessions.length === 0) {
    return <div className="text-center py-20 text-slate-400">Aucune session ce jour-là</div>
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-5 py-4 text-left font-semibold text-slate-500">Client</th>
            <th className="px-5 py-4 text-left font-semibold text-slate-500">
              <span className="flex items-center gap-1"><MapPin size={12} /> Zone</span>
            </th>
            <th className="px-5 py-4 text-left font-semibold text-slate-500">
              <span className="flex items-center gap-1"><Clock size={12} /> Arrivée</span>
            </th>
            <th className="px-5 py-4 text-left font-semibold text-slate-500">Durée</th>
            <th className="px-5 py-4 text-left font-semibold text-slate-500">
              <span className="flex items-center gap-1"><Coffee size={12} /> Boissons</span>
            </th>
            <th className="px-5 py-4 text-left font-semibold text-slate-500">
              <span className="flex items-center gap-1"><Cookie size={12} /> Extras</span>
            </th>
            <th className="px-5 py-4 text-left font-semibold text-slate-500">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sessions.map(session => {
            const drinksCount = session.session_drinks.reduce((s, d) => s + d.quantity, 0)
            const extrasCount = session.session_extras.reduce((s, e) => s + e.quantity, 0)
            const badge = STATUS_BADGE[session.status]
            const duration = session.is_day_pass
              ? null
              : (session.duration_minutes ?? calcDurationMinutes(session.arrival_time, session.departure_time ?? undefined))

            return (
              <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-semibold text-slate-900">
                    {session.first_name} {session.last_name ?? ''}
                  </span>
                  {session.notes && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{session.notes}</p>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-500">{session.zone_name ?? '—'}</td>
                <td className="px-5 py-4 font-medium text-slate-700 tabular-nums">
                  {formatTime(session.arrival_time)}
                </td>
                <td className="px-5 py-4 tabular-nums">
                  {session.is_day_pass ? (
                    <span className="text-amber-600 font-medium text-xs">☀ Journée</span>
                  ) : duration != null ? (
                    <span className="text-slate-700">{formatDuration(duration)}</span>
                  ) : '—'}
                </td>
                <td className="px-5 py-4">
                  {drinksCount > 0
                    ? <span className="text-noma-600 font-medium">{drinksCount}</span>
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-5 py-4">
                  {extrasCount > 0
                    ? <span className="text-purple-600 font-medium">{extrasCount}</span>
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Vue Semaine ──────────────────────────────────────────────────────────────

function WeekView({ days, grouped }: { days: Date[]; grouped: Record<string, SessionWithDetails[]> }) {
  return (
    <div className="space-y-3">
      {days.map(day => {
        const key  = format(day, 'yyyy-MM-dd')
        const list = grouped[key] ?? []
        const drinks = list.flatMap(s => s.session_drinks).reduce((a, d) => a + d.quantity, 0)
        const extras = list.flatMap(s => s.session_extras).reduce((a, e) => a + e.quantity, 0)

        return (
          <div key={key} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {/* En-tête jour */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="font-semibold text-slate-800 capitalize text-sm">
                {format(day, 'EEEE d MMMM', { locale: fr })}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{list.length} session{list.length !== 1 ? 's' : ''}</span>
                {drinks > 0 && (
                  <span className="text-noma-600 font-semibold flex items-center gap-1">
                    <Coffee size={11} /> {drinks}
                  </span>
                )}
                {extras > 0 && (
                  <span className="text-purple-600 font-semibold flex items-center gap-1">
                    <Cookie size={11} /> {extras}
                  </span>
                )}
              </div>
            </div>

            {list.length === 0 ? (
              <div className="px-5 py-3 text-sm text-slate-300 italic">Aucune session</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {list.map(session => {
                  const drinksCount = session.session_drinks.reduce((s, d) => s + d.quantity, 0)
                  const extrasCount = session.session_extras.reduce((s, e) => s + e.quantity, 0)
                  const badge = STATUS_BADGE[session.status]
                  return (
                    <div key={session.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-slate-900">
                          {session.first_name} {session.last_name ?? ''}
                        </span>
                        {session.zone_name && (
                          <span className="ml-2 text-xs text-slate-400">{session.zone_name}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums shrink-0">
                        {formatTime(session.arrival_time)}
                      </span>
                      {session.is_day_pass && (
                        <span className="text-xs text-amber-600 font-medium shrink-0">☀ Journée</span>
                      )}
                      {drinksCount > 0 && (
                        <span className="text-xs text-noma-600 font-medium flex items-center gap-1 shrink-0">
                          <Coffee size={11} /> {drinksCount}
                        </span>
                      )}
                      {extrasCount > 0 && (
                        <span className="text-xs text-purple-600 font-medium flex items-center gap-1 shrink-0">
                          <Cookie size={11} /> {extrasCount}
                        </span>
                      )}
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Vue Mois ─────────────────────────────────────────────────────────────────

function MonthView({ days, grouped }: { days: Date[]; grouped: Record<string, SessionWithDetails[]> }) {
  const allSessions  = Object.values(grouped).flat()
  const totalSessions = allSessions.length
  const totalDrinks  = allSessions.flatMap(s => s.session_drinks).reduce((a, d) => a + d.quantity, 0)
  const totalExtras  = allSessions.flatMap(s => s.session_extras).reduce((a, e) => a + e.quantity, 0)
  const totalDayPass = allSessions.filter(s => s.is_day_pass).length
  const activeDays   = Object.keys(grouped).length

  const activeDaysList = days.filter(d => (grouped[format(d, 'yyyy-MM-dd')] ?? []).length > 0)

  return (
    <div className="space-y-5">
      {/* KPI résumé */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Jours actifs',  value: activeDays,      color: 'text-slate-800' },
          { label: 'Sessions',      value: totalSessions,   color: 'text-slate-800' },
          { label: 'Boissons',      value: totalDrinks,     color: 'text-noma-600' },
          { label: 'Extras',        value: totalExtras,     color: 'text-purple-600' },
          { label: 'Journées',      value: totalDayPass,    color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tableau jours actifs */}
      {activeDaysList.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Aucune session ce mois-là</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left font-semibold text-slate-500">Jour</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-500">Sessions</th>
                <th className="px-5 py-3 text-center font-semibold text-slate-500">
                  <span className="flex items-center justify-center gap-1"><Coffee size={12} /> Boissons</span>
                </th>
                <th className="px-5 py-3 text-center font-semibold text-slate-500">
                  <span className="flex items-center justify-center gap-1"><Cookie size={12} /> Extras</span>
                </th>
                <th className="px-5 py-3 text-center font-semibold text-slate-500">☀ Journées</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeDaysList.map(day => {
                const key  = format(day, 'yyyy-MM-dd')
                const list = grouped[key] ?? []
                const drinks   = list.flatMap(s => s.session_drinks).reduce((a, d) => a + d.quantity, 0)
                const extras   = list.flatMap(s => s.session_extras).reduce((a, e) => a + e.quantity, 0)
                const dayPasses = list.filter(s => s.is_day_pass).length
                return (
                  <tr key={key} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900 capitalize">
                      {format(day, 'EEEE d MMM', { locale: fr })}
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-slate-800">{list.length}</td>
                    <td className="px-5 py-3 text-center text-noma-600 font-medium">{drinks || '—'}</td>
                    <td className="px-5 py-3 text-center text-purple-600 font-medium">{extras || '—'}</td>
                    <td className="px-5 py-3 text-center text-amber-600 font-medium">{dayPasses || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
