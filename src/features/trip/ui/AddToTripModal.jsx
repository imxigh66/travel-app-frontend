import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../../entities/trip/api/tripApi';
import styles from './AddToTripModal.module.css';

const STATUS_LABEL = { 0: 'Запланировано', 1: 'В процессе', 2: 'Завершено' };
const STATUS_CLASS  = { 0: 'planned', 1: 'inprogress', 2: 'completed' };

export function AddToTripModal({ placeId, placeName, onClose }) {
  const navigate = useNavigate();
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(null);   // tripId который грузится
  const [added, setAdded]       = useState(new Set()); // уже добавленные
  const [error, setError]       = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    tripApi.getMyTrips()
      .then(data => setTrips(data ?? []))
      .catch(() => setError('Не удалось загрузить поездки'))
      .finally(() => setLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleAdd = async (tripId) => {
    setAdding(tripId);
    try {
      await tripApi.addPlace(Number(tripId), { placeId: Number(placeId) });
      setAdded(prev => new Set([...prev, tripId]));
    } catch (e) {
      const msg = e?.response?.data?.error ?? 'Ошибка';
      if (msg.toLowerCase().includes('already')) {
        setAdded(prev => new Set([...prev, tripId]));
      } else {
        alert(msg);
      }
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Добавить в маршрут</h3>
            <p className={styles.subtitle}>{placeName}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {loading && (
            <div className={styles.skeletons}>
              {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          )}

          {error && (
            <div className={styles.errorState}>
              <span>😕</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && trips.length === 0 && (
            <div className={styles.emptyState}>
              <span>🗺️</span>
              <p>У тебя пока нет поездок</p>
              <button
                className={styles.createBtn}
                onClick={() => { onClose(); navigate('/trips'); }}
              >
                Создать поездку
              </button>
            </div>
          )}

          {!loading && !error && trips.length > 0 && (
            <div className={styles.list}>
              {trips.map(trip => {
                const isAdded   = added.has(trip.tripId);
                const isAdding  = adding === trip.tripId;

                return (
                  <div key={trip.tripId} className={styles.tripItem}>
                    {/* Cover */}
                    <div className={styles.cover}>
                      {trip.coverImageUrl
                        ? <img src={trip.coverImageUrl} alt={trip.title} className={styles.coverImg} />
                        : <div className={styles.coverFallback}>🗺️</div>
                      }
                    </div>

                    {/* Info */}
                    <div className={styles.info}>
                      <p className={styles.tripTitle}>{trip.title}</p>
                      <div className={styles.tripMeta}>
                        <span className={`${styles.statusDot} ${styles[STATUS_CLASS[trip.status]]}`} />
                        <span className={styles.metaText}>{STATUS_LABEL[trip.status]}</span>
                        <span className={styles.metaSep}>·</span>
                        <span className={styles.metaText}>{trip.city}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      className={`${styles.addBtn} ${isAdded ? styles.addBtnDone : ''}`}
                      onClick={() => !isAdded && handleAdd(trip.tripId)}
                      disabled={isAdding || isAdded}
                    >
                      {isAdding ? <SpinnerIcon /> : isAdded ? <CheckIcon /> : <PlusIcon />}
                      {isAdding ? '' : isAdded ? 'Добавлено' : 'Добавить'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function SpinnerIcon() {
  return <span className={styles.spinner} />;
}