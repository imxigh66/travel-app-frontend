import { useNavigate } from 'react-router-dom';
import LoginForm from '../../features/auth/login/ui/LoginForm';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className={styles.container}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue your journey</p>

        <div className={styles.formContainer}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}