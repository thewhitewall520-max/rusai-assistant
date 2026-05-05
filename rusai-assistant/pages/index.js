import Head from 'next/head'
import { useState } from 'react'
import styles from '../styles/Home.module.css'
import TourGuide from '../components/TourGuide'
import ExampleCarousel from '../components/ExampleCarousel'

export function getServerSideProps() {
  return { props: {} }
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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

        <div className={styles.heroCard}>
          <div className={styles.heroFakeInput}>
            <span>✏️ 输入内容，例如：欢迎光临</span>
          </div>
          <a href="/workspace" className={styles.heroCta}>🚀 立即免费使用 →</a>
          <p style={{marginTop:'12px',fontSize:'13px',color:'var(--text-secondary)'}}>无需注册，打开即用 · 每天免费 10 次</p>
        </div>

        <div className={styles.howItWorks}>
          <h3 className={styles.howTitle}>4 步轻松上手</h3>
          <div className={styles.steps}>
            <span className={styles.step}><span className={styles.stepNum}>1</span> 选择语言</span>
            <span style={{color:'var(--border)'}}>|</span>
            <span className={styles.step}><span className={styles.stepNum}>2</span> 选择模式</span>
            <span style={{color:'var(--border)'}}>|</span>
            <span className={styles.step}><span className={styles.stepNum}>3</span> 输入内容</span>
            <span style={{color:'var(--border)'}}>|</span>
            <span className={styles.step}><span className={styles.stepNum}>4</span> 一键生成</span>
          </div>
        </div>

        <ExampleCarousel />
      </section>

      <section id="features" className={styles.features}>
        <h2>核心功能</h2>
        <div className={styles.featureGrid}>
          {[
            { icon: '🌐', title: '智能翻译', desc: '日常/正式/学术/商务随意切换' },
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

      <TourGuide />

      <footer className={styles.footer}>
        <p>RusAI © 2026 — 让外语表达更简单</p>
      </footer>
    </div>
  )
}
