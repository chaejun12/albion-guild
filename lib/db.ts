import { createClient } from '@supabase/supabase-js'
import { Sheet } from './types'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anon

// 읽기용 (RLS 적용)
export const db = url ? createClient(url, anon) : null
// 쓰기용 (RLS 우회 - 서버 API 라우트에서만 사용)
export const dbAdmin = url ? createClient(url, svc) : null

export const DB_READY = !!url && !!anon

// ── Row 형식 → Sheet 형식 변환
function rowToSheet(row: Record<string, unknown>): Sheet {
  const parties = (row.parties ?? []) as Sheet['parties']
  return {
    id:          row.id as string,
    name:        row.name as string,
    description: row.description as string | undefined,
    isPublic:    row.is_public as boolean,
    parties,
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  }
}

export async function dbGetSheets(): Promise<Sheet[]> {
  if (!db) return []
  const { data, error } = await db
    .from('sheets')
    .select('id, name, description, is_public, parties, created_at, updated_at')
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []).map(rowToSheet)
}

export async function dbGetPublicSheets(): Promise<Sheet[]> {
  if (!db) return []
  const { data, error } = await db
    .from('sheets')
    .select('id, name, description, is_public, parties, created_at, updated_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []).map(rowToSheet)
}

export async function dbSetSheetPublic(id: string, isPublic: boolean): Promise<void> {
  if (!dbAdmin) throw new Error('DB not configured')
  const { error } = await dbAdmin
    .from('sheets')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function dbGetSheet(id: string): Promise<Sheet | null> {
  if (!db) return null
  const { data, error } = await db
    .from('sheets')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return rowToSheet(data)
}

export async function dbCreateSheet(
  sheet: Omit<Sheet, 'id' | 'createdAt' | 'updatedAt'>,
  ownerId: string,
): Promise<Sheet> {
  if (!dbAdmin) throw new Error('DB not configured')
  const { data, error } = await dbAdmin
    .from('sheets')
    .insert({
      name: sheet.name,
      description: sheet.description ?? '',
      is_public: sheet.isPublic,
      parties: sheet.parties,
      owner_id: ownerId,
    })
    .select()
    .single()
  if (error) throw error
  return rowToSheet(data)
}

export async function dbUpdateSheet(id: string, sheet: Sheet): Promise<void> {
  if (!dbAdmin) throw new Error('DB not configured')
  const { error } = await dbAdmin
    .from('sheets')
    .update({
      name: sheet.name,
      description: sheet.description ?? '',
      is_public: sheet.isPublic,
      parties: sheet.parties,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function dbDeleteSheet(id: string): Promise<void> {
  if (!dbAdmin) throw new Error('DB not configured')
  const { error } = await dbAdmin.from('sheets').delete().eq('id', id)
  if (error) throw error
}
