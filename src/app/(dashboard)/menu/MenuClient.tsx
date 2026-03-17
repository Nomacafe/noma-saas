'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import { DrinkCatalog, ExtraCatalog, DrinkAddon } from '@/types'
import { Coffee, Cookie, Sparkles } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = { hot: 'Chaud', cold: 'Froid', other: 'Autre' }
const CATEGORY_BADGES: Record<string, 'amber' | 'blue' | 'slate'> = { hot: 'amber', cold: 'blue', other: 'slate' }

interface Props {
  initialDrinks: DrinkCatalog[]
  initialExtras: ExtraCatalog[]
  initialAddons: DrinkAddon[]
}

type Tab = 'drinks' | 'extras' | 'addons'

export default function MenuClient({ initialDrinks, initialExtras, initialAddons }: Props) {
  const [tab, setTab] = useState<Tab>('drinks')

  return (
    <>
      <Header title="Menu" subtitle="Boissons, extras et suppléments" />

      <div className="flex-1 px-8 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {([
            { key: 'drinks', label: `Boissons (${initialDrinks.length})`, icon: Coffee },
            { key: 'extras', label: `Extras (${initialExtras.length})`, icon: Cookie },
            { key: 'addons', label: `Suppléments (${initialAddons.length})`, icon: Sparkles },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === key ? 'bg-noma-500 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Boissons */}
        {tab === 'drinks' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Boisson</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Catégorie</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Prix</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialDrinks.map(drink => (
                  <tr key={drink.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Coffee size={15} className="text-noma-400" />
                        {drink.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={CATEGORY_BADGES[drink.category]}>{CATEGORY_LABELS[drink.category]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {drink.price != null ? `${drink.price.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={drink.is_active ? 'green' : 'red'}>{drink.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Extras */}
        {tab === 'extras' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Extra</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Prix</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialExtras.map(extra => (
                  <tr key={extra.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Cookie size={15} className="text-purple-400" />
                        {extra.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {extra.price != null ? `${extra.price.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={extra.is_active ? 'green' : 'red'}>{extra.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Suppléments */}
        {tab === 'addons' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Supplément</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Prix</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialAddons.map(addon => (
                  <tr key={addon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-amber-400" />
                        {addon.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {addon.price != null ? `+ ${addon.price.toFixed(2)} €` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={addon.is_active ? 'green' : 'red'}>{addon.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
