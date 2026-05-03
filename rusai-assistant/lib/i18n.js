import { createContext, useContext, useState, useEffect } from 'react'

const locales = {
  'zh-CN': require('./locales/zh-CN.json'),
  'en': require('./locales/en.json'),
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('zh-CN')
  const [messages, setMessages] = useState(locales['zh-CN'])

  const changeLang = (newLang) => {
    const code = newLang === 'en' ? 'en' : 'zh-CN'
    setLang(code)
    setMessages(locales[code])
    if (typeof window !== 'undefined') {
      document.documentElement.lang = code
    }
  }

  // 检测浏览器语言
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language || 'zh-CN'
      if (browserLang.startsWith('en')) changeLang('en')
    }
  }, [])

  const t = (key) => {
    const keys = key.split('.')
    let result = messages
    for (const k of keys) {
      result = result?.[k]
    }
    return result || key
  }

  return (
    <I18nContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
