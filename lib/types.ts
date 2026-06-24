export type RoleType = 'healer' | 'dealer' | 'support' | 'defense' | 'offense' | 'caller'

export const ROLE_PRESETS: Record<RoleType, { label: string; color: string }> = {
  healer:  { label: 'Healer',    color: '#38A169' },
  dealer:  { label: 'Dealer',    color: '#E53E3E' },
  support: { label: 'Supporter', color: '#805AD5' },
  defense: { label: 'Defense',   color: '#3182CE' },
  offense: { label: 'Offense',   color: '#DD6B20' },
  caller:  { label: 'Caller',    color: '#D69E2E' },
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
