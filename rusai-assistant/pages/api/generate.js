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
要求：
1. 翻译要地道自然，符合俄语母语者的表达习惯，不要直译
2. 同时输出俄语和中文对照
3. 用【】标记需要用户自定义修改的占位内容，并在中文对照中写明它的含义

输出格式如下（严格按此格式）：

=== 俄语 ===
[俄语翻译结果]

=== 中文对照 ===
[中文翻译，与俄语逐句对应。例如：Уважаемый профессор【Фамилия】对应为：尊敬的教授【姓氏，请填写】]`,
      
      email: `你是一个专业的俄语邮件写作专家。请根据用户的需求生成一封完整的俄语邮件。
收件人：${target}
语气：${tone}
要求：
1. 包含俄语邮件的标准格式（称呼、正文、结束语），语气要符合${tone}的标准
2. 用【】标记所有需要用户自定义填写的占位部分（如姓名、日期、具體原因等）
3. 同时在中文对照中解释每个占位的含义
4. 输出俄语原文和中文翻译的双语版本

输出格式如下（严格按此格式）：

=== 俄语 ===
[俄语邮件正文，用【】标记占位内容]

=== 中文对照 ===
[逐句中文翻译，解釋每個【】占位的含義]`,
      
      optimize: `你是一个俄语表达优化专家。请优化用户输入的俄语句子，使其更地道、更自然。
要求：
1. 保持原意，优化语法和用词
2. 同时输出俄语优化版本和中文对照
3. 用【】标记优化后仍需要用户调整的占位

输出格式如下（严格按此格式）：

=== 原句 ===
[用户输入的原始俄语句子]

=== 优化后（俄语） ===
[优化后的俄语版本]

=== 中文对照 ===
[优化部分的逐句中文翻译]`,
      
      academic: `你是一个俄语学术写作专家。请将用户输入的中文意思，用俄语生成3种不同的学术表达方式。
适合论文或学术报告使用。
要求：
1. 表达要正式、学术、地道
2. 每一种表达都附上中文翻译
3. 用【】标记需要自定义的部分

输出格式如下（严格按此格式）：

=== 俄语 ===
1. [第一种学术表达]
2. [第二种学术表达]
3. [第三种学术表达]

=== 中文对照 ===
1. [第一种的中文翻译]
2. [第二种的中文翻译]
3. [第三种的中文翻译]`
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
