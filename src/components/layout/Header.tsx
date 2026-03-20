'use client'

import { formatDate } from '@/lib/utils'
import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={16} />
          <span className="text-sm font-medium tabular-nums">{timeStr}</span>
          <span className="text-sm text-slate-400">— {formatDate(now)}</span>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}
