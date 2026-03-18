import { useState } from 'react'
import { tripApi } from '../../entities/trip/api/tripApi'
import styles from './TripDestinations.module.css'

export function TripDestinations({ trip, isOwner, onUpdate }) {
  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [dests,   setDests]     = useState(
    trip.destinations?.length > 0
      ? [...trip.destinations].sort((a, b) => a.sortOrder - b.sortOrder)
      : [{ id: null, city: trip.city, countryCode: trip.countryCode, sortOrder: 1, dateFrom: null, dateTo: null }]
  )
  const [newCity, setNewCity]   = useState('')
  const [newCC,   setNewCC]     = useState('')

  const addDest = () => {
    if (newCity.trim().length < 2 || newCC.trim().length !== 2) return
    setDests(prev => [...prev, {
      id: null,
      city: newCity.trim(),
      countryCode: newCC.toUpperCase(),
      sortOrder: prev.length + 1,
      dateFrom: null,
      dateTo: null,
    }])
    setNewCity('')
    setNewCC('')
  }

  const removeDest = (idx) => {
    setDests(prev => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, sortOrder: i + 1 })))
  }

  const updateDest = (idx, field, value) => {
    setDests(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await tripApi.upsertDestinations(trip.tripId, dests)
      onUpdate(result)
      setEditing(false)
    } catch (e) {
      console.error('upsertDestinations error:', e?.response?.data ?? e)
      alert('Ошибка: ' + (e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Неизвестная ошибка'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDests(
      trip.destinations?.length > 0
        ? [...trip.destinations].sort((a, b) => a.sortOrder - b.sortOrder)
        : [{ id: null, city: trip.city, countryCode: trip.countryCode, sortOrder: 1, dateFrom: null, dateTo: null }]
    )
    setNewCity('')
    setNewCC('')
    setEditing(false)
  }

  // ── Отображение (не редактирование) ─────────────────────────────
  if (!editing) {
    const hasMult = dests.length > 1
    return (
      <div className={styles.viewWrap}>
        <div className={styles.destChips}>
          {dests.map((d, i) => (
            <span key={i} className={styles.destChip}>
              <PinIcon />
              {d.city}
              {d.countryCode && <span className={styles.destCC}>{d.countryCode}</span>}
              {i < dests.length - 1 && <span className={styles.arrow}>→</span>}
            </span>
          ))}
        </div>
        {isOwner && (
          <button className={styles.editBtn} onClick={() => setEditing(true)} title="Редактировать города">
            {hasMult ? <EditIcon /> : <PlusIcon />}
            {hasMult ? '' : ' Добавить город'}
          </button>
        )}
      </div>
    )
  }

  // ── Редактирование ───────────────────────────────────────────────
  return (
    <div className={styles.editWrap}>
      <div className={styles.editTitle}>Города поездки</div>

      <div className={styles.destList}>
        {dests.map((d, i) => (
          <div key={i} className={styles.destRow}>
            <div className={styles.destNum}>{i + 1}</div>

            <input
              className={styles.destInput}
              value={d.city}
              onChange={e => updateDest(i, 'city', e.target.value)}
              placeholder="Город"
            />
            <input
              className={`${styles.destInput} ${styles.destInputCC}`}
              value={d.countryCode}
              onChange={e => updateDest(i, 'countryCode', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="RO"
              maxLength={2}
            />
            <input
              className={`${styles.destInput} ${styles.destInputDate}`}
              type="date"
              value={d.dateFrom ?? ''}
              onChange={e => updateDest(i, 'dateFrom', e.target.value || null)}
              title="Дата приезда"
            />
            <input
              className={`${styles.destInput} ${styles.destInputDate}`}
              type="date"
              value={d.dateTo ?? ''}
              onChange={e => updateDest(i, 'dateTo', e.target.value || null)}
              min={d.dateFrom ?? ''}
              title="Дата отъезда"
            />

            {dests.length > 1 && (
              <button className={styles.destRemove} onClick={() => removeDest(i)} title="Удалить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Добавить новый город */}
      <div className={styles.addRow}>
        <input
          className={styles.destInput}
          placeholder="Новый город"
          value={newCity}
          onChange={e => setNewCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addDest()}
        />
        <input
          className={`${styles.destInput} ${styles.destInputCC}`}
          placeholder="RO"
          value={newCC}
          onChange={e => setNewCC(e.target.value.toUpperCase().slice(0, 2))}
          maxLength={2}
          onKeyDown={e => e.key === 'Enter' && addDest()}
        />
        <button
          className={styles.addBtn}
          onClick={addDest}
          disabled={newCity.trim().length < 2 || newCC.trim().length !== 2}
        >+ Добавить</button>
      </div>

      {/* Действия */}
      <div className={styles.editActions}>
        <button className={styles.cancelBtn} onClick={handleCancel}>Отмена</button>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving || dests.length === 0}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}

function PinIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function EditIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}