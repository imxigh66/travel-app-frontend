import { useNavigate } from 'react-router-dom';
import styles from './TripCard.module.css';

const STATUS_LABEL = {
  0: 'Запланировано',
  1: 'В процессе',
  2: 'Завершено',
};

const STATUS_CLASS = {
  0: 'planned',
  1: 'inprogress',
  2: 'completed',
};

export function TripCard({ trip, onDelete, isOwn = false }) {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(trip.tripId);
  };

  return (
    <div className={styles.card} onClick={() => navigate(`/trips/${trip.tripId}`)}>
      {/* Cover */}
      <div className={styles.cover}>
        {trip.coverImageUrl ? (
          <img src={trip.coverImageUrl} alt={trip.title} className={styles.coverImg} />
        ) : (
          <div className={styles.coverFallback}>
            <span>🗺️</span>
          </div>
        )}
        <span className={`${styles.status} ${styles[STATUS_CLASS[trip.status]]}`}>
          {STATUS_LABEL[trip.status] ?? 'Запланировано'}
        </span>
        {!trip.isPublic && (
          <span className={styles.privateBadge}>🔒 Приватное</span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{trip.title}</h3>

        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <MapPinIcon />
            {trip.city}, {trip.countryCode}
          </span>
          <span className={styles.metaItem}>
            <CalendarIcon />
            {new Date(trip.tripDate).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {trip.description && (
          <p className={styles.description}>{trip.description}</p>
        )}

        <div className={styles.footer}>
          <span className={styles.placesCount}>
            <PlaceIcon />
            {trip.placesCount} {pluralizePlaces(trip.placesCount)}
          </span>
          {isOwn && (
            <button className={styles.deleteBtn} onClick={handleDelete}>
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function pluralizePlaces(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'место';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'места';
  return 'мест';
}

function MapPinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function PlaceIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}