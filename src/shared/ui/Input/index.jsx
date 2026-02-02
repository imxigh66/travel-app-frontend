import styles from './Input.module.css';

export default function Input({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange,
  error,
  ...props 
}) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}