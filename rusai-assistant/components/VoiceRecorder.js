// VoiceRecorder — 浏览器语音识别组件
// 使用 Web Speech API，无需后端
import { useState, useRef } from 'react'

export default function VoiceRecorder({ onResult, lang }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)

  const langMap = { zh:'zh-CN', en:'en-US', ru:'ru-RU', ja:'ja-JP', ko:'ko-KR', fr:'fr-FR', de:'de-DE', es:'es-ES' }

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = langMap[lang] || 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (onResult) onResult(transcript)
      setListening(false)
    }

    recognition.onerror = () => {
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  if (!supported) {
    return (
      <span title="浏览器不支持语音识别" style={{ opacity:0.4, cursor:'not-allowed', fontSize:'20px' }}>
        🎤
      </span>
    )
  }

  return (
    <button
      onClick={listening ? stopListening : startListening}
      title={listening ? '停止录音' : '点击录音'}
      style={{
        background: listening ? '#ef4444' : 'var(--hover)',
        color: listening ? '#fff' : 'var(--text)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        animation: listening ? 'pulse 1s infinite' : 'none',
      }}
    >
      🎤
    </button>
  )
}
