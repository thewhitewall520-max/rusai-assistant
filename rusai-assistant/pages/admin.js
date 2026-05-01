import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useTheme } from '../lib/ThemeContext'

export function getServerSideProps() {
  return { props: {} }
}

export default function Admin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { dark, toggleTheme } = useTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (status === 'loading' || loading) {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text-secondary)'}}>載入中...</div>
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',color:'var(--text)',fontFamily:'-apple-system,sans-serif',padding:40}}>
      <Head><title>RusAI 管理後台</title></Head>
      
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:40}}>
        <h1 style={{fontSize:24}}>📊 RusAI 管理後台</h1>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontSize:14,color:'var(--text-secondary)'}}>{session?.user?.name}</span>
          <button className="themeToggle" onClick={toggleTheme}>{dark ? '☀️' : '🌙'}</button>
          <a href="/workspace" style={{color:'var(--primary)',fontSize:14}}>← 工作台</a>
          <button onClick={signOut} style={{padding:'6px 14px',background:'var(--hover)',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',color:'var(--text)'}}>退出</button>
        </div>
      </div>

      {stats && (
        <>
          <div style={{display:'flex',gap:24,marginBottom:32}}>
            <div style={{flex:1,padding:24,background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:12}}>
              <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>👥 總用戶數</div>
              <div style={{fontSize:36,fontWeight:700,color:'var(--primary)'}}>{stats.totalUsers}</div>
            </div>
            <div style={{flex:1,padding:24,background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:12}}>
              <div style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>📝 總生成次數</div>
              <div style={{fontSize:36,fontWeight:700,color:'var(--primary)'}}>{stats.totalUsage}</div>
            </div>
          </div>

          <h2 style={{fontSize:18,marginBottom:16}}>最近用戶</h2>
          <div style={{background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'var(--bg-secondary)'}}>
                  <th style={thStyle}>用戶</th>
                  <th style={thStyle}>郵箱</th>
                  <th style={thStyle}>用戶名</th>
                  <th style={thStyle}>使用次數</th>
                  <th style={thStyle}>註冊時間</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map(u => (
                  <tr key={u.id} style={{borderBottom:'1px solid var(--border)'}}>
                    <td style={tdStyle}>{u.name || '-'}</td>
                    <td style={tdStyle}>{u.email}</td>
                    <td style={tdStyle}>{u.username || '-'}</td>
                    <td style={tdStyle}>{u.usageCount}</td>
                    <td style={tdStyle}>{new Date(u.createdAt).toLocaleString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {!stats && !loading && (
        <p style={{color:'var(--text-secondary)'}}>無法載入統計數據</p>
      )}
    </div>
  )
}

const thStyle = {padding:'12px 16px',textAlign:'left',fontSize:13,color:'var(--text-secondary)',fontWeight:500,borderBottom:'1px solid var(--border)'}
const tdStyle = {padding:'12px 16px',fontSize:14}
