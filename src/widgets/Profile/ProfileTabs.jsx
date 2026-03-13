import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatePostModal } from '../../features/post/ui/CreatePostModal';
import { PostCard } from '../../entities/post/ui/PostCard';
import { postApi } from '../../entities/post/api/postApi';
import { tripApi } from '../../entities/trip/api/tripApi';
import styles from './ProfileTabs.module.css';

const STATUS_LABEL = { 0: 'planned', 1: 'inprogress', 2: 'completed' };
const STATUS_TEXT  = { 0: '→ PLANNED', 1: '✈ IN PROGRESS', 2: '✓ DONE' };

export default function ProfileTabs({ currentUser, userId, isOwnProfile = true }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts]   = useState([]);
  const [trips, setTrips]   = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = isOwnProfile
        ? await postApi.getMyPosts(1, 20)
        : await postApi.getUserPosts(userId, 1, 20);
      setPosts(res.items ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: свой профиль → getMyTrips, чужой → getUserTrips(userId)
  const fetchTrips = async () => {
    try {
      const res = isOwnProfile
        ? await tripApi.getMyTrips()
        : await tripApi.getUserTrips(userId);
      setTrips(res ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'travel') fetchTrips();
  }, [activeTab]);

  // Для сайдбара — грузим при маунте и при смене профиля
  useEffect(() => { fetchTrips(); }, [userId, isOwnProfile]);

  const tabs = [
    { id: 'posts',  label: 'Posts' },
    { id: 'photos', label: 'Photo' },
    { id: 'travel', label: 'Travel' },
  ];

  const allPhotos = posts.flatMap(p => p.imageUrls || []);
  const activeTrips = trips.slice(0, 3);

  return (
    <div className={styles.wrapper}>

      {/* Tabs — по центру, пилюли */}
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

      {/* Content + активные поездки */}
      <div className={styles.contentRow}>

        {/* ── Main content ── */}
        <div>
          {activeTab === 'posts' && (
            isLoading ? <LoadingState /> :
            posts.length === 0 ? (
              <EmptyState title="Постов пока нет" text="Поделитесь своими впечатлениями" />
            ) : (
              <div className={styles.postsList}>
                {posts.map(post => (
                  <PostCard key={post.postId} post={post} user={currentUser} />
                ))}
              </div>
            )
          )}

          {activeTab === 'photos' && (
            allPhotos.length === 0
              ? <EmptyState title="Фото пока нет" text="Загрузите фото из ваших поездок" />
              : (
                <div className={styles.photoGrid}>
                  {allPhotos.map((url, i) => (
                    <div key={i} className={styles.photoItem}>
                      <img src={url} alt="" className={styles.photo} />
                    </div>
                  ))}
                </div>
              )
          )}

          {activeTab === 'travel' && (
            trips.length === 0
              ? (
                <EmptyState
                  title={isOwnProfile ? 'Путешествий пока нет' : 'Нет публичных путешествий'}
                  text={isOwnProfile ? 'Создайте свой первый маршрут' : 'Пользователь не добавил публичных поездок'}
                />
              ) : (
                <div className={styles.postsList}>
                  {trips.map(trip => (
                    <TripCard
                      key={trip.tripId}
                      trip={trip}
                      onClick={() => navigate(`/trips/${trip.tripId}`)}
                    />
                  ))}
                </div>
              )
          )}
        </div>

        {/* ── Активные поездки (сайдбар) ── */}
        <aside className={styles.tripsAside}>
          <div className={styles.tripsAsideTitle}>
            <span>🗺</span> Активные поездки
          </div>

          {activeTrips.length === 0 ? (
            <p className={styles.tripsEmpty}>Нет активных поездок</p>
          ) : (
            activeTrips.map(trip => (
              <div
                key={trip.tripId}
                className={styles.tripItem}
                onClick={() => navigate(`/trips/${trip.tripId}`)}
              >
                <div className={styles.tripIcon}>
                  {trip.coverImageUrl
                    ? <img src={trip.coverImageUrl} alt="" />
                    : '✈️'}
                </div>
                <div className={styles.tripInfo}>
                  <div className={styles.tripName}>{trip.title}</div>
                  <div className={`${styles.tripStatus} ${styles[STATUS_LABEL[trip.status] ?? 'planned']}`}>
                    {STATUS_TEXT[trip.status] ?? '→ PLANNED'}
                  </div>
                </div>
              </div>
            ))
          )}

          <span className={styles.tripsLink} onClick={() => navigate('/trips')}>
            Все маршруты →
          </span>
        </aside>
      </div>

      {/* Create post modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPosts}
        currentUser={currentUser}
      />

      {isOwnProfile && (
        <button className={styles.floatingBtn} onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon />
        </button>
      )}
    </div>
  );
}

/* ── Small components ── */
function EmptyState({ title, text }) {
  return (
    <div className={styles.empty}>
      <EmptyIcon />
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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
      {trip.coverImageUrl && (
        <img src={trip.coverImageUrl} alt="" className={styles.tripCardCover} />
      )}
      <div className={styles.tripCardBody}>
        <div className={`${styles.tripStatus} ${styles[label]}`}>{text}</div>
        <div className={styles.tripCardTitle}>{trip.title}</div>
        {trip.description && (
          <div className={styles.tripCardDesc}>{trip.description}</div>
        )}
        {(trip.city || trip.countryCode) && (
          <div className={styles.tripCardMeta}>
            📍 {[trip.city, trip.countryCode?.toUpperCase()].filter(Boolean).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyIcon() {
  return <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>;
}
function PlusIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}