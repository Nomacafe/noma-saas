'use client'

import { SessionWithDetails } from '@/types'
import { useTimer } from '@/hooks/useTimer'
import { formatTime, getInitials } from '@/lib/utils'
import { Coffee, Cookie, MapPin, Clock, Plus, Square, X, Pencil, Sun } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface SessionCardProps {
  session: SessionWithDetails
  onAddDrink: (session: SessionWithDetails) => void
  onAddExtra: (session: SessionWithDetails) => void
  onStop: (session: SessionWithDetails) => void
  onCancel: (session: SessionWithDetails) => void
  onEdit: (session: SessionWithDetails) => void
}

export default function SessionCard({
  session,
  onAddDrink,
  onAddExtra,
  onStop,
  onCancel,
  onEdit,
}: SessionCardProps) {
  const timer = useTimer(session.arrival_time, session.status === 'active')
  const isActive = session.status === 'active'
  const drinksCount = session.session_drinks.reduce((s, d) => s + d.quantity, 0)
  const extrasCount = session.session_extras.reduce((s, e) => s + e.quantity, 0)
  const initials = getInitials(session.first_name, session.last_name)
  const fullName = session.last_name
    ? `${session.first_name} ${session.last_name}`
    : session.first_name

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 ${
      isActive ? 'border-green-200 shadow-green-50' : 'border-slate-100'
    }`}>
      {/* Header */}
      <div className={`px-5 py-4 flex items-start justify-between ${
        isActive ? 'bg-green-50' : 'bg-slate-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold ${
            isActive ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-base">{fullName}</p>
            {session.zone_name && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <MapPin size={11} />
                {session.zone_name}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {isActive ? (
            <div className="flex items-center gap-1.5">
              {session.is_day_pass && (
                <Badge variant="amber">
                  <Sun size={11} />
                  Journée
                </Badge>
              )}
              <Badge variant="green">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                En cours
              </Badge>
            </div>
          ) : (
            <Badge variant="slate">Terminée</Badge>
          )}
          <button
            onClick={() => onEdit(session)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 flex items-center gap-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock size={14} className={isActive ? 'text-green-500' : 'text-slate-400'} />
          <span className="font-medium text-slate-700">{formatTime(session.arrival_time)}</span>
          {isActive && !session.is_day_pass && (
            <span className="ml-1 text-green-600 font-semibold tabular-nums">{timer}</span>
          )}
          {isActive && session.is_day_pass && (
            <span className="ml-1 text-amber-600 font-semibold">Forfait journée</span>
          )}
          {!isActive && session.departure_time && (
            <span className="ml-1">→ {formatTime(session.departure_time)}</span>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto text-sm">
          {drinksCount > 0 && (
            <span className="flex items-center gap-1 text-noma-600 font-medium">
              <Coffee size={14} /> {drinksCount}
            </span>
          )}
          {extrasCount > 0 && (
            <span className="flex items-center gap-1 text-purple-600 font-medium">
              <Cookie size={14} /> {extrasCount}
            </span>
          )}
        </div>
      </div>

      {/* Drinks list */}
      {session.session_drinks.length > 0 && (
        <div className="px-5 py-2 space-y-1 border-b border-slate-50">
          {session.session_drinks.map(d => (
            <div key={d.id} className="flex flex-col gap-0.5">
              <span
                className={`self-start text-xs px-2.5 py-1 rounded-lg font-medium ${
                  d.bar_status === 'served'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {d.quantity > 1 && `${d.quantity}× `}{d.drink_name}
              </span>
              {d.addons && d.addons.length > 0 && (
                <div className="pl-3 flex flex-wrap gap-1">
                  {d.addons.map(a => (
                    <span
                      key={a.id}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-noma-50 text-noma-700 border border-noma-100 font-medium"
                    >
                      + {a.addon_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Extras list */}
      {session.session_extras.length > 0 && (
        <div className="px-5 py-2 flex flex-wrap gap-1.5 border-b border-slate-50">
          {session.session_extras.map(e => (
            <span key={e.id} className="text-xs px-2.5 py-1 rounded-lg font-medium bg-purple-50 text-purple-700">
              {e.quantity > 1 && `${e.quantity}× `}{e.extra_name}
            </span>
          ))}
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <div className="px-5 py-2 border-b border-slate-50">
          <p className="text-xs text-slate-400 italic">{session.notes}</p>
        </div>
      )}

      {/* Actions */}
      {isActive && (
        <div className="px-4 py-3 flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => onAddDrink(session)} className="flex-1 min-w-[90px]">
            <Plus size={14} /> Boisson
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAddExtra(session)} className="flex-1 min-w-[90px]">
            <Plus size={14} /> Extra
          </Button>
          <Button size="sm" variant="success" onClick={() => onStop(session)} className="flex-1 min-w-[90px]">
            <Square size={14} /> Arrêter
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCancel(session)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
