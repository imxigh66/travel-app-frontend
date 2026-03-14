import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { placeApi } from '../../entities/place/model/place.api'
import SuggestPlaceModal from '../../features/suggest-place/ui/SuggestPlaceModal'
import styles from './MyPlacesPage.module.css'

const STATUS_CONFIG = {
  0: { label: 'На проверке', className: 'pending',  },
  1: { label: 'Одобрено',    className: 'approved', },
  2: { label: 'Отклонено',   className: 'rejected', },
}

const STATUS_MAP = { Pending: 0, Approved: 1, Rejected: 2 }

function getStatusKey(status) {
  if (typeof status === 'number') return status
  return STATUS_MAP[status] ?? 0
}

export default function MyPlacesPage() {
  const navigate = useNavigate()
  const [allPlaces, setAllPlaces]   = useState([])   // все с сервера
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)

  // ── Фильтры (клиентские) ──
  const [statusFilter, setStatusFilter] = useState('all')   // 'all' | 0 | 1 | 2
  const [dateSort, setDateSort]         = useState('newest') // 'newest' | 'oldest'

  const fetchPlaces = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Грузим все сразу (pageSize=100), фильтруем на клиенте
      const data = await placeApi.getMy(1, 100)
      setAllPlaces(data.items)
    } catch {
      setError('Не удалось загрузить места')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlaces() }, [fetchPlaces])

  // ── Подсчёт по статусам ──
  const counts = useMemo(() => ({
    all:  allPlaces.length,
    0:    allPlaces.filter(p => getStatusKey(p.status) === 0).length,
    1:    allPlaces.filter(p => getStatusKey(p.status) === 1).length,
    2:    allPlaces.filter(p => getStatusKey(p.status) === 2).length,
  }), [allPlaces])

  // ── Применяем фильтр + сортировку ──
  const filtered = useMemo(() => {
    let result = [...allPlaces]

    if (statusFilter !== 'all') {
      result = result.filter(p => getStatusKey(p.status) === Number(statusFilter))
    }

    result.sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt)
      return dateSort === 'newest' ? -diff : diff
    })

    return result
  }, [allPlaces, statusFilter, dateSort])

  const STATUS_FILTERS = [
    { key: 'all', label: 'Все',          count: counts.all },
    { key: '1',   label: 'Одобрено',     count: counts[1], className: 'approved' },
    { key: '0',   label: 'На проверке',  count: counts[0], className: 'pending' },
    { key: '2',   label: 'Отклонено',    count: counts[2], className: 'rejected' },
  ]

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <PinIcon /> Мои места
          </h1>
          <p className={styles.subtitle}>Места, которые вы предложили</p>
        </div>
        <button className={styles.addBtn} onClick={() => setIsSuggestOpen(true)}>
          <PlusIcon /> Предложить место
        </button>
      </div>

      {/* ── Toolbar: статус + дата ── */}
      {!loading && allPlaces.length > 0 && (
        <div className={styles.toolbar}>

          {/* Фильтр по статусу */}
          <div className={styles.statusFilters}>
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${statusFilter === f.key ? styles.filterBtnActive : ''} ${f.className ? styles[f.className + 'Filter'] : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
                <span className={styles.filterCount}>{f.count}</span>
              </button>
            ))}
          </div>

          {/* Сортировка по дате */}
          <div className={styles.sortBtns}>
            <button
              className={`${styles.sortBtn} ${dateSort === 'newest' ? styles.sortBtnActive : ''}`}
              onClick={() => setDateSort('newest')}
              title="Сначала новые"
            >
              <SortDescIcon /> Новые
            </button>
            <button
              className={`${styles.sortBtn} ${dateSort === 'oldest' ? styles.sortBtnActive : ''}`}
              onClick={() => setDateSort('oldest')}
              title="Сначала старые"
            >
              <SortAscIcon /> Старые
            </button>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className={styles.empty}>
          <AlertIcon />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchPlaces}>
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && allPlaces.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIconWrap}><PinIcon /></div>
          <h2 className={styles.emptyTitle}>Вы ещё не предложили мест</h2>
          <p className={styles.emptyText}>
            Знаете интересное место? Добавьте его — после проверки оно появится в каталоге
          </p>
          <button className={styles.addBtn} onClick={() => setIsSuggestOpen(true)}>
            <PlusIcon /> Предложить место
          </button>
        </div>
      )}

      {!loading && !error && allPlaces.length > 0 && filtered.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIconWrap}><FilterIcon /></div>
          <h2 className={styles.emptyTitle}>Ничего не найдено</h2>
          <p className={styles.emptyText}>Нет мест с выбранным статусом</p>
          <button className={styles.retryBtn} onClick={() => setStatusFilter('all')}>
            Сбросить фильтр
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map(place => (
            <MyPlaceCard
              key={place.placeId}
              place={place}
              onClick={() => navigate(`/places/${place.placeId}`)}
            />
          ))}
        </div>
      )}

      <SuggestPlaceModal
        isOpen={isSuggestOpen}
        onClose={() => {
          setIsSuggestOpen(false)
          fetchPlaces()
        }}
      />
    </div>
  )
}

// ── MyPlaceCard ───────────────────────────────────────────────────────────────
function MyPlaceCard({ place, onClick }) {
  const statusKey = getStatusKey(place.status)
  const status    = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG[0]
  const thumb     = place.coverImageUrl ?? place.imageUrls?.[0]

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardThumb}>
        {thumb
          ? <img src={thumb} alt={place.name} className={styles.thumbImg} />
          : <div className={styles.thumbPlaceholder}><PinIcon /></div>
        }
        <span className={`${styles.statusBadge} ${styles[status.className]}`}>
          {statusKey === 0 && <ClockIcon />}
          {statusKey === 1 && <CheckIcon />}
          {statusKey === 2 && <XIcon />}
          {status.label}
        </span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardName}>{place.name}</div>
        <div className={styles.cardLoc}>
          <PinIcon /> {[place.city, place.countryCode?.toUpperCase()].filter(Boolean).join(', ')}
        </div>

        {statusKey === 2 && place.rejectionReason && (
          <div className={styles.rejectionReason}>
            <span className={styles.rejectionLabel}>Причина:</span> {place.rejectionReason}
          </div>
        )}

        <div className={styles.cardMeta}>
          <CalendarIcon />
          {new Date(place.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </div>
      </div>
    </div>
  )
}

// ── Icons (svg, как в сайдбаре) ───────────────────────────────────────────────
function PinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function ClockIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CheckIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function XIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function CalendarIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function SortDescIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
}
function SortAscIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
}
function FilterIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
}
function AlertIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}