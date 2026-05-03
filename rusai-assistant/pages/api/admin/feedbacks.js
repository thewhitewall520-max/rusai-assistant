import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function handler(req, res) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.status(200).json({ feedbacks })
  } catch (error) {
    console.error('Feedbacks error:', error)
    res.status(200).json({ feedbacks: [] })
  }
}
