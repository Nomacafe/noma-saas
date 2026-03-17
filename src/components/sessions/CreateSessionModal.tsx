'use client'

import { useState, useTransition } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { ZONES, DAY_PASS_DEFAULT_PRICE } from '@/lib/constants'
import { createSession } from '@/app/actions/sessions'
import { Sun } from 'lucide-react'

interface CreateSessionModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateSessionModal({ open, onClose, onSuccess }: CreateSessionModalProps) {
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [zone,         setZone]         = useState('')
  const [notes,        setNotes]        = useState('')
  const [isDayPass,    setIsDayPass]    = useState(false)
  const [dayPassPrice, setDayPassPrice] = useState<string>(String(DAY_PASS_DEFAULT_PRICE))
  const [error,        setError]        = useState('')
  const [isPending,    startTransition] = useTransition()

  function reset() {
    setFirstName(''); setLastName(''); setZone(''); setNotes('')
    setIsDayPass(false); setDayPassPrice(String(DAY_PASS_DEFAULT_PRICE)); setError('')
  }

  function handleClose() { reset(); onClose() }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName.trim()) { setError('Le prénom est requis'); return }
    setError('')
    startTransition(async () => {
      const result = await createSession({
        first_name:     firstName.trim(),
        last_name:      lastName.trim() || undefined,
        zone_name:      zone || undefined,
        notes:          notes.trim() || undefined,
        is_day_pass:    isDayPass,
        day_pass_price: isDayPass ? parseFloat(dayPassPrice) || null : null,
      })
      if (result.error) { setError(result.error) } else { reset(); onSuccess(); onClose() }
    })
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nouvelle session" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom *" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marie" autoFocus />
          <Input label="Nom (optionnel)" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" />
        </div>

        <Select
          label="Zone / Table"
          value={zone}
          onChange={e => setZone(e.target.value)}
          placeholder="— Sélectionner une table —"
          options={ZONES.map(z => ({ value: z, label: z }))}
        />

        {/* Toggle journée */}
        <div className={`rounded-2xl border-2 p-4 transition-colors ${isDayPass ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDayPass ? 'bg-amber-400' : 'bg-slate-200'}`}>
                <Sun size={18} className={isDayPass ? 'text-white' : 'text-slate-500'} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">Formule journée</p>
                <p className="text-xs text-slate-500">Tarif fixe — durée non calculée</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDayPass(!isDayPass)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${isDayPass ? 'bg-amber-400' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${isDayPass ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </label>

          {isDayPass && (
            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">Prix journée :</label>
              <div className="relative">
                <input
                  type="number"
                  value={dayPassPrice}
                  onChange={e => setDayPassPrice(e.target.value)}
                  min="0" step="0.5"
                  className="w-28 pl-3 pr-8 py-2 rounded-xl border-2 border-amber-300 bg-white text-sm font-semibold focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">€</span>
              </div>
            </div>
          )}
        </div>

        <Input label="Note (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: appel client, besoin calme..." />

        {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} className="flex-1">Annuler</Button>
          <Button type="submit" variant="primary" loading={isPending} className="flex-1">
            {isDayPass ? '☀️ Démarrer journée' : 'Démarrer la session'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
