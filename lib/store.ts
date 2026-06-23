import { Sheet, RoleSlot, BuildSlot } from './types'

const KEY = 'albion_sheets'
const SCHEMA_VER = 2  // RoleSlot.buildSlots 구조 도입

function migrate(raw: unknown[]): Sheet[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map((sheet: any) => ({
    ...sheet,
    parties: (sheet.parties || []).map((party: any) => ({
      ...party,
      slots: (party.slots || []).map((slot: any): RoleSlot => {
        // 구버전: { name, color, maxCount, players: Player[], build }
        // 신버전: { role, buildSlots: BuildSlot[] }
        if (slot.buildSlots) return slot  // 이미 신버전
        // 구버전 마이그레이션: players 배열 → 각각 buildSlot으로 변환
        const buildSlots: BuildSlot[] = (slot.players || []).map((p: any) => ({
          id: uid(), build: slot.build || {}, player: p,
        }))
        // 빈 슬롯도 maxCount만큼 채우기 (선택 사항)
        return {
          id: slot.id || uid(),
          role: 'dealer',  // 기본값 (구버전에선 역할 타입이 없었음)
          buildSlots,
        }
      }),
    })),
  }))
}

function load(): Sheet[] {
  if (typeof window === 'undefined') return []
  try {
    const ver = localStorage.getItem(KEY + '_ver')
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (ver !== String(SCHEMA_VER)) {
      const migrated = migrate(raw)
      save(migrated)
      localStorage.setItem(KEY + '_ver', String(SCHEMA_VER))
      return migrated
    }
    return raw
  } catch { return [] }
}
function save(sheets: Sheet[]) { localStorage.setItem(KEY, JSON.stringify(sheets)) }

export function getSheets(): Sheet[] { return load() }
export function getSheet(id: string) { return load().find(s => s.id === id) }
export function saveSheet(sheet: Sheet) {
  const sheets = load()
  const idx = sheets.findIndex(s => s.id === sheet.id)
  if (idx >= 0) sheets[idx] = sheet; else sheets.push(sheet)
  save(sheets)
  localStorage.setItem(KEY + '_ver', String(SCHEMA_VER))
}
export function deleteSheet(id: string) { save(load().filter(s => s.id !== id)) }
export function createSheet(name: string, description: string, isPublic: boolean): Sheet {
  const sheet: Sheet = {
    id: uid(), name, description, isPublic, parties: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
  saveSheet(sheet); return sheet
}
export function uid() { return crypto.randomUUID() }
