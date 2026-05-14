import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Admin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats).catch(console.error)
    fetch('/api/admin/feedbacks').then(r => r.json()).then(d => setFeedbacks(d.feedbacks || [])).catch(console.error)
  }, [])

  if (status === 'loading') return <div>加载中...</div>
  if (!session) return null

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>📊 RusAI 管理后台</h1>
      
      {stats && (
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>使用统计</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', background: '#f5f0e8', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5b7a5e' }}>{stats.totalUsage || 0}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>总调用次数</div>
            </div>
            <div style={{ padding: '20px', background: '#f5f0e8', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5b7a5e' }}>{stats.todayUsage || 0}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>今日调用</div>
            </div>
            <div style={{ padding: '20px', background: '#f5f0e8', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5b7a5e' }}>{(stats.goodRate || 0).toFixed(0)}%</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>好评率</div>
            </div>
            <div style={{ padding: '20px', background: '#f5f0e8', borderRadius: '10px' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#5b7a5e' }}>{stats.uniqueUsers || 0}</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>独立用户</div>
            </div>
          </div>

          {stats.modeDistribution && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>各模式使用分布</h3>
              {Object.entries(stats.modeDistribution).map(([mode, count]) => (
                <div key={mode} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', fontSize: '13px' }}>{mode}</span>
                  <div style={{ flex: 1, height: '20px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / Math.max(...Object.values(stats.modeDistribution))) * 100}%`, background: '#5b7a5e', borderRadius: '4px', minWidth: '4px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#666', width: '40px', textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {feedbacks.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>最近反馈</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {feedbacks.slice(0, 10).map((fb, i) => (
              <div key={fb.id || i} style={{ padding: '12px', background: '#faf6ef', border: '1px solid #e0d8cc', borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>{fb.mode} {fb.rating === 'good' ? '👍' : '👎'}</span>
                  <span style={{ color: '#888' }}>{fb.sourceLang}→{fb.targetLang}</span>
                </div>
                <div style={{ color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fb.input}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!stats && !feedbacks.length && <div style={{ color: '#888' }}>暂无数据</div>}
    </div>
  )
}
