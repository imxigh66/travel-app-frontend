import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripApi } from '../../../entities/trip/api/tripApi'
import styles from './CreateTripModal.module.css'

// Популярные города для быстрого выбора
const POPULAR_CITIES = [
  { city: 'Batumi',    countryCode: 'GE', emoji: '🌊' },
  { city: 'Berlin',    countryCode: 'DE', emoji: '🎡' },
  { city: 'Brasov',    countryCode: 'RO', emoji: '🏔️' },
  { city: 'Bucharest', countryCode: 'RO', emoji: '🏰' },
  { city: 'Cavaillon', countryCode: 'FR', emoji: '🍈' },
  { city: 'Chisinau',  countryCode: 'MD', emoji: '🍷' },
  { city: 'Germany',   countryCode: 'DE', emoji: '🇩🇪' },
  { city: 'Japan',     countryCode: 'JP', emoji: '🗾' },
  { city: 'Moscow',    countryCode: 'RU', emoji: '🏛️' },
  { city: 'Paris',     countryCode: 'FR', emoji: '🗼' },
  { city: 'Tbilisi',   countryCode: 'GE', emoji: '🕌' },
]

const AI_PROMPTS = [
  'Культурный отдых с музеями и историческими местами',
  'Гастрономический тур по лучшим ресторанам',
  'Активный отдых и природа',
  'Романтическая поездка для двоих',
  'Семейный отдых с детьми',
  'Ночная жизнь и развлечения',
]

const STEPS = ['Город', 'Даты', 'Название', 'Маршрут']

export function CreateTripModal({ onClose, onCreate }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    city: '',
    countryCode: '',
    dateFrom: '',
    dateTo: '',
    title: '',
    description: '',
    isPublic: true,
    aiPrompt: '',
    useAI: null, // null = не выбрано, true = AI, false = пустой
  })

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const canNext = () => {
    if (step === 0) return form.city.trim().length >= 2 && form.countryCode.trim().length === 2
    if (step === 1) return true // даты опциональны
    if (step === 2) return form.title.trim().length >= 2
    return true
  }

  const handleCitySelect = (c) => {
    setForm(f => ({ ...f, city: c.city, countryCode: c.countryCode }))
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')
    try {
      const tripDate = form.dateFrom || new Date().toISOString().split('T')[0]
      const trip = await tripApi.createTrip({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        city: form.city.trim(),
        countryCode: form.countryCode.toUpperCase().slice(0, 2),
        tripDate,
        isPublic: form.isPublic,
        status: 0,
      })
      onCreate?.(trip)

      if (form.useAI && form.aiPrompt.trim()) {
        try {
          const aiResult = await tripApi.aiSuggest(trip.tripId, form.aiPrompt)
          navigate(`/trips/${trip.tripId}`, { state: { aiSuggestions: aiResult } })
        } catch {
          navigate(`/trips/${trip.tripId}`)
        }
      } else {
        navigate(`/trips/${trip.tripId}`)
      }

      onClose()
    } catch {
      setError('Не удалось создать поездку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>✈️ Новая поездка</h2>
          <button className={styles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((label, i) => (
            <div key={i} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
              <div className={styles.stepDot}>{i < step ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{label}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>

          {/* ── Шаг 0: Город ── */}
          {step === 0 && (
            <div className={styles.fields}>
              <div className={styles.stepHeading}>Куда едем?</div>

              {/* Популярные */}
              <div className={styles.cityGrid}>
                {POPULAR_CITIES.map(c => (
                  <button
                    key={c.city}
                    type="button"
                    className={`${styles.cityChip} ${form.city === c.city ? styles.cityChipActive : ''}`}
                    onClick={() => handleCitySelect(c)}
                  >
                    <span className={styles.cityEmoji}>{c.emoji}</span>
                    <span className={styles.cityName}>{c.city}</span>
                  </button>
                ))}
              </div>

              {/* Или вручную */}
              <div className={styles.orDivider}><span>или введите вручную</span></div>
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <label className={styles.label}>Город</label>
                  <input
                    className={styles.input}
                    placeholder="Стокгольм"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className={styles.field} style={{ flex: '0 0 80px' }}>
                  <label className={styles.label}>Страна</label>
                  <input
                    className={styles.input}
                    placeholder="SE"
                    value={form.countryCode}
                    onChange={e => set('countryCode', e.target.value.toUpperCase().slice(0, 2))}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Шаг 1: Даты ── */}
          {step === 1 && (
            <div className={styles.fields}>
              <div className={styles.stepHeading}>Когда едем?</div>
              <p className={styles.stepSub}>Даты можно не указывать — добавите позже</p>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Дата выезда</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.dateFrom}
                    onChange={e => set('dateFrom', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Дата возвращения</label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.dateTo}
                    onChange={e => set('dateTo', e.target.value)}
                    min={form.dateFrom}
                  />
                </div>
              </div>

              {form.dateFrom && form.dateTo && (
                <div className={styles.durationBadge}>
                  {Math.ceil((new Date(form.dateTo) - new Date(form.dateFrom)) / 86400000)} {pluralizeDays(Math.ceil((new Date(form.dateTo) - new Date(form.dateFrom)) / 86400000))}
                </div>
              )}

              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={e => set('isPublic', e.target.checked)}
                  className={styles.checkbox}
                />
                <div>
                  <div className={styles.checkLabel}>Публичная поездка</div>
                  <div className={styles.checkSub}>Другие пользователи смогут видеть маршрут</div>
                </div>
              </label>
            </div>
          )}

          {/* ── Шаг 2: Название ── */}
          {step === 2 && (
            <div className={styles.fields}>
              <div className={styles.stepHeading}>Как назовём?</div>

              <div className={styles.field}>
                <label className={styles.label}>Название *</label>
                <input
                  className={styles.input}
                  placeholder={`Поездка в ${form.city}`}
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  maxLength={150}
                  autoFocus
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Описание <span className={styles.optional}>(необязательно)</span></label>
                <textarea
                  className={styles.textarea}
                  placeholder="Что планируете? Особые пожелания?"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Быстрое предложение названия */}
              {!form.title && (
                <button
                  type="button"
                  className={styles.suggestBtn}
                  onClick={() => set('title', `Поездка в ${form.city}`)}
                >
                  💡 Использовать «Поездка в {form.city}»
                </button>
              )}
            </div>
          )}

          {/* ── Шаг 3: Маршрут — AI или пустой ── */}
          {step === 3 && (
            <div className={styles.fields}>
              <div className={styles.stepHeading}>Как создаём маршрут?</div>

              <div className={styles.routeOptions}>

                {/* AI вариант */}
                <div
                  className={`${styles.routeCard} ${form.useAI === true ? styles.routeCardActive : ''}`}
                  onClick={() => set('useAI', true)}
                >
                  <div className={styles.routeCardIcon}>✨</div>
                  <div className={styles.routeCardBody}>
                    <div className={styles.routeCardTitle}>Создать с AI</div>
                    <div className={styles.routeCardDesc}>AI подберёт места по вашему запросу. Можно редактировать.</div>
                  </div>
                  <div className={`${styles.routeRadio} ${form.useAI === true ? styles.routeRadioActive : ''}`} />
                </div>

                {/* Пустой вариант */}
                <div
                  className={`${styles.routeCard} ${form.useAI === false ? styles.routeCardActive : ''}`}
                  onClick={() => set('useAI', false)}
                >
                  <div className={styles.routeCardIcon}>📋</div>
                  <div className={styles.routeCardBody}>
                    <div className={styles.routeCardTitle}>Начать с пустого маршрута</div>
                    <div className={styles.routeCardDesc}>Добавляйте места из каталога самостоятельно.</div>
                  </div>
                  <div className={`${styles.routeRadio} ${form.useAI === false ? styles.routeRadioActive : ''}`} />
                </div>
              </div>

              {/* AI промпт */}
              {form.useAI === true && (
                <div className={styles.aiBlock}>
                  <div className={styles.label}>Опишите какой маршрут вам нужен</div>
                  <div className={styles.aiPrompts}>
                    {AI_PROMPTS.map(p => (
                      <button
                        key={p}
                        type="button"
                        className={`${styles.aiPromptChip} ${form.aiPrompt === p ? styles.aiPromptChipActive : ''}`}
                        onClick={() => set('aiPrompt', form.aiPrompt === p ? '' : p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={styles.textarea}
                    placeholder="Или напишите свой запрос..."
                    value={form.aiPrompt}
                    onChange={e => set('aiPrompt', e.target.value)}
                    rows={2}
                    maxLength={300}
                  />
                </div>
              )}

              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step > 0 ? (
            <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>← Назад</button>
          ) : (
            <button className={styles.backBtn} onClick={onClose}>Отмена</button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              className={styles.nextBtn}
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
            >
              Далее →
            </button>
          ) : (
            <button
              className={styles.submitBtn}
              onClick={() => handleCreate(form.useAI)}
              disabled={loading || form.useAI === null}
            >
              {loading
                ? (form.useAI ? '✨ Подбираем места...' : 'Создаём...')
                : form.useAI ? '✨ Создать с AI' : '📋 Создать поездку'
              }
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

function pluralizeDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'день'
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return 'дня'
  return 'дней'
}

function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}