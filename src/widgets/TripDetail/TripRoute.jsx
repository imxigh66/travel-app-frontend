import { useState, useCallback } from 'react'
import { tripApi } from '../../entities/trip/api/tripApi'
import { TripRouteMap } from './TripRouteMap'
import styles from './TripRoute.module.css'

export function TripRoute({ places, destinations = [], isOwner, tripId, onPlacesChange }) {
  const [reordering, setReordering]     = useState(false)
  const [localPlaces, setLocalPlaces]   = useState(
    [...places].sort((a, b) => a.sortOrder - b.sortOrder)
  )
  const [assigningDay, setAssigningDay] = useState(null)  // placeId которому назначаем

  const moveUp = (idx) => {
    if (idx === 0) return
    const updated = [...localPlaces]
    ;[updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]]
    setLocalPlaces(updated)
  }

  const moveDown = (idx) => {
    if (idx === localPlaces.length - 1) return
    const updated = [...localPlaces]
    ;[updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]]
    setLocalPlaces(updated)
  }

  const saveOrder = async () => {
    setReordering(true)
    try {
      const payload = localPlaces.map((p, idx) => ({
        placeId: p.placeId,
        sortOrder: idx + 1,
      }))
      await tripApi.reorderPlaces(tripId, payload)
      const updated = localPlaces.map((p, idx) => ({ ...p, sortOrder: idx + 1 }))
      onPlacesChange(updated)
    } catch {
      alert('Не удалось сохранить порядок')
    } finally {
      setReordering(false)
    }
  }

  const handleSetDay = async (placeId, dayNumber, destinationId) => {
    setAssigningDay(placeId)
    try {
      await tripApi.setPlaceDay(tripId, placeId, { dayNumber, destinationId })
      setLocalPlaces(prev =>
        prev.map(p => p.placeId === placeId
          ? { ...p, dayNumber, destinationId }
          : p
        )
      )
    } catch {
      alert('Не удалось назначить день')
    } finally {
      setAssigningDay(null)
    }
  }

  if (localPlaces.length === 0) {
    return (
      <div className={styles.empty}>
        <span>🗺️</span>
        <p>Добавьте места во вкладке «Обзор», чтобы составить маршрут</p>
      </div>
    )
  }

  const hasMultiDestinations = destinations.length > 1
  const hasAnyDays = localPlaces.some(p => p.dayNumber)

  // Доступные дни для фильтра
  const availableDays = [...new Set(localPlaces.map(p => p.dayNumber).filter(Boolean))].sort((a,b) => a-b)

  // Фильтрация по дню (0 = без дня)
  const [dayFilter, setDayFilter] = useState(null)
  const filteredPlaces = dayFilter === null
    ? localPlaces
    : dayFilter === 0
      ? localPlaces.filter(p => !p.dayNumber)
      : localPlaces.filter(p => p.dayNumber === dayFilter)

  // Группируем отфильтрованные места
  const grouped = buildGroups(filteredPlaces, destinations)

  return (
    <div className={styles.wrapper}>

      {/* Карта — всегда показываем все места */}
      <TripRouteMap places={localPlaces} />

      {/* Топ-панель */}
      <div className={styles.topRow}>
        <p className={styles.hint}>
          {isOwner
            ? 'Используйте стрелки для изменения порядка'
            : 'Порядок посещения мест'}
        </p>
        {isOwner && (
          <button className={styles.saveBtn} onClick={saveOrder} disabled={reordering}>
            {reordering ? 'Сохранение...' : 'Сохранить порядок'}
          </button>
        )}
      </div>

      {/* Фильтр по дням — показываем только если есть назначенные дни */}
      {availableDays.length > 0 && (
        <div className={styles.dayFilters}>
          <button
            className={`${styles.dayFilterChip} ${dayFilter === null ? styles.dayFilterActive : ''}`}
            onClick={() => setDayFilter(null)}
          >
            Все дни
          </button>
          {availableDays.map(day => (
            <button
              key={day}
              className={`${styles.dayFilterChip} ${dayFilter === day ? styles.dayFilterActive : ''}`}
              onClick={() => setDayFilter(dayFilter === day ? null : day)}
            >
              День {day}
              <span className={styles.dayFilterCount}>
                {localPlaces.filter(p => p.dayNumber === day).length}
              </span>
            </button>
          ))}
          {localPlaces.some(p => !p.dayNumber) && (
            <button
              className={`${styles.dayFilterChip} ${dayFilter === 0 ? styles.dayFilterActive : ''}`}
              onClick={() => setDayFilter(dayFilter === 0 ? null : 0)}
            >
              Без дня
            </button>
          )}
        </div>
      )}

      {/* Маршрут с группировкой */}
      {grouped.map((group, gi) => (
        <div key={gi} className={styles.group}>

          {/* Заголовок группы (город или день) */}
          {group.label && (
            <div className={styles.groupHeader}>
              <div className={styles.groupDot} style={{ background: group.color }} />
              <span className={styles.groupLabel}>{group.label}</span>
              {group.dates && <span className={styles.groupDates}>{group.dates}</span>}
              <span className={styles.groupCount}>{group.places.length} мест</span>
            </div>
          )}

          <div className={styles.list}>
            {group.places.map((place, idx) => {
              const globalIdx = localPlaces.indexOf(place)
              return (
                <div key={place.placeId} className={styles.item}>

                  {/* Порядок + стрелки */}
                  <div className={styles.orderCol}>
                    {isOwner && (
                      <button
                        className={styles.arrowBtn}
                        onClick={() => moveUp(globalIdx)}
                        disabled={globalIdx === 0}
                      >▲</button>
                    )}
                    <div className={styles.orderNum}>{globalIdx + 1}</div>
                    {isOwner && (
                      <button
                        className={styles.arrowBtn}
                        onClick={() => moveDown(globalIdx)}
                        disabled={globalIdx === localPlaces.length - 1}
                      >▼</button>
                    )}
                  </div>

                  {/* Коннектор */}
                  {idx < group.places.length - 1 && (
                    <div className={styles.connector} />
                  )}

                  {/* Обложка */}
                  <div className={styles.cover}>
                    {place.coverImageUrl
                      ? <img src={place.coverImageUrl} alt={place.name} className={styles.coverImg} />
                      : <div className={styles.coverFallback}>
                          <PinIcon />
                        </div>
                    }
                  </div>

                  {/* Инфо */}
                  <div className={styles.info}>
                    <h4 className={styles.name}>{place.name}</h4>
                    <p className={styles.address}>
                      {place.address && `${place.address}, `}{place.city}
                    </p>
                    {place.notes && <p className={styles.notes}>{place.notes}</p>}
                  </div>

                  {/* Назначить день */}
                  {isOwner && (
                    <DayPicker
                      place={place}
                      destinations={destinations}
                      loading={assigningDay === place.placeId}
                      onChange={(dayNumber, destinationId) =>
                        handleSetDay(place.placeId, dayNumber, destinationId)
                      }
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── DayPicker ────────────────────────────────────────────────────────────────
function DayPicker({ place, destinations, loading, onChange }) {
  const [open, setOpen] = useState(false)
  const hasLabel = place.dayNumber || place.destinationId

  const label = (() => {
    if (place.destinationId && destinations.length > 0) {
      const dest = destinations.find(d => d.id === place.destinationId)
      const day  = place.dayNumber ? `День ${place.dayNumber}` : ''
      return dest ? `${dest.city}${day ? ` · ${day}` : ''}` : day || null
    }
    if (place.dayNumber) return `День ${place.dayNumber}`
    return null
  })()

  return (
    <div className={styles.dayPickerWrap}>
      {label && (
        <span className={styles.dayBadge}>{label}</span>
      )}
      <button
        className={`${styles.dayBtn} ${open ? styles.dayBtnOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        disabled={loading}
        title="Назначить день"
      >
        {loading ? <SpinIcon /> : <CalIcon />}
      </button>

      {open && (
        <div className={styles.dayDropdown}>
          <div className={styles.dayDropTitle}>Назначить день</div>

          {destinations.length > 0 && (
            <>
              <div className={styles.dayDropSection}>Город</div>
              {destinations.map(d => (
                <button
                  key={d.id}
                  className={`${styles.dayDropItem} ${place.destinationId === d.id ? styles.dayDropActive : ''}`}
                  onClick={() => {
                    onChange(place.dayNumber ?? null, d.id)
                    setOpen(false)
                  }}
                >
                  {d.city}, {d.countryCode}
                  {d.dateFrom && <span className={styles.dayDropSub}>{formatDate(d.dateFrom)}</span>}
                </button>
              ))}
            </>
          )}

          <div className={styles.dayDropSection}>День</div>
          <div className={styles.dayDropDays}>
            {[null,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button
                key={n ?? 'none'}
                className={`${styles.dayDot} ${place.dayNumber === n ? styles.dayDotActive : ''}`}
                onClick={() => {
                  onChange(n, place.destinationId ?? null)
                  setOpen(false)
                }}
              >
                {n ?? '—'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function buildGroups(places, destinations) {
  if (destinations.length > 1) {
    // Группировка по городам
    const groups = destinations.map(d => ({
      label:  `${d.city}, ${d.countryCode}`,
      color:  DEST_COLORS[d.sortOrder % DEST_COLORS.length],
      dates:  d.dateFrom ? `${formatDate(d.dateFrom)}${d.dateTo ? ` — ${formatDate(d.dateTo)}` : ''}` : null,
      places: places.filter(p => p.destinationId === d.id),
    }))

    // Места без города — отдельная группа
    const unassigned = places.filter(p => !p.destinationId)
    if (unassigned.length > 0) {
      groups.push({ label: 'Без города', color: '#B5ADA8', dates: null, places: unassigned })
    }

    return groups.filter(g => g.places.length > 0)
  }

  // Если нет мульти-городов — группировка по дням
  const days = [...new Set(places.map(p => p.dayNumber).filter(Boolean))].sort((a,b) => a-b)
  if (days.length === 0) {
    return [{ label: null, color: null, dates: null, places }]
  }

  const groups = days.map(day => ({
    label:  `День ${day}`,
    color:  DEST_COLORS[day % DEST_COLORS.length],
    dates:  null,
    places: places.filter(p => p.dayNumber === day),
  }))

  const unassigned = places.filter(p => !p.dayNumber)
  if (unassigned.length > 0) {
    groups.push({ label: 'Без дня', color: '#B5ADA8', dates: null, places: unassigned })
  }

  return groups.filter(g => g.places.length > 0)
}

function formatDate(d) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const DEST_COLORS = ['#FDB3A4','#B8CEC2','#a78bfa','#f59e0b','#3b82f6','#ec4899']

function PinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function CalIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function SpinIcon() {
  return <span className={styles.spin} />
}