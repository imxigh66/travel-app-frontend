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

  const fetchTrips = async () => {
    try {
      const res = await tripApi.getMyTrips();
      setTrips(res ?? []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    if (activeTab === 'travel') fetchTrips();
  }, [activeTab]);

  // Для сайдбара — все поездки
  useEffect(() => { fetchTrips(); }, []);

  const tabs = [
    { id: 'posts',  label: 'Posts' },
    { id: 'photos', label: 'Photo' },
    { id: 'travel', label: 'Travel' },
  ];

  const allPhotos = posts.flatMap(p => p.imageUrls || []);
  const activeTrips = trips.slice(0, 3); // показываем max 3

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
              ? <EmptyState title="Путешествий пока нет" text="Создайте свой первый маршрут" />
              : (
                <div className={styles.postsList}>
                  {trips.map(trip => (
                    <TripCard key={trip.id} trip={trip} onClick={() => navigate(`/trips/${trip.id}`)} />
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
                key={trip.id}
                className={styles.tripItem}
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <div className={styles.tripIcon}>
                  {trip.coverImage
                    ? <img src={trip.coverImage} alt="" />
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
  const STATUS_LABEL = { 0: 'planned', 1: 'inprogress', 2: 'completed' };
  const STATUS_TEXT  = { 0: '→ PLANNED', 1: '✈ IN PROGRESS', 2: '✓ DONE' };
  return (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:16, border:'1px solid var(--color-border)', overflow:'hidden', cursor:'pointer', transition:'box-shadow 0.18s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
    >
      {trip.coverImage && <img src={trip.coverImage} alt="" style={{ width:'100%', height:120, objectFit:'cover', display:'block' }} />}
      <div style={{ padding:'12px 16px' }}>
        <div className={`${styles.tripStatus} ${styles[STATUS_LABEL[trip.status] ?? 'planned']}`} style={{ marginBottom:4 }}>
          {STATUS_TEXT[trip.status] ?? '→ PLANNED'}
        </div>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-dark)' }}>{trip.title}</div>
        {trip.description && <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{trip.description}</div>}
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