'use client'

import { SessionDrink, SessionWithDetails } from '@/types'
import { formatTime } from '@/lib/utils'
import { CheckCircle, Coffee } from 'lucide-react'
import { useTransition } from 'react'
import { serveDrink } from '@/app/actions/sessions'

interface BarQueueItem {
  drink: SessionDrink
  session: SessionWithDetails
}

interface BarQueueProps {
  items: BarQueueItem[]
  onRefresh: () => void
}

export default function BarQueue({ items, onRefresh }: BarQueueProps) {
  const [isPending, startTransition] = useTransition()

  function handleServe(drinkId: string) {
    startTransition(async () => {
      await serveDrink(drinkId)
      onRefresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
        <Coffee size={32} className="text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Aucune commande en attente</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map(({ drink, session }) => (
        <div
          key={drink.id}
          className="bg-white rounded-2xl border border-amber-100 px-4 py-3 flex items-center gap-4 shadow-sm animate-slide-in"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Coffee size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {drink.quantity > 1 && `${drink.quantity}× `}{drink.drink_name}
            </p>
            {drink.addons && drink.addons.length > 0 && (
              <p className="text-xs text-noma-600 font-medium mt-0.5">
                + {drink.addons.map(a => a.addon_name).join(', ')}
              </p>
            )}
            <p className="text-xs text-slate-500 truncate">
              {session.first_name} {session.last_name ?? ''} · {session.zone_name ?? 'Zone ?'} · {formatTime(drink.added_at)}
            </p>
          </div>
          <button
            onClick={() => handleServe(drink.id)}
            disabled={isPending}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition-all active:scale-95"
          >
            <CheckCircle size={15} />
            Servi
          </button>
        </div>
      ))}
    </div>
  )
}
