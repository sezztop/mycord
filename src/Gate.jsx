import { useState, useEffect } from 'react'

const AUTH_KEY = 'mycord_auth_v1'
const SESSION_KEY = 'mycord_session_v1'
const ITERATIONS = 250000

/* ---- crypto helpers (Web Crypto, PBKDF2-SHA256) ---- */
function bytesToHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
}
function hexToBytes(hex) {
  const a = new Uint8Array(hex.length / 2)
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16)
  return a
}
async function deriveHash(password, salt) {
  const enc = new TextEncoder()
  const km = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, km, 256
  )
  return bytesToHex(new Uint8Array(bits))
}
function randomSalt() {
  const s = crypto.getRandomValues(new Uint8Array(16))
  return bytesToHex(s)
}
function strength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-ZА-Я]/.test(pw) && /[a-zа-я]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-zА-Яа-я0-9]/.test(pw)) s++
  return Math.min(s, 4)
}

export default function Gate({ children }) {
  const [stored, setStored] = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) } catch { return null }
  })
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isSetup = !stored

  async function handleCreate() {
    if (pw.length < 4) { setError('Ключ слишком короткий (мин. 4 символа)'); return }
    if (pw !== pw2) { setError('Ключи не совпадают'); return }
    setBusy(true); setError('')
    const saltHex = randomSalt()
    const hash = await deriveHash(pw, hexToBytes(saltHex))
    const rec = { salt: saltHex, iterations: ITERATIONS, hash, algo: 'PBKDF2-SHA256' }
    localStorage.setItem(AUTH_KEY, JSON.stringify(rec))
    setStored(rec)
    sessionStorage.setItem(SESSION_KEY, '1')
    setUnlocked(true)
    setBusy(false)
  }

  async function handleLogin() {
    setBusy(true); setError('')
    const hash = await deriveHash(pw, hexToBytes(stored.salt))
    if (hash === stored.hash) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setUnlocked(true)
    } else {
      setError('Неверный ключ')
      setPw('')
    }
    setBusy(false)
  }

  if (unlocked) return children

  const st = strength(pw)
  const stLabels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Сильный']
  const stColors = ['#f23f43', '#f0883e', '#f0b232', '#3ba55d', '#23a559']

  return (
    <div className="lock-screen">
      <div className="lock-card">
        <div className="lock-logo">
          <svg width="56" height="42" viewBox="0 0 127 96" fill="#fff"><path d="M107.7 8.07A105 105 0 0 0 81.47 0a72 72 0 0 0-3.36 6.83 97.7 97.7 0 0 0-29.11 0A72 72 0 0 0 45.64 0 105.9 105.9 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21A105.7 105.7 0 0 0 32.71 96.36 77.7 77.7 0 0 0 39.6 85.25a68 68 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.6 75.6 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.7 68.7 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1A105.2 105.2 0 0 0 126.6 80.22c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg>
        </div>
        <h1>MyCord</h1>
        {isSetup ? (
          <>
            <p className="lock-sub">Создай ключ для входа. Он шифруется PBKDF2&nbsp;(250&nbsp;000&nbsp;итераций) и хранится только на твоём устройстве.</p>
            <input className="lock-input" type="password" placeholder="Придумай ключ"
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('lock-pw2')?.focus()} autoFocus />
            {pw && (
              <div className="lock-strength">
                <div className="lock-strength-bar"><span style={{ width: `${(st + 1) * 20}%`, background: stColors[st] }} /></div>
                <span style={{ color: stColors[st] }}>{stLabels[st]}</span>
              </div>
            )}
            <input id="lock-pw2" className="lock-input" type="password" placeholder="Повтори ключ"
              value={pw2} onChange={e => setPw2(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            {error && <div className="lock-error">{error}</div>}
            <button className="lock-btn" disabled={busy} onClick={handleCreate}>
              {busy ? 'Шифрую…' : 'Создать ключ и войти'}
            </button>
          </>
        ) : (
          <>
            <p className="lock-sub">С возвращением! Введи свой ключ.</p>
            <input className="lock-input" type="password" placeholder="Твой ключ"
              value={pw} onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
            {error && <div className="lock-error">{error}</div>}
            <button className="lock-btn" disabled={busy} onClick={handleLogin}>
              {busy ? 'Проверяю…' : 'Войти'}
            </button>
            <button className="lock-reset" onClick={() => {
              if (confirm('Сбросить ключ? Все локальные данные останутся, но нужно будет создать ключ заново.')) {
                localStorage.removeItem(AUTH_KEY); setStored(null); setPw(''); setError('')
              }
            }}>Забыл ключ?</button>
          </>
        )}
        <div className="lock-foot">🔒 Шифрование PBKDF2-SHA256 · ключ не покидает устройство</div>
      </div>
    </div>
  )
}
