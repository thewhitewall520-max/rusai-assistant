import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import styles from '../styles/Workspace.module.css'

const modes = [
  { id: 'translate', icon: '🌐', label: '翻译' },
  { id: 'email', icon: '✉️', label: '邮件生成' },
  { id: 'optimize', icon: '✨', label: '句子优化' },
  { id: 'academic', icon: '📚', label: '学术表达' },
]

const tones = { translate: ['日常', '正式', '学术', '商务'], email: ['礼貌', '正式', '强硬一点'] }

const LANGUAGES = [
  { code: 'zh', name: '中文' }, { code: 'en', name: 'English' }, { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' }, { code: 'ko', name: '한국어' }, { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' }, { code: 'es', name: 'Español' }, { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' }, { code: 'ar', name: 'العربية' }, { code: 'hi', name: 'हिन्दी' },
  { code: 'th', name: 'ไทย' }, { code: 'vi', name: 'Tiếng Việt' }, { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Bahasa Melayu' }, { code: 'tl', name: 'Filipino' }, { code: 'tr', name: 'Türkçe' },
  { code: 'nl', name: 'Nederlands' }, { code: 'sv', name: 'Svenska' }, { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' }, { code: 'el', name: 'Ελληνικά' }, { code: 'he', name: 'עברית' },
  { code: 'fa', name: 'فارسی' }, { code: 'ur', name: 'اردو' }, { code: 'sw', name: 'Kiswahili' },
]


// 雙語輸出 + 占位高亮
function BilingualOutput({ text }) {
  if (!text) return null

  // 分段：按 === 標題分割
  const parts = text.split(/={3,}\s*/).filter(Boolean)
  
  // 高亮【】占位
  const highlight = (str) => {
    if (!str) return null
    const segs = str.split(/(【.*?】)/g)
    return segs.map((s, i) => {
      if (/^【.*】$/.test(s)) {
        return <mark key={i} className={styles.placeholder}>{s.slice(1, -1)}</mark>
      }
      return <span key={i}>{s}</span>
    })
  }

  if (parts.length >= 2) {
    const sections = []
    for (let i = 0; i < parts.length; i += 2) {
      const title = parts[i]?.trim()
      const content = parts[i + 1]?.trim()
      if (!content) continue
      sections.push({ title, content })
    }

    return (
      <div className={styles.bilingual}>
        {sections.map((sec, i) => (
          <div key={i} className={styles.bilingualSection}>
            <div className={styles.bilingualLabel}>
              {sec.title.includes('俄语') ? '🇷🇺 ' : sec.title.includes('中文') || sec.title.includes('对照') ? '🇨🇳 ' : ''}
              {sec.title}
            </div>
            <div className={sec.title.includes('中文') || sec.title.includes('对照') || sec.title.includes('说明') ? styles.bilingualTextCn : styles.bilingualText}>
              {highlight(sec.content)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 沒標題格式：直接高亮任何【】占位後顯示
  return <p className={styles.bilingualText}>{highlight(text)}</p>
}
export default function Workspace() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState('translate')
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('正式')
  const [target, setTarget] = useState('教授')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [useCount, setUseCount] = useState(0)
  const [toast, setToast] = useState('')
  const [copied, setCopied] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchHistory()
    } else {
      setUseCount(parseInt(localStorage.getItem('rusai_use_count') || '0'))
    }
  }, [session])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error('Fetch history error:', e)
    }
  }

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleGenerate = async () => {
    if (!input.trim()) return
    
    if (!session) {
      if (useCount >= 10) { showToast('免費次數已用完，請登錄或升級Pro'); return }
    }
    
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, text: input, tone, target })
      })
      const data = await res.json()
      if (data.result) {
        setOutput(data.result)
        
        if (session) {
          await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode, input, output: data.result, tone, target })
          })
          fetchHistory()
        } else {
          const newCount = useCount + 1
          setUseCount(newCount)
          localStorage.setItem('rusai_use_count', newCount.toString())
          
          const entry = { mode, input, output: data.result, time: new Date().toISOString() }
          const localHistory = JSON.parse(localStorage.getItem('rusai_history') || '[]')
          localStorage.setItem('rusai_history', JSON.stringify([entry, ...localHistory].slice(0, 50)))
        }
      }
    } catch(e) { showToast('出错了，请重试') }
    setLoading(false)
  }


  if (status === 'loading') return <div className={styles.loading}>加載中...</div>

  return (
    <div className={styles.container}>
      <Head><title>RusAI 工作台</title></Head>
      
      {toast && <div className={styles.toast}>{toast}</div>}
      
      <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>
      
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>RusAI</div>
        </div>
        <div className={styles.menu}>
          <div className={styles.menuLabel}>🧠 功能</div>
          {modes.map(m => (
            <button key={m.id} className={`${styles.menuItem} ${mode === m.id ? styles.active : ''}`}
              onClick={() => { setMode(m.id); setOutput(''); setSidebarOpen(false) }}>
              {m.icon} {m.label}
            </button>
          ))}
          
          <div className={styles.menuLabel}>📄 历史</div>
          <button className={styles.menuItem} onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '隱藏歷史' : '查看歷史'} ({history.length})
          </button>
          
          <div className={styles.menuLabel}>👤 帳號</div>
          {session ? (
            <>
              <div className={styles.userInfo}>{session.user?.name || session.user?.email}</div>
              <button className={styles.menuItem} onClick={() => signOut()}>退出登錄</button>
            </>
          ) : (
            <button className={styles.menuItem} onClick={() => router.push('/login')}>登錄 / 註冊</button>
          )}
          
          {!session && (
            <div className={styles.useCount}>今日使用：{useCount}/10</div>
          )}
        </div>
      </div>
      
      <div className={styles.main}>
        <h2 className={styles.modeTitle}>{modes.find(m => m.id === mode)?.icon} {modes.find(m => m.id === mode)?.label}</h2>
        
        <textarea className={styles.input} rows={4}
          placeholder={mode === 'translate' ? '请输入中文或俄语...' : mode === 'email' ? '例如：申请延期提交论文' : mode === 'optimize' ? '输入你的俄语句子...' : '例如：本研究具有重要意义'}
          value={input} onChange={e => setInput(e.target.value)} />
        
        <div className={styles.options}>
          {mode === 'translate' && (
            <>
              <div className={styles.optionGroup}>
                <label>从</label>
                <select className={styles.langSelect} value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
              <div className={styles.optionGroup}>
                <label>到</label>
                <select className={styles.langSelect} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
            </>
          )}
          {mode !== 'optimize' && (
            <div className={styles.optionGroup}>
              <label>语气</label>
              <div className={styles.chips}>
                {(tones[mode] || ['日常', '正式']).map(t => (
                  <button key={t} className={`${styles.chip} ${tone === t ? styles.chipActive : ''}`}
                    onClick={() => setTone(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}
          {mode === 'email' && (
            <div className={styles.optionGroup}>
              <label>对象</label>
              <div className={styles.chips}>
                {['教授', '客户', '学校'].map(t => (
                  <button key={t} className={`${styles.chip} ${target === t ? styles.chipActive : ''}`}
                    onClick={() => setTarget(t)}>{t}</button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button className={styles.genBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? '生成中...' : '生成' + (mode === 'translate' ? (sourceLang === targetLang ? '扩写' : '') : '')}
        </button>
        
        {loading && !output && (
          <div className={styles.skeleton}>
            <div className={styles.skeletonLine} style={{ width: '80%' }} />
            <div className={styles.skeletonLine} style={{ width: '60%' }} />
            <div className={styles.skeletonLine} style={{ width: '70%' }} />
          </div>
        )}
        
        {output && (
          <div className={styles.output}>
            <h3>结果</h3>
            <BilingualOutput text={output} />
            <div className={styles.outputActions}>
              <button onClick={() => handleCopy(output)}>
                {copied ? '✅ 已复制!' : '📋 复制'}
              </button>
              <button onClick={handleGenerate}>🔄 重新生成</button>
            </div>
          </div>
        )}
        
        {showHistory && (
          <div className={styles.historyPanel}>
            <h3>歷史記錄</h3>
            {history.length === 0 ? (
              <p className={styles.empty}>暫無歷史記錄</p>
            ) : (
              history.map((h, i) => (
                <div key={h.id || i} className={styles.historyItem}>
                  <div className={styles.historyMeta}>
                    <span>{modes.find(m => m.id === h.mode)?.icon} {modes.find(m => m.id === h.mode)?.label}</span>
                    <span>{new Date(h.createdAt || h.time).toLocaleString('zh-CN')}</span>
                  </div>
                  <div className={styles.historyInput}>{h.input}</div>
                  <div className={styles.historyOutput}>{h.output}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
