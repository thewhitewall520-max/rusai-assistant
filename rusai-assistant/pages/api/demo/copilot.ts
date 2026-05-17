import type { NextApiRequest, NextApiResponse } from 'next'

/* ──────────────────────────────────────────────────
   RusAI Copilot v2 — Quick Action Scenes + AI Engine
   ────────────────────────────────────────────────── */

interface CopilotRequest {
  input?: string
  scene?: string
  tone?: 'professional' | 'friendly' | 'urgent'
  lang?: 'zh' | 'ru' | 'bilingual'
}

interface CopilotResponse {
  result?: string
  intent?: string
  confidence?: number
  quickActions?: string[]
  error?: string
}

/* ── Quick-action scenario templates (fallback when DeepSeek unavailable) ── */

const QUICK_ACTION_TEMPLATES: Record<string, { cn: string; ru: string }> = {
  enrollment_reply: {
    cn: `🎓 招生回复（中俄双语）

您好！感谢您对我们学校的关注。

关于【课程/专业名称】的申请，以下是您需要了解的信息：

📋 申请流程：
1. 提交在线申请表
2. 上传学历证明及翻译件
3. 提供护照复印件
4. 等待录取通知（约2-3周）

💰 学费：每年【XX万】卢布起
📅 截止日期：【2026年X月X日】

需要我帮您进一步了解课程详情或安排试听课吗？😊

=== RU ===
Здравствуйте! Благодарим вас за интерес к нашей программе.

Информация о поступлении на 【название программы】:

📋 Процесс подачи:
1. Заполнение онлайн-заявки
2. Загрузка документа об образовании с переводом
3. Копия паспорта
4. Ожидание приглашения (≈ 2–3 недели)

💰 Стоимость: от 【XX тыс.】 ₽/год
📅 Крайний срок: 【ДД.ММ.ГГГГ 2026】

Хотите записаться на пробное занятие или получить консультацию? 😊`,
    ru: `🎓 Ответ о поступлении

Здравствуйте! Благодарим вас за интерес к нашей программе.

Информация о поступлении на 【название программы】:

📋 Процесс подачи:
1. Заполнение онлайн-заявки
2. Загрузка документа об образовании с переводом
3. Копия паспорта
4. Ожидание приглашения (≈ 2–3 недели)

💰 Стоимость: от 【XX тыс.】 ₽/год
📅 Крайний срок: 【ДД.ММ.ГГГГ 2026】

Хотите записаться на пробное занятие или получить консультацию? 😊`,
  },

  material_checklist: {
    cn: `📋 留学申请材料清单（2026版）

一、必备材料：
☐ 护照原件 + 公证翻译件
☐ 最高学历证书（毕业证/学位证）+ 公证翻译
☐ 成绩单 + 公证翻译
☐ 体检证明（086/у格式）
☐ 6张3×4cm彩色照片（白底）
☐ 俄语水平证书（如有），或预科课程录取通知

二、选备材料：
☐ 推荐信（1-2封）
☐ 个人陈述/动机信
☐ 作品集（艺术/设计类专业）
☐ 银行存款证明（≥ 【XX万】卢布/年）

三、签证材料：
☐ 签证申请表
☐ 邀请函（大学出具）
☐ 医疗保险（覆盖在俄期间）
☐ 签证照片

📌 提示：所有中文材料需提供公证翻译成俄语。
📅 建议提前4-6个月开始准备。

=== RU ===
📋 Список документов для поступления — 2026

Ⅰ. Обязательные документы:
☐ Загранпаспорт + нотариально заверенный перевод
☐ Документ об образовании + нотариальный перевод
☐ Табель успеваемости + перевод
☐ Медицинская справка 086/у
☐ 6 цветных фото 3×4 см (белый фон)
☐ Сертификат о знании русского (если есть), или приглашение на подкурсы

Ⅱ. Дополнительно:
☐ Рекомендательные письма (1–2)
☐ Мотивационное письмо
☐ Портфолио (для творческих специальностей)
☐ Банковская справка (≥ 【XX тыс.】 ₽/год)

Ⅲ. Для визы:
☐ Визовая анкета
☐ Приглашение от вуза
☐ Медицинская страховка
☐ Фото на визу

📌 Рекомендуем начинать подготовку за 4–6 месяцев.`,
    ru: `📋 Список документов для поступления — 2026

Ⅰ. Обязательные документы:
☐ Загранпаспорт + нотариально заверенный перевод
☐ Документ об образовании + нотариальный перевод
☐ Табель успеваемости + перевод
☐ Медицинская справка 086/у
☐ 6 цветных фото 3×4 см (белый фон)
☐ Сертификат о знании русского (если есть), или приглашение на подкурсы

Ⅱ. Дополнительно:
☐ Рекомендательные письма (1–2)
☐ Мотивационное письмо
☐ Портфолио (для творческих специальностей)
☐ Банковская справка (≥ 【XX тыс.】 ₽/год)

Ⅲ. Для визы:
☐ Визовая анкета
☐ Приглашение от вуза
☐ Медицинская страховка
☐ Фото на визу

📌 Рекомендуем начинать подготовку за 4–6 месяцев.`,
  },

  bilingual_consult: {
    cn: `💬 中俄双语咨询回复

感谢您的咨询！以下是详细解答：

您提出的问题我们已仔细了解，解答如下：

【根据客户具体问题进行个性化回复】

如果您还有其他疑问，请随时联系我们！

📞 咨询热线：【电话号码】
📱 微信：【微信号】
🌐 官网：rusai.cc

=== RU ===
💬 Консультация на двух языках

Благодарим за ваш вопрос! Подробный ответ ниже:

Мы внимательно изучили ваш запрос. Вот что можем предложить:

【Персонализированный ответ на вопрос клиента】

Если остались вопросы — мы на связи!

📞 Телефон: 【номер】
📱 WeChat: 【wechat_id】
🌐 Сайт: rusai.cc`,
    ru: `💬 Консультация на двух языках

Благодарим за ваш вопрос! Подробный ответ ниже:

Мы внимательно изучили ваш запрос. Вот что можем предложить:

【Персонализированный ответ на вопрос клиента】

Если остались вопросы — мы на связи!

📞 Телефон: 【номер】
📱 WeChat: 【wechat_id】
🌐 Сайт: rusai.cc`,
  },

  quotation: {
    cn: `💰 报价单（俄语模板）

📦 商业报价
日期：【YYYY年MM月DD日】

尊敬的【客户姓名/公司名称】：

感谢您的询价！现提供以下报价方案：

服务/产品：【服务名称】
数量：【XX】
单价：【XX】卢布
总价：【XX】卢布

包含内容：
✅ 【服务项1】
✅ 【服务项2】
✅ 【服务项3】

支付方式：
• 预付50%，交工前付清50%
• 支持银行转账 / UnionPay / СБП

有效期至：【YYYY年MM月DD日】

期待与您的合作！

=== RU ===
💰 Коммерческое предложение

📦 Коммерческое предложение
Дата: 【ДД.ММ.ГГГГ】

Уважаемый/ая 【Имя / Компания】!

Благодарим за запрос. Предлагаем следующие условия:

Услуга / Продукт: 【наименование】
Количество: 【XX】
Цена за единицу: 【XX】 ₽
Итого: 【XX】 ₽

В стоимость включено:
✅ 【пункт 1】
✅ 【пункт 2】
✅ 【пункт 3】

Условия оплаты:
• 50% предоплата, 50% перед сдачей
• Банковский перевод / UnionPay / СБП

Действует до: 【ДД.ММ.ГГГГ】

Будем рады сотрудничеству!`,
    ru: `💰 Коммерческое предложение

📦 Коммерческое предложение
Дата: 【ДД.ММ.ГГГГ】

Уважаемый/ая 【Имя / Компания】!

Благодарим за запрос. Предлагаем следующие условия:

Услуга / Продукт: 【наименование】
Количество: 【XX】
Цена за единицу: 【XX】 ₽
Итого: 【XX】 ₽

В стоимость включено:
✅ 【пункт 1】
✅ 【пункт 2】
✅ 【пункт 3】

Условия оплаты:
• 50% предоплата, 50% перед сдачей
• Банковский перевод / UnionPay / СБП

Действует до: 【ДД.ММ.ГГГГ】

Будем рады сотрудничеству!`,
  },

  after_sales: {
    cn: `🔄 售后回复（标准话术）

亲爱的【客户姓名】：

感谢您的反馈！我们非常重视每一位客户的使用体验。

针对您提到的问题，我们的处理方案如下：

1️⃣ 【处理步骤1】
2️⃣ 【处理步骤2】
3️⃣ 【后续跟进计划】

如有任何其他问题，请随时联系我们。我们会在24小时内响应。

再次感谢您的理解与信任！🙏

=== RU ===
🔄 Послепродажное обслуживание

Уважаемый/ая 【Имя】!

Благодарим за ваш отзыв! Качество обслуживания — наш приоритет.

По вашему вопросу предлагаем следующее решение:

1️⃣ 【Шаг 1】
2️⃣ 【Шаг 2】
3️⃣ 【Дальнейший план】

Если останутся вопросы — мы на связи 24/7.

Спасибо за понимание и доверие! 🙏`,
    ru: `🔄 Послепродажное обслуживание

Уважаемый/ая 【Имя】!

Благодарим за ваш отзыв! Качество обслуживания — наш приоритет.

По вашему вопросу предлагаем следующее решение:

1️⃣ 【Шаг 1】
2️⃣ 【Шаг 2】
3️⃣ 【Дальнейший план】

Если останутся вопросы — мы на связи 24/7.

Спасибо за понимание и доверие! 🙏`,
  },

  logistics: {
    cn: `📦 物流状态回复（俄语）

您好！关于您的订单物流状态：

📋 订单号：【XXXXX】
📦 状态：已发货 / 运输中 / 已到达目的地
🚚 运输方式：航空 / 铁路 / 公路
📅 预计到达：【YYYY年MM月DD日】
📍 当前位置：【城市/站点】

追踪链接：【物流查询链接】

通常情况下，从中国到俄罗斯的运输时间为：
• 航空：5-10个工作日
• 铁路：15-25个工作日
• 公路：20-35个工作日

如有延误，通常是由于【海关查验/天气/节假日】原因，请耐心等待。我们会持续关注物流进展。

=== RU ===
📦 Статус доставки

Здравствуйте! Информация о вашем заказе:

📋 Номер заказа: 【XXXXX】
📦 Статус: Отправлен / В пути / Прибыл в пункт назначения
🚚 Способ доставки: Авиа / Ж/Д / Авто
📅 Ожидаемая дата: 【ДД.ММ.ГГГГ】
📍 Текущее местоположение: 【город / склад】

Ссылка для отслеживания: 【ссылка】

Средние сроки доставки Китай → Россия:
• Авиа: 5–10 рабочих дней
• Ж/Д: 15–25 рабочих дней
• Авто: 20–35 рабочих дней

Задержки обычно связаны с 【таможня / погода / праздники】. Мы следим за статусом и уведомим вас об изменениях.`,
    ru: `📦 Статус доставки

Здравствуйте! Информация о вашем заказе:

📋 Номер заказа: 【XXXXX】
📦 Статус: Отправлен / В пути / Прибыл в пункт назначения
🚚 Способ доставки: Авиа / Ж/Д / Авто
📅 Ожидаемая дата: 【ДД.ММ.ГГГГ】
📍 Текущее местоположение: 【город / склад】

Ссылка для отслеживания: 【ссылка】

Средние сроки доставки Китай → Россия:
• Авиа: 5–10 рабочих дней
• Ж/Д: 15–25 рабочих дней
• Авто: 20–35 рабочих дней

Задержки обычно связаны с 【таможня / погода / праздники】. Мы следим за статусом и уведомим вас об изменениях.`,
  },
}

/* ── Intent detection ── */

function detectIntent(input: string): { intent: string; confidence: number } {
  const text = input.toLowerCase()

  if (text.includes('报价') || text.includes('цена') || text.includes('стоимость') ||
      text.includes('quotation') || text.includes('прайс') || text.includes('сколько стоит')) {
    return { intent: 'quotation_request', confidence: 0.95 }
  }
  if (text.includes('售后') || text.includes('投诉') || text.includes('不满意') ||
      text.includes('жалоб') || text.includes('возврат') || text.includes('проблем') ||
      text.includes('не работает') || text.includes('брак')) {
    return { intent: 'after_sales', confidence: 0.92 }
  }
  if (text.includes('物流') || text.includes('快递') || text.includes('运输') ||
      text.includes('доставк') || text.includes('отслеживани') || text.includes('трекинг') ||
      text.includes('где заказ') || text.includes('когда придет')) {
    return { intent: 'logistics_inquiry', confidence: 0.94 }
  }
  if (text.includes('材料') || text.includes('документ') || text.includes('список') ||
      text.includes('清单') || text.includes('нужно') || text.includes('подготовить') ||
      text.includes('перечень')) {
    return { intent: 'material_checklist', confidence: 0.9 }
  }
  if (text.includes('招生') || text.includes('申请') || text.includes('入学') ||
      text.includes('大学') || text.includes('поступление') || text.includes('университет') ||
      text.includes('бакалавр') || text.includes('специальность') || text.includes('стипендия')) {
    return { intent: 'enrollment_inquiry', confidence: 0.93 }
  }
  if (text.includes('课程') || text.includes('курс') || text.includes('培训') ||
      text.includes('学俄语') || text.includes('обучение') || text.includes('репетитор')) {
    return { intent: 'course_inquiry', confidence: 0.88 }
  }
  if (text.includes('合作') || text.includes('订单') || text.includes('合同') ||
      text.includes('сотрудничество') || text.includes('заказ') || text.includes('партнёр') ||
      text.includes('контракт')) {
    return { intent: 'business_cooperation', confidence: 0.91 }
  }

  return { intent: 'general_inquiry', confidence: 0.7 }
}

function getQuickActionSuggestions(intent: string): string[] {
  const map: Record<string, string[]> = {
    enrollment_inquiry: ['🎓 生成招生回复', '📋 生成材料清单', '💬 回复俄语咨询'],
    course_inquiry: ['🎓 生成招生回复', '💬 回复俄语咨询', '💰 生成报价'],
    quotation_request: ['💰 生成报价', '🔄 售后回复', '📦 物流解释'],
    after_sales: ['🔄 售后回复', '💰 生成报价', '📋 生成材料清单'],
    logistics_inquiry: ['📦 物流解释', '🔄 售后回复', '💰 生成报价'],
    material_checklist: ['📋 生成材料清单', '🎓 生成招生回复', '💬 回复俄语咨询'],
    business_cooperation: ['💰 生成报价', '🔄 售后回复', '📦 物流解释'],
    general_inquiry: ['💬 回复俄语咨询', '🎓 生成招生回复', '💰 生成报价'],
  }
  return map[intent] || map.general_inquiry
}

/* ── DeepSeek API call ── */

async function callDeepSeek(systemPrompt: string, userMessage: string): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

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
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await res.json()
    if (data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content
    }
    return null
  } catch {
    return null
  }
}

/* ── Build scene-specific system prompt ── */

function buildSystemPrompt(scene: string): string {
  const base = `你是专业的中俄双语商务助理（RusAI Business Copilot v2）。

回复规则：
1. 先输出俄语部分，用 === RU === 开头
2. 再输出中文对照，用 === 中文对照 === 开头
3. 俄语地道自然、符合母语者习惯
4. 中文准确对应
5. 用【】标记需要用户自定义的占位内容
6. 使用 emoji 增强可读性
7. 简洁专业，控制篇幅`

  const sceneAddons: Record<string, string> = {
    enrollment_reply: `${base}\n场景：留学招生回复。回复应包含申请流程、材料要求、学费范围、截止日期。语气友好热情。`,
    material_checklist: `${base}\n场景：留学申请材料清单。用checkbox清单格式列出必备材料和选备材料，分类整理。`,
    bilingual_consult: `${base}\n场景：中俄双语综合咨询。针对用户的具体问题生成个性化回复，用中俄双语。`,
    quotation: `${base}\n场景：商业报价。输出正式的俄语报价模板，包含服务描述、价格、包含内容、支付方式、有效期。`,
    after_sales: `${base}\n场景：售后话术。专业、安抚性回复，提供解决方案和后续跟进承诺。语气诚恳温暖。`,
    logistics: `${base}\n场景：物流状态解释。提供订单追踪信息、运输方式、预计时效。如遇延误给出合理说明。`,
  }

  return sceneAddons[scene] || base
}

/* ── Handler ── */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CopilotResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input, scene } = (req.body || {}) as CopilotRequest

  // Quick-action scene (button click) — no input needed
  if (scene && QUICK_ACTION_TEMPLATES[scene]) {
    // Try DeepSeek first for richer output
    const systemPrompt = buildSystemPrompt(scene)
    const userMsg = `场景：${scene}。请生成专业的回复内容。`
    const aiResult = await callDeepSeek(systemPrompt, userMsg)

    if (aiResult) {
      const intent = detectIntent(scene)
      return res.status(200).json({
        result: aiResult,
        intent: intent.intent,
        confidence: intent.confidence,
        quickActions: getQuickActionSuggestions(intent.intent),
      })
    }

    // Fallback to templates
    const tmpl = QUICK_ACTION_TEMPLATES[scene]
    const result = tmpl.cn
    const intent = detectIntent(scene)

    return res.status(200).json({
      result,
      intent: intent.intent,
      confidence: intent.confidence,
      quickActions: getQuickActionSuggestions(intent.intent),
    })
  }

  // Free-text input mode
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: '请输入内容 / Пожалуйста, введите текст' })
  }

  const intent = detectIntent(input.trim())
  const systemPrompt = `你是一个专业的中俄双语商务助理。

用户输入：${input.trim()}
检测意图：${intent.intent} (置信度: ${(intent.confidence * 100).toFixed(0)}%)

回复格式要求：
=== RU ===
[俄语回复内容]

=== 中文对照 ===
[对应的中文内容]

要求：
- 俄语地道自然、符合母语者习惯
- 中文准确对应
- 用【】标记需要用户自定义的占位内容
- 简洁专业，善用 emoji`

  const aiResult = await callDeepSeek(systemPrompt, input.trim())

  if (aiResult) {
    return res.status(200).json({
      result: aiResult,
      intent: intent.intent,
      confidence: intent.confidence,
      quickActions: getQuickActionSuggestions(intent.intent),
    })
  }

  // Ultimate fallback — generic template
  const template = QUICK_ACTION_TEMPLATES.bilingual_consult
  return res.status(200).json({
    result: template.cn,
    intent: intent.intent,
    confidence: intent.confidence,
    quickActions: getQuickActionSuggestions(intent.intent),
  })
}
