export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  
  const { mode, text, tone, target } = req.body
  if (!text) return res.status(400).json({ error: '请输入内容' })

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

    // Use DeepSeek API (we have it configured)
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-ac09fe11f4db4009a1afe9ab410073b5`
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

    const data = await response.json()
    
    if (data.choices && data.choices[0]) {
      res.status(200).json({ result: data.choices[0].message.content })
    } else {
      console.error('API error:', data)
      res.status(500).json({ error: 'API调用失败' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: '服务器错误' })
  }
}
