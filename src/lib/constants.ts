export const ZONES = [
  'Table 1',  'Table 2',  'Table 3',  'Table 4',  'Table 5',
  'Table 6',  'Table 7',  'Table 8',  'Table 9',  'Table 10',
  'Table 11', 'Table 12', 'Table 13', 'Table 14', 'Table 15',
  'Table 16', 'Table 17', 'Table 18', 'Salle de réunion',
]

export const DAY_PASS_DEFAULT_PRICE = 25

export const STATUS_LABELS = {
  active:    'En cours',
  finished:  'Terminée',
  cancelled: 'Annulée',
} as const

export const STATUS_COLORS = {
  active:    'bg-green-100 text-green-800',
  finished:  'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
} as const

export const BAR_STATUS_LABELS = {
  preparing: 'En préparation',
  served:    'Servi',
} as const

export const DRINK_CATEGORY_LABELS = {
  hot:   'Chaud',
  cold:  'Froid',
  other: 'Autre',
} as const
