import prisma from "../../lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import { LANG_NAMES } from '../../lib/langMap'

// 每日用量限制
const DAILY_LIMIT = 10

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const { mode, text, tone, target, sourceLang = 'zh', targetLang = 'ru' } = req.body
  if (!text) return res.status(400).json({ error: '请输入内容' })

  const session = await getServerSession(req, res, authOptions)
  const isAuthed = !!session
  const today = new Date().toISOString().split('T')[0]
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.socket.remoteAddress || 'unknown'

  let usage = await prisma.usage.findUnique({
    where: { ip_date: { ip, date: today } }
  })
  const count = usage?.count || 0
  if (!isAuthed && count >= DAILY_LIMIT) {
    return res.status(429).json({ error: '每日免费次数已用完，请登录后继续使用', remaining: 0 })
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
      
      email: `你是一个${tgtName}邮件写作专家。根据用户需求生成${tgtName}邮件。
收件人：${target}
语气：${tone}
要求：包含标准邮件格式（称呼、正文、结束语），语气${tone}。用【】标记占位内容。
输出格式：
=== ${tgtName} ===
[${tgtName}邮件正文]
=== 中文对照 ===
[逐句中文翻译]`,
      
      optimize: `你是一个${tgtName}表达优化专家。优化用户输入的${tgtName}句子。
要求：保持原意，优化语法和用词，输出优化后的版本，附上中文对照。
输出格式：
=== ${tgtName} ===
[优化后的版本]
=== 中文对照 ===
[中文翻译]`,
      
      academic: `你是一个${tgtName}学术写作专家。用${tgtName}生成3种不同的学术表达方式。
要求：表达正式、学术、地道。
输出格式：
=== ${tgtName} ===
1. [第一种表达] 2. [第二种] 3. [第三种]
=== 中文对照 ===
1. [中文] 2. [中文] 3. [中文]`,
      
      idiomatic: `你是${tgtName}地道表达判定专家。
判断用户输入的${tgtName}句子是否地道自然。
如果不地道，给出修改建议、重写版本和中文解释。
输出格式：
=== 地道判定 ===
✅ 地道 / ❌ 不够地道

=== 修改建议 ===
[改进建议]

=== 优化后 ===
[重写的自然表达]

=== 中文解释 ===
[中文解释]`
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
        if (!deducted) {
          usage = await prisma.usage.upsert({
            where: { ip_date: { ip, date: today } },
            create: { ip, date: today, count: 1 },
            update: { count: { increment: 1 } }
          })
          deducted = true
        }
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
        if (!deducted) {
          usage = await prisma.usage.upsert({
            where: { ip_date: { ip, date: today } },
            create: { ip, date: today, count: 1 },
            update: { count: { increment: 1 } }
          })
          deducted = true
        }
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
