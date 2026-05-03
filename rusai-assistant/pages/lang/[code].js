import Head from 'next/head'
import Link from 'next/link'

const LANG_INFO = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  th: { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
}

export async function getServerSideProps({ params }) {
  const code = params?.code || 'en'
  const info = LANG_INFO[code] || { name: code, nativeName: code, flag: '🌐' }
  return { props: { code, info } }
}

export default function LangPage({ code, info }) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <Head>
        <title>RusAI - AI Writing Assistant for {info.name} | {code?.toUpperCase()} Translation & Writing</title>
        <meta name="description" content={`AI-powered ${info.name} writing assistant. Translation, email generation, sentence polishing, academic writing in ${info.name}.`} />
        <link rel="canonical" href={`https://rusai.cc/lang/${code}`} />
        <link rel="alternate" href="https://rusai.cc" hrefLang="zh-CN" />
        <link rel="alternate" href={`https://rusai.cc/lang/${code}`} hrefLang={code} />
      </Head>

      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{info.flag}</div>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>RusAI for {info.nativeName}</h1>
      <p style={{ color: '#666', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6' }}>
        AI-powered writing assistant for {info.name}. 
        Translate, generate emails, polish sentences, and write academically — all in {info.nativeName}.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { icon: '🌐', title: 'Translation', desc: `Translate between ${info.nativeName} and 60+ languages` },
          { icon: '✉️', title: 'Email', desc: `Generate professional ${info.nativeName} emails` },
          { icon: '✨', title: 'Polish', desc: `Make your ${info.nativeName} more natural` },
          { icon: '📚', title: 'Academic', desc: `Academic writing in ${info.nativeName}` },
        ].map((f, i) => (
          <div key={i} style={{ padding: '16px', background: '#f5f0e8', borderRadius: '10px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '14px', margin: '0 0 4px' }}>{f.title}</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <a href="/workspace"
        style={{ display: 'inline-block', padding: '12px 32px', background: '#5b7a5e', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
        Start Writing in {info.nativeName} →
      </a>

      <div style={{ marginTop: '40px', fontSize: '12px', color: '#999' }}>
        <Link href="/" style={{ color: '#5b7a5e' }}>中文版</Link>
        {Object.entries(LANG_INFO).map(([c, l]) => (
          c !== code && (
            <span key={c}>
              <span> · </span>
              <Link href={`/lang/${c}`} style={{ color: '#5b7a5e' }}>{l.flag} {l.nativeName}</Link>
            </span>
          )
        ))}
      </div>
    </div>
  )
}
