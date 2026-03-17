'use client'

import { useEffect, useState } from 'react'
import { calcDurationMinutes, formatDuration } from '@/lib/utils'

export function useTimer(arrivalTime: string, isActive: boolean): string {
  // Initialise à '' pour éviter un mismatch d'hydration (valeur différente serveur/client)
  const [duration, setDuration] = useState('')

  useEffect(() => {
    // Calcul immédiat au montage, côté client uniquement
    setDuration(formatDuration(calcDurationMinutes(arrivalTime)))
    if (!isActive) return
    const interval = setInterval(() => {
      setDuration(formatDuration(calcDurationMinutes(arrivalTime)))
    }, 10000)
    return () => clearInterval(interval)
  }, [arrivalTime, isActive])

  return duration
}
