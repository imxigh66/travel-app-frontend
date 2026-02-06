import { forwardRef } from 'react';
import styles from './Select.module.css';

const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Выберите...',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={`${styles.selectWrapper} ${error ? styles.error : ''}`}>
        <select
          ref={ref}
          className={`${styles.select} ${className}`}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <span className={styles.arrow}>
          <ChevronDownIcon />
        </span>
      </div>
      
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}