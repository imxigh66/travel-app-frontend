import { useState, useEffect } from 'react'
import {
  getVisitedCountries,
  addVisitedCountry,
  removeVisitedCountry,
  syncCountriesFromTrips,
} from '../../entities/user/api/userApi'
import styles from './VisitedCountries.module.css'

// Простой маппинг кода страны в флаг эмодзи
function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍'
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
  ).join('')
}

const visitedApi = {
  get:    (userId) => getVisitedCountries(userId),
  add:    (data)   => addVisitedCountry(data),
  remove: (code)   => removeVisitedCountry(code),
  sync:   ()       => syncCountriesFromTrips(),
}

export function VisitedCountries({ userId, isOwnProfile }) {
  const [countries, setCountries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [syncing,   setSyncing]   = useState(false)
  const [deleting,  setDeleting]  = useState(null)

  const [form, setForm] = useState({
    countryCode: '',
    city: '',
    visitedAt: '',
    note: '',
  })

  useEffect(() => {
    visitedApi.get(userId)
      .then(setCountries)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  const handleAdd = async () => {
    if (form.countryCode.trim().length !== 2) return
    setSaving(true)
    try {
      const added = await visitedApi.add({
        countryCode: form.countryCode.toUpperCase(),
        city:        form.city.trim() || null,
        visitedAt:   form.visitedAt || null,
        note:        form.note.trim() || null,
      })
      setCountries(prev => [added, ...prev])
      setForm({ countryCode: '', city: '', visitedAt: '', note: '' })
      setShowForm(false)
    } catch (e) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'Ошибка'
      alert(msg.includes('already') ? 'Эта страна уже добавлена' : msg)
    } finally { setSaving(false) }
  }

  const handleRemove = async (code) => {
    setDeleting(code)
    try {
      await visitedApi.remove(code)
      setCountries(prev => prev.filter(c => c.countryCode !== code))
    } catch { alert('Не удалось удалить') }
    finally { setDeleting(null) }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await visitedApi.sync()
      const updated = await visitedApi.get(userId)
      setCountries(updated)
    } catch { alert('Ошибка синхронизации') }
    finally { setSyncing(false) }
  }

  return (
    <div className={styles.wrap}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Посещённые страны</span>
          {countries.length > 0 && (
            <span className={styles.count}>{countries.length}</span>
          )}
        </div>
        {isOwnProfile && (
          <div className={styles.headerActions}>
            <button
              className={styles.syncBtn}
              onClick={handleSync}
              disabled={syncing}
              title="Синхронизировать из поездок"
            >
              {syncing ? '...' : <SyncIcon />}
            </button>
            <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
              <PlusIcon /> Добавить
            </button>
          </div>
        )}
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className={styles.form}>
          <div className={styles.formRow}>
            <input
              className={styles.input}
              placeholder="Код страны (RO)"
              value={form.countryCode}
              onChange={e => setForm(f => ({ ...f, countryCode: e.target.value.toUpperCase().slice(0, 2) }))}
              maxLength={2}
              style={{ flex: '0 0 90px' }}
            />
            <input
              className={styles.input}
              placeholder="Город (необязательно)"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              style={{ flex: 1 }}
            />
            <input
              className={styles.input}
              type="date"
              value={form.visitedAt}
              onChange={e => setForm(f => ({ ...f, visitedAt: e.target.value }))}
              style={{ flex: '0 0 140px' }}
            />
          </div>
          <input
            className={styles.input}
            placeholder="Заметка (необязательно)"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            maxLength={200}
          />
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Отмена</button>
            <button
              className={styles.saveBtn}
              onClick={handleAdd}
              disabled={saving || form.countryCode.length !== 2}
            >
              {saving ? 'Добавляем...' : 'Добавить'}
            </button>
          </div>
        </div>
      )}

      {/* Список стран */}
      {loading ? (
        <div className={styles.loading}>
          {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : countries.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🌍</span>
          <p>{isOwnProfile ? 'Добавьте страны которые вы посетили' : 'Нет посещённых стран'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {countries.map(c => (
            <div key={c.id} className={styles.countryCard}>
              <span className={styles.flag}>{countryFlag(c.countryCode)}</span>
              <div className={styles.cardInfo}>
                <span className={styles.code}>{c.countryCode}</span>
                {c.city && <span className={styles.city}>{c.city}</span>}
                {c.visitedAt && (
                  <span className={styles.date}>
                    {new Date(c.visitedAt).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                  </span>
                )}
                {c.note && <span className={styles.note}>{c.note}</span>}
              </div>
              {isOwnProfile && (
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(c.countryCode)}
                  disabled={deleting === c.countryCode}
                >
                  {deleting === c.countryCode ? '...' : '×'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlusIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function SyncIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
}