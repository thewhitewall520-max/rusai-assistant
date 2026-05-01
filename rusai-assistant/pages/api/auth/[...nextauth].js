import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        login: { label: '邮箱或用户名', type: 'text' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null

        // Try email first, then username
        let user = await prisma.user.findUnique({
          where: { email: credentials.login }
        })
        if (!user && credentials.login.includes('@')) {
          user = await prisma.user.findUnique({
            where: { email: credentials.login }
          })
        }
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
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id
      return session
    }
  }
})
