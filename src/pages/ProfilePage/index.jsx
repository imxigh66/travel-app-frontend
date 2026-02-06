import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../features/profile/api/userApi';
import ProfileHeader from '../../features/profile/ui/ProfileHeader';
import ProfileTabs from '../../features/profile/ui/ProfileTabs';
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


  const handleUserUpdate = (updatedUser) => {
    console.log('User updated:', updatedUser);
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
       <ProfileHeader 
        user={user} 
        onUserUpdate={handleUserUpdate}  
        isOwnProfile={true}
      />
      <ProfileTabs />
    </div>
  );
}