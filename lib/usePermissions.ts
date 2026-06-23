'use client'
import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session, status } = useSession()
  const user = session?.user
  return {
    loading:         status === 'loading',
    isLoggedIn:      !!user,
    isAdmin:         user?.isAdmin ?? false,
    isGuildMember:   user?.isGuildMember ?? false,
    canCreateSheet:  user?.isAdmin ?? false,
    canEditSheet:    user?.isAdmin ?? false,
    canDeleteSheet:  user?.isAdmin ?? false,
    canApply:        (user?.isGuildMember ?? false) || (user?.isAdmin ?? false),
    user,
  }
}
