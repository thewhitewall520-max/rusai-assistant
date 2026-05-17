import type { NextApiRequest, NextApiResponse } from 'next'

/* ── Mock conversations data ── */

const CONVERSATIONS = [
  {
    id: 'c1',
    customerId: 'u1',
    customerName: '陈晓',
    customerAvatar: 'CX',
    platform: 'wechat',
    lastMessage: '老师，请问预科俄语课程什么时候开课？',
    lastMessageTime: '2026-05-17T10:32:00+08:00',
    unread: 1,
    status: 'active',
    tags: ['留学咨询', '预科课程'],
    aiHandled: true,
  },
  {
    id: 'c2',
    customerId: 'u2',
    customerName: 'Анна Петрова',
    customerAvatar: 'AP',
    platform: 'telegram',
    lastMessage: 'Спасибо за помощь с документами!',
    lastMessageTime: '2026-05-16T16:00:00+08:00',
    unread: 0,
    status: 'active',
    tags: ['文档翻译', '老客户'],
    aiHandled: false,
  },
  {
    id: 'c3',
    customerId: 'u3',
    customerName: '李明浩',
    customerAvatar: 'LM',
    platform: 'xiaohongshu',
    lastMessage: '签证邀请函多久能下来？',
    lastMessageTime: '2026-05-16T20:05:00+08:00',
    unread: 1,
    status: 'active',
    tags: ['留学咨询', '签证'],
    aiHandled: true,
  },
  {
    id: 'c4',
    customerId: 'u4',
    customerName: '王芳',
    customerAvatar: 'WF',
    platform: 'wechat',
    lastMessage: '能帮我写一封俄语邮件给导师吗？',
    lastMessageTime: '2026-05-12T09:38:00+08:00',
    unread: 0,
    status: 'active',
    tags: ['俄语辅助', '留学中'],
    aiHandled: false,
  },
  {
    id: 'c5',
    customerId: 'u5',
    customerName: 'Ольга Смирнова',
    customerAvatar: 'OS',
    platform: 'telegram',
    lastMessage: 'Есть ли у вас курсы китайского для русских?',
    lastMessageTime: '2026-05-12T11:10:00+08:00',
    unread: 0,
    status: 'active',
    tags: ['课程咨询', '中文学习'],
    aiHandled: false,
  },
  {
    id: 'c6',
    customerId: 'u6',
    customerName: '张伟',
    customerAvatar: 'ZW',
    platform: 'wechat',
    lastMessage: '俄罗斯留学费用大概多少？',
    lastMessageTime: '2026-05-17T09:15:00+08:00',
    unread: 2,
    status: 'active',
    tags: ['留学咨询', '费用'],
    aiHandled: false,
  },
  {
    id: 'c7',
    customerId: 'u7',
    customerName: 'Елена Козлова',
    customerAvatar: 'EK',
    platform: 'telegram',
    lastMessage: 'Когда ближайший набор на интенсив?',
    lastMessageTime: '2026-05-15T15:00:00+08:00',
    unread: 0,
    status: 'active',
    tags: ['课程咨询'],
    aiHandled: true,
  },
]

/* ── Handler ── */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { status, platform, search, page = '1', limit = '20' } = req.query

  let filtered = [...CONVERSATIONS]

  if (status && typeof status === 'string') {
    filtered = filtered.filter((c) => c.status === status)
  }
  if (platform && typeof platform === 'string') {
    filtered = filtered.filter((c) => c.platform === platform)
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.customerName.toLowerCase().includes(s) ||
        c.lastMessage.toLowerCase().includes(s) ||
        c.tags.some((t) => t.toLowerCase().includes(s))
    )
  }

  // Sort by lastMessageTime desc
  filtered.sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
  )

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20))
  const total = filtered.length
  const start = (pageNum - 1) * limitNum
  const items = filtered.slice(start, start + limitNum)

  return res.status(200).json({
    items,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    stats: {
      total: CONVERSATIONS.length,
      unread: CONVERSATIONS.filter((c) => c.unread > 0).length,
      aiHandled: CONVERSATIONS.filter((c) => c.aiHandled).length,
    },
  })
}
