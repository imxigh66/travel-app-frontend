import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi } from '../../entities/post/api/postApi';
import { PostCard } from '../../entities/post/ui/PostCard';
import { CreatePostModal } from '../../features/post/ui/CreatePostModal';
import { getCurrentUser } from '../../entities/user/api/userApi';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  const navigate = useNavigate();
  const loaderRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('following'); // 'following' | 'all'

  // Загрузка текущего юзера
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

  // При смене таба — перезагрузить
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  }, [tab]);

  // Infinite scroll
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
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Лента</h1>
          <p className={styles.subtitle}>Посты людей, на которых вы подписаны</p>
        </div>
        <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          <span>Написать</span>
        </button>
      </div>

      {/* ── Табы ── */}
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

      {/* ── Контент ── */}
      <div className={styles.feed}>
        {/* Skeleton при первой загрузке */}
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

        {/* Посты */}
        {!isLoading &&
          posts.map((post) => (
            <PostCard key={post.postId} post={post} onLikeChange={() => {}} />
          ))}

        {/* Пустое состояние — подписки */}
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

        {/* Пустое состояние — все посты */}
        {!isLoading && posts.length === 0 && tab === 'all' && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <h2 className={styles.emptyTitle}>Постов пока нет</h2>
            <p className={styles.emptyText}>Будьте первым, кто поделится впечатлениями</p>
            <button className={styles.exploreBtn} onClick={() => setIsCreateOpen(true)}>
              Написать пост
            </button>
          </div>
        )}

        {/* Loader для infinite scroll */}
        {!isLoading && <div ref={loaderRef} className={styles.loaderTrigger} />}

        {/* Spinner при подгрузке */}
        {isLoadingMore && (
          <div className={styles.loadingMore}>
            <div className={styles.spinner} />
          </div>
        )}

        {/* Конец ленты */}
        {!isLoading && !hasMore && posts.length > 0 && (
          <div className={styles.endMessage}>
            <span>🌍</span> Вы просмотрели все посты
          </div>
        )}
      </div>

      {/* ── Модалка создания поста ── */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handlePostCreated}
        currentUser={currentUser}
      />

      {/* ── FAB ── */}
      <button className={styles.fab} onClick={() => setIsCreateOpen(true)} title="Написать пост">
        <PlusIcon size={24} />
      </button>
    </div>
  );
}

function PlusIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}