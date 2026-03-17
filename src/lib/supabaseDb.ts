/**
 * Base de données Supabase — remplace localDb pour le déploiement cloud
 * Utilise la SERVICE_ROLE_KEY côté serveur (jamais exposée au client)
 */

import { createClient } from '@supabase/supabase-js'
import type {
  Session, SessionDrink, SessionExtra,
  DrinkCatalog, ExtraCatalog, DrinkAddon, StatsData,
} from '@/types'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Variables Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
  return createClient(url, key, { auth: { persistSession: false } })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hydrateSession(row: any): Session {
  return {
    ...row,
    session_drinks: (row.session_drinks ?? []).map((d: any) => ({
      ...d,
      addons: d.session_drink_addons ?? [],
    })),
    session_extras: row.session_extras ?? [],
  }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function db_getSessionsForDate(date: string): Promise<Session[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*, session_drinks(*, session_drink_addons(*)), session_extras(*)')
    .eq('date', date)
    .order('arrival_time', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(hydrateSession)
}

export async function db_getSessionsForRange(startDate: string, endDate: string): Promise<Session[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*, session_drinks(*, session_drink_addons(*)), session_extras(*)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('arrival_time', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(hydrateSession)
}

export async function db_getKPIForDate(date: string) {
  const supabase = getClient()
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, status')
    .eq('date', date)

  const ids = (sessions ?? []).map(s => s.id)
  let total_drinks = 0, total_extras = 0

  if (ids.length > 0) {
    const [{ data: drinks }, { data: extras }] = await Promise.all([
      supabase.from('session_drinks').select('quantity').in('session_id', ids),
      supabase.from('session_extras').select('quantity').in('session_id', ids),
    ])
    total_drinks = (drinks ?? []).reduce((a, d) => a + (d.quantity || 0), 0)
    total_extras = (extras ?? []).reduce((a, e) => a + (e.quantity || 0), 0)
  }

  const s = sessions ?? []
  return {
    total_sessions:     s.length,
    active_sessions:    s.filter(x => x.status === 'active').length,
    finished_sessions:  s.filter(x => x.status === 'finished').length,
    cancelled_sessions: s.filter(x => x.status === 'cancelled').length,
    total_drinks,
    total_extras,
  }
}

export async function db_createSession(input: {
  first_name: string; last_name: string | null; zone_name: string | null
  notes: string | null; is_day_pass: boolean; day_pass_price: number | null
}): Promise<Session> {
  const supabase = getClient()
  const now = new Date()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      date:           now.toISOString().split('T')[0],
      first_name:     input.first_name,
      last_name:      input.last_name,
      zone_name:      input.zone_name,
      arrival_time:   now.toISOString(),
      status:         'active',
      notes:          input.notes,
      is_day_pass:    input.is_day_pass,
      day_pass_price: input.day_pass_price,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Session
}

export async function db_stopSession(sessionId: string): Promise<{ error?: string }> {
  const supabase = getClient()
  const { data: session } = await supabase
    .from('sessions')
    .select('arrival_time, is_day_pass')
    .eq('id', sessionId)
    .single()
  if (!session) return { error: 'Session introuvable' }

  const now = new Date()
  const durationMinutes = session.is_day_pass
    ? null
    : Math.round((now.getTime() - new Date(session.arrival_time).getTime()) / 60000)

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'finished', departure_time: now.toISOString(), duration_minutes: durationMinutes })
    .eq('id', sessionId)
  if (error) return { error: error.message }
  return {}
}

export async function db_cancelSession(sessionId: string): Promise<{ error?: string }> {
  const supabase = getClient()
  const { error } = await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', sessionId)
  if (error) return { error: error.message }
  return {}
}

export async function db_updateSession(
  sessionId: string,
  data: { first_name: string; last_name: string | null; zone_name: string | null; notes: string | null }
): Promise<{ error?: string }> {
  const supabase = getClient()
  const { error } = await supabase.from('sessions').update(data).eq('id', sessionId)
  if (error) return { error: error.message }
  return {}
}

// ─── Boissons ────────────────────────────────────────────────────────────────

export async function db_addDrink(input: {
  session_id: string; drink_id: string; drink_name: string
  quantity: number; addon_ids: string[]
}): Promise<{ error?: string }> {
  const supabase = getClient()
  const now = new Date().toISOString()

  let addons: DrinkAddon[] = []
  if (input.addon_ids.length > 0) {
    const { data } = await supabase.from('drink_addons').select('*').in('id', input.addon_ids)
    addons = (data ?? []) as DrinkAddon[]
  }
  const addonTotal = addons.reduce((sum, a) => sum + (a.price ?? 0), 0)

  const { data: drink, error: drinkErr } = await supabase
    .from('session_drinks')
    .insert({
      session_id: input.session_id,
      drink_id:   input.drink_id,
      drink_name: input.drink_name,
      quantity:   input.quantity,
      bar_status: 'preparing',
      added_at:   now,
      line_total: addonTotal > 0 ? addonTotal * input.quantity : null,
    })
    .select()
    .single()
  if (drinkErr) return { error: drinkErr.message }

  if (addons.length > 0) {
    const { error: addonsErr } = await supabase
      .from('session_drink_addons')
      .insert(addons.map(a => ({
        session_drink_id: drink.id,
        addon_id:         a.id,
        addon_name:       a.name,
        price_snapshot:   a.price,
        created_at:       now,
      })))
    if (addonsErr) return { error: addonsErr.message }
  }
  return {}
}

export async function db_serveDrink(drinkId: string): Promise<{ error?: string }> {
  const supabase = getClient()
  const { error } = await supabase
    .from('session_drinks')
    .update({ bar_status: 'served', served_at: new Date().toISOString() })
    .eq('id', drinkId)
  if (error) return { error: error.message }
  return {}
}

// ─── Extras ──────────────────────────────────────────────────────────────────

export async function db_addExtra(input: {
  session_id: string; extra_id: string; extra_name: string; quantity: number
}): Promise<{ error?: string }> {
  const supabase = getClient()
  const { error } = await supabase
    .from('session_extras')
    .insert({
      session_id: input.session_id,
      extra_id:   input.extra_id,
      extra_name: input.extra_name,
      quantity:   input.quantity,
      added_at:   new Date().toISOString(),
    })
  if (error) return { error: error.message }
  return {}
}

// ─── Catalogue ───────────────────────────────────────────────────────────────

export async function db_getCatalog() {
  const supabase = getClient()
  const [{ data: drinks }, { data: extras }, { data: addons }] = await Promise.all([
    supabase.from('drinks_catalog').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('extras_catalog').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('drink_addons').select('*').eq('is_active', true).order('name'),
  ])
  return {
    drinks: (drinks ?? []) as DrinkCatalog[],
    extras: (extras ?? []) as ExtraCatalog[],
    addons: (addons ?? []) as DrinkAddon[],
  }
}

export async function db_getFullCatalog() {
  const supabase = getClient()
  const [{ data: drinks }, { data: extras }, { data: addons }] = await Promise.all([
    supabase.from('drinks_catalog').select('*').order('sort_order'),
    supabase.from('extras_catalog').select('*').order('sort_order'),
    supabase.from('drink_addons').select('*').order('name'),
  ])
  return {
    drinks: (drinks ?? []) as DrinkCatalog[],
    extras: (extras ?? []) as ExtraCatalog[],
    addons: (addons ?? []) as DrinkAddon[],
  }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function db_getStats(): Promise<StatsData> {
  const supabase = getClient()
  const [{ data: sessions }, { data: drinks }, { data: extras }] = await Promise.all([
    supabase.from('sessions').select('id, status, is_day_pass, arrival_time, zone_name, duration_minutes'),
    supabase.from('session_drinks').select('drink_name, quantity, session_id'),
    supabase.from('session_extras').select('extra_name, quantity, session_id'),
  ])

  const allSessions = sessions ?? []
  const allDrinks   = drinks   ?? []
  const allExtras   = extras   ?? []

  const drinkCounts: Record<string, number> = {}
  for (const d of allDrinks) drinkCounts[d.drink_name] = (drinkCounts[d.drink_name] ?? 0) + d.quantity
  const top_drinks = Object.entries(drinkCounts)
    .map(([drink_name, total]) => ({ drink_name, total }))
    .sort((a, b) => b.total - a.total)

  const extraCounts: Record<string, number> = {}
  for (const e of allExtras) extraCounts[e.extra_name] = (extraCounts[e.extra_name] ?? 0) + e.quantity
  const top_extras = Object.entries(extraCounts)
    .map(([extra_name, total]) => ({ extra_name, total }))
    .sort((a, b) => b.total - a.total)

  const finished = allSessions.filter(s => s.status === 'finished')
  const durations = finished
    .filter(s => !s.is_day_pass && s.duration_minutes != null)
    .map(s => s.duration_minutes as number)
  const avg_duration_minutes = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  const hourCounts: Record<number, number> = {}
  for (const s of allSessions) {
    const h = new Date(s.arrival_time).getHours()
    hourCounts[h] = (hourCounts[h] ?? 0) + 1
  }
  const sessions_by_hour = Object.entries(hourCounts)
    .map(([h, count]) => ({ hour: Number(h), count }))
    .sort((a, b) => a.hour - b.hour)

  const zoneCounts: Record<string, number> = {}
  for (const s of allSessions) {
    const z = s.zone_name ?? 'Non définie'
    zoneCounts[z] = (zoneCounts[z] ?? 0) + 1
  }
  const sessions_by_zone = Object.entries(zoneCounts)
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count)

  return {
    top_drinks,
    top_extras,
    total_sessions:    allSessions.length,
    active_sessions:   allSessions.filter(s => s.status === 'active').length,
    finished_sessions: finished.length,
    day_pass_count:    allSessions.filter(s => s.is_day_pass).length,
    avg_duration_minutes,
    total_drinks:      allDrinks.reduce((a, d) => a + d.quantity, 0),
    total_extras:      allExtras.reduce((a, e) => a + e.quantity, 0),
    sessions_by_hour,
    sessions_by_zone,
  }
}
