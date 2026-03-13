import { useSearchParams, useNavigate } from 'react-router-dom'
import styles from './EmailConfirmedPage.module.css'

export default function EmailConfirmedPage() {
  const [params] = useSearchParams()
  const navigate  = useNavigate()
  const success   = params.get('success') === 'true'

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>{success ? '✅' : '❌'}</div>

        <h1 className={styles.title}>
          {success ? 'Email подтверждён!' : 'Ссылка недействительна'}
        </h1>

        <p className={styles.subtitle}>
          {success
            ? 'Твой аккаунт активирован. Можешь войти и начать путешествовать 🌍'
            : 'Ссылка истекла или уже была использована. Попробуй зарегистрироваться заново.'}
        </p>

        <button
          className={styles.btn}
          onClick={() => navigate(success ? '/login' : '/register')}
        >
          {success ? 'Войти в аккаунт' : 'Зарегистрироваться'}
        </button>
      </div>
    </div>
  )
}