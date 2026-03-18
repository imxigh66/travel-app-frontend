import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { placeApi } from '../../entities/place/model/place.api'
import { getCategoryLabel } from '../../entities/place/model/place.helpers'
import { useSavePlace } from '../../features/save-place/useSavePlace'
import { PlacePosts } from '../../widgets/PlacePosts/PlacePosts'
import styles from './PlaceDetailPage.module.css'
import { PlaceDetailMap } from '../../widgets/PlacesMap/PlaceDetailMap'
import { AddToTripModal } from '../../features/trip/ui/AddToTripModal'

const MOOD_LABELS = {
  0:  'С компанией',
  1:  'Один',
  2:  'С семьёй',
  3:  'Вдвоём',
  4:  'Корпоратив',
  10: 'Особенное',
  11: 'Спокойно',
  12: 'Удиви меня',
  13: 'Активно',
  14: 'Культурно',
  15: 'Вкусно поесть',
  16: 'Вечер',
  17: 'Природа',
}

const CATEGORY_GRADIENT = {
  0: 'linear-gradient(135deg, var(--peach), var(--tan))',
  1: 'linear-gradient(135deg, var(--mint-light), var(--mint-medium))',
  2: 'linear-gradient(135deg, #e8e4f8, #d5cff2)',
  3: 'linear-gradient(135deg, var(--mint-soft), var(--mint-tag))',
  4: 'linear-gradient(135deg, var(--peach), var(--salmon))',
  5: 'linear-gradient(135deg, #f8e8d4, var(--tan))',
}


// ══════════════════════════════════════
// GalleryGrid
// ══════════════════════════════════════
function GalleryGrid({ images, fallbackGradient, onOpen }) {
  if (!images.length) return (
    <div className={styles.galleryFallback} style={{ background: fallbackGradient }} />
  )

  if (images.length === 1) return (
    <div className={styles.galleryOne} onClick={() => onOpen(0)}>
      <img src={images[0]} alt="cover" />
    </div>
  )

  return (
    <div className={styles.galleryGrid}>
      <div className={styles.galleryMain} onClick={() => onOpen(0)}>
        <img src={images[0]} alt="main" />
      </div>
      <div className={styles.galleryThumb} onClick={() => onOpen(1)}>
        <img src={images[1]} alt="thumb" />
      </div>
      {images[2] && (
        <div className={styles.galleryThumb} style={{ position: 'relative' }} onClick={() => onOpen(2)}>
          <img src={images[2]} alt="thumb2" />
          {images.length > 3 && (
            <button className={styles.allPhotosBtn} onClick={e => { e.stopPropagation(); onOpen(2) }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Все фото ({images.length})
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════
// Lightbox
// ══════════════════════════════════════
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, images.length - 1))
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [images.length, onClose])

  return (
    <div className={styles.lbOverlay} onClick={onClose}>
      <button className={styles.lbClose} onClick={onClose}>✕</button>
      <img
        className={styles.lbImg}
        src={images[idx]}
        alt=""
        onClick={e => e.stopPropagation()}
      />
      {idx > 0 && (
        <button className={styles.lbPrev} onClick={e => { e.stopPropagation(); setIdx(i => i - 1) }}>‹</button>
      )}
      {idx < images.length - 1 && (
        <button className={styles.lbNext} onClick={e => { e.stopPropagation(); setIdx(i => i + 1) }}>›</button>
      )}
      <div className={styles.lbCounter}>{idx + 1} / {images.length}</div>
    </div>
  )
}

// ══════════════════════════════════════
// ══════════════════════════════════════
// PlaceNearbyCard
// ══════════════════════════════════════
function PlaceNearbyCard({ place }) {
  const navigate = useNavigate()
  const thumb = place.coverImageUrl ?? place.imageUrls?.[0]

  return (
    <div className={styles.nearbyCard} onClick={() => navigate(`/places/${place.placeId}`)}>
      <div className={styles.nearbyThumb}>
        {thumb
          ? <img src={thumb} alt={place.name} />
          : <div className={styles.nearbyThumbPlaceholder} />
        }
      </div>
      <div className={styles.nearbyInfo}>
        <div className={styles.nearbyName}>{place.name}</div>
        <div className={styles.nearbyMeta}>{place.city}</div>
        {place.averageRating > 0 && (
          <div className={styles.nearbyRating}>★ {place.averageRating.toFixed(1)}</div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════
// PlaceDetailPage
// ══════════════════════════════════════
export function PlaceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [place, setPlace]           = useState(null)
  const [nearby, setNearby]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [initialSaved, setInitialSaved] = useState(undefined)
  const [lightbox, setLightbox]     = useState(null)
  const { isSaved: saved, toggle: toggleSave } = useSavePlace(Number(id), initialSaved)
  const [addToTripOpen, setAddToTripOpen] = useState(false)


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
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Назад</button>
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад
        </button>
        <div className={styles.topActions}>
          <button className={styles.iconBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button
            className={`${styles.iconBtn} ${saved ? styles.iconBtnSaved : ''}`}
            onClick={toggleSave}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── GALLERY ── */}
      <GalleryGrid
        images={allImages}
        fallbackGradient={CATEGORY_GRADIENT[place.category] ?? 'linear-gradient(135deg, var(--mint-light), var(--peach))'}
        onOpen={i => setLightbox(i)}
      />

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && (
        <Lightbox images={allImages} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}

      {/* ── TWO COLUMN ── */}
      <div className={styles.twoCol}>

        {/* ── LEFT ── */}
        <div className={styles.mainCol}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.categoryBadge}>
              {getCategoryLabel(place.category)}
            </div>
            <div className={styles.headerRow}>
              <h1 className={styles.placeName}>{place.name}</h1>
              <button className={styles.routeBtn} onClick={() => setAddToTripOpen(true)}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
  Маршрут
</button>
 
{addToTripOpen && (
  <AddToTripModal
    placeId={place.placeId}
    placeName={place.name}
    onClose={() => setAddToTripOpen(false)}
  />
)}
            </div>
            {place.address && (
              <div className={styles.placeAddress}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {place.address}, {place.city}
              </div>
            )}
            <div className={styles.metaRow}>
              {place.averageRating > 0 && <>
                <span className={styles.stars}>{'★'.repeat(Math.round(place.averageRating))}{'☆'.repeat(5 - Math.round(place.averageRating))}</span>
                <span className={styles.ratingNum}>{place.averageRating.toFixed(1)}</span>
                {place.reviewsCount > 0 && <span className={styles.reviewCount}>({place.reviewsCount})</span>}
              </>}
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
 {/* Автор */}
          {place.creatorUsername && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Добавил</div>
              <div className={styles.creatorRow} onClick={() => navigate(`/users/${place.createdBy}`)}>
                {place.creatorProfilePicture
                  ? <img src={place.creatorProfilePicture} alt="" className={styles.creatorAvatar} />
                  : <div className={styles.creatorAvatarFallback}>
                      {place.creatorUsername.slice(0, 2).toUpperCase()}
                    </div>
                }
                <span className={styles.creatorName}>@{place.creatorUsername}</span>
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
                <button className={styles.seeAll} onClick={() => navigate(`/places?category=${place.category}&city=${place.city}`)}>
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
          <PlaceDetailMap place={place} />

          {/* Быстрая информация */}
          {info && (
            <div className={styles.sideCard}>
              <div className={styles.sideCardTitle}>Информация</div>

              {info.openingHours && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <div className={styles.qiLabel}>Часы работы</div>
                    <div className={styles.qiValue}>{info.openingHours}</div>
                  </div>
                </div>
              )}

              {info.cuisine && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                  </div>
                  <div>
                    <div className={styles.qiLabel}>Кухня</div>
                    <div className={styles.qiValue}>{info.cuisine}</div>
                  </div>
                </div>
              )}

              {info.priceRange && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                  </div>
                  <div>
                    <div className={styles.qiLabel}>Цены</div>
                    <div className={styles.qiValue}>{info.priceRange}</div>
                  </div>
                </div>
              )}

              {info.website && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                  </div>
                  <div>
                    <div className={styles.qiLabel}>Сайт</div>
                    <a className={styles.qiLink} href={info.website} target="_blank" rel="noopener noreferrer">
                      {info.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}

              {info.phone && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.86 9.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012.81 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l.97-.97a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  </div>
                  <div>
                    <div className={styles.qiLabel}>Телефон</div>
                    <div className={styles.qiValue}>{info.phone}</div>
                  </div>
                </div>
              )}

              {/* Фичи: Wi-Fi, детская комната и т.д. */}
              {(info.hasWifi != null || info.hasParking != null || info.hasDelivery != null) && (
                <div className={styles.qi}>
                  <div className={styles.qiIcon}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  </div>
                  <div>
                    <div className={styles.qiLabel}>Удобства</div>
                    <div className={styles.qiChips}>
                      {info.hasWifi     != null && <span className={info.hasWifi     ? styles.chipYes : styles.chipNo}>Wi-Fi</span>}
                      {info.hasParking  != null && <span className={info.hasParking  ? styles.chipYes : styles.chipNo}>Парковка</span>}
                      {info.hasDelivery != null && <span className={info.hasDelivery ? styles.chipYes : styles.chipNo}>Доставка</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          

        </div>
      </div>
    </div>
  )
}