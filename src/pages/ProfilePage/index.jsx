import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCurrentUser, getUserById } from '../../entities/user/api/userApi';
import { followApi } from '../../entities/follow/model/follow.api';
import ProfileHeader from '../../widgets/Profile/ProfileHeader';
import ProfileTabs from '../../widgets/Profile/ProfileTabs';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { id } = useParams() // undefined на /profile, число на /users/:id
  

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)  

  const isOwnProfile = !id || (currentUserId !== null && Number(id) === currentUserId)
  useEffect(() => {
    loadUser();
  }, [id]);

const loadUser = async () => {
  setLoading(true)
  try {
    if (!id) {
      const result = await getCurrentUser()
      if (result.success) setUser(result.data)
      else setError(result.error)
    } else {
      const [meResult, userResult, following] = await Promise.all([
        getCurrentUser(),                                       
        getUserById(id),
        followApi.isFollowing(Number(id)).catch(() => false)
      ])

      if (meResult.success) setCurrentUserId(meResult.data.userId)
if (userResult.success) setUser(userResult.data)      // ← добавь
else setError(userResult.error ?? 'Не удалось загрузить профиль')

      setIsFollowing(following)  
    }
  } catch (e) {
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
      user={user}                   
      onUserUpdate={handleUserUpdate} 
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}   
    />
    <ProfileTabs
      currentUser={user}
      userId={user?.userId}          
      isOwnProfile={isOwnProfile}    
    />
  </div>
);
}