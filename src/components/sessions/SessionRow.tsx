'use client'

import { SessionWithDetails } from '@/types'
import { useTimer } from '@/hooks/useTimer'
import { formatTime, formatDuration, calcDurationMinutes } from '@/lib/utils'
import { Coffee, Cookie, Plus, Square, X, Pencil, Sun } from 'lucide-react'
import Badge from '@/components/ui/Badge'

interface SessionRowProps {
  session: SessionWithDetails
  onAddDrink: (session: SessionWithDetails) => void
  onAddExtra: (session: SessionWithDetails) => void
  onStop: (session: SessionWithDetails) => void
  onCancel: (session: SessionWithDetails) => void
  onEdit: (session: SessionWithDetails) => void
}

export default function SessionRow({
  session,
  onAddDrink,
  onAddExtra,
  onStop,
  onCancel,
  onEdit,
}: SessionRowProps) {
  const timer      = useTimer(session.arrival_time, session.status === 'active')
  const isActive   = session.status === 'active'
  const fullName   = session.last_name
    ? `${session.first_name} ${session.last_name}`
    : session.first_name

  const drinksCount = session.session_drinks.reduce((s, d) => s + d.quantity, 0)
  const extrasCount = session.session_extras.reduce((s, e) => s + e.quantity, 0)

  const duration = session.is_day_pass
    ? null
    : session.duration_minutes != null
      ? formatDuration(session.duration_minutes)
      : isActive
        ? timer
        : '—'

  return (
    <tr className={`group transition-colors hover:bg-slate-50/80 ${
      isActive ? 'bg-green-50/30' : ''
    }`}>

      {/* Arrivée */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="tabular-nums font-semibold text-slate-700">
          {formatTime(session.arrival_time)}
        </span>
      </td>

      {/* Prénom */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
            isActive ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {session.first_name.charAt(0).toUpperCase()}
            {session.last_name ? session.last_name.charAt(0).toUpperCase() : ''}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
              {fullName}
            </p>
            {session.notes && (
              <p className="text-xs text-slate-400 italic truncate max-w-[140px] leading-tight mt-0.5">
                {session.notes}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Zone / Table */}
      <td className="px-4 py-3">
        <span className={`text-sm font-medium px-2.5 py-1 rounded-lg ${
          session.zone_name
            ? 'bg-slate-100 text-slate-700'
            : 'text-slate-300'
        }`}>
          {session.zone_name ?? '—'}
        </span>
      </td>

      {/* Départ */}
      <td className="px-4 py-3 whitespace-nowrap">
        {session.departure_time ? (
          <span className="tabular-nums text-slate-600">
            {formatTime(session.departure_time)}
          </span>
        ) : isActive ? (
          <span className="text-xs text-slate-300 italic">En cours</span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Durée */}
      <td className="px-4 py-3 whitespace-nowrap">
        {session.is_day_pass ? (
          <span className="flex items-center gap-1 text-amber-600 font-medium text-xs">
            <Sun size={12} /> Journée
          </span>
        ) : isActive && !session.is_day_pass ? (
          <span className="tabular-nums text-green-600 font-semibold text-sm">
            {timer}
          </span>
        ) : session.duration_minutes != null ? (
          <span className="tabular-nums text-slate-700">
            {formatDuration(session.duration_minutes)}
          </span>
        ) : session.departure_time ? (
          <span className="tabular-nums text-slate-700">
            {formatDuration(calcDurationMinutes(session.arrival_time, session.departure_time))}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Statut */}
      <td className="px-4 py-3 whitespace-nowrap">
        {isActive ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="green">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              En cours
            </Badge>
            {session.is_day_pass && (
              <Badge variant="amber">
                <Sun size={10} /> Journée
              </Badge>
            )}
          </div>
        ) : session.status === 'finished' ? (
          <Badge variant="slate">Terminée</Badge>
        ) : (
          <Badge variant="red">Annulée</Badge>
        )}
      </td>

      {/* Consommations */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 max-w-[280px]">
          {session.session_drinks.map(d => (
            <span
              key={d.id}
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                d.bar_status === 'served'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}
            >
              <Coffee size={10} />
              {d.quantity > 1 && `${d.quantity}× `}{d.drink_name}
              {d.addons && d.addons.length > 0 && (
                <span className="text-[10px] opacity-70">
                  {d.addons.map(a => a.addon_name).join('+')}
                </span>
              )}
              <span className={`text-[9px] font-semibold uppercase ${
                d.bar_status === 'served' ? 'text-green-500' : 'text-amber-500'
              }`}>
                • {d.bar_status === 'served' ? 'Servi' : 'Prép.'}
              </span>
            </span>
          ))}
          {session.session_extras.map(e => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium bg-purple-50 text-purple-700"
            >
              <Cookie size={10} />
              {e.quantity > 1 && `${e.quantity}× `}{e.extra_name}
            </span>
          ))}
          {drinksCount === 0 && extrasCount === 0 && (
            <span className="text-xs text-slate-300 italic">Aucune</span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          {isActive ? (
            <>
              {/* + Boisson */}
              <button
                onClick={() => onAddDrink(session)}
                title="Ajouter une boisson"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-noma-50 hover:bg-noma-100 text-noma-700 text-xs font-semibold transition-colors min-h-[32px] whitespace-nowrap"
              >
                <Coffee size={13} />
                <Plus size={11} />
              </button>

              {/* + Extra */}
              <button
                onClick={() => onAddExtra(session)}
                title="Ajouter un extra"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors min-h-[32px] whitespace-nowrap"
              >
                <Cookie size={13} />
                <Plus size={11} />
              </button>

              {/* Arrêter */}
              <button
                onClick={() => onStop(session)}
                title="Terminer la session"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors min-h-[32px]"
              >
                <Square size={12} />
                Arrêter
              </button>

              {/* Éditer */}
              <button
                onClick={() => onEdit(session)}
                title="Modifier"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <Pencil size={14} />
              </button>

              {/* Annuler */}
              <button
                onClick={() => onCancel(session)}
                title="Annuler / Supprimer"
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              {/* Éditer (terminée) */}
              <button
                onClick={() => onEdit(session)}
                title="Modifier"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <Pencil size={14} />
              </button>
              {/* Supprimer */}
              <button
                onClick={() => onCancel(session)}
                title="Supprimer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors min-h-[32px]"
              >
                <X size={13} />
                Supprimer
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
