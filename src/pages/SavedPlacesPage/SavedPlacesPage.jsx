import { useState, useEffect, useCallback } from 'react'
import { placeApi } from '../../entities/place/model/place.api'
import { PlaceCard } from '../../entities/place/ui/PlaceCard'
import styles from './SavedPlacesPage.module.css'

export function SavedPlacesPage() {
  const [places, setPlaces]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchSaved = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const data = await placeApi.getSaved(page, 12)
      setPlaces(data.items)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
      setPageNumber(data.pageNumber)
    } catch {
      setError('Не удалось загрузить сохранённые места')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSaved(1) }, [fetchSaved])

  const handlePage = (page) => {
    fetchSaved(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUnsave = (placeId) => {
    setPlaces(prev => prev.filter(p => p.placeId !== placeId))
    setTotalCount(prev => prev - 1)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </span>
            Сохранённые места
          </h1>
          {totalCount > 0 && (
            <span className={styles.badge}>{totalCount}</span>
          )}
        </div>
        <p className={styles.subtitle}>Места, которые вы хотите посетить</p>
      </div>

      {/* Content */}
      {loading && (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-light)" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={() => fetchSaved(pageNumber)}>
            Попробовать снова
          </button>
        </div>
      )}

      {!loading && !error && places.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="var(--mint-dark)" strokeWidth="1.2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </span>
          <h2 className={styles.emptyTitle}>Пока ничего нет</h2>
          <p className={styles.emptyText}>
            Сохраняйте понравившиеся места, чтобы вернуться к ним позже
          </p>
        </div>
      )}

      {!loading && !error && places.length > 0 && (
        <>
          <div className={styles.grid}>
            {places.map(place => (
              <PlaceCard
                key={place.placeId}
                place={place}
                variant="grid"
                onUnsave={handleUnsave}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                onClick={() => handlePage(pageNumber - 1)}
                disabled={pageNumber === 1}
              >←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`${styles.pageBtn} ${page === pageNumber ? styles.pageBtnActive : ''}`}
                  onClick={() => handlePage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => handlePage(pageNumber + 1)}
                disabled={pageNumber === totalPages}
              >→</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SavedPlacesPage