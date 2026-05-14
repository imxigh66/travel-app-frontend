import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tripApi } from '../../entities/trip/api/tripApi';
import { TripCard } from '../../entities/trip/ui/TripCard';
import { CreateTripModal } from '../../features/trip/ui/CreateTripModal';
import styles from './TripsPage.module.css';

export default function TripsPage() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const STATUS_FILTERS = [
    { value: null, label: t('trips.all') },
    { value: 0, label: t('trips.planned') },
    { value: 1, label: t('trips.inProgress') },
    { value: 2, label: t('trips.completed') },
  ];

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
      setError(t('profile.errorLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (newTrip) => {
    setTrips(prev => [newTrip, ...prev]);
  };

  const handleDelete = async (tripId) => {
    if (!confirm(t('trips.deleteConfirm'))) return;
    try {
      await tripApi.deleteTrip(tripId);
      setTrips(prev => prev.filter(tr => tr.tripId !== tripId));
    } catch {
      alert(t('trips.deleteError'));
    }
  };

  const filtered = statusFilter !== null
    ? trips.filter(t => t.status === statusFilter)
    : trips;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('trips.title')}</h1>
          <p className={styles.subtitle}>{t('trips.subtitle')}</p>
        </div>
        <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
          <PlusIcon />
          {t('trips.newTrip')}
        </button>
      </div>

      {!loading && trips.length > 0 && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{trips.length}</span>
            <span className={styles.statLabel}>{t('trips.tripsCount')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>
              {[...new Set(trips.map(t => t.countryCode))].length}
            </span>
            <span className={styles.statLabel}>{t('trips.countriesCount')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>
              {trips.reduce((sum, t) => sum + (t.placesCount ?? 0), 0)}
            </span>
            <span className={styles.statLabel}>{t('trips.placesCount')}</span>
          </div>
        </div>
      )}

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
            {t('retry')}
          </button>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🗺️</span>
          <h2 className={styles.emptyTitle}>{t('trips.emptyTitle')}</h2>
          <p className={styles.emptyText}>{t('trips.emptyText')}</p>
          <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
            <PlusIcon />
            {t('trips.createTrip')}
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
          <p>{t('trips.noStatus')}</p>
        </div>
      )}

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
