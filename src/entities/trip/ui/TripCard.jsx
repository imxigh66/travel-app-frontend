import { useNavigate } from 'react-router-dom';
import styles from './TripCard.module.css';

const STATUS_LABELS = { 0: 'Запланировано', 1: 'В процессе', 2: 'Завершено' };
const STATUS_CLASS  = { 0: styles.planned, 1: styles.inprogress, 2: styles.completed };

export function TripCard({ trip, isOwn, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(trip.tripId);
  };

  const formattedDate = trip.tripDate
    ? new Date(trip.tripDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className={styles.card} onClick={() => navigate(`/trips/${trip.tripId}`)}>
      {/* Cover */}
      <div className={styles.cover}>
        {trip.coverImageUrl ? (
          <img src={trip.coverImageUrl} alt={trip.title} className={styles.coverImg} />
        ) : (
          <div className={styles.coverFallback}>
            <svg className={styles.coverFallbackIcon} width="48" height="48" viewBox="0 0 24 24"
              fill="none" stroke="var(--mint-dark)" strokeWidth="1.2">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
        )}
        <span className={`${styles.status} ${STATUS_CLASS[trip.status] ?? styles.planned}`}>
          {STATUS_LABELS[trip.status] ?? 'Запланировано'}
        </span>
        {!trip.isPublic && <span className={styles.privateBadge}>Приватная</span>}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.title}>{trip.title}</div>

        <div className={styles.meta}>
          {(trip.city || trip.countryCode) && (
            <span className={styles.metaItem}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {[trip.city, trip.countryCode].filter(Boolean).join(', ')}
            </span>
          )}
          {formattedDate && (
            <span className={styles.metaItem}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {formattedDate}
            </span>
          )}
        </div>

        {trip.description && (
          <p className={styles.description}>{trip.description}</p>
        )}

        <div className={styles.footer}>
          <span className={styles.placesCount}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7"/>
            </svg>
            {trip.placesCount ?? 0} мест
          </span>

          {isOwn && (
            <button className={styles.deleteBtn} onClick={handleDelete} title="Удалить">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}