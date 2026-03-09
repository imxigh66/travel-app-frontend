import { useState, useEffect } from 'react';
import { tripApi } from '../../entities/trip/api/tripApi';
import { TripCard } from '../../entities/trip/ui/TripCard';
import { CreateTripModal } from '../../features/trip/ui/CreateTripModal';
import styles from './TripsPage.module.css';

const STATUS_FILTERS = [
  { value: null, label: 'Все' },
  { value: 0, label: 'Запланировано' },
  { value: 1, label: 'В процессе' },
  { value: 2, label: 'Завершено' },
];

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripApi.getMyTrips();
      setTrips(data ?? []);
    } catch {
      setError('Не удалось загрузить поездки');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (newTrip) => {
    setTrips(prev => [newTrip, ...prev]);
  };

  const handleDelete = async (tripId) => {
    if (!confirm('Удалить поездку? Это действие нельзя отменить.')) return;
    try {
      await tripApi.deleteTrip(tripId);
      setTrips(prev => prev.filter(t => t.tripId !== tripId));
    } catch {
      alert('Не удалось удалить поездку');
    }
  };

  const filtered = statusFilter !== null
    ? trips.filter(t => t.status === statusFilter)
    : trips;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Мои поездки</h1>
          <p className={styles.subtitle}>Планируйте и отслеживайте путешествия</p>
        </div>
        <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          Новая поездка
        </button>
      </div>

      {/* Stats */}
      {!loading && trips.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{trips.length}</span>
            <span className={styles.statLabel}>поездок</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>
              {[...new Set(trips.map(t => t.countryCode))].length}
            </span>
            <span className={styles.statLabel}>стран</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>
              {trips.reduce((sum, t) => sum + (t.placesCount ?? 0), 0)}
            </span>
            <span className={styles.statLabel}>мест</span>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && trips.length > 0 && (
        <div className={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={String(f.value)}
              className={`${styles.filterBtn} ${statusFilter === f.value ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>⚠️</span>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchTrips}>
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🗺️</span>
          <h2 className={styles.emptyTitle}>Поездок пока нет</h2>
          <p className={styles.emptyText}>
            Создайте свою первую поездку и начните планировать маршрут
          </p>
          <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
            <PlusIcon />
            Создать поездку
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map(trip => (
            <TripCard
              key={trip.tripId}
              trip={trip}
              isOwn
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!loading && !error && trips.length > 0 && filtered.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>Нет поездок с выбранным статусом</p>
        </div>
      )}

      {/* Modal */}
      {isCreateOpen && (
        <CreateTripModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}