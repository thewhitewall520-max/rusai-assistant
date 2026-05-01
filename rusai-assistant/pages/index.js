import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [demoInput, setDemoInput] = useState('')
  const [demoOutput, setDemoOutput] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemo = async () => {
    if (!demoInput.trim()) return
    setDemoLoading(true)
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: demoInput, tone: 'formal', target: 'ru' })
      })
      const data = await res.json()
      setDemoOutput(data.result || '出错了')
    } catch (e) {
      setDemoOutput('出错了，请重试')
    }
    setDemoLoading(false)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>RusAI - 用更地道的俄语表达自己 | AI俄语写作助手</title>
        <meta name="description" content="RusAI 是专为留学生和外贸人打造的AI俄语写作助手，支持中俄翻译、俄语邮件生成、学术表达优化，让您的俄语更地道。" />
        <meta name="keywords" content="俄语翻译,AI写作,俄语邮件,俄语学习,中俄翻译,俄语助手" />
        <meta property="og:title" content="RusAI - 用更地道的俄语表达自己" />
        <meta property="og:description" content="一键生成邮件 / 翻译 / 学术表达 — 专为留学生和外贸人打造" />
        <meta property="og:url" content="https://rusai.cc" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RusAI - AI俄语写作助手" />
        <meta name="twitter:description" content="让俄语表达更简单" />
        <link rel="canonical" href="https://rusai.cc" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>RusAI</span>
          <div className={styles.navLinks}>
            <a href="#features">功能</a>
            <a href="#pricing">价格</a>
            <a href="/workspace" className={styles.loginBtn}>开始使用</a>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <h1 className={styles.title}>用更地道的俄语表达自己</h1>
        <p className={styles.subtitle}>一键生成邮件 / 翻译 / 学术表达 — 专为留学生和外贸人打造</p>
        <div className={styles.demoBox}>
          <textarea
            className={styles.demoInput}
            placeholder="输入中文，例如：我想申请延期毕业"
            value={demoInput}
            onChange={e => setDemoInput(e.target.value)}
            rows={3}
          />
          <button className={styles.demoBtn} onClick={handleDemo} disabled={demoLoading}>
            {demoLoading ? '生成中...' : '生成俄语 →'}
          </button>
          {demoOutput && (
            <div className={styles.demoOutput}>
              <p>{demoOutput}</p>
              <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(demoOutput)}>复制</button>
            </div>
          )}
        </div>
      </section>

      <section id="features" className={styles.features}>
        <h2>核心功能</h2>
        <div className={styles.featureGrid}>
          {[
            { icon: '🌐', title: '智能翻译', desc: '带语气的翻译，日常/正式/学术/商务随意切换' },
            { icon: '✉️', title: '邮件生成', desc: '给教授、客户、学校，一键生成地道俄语邮件' },
            { icon: '✨', title: '句子优化', desc: '输入你的俄语，AI帮你优化得更地道' },
            { icon: '📚', title: '学术表达', desc: '论文、报告的学术句式生成，更像母语者写的' },
          ].map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className={styles.pricing}>
        <h2>简单定价</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.priceCard}>
            <h3>免费</h3>
            <p className={styles.price}>$0</p>
            <ul>
              <li>每天10次使用</li>
              <li>基础语气</li>
              <li>历史记录</li>
            </ul>
            <a href="/workspace" className={styles.priceBtn}>开始使用</a>
          </div>
          <div className={`${styles.priceCard} ${styles.proCard}`}>
            <h3>Pro</h3>
            <p className={styles.price}>$5<span>/月</span></p>
            <ul>
              <li>无限使用</li>
              <li>全部语气</li>
              <li>高级表达优化</li>
            </ul>
            <a href="/workspace" className={`${styles.priceBtn} ${styles.proBtn}`}>升级Pro</a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>RusAI © 2026 — 让俄语表达更简单</p>
      </footer>
    </div>
  )
}
