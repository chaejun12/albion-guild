'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Sheet } from '@/lib/types'
import { usePermissions } from '@/lib/usePermissions'
import { getSheets, getPublicSheets, deleteSheet, createSheet, setSheetPublic } from '@/lib/store'
import { DB_READY } from '@/lib/db'
import Link from 'next/link'

export default function Home() {
  const { data: session } = useSession()
  const perms = usePermissions()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', isPublic: true })
  const [loading, setLoading] = useState(true)

  const fetchSheets = useCallback(async () => {
    setLoading(true)
    try {
      if (DB_READY) {
        const res = await fetch('/api/sheets')
        const data = await res.json()
        if (!data.fallback) { setSheets(data); return }
      }
      setSheets(perms.isAdmin ? getSheets() : getPublicSheets())
    } finally { setLoading(false) }
  }, [perms.isAdmin])

  useEffect(() => { fetchSheets() }, [fetchSheets])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (DB_READY) {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { alert((await res.json()).error); return }
    } else {
      createSheet(form.name.trim(), form.description.trim(), form.isPublic)
    }
    setForm({ name: '', description: '', isPublic: true })
    setShowCreate(false)
    fetchSheets()
  }

  async function handleDelete(id: string) {
    if (!confirm('시트를 삭제하시겠습니까?')) return
    if (DB_READY) {
      const res = await fetch(`/api/sheets/${id}`, { method: 'DELETE' })
      if (!res.ok) { alert((await res.json()).error); return }
    } else {
      deleteSheet(id)
    }
    fetchSheets()
  }

  async function handleToggleShare(id: string, currentIsPublic: boolean) {
    const next = !currentIsPublic
    setSheets(prev => prev.map(s => s.id === id ? { ...s, isPublic: next } : s))
    if (DB_READY) {
      const res = await fetch(`/api/sheets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: next }),
      })
      if (!res.ok) {
        setSheets(prev => prev.map(s => s.id === id ? { ...s, isPublic: currentIsPublic } : s))
        alert((await res.json()).error)
      }
    } else {
      setSheetPublic(id, next)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0F1419' }}>

      {/* ── 헤더 ── */}
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: '#2A3448', background: '#0D1117' }}>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded font-black text-xs tracking-tight" style={{ background: '#C8A84B', color: '#0F1419' }}>
            BAN
          </div>
          <span className="font-bold tracking-widest text-sm uppercase" style={{ color: '#C8A84B', letterSpacing: '0.15em' }}>BAN</span>
        </div>

        {session ? (
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              session.user.isAdmin ? 'bg-yellow-900 text-yellow-300' :
              session.user.isGuildMember ? 'bg-blue-900 text-blue-300' :
              'bg-gray-800 text-gray-400'
            }`}>
              {session.user.isAdmin ? '👑 관리자' : session.user.isGuildMember ? '⚔️ 멤버' : '👤 게스트'}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {session.user.image && <img src={session.user.image} alt="" width={28} height={28} className="rounded-full" />}
            <span className="text-sm text-gray-300">{session.user.name}</span>
            <button onClick={() => signOut()} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">로그아웃</button>
          </div>
        ) : (
          <button onClick={() => signIn('discord')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: '#5865F2', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            Discord 로그인
          </button>
        )}

        {perms.canCreateSheet && (
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-1.5 rounded text-sm font-semibold"
            style={{ background: '#C8A84B', color: '#0F1419' }}>
            + 새 시트
          </button>
        )}
      </header>

      {/* 역할 안내 배너 */}
      {!perms.loading && !perms.isGuildMember && !perms.isAdmin && (
        <div className="px-6 py-2 text-sm text-center" style={{ background: '#1A2030', borderBottom: '1px solid #2A3448' }}>
          {!session
            ? <span className="text-gray-400">Discord 로그인 후 BAN 서버 멤버는 슬롯 신청이 가능합니다 <button onClick={() => signIn('discord')} className="text-blue-400 hover:underline ml-1">로그인 →</button></span>
            : <span className="text-gray-500">BAN 서버 멤버가 아닌 경우 시트 열람만 가능합니다</span>
          }
        </div>
      )}

      {/* ── 히어로 ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0D1117 0%, #111827 60%, #0F1419 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(200,168,75,0.03) 80px, rgba(200,168,75,0.03) 81px)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(200,168,75,0.03) 80px, rgba(200,168,75,0.03) 81px)',
        }} />

        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 font-black text-xl tracking-tight shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C8A84B 0%, #E5C96A 50%, #A8882B 100%)', color: '#0D1117', boxShadow: '0 0 40px rgba(200,168,75,0.25)' }}>
            BAN
          </div>

          <h1 className="text-4xl font-black tracking-widest uppercase mb-2" style={{ color: '#C8A84B', textShadow: '0 0 30px rgba(200,168,75,0.3)', letterSpacing: '0.2em' }}>
            BAN GUILD
          </h1>
          <p className="text-sm tracking-widest uppercase mb-8" style={{ color: '#4A5568', letterSpacing: '0.3em' }}>
            Albion Online
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, transparent, #C8A84B)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8A84B' }} />
            <div className="text-xs tracking-widest uppercase" style={{ color: '#C8A84B' }}>COMPOSITION SHEETS</div>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C8A84B' }} />
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(90deg, #C8A84B, transparent)' }} />
          </div>
        </div>
      </div>

      {/* ── 시트 목록 ── */}
      <main className="max-w-5xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-300 uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>시트 목록</h2>
          <span className="text-xs text-gray-600">{sheets.length}개</span>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-20">불러오는 중...</p>
        ) : sheets.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 font-black text-xl" style={{ background: '#1A2030', color: '#2A3448' }}>
              BAN
            </div>
            <p className="text-gray-500">{perms.canCreateSheet ? '+ 새 시트 버튼으로 생성하세요' : '등록된 시트가 없습니다'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets.map(sheet => {
              const totalPlayers = (sheet.parties || []).flatMap(p => p.slots?.flatMap(s => (s.buildSlots || []).filter(b => b.player)) ?? []).length
              const totalSlots = (sheet.parties || []).flatMap(p => p.slots?.flatMap(s => s.buildSlots || []) ?? []).length
              return (
                <div key={sheet.id} className="rounded-xl border p-5 flex flex-col gap-3 transition-all"
                  style={{ background: '#141C28', borderColor: '#2A3448' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C8A84B44' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2A3448' }}>
                  <div className="h-0.5 -mx-5 -mt-5 mb-1 rounded-t-xl" style={{ background: 'linear-gradient(90deg, #C8A84B44, transparent)' }} />

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-100 truncate">{sheet.name}</h3>
                      {sheet.description && <p className="text-sm text-gray-500 mt-0.5 truncate">{sheet.description}</p>}
                    </div>
                    <span className={`ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${sheet.isPublic ? 'bg-green-900/60 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                      {sheet.isPublic ? '공개' : '비공개'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{(sheet.parties || []).length}개 파티</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs font-medium" style={{ color: totalPlayers > 0 ? '#C8A84B' : '#4A5568' }}>
                      {totalPlayers}/{totalSlots}명 확정
                    </span>
                  </div>

                  <div className="flex gap-2 mt-auto pt-2 border-t" style={{ borderColor: '#1E2A3A' }}>
                    <Link href={`/sheet/${sheet.id}`}
                      className="flex-1 text-center py-1.5 rounded text-sm font-semibold transition-colors"
                      style={{ background: '#1E2A3A', color: '#C8A84B' }}>
                      열기
                    </Link>
                    {perms.isAdmin && (
                      <button onClick={() => handleToggleShare(sheet.id, sheet.isPublic)}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${sheet.isPublic ? 'text-yellow-500 hover:bg-yellow-900/20' : 'text-green-400 hover:bg-green-900/20'}`}>
                        {sheet.isPublic ? '공유 취소' : '공유'}
                      </button>
                    )}
                    {perms.canDeleteSheet && (
                      <button onClick={() => handleDelete(sheet.id)} className="px-3 py-1.5 rounded text-sm text-red-500 hover:bg-red-900/20">
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* ── 시트 생성 모달 ── */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <form onSubmit={handleCreate} className="rounded-xl border p-6 w-full max-w-md" style={{ background: '#141C28', borderColor: '#2A3448' }}>
            <h3 className="text-lg font-bold mb-5 text-gray-100">새 시트 생성</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">시트명 *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="브림스톤 메인컴프" autoFocus
                  className="w-full px-3 py-2 rounded border text-gray-100 text-sm outline-none"
                  style={{ background: '#253045', borderColor: '#2A3448' }} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">설명</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="100인 CTA용"
                  className="w-full px-3 py-2 rounded border text-gray-100 text-sm outline-none"
                  style={{ background: '#253045', borderColor: '#2A3448' }} />
              </div>
              <div className="flex gap-4">
                {['공개', '비공개'].map((label, i) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={form.isPublic === (i === 0)} onChange={() => setForm(f => ({ ...f, isPublic: i === 0 }))} className="accent-yellow-500" />
                    <span className="text-sm text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" className="flex-1 py-2 rounded font-semibold text-sm" style={{ background: '#C8A84B', color: '#0F1419' }}>생성</button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded text-sm text-gray-400" style={{ background: '#253045' }}>취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
