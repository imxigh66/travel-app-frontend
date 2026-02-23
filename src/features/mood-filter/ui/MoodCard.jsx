import styles from './MoodCard.module.css'

export function MoodCard({ emoji, label, active, onClick }) {
  return (
    <div
      className={`${styles.card} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}