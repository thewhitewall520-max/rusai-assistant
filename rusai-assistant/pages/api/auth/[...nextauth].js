import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        login: { label: '邮箱或用户名', type: 'text' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null

        let user = await prisma.user.findUnique({
          where: { email: credentials.login }
        })
        if (!user) {
          user = await prisma.user.findUnique({
            where: { username: credentials.login }
          })
        }
        
        if (!user || !user.password) return null
        
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null
        
        return { id: user.id, email: user.email, name: user.name || user.username }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id
      if (account) token.provider = account.provider
      return token
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id
      return session
    }
  }
}

export default NextAuth(authOptions)
