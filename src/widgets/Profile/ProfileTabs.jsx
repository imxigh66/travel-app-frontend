import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PostCard } from '../../entities/post/ui/PostCard';
import { postApi } from '../../entities/post/api/postApi';
import { CommentSection } from '../../features/comment/CommentSection';
import { tripApi } from '../../entities/trip/api/tripApi';
import { getVisitedCountries } from '../../entities/user/api/userApi';
import { CreatePostCard } from '../../features/post/ui/CreatePostCard';
import { TravelDiary } from '../TravelDiary/TravelDiary'
import styles from './ProfileTabs.module.css';

const toFlagUrl = (code) =>
  `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

const STATUS_LABEL = { 0: 'planned', 1: 'inprogress', 2: 'completed' };
const STATUS_TEXT  = { 0: '→ PLANNED', 1: '✈ IN PROGRESS', 2: '✓ DONE' };

function Lightbox({ photos, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex);
  const prev = useCallback(() => setCurrent(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % photos.length), [photos.length]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, prev, next]);
  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <button className={styles.lightboxClose} onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className={styles.lightboxCounter}>{current + 1} / {photos.length}</div>
      {photos.length > 1 && (
        <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={e => { e.stopPropagation(); prev(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
        <img key={current} src={photos[current]} alt="" className={styles.lightboxImg} />
      </div>
      {photos.length > 1 && (
        <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={e => { e.stopPropagation(); next(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
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

function EmptyState({ title, text }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );
}

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className={styles.loading}>
      <svg className={styles.spinner} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <p>{t('loading')}</p>
    </div>
  );
}

export default function ProfileTabs({ currentUser, userId, isOwnProfile = true, onTripStatsChange }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab]         = useState('posts');
  const [posts, setPosts]                 = useState([]);
  const [trips, setTrips]                 = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [visitedCountries, setVisitedCountries] = useState([]);

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
      const res = isOwnProfile
        ? await tripApi.getMyTrips()
        : await tripApi.getUserTrips(userId);
      const data = res ?? [];
      setTrips(data);
      if (onTripStatsChange) {
        const ccSet   = new Set();
        const citySet = new Set();
        data.forEach(t => {
          if (t.countryCode) ccSet.add(t.countryCode);
          (t.destinations ?? []).forEach(d => { if (d.countryCode) ccSet.add(d.countryCode); });
          if (t.city) citySet.add(t.city);
          (t.destinations ?? []).forEach(d => { if (d.city) citySet.add(d.city); });
        });
        onTripStatsChange({ countries: ccSet.size, trips: data.length, cities: citySet.size });
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'posts')  fetchPosts();
    if (activeTab === 'travel') fetchTrips();
  }, [activeTab]);

  useEffect(() => { fetchTrips(); }, [userId, isOwnProfile]);

  useEffect(() => {
    if (!userId) return;
    getVisitedCountries(userId)
      .then(data => setVisitedCountries(data ?? []))
      .catch(() => {});
  }, [userId]);

  const tabs = [
    { id: 'posts',  label: t('profile.posts')  },
    { id: 'photos', label: t('profile.photos') },
    { id: 'travel', label: t('profile.travel') },
  ];

  const allPhotos   = posts.flatMap(p => p.imageUrls || []);
  const isTravelTab = activeTab === 'travel';

  return (
    <div className={styles.wrapper}>

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

      {/* Travel — полная ширина, без сайдбара */}
      {isTravelTab && (
        <div className={styles.travelWrap}>
          <TravelDiary
            userId={userId}
            isOwnProfile={isOwnProfile}
            trips={trips}
          />
        </div>
      )}

      {/* Posts / Photos — три колонки */}
      {!isTravelTab && (
        <div className={styles.contentRow}>

          {/* ── Left: Active Trips ── */}
          <aside className={styles.tripsAside}>
            <div className={styles.tripsAsideTitle}><TripIcon /> {t('profile.activeTrips')}</div>
            {trips.filter(tr => Number(tr.status) === 1).length === 0 ? (
              <p className={styles.tripsEmpty}>{t('profile.noActiveTrips')}</p>
            ) : (
              trips.filter(tr => Number(tr.status) === 1).slice(0, 4).map(trip => (
                <div key={trip.tripId} className={styles.tripItem} onClick={() => navigate(`/trips/${trip.tripId}`)}>
                  <div className={styles.tripIcon}>
                    {trip.coverImageUrl ? <img src={trip.coverImageUrl} alt="" /> : <PlaneIcon />}
                  </div>
                  <div className={styles.tripInfo}>
                    <div className={styles.tripName}>{trip.title}</div>
                    <div className={`${styles.tripStatus} ${styles.inprogress}`}>✈ {t('trips.inProgress').toUpperCase()}</div>
                  </div>
                </div>
              ))
            )}
            {trips.filter(tr => Number(tr.status) !== 1).length > 0 && (
              <span className={styles.tripsLink} onClick={() => navigate('/trips')}>{t('profile.allTrips')}</span>
            )}
          </aside>

          {/* ── Center: Posts / Photos ── */}
          <div className={styles.mainCol}>
            {isOwnProfile && activeTab === 'posts' && (
              <CreatePostCard currentUser={currentUser} onSuccess={fetchPosts} />
            )}

            {activeTab === 'posts' && (
              isLoading ? <LoadingState /> :
              posts.length === 0
                ? <EmptyState title={t('profile.noPosts')} text={t('profile.shareImpressions')} />
                : (
                  <div className={styles.postsList}>
                    {posts.map(post => (
                      <PostCard
                        key={post.postId}
                        post={post}
                        user={currentUser}
                        compact
                        renderComments={(postId, onCountChange) => (
                          <CommentSection postId={postId} onCountChange={onCountChange} />
                        )}
                      />
                    ))}
                  </div>
                )
            )}

            {activeTab === 'photos' && (
              allPhotos.length === 0
                ? <EmptyState title={t('profile.noPhotos')} text={t('profile.uploadPhotos')} />
                : (
                  <div className={styles.photoGrid}>
                    {allPhotos.map((url, i) => (
                      <div key={i} className={styles.photoItem} onClick={() => setLightboxIndex(i)}>
                        <img src={url} alt="" className={styles.photo} />
                        <div className={styles.photoOverlay}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            <line x1="11" y1="8" x2="11" y2="14"/>
                            <line x1="8" y1="11" x2="14" y2="11"/>
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>

          {/* ── Right: Visited Countries ── */}
          <aside className={styles.countriesAside}>
            <div className={styles.countriesTitle}>
              <GlobeIcon />
              {t('profile.visitedCountries')}
              {visitedCountries.length > 0 && (
                <span className={styles.countriesCount}>{visitedCountries.length}</span>
              )}
            </div>
            {visitedCountries.length === 0 ? (
              <p className={styles.countriesEmpty}>{t('profile.noVisitedCountries')}</p>
            ) : (
              <div className={styles.flagsGrid}>
                {visitedCountries.map((c) => (
                  <div
                    key={c.countryCode}
                    className={styles.flagItem}
                    title={c.countryCode}
                  >
                    <img
                      src={toFlagUrl(c.countryCode)}
                      alt={c.countryCode}
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </aside>

        </div>
      )}

    </div>
  );
}

function TripIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-8 4 4 4-6 4 10"/></svg>; }
function PlaneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2C4.3 5.1 4 5.5 4.2 5.9l2 4c.2.4.6.6 1 .5l3.6-.9 3 3-.9 3.6c-.1.4.1.8.5 1l4 2c.4.2.8-.1.9-.6z"/></svg>; }
function GlobeIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }