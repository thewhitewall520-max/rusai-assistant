// ExampleCarousel — 首页动态样例句轮播
import { useState, useEffect } from 'react'

const EXAMPLES = [
  { id: 'email', icon: '✉️', input: '"明天要请假"', output: '→ 生成请假邮件（英语）', color: '#2563eb' },
  { id: 'translate', icon: '🌐', input: '"欢迎光临"', output: '→ 翻译成地道俄语', color: '#7c3aed' },
  { id: 'academic', icon: '📚', input: '"本研究具有重要意义"', output: '→ 学术表达优化', color: '#059669' },
  { id: 'optimize', icon: '✨', input: '"This is very important"', output: '→ 优化为更地道的表达', color: '#d97706' },
]

const styles = {
  container: {
    marginTop: '32px',
    width: '100%',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  card: {
    background: 'var(--card-bg)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '20px 24px',
    transition: 'all 0.4s ease',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
    lineHeight: '1.6',
    color: 'var(--text)',
  },
  input: {
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },
  arrow: {
    color: 'var(--primary)',
    fontWeight: 600,
  },
  output: {
    color: 'var(--text)',
    fontWeight: 500,
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '12px',
  },
  dot: (active) => ({
    width: active ? '20px' : '6px',
    height: '6px',
    borderRadius: '3px',
    background: active ? 'var(--primary)' : 'var(--border)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s ease',
  }),
}

export default function ExampleCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    var timer = setInterval(function() {
      setCurrent(function(prev) { return (prev + 1) % EXAMPLES.length })
    }, 5000)
    return function() { clearInterval(timer) }
  }, [])

  var ex = EXAMPLES[current]

  return (
    <div style={styles.container}>
      <div key={ex.id} style={styles.card}>
        <div style={styles.row}>
          <span style={{fontSize:'24px'}}>{ex.icon}</span>
          <span style={styles.input}>{ex.input}</span>
          <span style={styles.arrow}>→</span>
          <span style={styles.output}>{ex.output}</span>
        </div>
      </div>
      <div style={styles.dots}>
        {EXAMPLES.map(function(_, i) {
          return <button key={i} style={styles.dot(i === current)} onClick={function(){setCurrent(i)}} />
        })}
      </div>
    </div>
  )
}
