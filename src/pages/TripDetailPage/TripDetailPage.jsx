import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../../entities/trip/api/tripApi';
import { getCurrentUser } from '../../entities/user/api/userApi';
import { TripOverview } from '../../widgets/TripDetail/TripOverview';
import { TripRoute } from '../../widgets/TripDetail/TripRoute';
import { TripNotes } from '../../widgets/TripDetail/TripNotes';
import styles from './TripDetailPage.module.css';
import { TripBudget } from '../../widgets/TripDetail/TripBudget'
import { TripDestinations } from '../../widgets/TripDetail/TripDestinations'

const STATUS_LABEL = { 0: 'Запланировано', 1: 'В процессе', 2: 'Завершено' };
const STATUS_CLASS = { 0: 'planned', 1: 'inprogress', 2: 'completed' };

const TABS = [
  { id: 'overview', label: 'Обзор' },
  { id: 'route',    label: 'Маршрут' },
  { id: 'notes',    label: 'Заметки' },
  { id: 'budget',   label: 'Бюджет' },  
]

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      tripApi.getTripById(id),
      getCurrentUser(),
    ])
      .then(([tripData, userRes]) => {
        setTrip(tripData);
        if (userRes.success) setCurrentUser(userRes.data);
      })
      .catch(() => setTrip(null))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = trip && currentUser && trip.ownerId === currentUser.userId;

  const handlePlacesChange = (newPlaces) => {
    setTrip(prev => ({ ...prev, places: newPlaces, placesCount: newPlaces.length }));
  };

  const handleDestinationsChange = (newDestinations) => {
  setTrip(prev => ({ ...prev, destinations: newDestinations }))
}

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingHeader} />
      <div className={styles.loadingTabs} />
      <div className={styles.loadingContent} />
    </div>
  );

  if (!trip) return (
    <div className={styles.notFound}>
      <span>🔍</span>
      <p>Поездка не найдена</p>
      <button onClick={() => navigate(-1)}>← Назад</button>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <ChevronIcon />
        {isOwner ? 'К списку поездок' : `Профиль ${trip.ownerUsername}`}
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{trip.title}</h1>
            <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[trip.status]]}`}>
              {STATUS_LABEL[trip.status]}
            </span>
          </div>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <CalendarIcon />
              {new Date(trip.tripDate).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          <TripDestinations
  trip={trip}
  isOwner={isOwner}
  onUpdate={handleDestinationsChange}
/>
            <span className={styles.metaItem}>
              <PlaceIcon />
              {trip.placesCount} {pluralizePlaces(trip.placesCount)}
            </span>
            {!trip.isPublic && (
              <span className={styles.metaItem}>
                🔒 Приватное
              </span>
            )}
          </div>

          {trip.description && (
            <p className={styles.description}>{trip.description}</p>
          )}
        </div>

        {/* Owner (если чужая поездка) */}
        {!isOwner && (
          <div
            className={styles.ownerBlock}
            onClick={() => navigate(`/users/${trip.ownerId}`)}
          >
            {trip.ownerProfilePicture ? (
              <img src={trip.ownerProfilePicture} alt={trip.ownerUsername} className={styles.ownerAvatar} />
            ) : (
              <div className={styles.ownerAvatarFallback}>
                {trip.ownerUsername?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className={styles.ownerName}>{trip.ownerUsername}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.filter(t => isOwner || t.id !== 'notes' && t.id !== 'budget').map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'route' && trip.places?.length > 0 && (
              <span className={styles.tabBadge}>{trip.places.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.content}>
        {activeTab === 'overview' && (
          <TripOverview
            trip={trip}
            isOwner={isOwner}
            onPlacesChange={handlePlacesChange}
          />
        )}
        {activeTab === 'route' && (
        <TripRoute
  places={trip.places ?? []}
  destinations={trip.destinations ?? []}
  isOwner={isOwner}
  tripId={trip.tripId}
  onPlacesChange={handlePlacesChange}
/>
        )}
        {activeTab === 'notes' && isOwner && (
          <TripNotes tripId={trip.tripId} />
        )}
        {activeTab === 'budget' && isOwner && (
  <TripBudget tripId={trip.tripId} isOwner={isOwner} />
)}
      </div>
    </div>
  );
}

function pluralizePlaces(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'место';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'места';
  return 'мест';
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function PlaceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}