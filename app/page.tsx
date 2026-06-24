'use client'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

const MENU_ITEMS = [
  {
    href: '/sheets',
    label: '컴프 시트',
    desc: '파티 조합 및 역할 배정 관리',
    icon: '📋',
    active: true,
  },
  {
    href: '#',
    label: '길드 멤버',
    desc: '준비 중',
    icon: '⚔️',
    active: false,
  },
  {
    href: '#',
    label: '전투 기록',
    desc: '준비 중',
    icon: '🏆',
    active: false,
  },
  {
    href: '#',
    label: '공지 / 일정',
    desc: '준비 중',
    icon: '📢',
    active: false,
  },
]

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1419' }}>

      {/* ── 헤더 ── */}
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: '#2A3448', background: '#0D1117' }}>
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded font-black text-xs" style={{ background: '#C8A84B', color: '#0F1419' }}>BAN</div>
          <span className="font-black tracking-widest text-sm uppercase" style={{ color: '#C8A84B', letterSpacing: '0.15em' }}>BAN GUILD</span>
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
      </header>

      {/* ── 히어로 ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0D1117 0%, #111827 60%, #0F1419 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(200,168,75,0.03) 80px, rgba(200,168,75,0.03) 81px)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(200,168,75,0.03) 80px, rgba(200,168,75,0.03) 81px)',
        }} />

        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 font-black text-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #C8A84B 0%, #E5C96A 50%, #A8882B 100%)', color: '#0D1117', boxShadow: '0 0 50px rgba(200,168,75,0.3)' }}>
            BAN
          </div>

          <h1 className="text-5xl font-black tracking-widest uppercase mb-3"
            style={{ color: '#C8A84B', textShadow: '0 0 40px rgba(200,168,75,0.25)', letterSpacing: '0.2em' }}>
            BAN GUILD
          </h1>
          <p className="text-sm tracking-widest uppercase mb-2" style={{ color: '#4A5568', letterSpacing: '0.35em' }}>
            Albion Online
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, transparent, #C8A84B55)' }} />
            <div className="w-1 h-1 rounded-full" style={{ background: '#C8A84B55' }} />
            <span className="text-xs tracking-widest" style={{ color: '#4A5568', letterSpacing: '0.25em' }}>GUILD MANAGEMENT</span>
            <div className="w-1 h-1 rounded-full" style={{ background: '#C8A84B55' }} />
            <div className="h-px w-24" style={{ background: 'linear-gradient(90deg, #C8A84B55, transparent)' }} />
          </div>
        </div>
      </div>

      {/* ── 메뉴 카드 ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <p className="text-xs uppercase tracking-widest text-gray-600 mb-6" style={{ letterSpacing: '0.2em' }}>메뉴</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MENU_ITEMS.map(item => (
            item.active ? (
              <Link key={item.label} href={item.href}
                className="group rounded-xl border p-6 flex items-center gap-5 transition-all"
                style={{ background: '#141C28', borderColor: '#2A3448' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#C8A84B66' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#2A3448' }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: '#1E2A3A' }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-100 mb-0.5">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
                <div className="flex-shrink-0 text-gray-600 group-hover:text-yellow-500 transition-colors">→</div>
              </Link>
            ) : (
              <div key={item.label}
                className="rounded-xl border p-6 flex items-center gap-5 opacity-40 cursor-not-allowed"
                style={{ background: '#141C28', borderColor: '#1E2A3A' }}>
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: '#1A2030' }}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-400 mb-0.5">{item.label}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">준비 중</div>
                </div>
                <div className="flex-shrink-0 text-gray-700">🔒</div>
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  )
}
