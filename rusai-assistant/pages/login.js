import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import styles from '../styles/Auth.module.css'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (isLogin) {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      if (result.error) {
        setError('登錄失敗，請檢查郵箱和密碼')
      } else {
        router.push('/workspace')
      }
    } else {
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })
        
        if (res.ok) {
          await signIn('credentials', { email, password, redirect: false })
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
      <div className={styles.card}>
        <h1 className={styles.logo}>RusAI</h1>
        <h2>{isLogin ? '歡迎回來' : '創建帳號'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <input
              type="text"
              placeholder="姓名"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.input}
            />
          )}
          <input
            type="email"
            placeholder="郵箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={styles.input}
          />
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
