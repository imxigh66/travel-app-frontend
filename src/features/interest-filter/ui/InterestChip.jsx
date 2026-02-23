
import styles from './InterestChip.module.css'

export function InterestChip({ emoji, label, active, onClick }) {
  return (
    <button
      className={`${styles.chip} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  )
}