import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../../entities/trip/api/tripApi';
import styles from './TripOverview.module.css';

export function TripOverview({ trip, isOwner, onPlacesChange }) {
  const navigate = useNavigate();
  const places = trip.places ?? [];

  const handleRemove = async (placeId) => {
    if (!confirm('Убрать место из поездки?')) return;
    try {
      await tripApi.removePlace(trip.tripId, placeId);
      const updated = places.filter(p => p.placeId !== placeId);
      onPlacesChange(updated);
    } catch {
      alert('Не удалось удалить место');
    }
  };

  if (places.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>📍</span>
        <h3 className={styles.emptyTitle}>Мест пока нет</h3>
        <p className={styles.emptyText}>
          {isOwner
            ? 'Добавьте места из каталога, чтобы составить маршрут'
            : 'Автор ещё не добавил места в эту поездку'}
        </p>
        {isOwner && (
          <button className={styles.exploreBtn} onClick={() => navigate('/explore')}>
            Найти места
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {places.map((place, idx) => (
        <div key={place.placeId} className={styles.placeItem}>
          {/* Номер */}
          <div className={styles.indexBadge}>{idx + 1}</div>

          {/* Обложка */}
          <div className={styles.cover}>
            {place.coverImageUrl ? (
              <img src={place.coverImageUrl} alt={place.name} className={styles.coverImg} />
            ) : (
              <div className={styles.coverFallback}>📍</div>
            )}
          </div>

          {/* Инфо */}
          <div className={styles.info} onClick={() => navigate(`/places/${place.placeId}`)}>
            <h4 className={styles.placeName}>{place.name}</h4>
            <p className={styles.placeAddress}>
              {place.address && `${place.address}, `}{place.city}
            </p>
            {place.notes && (
              <p className={styles.placeNotes}>💬 {place.notes}</p>
            )}
          </div>

          {/* Удалить (только владелец) */}
          {isOwner && (
            <button
              className={styles.removeBtn}
              onClick={() => handleRemove(place.placeId)}
            >
              <TrashIcon />
            </button>
          )}
        </div>
      ))}

      {isOwner && (
        <button className={styles.addMoreBtn} onClick={() => navigate('/explore')}>
          <PlusIcon />
          Добавить место
        </button>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}