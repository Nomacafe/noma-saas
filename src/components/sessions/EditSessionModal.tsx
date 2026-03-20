'use client'

import { useState, useTransition, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { SessionWithDetails } from '@/types'
import { ZONES } from '@/lib/constants'
import { updateSession } from '@/app/actions/sessions'
import { format, parseISO } from 'date-fns'

interface EditSessionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  session: SessionWithDetails | null
}

/** Convertit un ISO string en format HH:mm pour input[type=time] */
function isoToTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

/** Remplace l'heure dans un ISO string sans changer la date */
function replaceTime(iso: string, hhmm: string): string {
  const d = new Date(iso)
  const [hh, mm] = hhmm.split(':').map(Number)
  d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}

export default function EditSessionModal({
  open,
  onClose,
  onSuccess,
  session,
}: EditSessionModalProps) {
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [zone,         setZone]         = useState('')
  const [notes,        setNotes]        = useState('')
  const [arrivalTime,  setArrivalTime]  = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [isPending,    startTransition] = useTransition()
  const [error,        setError]        = useState('')

  // Sync quand la session change (ou quand la modal s'ouvre)
  useEffect(() => {
    if (!session) return
    setFirstName(session.first_name)
    setLastName(session.last_name ?? '')
    setZone(session.zone_name ?? '')
    setNotes(session.notes ?? '')
    setArrivalTime(isoToTime(session.arrival_time))
    setDepartureTime(session.departure_time ? isoToTime(session.departure_time) : '')
    setError('')
  }, [session?.id, open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    if (!firstName.trim()) { setError('Le prénom est requis'); return }
    setError('')

    // Recalcule l'heure d'arrivée si elle a changé
    const newArrival   = arrivalTime
      ? replaceTime(session.arrival_time, arrivalTime)
      : session.arrival_time

    // Recalcule l'heure de départ (seulement pour sessions terminées)
    const newDeparture = departureTime && session.departure_time
      ? replaceTime(session.departure_time, departureTime)
      : session.departure_time

    // Recalcule la durée si arrivée/départ ont changé
    let durationMinutes = session.duration_minutes
    if (newArrival && newDeparture && !session.is_day_pass) {
      durationMinutes = Math.round(
        (new Date(newDeparture).getTime() - new Date(newArrival).getTime()) / 60000
      )
    }

    startTransition(async () => {
      const result = await updateSession(session.id, {
        first_name:       firstName.trim(),
        last_name:        lastName.trim() || null,
        zone_name:        zone || null,
        notes:            notes.trim() || null,
        arrival_time:     newArrival,
        departure_time:   newDeparture,
        duration_minutes: durationMinutes,
      })
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
        onClose()
      }
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Modifier la session" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nom */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom *"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            autoFocus
          />
          <Input
            label="Nom de famille"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="optionnel"
          />
        </div>

        {/* Zone */}
        <Select
          label="Zone / Table"
          value={zone}
          onChange={e => setZone(e.target.value)}
          placeholder="— Aucune zone —"
          options={ZONES.map(z => ({ value: z, label: z }))}
        />

        {/* Horaires */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Heure d'arrivée
            </label>
            <input
              type="time"
              value={arrivalTime}
              onChange={e => setArrivalTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-noma-400 focus:border-transparent tabular-nums"
            />
          </div>
          {session?.departure_time && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Heure de départ
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-noma-400 focus:border-transparent tabular-nums"
              />
              <p className="text-xs text-slate-400 mt-1">La durée sera recalculée automatiquement</p>
            </div>
          )}
        </div>

        {/* Note */}
        <Input
          label="Note (optionnel)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Ex: appel client, besoin calme..."
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={isPending} className="flex-1">
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
