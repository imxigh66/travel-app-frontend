import styles from './Button.module.css';

export default function Button({ children,variant='primary', onClick }) {
    return (
        <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
            {children}
        </button>
    )
}