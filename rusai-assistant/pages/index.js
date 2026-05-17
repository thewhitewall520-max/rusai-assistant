import Head from 'next/head'
import styles from '../styles/Home.module.css'

export function getServerSideProps() {
  return { props: {} }
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <title>RusAI - 你的 AI 招生员工 | 7x24 自动招生客服</title>
        <meta name="description" content="RusAI 是 AI 招生员工，7x24 自动回复咨询、识别高意向客户、中俄双语回复，减少 80% 重复咨询工作。" />
        <meta name="keywords" content="AI招生,AI客服,留学客服,自动回复,中俄双语,教育科技" />
        <meta property="og:title" content="RusAI - 你的 AI 招生员工" />
        <meta property="og:description" content="7x24 自动回复咨询 · 自动识别高意向客户 · 自动生成中俄双语回复" />
        <meta property="og:url" content="https://rusai.cc" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="zh_CN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RusAI - 你的 AI 招生员工" />
        <meta name="twitter:description" content="减少 80% 重复咨询" />
        <link rel="canonical" href="https://rusai.cc" />
      </Head>

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>RusAI</span>
          <div className={styles.navActions}>
            <div className={styles.navLinks}>
              <a href="#pain">痛点</a>
              <a href="#demo-input">AI 演示</a>
              <a href="#features">功能</a>
              <a href="#scenarios">场景</a>
              <a href="/demo" className={styles.navCta}>免费体验 →</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>你的 AI 招生员工</h1>
          <p className={styles.heroSub}>
            7x24 自动回复咨询 · 自动识别高意向客户 · 自动生成中俄双语回复
          </p>
          <p className={styles.heroStat}>减少 <strong>80%</strong> 重复咨询</p>
          <div className={styles.heroActions}>
            <a href="/demo" className={styles.heroPrimary}>免费体验 →</a>
            <a href="mailto:sales@rusai.cc" className={styles.heroSecondary}>预约演示</a>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section id="pain" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>招生团队的日常痛点</h2>
          <div className={styles.painGrid}>
            <div className={styles.painCard}>
              <span className={styles.painIcon}>😫</span>
              <h3>客服回复到手软</h3>
              <p>AI 自动处理 <strong>80%</strong> 重复咨询，团队专注高价值转化</p>
            </div>
            <div className={styles.painCard}>
              <span className={styles.painIcon}>🌙</span>
              <h3>错过夜间咨询</h3>
              <p>7x24 值守，不漏一条线索，凌晨来的学生也能秒回</p>
            </div>
            <div className={styles.painCard}>
              <span className={styles.painIcon}>🌐</span>
              <h3>中俄沟通费劲</h3>
              <p>中俄双语原生回复，留学生和家长都能看懂</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Demo Input */}
      <section id="demo-input" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>试用 AI 招生客服</h2>
          <p className={styles.sectionDesc}>输入你想问的问题，看看 AI 怎么回复</p>
          <a href="/demo" className={styles.demoInputLink}>
            <div className={styles.demoInputFake}>
              <span>💬</span>
              <span className={styles.demoInputText}>去俄罗斯留学要准备什么？</span>
              <span className={styles.demoInputArrow}>→</span>
            </div>
            <p className={styles.demoInputHint}>点击进入 AI 演示 →</p>
          </a>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>核心功能</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🤖</span>
              <h3>AI 自动客服</h3>
              <p>智能回复招生咨询、FAQ、专业介绍，7x24 在线</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🧠</span>
              <h3>AI 业务脑</h3>
              <p>自动分析咨询记录，识别高意向客户，生成跟进建议</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>✍️</span>
              <h3>AI 内容助手</h3>
              <p>生成双语宣传文案、录取通知、课程介绍，效率翻倍</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section id="scenarios" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>适用场景</h2>
          <div className={styles.scenarioGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎓</span>
              <h3>留学中介</h3>
              <p>自动回复选校、签证、费用咨询，提升转化率</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📖</span>
              <h3>俄语培训</h3>
              <p>课程咨询、试听预约、学习规划，24h 不打烊</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🛒</span>
              <h3>跨境电商</h3>
              <p>中俄双语客服，自动处理订单、物流查询</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.ctaTitle}>今天就给你的业务配一个 AI 员工</h2>
          <div className={styles.ctaActions}>
            <a href="/demo" className={styles.ctaPrimary}>免费体验 →</a>
            <a href="mailto:sales@rusai.cc" className={styles.ctaSecondary}>预约演示</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>RusAI © 2026 — 你的 AI 招生员工</p>
      </footer>
    </div>
  )
}
