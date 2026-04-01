import { useState, useRef, useEffect } from 'react'

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === '123456') {
      onUnlock()
    } else {
      setError(true)
      setPassword('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="password-page">
      <div className="lock-icon">🔒</div>
      <h2>Password Required</h2>
      <p>This case study is password-protected. Enter the password to view the full project details.</p>
      <form className="password-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          className={error ? 'error' : ''}
          autoComplete="off"
        />
        <button type="submit">Submit</button>
      </form>
      {error && <div className="password-error">Incorrect password. Please try again.</div>}
    </div>
  )
}