import { NextRequest, NextResponse } from 'next/server'
import { db_createSession, db_getSessionsForDate, db_getKPIForDate } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const data = await db_getSessionsForDate(date)
    const kpi = await db_getKPIForDate(date)
    return NextResponse.json({ data, kpi })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await db_createSession({
      first_name:     body.first_name,
      last_name:      body.last_name      ?? null,
      zone_name:      body.zone_name      ?? null,
      notes:          body.notes          ?? null,
      is_day_pass:    body.is_day_pass    ?? false,
      day_pass_price: body.day_pass_price ?? null,
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 500 })
  }
}
