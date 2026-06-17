import { useState, useEffect, useRef, useMemo } from 'react'
import {
  SERVERS, CHANNELS, MEMBERS, SEED_MESSAGES, CURRENT_USER, DM_LIST,
} from './seed.js'

const STORAGE_KEY = 'mycord_messages_v1'

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  return { ...SEED_MESSAGES }
}

function timeStr(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function dayStr(ts) {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Сегодня'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

const STATUS_COLOR = { online: '#23a559', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' }

function Avatar({ name, color, size = 40, status, bot }) {
  const letter = (name || '?').trim().charAt(0).toUpperCase()
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <div className="avatar" style={{ background: color || '#5865f2', width: size, height: size, fontSize: size * 0.42 }}>
        {letter}
      </div>
      {status && <span className="avatar-status" style={{ background: STATUS_COLOR[status] || '#80848e' }} />}
    </div>
  )
}

/* ---- Icons (inline SVG) ---- */
const Icon = {
  hash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.88 21a1 1 0 0 1-1-1.15L5.74 15H2a1 1 0 0 1 0-2h4.05l.86-6H3a1 1 0 1 1 0-2h4.17l.85-5.15a1 1 0 1 1 1.96.32L9.2 5h5.97l.85-5.15a1 1 0 0 1 1.97.32L17.2 5H21a1 1 0 0 1 0 2h-4.12l-.86 6H20a1 1 0 0 1 0 2h-4.17l-.85 5.15A1 1 0 0 1 14 21a1 1 0 0 1-.83-1.15L13.94 15H7.97l-.85 5.15A1 1 0 0 1 5.88 21Zm2.42-8h5.97l.86-6H9.16Z"/></svg>,
  speaker: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.38 3.01 6.71 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3.71l4.67 3.99A1 1 0 0 0 13 20V4a1 1 0 0 0-1.62-.99ZM16 8.5a1 1 0 0 0-1.6 1.2 3 3 0 0 1 0 4.6 1 1 0 1 0 1.6 1.2 5 5 0 0 0 0-7Z"/></svg>,
  plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 5a1 1 0 1 0-2 0v6H5a1 1 0 1 0 0 2h6v6a1 1 0 1 0 2 0v-6h6a1 1 0 1 0 0-2h-6V5Z"/></svg>,
  send: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21.8 12 3.4 3.6 3 10l13 2-13 2 .4 6.4Z"/></svg>,
  pin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3l5 5-2 2-1-1-4 4 .5 4.5L12 21l-3-6-6-3 3.5-2.5L11 10l4-4-1-1 2-2Z"/></svg>,
  bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a6 6 0 0 0-6 6c0 5-2 6-2 7h16c0-1-2-2-2-7a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"/></svg>,
  people: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3 0-7 1.5-7 4.5V20h14v-2.5C16 14.5 12 13 9 13Zm8.5-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5 2c-.7 0-1.4.1-2 .3 1.5 1 2 2.4 2 4.2V20h6v-2.5c0-3-4-4.5-6-4.5Z"/></svg>,
  search: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 2a8 8 0 1 0 4.9 14.32l5.39 5.39 1.42-1.42-5.39-5.39A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"/></svg>,
  gift: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7h-2.2A3 3 0 0 0 12 3.5 3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3h9V8h-1a1 1 0 1 1 0-2c.6 0 1 .4 1 1h2c0-.6.4-1 1-1a1 1 0 1 1 0 2h-1v3h9V8a1 1 0 0 0-1-1ZM3 13v7a1 1 0 0 0 1 1h7v-8H3Zm10 8h7a1 1 0 0 0 1-1v-7h-8v8Z"/></svg>,
  gif: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm6 3H6v6h2v-2h1v-1.5H8V10.5h2V9H8Zm3 0h-.5v6H12V9Zm5 0h-3v6h1.5v-2H17v-1.5h-1.5V10.5H18V9Z"/></svg>,
  emoji: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 18c-2.3 0-4.3-1.4-5.2-3.5h10.4C16.3 16.6 14.3 18 12 18Z"/></svg>,
  plusCircle: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 11v4h-2v-4H7v-2h4V7h2v4h4v2h-4Z"/></svg>,
  mic: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"/></svg>,
  headphones: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-9 9v5a3 3 0 0 0 3 3h1v-7H5v-1a7 7 0 0 1 14 0v1h-2v7h1a3 3 0 0 0 3-3v-5a9 9 0 0 0-9-9Z"/></svg>,
  gear: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4-2 .5.7 1.9-1.4 1.4-1.9-.7-.5 2H13l-.5-2-1.9.7L9.2 16l.7-1.9-2-.5v-2l2-.5-.7-1.9 1.4-1.4 1.9.7L13 3h2l.5 2 1.9-.7L18.8 6l-.7 1.9 2 .5v1.6Z"/></svg>,
}

export default function App() {
  const [activeServer, setActiveServer] = useState('friends')
  const [activeChannelId, setActiveChannelId] = useState('general')
  const [messages, setMessages] = useState(loadMessages)
  const [draft, setDraft] = useState('')
  const [showMembers, setShowMembers] = useState(true)
  const [mobilePanel, setMobilePanel] = useState('chat') // chat | left | members
  const scrollRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages)) } catch (e) {}
  }, [messages])

  const serverChannels = CHANNELS[activeServer] || []
  const allItems = serverChannels.flatMap(c => c.items)
  const activeChannel = allItems.find(c => c.id === activeChannelId) || allItems.find(c => c.type === 'text')

  // When switching server, pick its first text channel
  useEffect(() => {
    const items = (CHANNELS[activeServer] || []).flatMap(c => c.items)
    if (!items.find(c => c.id === activeChannelId)) {
      const first = items.find(c => c.type === 'text')
      if (first) setActiveChannelId(first.id)
    }
  }, [activeServer]) // eslint-disable-line

  const chanMessages = messages[activeChannel?.id] || []

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [chanMessages.length, activeChannel?.id])

  const members = MEMBERS[activeServer] || []
  const grouped = useMemo(() => groupByRole(members), [members])

  function sendMessage() {
    const text = draft.trim()
    if (!text || !activeChannel) return
    const msg = {
      id: 'u' + Date.now(),
      author: CURRENT_USER.name,
      color: CURRENT_USER.color,
      ts: Date.now(),
      text,
      self: true,
    }
    setMessages(prev => ({ ...prev, [activeChannel.id]: [...(prev[activeChannel.id] || []), msg] }))
    setDraft('')
    // Simulated reply from the bot occasionally
    maybeBotReply(activeChannel.id, text)
  }

  function maybeBotReply(chanId, userText) {
    const replies = [
      'Принято! 👍', 'Интересно 🤔', 'lol 😂', 'Согласен!', 'Ого 🔥', 'Расскажи подробнее',
    ]
    if (Math.random() < 0.55) {
      const r = replies[Math.floor(Math.random() * replies.length)]
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [chanId]: [...(prev[chanId] || []), {
            id: 'b' + Date.now(), author: 'MyCord Bot', color: '#5865f2', bot: true, ts: Date.now(), text: r,
          }],
        }))
      }, 700 + Math.random() * 900)
    }
  }

  const server = SERVERS.find(s => s.id === activeServer)

  return (
    <div className={`app panel-${mobilePanel}`}>
      {/* Server rail */}
      <nav className="rail">
        <div className="rail-item">
          <button className="rail-btn home" title="Личные сообщения"><Icon.hash /></button>
        </div>
        <div className="rail-sep" />
        {SERVERS.filter(s => !s.home).map(s => (
          <div className="rail-item" key={s.id}>
            <span className={`rail-pill ${activeServer === s.id ? 'active' : ''}`} />
            <button
              className={`rail-btn ${activeServer === s.id ? 'active' : ''}`}
              style={{ '--accent': s.color }}
              onClick={() => { setActiveServer(s.id); setMobilePanel('chat') }}
              title={s.name}
            >
              {s.icon}
            </button>
          </div>
        ))}
        <div className="rail-item">
          <button className="rail-btn add" title="Добавить сервер"><Icon.plus /></button>
        </div>
      </nav>

      {/* Channel sidebar */}
      <aside className="sidebar">
        <header className="sidebar-header">
          <span>{server?.name}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
        </header>
        <div className="channels">
          {serverChannels.map(cat => (
            <div className="channel-cat" key={cat.category}>
              <div className="channel-cat-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"/></svg>
                {cat.category}
              </div>
              {cat.items.map(ch => (
                <button
                  key={ch.id}
                  className={`channel ${ch.id === activeChannel?.id ? 'active' : ''} ${ch.type}`}
                  onClick={() => {
                    if (ch.type === 'text') { setActiveChannelId(ch.id); setMobilePanel('chat') }
                  }}
                >
                  {ch.type === 'voice' ? <Icon.speaker /> : <Icon.hash />}
                  <span>{ch.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="user-bar">
          <Avatar name={CURRENT_USER.name} color={CURRENT_USER.color} size={32} status={CURRENT_USER.status} />
          <div className="user-bar-info">
            <span className="user-bar-name">{CURRENT_USER.name}</span>
            <span className="user-bar-tag">#{CURRENT_USER.tag}</span>
          </div>
          <div className="user-bar-actions">
            <button title="Микрофон"><Icon.mic /></button>
            <button title="Наушники"><Icon.headphones /></button>
            <button title="Настройки"><Icon.gear /></button>
          </div>
        </div>
      </aside>

      {/* Main chat */}
      <main className="chat">
        <header className="chat-header">
          <button className="mobile-toggle" onClick={() => setMobilePanel('left')} title="Каналы">☰</button>
          {activeChannel?.type === 'voice' ? <Icon.speaker /> : <Icon.hash />}
          <span className="chat-title">{activeChannel?.name}</span>
          {activeChannel?.topic && (
            <>
              <span className="chat-divider" />
              <span className="chat-topic">{activeChannel.topic}</span>
            </>
          )}
          <div className="chat-header-actions">
            <button title="Закреплённые"><Icon.pin /></button>
            <button title="Уведомления"><Icon.bell /></button>
            <button className={showMembers ? 'on' : ''} onClick={() => setShowMembers(s => !s)} title="Участники"><Icon.people /></button>
            <div className="search-box"><Icon.search /><input placeholder="Поиск" /></div>
          </div>
        </header>

        <div className="messages" ref={scrollRef}>
          <div className="welcome">
            <div className="welcome-icon"><Icon.hash /></div>
            <h2>Добро пожаловать в #{activeChannel?.name}!</h2>
            <p>Это начало канала #{activeChannel?.name}.</p>
          </div>
          {renderMessages(chanMessages)}
        </div>

        <div className="composer">
          <button className="composer-add"><Icon.plusCircle /></button>
          <input
            className="composer-input"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder={`Написать в #${activeChannel?.name || ''}`}
          />
          <div className="composer-actions">
            <button title="Подарок"><Icon.gift /></button>
            <button title="GIF"><Icon.gif /></button>
            <button title="Эмодзи"><Icon.emoji /></button>
            <button className="composer-send" onClick={sendMessage} title="Отправить"><Icon.send /></button>
          </div>
        </div>
      </main>

      {/* Member list */}
      {showMembers && (
        <aside className="members">
          {grouped.map(group => (
            <div className="member-group" key={group.role}>
              <div className="member-group-title">{group.role} — {group.list.length}</div>
              {group.list.map(m => (
                <div className={`member ${m.status === 'offline' ? 'offline' : ''}`} key={m.id}>
                  <Avatar name={m.name} color={m.color === '#fff' ? '#747f8d' : m.color} size={32} status={m.status} />
                  <div className="member-info">
                    <span className="member-name" style={{ color: m.color !== '#fff' ? m.color : undefined }}>
                      {m.name}{m.bot && <span className="bot-tag">BOT</span>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </aside>
      )}

      {/* Mobile bottom nav */}
      <div className="mobile-nav">
        <button className={mobilePanel === 'left' ? 'active' : ''} onClick={() => setMobilePanel('left')}>Каналы</button>
        <button className={mobilePanel === 'chat' ? 'active' : ''} onClick={() => setMobilePanel('chat')}>Чат</button>
        <button className={mobilePanel === 'members' ? 'active' : ''} onClick={() => { setShowMembers(true); setMobilePanel('members') }}>Люди</button>
      </div>
    </div>
  )
}

function groupByRole(members) {
  const order = ['Создатель', 'Админ', 'Боты', 'Участники']
  const online = members.filter(m => m.status !== 'offline')
  const offline = members.filter(m => m.status === 'offline')
  const groups = []
  order.forEach(role => {
    const list = online.filter(m => m.role === role)
    if (list.length) groups.push({ role: role === 'Участники' ? 'В СЕТИ' : role.toUpperCase(), list })
  })
  if (offline.length) groups.push({ role: 'НЕ В СЕТИ', list: offline })
  return groups
}

function renderMessages(msgs) {
  const out = []
  let lastDay = null
  msgs.forEach((m, i) => {
    const prev = msgs[i - 1]
    const day = dayStr(m.ts)
    if (day !== lastDay) {
      out.push(<div className="day-divider" key={'d' + m.id}><span>{day}</span></div>)
      lastDay = day
    }
    const grouped = prev && prev.author === m.author && (m.ts - prev.ts) < 5 * 60 * 1000 && dayStr(prev.ts) === day
    out.push(
      <div className={`msg ${grouped ? 'grouped' : ''}`} key={m.id}>
        {!grouped && <Avatar name={m.author} color={m.color === '#fff' ? '#747f8d' : m.color} size={40} />}
        <div className="msg-body">
          {!grouped && (
            <div className="msg-head">
              <span className="msg-author" style={{ color: m.color !== '#fff' ? m.color : '#f2f3f5' }}>{m.author}</span>
              {m.bot && <span className="bot-tag">BOT</span>}
              <span className="msg-time">{timeStr(m.ts)}</span>
            </div>
          )}
          <div className="msg-text">{renderText(m.text)}</div>
        </div>
      </div>
    )
  })
  return out
}

function renderText(text) {
  // Simple code block support ```...```
  const codeMatch = text.match(/^```(?:\w+)?\n?([\s\S]*?)```$/)
  if (codeMatch) {
    return <pre className="code-block"><code>{codeMatch[1].trim()}</code></pre>
  }
  return text
}
