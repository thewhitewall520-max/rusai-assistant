import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import TourGuide from '../components/TourGuide'

export function getServerSideProps() {
  return { props: {} }
}

export default function Home() {
  const [demoInput, setDemoInput] = useState('')
  const [demoOutput, setDemoOutput] = useState('')
  const [demoLoading, setDemoLoading] = useState(false)

  const handleDemo = async () => {
    if (!demoInput.trim()) return
    setDemoLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'translate', text: demoInput, tone: '日常', sourceLang: 'zh', targetLang: 'ru' })
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
        <title>RusAI - 用更地道的外语表达自己 | AI多语种写作助手</title>
        <meta name="description" content="RusAI 是AI多语种写作助手，支持60+语言的翻译、邮件生成、句子优化、学术表达，让您的表达更地道。" />
        <meta name="keywords" content="翻译,AI写作,多语种,外语学习,写作助手" />
        <meta property="og:title" content="RusAI - 用更地道的外语表达自己" />
        <meta property="og:description" content="一键生成邮件 / 翻译 / 学术表达 — 支持60+语言" />
        <meta property="og:url" content="https://rusai.cc" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RusAI - AI多语种写作助手" />
        <meta name="twitter:description" content="让外语表达更简单" />
        <link rel="canonical" href="https://rusai.cc" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>RusAI</span>
          <div className={styles.navActions}>
            <div className={styles.navLinks}>
              <a href="#features">功能</a>
              <a href="/workspace" className={styles.loginBtn}>开始使用</a>
            </div>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <h1 className={styles.title}>用更地道的外语表达自己</h1>
        <p className={styles.subtitle}>一键生成邮件 / 翻译 / 学术表达 — 支持60+语言</p>
        <div className={styles.demoBox}>
          <textarea
            className={styles.demoInput}
            placeholder="输入内容，例如：欢迎光临"
            value={demoInput}
            onChange={e => setDemoInput(e.target.value)}
            rows={3}
          />
          <button className={styles.demoBtn} onClick={handleDemo} disabled={demoLoading}>
            {demoLoading ? '生成中...' : '生成 →'}
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
            { icon: '✉️', title: '邮件生成', desc: '给教授、客户、学校，一键生成地道外语邮件' },
            { icon: '✨', title: '句子优化', desc: '输入你的句子，AI帮你优化得更地道' },
            { icon: '📚', title: '学术表达', desc: '论文、报告的学术句式生成，地道准确' },
          ].map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing section removed - will add when payment is integrated */}

      <TourGuide />

      <footer className={styles.footer}>
        <p>RusAI © 2026 — 让外语表达更简单</p>
      </footer>
    </div>
  )
}
