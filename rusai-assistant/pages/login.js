import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useTheme } from '../lib/ThemeContext'
import styles from '../styles/Auth.module.css'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [login, setLogin] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { dark, toggleTheme } = useTheme()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (isLogin) {
      const result = await signIn('credentials', {
        login: login,
        password,
        redirect: false
      })
      
      if (result.error) {
        setError('登錄失敗，請檢查郵箱/用戶名和密碼')
      } else {
        router.push('/workspace')
      }
    } else {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email || undefined, username: username || undefined, password, name })
        })
        
        if (res.ok) {
          await signIn('credentials', {
            login: email || username,
            password,
            redirect: false
          })
          router.push('/workspace')
        } else {
          const data = await res.json()
          setError(data.error || '註冊失敗')
        }
      } catch (e) {
        setError('註冊失敗')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <div style={{position:'fixed',top:16,right:16,zIndex:10}}>
        <button className="themeToggle" onClick={toggleTheme}>{dark ? '☀️' : '🌙'}</button>
      </div>
      <div className={styles.card}>
        <h1 className={styles.logo}>RusAI</h1>
        <h2>{isLogin ? '歡迎回來' : '創建帳號'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {isLogin ? (
            <input
              type="text"
              placeholder="郵箱或用戶名"
              value={login}
              onChange={e => setLogin(e.target.value)}
              required
              className={styles.input}
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="用戶名（可選）"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className={styles.input}
              />
              <input
                type="email"
                placeholder="郵箱（可選）"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.input}
              />
              {!isLogin && (
                <input
                  type="text"
                  placeholder="暱稱"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={styles.input}
                />
              )}
            </>
          )}
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? '處理中...' : (isLogin ? '登錄' : '註冊')}
          </button>
          
          <div style={{display:'flex',alignItems:'center',gap:12,margin:'8px 0'}}>
            <div style={{flex:1,height:1,background:'var(--border)'}}></div>
            <span style={{fontSize:13,color:'var(--text-secondary)'}}>或</span>
            <div style={{flex:1,height:1,background:'var(--border)'}}></div>
          </div>
          
          <button type="button" onClick={() => signIn('google', { callbackUrl: '/workspace' })}
            style={{width:'100%',padding:'10px',background:'var(--card-bg)',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer',fontSize:14,color:'var(--text)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span style={{fontSize:18}}>G</span> 使用 Google 登錄
          </button>
        </form>
        
        <p className={styles.switch}>
          {isLogin ? '還沒有帳號？' : '已有帳號？'}
          <button onClick={() => setIsLogin(!isLogin)} className={styles.link}>
            {isLogin ? '立即註冊' : '立即登錄'}
          </button>
        </p>
      </div>
    </div>
  )
}
