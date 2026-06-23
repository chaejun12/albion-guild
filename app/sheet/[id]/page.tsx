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

// BuildKey → 카테고리 목록 반환
function getCatsFor(key: BuildKey) {
  if (key === 'weapon') return WEAPON_CATS
  if (key === 'offhand') return OFFHAND_CATS
  if (key === 'head' || key === 'chest' || key === 'shoes') return ARMOR_CATS
  return null  // cape, food, potion → 카테고리 없이 바로 목록
}

// BuildKey + category → 아이템 목록
function getItems(key: BuildKey, cat: string): { id: string; name: string }[] {
  const W = WEAPONS as Record<string, { id: string; name: string }[]>
  const AH = ARMOR_HEAD as Record<string, { id: string; name: string }[]>
  const AC = ARMOR_CHEST as Record<string, { id: string; name: string }[]>
  const AS = ARMOR_SHOES as Record<string, { id: string; name: string }[]>
  if (key === 'weapon')  return W[cat] || []
  if (key === 'head')    return AH[cat] || []
  if (key === 'chest')   return AC[cat] || []
  if (key === 'shoes')   return AS[cat] || []
  if (key === 'offhand') return W[cat] || []
  if (key === 'cape')    return CAPES as { id: string; name: string }[]
  if (key === 'food')    return FOOD as { id: string; name: string }[]
  if (key === 'potion')  return POTIONS as { id: string; name: string }[]
  return []
}

// 아이템 ID → 이름 조회 (빌드 행 표시용)
function getItemName(itemId: string): string {
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
  const [ctaActive, setCtaActive] = useState(false)

  // 모달 상태
  const [addPartyOpen, setAddPartyOpen] = useState(false)
  const [partyName, setPartyName] = useState('')
  const [addRoleOpen, setAddRoleOpen] = useState<string | null>(null)  // partyId
  const [buildEditing, setBuildEditing] = useState<{ partyId: string; slotId: string; buildSlotId: string } | null>(null)
  const [playerModal, setPlayerModal] = useState<{ partyId: string; slotId: string; buildSlotId: string } | null>(null)
  const [playerInput, setPlayerInput] = useState({ nickname: '', ip: '' })

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

  // ── 플레이어
  function setPlayer(partyId: string, slotId: string, bsId: string) {
    if (!sheet || !playerInput.nickname.trim()) return
    const player: Player = {
      id: uid(),
      nickname: playerInput.nickname.trim(),
      discordId: session?.user?.id,
      currentIP: playerInput.ip ? parseInt(playerInput.ip) : undefined,
    }
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? {
        ...s, buildSlots: s.buildSlots.map(b => b.id === bsId ? { ...b, player } : b)
      } : s)
    } : p) }, true)  // applyOnly = true
    setPlayerInput({ nickname: '', ip: '' }); setPlayerModal(null)
  }
  function removePlayer(partyId: string, slotId: string, bsId: string) {
    if (!sheet) return
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? {
        ...s, buildSlots: s.buildSlots.map(b => b.id === bsId ? { ...b, player: undefined } : b)
      } : s)
    } : p) })
  }
  function toggleCta(partyId: string, slotId: string, bsId: string, status: Player['ctaStatus']) {
    if (!sheet) return
    persist({ ...sheet, parties: sheet.parties.map(p => p.id === partyId ? {
      ...p, slots: p.slots.map(s => s.id === slotId ? {
        ...s, buildSlots: s.buildSlots.map(b => b.id === bsId && b.player ? {
          ...b, player: { ...b.player, ctaStatus: b.player.ctaStatus === status ? undefined : status }
        } : b)
      } : s)
    } : p) })
  }

  // ── 통계 (방어 코드 포함 - 구버전 데이터 대비)
  const allBuildSlots = sheet?.parties.flatMap(p => p.slots.flatMap(s => s.buildSlots || [])).filter(Boolean) ?? []
  const allPlayers = allBuildSlots.flatMap(b => b?.player ? [b.player] : [])
  const totalSlots = allBuildSlots.length
  const ctaStats = { attend: 0, absent: 0, late: 0 }
  allPlayers.forEach(pl => { if (pl.ctaStatus) ctaStats[pl.ctaStatus]++ })
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
      {notFound && <Link href="/" className="text-sm px-4 py-2 rounded" style={{ background: '#253045', color: '#C8A84B' }}>← 목록으로</Link>}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1419' }}>
      {/* 헤더 */}
      <header className="border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-30" style={{ borderColor: '#2A3448', background: '#141C28' }}>
        <Link href="/" className="text-gray-400 hover:text-gray-200 text-sm">← 목록</Link>
        <h1 className="font-bold text-gray-100 flex-1 truncate">{sheet.name}</h1>
        <span className="text-sm text-gray-400">{allPlayers.length}/{totalSlots}</span>
        {perms.canEditSheet && (ctaActive
          ? <button onClick={() => setCtaActive(false)} className="px-3 py-1.5 rounded text-sm font-medium bg-red-800 text-red-200">CTA 종료</button>
          : <button onClick={() => setCtaActive(true)} className="px-3 py-1.5 rounded text-sm font-medium" style={{ background: '#C8A84B', color: '#0F1419' }}>CTA 시작</button>
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
              {/* 파티 헤더 */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: '#2A3448' }}>
                <h2 className="font-bold text-gray-100 flex-1">{party.name}</h2>
                {perms.canEditSheet && <>
                  <button onClick={() => setAddRoleOpen(party.id)} className="text-xs px-2 py-1 rounded text-gray-400 hover:text-white" style={{ background: '#253045' }}>+ 역할</button>
                  <button onClick={() => deleteParty(party.id)} className="text-xs text-red-600 hover:text-red-400">삭제</button>
                </>}
              </div>

              {/* 역할 슬롯 목록 */}
              <div className="p-3 space-y-3">
                {party.slots.map(roleSlot => {
                  const preset = ROLE_PRESETS[roleSlot.role] ?? { label: roleSlot.role || '역할', color: '#666' }
                  return (
                    <div key={roleSlot.id} className="rounded overflow-hidden" style={{ background: '#111827' }}>
                      {/* 역할 헤더 */}
                      <div className="flex items-center gap-2 px-3 py-2" style={{ borderLeft: `4px solid ${preset.color}`, background: '#192033' }}>
                        <span className="text-sm font-bold" style={{ color: preset.color }}>{preset.label}</span>
                        <span className="text-xs text-gray-500">{(roleSlot.buildSlots||[]).filter(b => b?.player).length}/{(roleSlot.buildSlots||[]).length}</span>
                        <div className="flex-1" />
                        {perms.canEditSheet && <>
                          <button onClick={() => addBuildSlot(party.id, roleSlot.id)} className="text-xs px-2 py-0.5 rounded" style={{ background: '#253045', color: '#C8A84B' }}>+ 빌드</button>
                          <button onClick={() => deleteRole(party.id, roleSlot.id)} className="text-xs text-red-700 hover:text-red-500 ml-1">역할 삭제</button>
                        </>}
                      </div>

                      {/* 빌드 슬롯들 */}
                      <div className="divide-y" style={{ borderColor: '#1F2937' }}>
                        {(roleSlot.buildSlots || []).map((bs, idx) => (
                          <BuildRow
                            key={bs.id}
                            bs={bs}
                            idx={idx}
                            ctaActive={ctaActive}
                            canEdit={perms.canEditSheet}
                            canApply={perms.canApply}
                            onEditBuild={() => setBuildEditing({ partyId: party.id, slotId: roleSlot.id, buildSlotId: bs.id })}
                            onCopy={() => copyBuildSlot(party.id, roleSlot.id, bs.id)}
                            onDelete={() => deleteBuildSlot(party.id, roleSlot.id, bs.id)}
                            onSignup={() => { setPlayerInput({ nickname: session?.user?.name ?? '', ip: '' }); setPlayerModal({ partyId: party.id, slotId: roleSlot.id, buildSlotId: bs.id }) }}
                            onRemovePlayer={() => removePlayer(party.id, roleSlot.id, bs.id)}
                            onToggleCta={(status) => toggleCta(party.id, roleSlot.id, bs.id, status)}
                          />
                        ))}
                        {(roleSlot.buildSlots||[]).length === 0 && (
                          <p className="text-center text-xs text-gray-600 py-3">+ 빌드 버튼으로 빌드를 추가하세요</p>
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
            <p className="text-xs text-gray-500 mb-1">총 인원</p>
            <p className="text-2xl font-bold" style={{ color: '#C8A84B' }}>{allPlayers.length}<span className="text-base text-gray-500">/{totalSlots}</span></p>
          </div>
          {ctaActive && (
            <div>
              <p className="text-xs text-gray-500 mb-2">CTA 출석</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-green-400">참석</span><span>{ctaStats.attend}</span></div>
                <div className="flex justify-between"><span className="text-red-400">불참</span><span>{ctaStats.absent}</span></div>
                <div className="flex justify-between"><span className="text-yellow-400">늦참</span><span>{ctaStats.late}</span></div>
                <div className="flex justify-between text-gray-500"><span>미응답</span><span>{allPlayers.length - ctaStats.attend - ctaStats.absent - ctaStats.late}</span></div>
              </div>
            </div>
          )}
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

      {/* ── 모달: 파티 추가 */}
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

      {/* ── 모달: 역할 추가 */}
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

      {/* ── 모달: 빌드 설정 */}
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

      {/* ── 모달: 플레이어 신청 */}
      {playerModal && (
        <ModalShell title="슬롯 신청" onClose={() => setPlayerModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">닉네임</label>
              <input value={playerInput.nickname} onChange={e => setPlayerInput(f => ({ ...f, nickname: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && playerModal && setPlayer(playerModal.partyId, playerModal.slotId, playerModal.buildSlotId)}
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
            <Btn primary onClick={() => playerModal && setPlayer(playerModal.partyId, playerModal.slotId, playerModal.buildSlotId)}>확인</Btn>
            <Btn onClick={() => setPlayerModal(null)}>취소</Btn>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

// ── 빌드 행 컴포넌트 ──────────────────────────────────────────────────────────

function BuildRow({ bs, idx, ctaActive, canEdit, canApply, onEditBuild, onCopy, onDelete, onSignup, onRemovePlayer, onToggleCta }: {
  bs: BuildSlot; idx: number; ctaActive: boolean; canEdit: boolean; canApply: boolean
  onEditBuild: () => void; onCopy: () => void; onDelete: () => void
  onSignup: () => void; onRemovePlayer: () => void
  onToggleCta: (s: Player['ctaStatus']) => void
}) {
  const hasBuild = Object.values(bs.build).some(Boolean)
  return (
    <div className="flex items-center gap-3 px-3 py-2" style={{ background: '#111827' }}>
      {/* 번호 */}
      <span className="text-xs text-gray-600 w-4 flex-shrink-0">{idx + 1}</span>

      {/* 빌드 아이콘 8개 */}
      <div className="flex gap-1 flex-shrink-0">
        {BUILD_SLOT_ORDER.map(({ key, label }) => {
          const weaponIs2H = isTwoHanded(bs.build.weapon)
          const is2HSlot = key === 'offhand' && weaponIs2H
          const itemId = is2HSlot ? bs.build.weapon : bs.build[key]
          return (
            <div key={key} title={is2HSlot ? '양손 무기' : (itemId ? `${label}: ${getItemName(itemId)}` : label)}
              className="relative group" style={{ opacity: is2HSlot ? 0.4 : 1 }}>
              {itemId
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={getIconUrl(itemId)} alt={label} width={36} height={36} className="rounded border" style={{ borderColor: '#2A3448' }} loading="eager" />
                : <div className="w-9 h-9 rounded border border-dashed flex items-center justify-center text-[9px] text-gray-700" style={{ borderColor: '#2A3448' }}>{label[0]}</div>
              }
            </div>
          )
        })}
      </div>

      {/* 플레이어 or 신청 */}
      <div className="flex-1 min-w-0">
        {bs.player ? (
          <div className="flex items-center gap-2">
            {ctaActive && (
              <div className="flex gap-1">
                {(['attend', 'absent', 'late'] as const).map(st => (
                  <button key={st} onClick={() => onToggleCta(st)}
                    className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-colors ${bs.player?.ctaStatus === st ? ctaBg(st) : 'bg-gray-700 text-gray-400'}`}>
                    {st === 'attend' ? '✓' : st === 'absent' ? '✗' : '~'}
                  </button>
                ))}
              </div>
            )}
            <span className={`text-sm font-medium truncate ${bs.player.ctaStatus ? ctaText(bs.player.ctaStatus) : 'text-gray-200'}`}>
              {bs.player.nickname}
            </span>
            {bs.player.currentIP && <span className="text-xs text-gray-500 flex-shrink-0">{bs.player.currentIP}</span>}
            {(canEdit || canApply) && (
              <button onClick={onRemovePlayer} className="text-gray-600 hover:text-red-400 text-sm flex-shrink-0">×</button>
            )}
          </div>
        ) : (
          canApply
            ? <button onClick={onSignup} className="text-xs text-gray-500 hover:text-yellow-400 transition-colors">+ 신청</button>
            : <span className="text-xs text-gray-700">— 로그인 필요</span>
        )}
      </div>

      {/* 액션 버튼 - 관리자만 */}
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

// ── 빌드 에디터 모달 ──────────────────────────────────────────────────────────

function BuildEditorModal({ initial, onSave, onClose }: { initial: Build; onSave: (b: Build) => void; onClose: () => void }) {
  const [build, setBuild] = useState<Build>({ ...initial })
  const [pickingKey, setPickingKey] = useState<BuildKey | null>(null)

  const is2H = isTwoHanded(build.weapon)

  function handleSetItem(key: BuildKey, itemId: string) {
    setBuild(b => {
      const next = { ...b, [key]: itemId }
      // 무기를 양손으로 바꾸면 보조 슬롯 초기화
      if (key === 'weapon' && isTwoHanded(itemId)) {
        delete next.offhand
      }
      return next
    })
    setPickingKey(null)
  }

  function handleClearItem(key: BuildKey) {
    setBuild(b => { const next = { ...b }; delete next[key]; return next })
    setPickingKey(null)
  }

  function handleClickSlot(key: BuildKey) {
    // 양손 무기 상태에서 보조 슬롯 클릭 → 무시
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

        {/* 8슬롯 그리드 */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {BUILD_SLOT_ORDER.map(({ key, label }) => {
            const is2HOffhand = key === 'offhand' && is2H
            // 양손 무기면 보조 슬롯에 무기 아이콘을 흐리게 표시
            const displayId = is2HOffhand ? build.weapon : build[key]
            const isActive = pickingKey === key && !is2HOffhand

            return (
              <button key={key} onClick={() => handleClickSlot(key)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${is2HOffhand ? 'cursor-not-allowed' : 'hover:border-yellow-500'}`}
                style={{ borderColor: isActive ? '#C8A84B' : '#2A3448', background: '#111827', opacity: is2HOffhand ? 0.45 : 1 }}
                title={is2HOffhand ? '양손 무기 — 보조 장비 장착 불가' : label}>
                {displayId
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

        {/* 양손 무기 알림 */}
        {is2H && (
          <p className="text-xs text-gray-500 mb-3 text-center">
            ⚔️ 양손 무기 — 보조 장비를 장착할 수 없습니다
          </p>
        )}

        {/* 선택된 슬롯이 있으면 아이템 피커 (양손 보조 슬롯이면 피커 열지 않음) */}
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
      {/* 피커 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#2A3448' }}>
        <span className="text-sm font-medium text-gray-200">{slotLabel} 선택</span>
        <div className="flex gap-2">
          {currentId && (
            <button onClick={onClear} className="text-xs text-red-500 hover:text-red-400 px-2 py-0.5 rounded" style={{ background: '#2A1A1A' }}>
              제거
            </button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">×</button>
        </div>
      </div>

      {/* 카테고리 탭 (있는 경우) */}
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

      {/* 아이템 그리드 */}
      <div className="grid grid-cols-4 gap-2 p-3 max-h-56 overflow-y-auto">
        {items.map((item: { id: string; name: string }) => (
          <button key={item.id} onClick={() => onSelect(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:scale-105 ${currentId === item.id ? 'ring-2 ring-yellow-500' : ''}`}
            style={{ background: currentId === item.id ? '#C8A84B22' : '#192033' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getIconUrl(item.id)} alt={item.name} width={52} height={52} className="rounded" loading="lazy" />
            <span className="text-[10px] text-center text-gray-300 leading-tight">
              {catLabel ? <><span className="text-gray-500">{catLabel}</span><br /></> : null}
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 공통 UI 요소 ──────────────────────────────────────────────────────────────

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

function ctaBg(st: string) {
  return st === 'attend' ? 'bg-green-700 text-green-200' : st === 'absent' ? 'bg-red-800 text-red-200' : 'bg-yellow-700 text-yellow-200'
}
function ctaText(st: string) {
  return st === 'attend' ? 'text-green-400' : st === 'absent' ? 'text-red-400' : 'text-yellow-400'
}
