'use client'

import { useState, useTransition } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { SessionWithDetails } from '@/types'
import { ZONES } from '@/lib/constants'
import { updateSession } from '@/app/actions/sessions'

interface EditSessionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  session: SessionWithDetails | null
}

export default function EditSessionModal({ open, onClose, onSuccess, session }: EditSessionModalProps) {
  const [firstName, setFirstName] = useState(session?.first_name ?? '')
  const [lastName, setLastName] = useState(session?.last_name ?? '')
  const [zone, setZone] = useState(session?.zone_name ?? '')
  const [notes, setNotes] = useState(session?.notes ?? '')
  const [isPending, startTransition] = useTransition()

  // Sync when session changes
  if (session && firstName === '' && session.first_name) {
    setFirstName(session.first_name)
    setLastName(session.last_name ?? '')
    setZone(session.zone_name ?? '')
    setNotes(session.notes ?? '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    startTransition(async () => {
      await updateSession(session.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        zone_name: zone || null,
        notes: notes.trim() || null,
      })
      onSuccess()
      onClose()
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Modifier la session" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={firstName} onChange={e => setFirstName(e.target.value)} />
          <Input label="Nom" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>
        <Select
          label="Zone / Table"
          value={zone}
          onChange={e => setZone(e.target.value)}
          placeholder="— Aucune zone —"
          options={ZONES.map(z => ({ value: z, label: z }))}
        />
        <Input label="Note" value={notes} onChange={e => setNotes(e.target.value)} placeholder="..." />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
          <Button type="submit" variant="primary" loading={isPending} className="flex-1">Enregistrer</Button>
        </div>
      </form>
    </Modal>
  )
}
