import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbGetSheet, dbUpdateSheet, dbDeleteSheet, dbSetSheetPublic, dbClearSheetPlayers, DB_READY } from '@/lib/db'
import { Sheet } from '@/lib/types'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!DB_READY) return NextResponse.json({ fallback: true })
  const { id } = await params
  const sheet = await dbGetSheet(id)
  if (!sheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!sheet.isPublic) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(sheet)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '관리자만 공유 설정 가능합니다' }, { status: 403 })
  }
  if (!DB_READY) return NextResponse.json({ error: 'DB 미설정' }, { status: 503 })
  const { id } = await params
  const { isPublic } = await req.json() as { isPublic: boolean }
  await dbSetSheetPublic(id, isPublic)
  if (!isPublic) await dbClearSheetPlayers(id)
  return NextResponse.json({ ok: true })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: '로그인 필요' }, { status: 401 })
  }
  if (!DB_READY) return NextResponse.json({ error: 'DB 미설정' }, { status: 503 })

  const body = await req.json() as Sheet & { _applyOnly?: boolean }

  // 일반 수정(빌드/파티/슬롯 편집)은 관리자만
  // _applyOnly = true: 플레이어 신청/취소만 → 길드원도 가능
  if (!body._applyOnly && !session.user.isAdmin) {
    return NextResponse.json({ error: '관리자만 편집 가능합니다' }, { status: 403 })
  }
  if (body._applyOnly && !session.user.isGuildMember && !session.user.isAdmin) {
    return NextResponse.json({ error: 'BAN 서버 멤버만 신청할 수 있습니다' }, { status: 403 })
  }

  const { _applyOnly, ...sheetData } = body
  await dbUpdateSheet(id, sheetData)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: '관리자만 삭제 가능합니다' }, { status: 403 })
  }
  if (!DB_READY) return NextResponse.json({ error: 'DB 미설정' }, { status: 503 })
  const { id } = await params
  await dbDeleteSheet(id)
  return NextResponse.json({ ok: true })
}
