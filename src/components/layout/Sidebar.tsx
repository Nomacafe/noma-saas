'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Coffee, History, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/',           label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/bar',        label: 'File bar',     icon: Coffee },
  { href: '/historique', label: 'Historique',   icon: History },
  { href: '/stats',      label: 'Statistiques', icon: BarChart2 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-slate-950 text-white">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-noma-500 flex items-center justify-center">
            <Coffee size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">NOMA</p>
            <p className="text-xs text-slate-400 leading-tight">Café Coworking</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-noma-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Version label */}
      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">NOMA SaaS — V1 local</p>
      </div>
    </aside>
  )
}
