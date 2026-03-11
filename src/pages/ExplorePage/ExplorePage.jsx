import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlacesCarousel } from '../../widgets/PlacesCarousel'
import { categoryTagApi } from '../../entities/place/model/categoryTag.api'
import styles from './ExplorePage.module.css'

const MOODS = [
  { key: 'WithCompany',  emoji: '👫', label: 'С компанией' },
  { key: 'Solo',         emoji: '🧘', label: 'Один' },
  { key: 'WithFamily',   emoji: '👨‍👩‍👧', label: 'С семьёй' },
  { key: 'RomanticDate', emoji: '💑', label: 'Вдвоём' },
  { key: 'Special',      emoji: '🔥', label: 'Особенное' },
  { key: 'Calm',         emoji: '😌', label: 'Спокойно' },
  { key: 'Active',       emoji: '⚡', label: 'Активно' },
  { key: 'NightOut',     emoji: '🌙', label: 'Вечер' },
  { key: 'Surprise',     emoji: '🎲', label: 'Удиви меня' },
]

const INTERESTS = [
  { value: null, emoji: '🌍', label: 'Все места' },
  { value: 0,    emoji: '🍜', label: 'Еда' },
  { value: 3,    emoji: '🏔️', label: 'Природа' },
  { value: 2,    emoji: '🏛️', label: 'Культура' },
  { value: 4,    emoji: '🎭', label: 'Развлечения' },
  { value: 1,    emoji: '🏨', label: 'Жильё' },
  { value: 5,    emoji: '🛍️', label: 'Шопинг' },
]

export function ExplorePage() {
  const navigate = useNavigate()
  const [selectedMoods, setSelectedMoods] = useState([])
  const [tags, setTags] = useState([])

  useEffect(() => {
    categoryTagApi.getAll().then(setTags).catch(() => {})
  }, [])

  const toggleMood = (key) => {
    setSelectedMoods(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    )
  }

  const handleMoodSearch = () => {
    if (!selectedMoods.length) return
    navigate(`/places?moods=${selectedMoods.join(',')}`)
  }

  const handleInterest = (value) => {
    if (value == null) navigate('/places')
    else navigate(`/places?category=${value}`)
  }

  const handleTag = (tagId) => {
    navigate(`/places?categoryTagId=${tagId}`)
  }

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>✦ Открывай мир</div>
        <h1 className={styles.heading}>
          Куда отправимся <em>сегодня?</em>
        </h1>
        <p className={styles.sub}>
          Находи места по настроению, интересам и стилю путешествия
        </p>
      </section>

      {/* ── НАСТРОЕНИЯ ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Какое настроение?</div>
          {selectedMoods.length > 0 && (
            <button className={styles.goBtn} onClick={handleMoodSearch}>
              Найти места →
            </button>
          )}
        </div>

        {selectedMoods.length > 0 && (
          <div className={styles.selectedHint}>
            Выбрано: {selectedMoods.map(k => MOODS.find(m => m.key === k)?.emoji).join(' ')}
          </div>
        )}

        <div className={styles.moodGrid}>
          {MOODS.map(item => (
            <div
              key={item.key}
              className={`${styles.moodCard} ${selectedMoods.includes(item.key) ? styles.moodActive : ''}`}
              onClick={() => toggleMood(item.key)}
            >
              <span className={styles.moodLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── ИНТЕРЕСЫ ── */}
      <section className={styles.section}>
        <div className={styles.sectionTitle} style={{ marginBottom: 14 }}>По интересам</div>
        <div className={styles.chips}>
          {INTERESTS.map((item, i) => (
            <button key={i} className={styles.chip} onClick={() => handleInterest(item.value)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* ── КАРУСЕЛИ ПО ТЕГАМ ── */}
      {tags.map(tag => (
        <section key={tag.categoryTagId} className={styles.section}>
          <PlacesCarousel
            title={tag.name}
            emoji={tag.icon}
            categoryTagId={tag.categoryTagId}
            onSeeAll={() => handleTag(tag.categoryTagId)}
          />
        </section>
      ))}

    </div>
  )
}