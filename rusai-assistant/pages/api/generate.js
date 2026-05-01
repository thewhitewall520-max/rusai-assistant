// 每日用量限制（後端記憶體計數，伺服器重啟重置）
const DAILY_LIMIT = 10
const ipUsage = new Map()
const getDailyKey = (ip) => {
  const today = new Date().toISOString().split('T')[0]
  return `${ip}:${today}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const { mode, text, tone, target } = req.body
  if (!text) return res.status(400).json({ error: '请输入内容' })

  // 後端用量限制（非登入用戶）
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.socket.remoteAddress || 'unknown'
  const key = getDailyKey(ip)
  const count = ipUsage.get(key) || 0
  if (count >= DAILY_LIMIT) {
    return res.status(429).json({ error: '每日免费次数已用完，请登录后继续使用' })
  }

  try {
    const systemPrompts = {
      translate: `你是一个专业的中俄翻译专家。请将用户输入的内容翻译成俄语，语气要求：${tone}。
要求：翻译要地道自然，符合俄语母语者的表达习惯，不要直译。
只输出翻译结果，不要加解释。`,
      
      email: `你是一个专业的俄语邮件写作专家。请根据用户的需求生成一封完整的俄语邮件。
收件人：${target}
语气：${tone}
要求：包含俄语邮件的标准格式（称呼、正文、结束语），语气要符合${tone}的标准。只输出俄语邮件正文。`,
      
      optimize: `你是一个俄语表达优化专家。请优化用户输入的俄语句子，使其更地道、更自然。
要求：保持原意，优化语法和用词，输出优化后的版本。
格式：先写"原句："然后是原句，再写"优化后："然后是优化版本。`,
      
      academic: `你是一个俄语学术写作专家。请将用户输入的中文意思，用俄语生成3种不同的学术表达方式。
适合论文或学术报告使用。
要求：表达要正式、学术、地道。输出格式：
1. [第一种表达]
2. [第二种表达]
3. [第三种表达]`
    }

    const systemPrompt = systemPrompts[mode] || systemPrompts.translate

    // 扣除一次次数（只有在成功生成後才算）
    let deducted = false

    // 1) 嘗試本地 Ollama
    const OLLAMA_URL = 'http://127.0.0.1:11434/v1/chat/completions'
    const deepseekFallback = async () => {
      const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY
      if (!DEEPSEEK_KEY) {
        return res.status(500).json({ error: 'API 密钥未配置' })
      }

      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_KEY}`
        },
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

      if (!ollamaRes.ok) {
        console.warn('Ollama 返回非 200，降级到 DeepSeek')
        return deepseekFallback()
      }

      const ollamaData = await ollamaRes.json()

      if (ollamaData.choices && ollamaData.choices[0]) {
        if (!deducted) { ipUsage.set(key, count + 1); deducted = true }
        res.status(200).json({ result: ollamaData.choices[0].message.content })
      } else {
        console.warn('Ollama 响应格式异常，降级到 DeepSeek')
        return deepseekFallback()
      }
    } catch (ollamaErr) {
      console.warn('Ollama 不可用（超时或连接失败），降级到 DeepSeek:', ollamaErr.message)
      return deepseekFallback()
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: '服务器错误' })
  }
}
