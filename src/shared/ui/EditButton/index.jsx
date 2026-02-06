
import styles from './Button.module.css';

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        ${styles.button} 
        ${styles[variant]} 
        ${styles[size]} 
        ${fullWidth ? styles.fullWidth : ''}
        ${isLoading ? styles.loading : ''}
        ${className}
      `.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}
      {!isLoading && leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </button>
  );
}