'use client'

import { useState, useCallback, useTransition } from 'react'
import { SessionWithDetails } from '@/types'
import Header from '@/components/layout/Header'
import BarQueue from '@/components/bar/BarQueue'
import { Coffee, CheckCircle, RefreshCw } from 'lucide-react'
import { getSessionsForDate } from '@/app/actions/sessions'
import { todayISO, formatTime } from '@/lib/utils'

interface Props {
  initialSessions: SessionWithDetails[]
}

export default function BarPageClient({ initialSessions }: Props) {
  const [sessions, setSessions] = useState<SessionWithDetails[]>(initialSessions)
  const [isRefreshing, startRefresh] = useTransition()

  const refresh = useCallback(() => {
    startRefresh(async () => {
      const { data } = await getSessionsForDate(todayISO())
      setSessions(data as SessionWithDetails[])
    })
  }, [])

  const activeSessions = sessions.filter(s => s.status === 'active')

  const preparingItems = activeSessions.flatMap(session =>
    session.session_drinks
      .filter(d => d.bar_status === 'preparing')
      .map(drink => ({ drink, session }))
  )

  const servedItems = activeSessions.flatMap(session =>
    session.session_drinks
      .filter(d => d.bar_status === 'served')
      .map(drink => ({ drink, session }))
  )

  return (
    <>
      <Header
        title="File bar"
        subtitle="Commandes en attente de préparation"
        actions={
          <button
            onClick={refresh}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        }
      />

      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-2 gap-8 items-start">
          {/* En préparation */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Coffee size={20} className="text-amber-500" />
              <h2 className="font-bold text-slate-900 text-lg">En préparation</h2>
              {preparingItems.length > 0 && (
                <span className="ml-auto text-sm font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                  {preparingItems.length}
                </span>
              )}
            </div>
            <BarQueue items={preparingItems} onRefresh={refresh} />
          </div>

          {/* Servis récemment */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-500" />
              <h2 className="font-bold text-slate-900 text-lg">Servis aujourd&apos;hui</h2>
              <span className="ml-auto text-sm font-medium text-slate-400">
                {servedItems.length}
              </span>
            </div>
            <div className="space-y-2">
              {servedItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-sm text-slate-400">
                  Aucune commande servie
                </div>
              ) : (
                servedItems.map(({ drink, session }) => (
                  <div
                    key={drink.id}
                    className="bg-white rounded-2xl border border-green-100 px-4 py-3 flex items-center gap-4 opacity-70"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {drink.quantity > 1 && `${drink.quantity}× `}{drink.drink_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session.first_name} · servi {drink.served_at ? formatTime(drink.served_at) : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
