import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { postApi } from '../../entities/post/api/postApi';
import { PostCard } from '../../entities/post/ui/PostCard';
import { CreatePostCard } from '../../features/post/ui/CreatePostCard';
import { CommentSection } from '../../features/comment/CommentSection';
import { getCurrentUser } from '../../entities/user/api/userApi';
import { followApi } from '../../entities/follow/model/follow.api';
import { placeApi } from '../../entities/place/index';
import { chatHub } from '../../shared/lib/chatHub';
import api from '../../shared/api/axios';
import styles from './FeedPage.module.css';

export default function FeedPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

      {/* ── Main feed column ── */}
      <div className={styles.mainCol}>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{t('feed.title')}</h1>
            <p className={styles.subtitle}>{t('feed.subtitle')}</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'following' ? styles.tabActive : ''}`}
            onClick={() => setTab('following')}
          >
            {t('feed.tabFollowing')}
          </button>
          <button
            className={`${styles.tab} ${tab === 'all' ? styles.tabActive : ''}`}
            onClick={() => setTab('all')}
          >
            {t('feed.tabAll')}
          </button>
        </div>

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
              <h2 className={styles.emptyTitle}>{t('feed.emptyFollowingTitle')}</h2>
              <p className={styles.emptyText}>{t('feed.emptyFollowingText')}</p>
              <button className={styles.exploreBtn} onClick={() => navigate('/explore')}>
                {t('feed.findPeople')}
              </button>
            </div>
          )}

          {!isLoading && posts.length === 0 && tab === 'all' && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📭</div>
              <h2 className={styles.emptyTitle}>{t('feed.emptyAllTitle')}</h2>
              <p className={styles.emptyText}>{t('feed.emptyAllText')}</p>
            </div>
          )}

          {!isLoading && <div ref={loaderRef} className={styles.loaderTrigger} />}
          {isLoadingMore && (
            <div className={styles.loadingMore}><div className={styles.spinner} /></div>
          )}
          {!isLoading && !hasMore && posts.length > 0 && (
            <div className={styles.endMessage}>{t('feed.allPostsRead')}</div>
          )}
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <aside className={styles.sideCol}>
        {currentUser && <OnlineFriends currentUser={currentUser} />}
        <TopPlaces />
        {currentUser && <SuggestedUsers currentUser={currentUser} />}
      </aside>

    </div>
  );
}

// ── Online friends widget ──────────────────────────────────────
function OnlineFriends({ currentUser }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      <div className={styles.friendsTitle}>{t('feed.following')}</div>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.friendSkeleton} />
        ))
      ) : friends.length === 0 ? (
        <div className={styles.friendsEmpty}>
          {t('feed.emptyFollowingTitle')}
        </div>
      ) : (
        <>
          {online.length > 0 && (
            <>
              <div className={styles.friendsSection}>
                <span className={styles.onlineDot} /> {t('feed.online', { count: online.length })}
              </div>
              {online.map(f => (
                <FriendRow key={f.userId} user={f} online navigate={navigate} t={t} />
              ))}
            </>
          )}

          {offline.length > 0 && (
            <>
              <div className={styles.friendsSection} style={{ marginTop: online.length ? 10 : 0 }}>
                {t('feed.offline')}
              </div>
              {offline.slice(0, 8).map(f => (
                <FriendRow key={f.userId} user={f} online={false} navigate={navigate} t={t} />
              ))}
              {offline.length > 8 && (
                <button className={styles.friendsMore} onClick={() => navigate('/profile')}>
                  {t('feed.moreOffline', { count: offline.length - 8 })}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Top places widget ──────────────────────────────────────────
function TopPlaces() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    placeApi.getAll({ pageNumber: 1, pageSize: 3 })
      .then(data => setPlaces(data?.items ?? []))
      .catch(() => {});
  }, []);

  if (places.length === 0) return null;

  return (
    <div className={styles.sideBlock}>
      <div className={styles.sideBlockTitle}>{t('feed.popularPlaces')}</div>
      {places.map(place => (
        <div
          key={place.placeId}
          className={styles.placeRow}
          onClick={() => navigate(`/places/${place.placeId}`)}
        >
          <div className={styles.placeThumb}>
            {place.coverImageUrl
              ? <img src={place.coverImageUrl} alt={place.name} />
              : <PinSmIcon />}
          </div>
          <div className={styles.placeInfo}>
            <div className={styles.placeName}>{place.name}</div>
            <div className={styles.placeMeta}>
              {place.averageRating > 0 && `⭐ ${place.averageRating.toFixed(1)}`}
              {place.averageRating > 0 && place.city && ' · '}
              {place.city}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Suggested users widget ─────────────────────────────────────
function SuggestedUsers({ currentUser }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState([]);
  const [done, setDone] = useState(new Set());

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      api.get('/users', { params: { pageSize: 8 } }),
      followApi.getFollowing(currentUser.userId, 1, 50),
    ]).then(([usersRes, followingRes]) => {
      const all = usersRes.data?.items ?? usersRes.data?.data?.items ?? [];
      const raw = followingRes?.data?.items ?? followingRes?.items ?? followingRes?.data ?? [];
      const followingIds = new Set(Array.isArray(raw) ? raw.map(u => u.userId) : []);
      setSuggestions(
        all
          .filter(u => u.userId !== currentUser.userId && !followingIds.has(u.userId))
          .slice(0, 3)
      );
    }).catch(() => {});
  }, [currentUser]);

  const handleFollow = async (userId) => {
    try {
      await api.post(`/users/follow/${userId}`);
      setDone(prev => new Set(prev).add(userId));
      setTimeout(() => {
        setSuggestions(prev => prev.filter(u => u.userId !== userId));
        setDone(prev => { const n = new Set(prev); n.delete(userId); return n; });
      }, 1000);
    } catch {}
  };

  if (suggestions.length === 0) return null;

  return (
    <div className={styles.sideBlock}>
      <div className={styles.sideBlockTitle}>{t('feed.suggested')}</div>
      {suggestions.map(user => (
        <div key={user.userId} className={styles.suggRow}>
          <div className={styles.suggAvatar} onClick={() => navigate(`/users/${user.userId}`)}>
            {user.profilePicture
              ? <img src={user.profilePicture} alt={user.username} />
              : (user.name ?? user.username ?? '?').slice(0, 2).toUpperCase()}
          </div>
          <div className={styles.suggInfo}>
            <div className={styles.suggName} onClick={() => navigate(`/users/${user.userId}`)}>
              {user.name || user.username}
            </div>
            <div className={styles.suggUsername}>@{user.username}</div>
          </div>
          <button
            className={`${styles.followBtn} ${done.has(user.userId) ? styles.followBtnDone : ''}`}
            onClick={() => !done.has(user.userId) && handleFollow(user.userId)}
            title={done.has(user.userId) ? t('feed.followed') : t('feed.follow')}
          >
            {done.has(user.userId) ? '✓' : '+'}
          </button>
        </div>
      ))}
    </div>
  );
}

function PinSmIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}

function FriendRow({ user, online, navigate, t }) {
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
        title={t('feed.message')}
        onClick={() => navigate(`/messages?user=${user.userId}`)}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </button>
    </div>
  );
}
