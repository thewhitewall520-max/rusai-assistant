import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  const today = new Date().toISOString().split('T')[0]

  try {
    const [totalUsage, todayUsage, feedbacks, uniqueIps] = await Promise.all([
      prisma.usage.aggregate({ _sum: { count: true } }),
      prisma.usage.findUnique({ where: { ip_date: { ip: 'total', date: today } } }),
      prisma.feedback.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.usage.groupBy({ by: ['ip'], _count: true }),
    ])

    const goodCount = feedbacks.filter(f => f.rating === 'good').length
    const badCount = feedbacks.filter(f => f.rating === 'bad').length

    res.status(200).json({
      totalUsage: totalUsage._sum.count || 0,
      todayUsage: todayUsage?.count || 0,
      goodRate: (goodCount + badCount) > 0 ? (goodCount / (goodCount + badCount)) * 100 : 0,
      totalFeedbacks: feedbacks.length,
      uniqueUsers: uniqueIps.length || 0,
      modeDistribution: {},
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(200).json({ totalUsage: 0, todayUsage: 0, goodRate: 0, totalFeedbacks: 0, uniqueUsers: 0, modeDistribution: {} })
  }
}
