import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm', { locale: fr })
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMMM yyyy', { locale: fr })
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

export function calcDurationMinutes(arrival: string, departure?: string | null): number {
  const start = new Date(arrival)
  const end = departure ? new Date(departure) : new Date()
  return differenceInMinutes(end, start)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

export function getInitials(firstName: string, lastName?: string | null): string {
  const f = firstName.charAt(0).toUpperCase()
  const l = lastName ? lastName.charAt(0).toUpperCase() : ''
  return f + l
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Export Excel — génère un fichier .xlsx via HTML table (lisible par Excel/Numbers sans dépendance)
 */
export function generateExcel(
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Sessions',
): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])

  const trHead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`
  const trRows = rows
    .map(row => `<tr>${headers.map(h => {
      const v = row[h]
      return `<td>${v === null || v === undefined ? '' : String(v)}</td>`
    }).join('')}</tr>`)
    .join('')

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="UTF-8"/>
    <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>
      <x:ExcelWorksheet><x:Name>${sheetName}</x:Name>
      <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  </head>
  <body>
    <table border="1">${trHead}${trRows}</table>
  </body></html>`

  const blob = new Blob(['\uFEFF' + html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function generateCSV(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
