import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbGetSheets, dbCreateSheet, DB_READY } from '@/lib/db'
import { getSheets, createSheet } from '@/lib/store'

export async function GET() {
  if (!DB_READY) {
    // Supabase 미설정 시 로컬 스토리지 데이터는 클라이언트에서 처리
    return NextResponse.json({ fallback: true })
  }
  const sheets = await dbGetSheets()
  return NextResponse.json(sheets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '권한 없음 — 관리자만 시트를 생성할 수 있습니다' }, { status: 403 })
  }
  if (!DB_READY) {
    return NextResponse.json({ error: 'DB 미설정' }, { status: 503 })
  }
  const body = await req.json() as { name: string; description: string; isPublic: boolean }
  const sheet = await dbCreateSheet({ name: body.name, description: body.description, isPublic: body.isPublic, parties: [] }, session.user.id)
  return NextResponse.json(sheet, { status: 201 })
}
