import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { placeApi } from '../../entities/place/model/place.api'
import { getCategoryLabel } from '../../entities/place/model/place.helpers'
import { useSavePlace } from '../../features/save-place/useSavePlace'
import styles from './ResultsPage.module.css'

const MOOD_META = {
  WithCompany:  { label: 'С компанией' },
  Solo:         { label: 'Один' },
  WithFamily:   { label: 'С семьёй' },
  RomanticDate: { label: 'Вдвоём' },
  Special:      { label: 'Особенное' },
  Calm:         { label: 'Спокойно' },
  Active:       { label: 'Активно' },
  NightOut:     { label: 'Вечер' },
  Surprise:     { label: 'Удиви меня' },
}

const INTERESTS = [
  { value: null, label: 'Все' },
  { value: 0,    label: 'Еда' },
  { value: 3,    label: 'Природа' },
  { value: 2,    label: 'Культура' },
  { value: 4,    label: 'Развлечения' },
  { value: 1,    label: 'Жильё' },
  { value: 5,    label: 'Шопинг' },
]

const SORTS = [
  { key: 'newest',  label: 'Лучшее' },
  { key: 'rating',  label: '★ Рейтинг' },
  { key: 'popular', label: 'Популярное' },
  { key: 'saves',   label: 'Новые' },
]

export function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const moodsParam    = searchParams.get('moods')
  const moodParam     = searchParams.get('mood')
  const categoryParam = searchParams.get('category')
  const categoryTagId = searchParams.get('categoryTagId')
  const searchQ       = searchParams.get('search')

  const moods = moodsParam
    ? moodsParam.split(',').filter(Boolean)
    : moodParam ? [moodParam] : []

  const [places, setPlaces]       = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [sortBy, setSortBy]       = useState('newest')
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(true)
  const [view, setView]           = useState('list')
  const [activeCategory, setActiveCategory] = useState(
    categoryParam != null ? Number(categoryParam) : null
  )
  const [showLocationFilter, setShowLocationFilter] = useState(false)
  const [city, setCity]           = useState(searchParams.get('city') ?? '')
  const [country, setCountry]     = useState(searchParams.get('country') ?? '')

  const loaderRef = useRef(null)

  const fetchPlaces = useCallback(async (pageNum, sort, catOverride) => {
    setLoading(true)
    try {
      const cat = catOverride !== undefined ? catOverride : activeCategory
      const params = {
        pageNumber: pageNum,
        pageSize:   10,
        sortBy:     sort,
        ...(moods.length > 0 && { mood: moods[0] }),
        ...(cat != null      && { category: cat }),
        ...(categoryTagId    && { categoryTagId }),
        ...(city.trim()      && { city: city.trim() }),
        ...(country.trim()   && { countryCode: country.trim() }),
        ...(searchQ?.trim()   && { search: searchQ.trim() })
      }
      const res = await placeApi.getAll(params)
      if (pageNum === 1) setPlaces(res.items ?? [])
      else setPlaces(prev => [...prev, ...(res.items ?? [])])
      setTotal(res.totalCount ?? 0)
      setHasMore(res.hasNextPage ?? false)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, moods.join(','), categoryTagId, city, country, searchQ])

  useEffect(() => { setPage(1); fetchPlaces(1, sortBy) }, [sortBy])
  useEffect(() => { setPage(1); fetchPlaces(1, sortBy) }, [searchParams.toString()])

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        const next = page + 1
        setPage(next)
        fetchPlaces(next, sortBy)
      }
    }, { threshold: 0.1 })
    obs.observe(loaderRef.current)
    return () => obs.disconnect()
  }, [hasMore, loading, page, sortBy, fetchPlaces])

  const handleSort = (key) => { setSortBy(key); setPage(1); fetchPlaces(1, key) }

  const handleCategoryFilter = (value) => {
    const newCat = value === activeCategory ? null : value
    setActiveCategory(newCat)
    setPage(1)
    fetchPlaces(1, sortBy, newCat)
  }

  const handleLocationSearch = () => {
    setShowLocationFilter(false)
    setPage(1)
    fetchPlaces(1, sortBy)
  }

  // Banner title
  const bannerTitle = searchQ
    ? `«${searchQ}»`
    : moods.length > 0
    ? moods.map(m => MOOD_META[m]?.label ?? m).join(', ')
    : activeCategory != null
    ? getCategoryLabel(activeCategory)
    : 'Все места'

  return (
    <div className={styles.page}>

      {/* ── TOP BAR ── */}
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`} onClick={() => setView('list')}>
            <ListIcon /> Список
          </button>
          <button className={`${styles.viewBtn} ${view === 'map' ? styles.viewActive : ''}`} onClick={() => setView('map')}>
            <MapIcon /> Карта
          </button>
        </div>
      </div>

      {/* ── BANNER ── */}
      <div className={styles.banner}>
        <div>
          <div className={styles.bannerEyebrow}>
            {searchQ ? 'Поиск' : moods.length > 0 ? 'Настроение' : 'Места'}
          </div>
          <div className={styles.bannerTitle}>{bannerTitle}</div>
          {moods.length > 1 && (
            <div className={styles.moodTags}>
              {moods.map(m => (
                <span key={m} className={styles.moodTag}>
                  {MOOD_META[m]?.label ?? m}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.bannerCount}>
          {loading && places.length === 0
            ? <span className={styles.bannerNumSkeleton} />
            : <span className={styles.bannerNum}>{total}</span>
          }
          <span className={styles.bannerCountLabel}>мест</span>
        </div>
      </div>

      {/* ── INTEREST FILTER BAR ── */}
      <div className={styles.interestBar}>
        <div className={styles.interestChips}>
          {INTERESTS.map((item, i) => (
            <button
              key={i}
              className={`${styles.iChip} ${activeCategory === item.value ? styles.iChipActive : ''}`}
              onClick={() => handleCategoryFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.totalLabel}>{total} мест</span>
          <button
            className={`${styles.locationBtn} ${(city || country) ? styles.locationBtnActive : ''}`}
            onClick={() => setShowLocationFilter(v => !v)}
          >
            <PinIcon />
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

      {/* ── LOCATION FILTER ── */}
      {showLocationFilter && (
        <div className={styles.locationFilter}>
          <div className={styles.locationRow}>
            <input className={styles.locInput} placeholder="Страна (MD, RO…)" value={country} onChange={e => setCountry(e.target.value)} />
            <input className={styles.locInput} placeholder="Город" value={city} onChange={e => setCity(e.target.value)} />
            <button className={styles.locSearchBtn} onClick={handleLocationSearch}>Применить</button>
          </div>
          {(city || country) && (
            <button className={styles.locClear} onClick={() => { setCity(''); setCountry('') }}>Сбросить</button>
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
                <div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.mapView}>
          <div className={styles.mapPlaceholder}>
            <MapBigIcon />
            <p>Карта</p>
            <span>Подключи MapLibre или Google Maps</span>
          </div>
          <div className={styles.mapCards}>
            {places.slice(0, 6).map(place => (
              <div key={place.placeId} className={styles.mapCard} onClick={() => navigate(`/places/${place.placeId}`)}>
                <div className={styles.mapCardThumb}>
                  {(place.coverImageUrl ?? place.imageUrls?.[0])
                    ? <img src={place.coverImageUrl ?? place.imageUrls?.[0]} alt={place.name} />
                    : null
                  }
                </div>
                <div className={styles.mapCardInfo}>
                  <div className={styles.mapCardName}>{place.name}</div>
                  <div className={styles.mapCardRating}>★ {place.averageRating.toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Карточка списка ──
function PlaceListCard({ place, index, onClick }) {
  const { isSaved: saved, toggle } = useSavePlace(place.placeId)
  const thumbnail = place.coverImageUrl ?? place.imageUrls?.[0]

  return (
    <div className={styles.card} onClick={onClick} style={{ animationDelay: `${index * 0.04}s` }}>
      <div className={styles.cardThumb}>
        {thumbnail
          ? <img src={thumbnail} alt={place.name} className={styles.thumbImg} />
          : <div className={styles.thumbPlaceholder} />
        }
        {index === 0 && <span className={styles.topBadge}>ТОП</span>}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardName}>{place.name}</div>
        <div className={styles.cardLoc}>{[place.city, place.country].filter(Boolean).join(' • ')}</div>
        {place.description && <div className={styles.cardDesc}>{place.description}</div>}
        {place.averageRating > 0 && (
          <div className={styles.cardRating}>
            <span className={styles.stars}>{'★'.repeat(Math.round(place.averageRating))}</span>
            <span>{place.averageRating.toFixed(1)}</span>
            {place.reviewsCount > 0 && <span className={styles.reviewCount}>({place.reviewsCount})</span>}
          </div>
        )}
      </div>

      <button
        className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
        onClick={e => { e.stopPropagation(); toggle(e) }}
        aria-label="Сохранить"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" fill={saved ? 'currentColor' : 'none'} />
        </svg>
      </button>
    </div>
  )
}

function ListIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function MapIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> }
function PinIcon()  { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function MapBigIcon(){ return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".4"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> }