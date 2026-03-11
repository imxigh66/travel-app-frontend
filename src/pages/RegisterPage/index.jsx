import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../features/auth/register/ui/RegisterForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/')}>
        ← На главную
      </button>

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </span>
          <span className={styles.logoText}>TravelFlow</span>
        </div>

        <h1 className={styles.title}>Join TravelFlow</h1>
        <p className={styles.subtitle}>Start your journey with fellow travelers</p>

        <RegisterForm />
      </div>
    </div>
  );
}