import styles from './AuthSelect.module.css';

export default function AuthSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
}) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.error : ''}`}
      >
        
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
