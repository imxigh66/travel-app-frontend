import styles from './AuthButton.module.css';

export default function AuthButton({ children, variant = 'primary', onClick, type = 'button', disabled }) {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`} 
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}