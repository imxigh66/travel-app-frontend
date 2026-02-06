import { forwardRef } from 'react';
import styles from './Textarea.module.css';

const Textarea = forwardRef(({
  label,
  error,
  hint,
  showCount = false,
  maxLength,
  fullWidth = false,
  className = '',
  value = '',
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
      
      <textarea
        ref={ref}
        className={`${styles.textarea} ${error ? styles.error : ''} ${className}`}
        maxLength={maxLength}
        value={value}
        {...props}
      />
      
      {showCount && maxLength && (
        <div className={styles.count}>
          {value.length}/{maxLength}
        </div>
      )}
      
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;