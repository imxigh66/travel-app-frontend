import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCurrentUser, getUserById } from '../../entities/user/api/userApi';
import { followApi } from '../../entities/follow/model/follow.api';
import ProfileHeader from '../../widgets/Profile/ProfileHeader';
import ProfileTabs from '../../widgets/Profile/ProfileTabs';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { id } = useParams() // undefined на /profile, число на /users/:id
  const isOwnProfile = !id

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    loadUser();
  }, [id]);


const loadUser = async () => {
  setLoading(true)
  try {
    if (isOwnProfile) {
      const result = await getCurrentUser()
      console.log('getCurrentUser result:', result)  // ← добавь
      if (result.success) setUser(result.data)
      else setError(result.error)
    } else {
      console.log('Loading user id:', id)  // ← добавь
      const [userResult, following] = await Promise.all([
        getUserById(id),
        followApi.isFollowing(Number(id)).catch(() => false)
      ])
      console.log('getUserById result:', userResult)  // ← добавь
      if (userResult.success) setUser(userResult.data)
      else setError(userResult.error ?? 'Не удалось загрузить профиль')
    }
  } catch (e) {
    console.error('loadUser error:', e)  // ← добавь
    setError('Не удалось загрузить профиль')
  } finally {
    setLoading(false)
  }
}


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
      user={user}                    // ← было currentUser
      onUserUpdate={handleUserUpdate} // ← не передавался
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}      // ← не передавался
    />
    <ProfileTabs
      currentUser={user}
      userId={user?.userId}          // ← не передавался
      isOwnProfile={isOwnProfile}    // ← не передавался
    />
  </div>
);
}