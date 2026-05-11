import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { messageApi } from '../../entities/message/api/messageApi'
import { getCurrentUser } from '../../entities/user/api/userApi'
import { chatHub } from '../../shared/lib/chatHub'
import { isToday, isYesterday } from '../../shared/utils/dateUtils'
import api from '../../shared/api/axios'
import styles from './MessagesPage.module.css'

const PAGE_SIZE = 30

// ── Time formatting ───────────────────────────────────────────
function formatConvTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isToday(d)) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (isYesterday(d)) return 'Вчера'
  const now = new Date()
  if (now - d < 7 * 24 * 60 * 60 * 1000) {
    return d.toLocaleDateString('ru-RU', { weekday: 'short' })
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatMsgTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatDateDivider(iso) {
  const d = new Date(iso)
  if (isToday(d)) return 'Сегодня'
  if (isYesterday(d)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

// ── Avatar helper ─────────────────────────────────────────────
function Avatar({ src, name, size = 44, className }) {
  const initials = (name ?? '?').slice(0, 2).toUpperCase()
  return (
    <div className={className} style={{ width: size, height: size }}>
      {src ? <img src={src} alt={name} /> : <span>{initials}</span>}
    </div>
  )
}

// ── New conversation modal ────────────────────────────────────
function NewConvModal({ onClose, onStart }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get('/users', { params: { search: query, pageSize: 10 } })
        const list = res.data?.data?.items ?? res.data?.data ?? res.data?.items ?? res.data ?? []
        setResults(Array.isArray(list) ? list : [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleStart = async (user) => {
    setStarting(user.userId)
    try {
      const conv = await messageApi.startConversation(user.userId)
      onStart(conv, user)
    } catch { /* ignore */ }
    finally { setStarting(null) }
  }

  return (
    <div className={styles.ncOverlay} onClick={onClose}>
      <div className={styles.ncModal} onClick={e => e.stopPropagation()}>
        <div className={styles.ncHeader}>
          <span className={styles.ncTitle}>Новый диалог</span>
          <button className={styles.ncClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.ncSearchWrap}>
          <SearchIcon />
          <input
            ref={inputRef}
            className={styles.ncInput}
            placeholder="Поиск пользователей..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className={styles.ncList}>
          {loading && <div className={styles.ncHint}>Поиск...</div>}
          {!loading && query.trim() && results.length === 0 && (
            <div className={styles.ncHint}>Пользователи не найдены</div>
          )}
          {!loading && !query.trim() && (
            <div className={styles.ncHint}>Введите имя пользователя</div>
          )}
          {results.map(u => (
            <button
              key={u.userId}
              className={styles.ncItem}
              onClick={() => handleStart(u)}
              disabled={starting === u.userId}
            >
              <div className={styles.ncAvatar}>
                {u.profilePicture
                  ? <img src={u.profilePicture} alt={u.username} />
                  : <span>{(u.username ?? '?').slice(0, 2).toUpperCase()}</span>
                }
              </div>
              <div className={styles.ncInfo}>
                <span className={styles.ncName}>{u.username}</span>
                {u.fullName && <span className={styles.ncSub}>{u.fullName}</span>}
              </div>
              <span className={styles.ncAction}>
                {starting === u.userId ? '...' : '→'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton row ──────────────────────────────────────────────
function ConvSkeleton() {
  return (
    <div className={styles.skeletonItem}>
      <div className={`${styles.skeleton} ${styles.skeletonAvatar}`} />
      <div className={styles.skeletonLines}>
        <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '60%' }} />
        <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: '40%' }} />
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
export default function MessagesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [currentUser, setCurrentUser]   = useState(null)
  const [conversations, setConversations] = useState([])
  const [convsLoading, setConvsLoading]  = useState(true)

  const [activeConv, setActiveConv]     = useState(null)
  const [messages, setMessages]         = useState([])
  const [msgsLoading, setMsgsLoading]   = useState(false)
  const [page, setPage]                 = useState(1)
  const [hasMore, setHasMore]           = useState(false)
  const [loadingMore, setLoadingMore]   = useState(false)

  const [onlineUsers, setOnlineUsers]   = useState(new Set())
  const [newConvOpen, setNewConvOpen]   = useState(false)

  const [input, setInput]               = useState('')
  const [search, setSearch]             = useState('')
  const [sending, setSending]           = useState(false)

  const messagesEndRef  = useRef(null)
  const messagesTopRef  = useRef(null)
  const activeConvRef   = useRef(null)
  activeConvRef.current = activeConv

  // ── Load current user ──────────────────────────────────────
  useEffect(() => {
    getCurrentUser().then(res => { if (res.success) setCurrentUser(res.data) })
  }, [])

  // ── Load conversations ─────────────────────────────────────
  useEffect(() => {
    setConvsLoading(true)
    messageApi.getConversations()
      .then(data => setConversations(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => {})
      .finally(() => setConvsLoading(false))
  }, [])

  // ── Auto-open conversation from ?user= query param ────────
  useEffect(() => {
    if (convsLoading) return
    const targetId = Number(searchParams.get('user'))
    if (!targetId) return
    setSearchParams({}, { replace: true })

    const existing = conversations.find(c => c.otherUserId === targetId)
    if (existing) {
      selectConversation(existing)
    } else {
      messageApi.startConversation(targetId)
        .then(conv => {
          const normalized = conv?.conversationId ? conv : {
            conversationId: conv?.id ?? `tmp-${targetId}`,
            otherUserId: targetId,
            otherUsername: conv?.otherUsername ?? String(targetId),
            otherUserProfilePicture: conv?.otherUserProfilePicture ?? null,
            lastMessageText: null,
            lastMessageAt: null,
            unreadCount: 0,
          }
          setConversations(prev =>
            prev.some(c => c.conversationId === normalized.conversationId)
              ? prev : [normalized, ...prev]
          )
          selectConversation(normalized)
        })
        .catch(console.error)
    }
  }, [convsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Connect SignalR on mount, disconnect on unmount ────────
  useEffect(() => {
    chatHub.connect().catch(console.error)
    chatHub.onUserOnline(userId => {
      setOnlineUsers(prev => new Set(prev).add(userId))
    })
    chatHub.onUserOffline(userId => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    })
    return () => { chatHub.disconnect() }
  }, [])

  // ── Subscribe to incoming messages ────────────────────────
  useEffect(() => {
    const unsubscribe = chatHub.onReceiveMessage((msg) => {
      if (msg.conversationId === activeConvRef.current?.conversationId) {
        setMessages(prev => [...prev, msg])
      }
      // Update last message in sidebar
      setConversations(prev => prev.map(c =>
        c.conversationId === msg.conversationId
          ? { ...c, lastMessageText: msg.content, lastMessageAt: msg.createdAt }
          : c
      ))
    })
    return unsubscribe
  }, [])

  // ── Auto-scroll on new messages ────────────────────────────
  useEffect(() => {
    if (!loadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, loadingMore])

  // ── Select conversation ────────────────────────────────────
  const selectConversation = useCallback(async (conv) => {
    if (activeConv?.conversationId === conv.conversationId) return
    setActiveConv(conv)
    setMessages([])
    setPage(1)
    setHasMore(false)
    setInput('')
    setMsgsLoading(true)

    try {
      await chatHub.connect()
      chatHub.joinConversation(conv.conversationId)

      const data = await messageApi.getMessages(conv.conversationId, 1, PAGE_SIZE)
      const list = Array.isArray(data) ? data : data?.items ?? []
      const total = data?.totalCount ?? list.length
      setMessages(list)
      setHasMore(list.length < total)
      setPage(1)
    } catch (e) {
      console.error('selectConversation error:', e)
    } finally {
      setMsgsLoading(false)
    }
    // Clear unread badge
    setConversations(prev => prev.map(c =>
      c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
    ))
  }, [activeConv])

  // ── Load more (older) messages ─────────────────────────────
  const handleLoadMore = async () => {
    if (!activeConv || loadingMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await messageApi.getMessages(activeConv.conversationId, nextPage, PAGE_SIZE)
      const list = Array.isArray(data) ? data : data?.items ?? []
      const total = data?.totalCount ?? (page * PAGE_SIZE + list.length)
      setMessages(prev => [...list, ...prev])
      setPage(nextPage)
      setHasMore(nextPage * PAGE_SIZE < total)
    } catch (e) {
      console.error('loadMore error:', e)
    } finally {
      setLoadingMore(false)
    }
  }

  // ── Send message ───────────────────────────────────────────
  const handleSend = async () => {
    const content = input.trim()
    if (!content || !activeConv || sending) return
    setInput('')
    setSending(true)
    try {
      await chatHub.sendMessage(activeConv.conversationId, content)
    } catch (e) {
      console.error('send error:', e)
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  // ── New conversation ──────────────────────────────────────
  const handleNewConv = useCallback((conv, user) => {
    // Normalize: if backend returns full ConversationDto use it,
    // otherwise build a minimal shape from the user object
    const normalized = conv?.conversationId
      ? conv
      : {
          conversationId: conv?.conversationId ?? conv?.id ?? Date.now(),
          otherUserId: user.userId,
          otherUsername: user.username,
          otherUserProfilePicture: user.profilePicture ?? null,
          lastMessageText: null,
          lastMessageAt: null,
          unreadCount: 0,
        }
    setConversations(prev => {
      const exists = prev.some(c => c.conversationId === normalized.conversationId)
      return exists ? prev : [normalized, ...prev]
    })
    setNewConvOpen(false)
    selectConversation(normalized)
  }, [selectConversation])

  // ── Filtered conversations ─────────────────────────────────
  const filtered = conversations.filter(c =>
    (c.otherUsername ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Build message list with date dividers ──────────────────
  const msgsWithDividers = []
  messages.forEach((msg, i) => {
    const prev = messages[i - 1]
    if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) {
      msgsWithDividers.push({ type: 'divider', id: `div-${msg.messageId}`, date: msg.createdAt })
    }
    msgsWithDividers.push({ type: 'msg', ...msg })
  })

  return (
    <div className={styles.page}>
      {newConvOpen && <NewConvModal onClose={() => setNewConvOpen(false)} onStart={handleNewConv} />}

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>

        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Сообщения</h2>
          <button className={styles.newBtn} title="Новый диалог" onClick={() => setNewConvOpen(true)}>
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
          {convsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <ConvSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className={styles.emptyConvs}>
              {conversations.length === 0
                ? 'Нет сообщений.\nНапишите первым!'
                : 'Не найдено'}
            </div>
          ) : filtered.map(c => (
            <button
              key={c.conversationId}
              className={`${styles.convItem} ${activeConv?.conversationId === c.conversationId ? styles.convActive : ''}`}
              onClick={() => selectConversation(c)}
            >
              <div className={styles.convAvatar}>
                {c.otherUserProfilePicture
                  ? <img src={c.otherUserProfilePicture} alt={c.otherUsername} />
                  : <span>{(c.otherUsername ?? '?').slice(0, 2).toUpperCase()}</span>
                }
                {onlineUsers.has(c.otherUserId) && <span className={styles.onlineDot} />}
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convTop}>
                  <span className={styles.convName}>{c.otherUsername}</span>
                  <span className={styles.convTime}>{formatConvTime(c.lastMessageAt)}</span>
                </div>
                <div className={styles.convBottom}>
                  <span className={styles.convLast}>{c.lastMessageText ?? ''}</span>
                  {c.unreadCount > 0 && (
                    <span className={styles.convBadge}>{c.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

      </aside>

      {/* ── Chat panel ── */}
      <div className={styles.chat}>

        {!activeConv ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyChatIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className={styles.emptyChatTitle}>Выберите диалог</div>
            <div className={styles.emptyChatSub}>Нажмите на контакт слева, чтобы начать общение</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatUser}>
                <div className={styles.chatAvatar}>
                  {activeConv.otherUserProfilePicture
                    ? <img src={activeConv.otherUserProfilePicture} alt={activeConv.otherUsername} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <span>{(activeConv.otherUsername ?? '?').slice(0, 2).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <div className={styles.chatName}>{activeConv.otherUsername}</div>
                  <div className={styles.chatStatus}>
                    {onlineUsers.has(activeConv.otherUserId)
                      ? <><span className={styles.onlineDot} style={{ display: 'inline-block', marginRight: 5 }} />В сети</>
                      : <span style={{ color: 'var(--text-muted)' }}>@{activeConv.otherUsername}</span>
                    }
                  </div>
                </div>
              </div>
              <div className={styles.chatActions}>
                <button
                  className={styles.chatActionBtn}
                  title="Профиль"
                  onClick={() => navigate(`/users/${activeConv.otherUserId}`)}
                >
                  <UserIcon />
                </button>
                <button className={styles.chatActionBtn} title="Ещё"><MoreIcon /></button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {hasMore && (
                <button
                  className={styles.loadMore}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Загружаем...' : 'Загрузить ещё'}
                </button>
              )}
              <div ref={messagesTopRef} />

              {msgsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`${styles.msg} ${i % 2 === 0 ? styles.msgThem : styles.msgMe}`}>
                    {i % 2 === 0 && <div className={`${styles.msgAvatar} ${styles.skeleton}`} style={{ width: 28, height: 28, borderRadius: '50%' }} />}
                    <div className={`${styles.skeleton} ${styles.skeletonBubble}`} style={{ width: `${30 + (i * 17) % 40}%`, height: 40 }} />
                  </div>
                ))
              ) : msgsWithDividers.length === 0 ? (
                <div className={styles.noMsgs}>Нет сообщений. Напишите первым!</div>
              ) : (
                msgsWithDividers.map(item => {
                  if (item.type === 'divider') {
                    return (
                      <div key={item.id} className={styles.dateDivider}>
                        <span>{formatDateDivider(item.date)}</span>
                      </div>
                    )
                  }
                  const isMe = currentUser && item.senderId === currentUser.userId
                  return (
                    <div key={item.messageId} className={`${styles.msg} ${isMe ? styles.msgMe : styles.msgThem}`}>
                      {!isMe && (
                        <div className={styles.msgAvatar}>
                          {activeConv.otherUserProfilePicture
                            ? <img src={activeConv.otherUserProfilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            : <span>{(activeConv.otherUsername ?? '?').slice(0, 2).toUpperCase()}</span>
                          }
                        </div>
                      )}
                      <div className={styles.msgBubble}>
                        <span className={styles.msgText}>{item.content}</span>
                        <span className={styles.msgTime}>{formatMsgTime(item.createdAt)}</span>
                      </div>
                    </div>
                  )
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputRow}>
              <button className={styles.attachBtn} title="Прикрепить"><AttachIcon /></button>
              <input
                className={styles.input}
                placeholder="Написать сообщение..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                disabled={sending}
              />
              <button
                className={`${styles.sendBtn} ${input.trim() ? styles.sendBtnActive : ''}`}
                onClick={handleSend}
                disabled={!input.trim() || sending}
              >
                <SendIcon />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────────────
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function EditIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function UserIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function MoreIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> }
function AttachIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> }
function SendIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> }
