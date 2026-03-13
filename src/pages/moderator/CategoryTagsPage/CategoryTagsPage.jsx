import { useState, useEffect } from 'react'
import { moderatorTagApi, moderatorPlaceApi } from '../../../entities/moderator/api/moderatorApi'
import styles from './CategoryTagsPage.module.css'

export default function CategoryTagsPage() {
  const [tags, setTags]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Create form
  const [createForm, setCreateForm] = useState({ name: '', icon: '' })
  const [creating, setCreating]     = useState(false)
  const [createError, setCreateError] = useState('')

  // Edit modal
  const [editTag, setEditTag]       = useState(null) // { categoryTagId, name, icon }
  const [editForm, setEditForm]     = useState({ name: '', icon: '' })
  const [editing, setEditing]       = useState(false)
  const [editError, setEditError]   = useState('')

  // Places modal
  const [placesModal, setPlacesModal]     = useState(null) // tag
  const [tagPlaces, setTagPlaces]         = useState([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [placeSearch, setPlaceSearch]     = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching]         = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await moderatorTagApi.getAll()
      setTags(Array.isArray(data) ? data : (data?.data ?? []))
    } catch { showToast('Ошибка загрузки', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // ── Create ──
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) { setCreateError('Введите название'); return }
    setCreating(true); setCreateError('')
    try {
      const res = await moderatorTagApi.create(createForm)
      setTags(prev => [...prev, res.data ?? res])
      setCreateForm({ name: '', icon: '' })
      showToast('Подборка создана')
    } catch (e) {
      setCreateError(e.response?.data?.error ?? 'Ошибка')
    } finally { setCreating(false) }
  }

  // ── Edit ──
  const openEdit = (tag) => {
    setEditTag(tag)
    setEditForm({ name: tag.name, icon: tag.icon ?? '' })
    setEditError('')
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!editForm.name.trim()) { setEditError('Введите название'); return }
    setEditing(true); setEditError('')
    try {
      const res = await moderatorTagApi.update(editTag.categoryTagId, editForm)
      setTags(prev => prev.map(t => t.categoryTagId === editTag.categoryTagId ? (res.data ?? res) : t))
      showToast('Подборка обновлена')
      setEditTag(null)
    } catch (e) {
      setEditError(e.response?.data?.error ?? 'Ошибка')
    } finally { setEditing(false) }
  }

  // ── Delete ──
  const handleDelete = async (id) => {
    try {
      await moderatorTagApi.delete(id)
      setTags(prev => prev.filter(t => t.categoryTagId !== id))
      showToast('Подборка удалена')
    } catch { showToast('Ошибка удаления', 'error') }
    setDeleteConfirm(null)
  }

  // ── Places modal ──
  const openPlacesModal = async (tag) => {
    setPlacesModal(tag)
    setPlaceSearch('')
    setSearchResults([])
    setPlacesLoading(true)
    try {
      const data = await moderatorPlaceApi.getAll({ categoryTagId: tag.categoryTagId, pageSize: 50 })
      setTagPlaces(data.items ?? [])
    } catch { showToast('Ошибка загрузки мест', 'error') }
    finally { setPlacesLoading(false) }
  }

  const handlePlaceSearch = async () => {
    if (!placeSearch.trim()) return
    setSearching(true)
    try {
      const data = await moderatorPlaceApi.getAll({ city: placeSearch.trim(), pageSize: 20 })
      // exclude already in tag
      const inTag = new Set(tagPlaces.map(p => p.placeId))
      setSearchResults((data.items ?? []).filter(p => !inTag.has(p.placeId)))
    } catch {}
    finally { setSearching(false) }
  }

  const addPlaceToTag = async (place) => {
    const currentIds = tagPlaces.map(p => p.placeId)
    try {
      await moderatorPlaceApi.assignTags(place.placeId, [
        ...(place.categoryTags?.map(t => t.categoryTagId) ?? []),
        placesModal.categoryTagId
      ])
      setTagPlaces(prev => [...prev, place])
      setSearchResults(prev => prev.filter(p => p.placeId !== place.placeId))
      showToast(`«${place.name}» добавлено в подборку`)
    } catch { showToast('Ошибка', 'error') }
  }

  const removePlaceFromTag = async (place) => {
    const newTags = (place.categoryTags ?? [])
      .map(t => t.categoryTagId)
      .filter(id => id !== placesModal.categoryTagId)
    try {
      await moderatorPlaceApi.assignTags(place.placeId, newTags)
      setTagPlaces(prev => prev.filter(p => p.placeId !== place.placeId))
      showToast(`«${place.name}» удалено из подборки`)
    } catch { showToast('Ошибка', 'error') }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Подборки</h1>
        <p className={styles.subtitle}>Категориальные теги для мест</p>
      </div>

      <div className={styles.layout}>
        {/* ── Create form (left) ── */}
        <div className={styles.createCard}>
          <h2 className={styles.cardTitle}>Новая подборка</h2>
          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Иконка (эмодзи)</label>
              <input className={styles.input} value={createForm.icon}
                onChange={e => setCreateForm(p => ({ ...p, icon: e.target.value }))}
                placeholder="🏖️" maxLength={4} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Название *</label>
              <input className={styles.input} value={createForm.name}
                onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Например: Лучшие пляжи" />
            </div>
            {createError && <p className={styles.error}>{createError}</p>}
            <button type="submit" className={styles.createBtn} disabled={creating}>
              {creating ? 'Создаём...' : '+ Создать'}
            </button>
          </form>
        </div>

        {/* ── Tags list (right) ── */}
        <div className={styles.listCard}>
          <h2 className={styles.cardTitle}>Все подборки ({tags.length})</h2>
          {loading ? (
            <div className={styles.skeletons}>
              {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : tags.length === 0 ? (
            <p className={styles.empty}>Подборок пока нет — создайте первую</p>
          ) : (
            <div className={styles.tagList}>
              {tags.map(tag => (
                <div key={tag.categoryTagId} className={styles.tagRow}>
                  <span className={styles.tagIcon}>{tag.icon || '📌'}</span>
                  <span className={styles.tagName}>{tag.name}</span>
                  <div className={styles.tagActions}>
                    <button className={styles.placesBtn} onClick={() => openPlacesModal(tag)}>
                      🗂 Места
                    </button>
                    <button className={styles.editBtn} onClick={() => openEdit(tag)}>Изменить</button>
                    <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(tag)}>Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editTag && (
        <div className={styles.overlay} onClick={() => setEditTag(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Редактировать подборку</h3>
            <form onSubmit={handleEdit} className={styles.form} style={{ marginTop: 20 }}>
              <div className={styles.field}>
                <label className={styles.label}>Иконка</label>
                <input className={styles.input} value={editForm.icon}
                  onChange={e => setEditForm(p => ({ ...p, icon: e.target.value }))}
                  placeholder="📌" maxLength={4} autoFocus />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Название *</label>
                <input className={styles.input} value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Название" />
              </div>
              {editError && <p className={styles.error}>{editError}</p>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditTag(null)}>Отмена</button>
                <button type="submit" className={styles.saveBtn} disabled={editing}>
                  {editing ? 'Сохраняем...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Places modal ── */}
      {placesModal && (
        <div className={styles.overlay} onClick={() => setPlacesModal(null)}>
          <div className={styles.placesModal} onClick={e => e.stopPropagation()}>
            <div className={styles.placesModalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{placesModal.icon} {placesModal.name}</h3>
                <p className={styles.modalSub}>Места в этой подборке: {tagPlaces.length}</p>
              </div>
              <button className={styles.closeBtn} onClick={() => setPlacesModal(null)}>✕</button>
            </div>

            {/* Search to add */}
            <div className={styles.placeSearchRow}>
              <input
                className={styles.placeSearchInput}
                placeholder="Поиск мест по городу..."
                value={placeSearch}
                onChange={e => setPlaceSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePlaceSearch()}
              />
              <button className={styles.searchBtn} onClick={handlePlaceSearch} disabled={searching}>
                {searching ? '...' : 'Найти'}
              </button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                <p className={styles.resultsLabel}>Найдено — нажмите чтобы добавить:</p>
                {searchResults.map(p => (
                  <div key={p.placeId} className={styles.resultRow}>
                    <span className={styles.resultName}>{p.name} <span className={styles.resultCity}>· {p.city}</span></span>
                    <button className={styles.addBtn} onClick={() => addPlaceToTag(p)}>+ Добавить</button>
                  </div>
                ))}
              </div>
            )}

            {/* Current places */}
            <div className={styles.currentPlaces}>
              <p className={styles.resultsLabel}>В подборке:</p>
              {placesLoading ? (
                <div className={styles.skeletons}>
                  {[1,2,3].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonSm}`} />)}
                </div>
              ) : tagPlaces.length === 0 ? (
                <p className={styles.emptyPlaces}>Мест пока нет — найдите и добавьте выше</p>
              ) : (
                tagPlaces.map(p => (
                  <div key={p.placeId} className={styles.currentRow}>
                    <div className={styles.currentThumb}>
                      {p.coverImageUrl ? <img src={p.coverImageUrl} alt="" /> : <span>📍</span>}
                    </div>
                    <span className={styles.currentName}>{p.name} <span className={styles.resultCity}>· {p.city}</span></span>
                    <button className={styles.removeBtn} onClick={() => removePlaceFromTag(p)}>Убрать</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Удалить подборку?</h3>
            <p className={styles.modalSub}>«{deleteConfirm.icon} {deleteConfirm.name}» будет удалена. Места не пострадают.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Отмена</button>
              <button className={styles.deleteConfirmBtn} onClick={() => handleDelete(deleteConfirm.categoryTagId)}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles[toast.type]}`}>{toast.msg}</div>}
    </div>
  )
}