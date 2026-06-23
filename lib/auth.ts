import type { NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

const ADMIN_IDS = (process.env.ADMIN_DISCORD_IDS ?? '')
  .split(',').map(s => s.trim()).filter(Boolean)

const GUILD_ID = process.env.DISCORD_GUILD_ID ?? ''

async function checkGuildMember(accessToken: string): Promise<boolean> {
  if (!GUILD_ID || !accessToken) return false
  try {
    const res = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return false
    const guilds = (await res.json()) as { id: string }[]
    return guilds.some(g => g.id === GUILD_ID)
  } catch { return false }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: 'identify guilds' } },
    }),
  ],
  session: { maxAge: 60 * 60 * 24 },  // 24시간 (길드 탈퇴 반영 주기)
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        const isGuildMember = await checkGuildMember(account.access_token)
        token.isGuildMember = isGuildMember
        token.isAdmin = ADMIN_IDS.includes(token.sub ?? '')
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub ?? ''
      session.user.isAdmin = (token.isAdmin as boolean) ?? false
      session.user.isGuildMember = (token.isGuildMember as boolean) ?? false
      return session
    },
  },
  pages: { signIn: '/login' },
}
