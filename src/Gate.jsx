import { useState } from 'react'
import { ACCESS } from './access.js'

const UNLOCK_KEY = 'mycord_unlocked_v2'

function hexToBytes(hex) {
  const a = new Uint8Array(hex.length / 2)
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16)
  return a
}
function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
}
async function deriveHash(password, saltHex, iterations) {
  const enc = new TextEncoder()
  const km = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations, hash: 'SHA-256' }, km, 256
  )
  return bytesToHex(new Uint8Array(bits))
}

export default function Gate({ children }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(UNLOCK_KEY) === ACCESS.hash)
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)

  async function handleEnter() {
    if (!pw) return
    setBusy(true); setError('')
    const hash = await deriveHash(pw, ACCESS.salt, ACCESS.iterations)
    if (hash === ACCESS.hash) {
      // Запоминаем устройство, чтобы вводить ключ только один раз
      localStorage.setItem(UNLOCK_KEY, ACCESS.hash)
      setUnlocked(true)
    } else {
      setError('Неверный ключ. Гуляй 🚪')
      setDenied(true)
      setPw('')
      setTimeout(() => setDenied(false), 600)
    }
    setBusy(false)
  }

  if (unlocked) return children

  return (
    <div className="lock-screen">
      <div className={`lock-card ${denied ? 'shake' : ''}`}>
        <div className="lock-logo">
          <svg width="56" height="42" viewBox="0 0 127 96" fill="#fff"><path d="M107.7 8.07A105 105 0 0 0 81.47 0a72 72 0 0 0-3.36 6.83 97.7 97.7 0 0 0-29.11 0A72 72 0 0 0 45.64 0 105.9 105.9 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21A105.7 105.7 0 0 0 32.71 96.36 77.7 77.7 0 0 0 39.6 85.25a68 68 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.6 75.6 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.7 68.7 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1A105.2 105.2 0 0 0 126.6 80.22c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg>
        </div>
        <h1>MyCord</h1>
        <p className="lock-sub">Это закрытый сервер. Введи ключ доступа, чтобы войти.</p>
        <input className="lock-input" type="password" placeholder="Ключ доступа"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEnter()} autoFocus />
        {error && <div className="lock-error">{error}</div>}
        <button className="lock-btn" disabled={busy} onClick={handleEnter}>
          {busy ? 'Проверяю…' : 'Войти'}
        </button>
        <div className="lock-foot">🔒 Единый ключ · PBKDF2-SHA256 · вход без сервера</div>
      </div>
    </div>
  )
}
