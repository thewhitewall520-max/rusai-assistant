import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global
const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function handler(req, res) {
  const session = await getServerSession(req, res)
  
  if (!session) {
    return res.status(401).json({ error: '请先登录' })
  }

  try {
    const [userCount, historyCount, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.history.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, email: true, username: true, name: true, createdAt: true, _count: { select: { histories: true } } }
      })
    ])

    res.status(200).json({
      totalUsers: userCount,
      totalUsage: historyCount,
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        createdAt: u.createdAt,
        usageCount: u._count.histories
      }))
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: '获取统计失败' })
  }
}
