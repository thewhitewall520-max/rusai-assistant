// 語言映射表（ISO 639-1 → 語言名稱）
const LANG_NAMES = {
  zh: '中文', en: 'English', ru: 'Русский', ja: '日本語', ko: '한국어',
  fr: 'Français', de: 'Deutsch', es: 'Español', pt: 'Português', it: 'Italiano',
  ar: 'العربية', hi: 'हिन्दी', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', ta: 'தமிழ்',
  th: 'ไทย', vi: 'Tiếng Việt', ms: 'Bahasa Melayu', id: 'Bahasa Indonesia',
  tl: 'Filipino', my: 'မြန်မာဘာသာ', km: 'ភាសាខ្មែរ', lo: 'ລາວ', mn: 'Монгол',
  ne: 'नेपाली', si: 'සිංහල', ur: 'اردو', fa: 'فارسی', he: 'עברית',
  tr: 'Türkçe', kk: 'Қазақ', uz: 'Oʻzbek', ky: 'Кыргызча', tg: 'Тоҷикӣ',
  az: 'Azərbaycan', hy: 'Հայերեն', ka: 'ქართული', el: 'Ελληνικά',
  pl: 'Polski', cs: 'Čeština', sk: 'Slovenčina', hu: 'Magyar',
  ro: 'Română', bg: 'Български', sr: 'Српски', hr: 'Hrvatski',
  sl: 'Slovenščina', et: 'Eesti', lv: 'Latviešu', lt: 'Lietuvių',
  uk: 'Українська', be: 'Беларуская', nl: 'Nederlands', sv: 'Svenska',
  no: 'Norsk', da: 'Dansk', fi: 'Suomi', is: 'Íslenska', ga: 'Gaeilge',
  sw: 'Kiswahili', ha: 'Hausa', yo: 'Yorùbá', ig: 'Igbo', zu: 'isiZulu',
  af: 'Afrikaans', am: 'አማርኛ', so: 'Soomaali',
}

const LANGUAGES = Object.entries(LANG_NAMES).map(([code, name]) => ({ code, name }))

// 每日用量限制
const DAILY_LIMIT = 10
const ipUsage = new Map()
const getDailyKey = (ip) => {
  const today = new Date().toISOString().split('T')[0]
  return `${ip}:${today}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const { mode, text, tone, target, sourceLang = 'zh', targetLang = 'ru' } = req.body
  if (!text) return res.status(400).json({ error: '请输入内容' })

  // 用量限制
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.socket.remoteAddress || 'unknown'
  const key = getDailyKey(ip)
  const count = ipUsage.get(key) || 0
  if (count >= DAILY_LIMIT) {
    return res.status(429).json({ error: '每日免费次数已用完，请登录后继续使用' })
  }

  const srcName = LANG_NAMES[sourceLang] || sourceLang
  const tgtName = LANG_NAMES[targetLang] || targetLang
  const isRewrite = sourceLang === targetLang

  try {
    const systemPrompts = {
      translate: isRewrite
        ? `你是一个专业的${srcName}写作优化专家。请对用户输入的${srcName}内容进行优化和扩写。
要求：
1. 保持原意，优化表达方式，使其更地道、更流畅
2. 适当扩写，增加细节和修饰
3. 用【】标记可以自定义调整的部分
4. 输出优化后的原文和修改说明

输出格式：

=== 优化后 ===
[优化扩写后的${srcName}内容]

=== 修改说明 ===
[简要说明做了哪些优化]`

        : `你是一个专业的多语言翻译专家。请将用户输入的内容从${srcName}翻译成${tgtName}，语气要求：${tone}。
要求：
1. 翻译要地道自然，符合${tgtName}母语者的表达习惯，不要直译
2. 同时输出${tgtName}原文和${srcName}对照
3. 用【】标记需要用户自定义修改的占位内容，并在对照中写明它的含义

输出格式（严格按此格式）：

=== ${tgtName} ===
[${tgtName}翻译结果]

=== ${srcName}对照 ===
[与${tgtName}逐句对应的${srcName}翻译]`,
      
      email: `你是一个专业的俄语邮件写作专家。请根据用户的需求生成一封完整的俄语邮件。
收件人：${target}
语气：${tone}
要求：
1. 包含俄语邮件的标准格式（称呼、正文、结束语）
2. 用【】标记所有需要用户自定义填写的占位部分
3. 输出俄语原文和中文翻译的双语版本

输出格式：

=== 俄语 ===
[俄语邮件正文]

=== 中文对照 ===
[逐句中文翻译]`,
      
      optimize: `你是一个俄语表达优化专家。请优化用户输入的俄语句子。
要求：
1. 保持原意，优化语法和用词
2. 区分原句和优化版
3. 附上中文对照

输出格式：

=== 原句 ===
[用户输入的原始句子]

=== 优化后 ===
[优化后的版本]

=== 中文对照 ===
[中文翻译]`,
      
      academic: `你是一个俄语学术写作专家。请将用户输入的意思，用俄语生成3种不同的学术表达方式。
要求：
1. 表达要正式、学术、地道
2. 每种表达式附中文翻译

输出格式：

=== 俄语 ===
1. [第一种表达]
2. [第二种表达]
3. [第三种表达]

=== 中文对照 ===
1. [第一种的中文翻译]
2. [第二种的中文翻译]
3. [第三种的中文翻译]`
    }

    const systemPrompt = systemPrompts[mode] || systemPrompts.translate

    let deducted = false
    const OLLAMA_URL = 'http://127.0.0.1:11434/v1/chat/completions'
    const deepseekFallback = async () => {
      const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
      if (!DEEPSEEK_KEY) return res.status(500).json({ error: 'API 密钥未配置' })
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_KEY}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })
      const data = await dsRes.json()
      if (data.choices && data.choices[0]) {
        if (!deducted) { ipUsage.set(key, count + 1); deducted = true }
        res.status(200).json({ result: data.choices[0].message.content })
      } else {
        console.error('API error:', data)
        res.status(500).json({ error: 'API调用失败' })
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      const ollamaRes = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5:7b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!ollamaRes.ok) { console.warn('Ollama 返回非 200'); return deepseekFallback() }
      const ollamaData = await ollamaRes.json()
      if (ollamaData.choices && ollamaData.choices[0]) {
        if (!deducted) { ipUsage.set(key, count + 1); deducted = true }
        res.status(200).json({ result: ollamaData.choices[0].message.content })
      } else { return deepseekFallback() }
    } catch (ollamaErr) {
      console.warn('Ollama 不可用，降级到 DeepSeek:', ollamaErr.message)
      return deepseekFallback()
    }
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: '服务器错误' })
  }
}

// 導出語言列表供前端使用
export { LANGUAGES }
