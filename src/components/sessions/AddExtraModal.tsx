'use client'

import { useTransition } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { ExtraCatalog, SessionWithDetails } from '@/types'
import { addExtraToSession } from '@/app/actions/sessions'
import { Cookie } from 'lucide-react'

interface AddExtraModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  session: SessionWithDetails | null
  extras: ExtraCatalog[]
}

export default function AddExtraModal({ open, onClose, onSuccess, session, extras }: AddExtraModalProps) {
  const [isPending, startTransition] = useTransition()

  function handleQuickAdd(extra: ExtraCatalog) {
    if (!session) return
    startTransition(async () => {
      await addExtraToSession({
        session_id: session.id,
        extra_id: extra.id,
        extra_name: extra.name,
        quantity: 1,
      })
      onClose()
      onSuccess()
    })
  }

  const activeExtras = extras.filter(e => e.is_active).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <Modal open={open} onClose={onClose} title={`Ajouter un extra — ${session?.first_name ?? ''}`} size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {activeExtras.map(extra => (
            <button
              key={extra.id}
              onClick={() => handleQuickAdd(extra)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-transparent text-sm font-medium text-slate-700 hover:text-purple-700 transition-all duration-150 text-left active:scale-[0.97]"
            >
              <Cookie size={15} className="text-purple-400 shrink-0" />
              {extra.name}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
