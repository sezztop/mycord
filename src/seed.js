// Seed data for the MyCord demo (Discord-style clone).
// Messages are persisted per-channel in localStorage; this is the starting state.

export const SERVERS = [
  { id: 'home', name: 'Личные сообщения', icon: '🏠', color: '#5865f2', home: true },
  { id: 'friends', name: 'Сервер с друзьями', icon: 'СД', color: '#5865f2' },
  { id: 'gaming', name: 'Игровая тусовка', icon: '🎮', color: '#eb459e' },
  { id: 'music', name: 'Музыка', icon: '🎵', color: '#23a559' },
  { id: 'dev', name: 'Кодинг', icon: '💻', color: '#f0b232' },
]

export const CHANNELS = {
  friends: [
    { category: 'ОБЩЕНИЕ', items: [
      { id: 'general', type: 'text', name: 'основной', topic: 'Главный канал сервера — общаемся обо всём' },
      { id: 'memes', type: 'text', name: 'мемы', topic: 'Только лучшие мемы' },
      { id: 'media', type: 'text', name: 'медиа', topic: 'Картинки, видео, гифки' },
    ]},
    { category: 'ГОЛОСОВЫЕ КАНАЛЫ', items: [
      { id: 'voice-general', type: 'voice', name: 'Общий' },
      { id: 'voice-games', type: 'voice', name: 'Катка' },
    ]},
  ],
  gaming: [
    { category: 'ИГРЫ', items: [
      { id: 'lfg', type: 'text', name: 'поиск-тиммейтов', topic: 'Ищешь команду? Тебе сюда' },
      { id: 'cs', type: 'text', name: 'counter-strike', topic: 'Обсуждение CS' },
      { id: 'minecraft', type: 'text', name: 'minecraft', topic: 'Наш сервер выживания' },
    ]},
    { category: 'ГОЛОС', items: [
      { id: 'voice-team1', type: 'voice', name: 'Команда 1' },
    ]},
  ],
  music: [
    { category: 'МУЗЫКА', items: [
      { id: 'tracks', type: 'text', name: 'треки', topic: 'Делимся музыкой' },
      { id: 'requests', type: 'text', name: 'заказы', topic: 'Что включить?' },
    ]},
  ],
  dev: [
    { category: 'РАЗРАБОТКА', items: [
      { id: 'general-dev', type: 'text', name: 'общий', topic: 'Болтаем о коде' },
      { id: 'help', type: 'text', name: 'помощь', topic: 'Задавай вопросы' },
      { id: 'showcase', type: 'text', name: 'проекты', topic: 'Показывай что сделал' },
    ]},
  ],
}

export const MEMBERS = {
  friends: [
    { id: 'u1', name: 'Никита', role: 'Создатель', color: '#f0b232', status: 'online', bot: false },
    { id: 'u2', name: 'Алекс', role: 'Админ', color: '#eb459e', status: 'online', bot: false },
    { id: 'u3', name: 'MyCord Bot', role: 'Боты', color: '#5865f2', status: 'online', bot: true },
    { id: 'u4', name: 'Дима', role: 'Участники', color: '#fff', status: 'idle', bot: false },
    { id: 'u5', name: 'Катя', role: 'Участники', color: '#fff', status: 'dnd', bot: false },
    { id: 'u6', name: 'Макс', role: 'Участники', color: '#fff', status: 'offline', bot: false },
    { id: 'u7', name: 'Лера', role: 'Участники', color: '#fff', status: 'offline', bot: false },
  ],
  gaming: [
    { id: 'g1', name: 'ProGamer', role: 'Создатель', color: '#f0b232', status: 'online', bot: false },
    { id: 'g2', name: 'Никита', role: 'Участники', color: '#fff', status: 'online', bot: false },
    { id: 'g3', name: 'Sniper', role: 'Участники', color: '#fff', status: 'dnd', bot: false },
  ],
  music: [
    { id: 'm1', name: 'DJ', role: 'Создатель', color: '#23a559', status: 'online', bot: false },
    { id: 'm2', name: 'Никита', role: 'Участники', color: '#fff', status: 'idle', bot: false },
  ],
  dev: [
    { id: 'd1', name: 'Никита', role: 'Создатель', color: '#f0b232', status: 'online', bot: false },
    { id: 'd2', name: 'CodeBot', role: 'Боты', color: '#5865f2', status: 'online', bot: true },
  ],
}

const now = Date.now()
const min = 60 * 1000

export const SEED_MESSAGES = {
  general: [
    { id: 'm1', author: 'Алекс', color: '#eb459e', ts: now - 60 * min, text: 'Йо! Добро пожаловать на наш сервер 🎉' },
    { id: 'm2', author: 'Дима', color: '#fff', ts: now - 55 * min, text: 'Привет всем! Наконец-то свой Discord' },
    { id: 'm3', author: 'MyCord Bot', color: '#5865f2', bot: true, ts: now - 50 * min, text: 'Сервер готов к работе. Приятного общения!' },
    { id: 'm4', author: 'Катя', color: '#fff', ts: now - 20 * min, text: 'Выглядит круто 😍 кто делал?' },
    { id: 'm5', author: 'Никита', color: '#f0b232', ts: now - 5 * min, text: 'Я сам завайбкодил 😎' },
  ],
  memes: [
    { id: 'mm1', author: 'Дима', color: '#fff', ts: now - 120 * min, text: 'когда код заработал с первого раза 🤯' },
  ],
  lfg: [
    { id: 'l1', author: 'ProGamer', color: '#f0b232', ts: now - 30 * min, text: 'Кто в катку? +2 нужно' },
  ],
  tracks: [
    { id: 't1', author: 'DJ', color: '#23a559', ts: now - 10 * min, text: 'Закинул новый плейлист 🔥' },
  ],
  'general-dev': [
    { id: 'gd1', author: 'CodeBot', color: '#5865f2', bot: true, ts: now - 15 * min, text: '```js\nconsole.log("Hello, MyCord!")\n```' },
  ],
}

export const CURRENT_USER = { name: 'Никита', tag: '0001', color: '#f0b232', status: 'online' }

export const DM_LIST = [
  { id: 'dm1', name: 'Алекс', status: 'online', color: '#eb459e' },
  { id: 'dm2', name: 'Дима', status: 'idle', color: '#3ba55d' },
  { id: 'dm3', name: 'Катя', status: 'dnd', color: '#ed4245' },
]
