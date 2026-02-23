// entities/place/ui/PlaceNearbyCard/PlaceNearbyCard.jsx

import { useNavigate } from 'react-router-dom'
import { getCategoryLabel } from '../model/place.helpers'
import styles from './PlaceNearbyCard.module.css'

const CATEGORY_GRADIENT = {
  0: 'linear-gradient(145deg, #fef3c7, #fde68a)',
  1: 'linear-gradient(145deg, #dbeafe, #bfdbfe)',
  2: 'linear-gradient(145deg, #ede9fe, #ddd6fe)',
  3: 'linear-gradient(145deg, #d1fae5, #a7f3d0)',
  4: 'linear-gradient(145deg, #fee2e2, #fecaca)',
  5: 'linear-gradient(145deg, #fce7f3, #fbcfe8)',
}

const CATEGORY_EMOJI = {
  0: '🍜', 1: '🏨', 2: '🏛️', 3: '🏔️', 4: '🎭', 5: '🛍️',
}

export function PlaceNearbyCard({ place }) {
  const navigate = useNavigate()

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/places/${place.placeId}`)}
    >
      <div
        className={styles.thumb}
        style={{ background: CATEGORY_GRADIENT[place.category] ?? '#f3f4f6' }}
      >
        {place.coverImageUrl
          ? <img src={place.coverImageUrl} alt={place.name} className={styles.thumbImg} />
          : <span className={styles.thumbEmoji}>{CATEGORY_EMOJI[place.category] ?? '📍'}</span>
        }
        <button
          className={styles.saveBtn}
          onClick={e => e.stopPropagation()}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.name}>{place.name}</div>
        <div className={styles.desc}>{place.description}</div>
        <div className={styles.rating}>
          <span className={styles.stars}>★</span>
          {place.averageRating?.toFixed(1)}
        </div>
      </div>
    </div>
  )
}