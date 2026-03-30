import { useState } from 'react'
import styles from './MessagesPage.module.css'

// ── Mock data ─────────────────────────────────────────────────
const CONVERSATIONS = [
  {
    id: 1, name: 'Анна Попеску', username: 'anna_pop',
    avatar: null, initials: 'АП',
    lastMsg: 'Спасибо за совет про Прагу! 🙏',
    time: '14:32', unread: 2, online: true,
  },
  {
    id: 2, name: 'Mihai Lungu', username: 'mihai_l',
    avatar: null, initials: 'ML',
    lastMsg: 'Когда планируешь в Тбилиси?',
    time: '11:05', unread: 0, online: true,
  },
  {
    id: 3, name: 'TravelFlow Support', username: 'support',
    avatar: null, initials: 'TF',
    lastMsg: 'Ваша заявка рассмотрена.',
    time: 'Вчера', unread: 0, online: false,
  },
  {
    id: 4, name: 'Дарья Козлова', username: 'dasha_k',
    avatar: null, initials: 'ДК',
    lastMsg: 'Классные фото из Рима!',
    time: 'Вчера', unread: 0, online: false,
  },
  {
    id: 5, name: 'Ion Moraru', username: 'ion_m',
    avatar: null, initials: 'IM',
    lastMsg: 'Привет! Как поездка прошла?',
    time: 'Пн', unread: 0, online: false,
  },
]

const MESSAGES = {
  1: [
    { id: 1, from: 'them', text: 'Привет! Слышала ты была в Праге?', time: '14:20' },
    { id: 2, from: 'me',   text: 'Да, только вернулась! Потрясающий город 😍', time: '14:22' },
    { id: 3, from: 'them', text: 'Что обязательно посмотреть? Еду через месяц', time: '14:25' },
    { id: 4, from: 'me',   text: 'Старый город, Карлов мост на рассвете — там почти нет туристов. И обязательно попробуй трдельник!', time: '14:28' },
    { id: 5, from: 'me',   text: 'Ещё советую Вышеград — туда мало кто добирается, но виды невероятные', time: '14:29' },
    { id: 6, from: 'them', text: 'Спасибо за совет про Прагу! 🙏', time: '14:32' },
  ],
  2: [
    
    { id: 2, from: 'me',   text: 'Привет! Подскажи место в Паиже где вкусно поесть! 😊', time: '10:55' },
    { id: 3, from: 'them', text: 'Привет! Советую ресторан Le Procope, это самый классный ресторан французской кухни в Париже!', time: '11:05' },
  ],
}

export default function MessagesPage() {
  const [activeId, setActiveId]   = useState(1)
  const [input, setInput]         = useState('')
  const [search, setSearch]       = useState('')

  const active = CONVERSATIONS.find(c => c.id === activeId)
  const msgs   = MESSAGES[activeId] ?? []

  const filtered = CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  )

  const handleSend = () => {
    if (!input.trim()) return
    setInput('')
  }

  return (
    <div className={styles.page}>

      {/* ── Левая колонка: список диалогов ── */}
      <aside className={styles.sidebar}>

        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Сообщения</h2>
          <button className={styles.newBtn} title="Новый диалог">
            <EditIcon />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.convList}>
          {filtered.map(c => (
            <button
              key={c.id}
              className={`${styles.convItem} ${activeId === c.id ? styles.convActive : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <div className={styles.convAvatar}>
                {c.avatar
                  ? <img src={c.avatar} alt="" />
                  : <span>{c.initials}</span>
                }
                {c.online && <span className={styles.onlineDot} />}
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convTop}>
                  <span className={styles.convName}>{c.name}</span>
                  <span className={styles.convTime}>{c.time}</span>
                </div>
                <div className={styles.convBottom}>
                  <span className={styles.convLast}>{c.lastMsg}</span>
                  {c.unread > 0 && <span className={styles.convBadge}>{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

      </aside>

      {/* ── Правая колонка: чат ── */}
      <div className={styles.chat}>

        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.chatUser}>
            <div className={styles.chatAvatar}>
              <span>{active?.initials}</span>
              {active?.online && <span className={styles.onlineDot} />}
            </div>
            <div>
              <div className={styles.chatName}>{active?.name}</div>
              <div className={styles.chatStatus}>
                {active?.online ? 'В сети' : `@${active?.username}`}
              </div>
            </div>
          </div>
          <div className={styles.chatActions}>
            <button className={styles.chatActionBtn} title="Профиль"><UserIcon /></button>
            <button className={styles.chatActionBtn} title="Ещё"><MoreIcon /></button>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {msgs.map(msg => (
            <div
              key={msg.id}
              className={`${styles.msg} ${msg.from === 'me' ? styles.msgMe : styles.msgThem}`}
            >
              {msg.from === 'them' && (
                <div className={styles.msgAvatar}>
                  <span>{active?.initials}</span>
                </div>
              )}
              <div className={styles.msgBubble}>
                <span className={styles.msgText}>{msg.text}</span>
                <span className={styles.msgTime}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className={styles.inputRow}>
          <button className={styles.attachBtn} title="Прикрепить"><AttachIcon /></button>
          <input
            className={styles.input}
            placeholder="Написать сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ''}`}
            onClick={handleSend}
          >
            <SendIcon />
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function EditIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function UserIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function MoreIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> }
function AttachIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> }
function SendIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> }