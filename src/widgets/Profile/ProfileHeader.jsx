import { useState } from 'react';
import UserCard from '../../entities/user/ui/UserCard';
import EditProfileModal from '../../features/edit-profile/ui/EditProfileModal';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ user, onUserUpdate, isOwnProfile = true }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const getMissingFields = () => {
    const missing = [];
    const isPersonal = user?.accountType === 0;
    const isBusiness = user?.accountType === 1;
    
    if (!user?.name) missing.push('Имя');
    if (!user?.bio) missing.push('Описание');
    if (!user?.country) missing.push('Страна');
    if (!user?.city) missing.push('Город');
    if (!user?.profilePicture) missing.push('Фото профиля');

    if (isPersonal) {
      if (user?.travelInterest === null || user?.travelInterest === undefined) {
        missing.push('Интересы в путешествиях');
      }
      if (user?.travelStyle === null || user?.travelStyle === undefined) {
        missing.push('Стиль путешествий');
      }
    }

    if (isBusiness) {
      if (user?.businessType === null || user?.businessType === undefined) {
        missing.push('Тип бизнеса');
      }
      if (!user?.businessAddress) missing.push('Адрес');
      if (!user?.businessWebsite) missing.push('Веб-сайт');
      if (!user?.businessPhone) missing.push('Телефон');
    }

    return missing;
  };

  const missingFields = getMissingFields();
  const profileComplete = missingFields.length === 0;

  const handleUpdateSuccess = (updatedUser) => {
    onUserUpdate(updatedUser);
    setIsEditModalOpen(false);
  };

  // Calculate stats (можно заменить на реальные данные из API)
  const stats = {
    countries: 24,
    trips: 8,
    followers: 100,
    following: 12
  };

  return (
    <div className={styles.header}>
      <UserCard
        user={user}
        onUserUpdate={onUserUpdate}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditModalOpen(true)}
        stats={stats}
      />

      {/* Profile Incomplete Warning */}
      {!profileComplete && isOwnProfile && (
        <div className={styles.incompleteWarning}>
          <WarningIcon />
          <div>
            <strong>Профиль не заполнен</strong>
            <p className={styles.missingFields}>
              Не хватает: {missingFields.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}

// Icon
function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}