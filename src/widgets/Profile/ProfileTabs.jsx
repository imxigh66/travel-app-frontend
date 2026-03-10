import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreatePostModal } from '../../features/post/ui/CreatePostModal';
import { PostCard } from '../../entities/post/ui/PostCard';
import { postApi } from '../../entities/post/api/postApi';
import { tripApi } from '../../entities/trip/api/tripApi';

import styles from './ProfileTabs.module.css';

const STATUS_LABEL = { 0: 'Запланировано', 1: 'В процессе', 2: 'Завершено' };
const STATUS_CLASS  = { 0: 'planned', 1: 'inprogress', 2: 'completed' };

export default function ProfileTabs({ currentUser, userId, isOwnProfile = true }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [posts, setPosts]       = useState([]);
  const [trips, setTrips]       = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let response;
      if (isOwnProfile) {
        response = await postApi.getMyPosts(1, 20);
      } else {
        response = await postApi.getUserPosts(userId, 1, 20);
      }
      setPosts(response.items);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      let data;
      if (isOwnProfile) {
        data = await tripApi.getMyTrips();
      } else {
        data = await tripApi.getUserTrips(userId);
      }
      setTrips(data ?? []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'travel') fetchTrips();
  }, [activeTab]);

  const tabs = [
    { id: 'posts',  label: 'Posts'  },
    { id: 'photos', label: 'Photo'  },
    { id: 'travel', label: 'Travel' },
  ];

  const allPhotos = posts.flatMap(p => p.imageUrls || []);

  return (
    <div className={styles.wrapper}>
      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
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

      <div className={styles.content}>

        {/* ── POSTS ── */}
        {activeTab === 'posts' && (
          <>
            {isLoading ? (
              <div className={styles.loading}>
                <LoadingSpinner />
                <p>Загрузка постов...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className={styles.empty}>
                <EmptyIcon />
                <p className={styles.emptyTitle}>Постов пока нет</p>
                <p className={styles.emptyText}>Поделитесь своими впечатлениями о путешествиях</p>
              </div>
            ) : (
              <div className={styles.postsList}>
                {posts.map((post) => (
                  <PostCard key={post.postId} post={post} user={currentUser} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PHOTOS ── */}
        {activeTab === 'photos' && (
          <>
            {allPhotos.length === 0 ? (
              <div className={styles.empty}>
                <EmptyIcon />
                <p className={styles.emptyTitle}>Фото пока нет</p>
                <p className={styles.emptyText}>Загрузите фото из ваших поездок</p>
              </div>
            ) : (
              <div className={styles.photoGrid}>
                {allPhotos.map((url, idx) => (
                  <div key={idx} className={styles.photoItem}>
                    <img src={url} alt="" className={styles.photo} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TRAVEL ── */}
        {activeTab === 'travel' && (
          <>
            {isLoading ? (
              <div className={styles.loading}>
                <LoadingSpinner />
                <p>Загрузка поездок...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className={styles.empty}>
                <EmptyIcon />
                <p className={styles.emptyTitle}>Поездок пока нет</p>
                <p className={styles.emptyText}>
                  {isOwnProfile
                    ? 'Создайте свою первую поездку и составьте маршрут'
                    : 'У этого пользователя пока нет публичных поездок'}
                </p>
                {isOwnProfile && (
                  <button
                    className={styles.createTripBtn}
                    onClick={() => navigate('/trips')}
                  >
                    Создать поездку
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.tripGrid}>
                {trips.map((trip) => (
                  <div
                    key={trip.tripId}
                    className={styles.tripCard}
                    onClick={() => navigate(`/trips/${trip.tripId}`)}
                  >
                    {/* Cover */}
                    <div className={styles.tripCover}>
                      {trip.coverImageUrl
                        ? <img src={trip.coverImageUrl} alt={trip.title} className={styles.tripCoverImg} />
                        : <div className={styles.tripCoverFallback}>🗺️</div>
                      }
                      <span className={`${styles.tripStatus} ${styles[STATUS_CLASS[trip.status]]}`}>
                        {STATUS_LABEL[trip.status]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className={styles.tripInfo}>
                      <p className={styles.tripTitle}>{trip.title}</p>
                      <p className={styles.tripMeta}>
                        {trip.city} · {trip.placesCount} {pluralizePlaces(trip.placesCount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPosts}
        currentUser={currentUser}
      />

      {isOwnProfile && (
        <button
          className={styles.floatingBtn}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon size={24} />
        </button>
      )}
    </div>
  );
}

function pluralizePlaces(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'место';
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'места';
  return 'мест';
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#cbd5e1' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  );
}
function PlusIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function LoadingSpinner() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}