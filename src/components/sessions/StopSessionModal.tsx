'use client'

import { useTransition } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { SessionWithDetails } from '@/types'
import { stopSession, cancelSession } from '@/app/actions/sessions'
import { calcDurationMinutes, formatDuration, formatTime } from '@/lib/utils'
import { Clock, Coffee, Cookie, Square } from 'lucide-react'

interface StopSessionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  session: SessionWithDetails | null
  mode: 'stop' | 'cancel'
}

export default function StopSessionModal({ open, onClose, onSuccess, session, mode }: StopSessionModalProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!session) return
    startTransition(async () => {
      if (mode === 'stop') {
        await stopSession(session.id)
      } else {
        await cancelSession(session.id)
      }
      onClose()
      onSuccess()
    })
  }

  if (!session) return null

  const duration = calcDurationMinutes(session.arrival_time)
  const drinksCount = session.session_drinks.reduce((s, d) => s + d.quantity, 0)
  const extrasCount = session.session_extras.reduce((s, e) => s + e.quantity, 0)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'stop' ? 'Terminer la session' : 'Annuler la session'}
      size="sm"
    >
      <div className="space-y-5">
        <div className="bg-slate-50 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Client</span>
            <span className="font-semibold text-slate-900">
              {session.first_name} {session.last_name ?? ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 flex items-center gap-1.5"><Clock size={13} /> Arrivée</span>
            <span className="font-medium text-slate-700">{formatTime(session.arrival_time)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 flex items-center gap-1.5"><Square size={13} /> Durée</span>
            <span className="font-semibold text-green-600">{formatDuration(duration)}</span>
          </div>
          {drinksCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-1.5"><Coffee size={13} /> Boissons</span>
              <span className="font-medium text-slate-700">{drinksCount}</span>
            </div>
          )}
          {extrasCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 flex items-center gap-1.5"><Cookie size={13} /> Extras</span>
              <span className="font-medium text-slate-700">{extrasCount}</span>
            </div>
          )}
        </div>

        {mode === 'cancel' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
            Cette action annulera la session sans enregistrer la durée.
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Retour
          </Button>
          <Button
            variant={mode === 'stop' ? 'success' : 'danger'}
            onClick={handleConfirm}
            loading={isPending}
            className="flex-1"
          >
            {mode === 'stop' ? 'Confirmer' : 'Annuler la session'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
