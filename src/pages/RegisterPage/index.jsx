import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../../features/auth/register/ui/RegisterForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [currentStep] = useState(1);

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className={styles.container}>
        <h1 className={styles.title}>Join TravelFlow</h1>
        <p className={styles.subtitle}>Start your journey with fellow travelers</p>

      

        <div className={styles.formContainer}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}