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
    messages: [
      { id: 'm1', text: '你好，请问是俄语课程咨询吗？', sender: 'agent', time: '10:00' },
      { id: 'm2', text: '是的老师！我想了解一下预科俄语课程', sender: 'user', time: '10:01' },
      { id: 'm3', text: '好的，我们目前有暑期预科班和秋季预科班，您大概什么时间方便上课？', sender: 'agent', time: '10:05' },
      { id: 'm4', text: '我9月份要去莫斯科国立大学，想提前学一些俄语基础', sender: 'user', time: '10:08' },
      { id: 'm5', text: '那暑期预科班非常适合您！7月初开课，每周一三五晚上，共8周。另外赠送免费试听课。', sender: 'agent', time: '10:12' },
      { id: 'm6', text: '请问预科俄语课程什么时候开课？', sender: 'user', time: '10:32' },
    ],
    suggestedReply: '同学你好！🎓 暑期预科班7月5日开课，每周一三五 19:00-20:30（北京时间），线上直播授课。现在报名还赠送俄语学习大礼包哦！请问需要帮您登记试听吗？😊',
  },
  {
    id: 'c2',
    name: 'Анна Петрова',
    platform: 'Telegram',
    lastMsg: 'Спасибо за помощь с документами!',
    time: '昨天',
    messages: [
      { id: 'm2-1', text: 'Здравствуйте! Нужна помощь с переводом документов', sender: 'user', time: '昨天 14:00' },
      { id: 'm2-2', text: 'Здравствуйте, Анна! Конечно, какие документы нужно перевести?', sender: 'agent', time: '昨天 14:05' },
      { id: 'm2-3', text: 'Диплом и рекомендательное письмо', sender: 'user', time: '昨天 14:10' },
      { id: 'm2-4', text: 'Переведём за 2-3 рабочих дня. Стоимость 1500₽ за страницу.', sender: 'agent', time: '昨天 14:15' },
      { id: 'm2-5', text: 'Спасибо за помощь с документами!', sender: 'user', time: '昨天 16:00' },
    ],
    suggestedReply: 'Пожалуйста, Анна! 😊 Рады были помочь. Если понадобится перевод для других документов или нотариальное заверение — обращайтесь!',
  },
  {
    id: 'c3',
    name: '李明浩',
    platform: '小红书',
    lastMsg: '签证邀请函多久能下来？',
    time: '昨天',
    messages: [
      { id: 'm3-1', text: '你好！我看到你们有留学俄罗斯服务，想咨询一下', sender: 'user', time: '昨天 20:00' },
      { id: 'm3-2', text: '你好李明浩！是的，我们提供全方位的俄罗斯留学服务 🎯', sender: 'agent', time: '昨天 20:02' },
      { id: 'm3-3', text: '签证邀请函多久能下来？', sender: 'user', time: '昨天 20:05' },
    ],
    suggestedReply: '普通邀请函通常需要14-21个工作日。不过我们有加急通道，最快7个工作日可以拿到！另外提醒您，莫斯科签证中心的预约名额最近比较紧张，建议尽早准备哦 ⏰',
  },
  {
    id: 'c4',
    name: '王芳',
    platform: '微信',
    lastMsg: '能帮我写一封俄语邮件给导师吗？',
    time: '周一',
    messages: [
      { id: 'm4-1', text: '老师好，我是王芳，现在在莫斯科读研', sender: 'user', time: '周一 09:30' },
      { id: 'm4-2', text: '王芳你好！在莫斯科还习惯吗？😊', sender: 'agent', time: '周一 09:32' },
      { id: 'm4-3', text: '还行，就是写俄语邮件有点头疼', sender: 'user', time: '周一 09:35' },
      { id: 'm4-4', text: '可以帮你呀！需要什么场景的俄语邮件？', sender: 'agent', time: '周一 09:36' },
      { id: 'm4-5', text: '能帮我写一封俄语邮件给导师吗？想申请延期交论文', sender: 'user', time: '周一 09:38' },
    ],
    suggestedReply: '当然可以！已经帮您生成了一封俄语邮件草稿，内容如下：\n\nУважаемый профессор Иванов,\n\nЯ обращаюсь к Вам с просьбой продлить срок сдачи курсовой работы...\n\n需要我帮您调整语气或者补充内容吗？',
  },
  {
    id: 'c5',
    name: 'Ольга Смирнова',
    platform: 'Telegram',
    lastMsg: 'Есть ли у вас курсы китайского для русских?',
    time: '周一',
    messages: [
      { id: 'm5-1', text: 'Добрый день! Интересуют курсы китайского языка', sender: 'user', time: '周一 11:00' },
      { id: 'm5-2', text: 'Добрый день, Ольга! Да, у нас есть курсы китайского для русскоязычных студентов 🇨🇳', sender: 'agent', time: '周一 11:05' },
      { id: 'm5-3', text: 'Есть ли у вас курсы китайского для русских?', sender: 'user', time: '周一 11:10' },
    ],
    suggestedReply: 'Да! У нас есть:\n1️⃣ Базовый курс HSK 1-2 (для начинающих)\n2️⃣ Разговорный клуб (для продолжающих)\n3️⃣ Деловой китайский\n\nВсе занятия проводятся онлайн с носителями языка. Хотите записаться на пробный урок? 🎯',
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
   Mock Generate Functions
   ────────────────────────────────────────── */

function mockCopilot(input) {
  const cn = `📝 中文回答：\n您好！关于「${input}」，我们的建议如下：\n\n1️⃣ 俄罗斯留学申请需要提前6-12个月准备\n2️⃣ 建议先完成俄语预科课程（8个月/300+课时）\n3️⃣ 材料清单：护照、学历公证、健康证明、资金证明\n4️⃣ 签证办理周期约4-6周\n\n如需更详细的个性化方案，请联系我们的顾问老师！😊`

  const ru = `📝 Ответ на русском:\n\nЗдравствуйте! По вашему вопросу «${input}»:\n\n1️⃣ Для поступления в российский вуз подготовка занимает 6-12 месяцев\n2️⃣ Рекомендуем пройти подготовительные курсы русского языка (8 мес/300+ часов)\n3️⃣ Необходимые документы: загранпаспорт, нотариально заверенный диплом, медсправка, подтверждение финансовой состоятельности\n4️⃣ Оформление визы — 4-6 недель\n\nДля индивидуальной консультации обращайтесь к нашим специалистам! 😊`

  return { cn, ru }
}

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

#俄罗斯留学 #留学申请 #预科 #莫斯科 #性价比留学

🔥 收藏 + 关注，获取更多留学干货！`
    }
    if (topic === '俄语学习') {
      return `📚 零基础学俄语30天 | 每天15分钟

第1天：俄语字母表（33个字母其实很简单）
第7天：日常问候语（привет, как дела? 🌟）
第14天：自我介绍（меня зовут...）
第21天：购物场景（сколько стоит? 💰）
第30天：简单对话（恭喜你！🎉）

⚠️ 避坑指南
× 不要死记硬背语法
× 不要只看课本
√ 多听俄语歌曲、看俄剧
√ 找语伴练习口语

👇评论区扣1，获取免费俄语学习资料包！

#俄语学习 #自学俄语 #外语 #学习方法`
    }
    return `📝 关于「${topic}」的几点建议\n\n1️⃣ 提前规划，不要临时抱佛脚\n2️⃣ 选择适合自己的方式\n3️⃣ 坚持才是最重要的 💪\n\n#留学 #俄语 #干货`
  }

  if (platform === 'telegram') {
    return `📢 【RusAI 留学资讯】\n\n🔥 俄罗斯留学热门问答\n\n❓ 问题：${topic}\n\n💡 解答：\n俄罗斯留学申请正在火热进行中！我们提供一站式留学服务 — 从选校、申请材料、签证办理到入学后的生活指导。\n\n📱 咨询方式：\n• 微信：RusAI_Service\n• Telegram：@RusAI_Support\n• 官网：rusai.cc\n\n✨ 现在咨询可免费领取「俄语入门学习包」一份！`
  }

  // Russian content
  return `📄 Русский контент\n\nТема: ${topic}\n\nRusAI Business Copilot — ваш надёжный помощник в бизнесе с Россией!\n\nМы предлагаем:\n✓ Перевод документов любой сложности\n✓ Подготовка к сдаче экзаменов\n✓ Помощь в поступлении в вузы РФ\n✓ Бизнес-консультации\n\nСвяжитесь с нами сегодня! 🚀`
}

/* ──────────────────────────────────────────
   Components
   ────────────────────────────────────────── */

function InboxTab() {
  const [activeConv, setActiveConv] = useState(CONVERSATIONS[0])
  const [inputText, setInputText] = useState('')
  const [msgs, setMsgs] = useState(activeConv.messages)
  const [showSuggestion, setShowSuggestion] = useState(true)
  const [sentMsgs, setSentMsgs] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    setMsgs(activeConv.messages)
    setShowSuggestion(true)
    setSentMsgs([])
  }, [activeConv.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, sentMsgs])

  const handleSend = () => {
    if (!inputText.trim()) return
    const newMsg = {
      id: `sent-${Date.now()}`,
      text: inputText,
      sender: 'agent',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setSentMsgs(prev => [...prev, newMsg])
    setInputText('')
    setShowSuggestion(false)
  }

  const useSuggestion = () => {
    const newMsg = {
      id: `sent-${Date.now()}`,
      text: activeConv.suggestedReply,
      sender: 'agent',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setSentMsgs(prev => [...prev, newMsg])
    setShowSuggestion(false)
  }

  const allMsgs = [...msgs, ...sentMsgs]

  return (
    <div className={styles.inboxLayout}>
      <div className={styles.inboxList}>
        <div className={styles.inboxListHeader}>💬 对话 ({CONVERSATIONS.length})</div>
        {CONVERSATIONS.map(c => (
          <div
            key={c.id}
            className={`${styles.convItem} ${activeConv.id === c.id ? styles.convItemActive : ''}`}
            onClick={() => setActiveConv(c)}
          >
            <div className={styles.convName}>{c.platform === 'Telegram' ? '📱' : c.platform === '微信' ? '💚' : '📕'} {c.name}</div>
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
          {allMsgs.map(m => (
            <div key={m.id} className={`${styles.msgRow} ${m.sender === 'agent' ? styles.msgRowSelf : ''}`}>
              <div className={`${styles.msgBubble} ${m.sender === 'agent' ? styles.msgBubbleSelf : ''}`}>
                {m.text}
              </div>
              <div className={styles.msgTime}>{m.time}</div>
            </div>
          ))}

          {showSuggestion && (
            <div className={styles.aiSuggestion}>
              <div className={styles.aiSuggestionLabel}>🤖 AI 建议回复</div>
              <div className={styles.aiSuggestionText}>{activeConv.suggestedReply}</div>
              <div className={styles.aiSuggestionActions}>
                <button onClick={useSuggestion}>✅ 使用此回复</button>
                <button onClick={() => setShowSuggestion(false)}>✏️ 自己编辑</button>
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
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }}}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={!inputText.trim()}>
            发送 ➤
          </button>
        </div>
      </div>
    </div>
  )
}

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
      setFaqs(faqs.map(f => f.id === editId ? { ...f, question: formQ, answer: formA } : f))
    } else {
      setFaqs([...faqs, { id: `f${Date.now()}`, question: formQ, answer: formA }])
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    setFaqs(faqs.filter(f => f.id !== id))
  }

  return (
    <div className={styles.knowledgeLayout}>
      <div className={styles.knowledgeHeader}>
        <h2>📚 知识库 — FAQ（{faqs.length} 条）</h2>
        <button className={styles.addBtn} onClick={openAdd}>+ 新增 FAQ</button>
      </div>

      <div className={styles.knowledgeList}>
        {faqs.map(faq => (
          <div key={faq.id} className={styles.faqItem}>
            <div className={styles.faqContent}>
              <div className={styles.faqQ} onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}>
                ❓ {faq.question}
              </div>
              {expanded === faq.id && (
                <div className={styles.faqA}>{faq.answer}</div>
              )}
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
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{editId ? '编辑 FAQ' : '新增 FAQ'}</h3>
            <label>问题</label>
            <input value={formQ} onChange={e => setFormQ(e.target.value)} placeholder="输入问题..." />
            <label>回答</label>
            <textarea value={formA} onChange={e => setFormA(e.target.value)} placeholder="输入回答..." />
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

function CopilotTab() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = () => {
    if (!input.trim()) return
    setLoading(true)
    // Simulate API call — Gray will replace this with real Copilot logic
    setTimeout(() => {
      const result = mockCopilot(input)
      setOutput(result)
      setLoading(false)
    }, 800)
  }

  return (
    <div className={styles.copilotLayout}>
      <h2>🤖 RusAI Copilot</h2>
      <p className={styles.copilotDesc}>智能助手 — 中俄双语自动回复，支持留学/俄语培训场景</p>

      <textarea
        className={styles.copilotInput}
        rows={4}
        placeholder="输入你的问题，例如：在俄罗斯留学需要准备哪些材料？"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button className={styles.copilotGenBtn} onClick={handleGenerate} disabled={loading || !input.trim()}>
        {loading ? '⏳ 生成中...' : '🚀 生成回答'}
      </button>

      <div className={styles.copilotOutput}>
        {output && (
          <>
            <div className={styles.outputCard}>
              <div className={styles.outputLangLabel}>🇨🇳 中文</div>
              <div className={styles.outputText}>{output.cn}</div>
            </div>
            <div className={styles.outputCard}>
              <div className={styles.outputLangLabel}>🇷🇺 Русский</div>
              <div className={styles.outputText}>{output.ru}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

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
      const content = mockContent(platform, topic, tone)
      setResult(content)
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
          <select value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="xiaohongshu">📕 小红书</option>
            <option value="telegram">📱 Telegram</option>
            <option value="russian">🇷🇺 俄语内容</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>主题</label>
          <select value={topic} onChange={e => setTopic(e.target.value)}>
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
          <select value={tone} onChange={e => setTone(e.target.value)}>
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
            onChange={e => setExtra(e.target.value)}
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
    { id: 'knowledge', label: '📚 Knowledge', component: KnowledgeTab },
    { id: 'copilot', label: '🤖 Copilot', component: CopilotTab },
    { id: 'content', label: '📝 Content', component: ContentTab },
  ]

  const ActiveComponent = tabs.find(t => t.id === activeTab).component

  return (
    <div className={styles.demoContainer}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>RusAI Demo — Business Copilot</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <nav className={styles.topNav}>
        <span className={styles.logo}>RusAI Demo</span>
        <div className={styles.tabs}>
          {tabs.map(tab => (
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
