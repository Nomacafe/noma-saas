import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'slate' | 'red' | 'amber' | 'blue' | 'purple'
  className?: string
}

export default function Badge({ children, variant = 'slate', className }: BadgeProps) {
  const variants = {
    green: 'bg-green-100 text-green-800 border-green-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
