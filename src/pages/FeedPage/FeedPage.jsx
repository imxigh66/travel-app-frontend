import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi } from '../../entities/post/api/postApi';
import { PostCard } from '../../entities/post/ui/PostCard';
import { CreatePostCard } from '../../features/post/ui/CreatePostCard';
import { CommentSection } from '../../features/comment/CommentSection';
import { getCurrentUser } from '../../entities/user/api/userApi';
import { followApi } from '../../entities/follow/model/follow.api';
import { chatHub } from '../../shared/lib/chatHub';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  const navigate = useNavigate();
  const loaderRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('following');

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res.success) setCurrentUser(res.data);
    });
  }, []);

  const fetchPosts = useCallback(
    async (pageNum = 1, replace = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const res =
          tab === 'following'
            ? await postApi.getFeed(pageNum, 10)
            : await postApi.getAllPosts(pageNum, 10);

        setPosts((prev) => (replace ? res.items : [...prev, ...res.items]));
        setHasMore(res.hasNextPage);
        setPage(pageNum);
      } catch (err) {
        console.error('Feed fetch error:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [tab]
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [tab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.5 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, page, fetchPosts]);

  const handlePostCreated = () => {
    setPosts([]);
    setPage(1);
    fetchPosts(1, true);
  };

  return (
    <div className={styles.page}>

      {/* ── Левая колонка: лента ── */}
      <div className={styles.mainCol}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Лента</h1>
            <p className={styles.subtitle}>Посты людей, на которых вы подписаны</p>
          </div>
        </div>

        {/* Табы */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'following' ? styles.tabActive : ''}`}
            onClick={() => setTab('following')}
          >
            Подписки
          </button>
          <button
            className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`}
            onClick={() => setTab('all')}
          >
            Все посты
          </button>
        </div>

        {/* Контент */}
        <div className={styles.feed}>
          {currentUser && (
            <CreatePostCard currentUser={currentUser} onSuccess={handlePostCreated} />
          )}

          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skeletonHeader}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div className={styles.skeletonLine} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                  </div>
                </div>
                <div className={styles.skeletonBody} />
                <div className={styles.skeletonImage} />
              </div>
            ))}

          {!isLoading &&
            posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onLikeChange={() => {}}
                renderComments={(postId, onCountChange) => (
                  <CommentSection postId={postId} onCountChange={onCountChange} />
                )}
              />
            ))}

          {!isLoading && posts.length === 0 && tab === 'following' && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✈️</div>
              <h2 className={styles.emptyTitle}>Лента пока пуста</h2>
              <p className={styles.emptyText}>
                Подпишитесь на путешественников, чтобы видеть их посты здесь
              </p>
              <button className={styles.exploreBtn} onClick={() => navigate('/explore')}>
                Найти людей
              </button>
            </div>
          )}

          {!isLoading && posts.length === 0 && tab === 'all' && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <h2 className={styles.emptyTitle}>Постов пока нет</h2>
              <p className={styles.emptyText}>Будьте первым, кто поделится впечатлениями</p>
            </div>
          )}

          {!isLoading && <div ref={loaderRef} className={styles.loaderTrigger} />}
          {isLoadingMore && (
            <div className={styles.loadingMore}><div className={styles.spinner} /></div>
          )}
          {!isLoading && !hasMore && posts.length > 0 && (
            <div className={styles.endMessage}><span>🌍</span> Вы просмотрели все посты</div>
          )}
        </div>
      </div>

      {/* ── Правая колонка: друзья онлайн ── */}
      <aside className={styles.sideCol}>
        {currentUser && <OnlineFriends currentUser={currentUser} />}
      </aside>

    </div>
  );
}

// ── Виджет «Друзья онлайн» ────────────────────────────────────
function OnlineFriends({ currentUser }) {
  const navigate = useNavigate();
  const [friends, setFriends]     = useState([]);
  const [onlineIds, setOnlineIds] = useState(new Set());
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    followApi.getFollowing(currentUser.userId, 1, 50)
      .then(data => {
        const list = data?.data?.items ?? data?.items ?? data?.data ?? [];
        setFriends(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser.userId]);

  useEffect(() => {
    chatHub.connect().catch(() => {});
    const offOnline  = chatHub.onUserOnline(id  => setOnlineIds(p => new Set(p).add(id)));
    const offOffline = chatHub.onUserOffline(id => setOnlineIds(p => { const n = new Set(p); n.delete(id); return n; }));
    return () => { offOnline?.(); offOffline?.(); };
  }, []);

  const online  = friends.filter(f => onlineIds.has(f.userId));
  const offline = friends.filter(f => !onlineIds.has(f.userId));

  return (
    <div className={styles.friendsCard}>
      <div className={styles.friendsTitle}>Подписки</div>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.friendSkeleton} />
        ))
      ) : friends.length === 0 ? (
        <div className={styles.friendsEmpty}>
          Вы ни на кого не подписаны
        </div>
      ) : (
        <>
          {online.length > 0 && (
            <>
              <div className={styles.friendsSection}>
                <span className={styles.onlineDot} /> В сети · {online.length}
              </div>
              {online.map(f => (
                <FriendRow key={f.userId} user={f} online navigate={navigate} />
              ))}
            </>
          )}

          {offline.length > 0 && (
            <>
              <div className={styles.friendsSection} style={{ marginTop: online.length ? 10 : 0 }}>
                Не в сети
              </div>
              {offline.slice(0, 8).map(f => (
                <FriendRow key={f.userId} user={f} online={false} navigate={navigate} />
              ))}
              {offline.length > 8 && (
                <button className={styles.friendsMore} onClick={() => navigate('/profile')}>
                  Ещё {offline.length - 8}...
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function FriendRow({ user, online, navigate }) {
  return (
    <div className={styles.friendRow}>
      <div
        className={styles.friendAvatar}
        onClick={() => navigate(`/users/${user.userId}`)}
      >
        {user.profilePicture
          ? <img src={user.profilePicture} alt={user.username} />
          : <span>{(user.name ?? user.username ?? '?').slice(0, 2).toUpperCase()}</span>
        }
        {online && <span className={styles.onlineDot} />}
      </div>
      <div className={styles.friendInfo} onClick={() => navigate(`/users/${user.userId}`)}>
        <span className={styles.friendName}>{user.name || user.username}</span>
        <span className={styles.friendUsername}>@{user.username}</span>
      </div>
      <button
        className={styles.friendMsgBtn}
        title="Написать"
        onClick={() => navigate(`/messages?user=${user.userId}`)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </button>
    </div>
  );
}