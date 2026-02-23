
import { useEffect, useState } from 'react'

import { placeApi } from '../../entities/place/model/place.api'
import { categoryTagApi } from '../../entities/place/model/categoryTag.api'
import { PlaceCard } from '../../entities/place'
import styles from './PlacesCarousel.module.css'

export function PlacesCarousel({
  title,
  emoji,
  params = {},
  categoryTagId,   // ← новый проп
  variant = 'default',
  onSeeAll,
}) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
  setLoading(true)

  const fetch = categoryTagId
    ? categoryTagApi.getPlacesByTag(categoryTagId, { pageSize: 10 })
    : placeApi.getAll({ pageSize: 10, ...params })

  fetch
    .then(res => setPlaces(res.items ?? []))
    .catch(() => setPlaces([]))
    .finally(() => setLoading(false))

}, [JSON.stringify(params), categoryTagId])

  if (!loading && places.length === 0) return null  // не показываем пустые секции

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title} {emoji}</h2>
        {onSeeAll && (
          <button className={styles.seeAll} onClick={onSeeAll}>
            Все →
          </button>
        )}
      </div>

      <div className={styles.list}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${styles.skeleton} ${variant === 'wide' ? styles.skeletonWide : ''}`} />
            ))
          : places.map(place => (
              <PlaceCard
                key={place.placeId}
                place={place}
                variant={variant}
              />
            ))
        }
      </div>
    </div>
  )
}