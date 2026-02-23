import { useState } from 'react'
import { MOOD_WHO, MOOD_VIBE } from '../model/mood.config'
import { MoodCard } from './MoodCard'
import styles from './MoodSelector.module.css'

export function MoodSelector({ onChange }) {
  const [selectedWho, setSelectedWho]   = useState(null)
  const [selectedVibe, setSelectedVibe] = useState(null)

  const handleWho = (mood) => {
    const next = selectedWho === mood ? null : mood
    setSelectedWho(next)
    onChange?.({ who: next, vibe: selectedVibe })
  }

  const handleVibe = (mood) => {
    const next = selectedVibe === mood ? null : mood
    setSelectedVibe(next)
    onChange?.({ who: selectedWho, vibe: next })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <div className={styles.label}>С кем?</div>
        <div className={styles.grid}>
          {MOOD_WHO.map(item => (
            <MoodCard
              key={item.mood}
              emoji={item.emoji}
              label={item.label}
              active={selectedWho === item.mood}
              onClick={() => handleWho(item.mood)}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Настроение?</div>
        <div className={styles.grid}>
          {MOOD_VIBE.map(item => (
            <MoodCard
              key={item.mood}
              emoji={item.emoji}
              label={item.label}
              active={selectedVibe === item.mood}
              onClick={() => handleVibe(item.mood)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}