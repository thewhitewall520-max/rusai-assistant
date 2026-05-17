import type { NextApiRequest, NextApiResponse } from 'next'

const REPLY_TEMPLATES: Record<string, string[]> = {
  study_abroad: [
    `Здравствуйте! Спасибо за ваш вопрос.

Обучение в России — отличный выбор! Вот что вам нужно знать:

📚 Для поступления на бакалавриат потребуются:
• Аттестат + перевод
• Сертификат русского языка (или год подготовительного курса)
• Загранпаспорт + нотариальный перевод
• Медицинская справка

💰 Стоимость: от 180 000 ₽/год (бакалавриат), от 220 000 ₽/год (магистратура).

📅 Приём документов: до 【15 августа】.

Хотите, я помогу подобрать университет под ваш бюджет и специальность?`,

    `Добрый день! Рада помочь с информацией о поступлении.

Наш университет входит в топ-【10】вузов России по направлению 【экономика/медицина/инженерия】.

🎓 Доступные программы:
• Бакалавриат — 4 года
• Магистратура — 2 года
• Аспирантура — 3 года
• Подготовительный курс — 1 год

🌍 У нас учатся студенты из 60+ стран. Есть китайское землячество и адаптационная программа.

Чтобы подобрать программу, напишите:
1. Ваш текущий уровень образования
2. Желаемую специальность
3. Бюджет на обучение`,

    `Здравствуйте! Отвечаю по поводу стипендий:

🎯 Доступные варианты:
1. Государственная стипендия (квота) — покрывает 100% обучения + ежемесячная выплата ~2 000 ₽
2. Стипендия университета за успеваемость — до 15 000 ₽/мес
3. Грант ректора — для талантливых студентов

📋 Для подачи на госстипендию нужны:
• Высокий средний балл аттестата
• Мотивационное письмо
• Портфолио достижений

Конкурс начинается 【в январе】. Рекомендую готовить документы уже сейчас!`
  ],

  course: [
    `Добрый день! Благодарю за интерес к курсам.

Наш интенсивный курс русского языка включает:
✅ 20 ак. часов в неделю
✅ Грамматика + разговорная практика
✅ Носители языка
✅ Учебные материалы
✅ Сертификат гос.образца

💰 Стоимость: 35 000 ₽/месяц
📅 Ближайший старт: 【1 июня】

🎁 Акция: при оплате 3 месяцев — скидка 10%!

Запишу вас на пробный урок?`
  ],

  business: [
    `Уважаемый 【Имя】!

Благодарю за ваш запрос. Мы готовы обсудить сотрудничество.

Наши предложения:
1. Онлайн-встреча для уточнения деталей
2. Подготовка коммерческого предложения
3. Пилотный заказ на специальных условиях

Когда вам удобно созвониться на этой неделе?`,

    `Добрый день! По поводу стоимости:

📊 Базовый тариф: 【XXX】₽/ед.
📊 При заказе от 1000 ед. — скидка 7%
📊 При заказе от 5000 ед. — индивидуальные условия

🚚 Доставка: 【авиа / ж/д / авто】
⏱ Срок: 【7-14 дней】с момента оплаты

Оплата: 50% предоплата, 50% перед отгрузкой.

Готовы обсудить детали? Пришлите точный объём, сделаю расчёт завтра.`
  ],

  greeting: [
    `Здравствуйте! 👋

Меня зовут 【Имя】, я менеджер компании 【Название】.

Чем могу помочь? Мы специализируемся на:
🎓 Обучении в России
📚 Курсах русского языка
🤝 Бизнес-коммуникациях

Буду рада ответить на ваши вопросы!`
  ],

  pricing: [
    `Здравствуйте! Цены на наши услуги:

📚 Курсы русского языка:
• Базовый — 22 000 ₽/мес
• Интенсив — 35 000 ₽/мес
• Индивидуально — 2 500 ₽/ак.ч
• Онлайн — 18 000 ₽/мес

🎓 Поступление под ключ:
• Консультация + подбор вуза — бесплатно
• Подготовка документов — от 15 000 ₽
• Визовая поддержка — от 8 000 ₽

💡 Есть пакетные предложения со скидкой до 20%.

Какая услуга вас интересует?`
  ]
}

function detectCategory(message: string): string {
  const text = message.toLowerCase()

  if (text.includes('多少钱') || text.includes('价格') || text.includes('цена') ||
      text.includes('стоимость') || text.includes('сколько стоит') || text.includes('прайс')) {
    return 'pricing'
  }

  if (text.includes('申请') || text.includes('入学') || text.includes('大学') ||
      text.includes('поступление') || text.includes('университет') || text.includes('бакалавр') ||
      text.includes('специальность') || text.includes('стипендия') || text.includes('диплом')) {
    return 'study_abroad'
  }

  if (text.includes('课程') || text.includes('培训') || text.includes('学俄语') ||
      text.includes('курс') || text.includes('обучение') || text.includes('урок') ||
      text.includes('занятие') || text.includes('преподаватель')) {
    return 'course'
  }

  if (text.includes('合作') || text.includes('订单') || text.includes('合同') ||
      text.includes('сотрудничество') || text.includes('заказ') || text.includes('контракт') ||
      text.includes('партнёр') || text.includes('доставка') || text.includes('логистика')) {
    return 'business'
  }

  if (text.includes('你好') || text.includes('hello') || text.includes('hi') ||
      text.includes('здравствуйте') || text.includes('привет') || text.includes('добрый')) {
    return 'greeting'
  }

  return 'study_abroad'
}

function getSuggestion(message: string): string {
  const category = detectCategory(message)
  const templates = REPLY_TEMPLATES[category] || REPLY_TEMPLATES.study_abroad
  return templates[Math.floor(Math.random() * templates.length)]
}

async function callDeepSeek(message: string): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是RusAI智能客服助手，帮助回复俄罗斯留学、俄语培训、中俄商务场景的客户消息。

客户发来一条消息，你需要生成一个专业、友好、地道的俄语回复。

回复规则：
1. 只返回俄语回复文本（不需要中文对照）
2. 语气友好专业
3. 用【】标记需要人工修改确认的占位内容（如日期、名字、价格等）
4. 如果客户用中文发消息，用俄语回复
5. 如果客户用俄语发消息，用俄语回复
6. 控制在150字以内，简洁有效`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 600
      }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    const data = await res.json()
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim()
    }
    return null
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, conversationId } = req.body || {}

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: '请提供消息内容 / Пожалуйста, укажите текст сообщения' })
  }

  const aiReply = await callDeepSeek(message.trim())
  if (aiReply) {
    return res.status(200).json({
      suggestion: aiReply,
      generatedBy: 'deepseek',
      conversationId: conversationId || null
    })
  }

  const suggestion = getSuggestion(message.trim())
  await new Promise(r => setTimeout(r, 200 + Math.random() * 400))

  return res.status(200).json({
    suggestion,
    generatedBy: 'mock',
    conversationId: conversationId || null
  })
}
