'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { DrinkCatalog, DrinkAddon, SessionWithDetails } from '@/types'
import { Coffee, ChevronLeft, Check } from 'lucide-react'

interface AddDrinkModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  session: SessionWithDetails | null
  drinks: DrinkCatalog[]
  addons: DrinkAddon[]
}

const CATEGORY_ORDER  = ['hot', 'cold', 'other']
const CATEGORY_LABELS: Record<string, string> = { hot: '☕ Chaud', cold: '🧊 Froid', other: '✨ Autre' }

export default function AddDrinkModal({ open, onClose, onSuccess, session, drinks, addons }: AddDrinkModalProps) {
  const [step,           setStep]         = useState<'drink' | 'addons'>('drink')
  const [selectedDrink,  setSelectedDrink]= useState<DrinkCatalog | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [isPending,      setIsPending]    = useState(false)

  function handleClose() {
    setStep('drink'); setSelectedDrink(null); setSelectedAddons([])
    onClose()
  }

  function handlePickDrink(drink: DrinkCatalog) {
    setSelectedDrink(drink)
    if (!activeAddons.length) {
      submitDrink(drink, [])
    } else {
      setStep('addons')
    }
  }

  function toggleAddon(id: string) {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  async function submitDrink(drink: DrinkCatalog, addonIds: string[]) {
    if (!session) return
    setIsPending(true)
    try {
      const res = await fetch('/api/bar/drinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:     'add_drink',
          session_id: session.id,
          drink_id:   drink.id,
          drink_name: drink.name,
          quantity:   1,
          addon_ids:  addonIds,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        console.error('Erreur ajout boisson:', data.error)
      } else {
        handleClose()
        onSuccess()
      }
    } catch (e) {
      console.error('Erreur réseau:', e)
    } finally {
      setIsPending(false)
    }
  }

  const activeAddons = addons.filter(a => a.is_active)
  const grouped = CATEGORY_ORDER.reduce<Record<string, DrinkCatalog[]>>((acc, cat) => {
    acc[cat] = drinks.filter(d => d.category === cat && d.is_active).sort((a, b) => a.sort_order - b.sort_order)
    return acc
  }, {})

  const addonTotal = activeAddons
    .filter(a => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + (a.price ?? 0), 0)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 'drink'
        ? `Boisson — ${session?.first_name ?? ''}`
        : `Suppléments — ${selectedDrink?.name ?? ''}`}
      size="lg"
    >
      {step === 'drink' && (
        <div className="space-y-6">
          {CATEGORY_ORDER.map(cat => {
            const items = grouped[cat]
            if (!items?.length) return null
            return (
              <div key={cat}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {CATEGORY_LABELS[cat]}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {items.map(drink => (
                    <button
                      key={drink.id}
                      onClick={() => handlePickDrink(drink)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 hover:bg-noma-50 hover:border-noma-200 border border-transparent text-sm font-medium text-slate-700 hover:text-noma-700 transition-all duration-150 text-left active:scale-[0.97]"
                    >
                      <Coffee size={15} className="text-noma-400 shrink-0" />
                      {drink.name}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          <div className="pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={handleClose} className="w-full">Fermer</Button>
          </div>
        </div>
      )}

      {step === 'addons' && selectedDrink && (
        <div className="space-y-5">
          <button
            onClick={() => { setStep('drink'); setSelectedAddons([]) }}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft size={16} /> Changer de boisson
          </button>

          <div className="bg-noma-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <Coffee size={18} className="text-noma-500" />
            <span className="font-semibold text-noma-800">{selectedDrink.name}</span>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Suppléments (optionnel)</p>
            <div className="grid grid-cols-2 gap-2">
              {activeAddons.map(addon => {
                const checked = selectedAddons.includes(addon.id)
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      checked
                        ? 'border-noma-400 bg-noma-50 text-noma-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{addon.name}</span>
                    <div className="flex items-center gap-2">
                      {addon.price != null && (
                        <span className="text-xs text-slate-400">+{addon.price.toFixed(2)}€</span>
                      )}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${checked ? 'border-noma-500 bg-noma-500' : 'border-slate-300'}`}>
                        {checked && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedAddons.length > 0 && addonTotal > 0 && (
            <div className="bg-slate-50 rounded-xl px-4 py-2 text-sm text-slate-600">
              Supplément total : <strong>+{addonTotal.toFixed(2)} €</strong>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button variant="secondary" onClick={handleClose} className="flex-1">Annuler</Button>
            <Button
              variant="primary"
              loading={isPending}
              onClick={() => submitDrink(selectedDrink, selectedAddons)}
              className="flex-1"
            >
              Ajouter
              {selectedAddons.length > 0 && ` (${selectedAddons.length} supplément${selectedAddons.length > 1 ? 's' : ''})`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
