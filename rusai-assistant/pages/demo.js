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

/* Mock customer data */
const CUSTOMER_INFO = {
  c1: {
    source: '微信',
    tags: ['高意向', '留学咨询', '预科'],
    language: '中文',
    intentLevel: '★★★☆☆',
    recentBehavior: '咨询预科开课时间，主动问价',
    recommendedAction: '发送试听课邀请 + 课程资料包',
    aiSummary: '用户大学在读，计划9月赴莫大，明确有预科需求。推荐暑期班，建议跟进试听课转化。',
  },
  c2: {
    source: 'Telegram',
    tags: ['文件翻译', '已成交'],
    language: '俄语',
    intentLevel: '★★★★★',
    recentBehavior: '已完成翻译服务购买',
    recommendedAction: '发送服务完成通知 + 满意度调查',
    aiSummary: '用户已购买翻译服务并表示感谢，可进行复购推荐或邀请评价。',
  },
  c3: {
    source: '小红书',
    tags: ['新线索', '签证'],
    language: '中文',
    intentLevel: '★★☆☆☆',
    recentBehavior: '询问签证邀请函时间',
    recommendedAction: '推送签证办理流程 + 材料清单',
    aiSummary: '用户初步接触，意向有待确认。建议发送详细签证指南建立信任。',
  },
  c4: {
    source: '微信',
    tags: ['在读学生', '俄语写作'],
    language: '中文',
    intentLevel: '★★★☆☆',
    recentBehavior: '请求帮助写俄语邮件',
    recommendedAction: '提供邮件模板 + 写作服务介绍',
    aiSummary: '已在俄留学生，有俄语写作辅助需求。可推荐长期写作辅导服务。',
  },
  c5: {
    source: 'Telegram',
    tags: ['俄语用户', '汉语课程'],
    language: '俄语',
    intentLevel: '★★★☆☆',
    recentBehavior: '咨询汉语课程',
    recommendedAction: '发送课程目录 + 试听链接',
    aiSummary: '俄语母语者，对中国文化感兴趣。推荐汉语课程试听。',
  },
}

const INITIAL_FAQS = [
  { id: 'f1', question: '俄罗斯留学需要什么条件？', answer: '需要高中或以上学历，通过俄语水平测试（至少达到A2水平），提供健康证明和资金证明。具体院校和要求不同，欢迎详询！' },
  { id: 'f2', question: '俄语预科课程多长时间？', answer: '标准预科课程为8个月（9月-次年5月），暑期强化班为2个月（7月-8月），每周6-8课时。完成预科后可达A2-B1水平。' },
  { id: 'f3', question: '签证办理需要多长时间？', answer: '签证邀请函大约2-3周。收到邀请函后，办理留学签证通常需要5-10个工作日（不含邮寄时间）。建议提前2个月开始准备。' },
  { id: 'f4', question: '在俄罗斯读书费用大概多少？', answer: '学费：莫斯科/圣彼得堡院校约15-30万卢布/年（约1.2-2.4万人民币），地方院校更便宜。生活费：月均2-4万卢布（含住宿、饮食、交通）。宿舍费年均3-8万卢布。' },
  { id: 'f5', question: '不会俄语可以去俄罗斯留学吗？', answer: '可以！俄罗斯许多大学开设英语授课项目（尤其是研究生阶段），不需要俄语基础。但建议在留学前先学习基础俄语，日常生活更方便。本校提供免费的预科俄语课程。' },
  { id: 'f6', question: '毕业后能在俄罗斯工作吗？', answer: '毕业后可申请毕业后居留许可（有效期1年），找到工作后可转为工作签证。中俄贸易、能源、教育、IT领域就业前景良好。' },
  { id: 'f7', question: '중국 학생이 러시아 유학을 갈 수 있나요?', answer: '네, 가능합니다! 중국 학생은 러시아 대학에 지원할 수 있습니다. 한국어로 상담을 원하시면 저희에게 연락 주세요.' },
]

const INITIAL_DOCS = [
  { id: 'd1', title: '俄罗斯留学签证办理指南.pdf', type: 'PDF', size: '2.4 MB', date: '2025-12-01' },
  { id: 'd2', title: '莫斯科国立大学招生简章2026.docx', type: 'DOCX', size: '1.8 MB', date: '2026-01-15' },
  { id: 'd3', title: '中俄贸易合同模板（俄汉双语）.doc', type: 'DOC', size: '856 KB', date: '2026-02-20' },
  { id: 'd4', title: '俄罗斯签证申请表（样本）.pdf', type: 'PDF', size: '520 KB', date: '2026-03-10' },
]

const INITIAL_BIZ_KNOWLEDGE = [
  { id: 'b1', title: '俄罗斯高等教育体系概览', summary: '介绍俄联邦高等教育的学位等级、认证体系及院校分类。', updated: '2026-03-01' },
  { id: 'b2', title: '中俄贸易关键法规汇编', summary: '2025-2026年中俄贸易相关的关税政策、进出口限制及许可证要求。', updated: '2026-02-15' },
  { id: 'b3', title: '俄罗斯留学生常见问题FAQ（内部）', summary: '招生过程中高频问题的标准回复话术及处理流程。', updated: '2026-01-20' },
  { id: 'b4', title: 'TG社群运营SOP', summary: 'Telegram 俄语留学社群的日常运营流程、内容日历及互动策略。', updated: '2026-03-05' },
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
   Inbox Tab v2 — Live AI Reply + Customer Panel
   ────────────────────────────────────────── */

function InboxTab() {
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0])
  const [inputText, setInputText] = useState('')
  const [msgs, setMsgs] = useState(activeConv.messages)
  const [sentMsgs, setSentMsgs] = useState([])
  const [aiCard, setAiCard] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingReply, setEditingReply] = useState(null)
  const [showCustomerPanel, setShowCustomerPanel] = useState(true)
  const bottomRef = useRef(null)

  const customerInfo = CUSTOMER_INFO[activeConv.id] || {}

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
      {/* Left: conversation list */}
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

      {/* Center: chat area */}
      <div className={styles.inboxChat}>
        <div className={styles.chatHeader}>
          <span>{activeConv.platform === 'Telegram' ? '📱' : activeConv.platform === '微信' ? '💚' : '📕'}</span>
          {activeConv.name} · {activeConv.platform}
          <button
            className={styles.customerPanelToggle}
            onClick={() => setShowCustomerPanel(!showCustomerPanel)}
            title={showCustomerPanel ? '隐藏客户信息' : '显示客户信息'}
          >
            {showCustomerPanel ? '👤 ▸' : '👤 ◂'}
          </button>
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

      {/* Right: Customer info panel */}
      {showCustomerPanel && (
        <div className={styles.customerPanel}>
          <div className={styles.customerPanelHeader}>
            客户信息
          </div>
          <div className={styles.customerPanelBody}>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>来源</span>
              <span className={styles.customerFieldValue}>{customerInfo.source || '—'}</span>
            </div>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>标签</span>
              <div className={styles.customerTags}>
                {(customerInfo.tags || []).map((tag, i) => (
                  <span key={i} className={styles.customerTag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>语言</span>
              <span className={styles.customerFieldValue}>{customerInfo.language || '—'}</span>
            </div>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>意向等级</span>
              <span className={styles.customerFieldValue}>{customerInfo.intentLevel || '—'}</span>
            </div>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>最近行为</span>
              <span className={styles.customerFieldValue}>{customerInfo.recentBehavior || '—'}</span>
            </div>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>推荐动作</span>
              <span className={styles.customerFieldValueHighlight}>{customerInfo.recommendedAction || '—'}</span>
            </div>
            <div className={styles.customerField}>
              <span className={styles.customerFieldLabel}>AI 判断摘要</span>
              <div className={styles.customerAiSummary}>
                {customerInfo.aiSummary || '暂无分析数据'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   Knowledge Tab — Three-Column Layout
   ────────────────────────────────────────── */

function KnowledgeTab() {
  const [knowledgeTab, setKnowledgeTab] = useState('faq')

  return (
    <div className={styles.knowledgeLayout}>
      <div className={styles.knowledgeTabBar}>
        <button
          className={`${styles.knowledgeTabBtn} ${knowledgeTab === 'faq' ? styles.knowledgeTabBtnActive : ''}`}
          onClick={() => setKnowledgeTab('faq')}
        >
          ❓ FAQ 知识库
        </button>
        <button
          className={`${styles.knowledgeTabBtn} ${knowledgeTab === 'docs' ? styles.knowledgeTabBtnActive : ''}`}
          onClick={() => setKnowledgeTab('docs')}
        >
          📄 文档
        </button>
        <button
          className={`${styles.knowledgeTabBtn} ${knowledgeTab === 'biz' ? styles.knowledgeTabBtnActive : ''}`}
          onClick={() => setKnowledgeTab('biz')}
        >
          🏢 业务知识
        </button>
      </div>
      <div className={styles.knowledgePanel}>
        {knowledgeTab === 'faq' && <FaqPanel />}
        {knowledgeTab === 'docs' && <DocsPanel />}
        {knowledgeTab === 'biz' && <BizKnowledgePanel />}
      </div>
    </div>
  )
}

function FaqPanel() {
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
    <div>
      <div className={styles.knowledgeHeader}>
        <h2>❓ FAQ 知识库（{faqs.length} 条）</h2>
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

function DocsPanel() {
  const [docs, setDocs] = useState(INITIAL_DOCS)

  const handleUpload = () => {
    const newDoc = {
      id: `d${Date.now()}`,
      title: `新文档_${new Date().toLocaleDateString('zh-CN')}.pdf`,
      type: 'PDF',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      date: new Date().toISOString().slice(0, 10),
    }
    setDocs([newDoc, ...docs])
  }

  return (
    <div>
      <div className={styles.knowledgeHeader}>
        <h2>📄 文档（{docs.length} 份）</h2>
        <button className={styles.addBtn} onClick={handleUpload}>📤 上传文档</button>
      </div>
      <div className={styles.knowledgeList}>
        {docs.map((doc) => (
          <div key={doc.id} className={styles.faqItem}>
            <div className={styles.faqContent}>
              <div className={styles.faqQ} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={styles.docIcon}>📄</span>
                {doc.title}
              </div>
              <div className={styles.docMeta}>
                <span className={styles.docMetaItem}>{doc.type}</span>
                <span className={styles.docMetaItem}>{doc.size}</span>
                <span className={styles.docMetaItem}>{doc.date}</span>
              </div>
            </div>
            <div className={styles.faqActions}>
              <button className={styles.editBtn}>预览</button>
              <button className={styles.deleteBtn}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BizKnowledgePanel() {
  const [items, setItems] = useState(INITIAL_BIZ_KNOWLEDGE)

  return (
    <div>
      <div className={styles.knowledgeHeader}>
        <h2>🏢 业务知识（{items.length} 条）</h2>
        <button className={styles.addBtn} onClick={() => {
          const newItem = {
            id: `b${Date.now()}`,
            title: '新业务知识',
            summary: '待补充内容...',
            updated: new Date().toISOString().slice(0, 10),
          }
          setItems([newItem, ...items])
        }}>+ 新增</button>
      </div>
      <div className={styles.knowledgeList}>
        {items.map((item) => (
          <div key={item.id} className={styles.faqItem}>
            <div className={styles.faqContent}>
              <div className={styles.faqQ}>
                📌 {item.title}
              </div>
              <div className={styles.faqA}>{item.summary}</div>
              <div className={styles.bizDate}>更新于 {item.updated}</div>
            </div>
            <div className={styles.faqActions}>
              <button className={styles.editBtn}>编辑</button>
              <button className={styles.deleteBtn}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Copilot Tab v2 — Quick Actions + AI Card
   ────────────────────────────────────────── */

function CopilotTab() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeScene, setActiveScene] = useState(null)

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

  const handleGenerate = () => {
    if (!input.trim()) return
    callCopilot({ input: input.trim() })
  }

  const handleQuickAction = (sceneId) => {
    callCopilot({ scene: sceneId })
  }

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

      {output && !loading && (
        <div className={styles.copilotAiCard}>
          <div className={styles.aiCardHeader} style={{ padding: '14px 18px 0' }}>
            <span className={styles.aiCardBadge}>🤖 AI Copilot</span>
            {output.intent && output.intent !== 'error' && (
              <span className={styles.aiCardGeneratedAt}>
                意图识别 · 自动生成
              </span>
            )}
          </div>

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
   Content Tab — 4 Vertical Assistants
   ────────────────────────────────────────── */

function ContentTab() {
  const [contentTab, setContentTab] = useState('enrollment')

  return (
    <div className={styles.contentLayout}>
      <h2>📝 内容生成</h2>
      <p className={styles.contentDesc}>4 个垂直助手，覆盖不同业务场景</p>

      <div className={styles.contentTabBar}>
        <button
          className={`${styles.contentTabBtn} ${contentTab === 'enrollment' ? styles.contentTabBtnActive : ''}`}
          onClick={() => setContentTab('enrollment')}
        >
          🎓 招生内容
        </button>
        <button
          className={`${styles.contentTabBtn} ${contentTab === 'tg' ? styles.contentTabBtnActive : ''}`}
          onClick={() => setContentTab('tg')}
        >
          📱 TG 社群
        </button>
        <button
          className={`${styles.contentTabBtn} ${contentTab === 'russian' ? styles.contentTabBtnActive : ''}`}
          onClick={() => setContentTab('russian')}
        >
          🇷🇺 俄语营销
        </button>
        <button
          className={`${styles.contentTabBtn} ${contentTab === 'faqContent' ? styles.contentTabBtnActive : ''}`}
          onClick={() => setContentTab('faqContent')}
        >
          ❓ FAQ 内容
        </button>
      </div>

      <div className={styles.contentPanel}>
        {contentTab === 'enrollment' && <EnrollmentContent />}
        {contentTab === 'tg' && <TgContent />}
        {contentTab === 'russian' && <RussianContent />}
        {contentTab === 'faqContent' && <FaqContent />}
      </div>
    </div>
  )
}

function EnrollmentContent() {
  const [topic, setTopic] = useState('留学')
  const [tone, setTone] = useState('日常')
  const [extra, setExtra] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(mockContent('xiaohongshu', topic, tone))
      setLoading(false)
    }, 600)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className={styles.contentForm}>
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
          {loading ? '⏳ 生成中...' : '✨ 生成招生内容'}
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

function TgContent() {
  const [channel, setChannel] = useState('留学群')
  const [postType, setPostType] = useState('日常分享')
  const [extra, setExtra] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      setResult(`📢 【社群通知 — ${channel}】

${postType === '日常分享' ? `🇷🇺 俄罗斯留学小贴士

莫斯科大学申请季马上开始啦！提前准备材料很重要：
📋 需要《护照+学历证+成绩单》的公证翻译
📋 动机信要突出你的学术背景和留学目标
📋 推荐信最好找副教授以上的专业导师

有任何疑问可以 @ 我们哦！` : postType === '活动通知' ? `📣 活动预告

🎯 俄罗斯留学线上说明会
📅 本周六 20:00 (北京时间)
📍 Telegram 语音频道

🔥 主讲内容：
• 2026年热门院校盘点
• 申请材料准备攻略
• 签证办理避坑指南

名额有限，赶紧报名！` : `💡 知识分享

🇨🇳🇷🇺 中俄双语每日一词

Сегодняшнее слово: стипендия（奖学金）

例句：
Я получил стипендию на обучение в России.
我获得了俄罗斯留学奖学金。`}`)
      setLoading(false)
    }, 600)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className={styles.contentForm}>
        <div className={styles.formGroup}>
          <label>社群频道</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="留学群">🎓 留学咨询群</option>
            <option value="俄语群">📚 俄语学习群</option>
            <option value="校友群">🏛️ 校友交流群</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>内容类型</label>
          <select value={postType} onChange={(e) => setPostType(e.target.value)}>
            <option value="日常分享">💡 日常分享</option>
            <option value="活动通知">📣 活动通知</option>
            <option value="知识卡片">📇 知识卡片</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>补充说明（可选）</label>
          <textarea
            placeholder="需要强调什么信息？"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </div>
        <button className={styles.contentGenBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ 生成中...' : '✨ 生成 TG 内容'}
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

function RussianContent() {
  const [topic, setTopic] = useState('留学推广')
  const [tone, setTone] = useState('正式')
  const [extra, setExtra] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const topics = {
    '留学推广': 'Учиться в России',
    '语言服务': 'Переводческие услуги',
    '商务合作': 'Деловое сотрудничество',
    '社群推广': 'Продвижение сообщества',
  }

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      const ruTopic = topics[topic] || topic
      setResult(`📄 Русский маркетинговый контент

Тема: ${ruTopic}

Уважаемые клиенты и партнёры!

RusAI Business Copilot — ваш надёжный помощник в бизнесе с Россией! Мы предлагаем профессиональные услуги в сфере образования, перевода и делового сотрудничества между Китаем и Россией.

🎯 Наши преимущества:
✅ Опыт работы более 5 лет
✅ Команда профессиональных переводчиков
✅ Индивидуальный подход к каждому клиенту
✅ Поддержка на всех этапах сотрудничества

Свяжитесь с нами сегодня и получите бесплатную консультацию!

🇨🇳🇷🇺 RusAI — мост между Китаем и Россией

---
Сгенерировано RusAI Business Copilot`)
      setLoading(false)
    }, 600)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className={styles.contentForm}>
        <div className={styles.formGroup}>
          <label>主题</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="留学推广">🎓 留学推广</option>
            <option value="语言服务">📝 语言服务</option>
            <option value="商务合作">🤝 商务合作</option>
            <option value="社群推广">📢 社群推广</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>语气</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="正式">📋 正式专业</option>
            <option value="友好">😊 友好亲切</option>
            <option value="促销">🔥 促销推广</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>补充说明（可选）</label>
          <textarea
            placeholder="需要强调哪些信息？添加关键词..."
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </div>
        <button className={styles.contentGenBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ 生成中...' : '✨ 生成俄语营销内容'}
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

function FaqContent() {
  const [question, setQuestion] = useState('')
  const [tone, setTone] = useState('日常')
  const [extra, setExtra] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    setLoading(true)
    setTimeout(() => {
      const q = question.trim() || '俄罗斯留学费用'
      setResult(`❓ Q：${q}

A：感谢您的提问！关于「${q}」，以下是详细解答：

📌 关键信息
• 俄罗斯留学费用因城市和院校而异
• 莫斯科/圣彼得堡：学费约15-30万卢布/年（≈1.2-2.4万人民币）
• 地方院校：学费约8-15万卢布/年
• 生活费：月均2-4万卢布（含住宿、餐饮、交通）

💡 温馨提示
以上信息仅供参考，具体费用以院校官方公布为准。
如需个性化留学规划，欢迎随时联系我们！`)
      setLoading(false)
    }, 600)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className={styles.contentForm}>
        <div className={styles.formGroup}>
          <label>FAQ 问题</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：俄罗斯留学需要什么条件？"
          />
        </div>
        <div className={styles.formGroup}>
          <label>回答语气</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="日常">😊 日常轻松</option>
            <option value="正式">📋 正式专业</option>
            <option value="详细">📖 详细全面</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>补充说明（可选）</label>
          <textarea
            placeholder="例如：针对特定用户群体、强调某些卖点..."
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
        </div>
        <button className={styles.contentGenBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? '⏳ 生成中...' : '✨ 生成 FAQ 回答'}
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
   Dashboard/Outcome Tab
   ────────────────────────────────────────── */

function DashboardTab() {
  const stats = [
    { label: '今日线索', value: '28', change: '+12%', icon: '📈' },
    { label: 'AI 处理', value: '342', change: '+67%', icon: '🤖' },
    { label: '人工接管', value: '18', change: '-23%', icon: '👤' },
    { label: '节省时间', value: '47h', change: '本周累计', icon: '⏱️' },
  ]

  const insights = [
    { title: '流量趋势', value: '本周咨询量 ↑ 34%', detail: '主要来自小红书和 TG 渠道', color: '#10b981' },
    { title: 'AI 完成率', value: '95.2%', detail: '自动化处理成功率维持高位', color: '#6366f1' },
    { title: '热门意图', value: '留学咨询 42%', detail: '预科课程和签证问询最多', color: '#f59e0b' },
  ]

  return (
    <div className={styles.dashboardLayout}>
      <h2>📊 运营看板</h2>
      <p className={styles.dashboardDesc}>数据概览 & 业务洞察</p>

      <div className={styles.dashboardCards}>
        {stats.map((s, i) => (
          <div key={i} className={styles.dashboardCard}>
            <div className={styles.dashboardCardIcon}>{s.icon}</div>
            <div className={styles.dashboardCardValue}>{s.value}</div>
            <div className={styles.dashboardCardLabel}>{s.label}</div>
            <div className={`${styles.dashboardCardChange} ${s.change.startsWith('+') ? styles.dashboardCardChangeUp : s.change.startsWith('-') ? styles.dashboardCardChangeDown : ''}`}>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardInsights}>
        <h3>业务洞察</h3>
        <div className={styles.dashboardInsightsGrid}>
          {insights.map((ins, i) => (
            <div key={i} className={styles.dashboardInsightCard}>
              <div className={styles.dashboardInsightTitle}>{ins.title}</div>
              <div className={styles.dashboardInsightValue} style={{ color: ins.color }}>{ins.value}</div>
              <div className={styles.dashboardInsightDetail}>{ins.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.dashboardRecentActivity}>
        <h3>最近活动</h3>
        <div className={styles.dashboardActivityList}>
          <div className={styles.dashboardActivityItem}>
            <span className={styles.dashboardActivityDot} style={{ background: '#10b981' }} />
            <div className={styles.dashboardActivityContent}>
              <span className={styles.dashboardActivityText}>新线索 李明浩 咨询签证邀请函</span>
              <span className={styles.dashboardActivityTime}>10分钟前</span>
            </div>
          </div>
          <div className={styles.dashboardActivityItem}>
            <span className={styles.dashboardActivityDot} style={{ background: '#6366f1' }} />
            <div className={styles.dashboardActivityContent}>
              <span className={styles.dashboardActivityText}>AI 自动回复了 Анна 的翻译咨询</span>
              <span className={styles.dashboardActivityTime}>25分钟前</span>
            </div>
          </div>
          <div className={styles.dashboardActivityItem}>
            <span className={styles.dashboardActivityDot} style={{ background: '#f59e0b' }} />
            <div className={styles.dashboardActivityContent}>
              <span className={styles.dashboardActivityText}>需要人工介入：王芳 要求特殊折扣</span>
              <span className={styles.dashboardActivityTime}>1小时前</span>
            </div>
          </div>
          <div className={styles.dashboardActivityItem}>
            <span className={styles.dashboardActivityDot} style={{ background: '#10b981' }} />
            <div className={styles.dashboardActivityContent}>
              <span className={styles.dashboardActivityText}>陈晓 报名了暑期预科班</span>
              <span className={styles.dashboardActivityTime}>2小时前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   Main Demo Page
   ────────────────────────────────────────── */

export default function Demo() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: '📊 运营看板', component: DashboardTab },
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
        <title>RusAI Business Copilot · 你的中俄业务 AI 员工</title>
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
