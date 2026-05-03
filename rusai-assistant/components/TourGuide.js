import { useState, useEffect, useCallback } from 'react'

const STEPS = [
  {
    icon: '🌐',
    title: '智能翻译',
    desc: '输入中文或外语，选择语种和语气，一键翻译'
  },
  {
    icon: '✉️',
    title: '邮件生成',
    desc: '给教授、客户、学校，自动生成地道外语邮件'
  },
  {
    icon: '✨',
    title: '句子优化',
    desc: '输入你的句子，AI帮你优化得更地道'
  },
  {
    icon: '📚',
    title: '学术表达',
    desc: '论文、报告的学术句式生成'
  }
]

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name, value) {
  document.cookie = `${name}=${value}; max-age=31536000; path=/`
}

export default function TourGuide() {
  const [visible, setVisible] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!getCookie('hasSeenTour')) {
      setVisible(true)
      requestAnimationFrame(() => setFadeIn(true))
    }
  }, [])

  const close = useCallback(() => {
    setFadeIn(false)
    setTimeout(() => {
      setVisible(false)
      setCookie('hasSeenTour', '1')
    }, 300)
  }, [])

  const next = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      close()
    }
  }, [step, close])

  const prev = useCallback(() => {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      prev()
    } else if (e.key === 'ArrowRight') {
      next()
    } else if (e.key === 'Escape') {
      close()
    }
  }, [prev, next, close])

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible, handleKeyDown])

  if (!visible) return null

  const isLastStep = step === STEPS.length - 1
  const isFirstStep = step === 0

  const current = STEPS[step]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: fadeIn ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease',
        padding: '16px',
      }}
    >
      {/* Close button */}
      <button
        onClick={close}
        aria-label="关闭引导"
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
      >
        ✕
      </button>

      {/* Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px 32px',
          textAlign: 'center',
          transform: fadeIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
          opacity: fadeIn ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Step indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: i === step ? '#4f46e5' : '#d1d5db',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            lineHeight: 1,
          }}
        >
          {current.icon}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 12px',
          }}
        >
          🎯 欢迎使用 RusAI
        </h2>

        {/* Current step content */}
        <div
          style={{
            fontSize: '15px',
            color: '#4b5563',
            lineHeight: 1.6,
            marginBottom: '32px',
            minHeight: '48px',
          }}
        >
          <strong style={{ color: '#4f46e5' }}>{current.title}</strong>
          <br />
          {current.desc}
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {!isFirstStep ? (
            <button
              onClick={prev}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#374151',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af' }}
              onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db' }}
            >
              ← 上一步
            </button>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {isLastStep ? (
            <button
              onClick={close}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: '#4f46e5',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#4338ca'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.4)' }}
              onMouseOut={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.3)' }}
            >
              开始使用 →
            </button>
          ) : (
            <button
              onClick={next}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                background: '#4f46e5',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#4338ca' }}
              onMouseOut={e => { e.currentTarget.style.background = '#4f46e5' }}
            >
              下一步 →
            </button>
          )}
        </div>

        {/* Step counter text */}
        <p
          style={{
            margin: '16px 0 0',
            fontSize: '13px',
            color: '#9ca3af',
          }}
        >
          {step + 1} / {STEPS.length}
        </p>
      </div>

      {/* Mobile: reduce card padding */}
      <style>{`
        @media (max-width: 480px) {
          .tour-card {
            padding: 32px 20px 24px !important;
          }
        }
      `}</style>
    </div>
  )
}
