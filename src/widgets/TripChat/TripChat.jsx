import { useState, useEffect, useRef } from 'react';
import { chatHub } from '../../shared/lib/chatHub';
import { tripMessageApi } from '../../entities/tripMessage/api/tripMessageApi';
import styles from './TripChat.module.css';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

function getAvatarColor(userId) {
  return AVATAR_COLORS[Math.abs(Number(userId)) % AVATAR_COLORS.length];
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Сегодня';
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function buildItems(messages) {
  const items = [];
  let lastDay = null;
  for (const msg of messages) {
    const day = new Date(msg.createdAt).toDateString();
    if (day !== lastDay) {
      items.push({ type: 'divider', key: `div-${day}`, label: formatDayLabel(msg.createdAt) });
      lastDay = day;
    }
    items.push({ type: 'msg', ...msg });
  }
  return items;
}

export function TripChat({ tripId, currentUser }) {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [input, setInput]             = useState('');
  const [sending, setSending]         = useState(false);

  const listRef    = useRef(null);
  const bottomRef  = useRef(null);
  const lastMsgId  = useRef(null);
  const firstScroll = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await chatHub.connect();
        chatHub.joinTripChat(Number(tripId));
        chatHub.onReceiveTripMessage((msg) => {
          if (cancelled) return;
          setMessages(prev => [...prev, msg]);
        });

        const data = await tripMessageApi.getMessages(tripId, 1);
        if (cancelled) return;

        const raw   = Array.isArray(data) ? data : data?.items ?? [];
        const sorted = [...raw].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
        setHasNextPage(data?.hasNextPage ?? false);
        setPage(1);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      chatHub.leaveTripChat(Number(tripId));
      chatHub.offReceiveTripMessage();
    };
  }, [tripId]);

  // Scroll to bottom when new message arrives (not when prepending old ones)
  useEffect(() => {
    if (loading || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.tripMessageId === lastMsgId.current) return;
    lastMsgId.current = last.tripMessageId;
    bottomRef.current?.scrollIntoView({ behavior: firstScroll.current ? 'smooth' : 'instant' });
    firstScroll.current = true;
  }, [messages, loading]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const scrollEl = listRef.current;
      const prevHeight = scrollEl?.scrollHeight ?? 0;

      const data = await tripMessageApi.getMessages(tripId, nextPage);
      const raw  = Array.isArray(data) ? data : data?.items ?? [];
      const sorted = [...raw].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(prev => [...sorted, ...prev]);
      setHasNextPage(data?.hasNextPage ?? false);
      setPage(nextPage);

      requestAnimationFrame(() => {
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevHeight;
      });
    } catch (e) {
      console.error(e);
    }
    setLoadingMore(false);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');
    try {
      await chatHub.sendTripMessage(Number(tripId), content);
    } catch (e) {
      console.error(e);
      setInput(content);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const items = buildItems(messages);

  return (
    <div className={styles.wrap}>
      <div className={styles.messageList} ref={listRef}>
        {loading ? (
          <div className={styles.skeletons}>
            {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          <>
            {hasNextPage && (
              <button
                className={styles.loadMore}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Загрузка…' : '↑ Загрузить ещё сообщений'}
              </button>
            )}

            {messages.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>💬</span>
                <span>Начните общение в этой поездке!</span>
              </div>
            ) : (
              items.map(item =>
                item.type === 'divider' ? (
                  <div key={item.key} className={styles.dateDivider}>
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <MessageRow
                    key={item.tripMessageId}
                    msg={item}
                    isMine={item.senderId === currentUser?.userId}
                  />
                )
              )
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          placeholder="Напишите сообщение..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!input.trim() || sending}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

function MessageRow({ msg, isMine }) {
  return (
    <div className={`${styles.msgRow} ${isMine ? styles.msgMine : styles.msgOther}`}>
      {!isMine && (
        <div
          className={styles.msgAvatar}
          style={{ background: msg.senderProfilePicture ? 'transparent' : getAvatarColor(msg.senderId) }}
        >
          {msg.senderProfilePicture
            ? <img src={msg.senderProfilePicture} alt="" />
            : msg.senderUsername?.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className={styles.msgContent}>
        {!isMine && <div className={styles.msgSender}>{msg.senderUsername}</div>}
        <div className={`${styles.msgBubble} ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
          {msg.content}
        </div>
        <div className={`${styles.msgTime} ${isMine ? styles.timeMine : ''}`}>
          {formatTime(msg.createdAt)}
        </div>
      </div>

      {isMine && (
        <div
          className={styles.msgAvatar}
          style={{ background: msg.senderProfilePicture ? 'transparent' : getAvatarColor(msg.senderId) }}
        >
          {msg.senderProfilePicture
            ? <img src={msg.senderProfilePicture} alt="" />
            : msg.senderUsername?.slice(0, 1).toUpperCase()}
        </div>
      )}
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
