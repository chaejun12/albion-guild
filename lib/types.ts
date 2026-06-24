export type RoleType = 'healer' | 'dealer' | 'support' | 'defense' | 'tank' | 'caller'

export const ROLE_PRESETS: Record<RoleType, { label: string; color: string }> = {
  healer:  { label: '힐러',   color: '#38A169' },
  dealer:  { label: '딜러',   color: '#E53E3E' },
  support: { label: '서포터', color: '#805AD5' },
  defense: { label: '디펜스', color: '#3182CE' },
  tank:    { label: '탱커',   color: '#DD6B20' },
  caller:  { label: '콜러',   color: '#D69E2E' },
}

export interface Build {
  weapon?: string
  head?: string
  chest?: string
  shoes?: string
  cape?: string
  offhand?: string
  food?: string
  potion?: string
}

export interface Player {
  id: string
  nickname: string
  discordId?: string
  currentIP?: number
  ctaStatus?: 'attend' | 'absent' | 'late'
}

export interface BuildSlot {
  id: string
  build: Build
  player?: Player
  applicants?: Player[]
  removedApplications?: { bsId: string; player: Player }[]
}

export interface RoleSlot {
  id: string
  role: RoleType
  buildSlots: BuildSlot[]
}

export interface Party {
  id: string
  name: string
  slots: RoleSlot[]
}

export interface Sheet {
  id: string
  name: string
  description?: string
  isPublic: boolean
  applicationClosed?: boolean
  parties: Party[]
  createdAt: string
  updatedAt: string
}
