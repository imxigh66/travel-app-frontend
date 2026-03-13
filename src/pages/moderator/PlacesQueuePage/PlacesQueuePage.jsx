import { useState, useEffect, useCallback } from 'react'
import { moderatorPlaceApi } from '../../../entities/moderator/api/moderatorApi'
import styles from './PlacesQueuePage.module.css'

const CATEGORY_LABELS = {
  0: 'Еда', 1: 'Жильё', 2: 'Культура', 3: 'Природа',
  4: 'Развлечения', 5: 'Шопинг', 6: 'Транспорт', 7: 'Услуги',
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
]

const PAGE_SIZE = 10

export default function PlacesQueuePage() {
  const [places, setPlaces]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [totalCount, setTotalCount]   = useState(0)
  const [totalPages, setTotalPages]   = useState(1)
  const [page, setPage]               = useState(1)
  const [sortBy, setSortBy]           = useState('newest')
  const [actionLoading, setActionLoading] = useState({})
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast]             = useState(null)

  const load = useCallback(async (p = 1, sort = sortBy) => {
    setLoading(true)
    try {
      const data = await moderatorPlaceApi.getPending(p, PAGE_SIZE, sort)
      setPlaces(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 1)
      setPage(p)
    } catch {
      showToast('Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }, [sortBy])

  useEffect(() => { load(1, sortBy) }, [sortBy])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApprove = async (placeId, name) => {
    setActionLoading(p => ({ ...p, [placeId]: 'approving' }))
    try {
      await moderatorPlaceApi.approve(placeId)
      setPlaces(prev => prev.filter(p => p.placeId !== placeId))
      setTotalCount(p => p - 1)
      showToast(`✅ «${name}» одобрено`)
    } catch {
      showToast('Ошибка при одобрении', 'error')
    } finally {
      setActionLoading(p => ({ ...p, [placeId]: null }))
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    const { placeId, name } = rejectModal
    setActionLoading(p => ({ ...p, [placeId]: 'rejecting' }))
    try {
      await moderatorPlaceApi.reject(placeId, rejectReason)
      setPlaces(prev => prev.filter(p => p.placeId !== placeId))
      setTotalCount(p => p - 1)
      showToast(`«${name}» отклонено`)
      setRejectModal(null)
      setRejectReason('')
    } catch {
      showToast('Ошибка при отклонении', 'error')
    } finally {
      setActionLoading(p => ({ ...p, [placeId]: null }))
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Очередь мест</h1>
          <p className={styles.subtitle}>
            {loading ? '...' : `${totalCount} мест ожидают рассмотрения`}
          </p>
        </div>
        <select
          className={styles.sortSelect}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className={styles.skeletons}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : places.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎉</div>
          <h3>Очередь пуста</h3>
          <p>Все места проверены</p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {places.map(place => (
              <PlaceCard
                key={place.placeId}
                place={place}
                onApprove={() => handleApprove(place.placeId, place.name)}
                onReject={() => { setRejectModal({ placeId: place.placeId, name: place.name }); setRejectReason('') }}
                approving={actionLoading[place.placeId] === 'approving'}
                rejecting={actionLoading[place.placeId] === 'rejecting'}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page === 1} onClick={() => load(page - 1)}>← Назад</button>
              <span className={styles.pageInfo}>стр. {page} из {totalPages}</span>
              <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => load(page + 1)}>Вперёд →</button>
            </div>
          )}
        </>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className={styles.overlay} onClick={() => setRejectModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Отклонить место</h3>
            <p className={styles.modalSub}>«{rejectModal.name}»</p>
            <label className={styles.modalLabel}>Причина</label>
            <textarea
              className={styles.modalTextarea}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Пользователь увидит эту причину..."
              rows={4}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setRejectModal(null)}>Отмена</button>
              <button className={styles.rejectConfirmBtn} onClick={handleReject} disabled={!rejectReason.trim()}>
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}
    </div>
  )
}

function PlaceCard({ place, onApprove, onReject, approving, rejecting }) {
  const cover    = place.coverImageUrl ?? place.imageUrls?.[0]
  const category = CATEGORY_LABELS[place.category] ?? place.category
  const date     = new Date(place.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className={styles.card}>
      <div className={styles.cardImg}>
        {cover ? <img src={cover} alt={place.name} /> : <div className={styles.noImg}>📍</div>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div>
            <span className={styles.categoryBadge}>{category}</span>
            <h3 className={styles.cardName}>{place.name}</h3>
            <p className={styles.cardLocation}>
              📍 {place.city}, {place.countryCode}
              {place.address && ` · ${place.address}`}
            </p>
          </div>
          <div className={styles.cardMeta}>
            <p className={styles.submittedBy}>
              {place.creatorUsername ? <>от <strong>@{place.creatorUsername}</strong></> : '—'}
            </p>
            <p className={styles.submittedAt}>{date}</p>
          </div>
        </div>
        {place.description && <p className={styles.cardDesc}>{place.description}</p>}
      </div>
      <div className={styles.cardActions}>
        <button className={styles.rejectBtn} onClick={onReject} disabled={approving || rejecting}>
          {rejecting ? '...' : 'Отклонить'}
        </button>
        <button className={styles.approveBtn} onClick={onApprove} disabled={approving || rejecting}>
          {approving ? 'Одобряем...' : 'Одобрить'}
        </button>
      </div>
    </div>
  )
}