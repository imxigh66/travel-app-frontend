import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
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
      
      <div className={`${styles.inputWrapper} ${error ? styles.error : ''}`}>
        {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
        
        <input
          ref={ref}
          className={`${styles.input} ${className}`}
          {...props}
        />
        
        {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
      </div>
      
      {error && <span className={styles.errorText}>{error}</span>}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;