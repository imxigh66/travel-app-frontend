import styles from './SearchInput.module.css'

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Город, место или категория…',
}) {
  return (
    <div className={styles.wrap}>
      <svg className={styles.ico} width="17" height="17" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        className={styles.input}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch?.()}
      />

      <button className={styles.btn} onClick={onSearch} aria-label="Поиск">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  )
}
