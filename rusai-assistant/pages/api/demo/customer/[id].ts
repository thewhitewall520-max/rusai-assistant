import type { NextApiRequest, NextApiResponse } from 'next'

/* ── Mock customer data ── */

const CUSTOMERS: Record<string, any> = {
  u1: {
    id: 'u1',
    name: '陈晓',
    avatar: 'CX',
    platform: 'wechat',
    platformId: 'wx_chenxiao_2026',
    phone: '+86 138****6789',
    email: 'chenxiao@example.com',
    language: 'zh',
    location: '北京, 中国',
    timezone: 'Asia/Shanghai',
    source: '小红书广告',
    tags: ['留学咨询', '预科课程', '潜在高价值'],
    status: 'hot_lead',
    notes: '9月去莫斯科国立大学，需要预科俄语培训。预算中等，决策较快。',
    history: {
      firstContact: '2026-05-15',
      totalConversations: 3,
      lastPurchase: null,
      totalValue: 0,
    },
    preferences: {
      preferredChannel: 'wechat',
      preferredTime: 'evening',
      interests: ['俄语学习', '留学', '文化适应'],
    },
    recentActivity: [
      { type: 'message', detail: '询问预科俄语课程开课时间', time: '2026-05-17 10:32' },
      { type: 'page_view', detail: '浏览课程页面', time: '2026-05-17 10:15' },
      { type: 'message', detail: '咨询留学签证事宜', time: '2026-05-16 20:00' },
      { type: 'form_submit', detail: '填写咨询表单', time: '2026-05-15 14:30' },
    ],
  },
  u2: {
    id: 'u2',
    name: 'Анна Петрова',
    avatar: 'AP',
    platform: 'telegram',
    platformId: '@anna_petrova',
    phone: '+7 999***4567',
    email: 'anna.p@example.ru',
    language: 'ru',
    location: '圣彼得堡, 俄罗斯',
    timezone: 'Europe/Moscow',
    source: 'Telegram 群组',
    tags: ['文档翻译', '老客户', '商业合作'],
    status: 'active_client',
    notes: '老客户，多次使用文档翻译服务。正在考虑长期合作。',
    history: {
      firstContact: '2026-03-01',
      totalConversations: 12,
      lastPurchase: '2026-04-20',
      totalValue: 45000,
    },
    preferences: {
      preferredChannel: 'telegram',
      preferredTime: 'afternoon',
      interests: ['翻译服务', '商务合作'],
    },
    recentActivity: [
      { type: 'message', detail: '感谢文档翻译帮助', time: '2026-05-16 16:00' },
      { type: 'purchase', detail: '文档翻译服务 x5', time: '2026-04-20' },
    ],
  },
  u3: {
    id: 'u3',
    name: '李明浩',
    avatar: 'LM',
    platform: 'xiaohongshu',
    platformId: 'xhs_liminghao',
    phone: '+86 139****2345',
    email: 'liminghao@example.com',
    language: 'zh',
    location: '上海, 中国',
    timezone: 'Asia/Shanghai',
    source: '小红书搜索',
    tags: ['留学咨询', '签证', '高意向'],
    status: 'hot_lead',
    notes: '已决定去俄罗斯留学，正在准备材料阶段。对签证办理时间非常关注。',
    history: {
      firstContact: '2026-05-16',
      totalConversations: 1,
      lastPurchase: null,
      totalValue: 0,
    },
    preferences: {
      preferredChannel: 'xiaohongshu',
      preferredTime: 'night',
      interests: ['留学签证', '院校选择'],
    },
    recentActivity: [
      { type: 'message', detail: '询问签证邀请函办理时间', time: '2026-05-16 20:05' },
      { type: 'page_view', detail: '浏览签证服务页面', time: '2026-05-16 19:50' },
    ],
  },
  u4: {
    id: 'u4',
    name: '王芳',
    avatar: 'WF',
    platform: 'wechat',
    platformId: 'wx_wangfang',
    phone: '+86 156****7890',
    email: 'wangfang@example.com',
    language: 'zh',
    location: '莫斯科, 俄罗斯',
    timezone: 'Europe/Moscow',
    source: '朋友推荐',
    tags: ['俄语辅助', '留学中', '在读研究生'],
    status: 'active_client',
    notes: '在莫斯科读研，需要持续的俄语写作辅助。',
    history: {
      firstContact: '2026-04-10',
      totalConversations: 8,
      lastPurchase: '2026-05-05',
      totalValue: 12000,
    },
    preferences: {
      preferredChannel: 'wechat',
      preferredTime: 'evening',
      interests: ['俄语写作', '学术辅导'],
    },
    recentActivity: [
      { type: 'message', detail: '请求写俄语邮件给导师', time: '2026-05-12 09:38' },
    ],
  },
  u5: {
    id: 'u5',
    name: 'Ольга Смирнова',
    avatar: 'OS',
    platform: 'telegram',
    platformId: '@olga_smirnova',
    phone: '+7 916***8901',
    email: 'olga.s@example.ru',
    language: 'ru',
    location: '叶卡捷琳堡, 俄罗斯',
    timezone: 'Asia/Yekaterinburg',
    source: '搜索引擎',
    tags: ['课程咨询', '中文学习', '新线索'],
    status: 'new_lead',
    notes: '想学中文，有商务需求。',
    history: {
      firstContact: '2026-05-12',
      totalConversations: 1,
      lastPurchase: null,
      totalValue: 0,
    },
    preferences: {
      preferredChannel: 'telegram',
      preferredTime: 'morning',
      interests: ['中文学习', '商务中文'],
    },
    recentActivity: [
      { type: 'message', detail: '询问中文课程', time: '2026-05-12 11:10' },
    ],
  },
  u6: {
    id: 'u6',
    name: '张伟',
    avatar: 'ZW',
    platform: 'wechat',
    platformId: 'wx_zhangwei2026',
    phone: '+86 185****3456',
    email: 'zhangwei@example.com',
    language: 'zh',
    location: '广州, 中国',
    timezone: 'Asia/Shanghai',
    source: '百度搜索',
    tags: ['留学咨询', '费用敏感', '新线索'],
    status: 'new_lead',
    notes: '对费用非常关注，需要重点说明性价比。',
    history: {
      firstContact: '2026-05-17',
      totalConversations: 1,
      lastPurchase: null,
      totalValue: 0,
    },
    preferences: {
      preferredChannel: 'wechat',
      preferredTime: 'afternoon',
      interests: ['留学费用', '奖学金'],
    },
    recentActivity: [
      { type: 'message', detail: '询问留学费用', time: '2026-05-17 09:15' },
    ],
  },
  u7: {
    id: 'u7',
    name: 'Елена Козлова',
    avatar: 'EK',
    platform: 'telegram',
    platformId: '@elena_kozlova',
    phone: '+7 903***2345',
    email: 'elena.k@example.ru',
    language: 'ru',
    location: '喀山, 俄罗斯',
    timezone: 'Europe/Moscow',
    source: 'Instagram 广告',
    tags: ['课程咨询', '俄语培训', '高意向'],
    status: 'active_client',
    notes: '参加过一次试听课，反馈很好。正在考虑报名。',
    history: {
      firstContact: '2026-05-10',
      totalConversations: 4,
      lastPurchase: null,
      totalValue: 0,
    },
    preferences: {
      preferredChannel: 'telegram',
      preferredTime: 'evening',
      interests: ['俄语学习', '考试准备'],
    },
    recentActivity: [
      { type: 'message', detail: '询问最近密集课程开班时间', time: '2026-05-15 15:00' },
      { type: 'trial_class', detail: '参加试听课', time: '2026-05-12' },
    ],
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Customer ID required' })
  }

  const customer = CUSTOMERS[id]

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' })
  }

  return res.status(200).json(customer)
}
