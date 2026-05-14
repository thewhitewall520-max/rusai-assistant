import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px', textAlign: 'center',
          background: 'var(--bg-secondary)', borderRadius: '12px',
          border: '1px solid var(--border)', margin: '20px 0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text)' }}>出错了</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
            生成过程中遇到问题，请稍后重试
          </p>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 24px', background: 'var(--primary)', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}>
            重试
          </button>
          {this.props.showError && this.state.error && (
            <details style={{ marginTop: '12px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>详细信息</summary>
              <pre style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
