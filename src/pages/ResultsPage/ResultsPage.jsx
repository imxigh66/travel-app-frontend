
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { placeApi } from '../../entities/place/model/place.api'
import { getCategoryLabel } from '../../entities/place/model/place.helpers'
import styles from './ResultsPage.module.css'

const MOOD_META = {
  WithCompany:  { emoji: '👫', label: 'С компанией',     desc: 'Места для совместного отдыха' },
  Solo:         { emoji: '🧘', label: 'Один',             desc: 'Места для уединения' },
  WithFamily:   { emoji: '👨‍👩‍👧', label: 'С семьёй',   desc: 'Места для семейного отдыха' },
  RomanticDate: { emoji: '💑', label: 'Вдвоём',           desc: 'Романтические места' },
  Special:      { emoji: '🔥', label: 'Особенное',        desc: 'Места которые запомнятся' },
  Calm:         { emoji: '😌', label: 'Спокойно',         desc: 'Тихие места для отдыха' },
  Active:       { emoji: '⚡', label: 'Активно',          desc: 'Активный отдых и спорт' },
  NightOut:     { emoji: '🌙', label: 'Вечер',            desc: 'Для вечернего выхода' },
  Surprise:     { emoji: '🎲', label: 'Удиви меня',       desc: 'Неожиданное и интересное' },
}

const CATEGORY_META = {
  0: { emoji: '🍜', label: 'Еда' },
  1: { emoji: '🏨', label: 'Жильё' },
  2: { emoji: '🏛️', label: 'Культура' },
  3: { emoji: '🏔️', label: 'Природа' },
  4: { emoji: '🎭', label: 'Развлечения' },
  5: { emoji: '🛍️', label: 'Шопинг' },
  6: { emoji: '🚉', label: 'Транспорт' },
  7: { emoji: '🏦', label: 'Сервисы' },
}

const INTERESTS = [
  { value: null, emoji: '🌍', label: 'Все' },
  { value: 0,    emoji: '🍜', label: 'Еда' },
  { value: 3,    emoji: '🏔️', label: 'Природа' },
  { value: 2,    emoji: '🏛️', label: 'Культура' },
  { value: 4,    emoji: '🎭', label: 'Развлечения' },
  { value: 1,    emoji: '🏨', label: 'Жильё' },
  { value: 5,    emoji: '🛍️', label: 'Шопинг' },
]

const SORTS = [
  { key: 'newest',  label: '✦ Лучшее' },
  { key: 'rating',  label: '⭐ Рейтинг' },
  { key: 'popular', label: '🔥 Популярное' },
  { key: 'saves',   label: '🆕 Новые' },
]

export function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Читаем параметры
  const moodsParam    = searchParams.get('moods')      // "WithCompany,Solo"
  const moodParam     = searchParams.get('mood')       // одиночный mood
  const categoryParam = searchParams.get('category')
  const categoryTagId = searchParams.get('categoryTagId')
  const searchQ       = searchParams.get('search')

  // Нормализуем moods в массив
  const moods = moodsParam
    ? moodsParam.split(',').filter(Boolean)
    : moodParam
    ? [moodParam]
    : []

  const [places, setPlaces]         = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [sortBy, setSortBy]         = useState('newest')
  const [page, setPage]             = useState(1)
  const [hasMore, setHasMore]       = useState(true)
  const [view, setView]             = useState('list')  // 'list' | 'map'
  const [activeCategory, setActiveCategory] = useState(
    categoryParam != null ? Number(categoryParam) : null
  )
  const [showLocationFilter, setShowLocationFilter] = useState(false)
  const [city, setCity]             = useState(searchParams.get('city') ?? '')
  const [country, setCountry]       = useState(searchParams.get('country') ?? '')

  const loaderRef = useRef(null)

  const fetchPlaces = useCallback(async (pageNum, sort, catOverride) => {
    setLoading(true)
    try {
      const cat = catOverride !== undefined ? catOverride : activeCategory

      // Для нескольких мудов — берём первый
      // (когда бэк поддержит массив — передавать все)
      const params = {
        pageNumber: pageNum,
        pageSize:   10,
        sortBy:     sort,
        ...(moods.length > 0  && { mood: moods[0] }),
        ...(cat != null       && { category: cat }),
        ...(categoryTagId     && { categoryTagId }),
        ...(city.trim()       && { city: city.trim() }),
        ...(country.trim()    && { countryCode: country.trim() }),
      }
      console.log('📡 Request params:', params)
      const res = await placeApi.getAll(params)
      console.log('📦 Response:', res) 
      if (pageNum === 1) {
        setPlaces(res.items ?? [])
      } else {
        setPlaces(prev => [...prev, ...(res.items ?? [])])
      }
      setTotal(res.totalCount ?? 0)
      setHasMore(res.hasNextPage ?? false)
    } catch {
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }, [moods.join(','), activeCategory, categoryTagId, city, country])

  useEffect(() => {
    setPage(1)
    fetchPlaces(1, sortBy)
  }, [moods.join(','), activeCategory, categoryTagId, sortBy, city, country])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1
        setPage(next)
        fetchPlaces(next, sortBy)
      }
    }, { threshold: 0.5 })
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

  const handleSort = (key) => { setSortBy(key); setPage(1) }

  const handleCategoryFilter = (val) => {
    setActiveCategory(val)
    setPage(1)
    fetchPlaces(1, sortBy, val)
  }

  const handleLocationSearch = () => {
    setPage(1)
    fetchPlaces(1, sortBy)
    setShowLocationFilter(false)
  }

  // ── Баннер ──
  const hasMoods    = moods.length > 0
  const hasCategory = categoryParam != null && !hasMoods

  const bannerEmoji = hasMoods
    ? moods.map(m => MOOD_META[m]?.emoji ?? '').join(' ')
    : CATEGORY_META[Number(categoryParam)]?.emoji ?? '🔍'

  const bannerTitle = hasMoods
    ? moods.map(m => MOOD_META[m]?.label ?? m).join(' + ')
    : CATEGORY_META[Number(categoryParam)]?.label ?? searchQ ?? 'Все места'

  const bannerDesc = hasMoods
    ? `Места подходящие для: ${moods.map(m => MOOD_META[m]?.label).join(', ')}`
    : `Лучшие места категории "${CATEGORY_META[Number(categoryParam)]?.label}"`

  return (
    <div className={styles.page}>

      {/* ── BACK ── */}
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад
        </button>

        {/* Вид */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`}
            onClick={() => setView('list')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Список
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'map' ? styles.viewActive : ''}`}
            onClick={() => setView('map')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            Карта
          </button>
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerEyebrow}>
            {hasMoods ? 'НАСТРОЕНИЕ' : hasCategory ? 'КАТЕГОРИЯ' : 'ПОИСК'}
          </div>
          <div className={styles.bannerTitle}>{bannerEmoji} {bannerTitle}</div>
          <div className={styles.bannerDesc}>{bannerDesc}</div>

          {/* Теги выбранных мудов */}
          {hasMoods && (
            <div className={styles.moodTags}>
              {moods.map(m => (
                <span key={m} className={styles.moodTag}>
                  {MOOD_META[m]?.emoji} {MOOD_META[m]?.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.bannerCount}>
          {loading && places.length === 0
            ? <div className={styles.bannerNumSkeleton} />
            : <><span className={styles.bannerNum}>{total}</span><span className={styles.bannerCountLabel}>мест</span></>
          }
        </div>
      </div>

      {/* ── ФИЛЬТР ПО ИНТЕРЕСАМ (только если выбран mood) ── */}
      {hasMoods && (
        <div className={styles.interestBar}>
          <div className={styles.interestChips}>
            {INTERESTS.map((item, i) => (
              <button
                key={i}
                className={`${styles.iChip} ${activeCategory === item.value ? styles.iChipActive : ''}`}
                onClick={() => handleCategoryFilter(item.value)}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.totalLabel}>{total} мест</span>

          {/* Кнопка фильтра локации */}
          <button
            className={`${styles.locationBtn} ${(city || country) ? styles.locationBtnActive : ''}`}
            onClick={() => setShowLocationFilter(v => !v)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {city || country || 'Все города'}
          </button>
        </div>

        <div className={styles.sorts}>
          {SORTS.map(s => (
            <button
              key={s.key}
              className={`${styles.sort} ${sortBy === s.key ? styles.sortActive : ''}`}
              onClick={() => handleSort(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LOCATION FILTER DROPDOWN ── */}
      {showLocationFilter && (
        <div className={styles.locationFilter}>
          <div className={styles.locationRow}>
            <input
              className={styles.locInput}
              placeholder="Страна (MD, RO…)"
              value={country}
              onChange={e => setCountry(e.target.value)}
            />
            <input
              className={styles.locInput}
              placeholder="Город"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            <button className={styles.locSearchBtn} onClick={handleLocationSearch}>
              Применить
            </button>
          </div>
          {(city || country) && (
            <button className={styles.locClear} onClick={() => { setCity(''); setCountry(''); }}>
              Сбросить
            </button>
          )}
        </div>
      )}

      {/* ── CONTENT ── */}
      {view === 'list' ? (
        <div className={styles.list}>
          {loading && places.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => <div key={i} className={styles.skeleton} />)
          }

          {places.map((place, i) => (
            <PlaceListCard
              key={place.placeId}
              place={place}
              index={i}
              onClick={() => navigate(`/places/${place.placeId}`)}
            />
          ))}

          {!loading && places.length === 0 && (
            <div className={styles.empty}>
              <span>🔍</span>
              <p>Ничего не найдено</p>
              <p>Попробуй изменить фильтры</p>
            </div>
          )}

          <div ref={loaderRef} className={styles.loaderTrigger}>
            {loading && places.length > 0 && (
              <div className={styles.loadingMore}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── MAP VIEW ── */
        <div className={styles.mapView}>
          <div className={styles.mapPlaceholder}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            <p>Карта</p>
            <span>Подключи MapLibre или Google Maps</span>
          </div>

          {/* Карточки внизу */}
          <div className={styles.mapCards}>
            {places.slice(0, 5).map(place => (
              <div key={place.placeId} className={styles.mapCard}
                onClick={() => navigate(`/places/${place.placeId}`)}>
                <div className={`${styles.mapCardThumb} ${THUMB_BG[place.category] ?? styles.thumbDefault}`}>
                  <span>{CATEGORY_META[place.category]?.emoji}</span>
                </div>
                <div className={styles.mapCardInfo}>
                  <div className={styles.mapCardName}>{place.name}</div>
                  <div className={styles.mapCardRating}>⭐ {place.averageRating.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Карточка в списке ──
function PlaceListCard({ place, index, onClick }) {
  const thumbnail = place.coverImageUrl ?? place.imageUrls?.[0]
  const meta = CATEGORY_META[place.category]

  return (
    <div className={styles.card} onClick={onClick} style={{ animationDelay: `${index * 0.04}s` }}>
      <div className={`${styles.cardThumb} ${THUMB_BG[place.category] ?? styles.thumbDefault}`}>
        {thumbnail
          ? <img src={thumbnail} alt={place.name} className={styles.thumbImg} />
          : <span className={styles.thumbEmoji}>{meta?.emoji ?? '📍'}</span>
        }
        {index === 0 && <span className={styles.topBadge}>ТОП</span>}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardType}>{getCategoryLabel(place.category)}</div>
        <div className={styles.cardName}>{place.name}</div>
        <div className={styles.cardLoc}>📍 {place.city}</div>
        {place.description && <div className={styles.cardDesc}>{place.description}</div>}
        <div className={styles.cardRating}>
          <span className={styles.stars}>{'★'.repeat(Math.round(place.averageRating))}{'☆'.repeat(5 - Math.round(place.averageRating))}</span>
          <span>{place.averageRating.toFixed(1)}</span>
          {place.reviewsCount > 0 && <span className={styles.reviewCount}>({place.reviewsCount})</span>}
        </div>
      </div>

      <button className={styles.saveBtn} onClick={e => e.stopPropagation()}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
      </button>
    </div>
  )
}

const THUMB_BG = {
  0: styles.thumbFood,
  1: styles.thumbAccommodation,
  2: styles.thumbCulture,
  3: styles.thumbNature,
  4: styles.thumbEntertainment,
  5: styles.thumbShopping,
}