import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostCard } from '../../entities/post/ui/PostCard';
import { postApi } from '../../entities/post/api/postApi';
import { tripApi } from '../../entities/trip/api/tripApi';
import { CreatePostCard } from '../../features/post/ui/CreatePostCard';
import styles from './ProfileTabs.module.css';

const STATUS_LABEL = { 0: 'planned', 1: 'inprogress', 2: 'completed' };
const STATUS_TEXT  = { 0: '→ PLANNED', 1: '✈ IN PROGRESS', 2: '✓ DONE' };

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ photos, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, prev, next]);

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button className={styles.lightboxClose} onClick={onClose} aria-label="Закрыть">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className={styles.lightboxCounter}>{current + 1} / {photos.length}</div>
      {photos.length > 1 && (
        <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={e => { e.stopPropagation(); prev(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
        <img key={current} src={photos[current]} alt="" className={styles.lightboxImg} />
      </div>
      {photos.length > 1 && (
        <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={e => { e.stopPropagation(); next(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      {photos.length > 1 && (
        <div className={styles.lightboxStrip} onClick={e => e.stopPropagation()}>
          {photos.map((url, i) => (
            <button key={i} className={`${styles.lightboxThumb} ${i === current ? styles.lightboxThumbActive : ''}`} onClick={() => setCurrent(i)}>
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function EmptyState({ title, text }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      <svg className={styles.spinner} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <p>Загрузка...</p>
    </div>
  );
}

function TripCard({ trip, onClick }) {
  const label = STATUS_LABEL[trip.status] ?? 'planned';
  const text  = STATUS_TEXT[trip.status]  ?? '→ PLANNED';
  return (
    <div className={styles.tripCard} onClick={onClick}>
      {trip.coverImageUrl && <img src={trip.coverImageUrl} alt="" className={styles.tripCardCover} />}
      <div className={styles.tripCardBody}>
        <div className={`${styles.tripStatus} ${styles[label]}`}>{text}</div>
        <div className={styles.tripCardTitle}>{trip.title}</div>
        {trip.description && <div className={styles.tripCardDesc}>{trip.description}</div>}
        {(trip.city || trip.countryCode) && (
          <div className={styles.tripCardMeta}>📍 {[trip.city, trip.countryCode?.toUpperCase()].filter(Boolean).join(', ')}</div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileTabs({ currentUser, userId, isOwnProfile = true }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts]   = useState([]);
  const [trips, setTrips]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = isOwnProfile
        ? await postApi.getMyPosts(1, 20)
        : await postApi.getUserPosts(userId, 1, 20);
      setPosts(res.items ?? []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const fetchTrips = async () => {
    try {
      const res = isOwnProfile ? await tripApi.getMyTrips() : await tripApi.getUserTrips(userId);
      setTrips(res ?? []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'travel') fetchTrips();
  }, [activeTab]);

  useEffect(() => { fetchTrips(); }, [userId, isOwnProfile]);

  const tabs = [
    { id: 'posts',  label: 'Posts' },
    { id: 'photos', label: 'Photo' },
    { id: 'travel', label: 'Travel' },
  ];

  const allPhotos  = posts.flatMap(p => p.imageUrls || []);
  const activeTrips = trips.slice(0, 3);

  return (
    <div className={styles.wrapper}>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox photos={allPhotos} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content row */}
      <div className={styles.contentRow}>

        {/* ── Main column ── */}
        <div className={styles.mainCol}>

          {/* Create post card — only on Posts tab for own profile */}
          {isOwnProfile && activeTab === 'posts' && (
            <CreatePostCard currentUser={currentUser} onSuccess={fetchPosts} />
          )}

          {/* Posts */}
          {activeTab === 'posts' && (
            isLoading ? <LoadingState /> :
            posts.length === 0
              ? <EmptyState title="Постов пока нет" text="Поделитесь своими впечатлениями" />
              : (
                <div className={styles.postsList}>
                  {posts.map(post => (
                    <PostCard key={post.postId} post={post} user={currentUser} />
                  ))}
                </div>
              )
          )}

          {/* Photos */}
          {activeTab === 'photos' && (
            allPhotos.length === 0
              ? <EmptyState title="Фото пока нет" text="Загрузите фото из ваших поездок" />
              : (
                <div className={styles.photoGrid}>
                  {allPhotos.map((url, i) => (
                    <div key={i} className={styles.photoItem} onClick={() => setLightboxIndex(i)}>
                      <img src={url} alt="" className={styles.photo} />
                      <div className={styles.photoOverlay}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )
          )}

          {/* Travel */}
          {activeTab === 'travel' && (
            trips.length === 0
              ? <EmptyState
                  title={isOwnProfile ? 'Путешествий пока нет' : 'Нет публичных путешествий'}
                  text={isOwnProfile ? 'Создайте свой первый маршрут' : 'Пользователь не добавил публичных поездок'}
                />
              : (
                <div className={styles.postsList}>
                  {trips.map(trip => (
                    <TripCard key={trip.tripId} trip={trip} onClick={() => navigate(`/trips/${trip.tripId}`)} />
                  ))}
                </div>
              )
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.tripsAside}>
          <div className={styles.tripsAsideTitle}><span>🗺</span> Активные поездки</div>

          {activeTrips.length === 0
            ? <p className={styles.tripsEmpty}>Нет активных поездок</p>
            : activeTrips.map(trip => (
                <div key={trip.tripId} className={styles.tripItem} onClick={() => navigate(`/trips/${trip.tripId}`)}>
                  <div className={styles.tripIcon}>
                    {trip.coverImageUrl ? <img src={trip.coverImageUrl} alt="" /> : '✈️'}
                  </div>
                  <div className={styles.tripInfo}>
                    <div className={styles.tripName}>{trip.title}</div>
                    <div className={`${styles.tripStatus} ${styles[STATUS_LABEL[trip.status] ?? 'planned']}`}>
                      {STATUS_TEXT[trip.status] ?? '→ PLANNED'}
                    </div>
                  </div>
                </div>
              ))
          }

          {activeTrips.length > 0 && (
            <span className={styles.tripsLink} onClick={() => navigate('/trips')}>Все поездки →</span>
          )}
        </aside>
      </div>
    </div>
  );
}