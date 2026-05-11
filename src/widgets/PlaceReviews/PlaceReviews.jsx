import { useState, useEffect, useCallback } from 'react'
import { reviewApi } from '../../entities/review/api/reviewApi'
import { formatDistanceToNow } from '../../shared/utils/dateUtils'
import styles from './PlaceReviews.module.css'

const PAGE_SIZE = 8

function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0)
  return (
    <div className={styles.starPicker}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.starBtn} ${(hover || value) >= n ? styles.starBtnFilled : ''}`}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
        >★</button>
      ))}
    </div>
  )
}

function ReviewCard({ review, canDelete, onDelete }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try { await onDelete(review.reviewId) }
    finally { setDeleting(false) }
  }

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewUser}>
          {review.userProfilePicture
            ? <img src={review.userProfilePicture} alt={review.username} className={styles.avatar} />
            : <div className={styles.avatarFallback}>{review.username?.slice(0, 2).toUpperCase()}</div>
          }
          <div className={styles.reviewMeta}>
            <span className={styles.reviewUsername}>{review.username}</span>
            <span className={styles.reviewDate}>{formatDistanceToNow(review.createdAt)}</span>
          </div>
        </div>
        <div className={styles.reviewRight}>
          <div className={styles.reviewStars}>
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          {canDelete && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={deleting}
              title="Удалить отзыв"
            >
              {deleting ? '…' : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      {review.comment && <p className={styles.reviewText}>{review.comment}</p>}
    </div>
  )
}

export function PlaceReviews({ placeId, currentUser }) {
  const [reviews, setReviews]       = useState([])
  const [total, setTotal]           = useState(0)
  const [avgRating, setAvgRating]   = useState(0)
  const [page, setPage]             = useState(1)
  const [hasMore, setHasMore]       = useState(false)
  const [loading, setLoading]       = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [rating, setRating]     = useState(0)
  const [comment, setComment]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')

  const myReview = currentUser
    ? reviews.find(r => r.userId === currentUser.userId)
    : null

  const loadReviews = useCallback(async (p = 1, append = false) => {
    try {
      const raw = await reviewApi.getReviews(placeId, p, PAGE_SIZE)
      // Handle: array | { items, totalCount } | { reviews, total } | { data: [...] }
      let list, tot, avg
      if (Array.isArray(raw)) {
        list = raw
        tot  = raw.length
        avg  = 0
      } else {
        list = raw?.items ?? raw?.reviews ?? raw?.data ?? []
        tot  = raw?.totalCount ?? raw?.total ?? list.length
        avg  = raw?.averageRating ?? 0
      }
      setReviews(prev => append ? [...prev, ...list] : list)
      setTotal(tot)
      setAvgRating(avg)
      setHasMore(p * PAGE_SIZE < tot)
      setPage(p)
    } catch (e) {
      console.error('Reviews load error:', e)
    }
  }, [placeId])

  useEffect(() => {
    setLoading(true)
    loadReviews(1).finally(() => setLoading(false))
  }, [loadReviews])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await loadReviews(page + 1, true)
    setLoadingMore(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setFormError('Поставьте оценку'); return }
    setSubmitting(true)
    setFormError('')
    try {
      const created = await reviewApi.createReview(placeId, { rating, comment: comment.trim() || undefined })
      setReviews(prev => [created, ...prev])
      setTotal(t => t + 1)
      setRating(0)
      setComment('')
    } catch {
      setFormError('Не удалось отправить отзыв')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    await reviewApi.deleteReview(placeId, reviewId)
    setReviews(prev => prev.filter(r => r.reviewId !== reviewId))
    setTotal(t => Math.max(0, t - 1))
  }

  return (
    <div className={styles.section}>
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>Отзывы</div>
        {total > 0 && (
          <div className={styles.ratingSummary}>
            <span className={styles.avgStars}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
            <span className={styles.avgNum}>{avgRating.toFixed(1)}</span>
            <span className={styles.totalCount}>{total} {pluralizeReviews(total)}</span>
          </div>
        )}
      </div>

      {/* Write form */}
      {currentUser && !myReview && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formUser}>
            {currentUser.profilePicture
              ? <img src={currentUser.profilePicture} alt="" className={styles.avatar} />
              : <div className={styles.avatarFallback}>{currentUser.username?.slice(0, 2).toUpperCase()}</div>
            }
            <span className={styles.formUsername}>{currentUser.username}</span>
          </div>
          <StarPicker value={rating} onChange={setRating} disabled={submitting} />
          <textarea
            className={styles.textarea}
            placeholder="Напишите отзыв... (необязательно)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            disabled={submitting}
          />
          {formError && <p className={styles.formError}>{formError}</p>}
          <button className={styles.submitBtn} type="submit" disabled={submitting || rating === 0}>
            {submitting ? 'Отправляем...' : 'Оставить отзыв'}
          </button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className={styles.loadingList}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>💬</span>
          <p className={styles.emptyText}>Отзывов пока нет. Будьте первым!</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reviews.map(r => (
            <ReviewCard
              key={r.reviewId}
              review={r}
              canDelete={currentUser && (r.userId === currentUser.userId)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
          {loadingMore ? 'Загружаем...' : 'Показать ещё'}
        </button>
      )}
    </div>
  )
}

function pluralizeReviews(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'отзыв'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'отзыва'
  return 'отзывов'
}
