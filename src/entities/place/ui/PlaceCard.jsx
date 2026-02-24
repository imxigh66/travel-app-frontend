import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoryLabel, getCategoryEmoji, formatRating } from '../model/place.helpers'
import styles from './PlaceCard.module.css'
import { useSavePlace } from '../../../features/save-place/useSavePlace'

export function PlaceCard({
  place,
  variant = 'default',
  onUnsave,      
  isSaved = false,
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
      <div className={styles.thumb}>
        {thumbnail ? (
          <img src={thumbnail} alt={place.name} className={styles.img} />
        ) : (
          <div className={styles.placeholder}>
            <span>{getCategoryEmoji(place.category)}</span>
          </div>
        )}
        <span className={styles.badge}>{getCategoryLabel(place.category)}</span>
        <span className={styles.rating}>★ {formatRating(place.averageRating)}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{place.name}</div>
        <div className={styles.loc}>📍 {place.city}</div>
        {variant === 'wide' && place.description && (
          <div className={styles.desc}>{place.description}</div>
        )}
      </div>

      <button
        className={`${styles.save} ${saved ? styles.saveSaved : ''}`}
        onClick={handleToggle}
        aria-label="Сохранить"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
            fill={saved ? 'currentColor' : 'none'}
          />
        </svg>
      </button>
    </div>
  )
}