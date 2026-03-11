import { useNavigate } from 'react-router-dom'
import { formatRating } from '../model/place.helpers'
import styles from './PlaceCard.module.css'
import { useSavePlace } from '../../../features/save-place/useSavePlace'

export function PlaceCard({
  place,
  variant = 'default',
  onUnsave,
}) {
  const { isSaved: saved, toggle } = useSavePlace(place.placeId)
  const navigate = useNavigate()

  const handleToggle = (e) => {
    e.stopPropagation()
    if (saved) onUnsave?.(place.placeId)
    toggle(e)
  }

  const thumbnail = place.coverImageUrl ?? place.imageUrls?.[0]

  return (
    <div
      className={[
        styles.card,
        variant === 'wide' && styles.cardWide,
        variant === 'grid' && styles.cardGrid,
      ].filter(Boolean).join(' ')}
      onClick={() => navigate(`/places/${place.placeId}`)}
    >
      {/* Thumbnail */}
      <div className={styles.thumb}>
        {thumbnail
          ? <img src={thumbnail} alt={place.name} className={styles.img} />
          : <div className={styles.placeholder} />
        }

        {/* Rating badge top-right */}
        {place.averageRating > 0 && (
          <span className={styles.rating}>★ {formatRating(place.averageRating)}</span>
        )}

        {/* Save button */}
        <button
          className={`${styles.save} ${saved ? styles.saveSaved : ''}`}
          onClick={handleToggle}
          aria-label="Сохранить"
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      {/* Text body */}
      <div className={styles.body}>
        <div className={styles.name}>{place.name}</div>
        <div className={styles.loc}>
          {[place.city, place.country].filter(Boolean).join(' • ')}
        </div>
        {variant === 'wide' && place.description && (
          <div className={styles.desc}>{place.description}</div>
        )}
      </div>
    </div>
  )
}

function BookmarkIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        fill={filled ? 'currentColor' : 'none'} />
    </svg>
  )
}