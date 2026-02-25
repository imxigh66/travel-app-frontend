import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { followApi } from '../../entities/follow/model/follow.api'
import { UserFollowCard } from '../../entities/follow/ui/UserFollowCard'
import styles from './FollowingPage.module.css'

export function FollowingPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [following, setFollowing]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchFollowing = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const data = await followApi.getFollowing(id, page, 20)
      setFollowing(data.items)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
      setPageNumber(data.pageNumber)
    } catch {
      setError('Не удалось загрузить подписки')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchFollowing(1)
  }, [fetchFollowing])

  const handlePage = (page) => {
    fetchFollowing(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Назад
        </button>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Подписки</h1>
        {totalCount > 0 && (
          <span className={styles.badge}>{totalCount}</span>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading && (
          <div className={styles.skeletonList}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className={styles.empty}>
            <span>⚠️</span>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={() => fetchFollowing(pageNumber)}>
              Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && following.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <h2>Подписок пока нет</h2>
            <p>Подписывайтесь на интересных людей, чтобы следить за их путешествиями</p>
          </div>
        )}

        {!loading && !error && following.length > 0 && (
          <>
            <div className={styles.list}>
              {following.map(user => (
                <UserFollowCard key={user.userId} user={user} />
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
    </div>
  )
}