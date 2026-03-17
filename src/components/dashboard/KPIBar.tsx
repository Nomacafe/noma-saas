import { KPIData } from '@/types'
import { Users, Clock, CheckCircle, Coffee, Cookie } from 'lucide-react'

interface KPIBarProps {
  kpi: KPIData
}

export default function KPIBar({ kpi }: KPIBarProps) {
  const stats = [
    {
      label: 'Sessions totales',
      value: kpi.total_sessions,
      icon: Users,
      color: 'text-slate-600',
      bg: 'bg-slate-100',
    },
    {
      label: 'En cours',
      value: kpi.active_sessions,
      icon: Clock,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Terminées',
      value: kpi.finished_sessions,
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Boissons',
      value: kpi.total_drinks,
      icon: Coffee,
      color: 'text-noma-600',
      bg: 'bg-noma-100',
    },
    {
      label: 'Extras',
      value: kpi.total_extras,
      icon: Cookie,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ]

  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
