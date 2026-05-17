import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Demo.module.css'

/* ──────────────────────────────────────────
   Mock Data
   ────────────────────────────────────────── */

const CONVERSATIONS = [
  {
    id: 'c1',
    name: '陈晓',
    platform: '微信',
    lastMsg: '老师，请问预科俄语课程什么时候开课？',
    time: '10:32',
    unread: true,
    messages: [
      { id: 'm1', text: '你好，请问是俄语课程咨询吗？', sender: 'agent', time: '10:00' },
      { id: 'm2', text: '是的老师！我想了解一下预科俄语课程', sender: 'user', time: '10:01' },
      { id: 'm3', text: '好的，我们目前有暑期预科班和秋季预科班，您大概什么时间方便上课？', sender: 'agent', time: '10:05' },
      { id: 'm4', text: '我9月份要去莫斯科国立大学，想提前学一些俄语基础', sender: 'user', time: '10:08' },
      { id: 'm5', text: '那暑期预科班非常适合您！7月初开课，每周一三五晚上，共8周。另外赠送免费试听课。', sender: 'agent', time: '10:12' },
      { id: 'm6', text: '请问预科俄语课程什么时候开课？', sender: 'user', time: '10:32' },
    ],
  },
  {
    id: 'c2',
    name: 'Анна Петрова',
    platform: 'Telegram',
    lastMsg: 'Спасибо за помощь с документами!',
    time: '昨天',
    unread: false,
    messages: [
      { id: 'm2-1', text: 'Здравствуйте! Нужна помощь с переводом документов', sender: 'user', time: '昨天 14:00' },
      { id: 'm2-2', text: 'Здравствуйте, Анна! Конечно, какие документы нужно перевести?', sender: 'agent', time: '昨天 14:05' },
      { id: 'm2-3', text: 'Диплом и рекомендательное письмо', sender: 'user', time: '昨天 14:10' },
      { id: 'm2-4', text: 'Переведём за 2-3 рабочих дня. Стоимость 1500₽ за страницу.', sender: 'agent', time: '昨天 14:15' },
      { id: 'm2-5', text: 'Спасибо за помощь с документами!', sender: 'user', time: '昨天 16:00' },
    ],
  },
  {
    id: 'c3',
    name: '李明浩',
    platform: '小红书',
    lastMsg: '签证邀请函多久能下来？',
    time: '昨天',
    unread: true,
    messages: [
      { id: 'm3-1', text: '你好！我看到你们有留学俄罗斯服务，想咨询一下', sender: 'user', time: '昨天 20:00' },
      { id: 'm3-2', text: '你好李明浩！是的，我们提供全方位的俄罗斯留学服务 🎯', sender: 'agent', time: '昨天 20:02' },
      { id: 'm3-3', text: '签证邀请函多久能下来？', sender: 'user', time: '昨天 20:05' },
    ],
  },
  {
    id: 'c4',
    name: '王芳',
    platform: '微信',
    lastMsg: '能帮我写一封俄语邮件给导师吗？',
    time: '周一',
    unread: false,
    messages: [
      { id: 'm4-1', text: '老师好，我是王芳，现在在莫斯科读研', sender: 'user', time: '周一 09:30' },
      { id: 'm4-2', text: '王芳你好！在莫斯科还习惯吗？😊', sender: 'agent', time: '周一 09:32' },
      { id: 'm4-3', text: '还行，就是写俄语邮件有点头疼', sender: 'user', time: '周一 09:35' },
      { id: 'm4-4', text: '可以帮你呀！需要什么场景的俄语邮件？', sender: 'agent', time: '周一 09:36' },
      { id: 'm4-5', text: '能帮我写一封俄语邮件给导师吗？想申请延期交论文', sender: 'user', time: '周一 09:38' },
    ],
  },
  {
    id: 'c5',
    name: 'Ольга Смирнова',
    platform: 'Telegram',
    lastMsg: 'Есть ли у вас курсы китайского для русских?',
    time: '周一',
    unread: false,
    messages: [
      { id: 'm5-1', text: 'Добрый день! Интересуют курсы китайского языка', sender: 'user', time: '周一 11:00' },
      { id: 'm5-2', text: 'Добрый день, Ольга! Да, у нас есть курсы китайского для русскоязычных студентов 🇨🇳', sender: 'agent', time: '周一 11:05' },
      { id: 'm5-3', text: 'Есть ли у вас курсы китайского для русских?', sender: 'user', time: '周一 11:10' },
    ],
  },
]

const INITIAL_FAQS = [
  { id: 'f1', question: '俄罗斯留学需要什么条件？', answer: '需要高中或以上学历，通过俄语水平测试（至少达到A2水平），提供健康证明和资金证明。具体院校和要求不同，欢迎详询！' },
  { id: 'f2', question: '俄语预科课程多长时间？', answer: '标准预科课程为8个月（9月-次年5月），暑期强化班为2个月（7月-8月），每周6-8课时。完成预科后可达A2-B1水平。' },
  { id: 'f3', question: '签证办理需要多长时间？', answer: '签证邀请函大约2-3周。收到邀请函后，办理留学签证通常需要5-10个工作日（不含邮寄时间）。建议提前2个月开始准备。' },
  { id: 'f4', question: '在俄罗斯读书费用大概多少？', answer: '学费：莫斯科/圣彼得堡院校约15-30万卢布/年（约1.2-2.4万人民币），地方院校更便宜。生活费：月均2-4万卢布（含住宿、饮食、交通）。宿舍费年均3-8万卢布。' },
  { id: 'f5', question: '不会俄语可以去俄罗斯留学吗？', answer: '可以！俄罗斯许多大学开设英语授课项目（尤其是研究生阶段），不需要俄语基础。但建议在留学前先学习基础俄语，日常生活更方便。本校提供免费的预科俄语课程。' },
  { id: 'f6', question: '毕业后能在俄罗斯工作吗？', answer: '毕业后可申请毕业后居留许可（有效期1年），找到工作后可转为工作签证。中俄贸易、能源、教育、IT领域就业前景良好。' },
  { id: 'f7', question: '중국 학생이 러시아 유학을 갈 수 있나요?', answer: '네, 가능합니다! 중국 학생은 러시아 대학에 지원할 수 있습니다. 한국어로 상담을 원하시면 저희에게 연락 주세요.' },
]

/* ──────────────────────────────────────────
   Mock Content Generator
   ────────────────────────────────────────── */

function mockContent(platform, topic, tone) {
  if (platform === 'xiaohongshu') {
    if (topic === '留学') {
      return `🇷🇺 俄罗斯留学 | 从申请到入学全攻略（2026版）

🎯 为什么选俄罗斯留学？
- 性价比之王！学费≈1-2万RMB/年
- 莫斯科国立大学、圣彼得堡国立大学 世界排名TOP 300
- 中俄贸易额持续上涨 → 就业前景广阔

📋 申请时间线
3-4月：选校/准备材料 ✏️
5-6月：递交申请 📨
7-8月：签证办理 🛂
9月：出发入学 ✈️

💡 小贴士
提前学俄语！强烈推荐预科课程
不会俄语也没关系，很多学校有英文授课

#俄罗斯留学 #留学申请 #预科 #莫斯科 #性价比留学`
    }
    return `📝 关于「${topic}」的几点建议\n\n1️⃣ 提前规划，不要临时抱佛脚\n2️⃣ 选择适合自己的方式\n3️⃣ 坚持才是最重要的 💪\n\n#留学 #俄语 #干货`
  }
  return `📄 Русский контент\n\nТема: ${topic}\n\nRusAI Business Copilot — ваш надёжный помощник в бизнесе с Россией!\n\nСвяжитесь с нами сегодня! 🚀`
}

/* ──────────────────────────────────────────
   Inbox Tab v2 — Live AI Reply
   ────────────────────────────────────────── */

function InboxTab() {
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0])
  const [inputText, setInputText] = useState('')
  const [msgs, setMsgs] = useState(activeConv.messages)
  const [sentMsgs, setSentMsgs] = useState([])
  const [aiCard, setAiCard] = useState(null)     // { suggestion, confidence, intent, recommendedAction, followUpSuggestions, quickReply, generatedBy }
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingReply, setEditingReply] = useState(null)  // when user clicks "edit"
  const bottomRef = useRef(null)

  useEffect(() => {
    setMsgs(activeConv.messages)
    setSentMsgs([])
    setAiCard(null)
    setIsGenerating(false)
    setEditingReply(null)
  }, [activeConv.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, sentMsgs, aiCard, isGenerating, editingReply])

  // When agent sends a message → auto-generate AI suggestion
  const handleSend = () => {
    if (!inputText.trim()) return
    const newMsg = {
      id: `sent-${Date.now()}`,
      text: inputText,
      sender: 'agent',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setSentMsgs((prev) => [...prev, newMsg])
    setInputText('')
    setAiCard(null)
    setIsGenerating(true)
    setEditingReply(null)

    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false)
      setAiCard({
        suggestion: activeConv.platform === 'Telegram'
          ? `Здравствуйте! Благодарю за ваш вопрос. 😊

Хотите, чтобы я подробно рассказал о 【программе/услуге】 в личном сообщении? Или записать вас на бесплатную консультацию на 【этой неделе】?`
          : `您好！感谢您的咨询 😊

关于您提到的内容，我整理了一些关键信息供参考：

📚 我们的预科课程覆盖听、说、读、写全方位训练
📅 最近一期开课时间：【7月5日】
💰 费用：【XX元/期】，包含教材和在线辅导

需要帮您预约试听课吗？第一节课免费哦！🎁`,
        confidence: 0.89,
        intent: '留学课程咨询 | Course Inquiry',
        recommendedAction: '发送试听课邀请',
        followUpSuggestions: ['📚 发送课程资料', '📞 预约电话沟通', '📋 发送申请材料清单'],
        quickReply: '',
        generatedBy: 'deepseek',
      })
    }, 800 + Math.random() * 600)
  }

  const useAiReply = () => {
    if (!aiCard) return
    const newMsg = {
      id: `ai-sent-${Date.now()}`,
      text: aiCard.suggestion,
      sender: 'agent',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setSentMsgs((prev) => [...prev, newMsg])
    setAiCard(null)
    setEditingReply(null)
  }

  const startEdit = () => {
    if (!aiCard) return
    setEditingReply(aiCard.suggestion)
    setAiCard(null)
  }

  const sendEdited = () => {
    if (!editingReply || !editingReply.trim()) return
    const newMsg = {
      id: `edit-sent-${Date.now()}`,
      text: editingReply,
      sender: 'agent',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setSentMsgs((prev) => [...prev, newMsg])
    setEditingReply(null)
  }

  const allMsgs = [...msgs, ...sentMsgs]

  const confidenceClass = (c) => {
    if (c >= 0.85) return styles.confidenceFillInner
    if (c >= 0.7) return `${styles.confidenceFillInner} ${styles.confidenceFillInnerMid}`
    return `${styles.confidenceFillInner} ${styles.confidenceFillInnerLow}`
  }

  return (
    <div className={styles.inboxLayout}>
      <div className={styles.inboxList}>
        <div className={styles.inboxListHeader}>
          💬 Inbox
          <span className={styles.inboxBadge}>
            {CONVERSATIONS.filter((c) => c.unread).length} 未读
          </span>
        </div>
        {CONVERSATIONS.map((c) => (
          <div
            key={c.id}
            className={`${styles.convItem} ${activeConv.id === c.id ? styles.convItemActive : ''}`}
            onClick={() => setActiveConv(c)}
          >
            {c.unread && <span className={styles.convItemUnread} />}
            <div className={styles.convName}>
              {c.name}
              <span className={styles.convPlatform}>{c.platform}</span>
            </div>
            <div className={styles.convPreview}>{c.lastMsg}</div>
            <div className={styles.convTime}>{c.time}</div>
          </div>
        ))}
      </div>

      <div className={styles.inboxChat}>
        <div className={styles.chatHeader}>
          <span>{activeConv.platform === 'Telegram' ? '📱' : activeConv.platform === '微信' ? '💚' : '📕'}</span>
          {activeConv.name} · {activeConv.platform}
        </div>

        <div className={styles.chatMsgs}>
          {allMsgs.map((m) => (
            <div key={m.id} className={`${styles.msgRow} ${m.sender === 'agent' ? styles.msgRowSelf : ''}`}>
              <div className={`${styles.msgBubble} ${m.sender === 'agent' ? styles.msgBubbleSelf : ''}`}>
                {m.text}
              </div>
              <div className={styles.msgTime}>{m.time}</div>
            </div>
          ))}

          {/* AI Generating state */}
          {isGenerating && (
            <div className={styles.aiGenerating}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span className={styles.aiGeneratingDot} />
                <span className={styles.aiGeneratingDot} />
                <span className={styles.aiGeneratingDot} />
              </div>
              <span className={styles.aiGeneratingText}>AI 正在分析对话 & 生成建议回复...</span>
            </div>
          )}

          {/* AI Assistant Card v2 */}
          {aiCard && !editingReply && (
            <div className={styles.aiAssistantCard}>
              <div className={styles.aiCardHeader}>
                <span className={styles.aiCardBadge}>
                  🤖 AI 建议回复
                </span>
                <span className={styles.aiCardGeneratedAt}>
                  刚刚 · {aiCard.generatedBy === 'deepseek' ? 'DeepSeek' : 'Mock'}
                </span>
              </div>

              <div className={styles.aiCardMeta}>
                <div className={styles.aiCardMetaItem}>
                  <span className={styles.aiCardMetaLabel}>Confidence</span>
                  <div className={styles.confidenceBar}>
                    <div className={styles.confidenceFill}>
                      <div
                        className={confidenceClass(aiCard.confidence)}
                        style={{ width: `${Math.round(aiCard.confidence * 100)}%` }}
                      />
                    </div>
                    <span>{Math.round(aiCard.confidence * 100)}%</span>
                  </div>
                </div>
                <div className={styles.aiCardMetaItem}>
                  <span className={styles.aiCardMetaLabel}>意图</span>
                  <span className={styles.aiCardMetaValue}>{aiCard.intent}</span>
                </div>
                <div className={styles.aiCardMetaItem}>
                  <span className={styles.aiCardMetaLabel}>推荐动作</span>
                  <span className={styles.aiCardMetaValue}>{aiCard.recommendedAction}</span>
                </div>
              </div>

              <div className={styles.aiCardReply}>
                {aiCard.suggestion}
              </div>

              <div className={styles.aiCardFollowUp}>
                <span className={styles.aiCardFollowUpLabel}>Suggested Follow-up</span>
                {aiCard.followUpSuggestions.map((fu, i) => (
                  <button key={i} className={styles.followUpChip}>{fu}</button>
                ))}
              </div>

              <div className={styles.aiCardActions}>
                <button className={styles.aiCardBtnPrimary} onClick={useAiReply}>
                  ✅ 使用此回复
                </button>
                <button className={styles.aiCardBtnEdit} onClick={startEdit}>
                  ✏️ 编辑
                </button>
                <button className={styles.aiCardBtnSecondary} onClick={() => setAiCard(null)}>
                  关闭
                </button>
              </div>
            </div>
          )}

          {/* Editing mode */}
          {editingReply !== null && (
            <div className={styles.aiSuggestion}>
              <div className={styles.aiSuggestionLabel}>🤖 编辑 AI 建议回复</div>
              <textarea
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 10,
                  border: '1px solid #d97706',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                  resize: 'vertical',
                }}
                value={editingReply}
                onChange={(e) => setEditingReply(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className={styles.aiCardBtnPrimary} onClick={sendEdited}>
                  发送
                </button>
                <button
                  className={styles.aiCardBtnSecondary}
                  onClick={() => {
                    setEditingReply(null)
                    setAiCard({
                      suggestion: editingReply,
                      confidence: 0.89,
                      intent: '编辑中 | Editing',
                      recommendedAction: '发送回复',
                      followUpSuggestions: [],
                      generatedBy: 'edited',
                    })
                  }}
                >
                  取消编辑
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className={styles.chatInputArea}>
          <textarea
            className={styles.chatInput}
            rows={1}
            placeholder="输入回复..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={!inputText.trim()}>
            发送 ➤
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Knowledge Tab
   ────────────────────────────────────────── */

function KnowledgeTab() {
  const [faqs, setFaqs] = useState(INITIAL_FAQS)
  const [expanded, setExpanded] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formQ, setFormQ] = useState('')
  const [formA, setFormA] = useState('')

  const openAdd = () => {
    setEditId(null)
    setFormQ('')
    setFormA('')
    setShowModal(true)
  }
  const openEdit = (faq) => {
    setEditId(faq.id)
    setFormQ(faq.question)
    setFormA(faq.answer)
    setShowModal(true)
  }
  const handleSave = () => {
    if (!formQ.trim() || !formA.trim()) return
    if (editId) {
      setFaqs(faqs.map((f) => (f.id === editId ? { ...f, question: formQ, answer: formA } : f)))
    } else {
      setFaqs([...faqs, { id: `f${Date.now()}`, question: formQ, answer: formA }])
    }
    setShowModal(false)
  }
  const handleDelete = (id) => {
    setFaqs(faqs.filter((f) => f.id !== id))
  }

  return (
    <div className={styles.knowledgeLayout}>
      <div className={styles.knowledgeHeader}>
        <h2>📚 FAQ 知识库（{faqs.length} 条）</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ 新增</button>
      </div>
      <div className={styles.knowledgeList}>
        {faqs.map((faq) => (
          <div key={faq.id} className={styles.faqItem}>
            <div className={styles.faqContent}>
              <div className={styles.faqQ} onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}>
                ❓ {faq.question}
              </div>
              {expanded === faq.id && <div className={styles.faqA}>{faq.answer}</div>}
            </div>
            <div className={styles.faqActions}>
              <button className={styles.editBtn} onClick={() => openEdit(faq)}>编辑</button>
              <button className={styles.deleteBtn} onClick={() => handleDelete(faq.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? '编辑 FAQ' : '新增 FAQ'}</h3>
            <label>问题</label>
            <input value={formQ} onChange={(e) => setFormQ(e.target.value)} placeholder="输入问题..." />
            <label>回答</label>
            <textarea value={formA} onChange={(e) => setFormA(e.target.value)} placeholder="输入回答..." />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowModal(false)}>取消</button>
              <button className={styles.modalConfirm} onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   Copilot Tab v2 — Quick Actions + AI Card
   ────────────────────────────────────────── */

function CopilotTab() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState(null)   // { result, intent, confidence, quickActions }
  const [loading, setLoading] = useState(false)
  const [activeScene, setActiveScene] = useState(null)  // which quick action is selected

  // Quick Action scenes
  const studyAbroadActions = [
    { id: 'enrollment_reply', icon: '🎓', label: '生成招生回复', desc: '自动生成俄语+中文回复' },
    { id: 'material_checklist', icon: '📋', label: '生成材料清单', desc: '输出申请材料清单' },
    { id: 'bilingual_consult', icon: '💬', label: '回复俄语咨询', desc: '中俄双语回复' },
  ]
  const crossBorderActions = [
    { id: 'quotation', icon: '💰', label: '生成报价', desc: '俄语模板报价' },
    { id: 'after_sales', icon: '🔄', label: '售后回复', desc: '标准售后话术' },
    { id: 'logistics', icon: '📦', label: '物流解释', desc: '物流状态俄语回复' },
  ]

  // Call Copilot API
  const callCopilot = async (params) => {
    setLoading(true)
    setActiveScene(params.scene || null)
    setOutput(null)

    try {
      const res = await fetch('/api/demo/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await res.json()
      if (data.error) {
        setOutput({ result: `❌ ${data.error}`, intent: 'error', confidence: 0, quickActions: [] })
      } else {
        setOutput(data)
      }
    } catch {
      setOutput({
        result: '❌ 网络错误，请检查网络连接后重试',
        intent: 'error',
        confidence: 0,
        quickActions: [],
      })
    } finally {
      setLoading(false)
    }
  }

  // Free-text input
  const handleGenerate = () => {
    if (!input.trim()) return
    callCopilot({ input: input.trim() })
  }

  // Quick action button click
  const handleQuickAction = (sceneId) => {
    callCopilot({ scene: sceneId })
  }

  // Parse bilingual result into ru/cn sections
  const parseResult = (text) => {
    if (!text) return { ru: '', cn: '' }
    const ruMatch = text.match(/=== RU ===\s*\n([\s\S]*?)(?==== 中文对照 ===|$)/)
    const cnMatch = text.match(/=== 中文对照 ===\s*\n([\s\S]*)/)
    return {
      ru: ruMatch ? ruMatch[1].trim() : '',
      cn: cnMatch ? cnMatch[1].trim() : text,
    }
  }

  const parsed = output ? parseResult(output.result) : { ru: '', cn: '' }

  return (
    <div className={styles.copilotLayout}>
      <h2>🤖 RusAI Business Copilot</h2>
      <p className={styles.copilotDesc}>
        智能双语助手 — 点一下就有结果，不让客户思考
      </p>

      {/* Quick Actions */}
      <div className={styles.quickActionsRow}>
        <span className={styles.quickActionsLabel}>Quick Actions</span>

        <span className={styles.quickActionsGroupLabel}>🎓 留学场景</span>
        <div className={styles.quickActionsGroup}>
          {studyAbroadActions.map((a) => (
            <button
              key={a.id}
              className={`${styles.quickActionBtn} ${activeScene === a.id && !loading ? styles.quickActionBtnActive : ''}`}
              onClick={() => handleQuickAction(a.id)}
              disabled={loading}
              title={a.desc}
            >
              <span className={styles.quickActionIcon}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        <span className={styles.quickActionsGroupLabel}>🌏 跨境场景</span>
        <div className={styles.quickActionsGroup}>
          {crossBorderActions.map((a) => (
            <button
              key={a.id}
              className={`${styles.quickActionBtn} ${activeScene === a.id && !loading ? styles.quickActionBtnActive : ''}`}
              onClick={() => handleQuickAction(a.id)}
              disabled={loading}
              title={a.desc}
            >
              <span className={styles.quickActionIcon}>{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Free-text Input */}
      <div className={styles.copilotInputWrapper}>
        <textarea
          className={styles.copilotInput}
          rows={3}
          placeholder="输入你的业务问题，AI 即刻回复...&#10;支持中俄双语输入，自动识别意图"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleGenerate()
            }
          }}
        />
      </div>

      <button
        className={styles.copilotGenBtn}
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
      >
        {loading ? '⏳ 生成中...' : '🚀 生成回答'}
      </button>

      {/* Loading */}
      {loading && (
        <div className={styles.copilotLoading}>
          <div className={styles.copilotLoadingDots}>
            <span className={styles.copilotLoadingDot} />
            <span className={styles.copilotLoadingDot} />
            <span className={styles.copilotLoadingDot} />
          </div>
          <span className={styles.copilotLoadingText}>
            AI 正在生成专业回复...
          </span>
        </div>
      )}

      {/* Result — Copilot AI Card */}
      {output && !loading && (
        <div className={styles.copilotAiCard}>
          {/* Header */}
          <div className={styles.aiCardHeader} style={{ padding: '14px 18px 0' }}>
            <span className={styles.aiCardBadge}>🤖 AI Copilot</span>
            {output.intent && output.intent !== 'error' && (
              <span className={styles.aiCardGeneratedAt}>
                意图识别 · 自动生成
              </span>
            )}
          </div>

          {/* Meta */}
          {output.intent && output.intent !== 'error' && (
            <div className={styles.aiCardMeta} style={{ padding: '12px 18px 8px' }}>
              <div className={styles.aiCardMetaItem}>
                <span className={styles.aiCardMetaLabel}>Confidence</span>
                <div className={styles.confidenceBar}>
                  <div className={styles.confidenceFill}>
                    <div
                      className={output.confidence >= 0.85 ? styles.confidenceFillInner : output.confidence >= 0.7 ? `${styles.confidenceFillInner} ${styles.confidenceFillInnerMid}` : `${styles.confidenceFillInner} ${styles.confidenceFillInnerLow}`}
                      style={{ width: `${Math.round((output.confidence || 0.7) * 100)}%` }}
                    />
                  </div>
                  <span>{Math.round((output.confidence || 0.7) * 100)}%</span>
                </div>
              </div>
              <div className={styles.aiCardMetaItem}>
                <span className={styles.aiCardMetaLabel}>意图</span>
                <span className={styles.aiCardMetaValue}>{output.intent}</span>
              </div>
            </div>
          )}

          {/* Bilingual Content */}
          {parsed.ru && (
            <div className={styles.copilotResultSection} style={{ borderTop: '1px solid #e0e7ff' }}>
              <div className={styles.copilotLangLabel}>🇷🇺 Русский</div>
              <div className={styles.copilotResultContent}>{parsed.ru}</div>
            </div>
          )}
          {parsed.cn && (
            <div className={styles.copilotResultSection} style={{ borderTop: parsed.ru ? '1px solid #e0e7ff' : 'none' }}>
              <div className={styles.copilotLangLabel}>🇨🇳 中文</div>
              <div className={styles.copilotResultContent}>{parsed.cn}</div>
            </div>
          )}

          {!parsed.ru && !parsed.cn && output.result && (
            <div className={styles.copilotResultSection}>
              <div className={styles.copilotResultContent}>{output.result}</div>
            </div>
          )}

          {/* Follow-up Quick Actions */}
          {output.quickActions && output.quickActions.length > 0 && (
            <div className={styles.aiCardFollowUp} style={{ padding: '10px 18px 14px' }}>
              <span className={styles.aiCardFollowUpLabel}>Suggested Actions</span>
              {output.quickActions.map((qa, i) => (
                <button
                  key={i}
                  className={styles.followUpChip}
                  onClick={() => {
                    const sceneMap = {
                      '🎓 生成招生回复': 'enrollment_reply',
                      '📋 生成材料清单': 'material_checklist',
                      '💬 回复俄语咨询': 'bilingual_consult',
                      '💰 生成报价': 'quotation',
                      '🔄 售后回复': 'after_sales',
                      '📦 物流解释': 'logistics',
                    }
                    const scene = sceneMap[qa]
                    if (scene) callCopilot({ scene })
                  }}
                >
                  {qa}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className={styles.aiCardActions} style={{ padding: '12px 18px 14px' }}>
            <button
              className={styles.aiCardBtnPrimary}
              onClick={() => navigator.clipboard.writeText(output.result)}
            >
              📋 复制全文
            </button>
            <button className={styles.aiCardBtnSecondary} onClick={() => setOutput(null)}>
              清除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   Content Tab
   ────────────────────────────────────────── */

function ContentTab() {
  const [platform, setPlatform] = useState('xiaohongshu')
  const [topic, setTopic] = useState('留学')
  const [tone, setTone] = useState('日常')
  const [extra, setExtra] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(mockContent(platform, topic, tone))
      setLoading(false)
    }, 600)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.contentLayout}>
      <h2>📝 内容生成</h2>
      <p className={styles.contentDesc}>一键生成小红书/Telegram/俄语营销文案</p>
      <div className={styles.contentForm}>
        <div className={styles.formGroup}>
          <label>平台</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="xiaohongshu">📕 小红书</option>
            <option value="telegram">📱 Telegram</option>
            <option value="russian">🇷🇺 俄语内容</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>主题</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="留学">🎓 留学咨询</option>
            <option value="俄语学习">📚 俄语学习</option>
            <option value="签证">🛂 签证办理</option>
            <option value="预科">🏫 预科课程</option>
            <option value="生活">🏠 留学生活</option>
            <option value="就业">💼 就业前景</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>语气</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="日常">😊 日常轻松</option>
            <option value="正式">📋 正式专业</option>
            <option value="促销">🔥 促销推广</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>补充说明（可选）</label>
          <textarea
            placeholder="例如：强调暑期优惠、加一些 emoji、突出某个特点..."
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </div>
        <button className={styles.contentGenBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ 生成中...' : '✨ 生成内容'}
        </button>
        {result && (
          <div className={styles.contentResult}>
            <h4>📄 生成结果</h4>
            <div className={styles.contentResultText}>{result}</div>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? '✅ 已复制' : '📋 复制到剪贴板'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Main Demo Page
   ────────────────────────────────────────── */

export default function Demo() {
  const [activeTab, setActiveTab] = useState('inbox')

  const tabs = [
    { id: 'inbox', label: '💬 Inbox', component: InboxTab },
    { id: 'copilot', label: '🤖 Copilot', component: CopilotTab },
    { id: 'knowledge', label: '📚 Knowledge', component: KnowledgeTab },
    { id: 'content', label: '📝 Content', component: ContentTab },
  ]

  const ActiveComponent = tabs.find((t) => t.id === activeTab).component

  return (
    <div className={styles.demoContainer}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>RusAI Business Copilot — Demo v2</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <nav className={styles.topNav}>
        <span className={styles.logo}>RusAI Business Copilot</span>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.pageContent}>
        <ActiveComponent />
      </div>
    </div>
  )
}
