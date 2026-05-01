import { getSession } from 'next-auth/react'
import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  
  const userId = session.user.id
  
  if (req.method === 'GET') {
    try {
      const histories = await prisma.history.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      res.status(200).json(histories)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' })
    }
  } else if (req.method === 'POST') {
    const { mode, input, output, tone, target } = req.body
    if (!mode || !input || !output) return res.status(400).json({ error: 'Missing fields' })
    
    try {
      const history = await prisma.history.create({
        data: { userId, mode, input, output, tone, target }
      })
      res.status(201).json(history)
    } catch (error) {
      console.error('History save error:', error)
      res.status(500).json({ error: 'Failed to save history' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
