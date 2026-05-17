import type { NextApiRequest, NextApiResponse } from 'next'

/* ──────────────────────────────────────────────────
   RusAI Inbox Reply v2 — AI 建议回复含 confidence
   ────────────────────────────────────────────────── */

interface ReplyResponse {
  suggestion: string
  confidence: number
  intent: string
  recommendedAction: string
  followUpSuggestions: string[]
  generatedBy: 'deepseek' | 'mock'
  conversationId?: string
  quickReply?: string
  ruVersion?: string
}

/* ── Mock data escalation ── */

const SMART_REPLY_TEMPLATES: Record<string, {
  reply: string
  confidence: number
  intent: string
  action: string
  followUp: string[]
}> = {
  study_abroad: {
    reply: `Здравствуйте! Отличный выбор — обучение в России открывает большие перспективы! 🎓

По вашему вопросу о поступлении:

📚 Программы бакалавриата доступны по 200+ специальностям. Топ-направления у китайских студентов: экономика, международные отношения, медицина, нефтегазовое дело.

Что нужно сейчас:
1️⃣ Определиться со специальностью
2️⃣ Выбрать вуз (Москва vs регионы — разная стоимость)
3️⃣ Начать готовить документы

💰 Стоимость обучения: от 180 000 ₽/год
📅 Приём документов: до 15 августа

Хотите, подберу 3 вуза под ваш бюджет и направление?`,
    confidence: 0.88,
    intent: '留学申请咨询 | Application Inquiry',
    action: '发送试听课邀请 + 匹配院校方案',
    followUp: ['📚 发送课程资料', '📞 预约电话沟通', '📋 发送申请材料清单'],
  },

  course: {
    reply: `Добрый день! Рады вашему интересу к курсам русского языка! 📚

У нас есть несколько программ:
• Интенсив (20 ч/нед) — от 35 000 ₽/мес
• Базовый (10 ч/нед) — от 22 000 ₽/мес
• Онлайн — от 18 000 ₽/мес
• Индивидуально — 2 500 ₽/ак.ч

🎁 Первое пробное занятие — бесплатно!
📅 Ближайший старт: 1 июня

Запишу вас на пробный урок на этой неделе?`,
    confidence: 0.91,
    intent: '课程咨询 | Course Inquiry',
    action: '发送试听课邀请',
    followUp: ['📅 安排试听课', '📋 发送课程大纲', '💰 发送报价单'],
  },

  pricing: {
    reply: `Здравствуйте! Актуальные цены на наши услуги 💰

🎓 Поступление в вуз «под ключ»:
• Консультация + подбор — бесплатно
• Подготовка документов — от 15 000 ₽
• Визовая поддержка — от 8 000 ₽

📚 Курсы русского:
• Интенсив — 35 000 ₽/мес
• Базовый — 22 000 ₽/мес
• Онлайн — 18 000 ₽/мес

💡 Пакет «Поступление + Годовой курс» — скидка 20%!

Какая услуга интересует? Сделаю персональный расчёт.`,
    confidence: 0.94,
    intent: '价格咨询 | Pricing Inquiry',
    action: '发送报价单',
    followUp: ['💰 发送详细报价', '📞 预约顾问电话', '📋 生成服务合同'],
  },

  business: {
    reply: `Уважаемый клиент! Благодарим за проявленный интерес к сотрудничеству 🤝

Готовы обсудить детали и предложить оптимальные условия:

📊 Доступные форматы:
• Разовая поставка
• Долгосрочный контракт (скидка до 15%)
• Эксклюзивное представительство

🚚 Логистика: авиа / ж/д / авто — подберём оптимальный маршрут
⏱ Сроки: 7–21 день в зависимости от способа
💳 Оплата: 50% предоплата, 50% перед отгрузкой

Предлагаю созвониться на этой неделе для обсуждения деталей. Когда удобно?`,
    confidence: 0.87,
    intent: '商务合作 | Business Cooperation',
    action: '安排商务洽谈',
    followUp: ['📞 安排视频会议', '💰 准备报价方案', '📋 草拟合作框架'],
  },

  greeting: {
    reply: `Здравствуйте! 👋

Меня зовут 【Имя】, я менеджер RusAI Business Copilot.

Чем могу помочь? Мы специализируемся на:
🎓 Обучении в России (поступление, визы, адаптация)
📚 Курсах русского языка (все уровни)
🤝 Бизнес-коммуникациях с РФ (переводы, переговоры, контракты)

Буду рада ответить на ваши вопросы! Напишите, что вас интересует 😊`,
    confidence: 0.95,
    intent: '初次问候 | Initial Greeting',
    action: '引导客户说明需求',
    followUp: ['🎓 留学咨询', '📚 课程咨询', '🤝 商务合作'],
  },

  visa: {
    reply: `Здравствуйте! Отличный вопрос по визе 🛂

📋 Порядок оформления учебной визы:
1. Получение приглашения от вуза (20–30 рабочих дней)
2. Подготовка документов: загранпаспорт, фото, анкета, страховка
3. Подача в консульство РФ
4. Рассмотрение: 7–10 рабочих дней

💰 Стоимость:
• Приглашение: входит в стоимость обучения
• Консульский сбор: зависит от страны (~50–150 USD)
• Медстраховка: от 5 000 ₽/год

⏱ Общий срок: 1.5–2 месяца. Начинайте заранее!

Нужна помощь с документами? Поможем на каждом этапе!`,
    confidence: 0.86,
    intent: '签证咨询 | Visa Inquiry',
    action: '发送签证办理指南',
    followUp: ['📋 签证材料清单', '📞 预约签证顾问', '📚 留学流程全解'],
  },

  // Cross-border logistics
  logistics_inquiry: {
    reply: `Здравствуйте! Отвечаю по доставке 📦

Ваш заказ №【XXXXX】:
📍 Текущий статус: В пути
🚚 Способ: Авиадоставка
📅 Ожидаемая дата: 【ДД.ММ.ГГГГ】

Средние сроки Китай → Россия:
✈️ Авиа: 5–10 рабочих дней
🚂 Ж/Д: 15–25 рабочих дней
🚛 Авто: 20–35 рабочих дней

Отслеживать можно по ссылке: 【трек-номер】

Если будут задержки (таможня, праздники) — сразу уведомим. Всё под контролем! ✅`,
    confidence: 0.9,
    intent: '物流查询 | Logistics Inquiry',
    action: '提供物流追踪',
    followUp: ['📦 发送追踪链接', '📞 联系物流专员', '📋 发送签收指南'],
  },

  complaint: {
    reply: `Уважаемый клиент! 🙏

Примите наши искренние извинения за доставленные неудобства. Мы очень серьёзно относимся к качеству обслуживания.

Ваше обращение зарегистрировано под номером 【#TICKET-XXXX】.

Что мы уже делаем:
1️⃣ Передали информацию ответственному специалисту
2️⃣ Проводим проверку по вашему вопросу
3️⃣ Свяжемся с вами в течение 【24 часов】

Решение будет предложено в ближайшее время. Ваше доверие для нас важно!`,
    confidence: 0.83,
    intent: '投诉处理 | Complaint',
    action: '创建工单 + 升级处理',
    followUp: ['📝 创建工单', '📞 主管回访', '💰 协商补偿方案'],
  },
}

/* ── Intent detection ── */

function detectCategory(message: string): string {
  const text = message.toLowerCase()

  if (text.includes('多少钱') || text.includes('价格') || text.includes('цена') ||
      text.includes('стоимость') || text.includes('сколько стоит') || text.includes('прайс') ||
      text.includes('报价')) {
    return 'pricing'
  }
  if (text.includes('申请') || text.includes('入学') || text.includes('大学') ||
      text.includes('поступление') || text.includes('университет') || text.includes('бакалавр') ||
      text.includes('специальность') || text.includes('стипендия') || text.includes('диплом') ||
      text.includes('留学')) {
    return 'study_abroad'
  }
  if (text.includes('课程') || text.includes('培训') || text.includes('学俄语') ||
      text.includes('курс') || text.includes('обучение') || text.includes('урок') ||
      text.includes('занятие') || text.includes('репетитор')) {
    return 'course'
  }
  if (text.includes('合作') || text.includes('订单') || text.includes('合同') ||
      text.includes('сотрудничество') || text.includes('заказ') || text.includes('контракт') ||
      text.includes('партнёр') || text.includes('доставка') || text.includes('логистик')) {
    return 'business'
  }
  if (text.includes('签证') || text.includes('виза') || text.includes('паспорт') ||
      text.includes('приглашение') || text.includes('консульств')) {
    return 'visa'
  }
  if (text.includes('物流') || text.includes('快递') || text.includes('运输') ||
      text.includes('отслеживани') || text.includes('трекинг') || text.includes('курьер') ||
      text.includes('посылка') || text.includes('где заказ') || text.includes('когда придет')) {
    return 'logistics_inquiry'
  }
  if (text.includes('投诉') || text.includes('不满意') || text.includes('退款') ||
      text.includes('жалоб') || text.includes('возврат') || text.includes('проблем') ||
      text.includes('不工作') || text.includes('брак') || text.includes('ошибк')) {
    return 'complaint'
  }
  if (text.includes('你好') || text.includes('hello') || text.includes('hi') ||
      text.includes('здравствуйте') || text.includes('привет') || text.includes('добрый')) {
    return 'greeting'
  }
  return 'study_abroad'
}

/* ── DeepSeek AI call ── */

async function callDeepSeek(message: string, category: string): Promise<{
  reply: string
  confidence: number
  intent: string
  action: string
  followUp: string[]
} | null> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null

  const systemPrompt = `你是RusAI智能客服系统（v2）的AI引擎。根据客户消息，你需要返回JSON格式的结构化回复。

客户意图类别: ${category}

返回格式（必须是合法的JSON）：
{
  "reply": "俄语回复文本（专业友好、简洁150字以内，用【】标记占位内容）",
  "confidence": 0.85,
  "intent": "客户意图描述（中文）",
  "action": "推荐的下一步动作（中文）",
  "followUp": ["后续建议1", "后续建议2", "后续建议3"]
}

规则：
1. 俄语回复地道自然
2. confidence是0-1之间的数字，根据你对客户意图把握程度给分
3. action要具体可执行
4. followUp给出3个具体的下一步建议
5. 只返回JSON，不要其他内容`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content)
    if (parsed.reply && typeof parsed.confidence === 'number') {
      return {
        reply: parsed.reply,
        confidence: Math.min(1, Math.max(0, parsed.confidence)),
        intent: parsed.intent || category,
        action: parsed.action || '回复客户',
        followUp: Array.isArray(parsed.followUp) ? parsed.followUp.slice(0, 3) : [],
      }
    }
    return null
  } catch {
    return null
  }
}

/* ── Generate quick reply ── */

function generateQuickReply(suggestion: string): string {
  // Extract first sentence for quick reply
  const firstSentence = suggestion.split(/[.。!！?？\n]/)[0].trim()
  if (firstSentence.length < suggestion.length * 0.5) {
    return firstSentence + (firstSentence.endsWith('!') ? '' : '!')
  }
  return firstSentence
}

/* ── Handler ── */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReplyResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, conversationId } = (req.body || {}) as {
    message?: string
    conversationId?: string
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: '请提供消息内容 / Пожалуйста, укажите текст сообщения',
    } as any)
  }

  const category = detectCategory(message.trim())

  // Try DeepSeek first
  const aiResult = await callDeepSeek(message.trim(), category)
  if (aiResult) {
    return res.status(200).json({
      suggestion: aiResult.reply,
      confidence: aiResult.confidence,
      intent: aiResult.intent,
      recommendedAction: aiResult.action,
      followUpSuggestions: aiResult.followUp,
      generatedBy: 'deepseek',
      conversationId: conversationId || undefined,
      quickReply: generateQuickReply(aiResult.reply),
    })
  }

  // Mock fallback with structured data
  const template = SMART_REPLY_TEMPLATES[category] || SMART_REPLY_TEMPLATES.study_abroad

  // Simulate slight network delay
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300))

  return res.status(200).json({
    suggestion: template.reply,
    confidence: template.confidence,
    intent: template.intent,
    recommendedAction: template.action,
    followUpSuggestions: template.followUp,
    generatedBy: 'mock',
    conversationId: conversationId || undefined,
    quickReply: generateQuickReply(template.reply),
  })
}
