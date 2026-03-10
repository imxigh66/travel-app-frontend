import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { placeApi } from '../../entities/place/model/place.api'
import { PlaceNearbyCard } from '../../entities/place/ui/PlaceNearbyCard'
import { PlacePosts } from '../../widgets/PlacePosts/PlacePosts'
import { getCategoryLabel } from '../../entities/place/model/place.helpers'
import styles from './PlaceDetailPage.module.css'
import { useSavePlace } from '../../features/save-place/useSavePlace'
import { AddToTripModal } from '../../features/trip/ui/AddToTripModal';

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

const MOOD_LABELS = {
  0: '👫 С компанией', 1: '🧘 Один', 2: '👨‍👩‍👧 С семьёй',
  3: '💑 Вдвоём', 4: '💼 Корпоратив', 10: '🔥 Особенное',
  11: '😌 Спокойно', 12: '🎲 Удиви меня', 13: '⚡ Активно',
  14: '🏛️ Культура', 15: '🍴 Гурман', 16: '🌙 Вечер', 17: '🌿 Природа',
}

// ══════════════════════════════════════
// Lightbox — просмотр фото
// ══════════════════════════════════════
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = e => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [prev, next, onClose])

  return (
    <div className={styles.lbOverlay} onClick={onClose}>
      <div className={styles.lbInner} onClick={e => e.stopPropagation()}>

        {/* Кнопка закрыть */}
        <button className={styles.lbClose} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Счётчик */}
        <div className={styles.lbCounter}>{idx + 1} / {images.length}</div>

        {/* Главное фото */}
        <div className={styles.lbMain}>
          {images.length > 1 && (
            <button className={`${styles.lbArrow} ${styles.lbArrowLeft}`} onClick={prev}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}

          <img src={images[idx]} alt={`Фото ${idx + 1}`} className={styles.lbImg} />

          {images.length > 1 && (
            <button className={`${styles.lbArrow} ${styles.lbArrowRight}`} onClick={next}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Тумбнейлы */}
        {images.length > 1 && (
          <div className={styles.lbThumbs}>
            {images.map((url, i) => (
              <div
                key={i}
                className={`${styles.lbThumb} ${i === idx ? styles.lbThumbActive : ''}`}
                onClick={() => setIdx(i)}
              >
                <img src={url} alt="" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════
// Gallery Grid — сетка фото
// ══════════════════════════════════════
function GalleryGrid({ images, fallbackGradient, fallbackEmoji, onOpen }) {
  if (images.length === 0) {
    return (
      <div className={styles.galleryFallback} style={{ background: fallbackGradient }}>
        <span>{fallbackEmoji}</span>
      </div>
    )
  }



  return (
    <div className={styles.galleryOne} onClick={() => onOpen(0)}>
      <img src={images[0]} alt="Фото" />
      {images.length > 1 && (
        <button
          className={styles.allPhotosBtn}
          onClick={e => { e.stopPropagation(); onOpen(0) }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Все фото ({images.length})
        </button>
      )}
    </div>
  )
}

// ══════════════════════════════════════
// PlaceDetailPage
// ══════════════════════════════════════
export function PlaceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [place, setPlace]       = useState(null)
  const [nearby, setNearby]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [initialSaved, setInitialSaved] = useState(undefined)
  const [lightbox, setLightbox] = useState(null)
  const { isSaved: saved, toggle: toggleSave } = useSavePlace(Number(id), initialSaved)
  const [tripModal, setTripModal] = useState(false);

  useEffect(() => {
    if (!id) return
    const placeId = Number(id)
    setLoading(true)
    setPlace(null)
    setNearby([])

    Promise.all([
      placeApi.getById(placeId),
      placeApi.getNearby(placeId).catch(() => []),
      placeApi.isSaved(placeId).catch(() => undefined),
    ])
      .then(([p, n, savedFromServer]) => { 
  setPlace(p)
  setNearby(n)
  setInitialSaved(savedFromServer)
})
      .catch(() => setPlace(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад
        </button>
      </div>
      <div className={styles.loadingGallery} />
      <div className={styles.twoCol}>
        <div className={styles.mainCol}>
          <div className={styles.loadingContent}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.loadingLine} style={{ width: `${85 - i * 12}%` }} />
            ))}
          </div>
        </div>
        <div className={styles.sideCol}>
          <div className={styles.loadingBox} />
        </div>
      </div>
    </div>
  )

  if (!place) return (
    <div className={styles.notFound}>
      <span>🔍</span>
      <p>Место не найдено</p>
      <button onClick={() => navigate(-1)}>← Назад</button>
    </div>
  )

  const allImages = place.imageUrls ?? []
  const info      = place.additionalInfo ?? null

  return (
    <div className={styles.page}>

      {/* ── TOP BAR ── */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад
        </button>
        <div className={styles.topActions}>
          <button className={styles.iconBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
         <button
  className={`${styles.iconBtn} ${saved ? styles.iconBtnSaved : ''}`}
  onClick={toggleSave}  // ← было: onClick={() => setSaved(v => !v)}
>
  <svg width="15" height="15" viewBox="0 0 24 24"
    fill={saved ? 'white' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
</button>
        </div>
      </div>

      {/* ── GALLERY ── */}
      <GalleryGrid
        images={allImages}
        fallbackGradient={CATEGORY_GRADIENT[place.category] ?? '#f3f4f6'}
        fallbackEmoji={CATEGORY_EMOJI[place.category] ?? '📍'}
        onOpen={i => setLightbox(i)}
      />

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && (
        <Lightbox
          images={allImages}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* ── TWO COLUMN ── */}
      <div className={styles.twoCol}>

        {/* ── LEFT ── */}
        <div className={styles.mainCol}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.categoryBadge}>
              {CATEGORY_EMOJI[place.category]} {getCategoryLabel(place.category)}
            </div>
            <div className={styles.headerRow}>
              <h1 className={styles.placeName}>{place.name}</h1>
              <button className={styles.routeBtn} onClick={() => setTripModal(true)}>
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
  В маршрут
</button>
            </div>
            <div className={styles.placeAddress}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {place.address}, {place.city}
            </div>
            <div className={styles.metaRow}>
              <span className={styles.stars}>
                {'★'.repeat(Math.round(place.averageRating))}
                {'☆'.repeat(5 - Math.round(place.averageRating))}
              </span>
              <span className={styles.ratingNum}>{place.averageRating?.toFixed(1)}</span>
              <span className={styles.reviewCount}>({place.reviewsCount})</span>
              {info?.priceRange && (
                <><span className={styles.sep}>·</span><span className={styles.priceRange}>{info.priceRange}</span></>
              )}
            </div>
          </div>

          {/* Описание */}
          {place.description && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Описание</div>
              <p className={styles.description}>{place.description}</p>
            </div>
          )}

          {/* Настроения */}
          {place.moods?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Подходит для</div>
              <div className={styles.moodTags}>
                {place.moods.map(m => (
                  <span key={m} className={styles.moodTag}>{MOOD_LABELS[m] ?? m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Подборки */}
          {place.categoryTags?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Входит в подборки</div>
              <div className={styles.ctags}>
                {place.categoryTags.map(tag => (
                  <span key={tag.categoryTagId} className={styles.ctag}>{tag.icon} {tag.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Посты */}
          <PlacePosts placeId={place.placeId} />

          {/* Nearby */}
          {nearby.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Похожие места рядом</div>
                <button
                  className={styles.seeAll}
                  onClick={() => navigate(`/places?category=${place.category}&city=${place.city}`)}
                >
                  все →
                </button>
              </div>
              <div className={styles.nearbyGrid}>
                {nearby.map(p => <PlaceNearbyCard key={p.placeId} place={p} />)}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT ── */}
        <div className={styles.sideCol}>

          {/* Карта */}
          <div className={styles.mapBox}>
            <div className={styles.mapEmoji}>📍</div>
            <div className={styles.mapLoading}>Карта загружается...</div>
            <div className={styles.mapAddr}>{place.address}, {place.city}</div>
          </div>

          {/* Быстрая информация */}
          {info && (
            <div className={styles.sideCard}>
              <div className={styles.sideCardTitle}>Быстрая информация</div>

              {info.openingHours && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>🕐</div>
                  <div>
                    <div className={styles.qiLabel}>Часы работы</div>
                    <div className={styles.qiValue}>{info.openingHours}</div>
                  </div>
                </div>
              )}

              {info.cuisine && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>🍴</div>
                  <div>
                    <div className={styles.qiLabel}>Кухня</div>
                    <div className={styles.qiValue}>{info.cuisine}</div>
                  </div>
                </div>
              )}

              {info.priceRange && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>💰</div>
                  <div>
                    <div className={styles.qiLabel}>Ценовой диапазон</div>
                    <div className={styles.qiValue}>{info.priceRange}</div>
                  </div>
                </div>
              )}

              {(info.acceptsReservations !== undefined ||
                info.hasTakeaway !== undefined ||
                info.hasDelivery !== undefined) && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>📋</div>
                  <div>
                    <div className={styles.qiLabel}>Сервисы</div>
                    <div className={styles.qiChips}>
                      {info.acceptsReservations && <span className={styles.chipYes}>✓ Бронирование</span>}
                      {info.hasTakeaway         && <span className={styles.chipYes}>✓ На вынос</span>}
                      {info.hasDelivery         && <span className={styles.chipYes}>✓ Доставка</span>}
                      {info.hasDelivery === false && <span className={styles.chipNo}>✗ Доставка</span>}
                    </div>
                  </div>
                </div>
              )}

              {info.dietOptions?.length > 0 && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>🥗</div>
                  <div>
                    <div className={styles.qiLabel}>Диетические опции</div>
                    <div className={styles.qiValue}>{info.dietOptions.join(', ')}</div>
                  </div>
                </div>
              )}

            </div>
          )}

          {tripModal && (
  <AddToTripModal
    placeId={place.placeId}
    placeName={place.name}
    onClose={() => setTripModal(false)}
  />
)}

        </div>
      </div>
    </div>
  )
}