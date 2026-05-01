import bcrypt from 'bcryptjs'
import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const { email, password, name, username } = req.body
  if ((!email && !username) || !password) return res.status(400).json({ error: '邮箱或用户名 + 密码是必填的' })
  
  try {
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return res.status(400).json({ error: '该邮箱已被注册' })
    }
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing) return res.status(400).json({ error: '该用户名已被使用' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: email || `${username}@rusai.local`,
        username: username || null,
        password: hashedPassword,
        name: name || username || (email ? email.split('@')[0] : '用户')
      }
    })
    
    res.status(201).json({ id: user.id, email: user.email, username: user.username, name: user.name })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: '注册失败' })
  }
}
