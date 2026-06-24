'use client'
import { useState, useEffect, use, useCallback } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { Sheet, Party, RoleSlot, BuildSlot, Build, Player, RoleType, ROLE_PRESETS } from '@/lib/types'
import { getSheet, saveSheet, uid } from '@/lib/store'
import { DB_READY } from '@/lib/db'
import { usePermissions } from '@/lib/usePermissions'
import { getIconUrl, isTwoHanded } from '@/lib/icons'
import { WEAPONS, ARMOR_CHEST, ARMOR_HEAD, ARMOR_SHOES, CAPES, FOOD, POTIONS } from '@/src/data/items'

type BuildKey = 'weapon' | 'head' | 'chest' | 'shoes' | 'cape' | 'offhand' | 'food' | 'potion'

const BUILD_SLOT_ORDER: { key: BuildKey; label: string }[] = [
  { key: 'weapon', label: '무기' },
  { key: 'head',   label: '머리' },
  { key: 'chest',  label: '갑옷' },
  { key: 'shoes',  label: '신발' },
  { key: 'cape',   label: '망토' },
  { key: 'offhand',label: '보조' },
  { key: 'food',   label: '음식' },
  { key: 'potion', label: '포션' },
]

const WEAPON_CATS = [
  { key: 'fire',         label: '화염 지팡이' },
  { key: 'holy',         label: '성스러운 지팡이' },
  { key: 'arcane',       label: '비전 지팡이' },
  { key: 'frost',        label: '서리 지팡이' },
  { key: 'cursed',       label: '저주 지팡이' },
  { key: 'nature',       label: '자연 지팡이' },
  { key: 'shapeshifter', label: '변형자' },
  { key: 'sword',        label: '검' },
  { key: 'axe',          label: '도끼' },
  { key: 'mace',         label: '메이스' },
  { key: 'hammer',       label: '망치' },
  { key: 'crossbow',     label: '석궁' },
  { key: 'bow',          label: '활' },
  { key: 'spear',        label: '창' },
  { key: 'dagger',       label: '단검' },
  { key: 'quarterstaff', label: '쿼터스태프' },
  { key: 'gloves',       label: '전투 글러브' },
]

const ARMOR_CATS = [
  { key: 'cloth',   label: '천' },
  { key: 'leather', label: '가죽' },
  { key: 'plate',   label: '판금' },
]

const OFFHAND_CATS = [
  { key: 'shield', label: '방패' },
  { key: 'torch',  label: '횃불' },
  { key: 'tome',   label: '마법서' },
]

function getCatsFor(key: BuildKey) {
  if (key === 'weapon') return WEAPON_CATS
  if (key === 'offhand') return OFFHAND_CATS
  if (key === 'head' || key === 'chest' || key === 'shoes') return ARMOR_CATS
  return null
}

const FREE_ITEM = { id: 'FREE', name: 'Free' }

function getItems(key: BuildKey, cat: string): { id: string; name: string }[] {
  const W = WEAPONS as Record<string, { id: string; name: string }[]>
  const AH = ARMOR_HEAD as Record<string, { id: string; name: string }[]>
  const AC = ARMOR_CHEST as Record<string, { id: string; name: string }[]>
  const AS = ARMOR_SHOES as Record<string, { id: string; name: string }[]>
  let items: { id: string; name: string }[] = []
  if (key === 'weapon')  items = W[cat] || []
  else if (key === 'head')    items = AH[cat] || []
  else if (key === 'chest')   items = AC[cat] || []
  else if (key === 'shoes')   items = AS[cat] || []
  else if (key === 'offhand') items = W[cat] || []
  else if (key === 'cape')    items = CAPES as { id: string; name: string }[]
  else if (key === 'food')    items = FOOD as { id: string; name: string }[]
  else if (key === 'potion')  items = POTIONS as { id: string; name: string }[]
  return [FREE_ITEM, ...items]
}

function getItemName(itemId: string): string {
  if (itemId === 'FREE') return 'Free'
  const all: { id: string; name: string }[] = [
    ...Object.values(WEAPONS as Record<string, { id: string; name: string }[]>).flat(),
    ...Object.values(ARMOR_HEAD as Record<string, { id: string; name: string }[]>).flat(),
    ...Object.values(ARMOR_CHEST as Record<string, { id: string; name: string }[]>).flat(),
    ...Object.values(ARMOR_SHOES as Record<string, { id: string; name: string }[]>).flat(),
    ...(CAPES as { id: string; name: string }[]),
    ...(FOOD as { id: string; name: string }[]),
    ...(POTIONS as { id: string; name: string }[]),
  ]
  return all.find(i => i.id === itemId)?.name || itemId
}

// ── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function SheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [roleManageOpen, setRoleManageOpen] = useState(false)

  const [addPartyOpen, setAddPartyOpen] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [addRoleOpen, setAddRoleOpen] = useState<string | null>(null)
  const [buildEditing, setBuildEditing] = useState<{ partyId: string; slotId: string; buildSlotId: string } | null>(null)
  const [playerModal, setPlayerModal] = useState<{ partyId: string; slotId: string; buildSlotId: string } | null>(null)
  const [playerInput, setPlayerInput] = useState({ nickname: '', ip: '' })
  const [dragBs, setDragBs] = useState<{ partyId: string; slotId: string; bsId: string } | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)

  const { data: session } = useSession()
  const perms = usePermissions()

  const loadSheet = useCallback(async () => {
    if (DB_READY) {
      const res = await fetch(`/api/sheets/${id}`)
      if (res.status === 404) { setNotFound(true); return }
      if (res.ok) { const data = await res.json(); if (!data.fallback) { setSheet(data); return } }
    }
    const s = getSheet(id)
    if (s) setSheet(s)
    else setNotFound(true)
  }, [id])

  useEffect(() => { loadSheet() }, [loadSheet])

  async function persist(updated: Sheet, applyOnly = false) {
    setSheet({ ...updated })
    if (DB_READY) {
      await fetch(`/api/sheets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, _applyOnly: applyOnly }),
      })
    } else {
      saveSheet(updated)
    }
  }

  // ── 신청 종료/재개
  async function handleToggleApplicationClosed() {
    if (!sheet) return
    const next = !sheet.applicationClosed
    setSheet(s => s ? { ...s, applicationClosed: next } : s)
    if (DB_READY) {
      const res = await fetch(`/api/sheets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationClosed: next }),
      })
      if (!res.ok) {
        setSheet(s => s ? { ...s, applicationClosed: !next } : s)
        alert((await res.json()).error)
      }
    }
  }

  // ── 파티
  function addParty() {
    if (!sheet || !partyName.trim()) return
    const p: Party = { id: uid(), name: partyName.trim(), slots: [] }
    persist({ ...sheet, parties: [...sheet.parties, p] })
    setPartyName(''); setAddPartyOpen(false)
  }
  function deleteParty(partyId: string) {
    if (!sheet || !confirm('파티를 삭제하시겠습니까?')) return
    persist({ ...sheet, parties: sheet.parties.filter(p => p.id !== partyId) })
  }

  // ── 역할 슬롯
  function addRole(partyId: string, role: RoleType) {
    if (!sheet) return
    const slot: RoleSlot = { id: uid(), role, buildSlots: [] }
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? { ...p, slots: [...p.slots, slot] } : p) })
    setAddRoleOpen(null)
  }
  function deleteRole(partyId: string, slotId: string) {
    if (!sheet) return
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? { ...p, slots: p.slots.filter(s => s.id !== slotId) } : p) })
  }

  // ── 빌드 슬롯
  function addBuildSlot(partyId: string, slotId: string) {
    if (!sheet) return
    const bs: BuildSlot = { id: uid(), build: {} }
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? { ...s, buildSlots: [...s.buildSlots, bs] } : s)
    } : p) })
  }
  function copyBuildSlot(partyId: string, slotId: string, bsId: string) {
    if (!sheet) return
    const src = sheet.parties.find(p => p.id === partyId)?.slots.find(s => s.id === slotId)?.buildSlots.find(b => b.id === bsId)
    if (!src) return
    const copy: BuildSlot = { id: uid(), build: { ...src.build } }
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => {
        if (s.id !== slotId) return s
        const idx = s.buildSlots.findIndex(b => b.id === bsId)
        const next = [...s.buildSlots]
        next.splice(idx + 1, 0, copy)
        return { ...s, buildSlots: next }
      })
    } : p) })
  }
  function deleteBuildSlot(partyId: string, slotId: string, bsId: string) {
    if (!sheet) return
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? { ...s, buildSlots: s.buildSlots.filter(b => b.id !== bsId) } : s)
    } : p) })
  }
  function updateBuild(partyId: string, slotId: string, bsId: string, build: Build) {
    if (!sheet) return
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? {
        ...s, buildSlots: s.buildSlots.map(b => b.id === bsId ? { ...b, build } : b)
      } : s)
    } : p) })
    setBuildEditing(null)
  }

  // ── 신청
  function applyToSlot(partyId: string, slotId: string, bsId: string) {
    if (!sheet || !playerInput.nickname.trim()) return
    const applicant: Player = {
      id: uid(),
      nickname: playerInput.nickname.trim(),
      discordId: session?.user?.id,
      currentIP: playerInput.ip ? parseInt(playerInput.ip) : undefined,
    }
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? {
        ...s, buildSlots: s.buildSlots.map(b => b.id === bsId
          ? { ...b, applicants: [...(b.applicants || []), applicant] }
          : b)
      } : s)
    } : p) }, true)
    setPlayerInput({ nickname: '', ip: '' }); setPlayerModal(null)
  }

  function cancelApplication(partyId: string, slotId: string, bsId: string) {
    if (!sheet || !session?.user?.id) return
    const userId = session.user.id
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? {
        ...s, buildSlots: s.buildSlots.map(b => b.id === bsId
          ? { ...b, applicants: (b.applicants || []).filter(a => a.discordId !== userId) }
          : b)
      } : s)
    } : p) }, true)
  }

  function confirmApplicant(partyId: string, slotId: string, bsId: string, applicant: Player) {
    if (!sheet) return
    const applicantKey = applicant.discordId ?? applicant.id
    // 이 인원이 신청한 다른 슬롯 목록 수집
    const removed: { bsId: string; player: Player }[] = []
    sheet.parties.forEach(p => p.slots.forEach(s => s.buildSlots.forEach(b => {
      if (b.id === bsId) return
      const found = (b.applicants || []).find(a => (a.discordId ?? a.id) === applicantKey)
      if (found) removed.push({ bsId: b.id, player: found })
    })))
    persist({ ...sheet, parties: sheet.parties.map(p => ({
      ...p, slots: p.slots.map(s => ({
        ...s, buildSlots: s.buildSlots.map(b => {
          if (b.id === bsId) return { ...b, player: applicant, removedApplications: removed }
          if (removed.some(r => r.bsId === b.id))
            return { ...b, applicants: (b.applicants || []).filter(a => (a.discordId ?? a.id) !== applicantKey) }
          return b
        })
      }))
    })) })
  }

  function removeConfirmed(partyId: string, slotId: string, bsId: string) {
    if (!sheet) return
    const slot = sheet.parties.flatMap(p => p.slots.flatMap(s => s.buildSlots)).find(b => b.id === bsId)
    const removed = slot?.removedApplications ?? []
    persist({ ...sheet, parties: sheet.parties.map(p => ({
      ...p, slots: p.slots.map(s => ({
        ...s, buildSlots: s.buildSlots.map(b => {
          if (b.id === bsId) return { ...b, player: undefined, removedApplications: undefined }
          const restore = removed.find(r => r.bsId === b.id)
          if (restore) return { ...b, applicants: [...(b.applicants || []), restore.player] }
          return b
        })
      }))
    })) })
  }

  // ── 빌드 슬롯 이동
  function moveBuildSlot(toPartyId: string, toSlotId: string) {
    if (!sheet || !dragBs) return
    const { partyId: fromPartyId, slotId: fromSlotId, bsId: fromBsId } = dragBs
    if (fromPartyId === toPartyId && fromSlotId === toSlotId) return
    let bsToMove: BuildSlot | undefined
    sheet.parties.forEach(p => p.slots.forEach(s => s.buildSlots.forEach(b => {
      if (b.id === fromBsId) bsToMove = b
    })))
    if (!bsToMove) return
    const moved = bsToMove
    persist({
      ...sheet,
      parties: sheet.parties.map(p => ({
        ...p,
        slots: p.slots.map(s => {
          if (p.id === fromPartyId && s.id === fromSlotId)
            return { ...s, buildSlots: s.buildSlots.filter(b => b.id !== fromBsId) }
          if (p.id === toPartyId && s.id === toSlotId)
            return { ...s, buildSlots: [...s.buildSlots, moved] }
          return s
        })
      }))
    })
    setDragBs(null)
    setDragOverSlot(null)
  }

  // ── 통계
  const allBuildSlots = sheet?.parties.flatMap(p => p.slots.flatMap(s => s.buildSlots || [])).filter(Boolean) ?? []
  const confirmedCount = allBuildSlots.filter(b => b?.player).length
  const totalSlots = allBuildSlots.length
  const roleCounts: Record<string, { filled: number; total: number }> = {}
  sheet?.parties.flatMap(p => p.slots).forEach(s => {
    const preset = ROLE_PRESETS[s.role]
    if (!preset) return
    const label = preset.label
    if (!roleCounts[label]) roleCounts[label] = { filled: 0, total: 0 }
    const bs = s.buildSlots || []
    roleCounts[label].filled += bs.filter(b => b?.player).length
    roleCounts[label].total += bs.length
  })

  if (!sheet) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: '#0F1419' }}>
      <p className="text-gray-400">{notFound ? '시트를 찾을 수 없습니다.' : '불러오는 중...'}</p>
      {notFound && <Link href="/sheets" className="text-sm px-4 py-2 rounded" style={{ background: '#253045', color: '#C8A84B' }}>← 목록으로</Link>}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1419' }}>
      {/* 헤더 */}
      <header className="border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-30" style={{ borderColor: '#2A3448', background: '#141C28' }}>
        <Link href="/sheets" className="text-gray-400 hover:text-gray-200 text-sm">← 목록</Link>
        <h1 className="font-bold text-gray-100 flex-1 truncate">{sheet.name}</h1>
        {sheet.applicationClosed && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#7F1D1D', color: '#FCA5A5' }}>신청 마감</span>
        )}
        <span className="text-sm text-gray-400">{confirmedCount}/{totalSlots}</span>
        {perms.canEditSheet && (
          <button onClick={handleToggleApplicationClosed}
            className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
            style={sheet.applicationClosed
              ? { background: '#14532D', color: '#86EFAC' }
              : { background: '#7F1D1D', color: '#FCA5A5' }}>
            {sheet.applicationClosed ? '신청 재개' : '신청 종료'}
          </button>
        )}
        {perms.canEditSheet && (
          <button onClick={() => setRoleManageOpen(true)}
            className="px-3 py-1.5 rounded text-sm font-medium"
            style={{ background: '#C8A84B', color: '#0F1419' }}>
            역할 수정
          </button>
        )}
        {perms.canEditSheet && (
          <button onClick={() => setAddPartyOpen(true)} className="px-3 py-1.5 rounded text-sm text-gray-300" style={{ background: '#253045' }}>+ 파티</button>
        )}
        {!session && (
          <button onClick={() => signIn('discord')} className="px-3 py-1.5 rounded text-sm font-medium" style={{ background: '#5865F2', color: '#fff' }}>Discord 로그인</button>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 메인 */}
        <main className="flex-1 overflow-y-auto p-4 space-y-5">
          {sheet.parties.map(party => (
            <div key={party.id} className="rounded-lg border" style={{ borderColor: '#2A3448', background: '#1A2030' }}>
              <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: '#2A3448' }}>
                <h2 className="font-bold text-gray-100 flex-1">{party.name}</h2>
                {perms.canEditSheet && <>
                  <button onClick={() => setAddRoleOpen(party.id)} className="text-xs px-2 py-1 rounded text-gray-400 hover:text-white" style={{ background: '#253045' }}>+ 역할</button>
                  <button onClick={() => deleteParty(party.id)} className="text-xs text-red-600 hover:text-red-400">삭제</button>
                </>}
              </div>

              <div className="p-3 space-y-3">
                {party.slots.map(roleSlot => {
                  const preset = ROLE_PRESETS[roleSlot.role] ?? { label: roleSlot.role || '역할', color: '#666' }
                  return (
                    <div key={roleSlot.id} className="rounded overflow-hidden" style={{ background: '#111827' }}>
                      <div className="flex items-center gap-2 px-3 py-2" style={{ borderLeft: `4px solid ${preset.color}`, background: '#192033' }}>
                        <span className="text-sm font-bold" style={{ color: preset.color }}>{preset.label}</span>
                        <span className="text-xs text-gray-500">{(roleSlot.buildSlots||[]).filter(b => b?.player).length}/{(roleSlot.buildSlots||[]).length}</span>
                        <div className="flex-1" />
                        {perms.canEditSheet && <>
                          <button onClick={() => addBuildSlot(party.id, roleSlot.id)} className="text-xs px-2 py-0.5 rounded" style={{ background: '#253045', color: '#C8A84B' }}>+ 빌드</button>
                          <button onClick={() => deleteRole(party.id, roleSlot.id)} className="text-xs text-red-700 hover:text-red-500 ml-1">역할 삭제</button>
                        </>}
                      </div>

                      <div className="divide-y transition-colors"
                        style={{
                          borderColor: '#1F2937',
                          background: dragOverSlot === roleSlot.id ? '#1A2A1A' : undefined,
                          outline: dragOverSlot === roleSlot.id ? `2px solid ${preset.color}88` : 'none',
                        }}
                        onDragOver={perms.canEditSheet ? e => { e.preventDefault(); setDragOverSlot(roleSlot.id) } : undefined}
                        onDragLeave={perms.canEditSheet ? e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverSlot(null) } : undefined}
                        onDrop={perms.canEditSheet ? e => { e.preventDefault(); moveBuildSlot(party.id, roleSlot.id) } : undefined}
                      >
                        {(roleSlot.buildSlots || []).map((bs, idx) => (
                          <BuildRow
                            key={bs.id}
                            bs={bs}
                            idx={idx}
                            canEdit={perms.canEditSheet}
                            canApply={perms.canApply}
                            myDiscordId={session?.user?.id}
                            applicationClosed={sheet.applicationClosed}
                            isDragging={dragBs?.bsId === bs.id}
                            onDragStart={() => setDragBs({ partyId: party.id, slotId: roleSlot.id, bsId: bs.id })}
                            onDragEnd={() => { setDragBs(null); setDragOverSlot(null) }}
                            onEditBuild={() => setBuildEditing({ partyId: party.id, slotId: roleSlot.id, buildSlotId: bs.id })}
                            onCopy={() => copyBuildSlot(party.id, roleSlot.id, bs.id)}
                            onDelete={() => deleteBuildSlot(party.id, roleSlot.id, bs.id)}
                            onSignup={() => { setPlayerInput({ nickname: session?.user?.guildNickname ?? session?.user?.name ?? '', ip: '' }); setPlayerModal({ partyId: party.id, slotId: roleSlot.id, buildSlotId: bs.id }) }}
                            onCancelApply={() => cancelApplication(party.id, roleSlot.id, bs.id)}
                            onRemoveConfirmed={() => removeConfirmed(party.id, roleSlot.id, bs.id)}
                          />
                        ))}
                        {(roleSlot.buildSlots||[]).length === 0 && (
                          <p className="text-center text-xs py-3" style={{ color: dragOverSlot === roleSlot.id ? preset.color : '#4B5563' }}>
                            {dragOverSlot === roleSlot.id ? '여기에 놓기' : '+ 빌드 버튼으로 빌드를 추가하세요'}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {party.slots.length === 0 && (
                  <p className="text-center text-sm text-gray-600 py-4">역할을 추가하세요</p>
                )}
              </div>
            </div>
          ))}
          {sheet.parties.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-4xl mb-3">⚔️</p>
              <p>파티를 추가하세요</p>
            </div>
          )}
        </main>

        {/* 우측 통계 */}
        <aside className="w-52 border-l p-4 space-y-5 overflow-y-auto" style={{ borderColor: '#2A3448', background: '#141C28' }}>
          <div>
            <p className="text-xs text-gray-500 mb-1">확정 인원</p>
            <p className="text-2xl font-bold" style={{ color: '#C8A84B' }}>{confirmedCount}<span className="text-base text-gray-500">/{totalSlots}</span></p>
          </div>
          {Object.keys(roleCounts).length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">역할별</p>
              <div className="space-y-1 text-sm">
                {Object.entries(roleCounts).map(([name, { filled, total }]) => (
                  <div key={name} className="flex justify-between">
                    <span className="text-gray-300">{name}</span>
                    <span className="text-gray-400">{filled}/{total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* 모달: 파티 추가 */}
      {addPartyOpen && (
        <ModalShell title="파티 추가" onClose={() => setAddPartyOpen(false)}>
          <input value={partyName} onChange={e => setPartyName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addParty()}
            placeholder="메인클랩 / 백라인 / 탱커팀" autoFocus
            className="w-full px-3 py-2 rounded border text-gray-100 text-sm outline-none"
            style={{ background: '#253045', borderColor: '#2A3448' }} />
          <div className="flex gap-3 mt-4">
            <Btn primary onClick={addParty}>추가</Btn>
            <Btn onClick={() => setAddPartyOpen(false)}>취소</Btn>
          </div>
        </ModalShell>
      )}

      {/* 모달: 역할 추가 */}
      {addRoleOpen && (
        <ModalShell title="역할 선택" onClose={() => setAddRoleOpen(null)}>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(ROLE_PRESETS) as [RoleType, { label: string; color: string }][]).map(([role, { label, color }]) => (
              <button key={role} onClick={() => addRole(addRoleOpen, role)}
                className="py-3 rounded-lg font-bold text-sm transition-all hover:scale-105"
                style={{ background: `${color}22`, border: `2px solid ${color}`, color }}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Btn onClick={() => setAddRoleOpen(null)}>취소</Btn>
          </div>
        </ModalShell>
      )}

      {/* 모달: 빌드 설정 */}
      {buildEditing && (() => {
        const bs = sheet.parties.find(p => p.id === buildEditing.partyId)
          ?.slots.find(s => s.id === buildEditing.slotId)
          ?.buildSlots.find(b => b.id === buildEditing.buildSlotId)
        if (!bs) return null
        return (
          <BuildEditorModal
            initial={bs.build}
            onSave={(build) => updateBuild(buildEditing.partyId, buildEditing.slotId, buildEditing.buildSlotId, build)}
            onClose={() => setBuildEditing(null)}
          />
        )
      })()}

      {/* 모달: 슬롯 신청 */}
      {playerModal && (
        <ModalShell title="슬롯 신청" onClose={() => setPlayerModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">닉네임</label>
              <input value={playerInput.nickname} onChange={e => setPlayerInput(f => ({ ...f, nickname: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && playerModal && applyToSlot(playerModal.partyId, playerModal.slotId, playerModal.buildSlotId)}
                placeholder="인게임 닉네임" autoFocus
                className="w-full px-3 py-2 rounded border text-gray-100 text-sm outline-none"
                style={{ background: '#253045', borderColor: '#2A3448' }} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">현재 작수 (IP)</label>
              <input type="number" value={playerInput.ip} onChange={e => setPlayerInput(f => ({ ...f, ip: e.target.value }))}
                placeholder="예: 1800"
                className="w-full px-3 py-2 rounded border text-gray-100 text-sm outline-none"
                style={{ background: '#253045', borderColor: '#2A3448' }} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Btn primary onClick={() => playerModal && applyToSlot(playerModal.partyId, playerModal.slotId, playerModal.buildSlotId)}>신청</Btn>
            <Btn onClick={() => setPlayerModal(null)}>취소</Btn>
          </div>
        </ModalShell>
      )}

      {/* 모달: 역할 수정 */}
      {roleManageOpen && (
        <RoleManageModal
          sheet={sheet}
          onConfirm={confirmApplicant}
          onUnconfirm={removeConfirmed}
          onClose={() => setRoleManageOpen(false)}
        />
      )}
    </div>
  )
}

// ── BuildRow ──────────────────────────────────────────────────────────────────

function BuildRow({ bs, idx, canEdit, canApply, myDiscordId, applicationClosed, isDragging, onDragStart, onDragEnd, onEditBuild, onCopy, onDelete, onSignup, onCancelApply, onRemoveConfirmed }: {
  bs: BuildSlot
  idx: number
  canEdit: boolean
  canApply: boolean
  myDiscordId?: string
  applicationClosed?: boolean
  isDragging?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onEditBuild: () => void
  onCopy: () => void
  onDelete: () => void
  onSignup: () => void
  onCancelApply: () => void
  onRemoveConfirmed: () => void
}) {
  const hasBuild = Object.values(bs.build).some(Boolean)
  const applicants = bs.applicants || []
  const isApplied = !!myDiscordId && applicants.some(a => a.discordId === myDiscordId)

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 transition-opacity"
      style={{ background: '#111827', opacity: isDragging ? 0.35 : 1, cursor: canEdit ? 'grab' : 'default' }}
      draggable={canEdit}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <span className="text-xs text-gray-600 w-4 flex-shrink-0">{idx + 1}</span>

      {/* 빌드 아이콘 */}
      <div className="flex gap-1 flex-shrink-0">
        {BUILD_SLOT_ORDER.map(({ key, label }) => {
          const weaponIs2H = isTwoHanded(bs.build.weapon)
          const is2HSlot = key === 'offhand' && weaponIs2H
          const itemId = is2HSlot ? bs.build.weapon : bs.build[key]
          return (
            <div key={key} title={is2HSlot ? '양손 무기' : (itemId ? `${label}: ${getItemName(itemId)}` : label)}
              style={{ opacity: is2HSlot ? 0.4 : 1 }}>
              {itemId === 'FREE'
                ? <div className="w-9 h-9 rounded border flex items-center justify-center text-[7px] font-bold" style={{ borderColor: '#2A3448', background: '#1a3a1a', color: '#4ade80' }}>FREE</div>
                : itemId
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={getIconUrl(itemId)} alt={label} width={36} height={36} className="rounded border" style={{ borderColor: '#2A3448' }} loading="eager" />
                  : <div className="w-9 h-9 rounded border border-dashed flex items-center justify-center text-[9px] text-gray-700" style={{ borderColor: '#2A3448' }}>{label[0]}</div>
              }
            </div>
          )
        })}
      </div>

      {/* 플레이어 영역 */}
      <div className="flex-1 min-w-0">
        {bs.player ? (
          <div className="flex items-center gap-2">
            <span className="text-xs px-1.5 py-0.5 rounded text-green-300 font-bold" style={{ background: '#14532d44' }}>✓</span>
            <span className="text-sm font-medium text-gray-200 truncate">{bs.player.nickname}</span>
            {bs.player.currentIP && <span className="text-xs text-gray-500 flex-shrink-0">{bs.player.currentIP}</span>}
            {canEdit && (
              <button onClick={onRemoveConfirmed} className="text-gray-600 hover:text-red-400 text-sm flex-shrink-0 ml-auto">×</button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {applicants.length > 0 && (
              <span className="text-xs text-yellow-500 truncate">
                {applicants.map(a => a.nickname).join(', ')}
              </span>
            )}
            {isApplied ? (
              <button onClick={onCancelApply} className="text-xs text-red-400 hover:text-red-300 transition-colors">신청 취소</button>
            ) : applicationClosed ? (
              applicants.length === 0 && <span className="text-xs text-gray-700">— 비어있음</span>
            ) : (
              canApply
                ? <button onClick={onSignup} className="text-xs font-bold px-3 py-1 rounded-full transition-all hover:brightness-110 active:scale-95 flex-shrink-0" style={{ background: '#C8A84B', color: '#0F1419' }}>+ 신청</button>
                : applicants.length === 0 && <span className="text-xs text-gray-700">— 비어있음</span>
            )}
          </div>
        )}
      </div>

      {/* 관리자 액션 */}
      {canEdit && (
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={onEditBuild} className="text-[11px] px-2 py-0.5 rounded text-gray-400 hover:text-gray-200 transition-colors"
            style={{ background: hasBuild ? '#253045' : '#1F2937', border: hasBuild ? '1px solid #C8A84B44' : '1px solid #2A3448' }}>
            {hasBuild ? '빌드 수정' : '빌드 설정'}
          </button>
          <button onClick={onCopy} className="text-[11px] px-2 py-0.5 rounded text-gray-500 hover:text-gray-200" style={{ background: '#1F2937' }}>복사</button>
          <button onClick={onDelete} className="text-[11px] text-red-700 hover:text-red-500">×</button>
        </div>
      )}
    </div>
  )
}

// ── 역할 수정 모달 ────────────────────────────────────────────────────────────

type BsEntry = {
  partyId: string
  partyName: string
  slotId: string
  role: RoleType
  bs: BuildSlot
  idx: number
}

function MiniIcons({ build }: { build: Build }) {
  return (
    <div className="flex gap-0.5 flex-shrink-0">
      {BUILD_SLOT_ORDER.map(({ key, label }) => {
        const weaponIs2H = isTwoHanded(build.weapon)
        const is2HSlot = key === 'offhand' && weaponIs2H
        const itemId = is2HSlot ? build.weapon : build[key]
        return (
          <div key={key} title={label} style={{ opacity: is2HSlot ? 0.3 : 1 }}>
            {itemId === 'FREE'
              ? <div className="w-7 h-7 rounded flex items-center justify-center text-[8px] font-bold" style={{ background: '#1a3a1a', color: '#4ade80' }}>FREE</div>
              : itemId
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={getIconUrl(itemId)} alt={label} width={28} height={28} className="rounded" loading="eager" />
                : <div className="w-7 h-7 rounded" style={{ background: '#1F2937' }} />
            }
          </div>
        )
      })}
    </div>
  )
}

function RoleManageModal({ sheet, onConfirm, onUnconfirm, onClose }: {
  sheet: Sheet
  onConfirm: (partyId: string, slotId: string, bsId: string, applicant: Player) => void
  onUnconfirm: (partyId: string, slotId: string, bsId: string) => void
  onClose: () => void
}) {
  const [slotPick, setSlotPick] = useState<Record<string, string>>({})
  const [confirmedPartyFilter, setConfirmedPartyFilter] = useState<string>('all')
  const [appliedPartyFilter, setAppliedPartyFilter] = useState<string>('all')

  const entries: BsEntry[] = sheet.parties.flatMap(p =>
    p.slots.flatMap(s =>
      (s.buildSlots || []).map((bs, idx) => ({
        partyId: p.id, partyName: p.name, slotId: s.id, role: s.role, bs, idx,
      }))
    )
  )

  const allApplications: { player: Player; entry: BsEntry }[] = entries.flatMap(e =>
    (e.bs.applicants ?? []).map(player => ({ player, entry: e }))
  )

  const confirmedIds = new Set(
    entries.flatMap(e => e.bs.player?.discordId ? [e.bs.player.discordId] : [])
  )

  const unconfirmedApps = allApplications.filter(a => !confirmedIds.has(a.player.discordId ?? ''))

  const unconfirmedMap = new Map<string, { player: Player; entries: BsEntry[] }>()
  for (const { player, entry } of unconfirmedApps) {
    const key = player.discordId ?? player.id
    if (!unconfirmedMap.has(key)) unconfirmedMap.set(key, { player, entries: [] })
    unconfirmedMap.get(key)!.entries.push(entry)
  }
  const unconfirmedPeople = [...unconfirmedMap.values()]

  const partiesWithEntries = sheet.parties
    .map(party => ({ party, entries: entries.filter(e => e.partyId === party.id) }))
    .filter(({ entries: pe }) => pe.length > 0)

  const confirmedEntries = entries.filter(e => e.bs.player)

  function handlePickAndConfirm(entry: BsEntry, discordId: string) {
    const person = unconfirmedPeople.find(p => (p.player.discordId ?? p.player.id) === discordId)
    if (!person) return
    onConfirm(entry.partyId, entry.slotId, entry.bs.id, person.player)
    setSlotPick(prev => { const n = { ...prev }; delete n[entry.bs.id]; return n })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="rounded-xl border w-full max-h-[90vh] flex flex-col mx-1" style={{ maxWidth: '1800px', background: '#1A2030', borderColor: '#2A3448' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: '#2A3448' }}>
          <h3 className="font-bold text-gray-100 text-lg">역할 수정</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">신청 {new Set(allApplications.map(({ player }) => player.discordId ?? player.id)).size}명 · 미확정 {unconfirmedPeople.length}명</span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">

          {/* ── 왼쪽: 전체 신청 인원 + 미확정 인원 ── */}
          <div className="flex-1 min-w-0 overflow-y-auto p-5 space-y-6 border-r" style={{ borderColor: '#2A3448' }}>
            {allApplications.length > 0 && (() => {
              const uniqueApplicants = [...new Map(
                allApplications.map(({ player }) => [player.discordId ?? player.id, player])
              ).values()]
              return (
                <section>
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-3">전체 신청 인원 ({uniqueApplicants.length}명)</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueApplicants.map(player => (
                      <span key={player.discordId ?? player.id} className="text-sm px-3 py-1 rounded-full" style={{ background: '#111827', color: '#D1D5DB' }}>
                        {player.nickname}
                      </span>
                    ))}
                  </div>
                </section>
              )
            })()}

            {unconfirmedPeople.length > 0 && (
              <section>
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-3">미확정 인원 ({unconfirmedPeople.length}명)</h4>
                <div className="space-y-2">
                  {unconfirmedPeople.map(({ player, entries: appliedEntries }) => (
                    <div key={player.discordId ?? player.id} className="px-3 py-2.5 rounded border" style={{ background: '#111827', borderColor: '#2A3448' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-200 font-medium">{player.nickname}</span>
                        {player.currentIP && <span className="text-xs text-gray-500">{player.currentIP}IP</span>}
                      </div>
                      <div className="space-y-1.5 ml-1">
                        {appliedEntries.map((e, i) => {
                          const preset = ROLE_PRESETS[e.role] ?? { label: e.role, color: '#666' }
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 flex-shrink-0">신청:</span>
                              <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ background: `${preset.color}22`, color: preset.color }}>{preset.label}</span>
                              <span className="text-xs text-gray-600 flex-shrink-0">{e.partyName}·슬롯{e.idx + 1}</span>
                              <MiniIcons build={e.bs.build} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {entries.length === 0 && (
              <p className="text-center text-gray-500 py-10">등록된 슬롯이 없습니다</p>
            )}
            {entries.length > 0 && allApplications.length === 0 && (
              <p className="text-center text-gray-500 py-10">아직 신청한 인원이 없습니다</p>
            )}
          </div>

          {/* ── 가운데: 신청된 역할 (파티별 탭) ── */}
          <div className="flex-1 min-w-0 flex flex-col p-5 gap-3 border-r" style={{ borderColor: '#2A3448' }}>
            <div className="flex-shrink-0">
              <h4 className="text-xs font-bold text-green-400 uppercase tracking-wide mb-3">신청된 역할</h4>
              {sheet.parties.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setAppliedPartyFilter('all')}
                    className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                    style={appliedPartyFilter === 'all'
                      ? { background: '#C8A84B', color: '#0F1419' }
                      : { background: '#253045', color: '#9CA3AF' }}>
                    전체 ({entries.length})
                  </button>
                  {partiesWithEntries.map(({ party, entries: pe }) => (
                    <button
                      key={party.id}
                      onClick={() => setAppliedPartyFilter(party.id)}
                      className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                      style={appliedPartyFilter === party.id
                        ? { background: '#C8A84B', color: '#0F1419' }
                        : { background: '#253045', color: '#9CA3AF' }}>
                      {party.name} ({pe.length})
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
              {partiesWithEntries.length === 0 && (
                <p className="text-center text-gray-500 py-10">등록된 슬롯이 없습니다</p>
              )}
              {partiesWithEntries
                .filter(({ party }) => appliedPartyFilter === 'all' || party.id === appliedPartyFilter)
                .map(({ party, entries: partyEntries }) => (
                  <div key={party.id} className="space-y-3">
                    {appliedPartyFilter === 'all' && (
                      <h3 className="text-base font-bold text-gray-100 pb-1.5 border-b" style={{ borderColor: '#3A4458' }}>{party.name}</h3>
                    )}
                    {partyEntries.map((entry) => {
                      const { partyId, slotId, role, bs, idx } = entry
                      const preset = ROLE_PRESETS[role] ?? { label: role, color: '#666' }
                      const applicants = bs.applicants || []
                      const selected = slotPick[bs.id] ?? ''
                      return (
                        <div key={bs.id} className="rounded-lg border p-3 space-y-2" style={{ background: '#111827', borderColor: bs.player ? '#166534' : '#2A3448' }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${preset.color}22`, color: preset.color }}>{preset.label}</span>
                            <span className="text-xs text-gray-500">슬롯 {idx + 1}</span>
                            <MiniIcons build={bs.build} />
                            {bs.player && <span className="ml-auto text-xs text-green-400 font-medium">✓ 확정됨</span>}
                          </div>
                          {!bs.player && applicants.length > 0 && (
                            <div className="space-y-1">
                              {applicants.map(applicant => (
                                <div key={applicant.id} className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ background: '#192033' }}>
                                  <span className="text-sm text-gray-300">{applicant.nickname}</span>
                                  {applicant.currentIP && <span className="text-xs text-gray-500">{applicant.currentIP} IP</span>}
                                  <button onClick={() => onConfirm(partyId, slotId, bs.id, applicant)}
                                    className="ml-auto text-xs px-3 py-0.5 rounded font-medium"
                                    style={{ background: '#C8A84B', color: '#0F1419' }}>
                                    확정
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {!bs.player && applicants.length === 0 && (
                            unconfirmedPeople.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <select value={selected} onChange={e => setSlotPick(prev => ({ ...prev, [bs.id]: e.target.value }))}
                                  className="flex-1 px-2 py-1.5 rounded text-sm text-gray-200 outline-none"
                                  style={{ background: '#192033', border: '1px solid #2A3448' }}>
                                  <option value="">미확정 인원 선택...</option>
                                  {unconfirmedPeople.map(({ player }) => (
                                    <option key={player.discordId ?? player.id} value={player.discordId ?? player.id}>
                                      {player.nickname}{player.currentIP ? ` (${player.currentIP}IP)` : ''}
                                    </option>
                                  ))}
                                </select>
                                {selected && (
                                  <button onClick={() => handlePickAndConfirm(entry, selected)}
                                    className="px-3 py-1.5 rounded text-sm font-medium flex-shrink-0"
                                    style={{ background: '#C8A84B', color: '#0F1419' }}>
                                    확정
                                  </button>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-600">신청자 없음</p>
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
            </div>
          </div>

          {/* ── 오른쪽: 확정된 역할 ── */}
          <div className="flex-1 min-w-0 flex flex-col p-5 gap-3">
            <div className="flex items-center justify-between flex-shrink-0">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">확정된 역할 ({confirmedEntries.length})</h4>
            </div>
            {/* 파티 탭 */}
            {sheet.parties.length > 1 && (
              <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setConfirmedPartyFilter('all')}
                  className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                  style={confirmedPartyFilter === 'all'
                    ? { background: '#C8A84B', color: '#0F1419' }
                    : { background: '#253045', color: '#9CA3AF' }}>
                  전체 ({confirmedEntries.length})
                </button>
                {sheet.parties.map(party => {
                  const count = confirmedEntries.filter(e => e.partyId === party.id).length
                  return (
                    <button
                      key={party.id}
                      onClick={() => setConfirmedPartyFilter(party.id)}
                      className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                      style={confirmedPartyFilter === party.id
                        ? { background: '#C8A84B', color: '#0F1419' }
                        : { background: '#253045', color: '#9CA3AF' }}>
                      {party.name} ({count})
                    </button>
                  )
                })}
              </div>
            )}
            {/* 확정 목록 */}
            <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
              {confirmedEntries
                .filter(e => confirmedPartyFilter === 'all' || e.partyId === confirmedPartyFilter)
                .map(({ partyId, slotId, role, bs }) => {
                  const preset = ROLE_PRESETS[role] ?? { label: role, color: '#666' }
                  return (
                    <div key={bs.id} className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: '#111827', border: `1px solid ${preset.color}44` }}>
                      <span className="text-xs font-bold flex-shrink-0 w-14 text-center px-1 py-0.5 rounded" style={{ background: `${preset.color}22`, color: preset.color }}>{preset.label}</span>
                      <span className="text-sm text-gray-200 font-medium flex-shrink-0 w-28 truncate">{bs.player!.nickname}</span>
                      <div className="flex-1 min-w-0">
                        <MiniIcons build={bs.build} />
                      </div>
                      <button onClick={() => onUnconfirm(partyId, slotId, bs.id)}
                        className="text-xs text-red-500 hover:text-red-400 px-2 py-0.5 rounded flex-shrink-0 transition-colors"
                        style={{ background: '#2A1A1A' }}>
                        확정 취소
                      </button>
                    </div>
                  )
                })}
              {confirmedEntries.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">아직 확정된 역할이 없습니다</p>
              )}
              {confirmedEntries.length > 0 && confirmedPartyFilter !== 'all' && confirmedEntries.filter(e => e.partyId === confirmedPartyFilter).length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">이 파티에 확정된 역할이 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 빌드 에디터 모달 ──────────────────────────────────────────────────────────

function BuildEditorModal({ initial, onSave, onClose }: { initial: Build; onSave: (b: Build) => void; onClose: () => void }) {
  const [build, setBuild] = useState<Build>({ ...initial })
  const [pickingKey, setPickingKey] = useState<BuildKey | null>(null)

  const is2H = isTwoHanded(build.weapon)

  function handleSetItem(key: BuildKey, itemId: string) {
    setBuild(b => {
      const next = { ...b, [key]: itemId }
      if (key === 'weapon' && isTwoHanded(itemId)) delete next.offhand
      return next
    })
    setPickingKey(null)
  }

  function handleClearItem(key: BuildKey) {
    setBuild(b => { const next = { ...b }; delete next[key]; return next })
    setPickingKey(null)
  }

  function handleClickSlot(key: BuildKey) {
    if (key === 'offhand' && is2H) return
    setPickingKey(key === pickingKey ? null : key)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="rounded-xl border p-5 w-full max-w-lg relative" style={{ background: '#1A2030', borderColor: '#2A3448' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-100">빌드 설정</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {BUILD_SLOT_ORDER.map(({ key, label }) => {
            const is2HOffhand = key === 'offhand' && is2H
            const displayId = is2HOffhand ? build.weapon : build[key]
            const isActive = pickingKey === key && !is2HOffhand
            return (
              <button key={key} onClick={() => handleClickSlot(key)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${is2HOffhand ? 'cursor-not-allowed' : 'hover:border-yellow-500'}`}
                style={{ borderColor: isActive ? '#C8A84B' : '#2A3448', background: '#111827', opacity: is2HOffhand ? 0.45 : 1 }}
                title={is2HOffhand ? '양손 무기 — 보조 장비 장착 불가' : label}>
                {displayId === 'FREE'
                  ? <div className="w-14 h-14 rounded flex items-center justify-center text-xl font-bold" style={{ background: '#1a3a1a', color: '#4ade80' }}>FREE</div>
                  : displayId
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={getIconUrl(displayId)} alt={label} width={56} height={56} className="rounded" loading="eager" />
                    : <div className="w-14 h-14 rounded" style={{ background: '#253045' }} />
                }
                <span className="text-xs" style={{ color: is2HOffhand ? '#555' : '#9CA3AF' }}>{label}</span>
                {displayId && !is2HOffhand && (
                  <span className="text-[10px] text-gray-500 text-center leading-tight truncate w-full">{getItemName(displayId)}</span>
                )}
                {is2HOffhand && <span className="text-[9px] text-gray-600">양손</span>}
              </button>
            )
          })}
        </div>

        {is2H && (
          <p className="text-xs text-gray-500 mb-3 text-center">⚔️ 양손 무기 — 보조 장비를 장착할 수 없습니다</p>
        )}

        {pickingKey && !(pickingKey === 'offhand' && is2H) && (
          <ItemPicker
            slotKey={pickingKey}
            currentId={build[pickingKey]}
            onSelect={(itemId) => handleSetItem(pickingKey, itemId)}
            onClear={() => handleClearItem(pickingKey)}
            onClose={() => setPickingKey(null)}
          />
        )}

        <div className="flex gap-3">
          <Btn primary onClick={() => onSave(build)}>저장</Btn>
          <Btn onClick={onClose}>취소</Btn>
        </div>
      </div>
    </div>
  )
}

// ── 아이템 피커 ───────────────────────────────────────────────────────────────

function ItemPicker({ slotKey, currentId, onSelect, onClear, onClose }: {
  slotKey: BuildKey; currentId?: string
  onSelect: (id: string) => void; onClear: () => void; onClose: () => void
}) {
  const cats = getCatsFor(slotKey)
  const [selectedCat, setSelectedCat] = useState<string>(cats ? cats[0].key : '')
  const catLabel = cats?.find(c => c.key === selectedCat)?.label || ''
  const items = getItems(slotKey, selectedCat)
  const slotLabel = BUILD_SLOT_ORDER.find(s => s.key === slotKey)?.label || slotKey

  return (
    <div className="mt-4 rounded-xl border overflow-hidden" style={{ borderColor: '#2A3448', background: '#111827' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#2A3448' }}>
        <span className="text-sm font-medium text-gray-200">{slotLabel} 선택</span>
        <div className="flex gap-2">
          {currentId && (
            <button onClick={onClear} className="text-xs text-red-500 hover:text-red-400 px-2 py-0.5 rounded" style={{ background: '#2A1A1A' }}>제거</button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">×</button>
        </div>
      </div>
      {cats && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto border-b" style={{ borderColor: '#2A3448' }}>
          {cats.map(c => (
            <button key={c.key} onClick={() => setSelectedCat(c.key)}
              className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-colors"
              style={{ background: selectedCat === c.key ? '#C8A84B' : '#253045', color: selectedCat === c.key ? '#0F1419' : '#9CA3AF' }}>
              {c.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-4 gap-2 p-3 max-h-56 overflow-y-auto">
        {items.map((item: { id: string; name: string }) => (
          <button key={item.id} onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-105 ${currentId === item.id ? 'ring-2 ring-yellow-500' : ''}`}
            style={{ background: currentId === item.id ? '#C8A84B22' : '#192033' }}>
            {item.id === 'FREE'
              ? <div className="w-13 h-13 rounded flex items-center justify-center text-sm font-bold" style={{ width: 52, height: 52, background: '#1a3a1a', color: '#4ade80' }}>FREE</div>
              // eslint-disable-next-line @next/next/no-img-element
              : <img src={getIconUrl(item.id)} alt={item.name} width={52} height={52} className="rounded" loading="lazy" />
            }
            <span className="text-[10px] text-center text-gray-300 leading-tight">
              {item.id !== 'FREE' && catLabel ? <><span className="text-gray-500">{catLabel}</span><br /></> : null}
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 공통 UI ───────────────────────────────────────────────────────────────────

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div className="rounded-xl border p-6 w-full max-w-sm" style={{ background: '#1A2030', borderColor: '#2A3448' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Btn({ children, primary, onClick }: { children: React.ReactNode; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${primary ? '' : 'text-gray-400 hover:text-gray-200'}`}
      style={primary ? { background: '#C8A84B', color: '#0F1419' } : { background: '#253045' }}>
      {children}
    </button>
  )
}
