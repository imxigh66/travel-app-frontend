import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../shared/api/userApi';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const result = await getCurrentUser();

    if (result.success) {
      setUser(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>⚠️ Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.profilePage}>
      {/* Шапка профиля */}
      <div className={styles.header}>
        <img 
          src={user.profilePicture || 'https://via.placeholder.com/150'}
          alt={user.name}
          className={styles.avatar}
        />
        
        <div className={styles.info}>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.username}>@{user.username}</p>
          <p className={styles.email}>{user.email}</p>
          
          {user.bio && (
            <p className={styles.bio}>{user.bio}</p>
          )}
          
          <p className={styles.joined}>
            📅 Присоединился: {new Date(user.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <button className={styles.editBtn}>
          ✏️ Редактировать профиль
        </button>
      </div>

      {/* Контент (пока пусто) */}
      <div className={styles.content}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.active}`}>
            📝 Посты
          </button>
          <button className={styles.tab}>
            📷 Фото
          </button>
        </div>

        <div className={styles.emptyState}>
          <p>Постов пока нет</p>
        </div>
      </div>
    </div>
  );
}