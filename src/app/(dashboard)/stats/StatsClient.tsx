'use client'

import Header from '@/components/layout/Header'
import { StatsData } from '@/types'
import { Coffee, Cookie, Users, Clock, TrendingUp, BarChart2, Sun, MapPin } from 'lucide-react'

interface Props { stats: StatsData | null }

function KPICard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function RankBar({ name, total, max }: { name: string; total: number; max: number }) {
  const pct = max > 0 ? Math.round((total / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm font-medium text-slate-800 w-44 truncate">{name}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
        <div className="h-2.5 rounded-full bg-noma-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-700 w-8 text-right">{total}</span>
    </div>
  )
}

function HourChart({ data }: { data: { hour: number; count: number }[] }) {
  if (!data.length) return <p className="text-slate-400 text-sm py-4 text-center">Aucune donnée</p>
  const max = Math.max(...data.map(d => d.count))
  return (
    <div className="flex items-end gap-1.5 h-28 pt-2">
      {Array.from({ length: 24 }, (_, h) => {
        const d = data.find(x => x.hour === h)
        const count = d?.count ?? 0
        const height = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 4
        return (
          <div key={h} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className={`w-full rounded-t-sm transition-all ${count > 0 ? 'bg-noma-400' : 'bg-slate-100'}`}
              style={{ height: `${height}%` }}
              title={`${h}h : ${count} session${count > 1 ? 's' : ''}`}
            />
            {h % 3 === 0 && (
              <span className="text-[9px] text-slate-400 leading-none">{h}h</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function StatsClient({ stats }: Props) {
  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Impossible de charger les statistiques
      </div>
    )
  }

  const maxDrink = stats.top_drinks[0]?.total ?? 1
  const maxExtra = stats.top_extras[0]?.total ?? 1

  return (
    <>
      <Header title="Statistiques" subtitle="Analyse de l'activité NOMA" />

      <div className="flex-1 px-8 py-6 space-y-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Sessions totales"   value={stats.total_sessions}    icon={Users}     color="bg-slate-500" />
          <KPICard label="En cours"           value={stats.active_sessions}   icon={Clock}     color="bg-green-500" />
          <KPICard label="Terminées"          value={stats.finished_sessions} icon={TrendingUp} color="bg-blue-500" />
          <KPICard label="Formules journée"   value={stats.day_pass_count}    icon={Sun}       color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Boissons servies"   value={stats.total_drinks}              icon={Coffee}  color="bg-noma-500" />
          <KPICard label="Extras vendus"      value={stats.total_extras}              icon={Cookie}  color="bg-purple-500" />
          <KPICard label="Durée moy. session" value={`${stats.avg_duration_minutes} min`} sub="sessions au temps" icon={Clock} color="bg-cyan-500" />
          <KPICard label="Moy. boissons/session" value={stats.total_sessions > 0 ? (stats.total_drinks / stats.total_sessions).toFixed(1) : '—'} icon={BarChart2} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top boissons */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-5">
              <Coffee size={18} className="text-noma-500" />
              Top boissons
            </h2>
            {stats.top_drinks.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucune boisson enregistrée</p>
            ) : (
              <div>
                {stats.top_drinks.slice(0, 10).map(d => (
                  <RankBar key={d.drink_name} name={d.drink_name} total={d.total} max={maxDrink} />
                ))}
              </div>
            )}
          </div>

          {/* Top extras */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-5">
              <Cookie size={18} className="text-purple-500" />
              Top extras
            </h2>
            {stats.top_extras.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucun extra enregistré</p>
            ) : (
              <div>
                {stats.top_extras.slice(0, 10).map(e => (
                  <RankBar key={e.extra_name} name={e.extra_name} total={e.total} max={maxExtra} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fréquentation par heure */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-5">
              <BarChart2 size={18} className="text-blue-500" />
              Fréquentation par heure
            </h2>
            <HourChart data={stats.sessions_by_hour} />
          </div>

          {/* Sessions par zone */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-5">
              <MapPin size={18} className="text-green-500" />
              Sessions par zone
            </h2>
            {stats.sessions_by_zone.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Aucune donnée de zone</p>
            ) : (
              <div className="space-y-2">
                {stats.sessions_by_zone.slice(0, 10).map(z => (
                  <div key={z.zone} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-medium text-slate-700">{z.zone}</span>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">{z.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
