import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripApi } from '../../entities/trip/api/tripApi'
import { placeApi } from '../../entities/place/model/place.api'
import styles from './TripOverview.module.css'

const CATEGORIES = [
  { value: null,            label: 'Все' },
  { value: 'Food',          label: '🍜 Еда' },
  { value: 'Culture',       label: '🏛️ Культура' },
  { value: 'Nature',        label: '🌿 Природа' },
  { value: 'Entertainment', label: '🎭 Развлечения' },
  { value: 'Accommodation', label: '🏨 Жильё' },
  { value: 'Shopping',      label: '🛍️ Шопинг' },
]

export function TripOverview({ trip, isOwner, onPlacesChange }) {
  const navigate = useNavigate()
  const places       = trip.places ?? []
  const destinations = trip.destinations ?? []

  // ── Фильтры ──
  const [cityFilter,     setCityFilter]     = useState(null)  // null = все
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [searchResults,  setSearchResults]  = useState([])
  const [searching,      setSearching]      = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [addingPlace,    setAddingPlace]    = useState(null)  // placeId

  // Текущий город для поиска
  const activeCityName = cityFilter
    ? destinations.find(d => d.id === cityFilter)?.city
    : (destinations.length > 0 ? destinations.map(d => d.city).join(',') : trip.city)

  // Загружаем рекомендации при смене города
  useEffect(() => {
    const city = cityFilter
      ? destinations.find(d => d.id === cityFilter)?.city
      : trip.city

    if (!city) return
    placeApi.getAll({ city, pageSize: 4, sortBy: 'rating' })
      .then(data => {
        const existingIds = new Set(places.map(p => p.placeId))
        setRecommendations((data.items ?? []).filter(p => !existingIds.has(p.placeId)))
      })
      .catch(() => {})
  }, [cityFilter, trip.city, places.length])

  // Поиск с дебаунсом — срабатывает при изменении запроса ИЛИ категории
  useEffect(() => {
    const hasQuery   = searchQuery.trim().length > 0
    const hasCat     = categoryFilter !== null

    // Показываем результаты если есть хоть что-то
    if (!hasQuery && !hasCat) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        // Берём город активного фильтра или первый город поездки
        const city = cityFilter
          ? destinations.find(d => d.id === cityFilter)?.city
          : (destinations.length > 0 ? destinations[0].city : trip.city)

        const params = {
          pageSize: 8,
          sortBy: 'rating',
        }
        if (hasQuery)  params.search   = searchQuery.trim()
        if (hasCat)    params.category = categoryFilter
        if (city)      params.city     = city

        const data = await placeApi.getAll(params)
        setSearchResults(data.items ?? [])
      } catch (e) {
        console.error('search error', e)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, cityFilter, categoryFilter, destinations, trip.city])

  const handleRemove = async (placeId) => {
    if (!confirm('Убрать место из поездки?')) return
    try {
      await tripApi.removePlace(trip.tripId, placeId)
      onPlacesChange(places.filter(p => p.placeId !== placeId))
    } catch { alert('Не удалось удалить место') }
  }

  const handleAddPlace = async (placeId) => {
    setAddingPlace(placeId)
    try {
      const added = await tripApi.addPlace(trip.tripId, { placeId })
      onPlacesChange([...places, added])
      setSearchResults(prev => prev.filter(p => p.placeId !== placeId))
      setRecommendations(prev => prev.filter(p => p.placeId !== placeId))
    } catch (e) {
      const msg = e?.response?.data?.error ?? ''
      if (!msg.toLowerCase().includes('already')) alert('Не удалось добавить')
    } finally { setAddingPlace(null) }
  }

  // Фильтруем список мест поездки по выбранному городу
  const filteredPlaces = cityFilter
    ? places.filter(p => p.destinationId === cityFilter)
    : places

  const existingIds = new Set(places.map(p => p.placeId))

  return (
    <div className={styles.overviewLayout}>

      {/* ── ЛЕВАЯ КОЛОНКА — места поездки ── */}
      <div className={styles.leftCol}>

        {/* Фильтр по городам */}
        {destinations.length > 1 && (
          <div className={styles.cityChips}>
            <button
              className={`${styles.cityChip} ${!cityFilter ? styles.cityChipActive : ''}`}
              onClick={() => setCityFilter(null)}
            >
              Все города
            </button>
            {destinations.map(d => (
              <button
                key={d.id}
                className={`${styles.cityChip} ${cityFilter === d.id ? styles.cityChipActive : ''}`}
                onClick={() => setCityFilter(cityFilter === d.id ? null : d.id)}
              >
                {d.city}
              </button>
            ))}
          </div>
        )}

        {/* Список мест */}
        {filteredPlaces.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📍</span>
            <h3 className={styles.emptyTitle}>Мест пока нет</h3>
            <p className={styles.emptyText}>
              {isOwner ? 'Найдите места справа и добавьте в маршрут' : 'Автор ещё не добавил места'}
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredPlaces.map((place, idx) => (
              <div key={place.placeId} className={styles.placeItem}>
                <div className={styles.indexBadge}>{idx + 1}</div>
                <div className={styles.cover} onClick={() => navigate(`/places/${place.placeId}`)}>
                  {place.coverImageUrl
                    ? <img src={place.coverImageUrl} alt={place.name} className={styles.coverImg} />
                    : <div className={styles.coverFallback}><PinIcon /></div>
                  }
                </div>
                <div className={styles.info} onClick={() => navigate(`/places/${place.placeId}`)}>
                  <div className={styles.placeName}>{place.name}</div>
                  <div className={styles.placeAddress}>
                    {place.address && `${place.address}, `}{place.city}
                  </div>
                  {place.notes && <div className={styles.placeNotes}>{place.notes}</div>}
                </div>
                {isOwner && (
                  <button className={styles.removeBtn} onClick={() => handleRemove(place.placeId)}>
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ПРАВАЯ КОЛОНКА — поиск и рекомендации ── */}
      <div className={styles.rightCol}>

        {/* Поиск */}
        <div className={styles.searchCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                className={styles.searchInput}
                placeholder={`Искать в ${activeCityName || 'городе'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>×</button>
              )}
            </div>
          </div>

          {/* Категории */}
          <div className={styles.catChips}>
            {CATEGORIES.map(c => (
              <button
                key={String(c.value)}
                className={`${styles.catChip} ${categoryFilter === c.value ? styles.catChipActive : ''}`}
                onClick={() => setCategoryFilter(categoryFilter === c.value ? null : c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Результаты поиска */}
        {(searchQuery || categoryFilter) && (
          <div className={styles.resultsCard}>
            <div className={styles.cardTitle}>
              {searching
                ? 'Поиск...'
                : `Найдено ${searchResults.length} мест`
              }
            </div>
            {searchResults.length === 0 && !searching && (
              <div className={styles.noResults}>Ничего не найдено — попробуйте другой запрос</div>
            )}
            {searchResults.map(p => (
              <PlaceRow
                key={p.placeId}
                place={p}
                isAdded={existingIds.has(p.placeId)}
                loading={addingPlace === p.placeId}
                isOwner={isOwner}
                onAdd={() => handleAddPlace(p.placeId)}
                onOpen={() => navigate(`/places/${p.placeId}`)}
              />
            ))}
          </div>
        )}

        {/* Рекомендации */}
        {!searchQuery && recommendations.length > 0 && (
          <div className={styles.resultsCard}>
            <div className={styles.cardTitle}>
              Рекомендации {cityFilter ? `· ${destinations.find(d=>d.id===cityFilter)?.city}` : ''}
            </div>
            {recommendations.slice(0, 4).map(p => (
              <PlaceRow
                key={p.placeId}
                place={p}
                isAdded={existingIds.has(p.placeId)}
                loading={addingPlace === p.placeId}
                isOwner={isOwner}
                onAdd={() => handleAddPlace(p.placeId)}
                onOpen={() => navigate(`/places/${p.placeId}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ── PlaceRow ─────────────────────────────────────────────────────────────────
function PlaceRow({ place, isAdded, loading, isOwner, onAdd, onOpen }) {
  return (
    <div className={styles.placeRow}>
      <div className={styles.placeRowThumb} onClick={onOpen}>
        {place.coverImageUrl
          ? <img src={place.coverImageUrl} alt={place.name} />
          : <div className={styles.placeRowThumbFallback}><PinIcon /></div>
        }
      </div>
      <div className={styles.placeRowInfo} onClick={onOpen}>
        <div className={styles.placeRowName}>{place.name}</div>
        <div className={styles.placeRowMeta}>{place.city}</div>
        {place.averageRating > 0 && (
          <div className={styles.placeRowRating}>★ {place.averageRating.toFixed(1)}</div>
        )}
      </div>
      {isOwner && (
        <button
          className={`${styles.addBtn} ${isAdded ? styles.addBtnDone : ''}`}
          onClick={!isAdded ? onAdd : undefined}
          disabled={loading || isAdded}
        >
          {loading ? <SpinIcon /> : isAdded ? <CheckIcon /> : <PlusIcon />}
        </button>
      )}
    </div>
  )
}

// Icons
function PinIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function TrashIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg> }
function SearchIcon(){ return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function PlusIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function CheckIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> }
function SpinIcon()  { return <span className={styles.spin} /> }