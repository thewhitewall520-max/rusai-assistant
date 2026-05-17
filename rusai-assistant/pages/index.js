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
              <a href="#demo-input">Guided Demo</a>
              <a href="#features">功能</a>
              <a href="#pricing">套餐定价</a>
              <a href="/demo" className={styles.navCta}>看 AI 回客户 →</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>24小时替你接待客户的 AI 招生员工</h1>
          <p className={styles.heroSub}>
            不漏一条咨询，自动回复、识别高意向客户、生成中俄双语跟进
          </p>
          <p className={styles.heroStat}>少请1个客服 · 不错过任何线索</p>
          <div className={styles.heroActions}>
            <a href="/demo" className={styles.heroPrimary}>看 AI 怎么接待客户 →</a>
            <a href="mailto:sales@rusai.cc" className={styles.heroSecondary}>预约15分钟，看 AI 替你接客户</a>
          </div>
        </div>

        {/* Inbox Mockup */}
        <div className={styles.heroInboxMockup}>
          <div className={styles.heroInboxHeader}>
            <span>💬 Inbox <span className={styles.heroInboxBadge}>2 未读</span></span>
            <span>👤 ▸</span>
          </div>
          <div className={styles.heroInboxBody}>
            {/* Left: conversation list */}
            <div className={styles.heroInboxList}>
              <div className={`${styles.heroInboxItem} ${styles.heroInboxItemActive}`}>
                <span className={styles.heroInboxDot} />
                <div>
                  <div>陈晓 · 微信</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>预科开课时间？</div>
                </div>
              </div>
              <div className={styles.heroInboxItem}>
                <span className={styles.heroInboxDot} />
                <div>
                  <div>李明浩 · 小红书</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>签证邀请函多久？</div>
                </div>
              </div>
              <div className={styles.heroInboxItem}>
                <div>
                  <div>Анна · Telegram</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>Спасибо!</div>
                </div>
              </div>
              <div className={styles.heroInboxItem}>
                <div>
                  <div>王芳 · 微信</div>
                  <div style={{color:'#64748b',fontSize:'11px'}}>帮我写俄语邮件</div>
                </div>
              </div>
            </div>
            {/* Center: chat */}
            <div className={styles.heroInboxChat}>
              <div className={`${styles.heroChatBubble} ${styles.heroChatBubbleUser}`}>
                你好，我想咨询俄罗斯留学
              </div>
              <div className={`${styles.heroChatBubble} ${styles.heroChatBubbleAgent}`}>
                你好！欢迎咨询 🎯 请问你想了解哪方面？选校、费用、还是签证？
              </div>
              <div className={`${styles.heroChatBubble} ${styles.heroChatBubbleUser}`}>
                我不会俄语，可以申请吗？
              </div>
              <div className={styles.heroChatTyping}>
                <span className={styles.heroChatTypingDot} />
                <span className={styles.heroChatTypingDot} />
                <span className={styles.heroChatTypingDot} />
                <span style={{marginLeft:'6px',fontSize:'12px',color:'#64748b'}}>AI 正在生成回复...</span>
              </div>
            </div>
            {/* Right: customer profile */}
            <div className={styles.heroInboxProfile}>
              <div className={styles.heroProfileField}>
                <div className={styles.heroProfileLabel}>客户</div>
                <div>🧑 陈晓</div>
              </div>
              <div className={styles.heroProfileField}>
                <div className={styles.heroProfileLabel}>来源</div>
                <div>微信</div>
              </div>
              <div className={styles.heroProfileField}>
                <div className={styles.heroProfileLabel}>标签</div>
                <span className={styles.heroProfileTag}>高意向</span>
                <span className={styles.heroProfileTag} style={{marginLeft:'4px'}}>留学咨询</span>
              </div>
              <div className={styles.heroProfileField}>
                <div className={styles.heroProfileLabel}>语言</div>
                <div>中文</div>
              </div>
              <div className={styles.heroProfileSuggest}>
                🤖 AI 建议：发送试听课邀请
              </div>
            </div>
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

      {/* Guided Demo */}
      <section id="demo-input" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>看看 AI 怎么替你接客户</h2>
          <p className={styles.sectionDesc}>点击任意场景，看 AI 如何秒回真实客户咨询</p>
          <div className={styles.guidedDemoGrid}>
            <a href="/demo?demo=cant_speak_russian" className={styles.guidedDemoCard}>
              <span className={styles.guidedDemoAvatar}>🧑‍🎓</span>
              <p className={styles.guidedDemoQ}>我不会俄语可以申请俄罗斯留学吗？</p>
              <p className={styles.guidedDemoHint}>AI 会分析用户语言能力，推荐英语授课项目 + 免费预科课程</p>
              <span className={styles.guidedDemoCta}>→ 查看 AI 回复</span>
            </a>
            <a href="/demo?demo=tuition" className={styles.guidedDemoCard}>
              <span className={styles.guidedDemoAvatar}>🧑‍🎓</span>
              <p className={styles.guidedDemoQ}>莫斯科大学学费多少钱一年？</p>
              <p className={styles.guidedDemoHint}>AI 会查询最新学费数据，中俄双语回复</p>
              <span className={styles.guidedDemoCta}>→ 查看 AI 回复</span>
            </a>
            <a href="/demo?demo=visa" className={styles.guidedDemoCard}>
              <span className={styles.guidedDemoAvatar}>🧑‍🎓</span>
              <p className={styles.guidedDemoQ}>签证邀请函多久能下来？</p>
              <p className={styles.guidedDemoHint}>AI 会给出办理流程 + 时间线 + 材料清单</p>
              <span className={styles.guidedDemoCta}>→ 查看 AI 回复</span>
            </a>
            <a href="/demo?demo=midnight" className={styles.guidedDemoCard}>
              <span className={styles.guidedDemoAvatar}>🧑‍🎓</span>
              <p className={styles.guidedDemoQ}>凌晨2点咨询，有人回吗？</p>
              <p className={styles.guidedDemoHint}>AI 7x24 值守，秒回客户，不留一条线索过夜</p>
              <span className={styles.guidedDemoCta}>→ 查看 AI 回复</span>
            </a>
          </div>
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
          <h2 className={styles.sectionTitle}>专门为俄罗斯留学机构打造</h2>
          <p className={styles.sectionDesc}>从招生咨询到签证办理，覆盖留学全链路</p>
          <div className={styles.scenarioGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎓</span>
              <h3>留学中介</h3>
              <p>招生咨询 / 选校 / 签证 / offer —— AI 全程自动接待</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📖</span>
              <h3>俄语培训</h3>
              <p>课程咨询 / 试听预约 / 学习规划 —— 24h 不打烊</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>透明定价</h2>
          <p className={styles.sectionDesc}>按需选择，随时升级</p>
          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingName}>Starter</div>
              <div className={styles.pricingPrice}>¥999/月</div>
              <div className={styles.pricingDesc}>适合小团队</div>
              <ul className={styles.pricingFeatures}>
                <li>FAQ 自动回复</li>
                <li>基础知识库</li>
                <li>AI 客服</li>
              </ul>
              <a href="/demo" className={styles.pricingBtn}>预约体验</a>
            </div>
            <div className={`${styles.pricingCard} ${styles.featured}`}>
              <div className={styles.pricingName}>Growth</div>
              <div className={styles.pricingPrice}>预约咨询</div>
              <div className={styles.pricingDesc}>最受欢迎</div>
              <ul className={styles.pricingFeatures}>
                <li>多渠道接入</li>
                <li>AI 客户分析</li>
                <li>双语回复</li>
                <li>内容助手</li>
              </ul>
              <a href="mailto:sales@rusai.cc" className={styles.pricingBtn}>预约咨询</a>
            </div>
            <div className={styles.pricingCard}>
              <div className={styles.pricingName}>Custom</div>
              <div className={styles.pricingPrice}>联系销售</div>
              <div className={styles.pricingDesc}>适合定制部署</div>
              <ul className={styles.pricingFeatures}>
                <li>私有化部署</li>
                <li>专属模型训练</li>
                <li>定制功能开发</li>
              </ul>
              <a href="mailto:sales@rusai.cc" className={styles.pricingBtnOutline}>联系销售</a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="proof" className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.proofHeader}>
            <div className={styles.proofTitle}>Demo 场景示例（模拟业务数据）</div>
            <div className={styles.proofSubtitle}>某俄罗斯留学机构 · 真实数据</div>
            <div className={styles.proofDemoTag}>Demo 模拟数据</div>
          </div>
          <div className={styles.proofGrid}>
            <div className={styles.proofCard}>
              <div className={styles.proofNumber}>83</div>
              <div className={styles.proofLabel}>本周已回复咨询</div>
            </div>
            <div className={styles.proofCard}>
              <div className={styles.proofNumber}>14</div>
              <div className={styles.proofLabel}>识别高意向客户</div>
            </div>
            <div className={styles.proofCard}>
              <div className={styles.proofNumber}>52</div>
              <div className={styles.proofLabel}>自动生成中俄回复</div>
            </div>
            <div className={styles.proofCard}>
              <div className={styles.proofNumber}>11h</div>
              <div className={styles.proofLabel}>人工节省时间</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.ctaTitle}>少请一个客服 · 不放过一条线索 · 24 小时接单</h2>
          <div className={styles.ctaActions}>
            <a href="/demo" className={styles.ctaPrimary}>看看 AI 的效果 →</a>
            <a href="mailto:sales@rusai.cc" className={styles.ctaSecondary}>预约专属演示（按你的业务）→</a>
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
