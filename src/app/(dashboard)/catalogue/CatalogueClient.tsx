'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import { DrinkCatalog, ExtraCatalog } from '@/types'
import { Coffee, Cookie } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = { hot: 'Chaud', cold: 'Froid', other: 'Autre' }
const CATEGORY_BADGES: Record<string, 'amber' | 'blue' | 'slate'> = { hot: 'amber', cold: 'blue', other: 'slate' }

interface Props {
  initialDrinks: DrinkCatalog[]
  initialExtras: ExtraCatalog[]
}

export default function CatalogueClient({ initialDrinks, initialExtras }: Props) {
  const [tab, setTab] = useState<'drinks' | 'extras'>('drinks')

  return (
    <>
      <Header title="Catalogue" subtitle="Boissons et extras disponibles" />

      <div className="flex-1 px-8 py-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
          {(['drinks', 'extras'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                tab === t ? 'bg-noma-500 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t === 'drinks' ? <Coffee size={15} /> : <Cookie size={15} />}
              {t === 'drinks' ? `Boissons (${initialDrinks.length})` : `Extras (${initialExtras.length})`}
            </button>
          ))}
        </div>

        {tab === 'drinks' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Nom</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Catégorie</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Ordre</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialDrinks.map(drink => (
                  <tr key={drink.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Coffee size={15} className="text-noma-400" />
                      {drink.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={CATEGORY_BADGES[drink.category]}>
                        {CATEGORY_LABELS[drink.category]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{drink.sort_order}</td>
                    <td className="px-6 py-4">
                      <Badge variant={drink.is_active ? 'green' : 'red'}>
                        {drink.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'extras' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Nom</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Ordre</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialExtras.map(extra => (
                  <tr key={extra.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Cookie size={15} className="text-purple-400" />
                      {extra.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{extra.sort_order}</td>
                    <td className="px-6 py-4">
                      <Badge variant={extra.is_active ? 'green' : 'red'}>
                        {extra.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
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
