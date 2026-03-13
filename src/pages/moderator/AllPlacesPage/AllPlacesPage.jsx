import { useState, useEffect } from 'react'
import { moderatorPlaceApi, moderatorTagApi } from '../../../entities/moderator/api/moderatorApi'
import styles from './AllPlacesPage.module.css'

const CATEGORIES = [
  { value: '', label: 'Все категории' },
  { value: 'Food', label: '🍜 Еда' },
  { value: 'Accommodation', label: '🏨 Жильё' },
  { value: 'Culture', label: '🏛️ Культура' },
  { value: 'Nature', label: '🏔️ Природа' },
  { value: 'Entertainment', label: '🎭 Развлечения' },
  { value: 'Shopping', label: '🛍️ Шопинг' },
]

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'popular', label: 'По популярности' },
  { value: 'newest', label: 'Сначала новые' },
]

const STATUS_LABEL = { 0: 'На проверке', 1: 'Одобрено', 2: 'Отклонено' }
const STATUS_CLASS  = { 0: 'pending', 1: 'approved', 2: 'rejected' }

export default function AllPlacesPage() {
  const [places, setPlaces]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [tags, setTags]             = useState([])

  const [category, setCategory] = useState('')
  const [city, setCity]         = useState('')
  const [tagId, setTagId]       = useState('')
  const [sortBy, setSortBy]     = useState('')

  const [assignModal, setAssignModal]   = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [assignLoading, setAssignLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params = { pageNumber: p, pageSize: 15 }
      if (category) params.category = category
      if (city.trim()) params.city = city.trim()
      if (tagId) params.categoryTagId = tagId
      if (sortBy) params.sortBy = sortBy
      const data = await moderatorPlaceApi.getAll(params)
      setPlaces(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 1)
      setPage(p)
    } catch {
      showToast('Ошибка загрузки', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    moderatorTagApi.getAll()
      .then(d => setTags(Array.isArray(d) ? d : (d?.data ?? [])))
      .catch(() => {})
  }, [])

  const openAssign = (place) => {
    setAssignModal(place)
    setSelectedTags(place.categoryTags?.map(t => t.categoryTagId) ?? [])
  }

  const toggleTag = (id) =>
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const handleAssign = async () => {
    setAssignLoading(true)
    try {
      await moderatorPlaceApi.assignTags(assignModal.placeId, selectedTags)
      showToast('Подборки назначены')
      setAssignModal(null)
      load(page)
    } catch {
      showToast('Ошибка', 'error')
    } finally {
      setAssignLoading(false)
    }
  }

  const handleSearch = () => load(1)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Все места</h1>
        <p className={styles.subtitle}>{totalCount} мест в базе</p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input className={styles.input} placeholder="Город..." value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <select className={styles.select} value={tagId} onChange={e => setTagId(e.target.value)}>
          <option value="">Все подборки</option>
          {tags.map(t => <option key={t.categoryTagId} value={t.categoryTagId}>{t.icon} {t.name}</option>)}
        </select>
        <select className={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className={styles.filterBtn} onClick={handleSearch}>Найти</button>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Место</th><th>Город</th><th>Статус</th><th>Рейтинг</th><th>Подборки</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j}><div className={styles.skeleton} /></td>)}</tr>
                ))
              : places.length === 0
                ? <tr><td colSpan={6} className={styles.emptyRow}>Места не найдены</td></tr>
                : places.map(place => (
                    <tr key={place.placeId}>
                      <td>
                        <div className={styles.placeCell}>
                          <div className={styles.thumb}>
                            {place.coverImageUrl ? <img src={place.coverImageUrl} alt="" /> : <span>📍</span>}
                          </div>
                          <span className={styles.placeName}>{place.name}</span>
                        </div>
                      </td>
                      <td className={styles.muted}>{place.city}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[place.status] ?? 'approved']}`}>
                          {STATUS_LABEL[place.status] ?? 'Одобрено'}
                        </span>
                      </td>
                      <td className={styles.muted}>{Number(place.averageRating)?.toFixed(1) ?? '—'}</td>
                      <td>
                        <div className={styles.tagsList}>
                          {place.categoryTags?.slice(0, 2).map(t => (
                            <span key={t.categoryTagId} className={styles.tag}>{t.icon} {t.name}</span>
                          ))}
                          {(place.categoryTags?.length ?? 0) > 2 && (
                            <span className={styles.tag}>+{place.categoryTags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className={styles.assignBtn} onClick={() => openAssign(place)}>Подборки</button>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 1} onClick={() => load(page - 1)}>← Назад</button>
          <span className={styles.pageInfo}>стр. {page} из {totalPages}</span>
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => load(page + 1)}>Вперёд →</button>
        </div>
      )}

      {/* Assign tags modal */}
      {assignModal && (
        <div className={styles.overlay} onClick={() => setAssignModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Назначить подборки</h3>
            <p className={styles.modalSub}>«{assignModal.name}»</p>
            {tags.length === 0
              ? <p className={styles.noTags}>Подборок пока нет. Создайте их на странице «Подборки».</p>
              : <div className={styles.tagGrid}>
                  {tags.map(t => (
                    <button
                      key={t.categoryTagId}
                      className={`${styles.tagOption} ${selectedTags.includes(t.categoryTagId) ? styles.tagSelected : ''}`}
                      onClick={() => toggleTag(t.categoryTagId)}
                    >
                      {t.icon} {t.name}
                    </button>
                  ))}
                </div>
            }
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setAssignModal(null)}>Отмена</button>
              <button className={styles.saveBtn} onClick={handleAssign} disabled={assignLoading}>
                {assignLoading ? 'Сохраняем...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}
    </div>
  )
}