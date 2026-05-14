export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { mode, input, output, sourceLang, targetLang, rating } = req.body
  if (!mode || !rating) return res.status(400).json({ error: 'Missing fields' })

  // 存入 localStorage 风格的简单日志
  // 后续 Sprint 2 会迁移到 PostgreSQL
  console.log(JSON.stringify({
    type: 'feedback',
    timestamp: new Date().toISOString(),
    mode, input, output, sourceLang, targetLang, rating
  }))

  res.status(200).json({ success: true })
}
