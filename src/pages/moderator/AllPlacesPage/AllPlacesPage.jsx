import { useState, useEffect } from 'react'
import { moderatorPlaceApi, moderatorTagApi } from '../../../entities/moderator/api/moderatorApi'
import SuggestPlaceModal from '../../../features/suggest-place/ui/SuggestPlaceModal'
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

const PLACE_TYPES = [
  { value: 'Restaurant', label: 'Ресторан' },
  { value: 'Cafe', label: 'Кафе' },
  { value: 'Hotel', label: 'Отель' },
  { value: 'Museum', label: 'Музей' },
  { value: 'Park', label: 'Парк' },
  { value: 'Attraction', label: 'Достопримечательность' },
  { value: 'Shop', label: 'Магазин' },
  { value: 'Bar', label: 'Бар' },
  { value: 'Other', label: 'Другое' },
]

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'popular', label: 'По популярности' },
  { value: 'newest', label: 'Сначала новые' },
]

const STATUS_LABEL = { 0: 'На проверке', 1: 'Одобрено', 2: 'Отклонено' }
const STATUS_CLASS  = { 0: 'pending',     1: 'approved', 2: 'rejected' }

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

  const [assignModal, setAssignModal]     = useState(null)
  const [selectedTags, setSelectedTags]   = useState([])
  const [assignLoading, setAssignLoading] = useState(false)

  const [editModal, setEditModal]     = useState(null)
  const [editForm, setEditForm]       = useState({})
  const [editSaving, setEditSaving]   = useState(false)
  const [newImages, setNewImages]     = useState([])       // File[]
  const [imagePreviews, setImagePreviews] = useState([])   // base64 previews
  const [deleteImageIds, setDeleteImageIds] = useState([]) // ids to delete

  const [toast, setToast]           = useState(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

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

  // ── Assign tags ──────────────────────────────────────────────
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

  // ── Edit place ───────────────────────────────────────────────
  const CATEGORY_MAP = { 0:'Food', 1:'Accommodation', 2:'Culture', 3:'Nature', 4:'Entertainment', 5:'Shopping', 6:'Transport', 7:'Services' }
  const PLACE_TYPE_MAP = { 0:'Restaurant', 1:'Hotel', 2:'Museum', 3:'Park', 4:'Attraction', 5:'Shop', 6:'Bar', 7:'Cafe', 8:'Other' }

  const openEdit = (place) => {
    setEditModal(place)
    setEditForm({
      name:        place.name        ?? '',
      description: place.description ?? '',
      city:        place.city        ?? '',
      countryCode: place.countryCode ?? '',
      address:     place.address     ?? '',
      category:    CATEGORY_MAP[place.category]  ?? CATEGORIES.find(c => c.value)?.value ?? '',
      placeType:   PLACE_TYPE_MAP[place.placeType] ?? '',
      latitude:    place.latitude    ?? '',
      longitude:   place.longitude   ?? '',
    })
    setNewImages([])
    setImagePreviews([])
    setDeleteImageIds([])
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setNewImages(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeNewImage = (idx) => {
    setNewImages(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const toggleDeleteImage = (imageId) => {
    setDeleteImageIds(prev =>
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    )
  }

  const handleEditSave = async () => {
    if (!editForm.name.trim()) return
    setEditSaving(true)
    try {
      const fd = new FormData()

      // Явно маппим поля с правильными именами (PascalCase как ожидает бэк)
      if (editForm.name.trim())        fd.append('Name',        editForm.name.trim())
      if (editForm.description.trim()) fd.append('Description', editForm.description.trim())
      if (editForm.city.trim())        fd.append('City',        editForm.city.trim())
      if (editForm.countryCode.trim()) fd.append('CountryCode', editForm.countryCode.trim().toUpperCase())
      if (editForm.address.trim())     fd.append('Address',     editForm.address.trim())
      if (editForm.category)           fd.append('Category',    editForm.category)
      if (editForm.placeType)          fd.append('PlaceType',   editForm.placeType)

      // Координаты — только если валидные числа
      const lat = parseFloat(String(editForm.latitude))
      const lng = parseFloat(String(editForm.longitude))
      if (!isNaN(lat)) fd.append('Latitude',  lat.toString().replace(',', '.'))
      if (!isNaN(lng)) fd.append('Longitude', lng.toString().replace(',', '.'))

      // Новые фото
      newImages.forEach(file => fd.append('NewImages', file))
      // Удаляемые фото
      deleteImageIds.forEach(id => fd.append('DeleteImageIds', id))

      await moderatorPlaceApi.update(editModal.placeId, fd)
      showToast('Место обновлено')
      setEditModal(null)
      load(page)
    } catch (e) {
      console.error('Update error:', e?.response?.data ?? e)
      showToast(e?.response?.data?.error ?? e?.response?.data?.message ?? 'Ошибка сохранения', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const handleSearch = () => load(1)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Все места</h1>
        <p className={styles.subtitle}>{totalCount} мест в базе</p>
        <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
          + Создать место
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input
          className={styles.input}
          placeholder="Город..."
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
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
              <th>Место</th><th>Город</th><th>Статус</th>
              <th>Рейтинг</th><th>Подборки</th><th>Действия</th>
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
                            {place.coverImageUrl
                              ? <img src={place.coverImageUrl} alt="" />
                              : <span>📍</span>
                            }
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
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn}   onClick={() => openEdit(place)}>✏️ Изменить</button>
                          <button className={styles.assignBtn} onClick={() => openAssign(place)}>Подборки</button>
                        </div>
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

      {/* ── Edit modal ── */}
      {editModal && (
        <div className={styles.overlay} onClick={() => setEditModal(null)}>
          <div className={`${styles.modal} ${styles.editModalWide}`} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Редактировать место</h3>
            <p className={styles.modalSub}>ID: {editModal.placeId}</p>

            <div className={styles.editGrid}>
              <div className={styles.editField}>
                <label>Название *</label>
                <input
                  className={styles.editInput}
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className={styles.editField}>
                <label>Категория</label>
                <select
                  className={styles.editInput}
                  value={editForm.category}
                  onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.filter(c => c.value).map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.editField}>
                <label>Город</label>
                <input
                  className={styles.editInput}
                  value={editForm.city}
                  onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className={styles.editField}>
                <label>Код страны</label>
                <input
                  className={styles.editInput}
                  value={editForm.countryCode}
                  onChange={e => setEditForm(f => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 2) }))}
                  maxLength={2}
                />
              </div>
              <div className={`${styles.editField} ${styles.editFieldFull}`}>
                <label>Адрес</label>
                <input
                  className={styles.editInput}
                  value={editForm.address}
                  onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className={styles.editField}>
                <label>Широта</label>
                <input
                  className={styles.editInput}
                  type="number"
                  step="0.000001"
                  value={editForm.latitude}
                  onChange={e => setEditForm(f => ({ ...f, latitude: e.target.value }))}
                />
              </div>
              <div className={styles.editField}>
                <label>Долгота</label>
                <input
                  className={styles.editInput}
                  type="number"
                  step="0.000001"
                  value={editForm.longitude}
                  onChange={e => setEditForm(f => ({ ...f, longitude: e.target.value }))}
                />
              </div>
              <div className={`${styles.editField} ${styles.editFieldFull}`}>
                <label>Описание</label>
                <textarea
                  className={`${styles.editInput} ${styles.editTextarea}`}
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Существующие фото */}
              {editModal.imageUrls?.length > 0 && (
                <div className={`${styles.editField} ${styles.editFieldFull}`}>
                  <label>Текущие фото (нажми чтобы удалить)</label>
                  <div className={styles.photoGrid}>
                    {editModal.imageUrls.map((url, i) => {
                      const imgId = editModal.imageIds?.[i]
                      const marked = deleteImageIds.includes(imgId)
                      return (
                        <div
                          key={i}
                          className={`${styles.photoThumb} ${marked ? styles.photoMarkedDelete : ''}`}
                          onClick={() => imgId && toggleDeleteImage(imgId)}
                          title={marked ? 'Отменить удаление' : 'Пометить на удаление'}
                        >
                          <img src={url} alt="" />
                          {marked && <div className={styles.photoDeleteOverlay}>✕</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Новые фото */}
              <div className={`${styles.editField} ${styles.editFieldFull}`}>
                <label>Добавить фото</label>
                <label className={styles.uploadBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Выбрать фото
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                </label>
                {imagePreviews.length > 0 && (
                  <div className={styles.photoGrid}>
                    {imagePreviews.map((src, i) => (
                      <div key={i} className={styles.photoThumb}>
                        <img src={src} alt="" />
                        <button
                          className={styles.photoRemove}
                          onClick={() => removeNewImage(i)}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setEditModal(null)}>Отмена</button>
              <button
                className={styles.saveBtn}
                onClick={handleEditSave}
                disabled={editSaving || !editForm.name.trim()}
              >
                {editSaving ? 'Сохраняем...' : 'Сохранить изменения'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign tags modal ── */}
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

      <SuggestPlaceModal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); load(1) }}
      />
    </div>
  )
}