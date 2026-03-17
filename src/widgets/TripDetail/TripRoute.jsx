import { useState } from 'react';
import { tripApi } from '../../entities/trip/api/tripApi';
import styles from './TripRoute.module.css';
import { TripRouteMap } from './TripRouteMap'

export function TripRoute({ places, isOwner, tripId, onPlacesChange }) {
  const [reordering, setReordering] = useState(false);
  const [localPlaces, setLocalPlaces] = useState(
    [...places].sort((a, b) => a.sortOrder - b.sortOrder)
  );

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...localPlaces];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setLocalPlaces(updated);
  };

  const moveDown = (idx) => {
    if (idx === localPlaces.length - 1) return;
    const updated = [...localPlaces];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setLocalPlaces(updated);
  };

  const saveOrder = async () => {
    setReordering(true);
    try {
      const payload = localPlaces.map((p, idx) => ({
        placeId: p.placeId,
        sortOrder: idx + 1,
      }));
      await tripApi.reorderPlaces(tripId, payload);
      const updated = localPlaces.map((p, idx) => ({ ...p, sortOrder: idx + 1 }));
      onPlacesChange(updated);
    } catch {
      alert('Не удалось сохранить порядок');
    } finally {
      setReordering(false);
    }
  };

  if (localPlaces.length === 0) {
    return (
      <div className={styles.empty}>
        <span>🗺️</span>
        <p>Добавьте места во вкладке «Обзор», чтобы составить маршрут</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <TripRouteMap places={localPlaces} />
      <div className={styles.topRow}>
        <p className={styles.hint}>
          {isOwner
            ? 'Используйте стрелки чтобы изменить порядок посещения'
            : 'Порядок посещения мест'}
        </p>
        {isOwner && (
          <button className={styles.saveBtn} onClick={saveOrder} disabled={reordering}>
            {reordering ? 'Сохранение...' : 'Сохранить порядок'}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {localPlaces.map((place, idx) => (
          <div key={place.placeId} className={styles.item}>
            {/* Номер + стрелки */}
            <div className={styles.orderCol}>
              {isOwner && (
                <button
                  className={styles.arrowBtn}
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                >▲</button>
              )}
              <div className={styles.orderNum}>{idx + 1}</div>
              {isOwner && (
                <button
                  className={styles.arrowBtn}
                  onClick={() => moveDown(idx)}
                  disabled={idx === localPlaces.length - 1}
                >▼</button>
              )}
            </div>

            {/* Линия соединения */}
            {idx < localPlaces.length - 1 && (
              <div className={styles.connector} />
            )}

            {/* Обложка */}
            <div className={styles.cover}>
              {place.coverImageUrl ? (
                <img src={place.coverImageUrl} alt={place.name} className={styles.coverImg} />
              ) : (
                <div className={styles.coverFallback}>📍</div>
              )}
            </div>

            {/* Инфо */}
            <div className={styles.info}>
              <h4 className={styles.name}>{place.name}</h4>
              <p className={styles.address}>
                {place.address && `${place.address}, `}{place.city}
              </p>
              {place.notes && (
                <p className={styles.notes}>💬 {place.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}