import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../../entities/user/ui/UserCard';
import EditProfileModal from '../../features/edit-profile/ui/EditProfileModal';
import FollowButton from '../../features/follow/FollowButton';
import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ user, onUserUpdate, isOwnProfile = true, isFollowing = false }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const getMissingFields = () => {
    const missing = [];
    const isPersonal = user?.accountType === 0;
    const isBusiness = user?.accountType === 1;
    if (!user?.name)           missing.push('Имя');
    if (!user?.bio)            missing.push('Описание');
    if (!user?.country)        missing.push('Страна');
    if (!user?.profilePicture) missing.push('Фото профиля');
    if (isPersonal) {
      if (user?.travelInterest == null) missing.push('Интересы');
      if (user?.travelStyle    == null) missing.push('Стиль путешествий');
    }
    if (isBusiness) {
      if (user?.businessType    == null) missing.push('Тип бизнеса');
      if (!user?.businessAddress)        missing.push('Адрес');
    }
    return missing;
  };

  const missingFields = getMissingFields();

  const stats = {
    countries: 24,
    trips: 8,
    followers: user?.followersCount ?? 0,
    following: user?.followingCount ?? 0,
  };

  return (
    <div className={styles.header}>
      <UserCard
        user={user}
        onUserUpdate={onUserUpdate}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditModalOpen(true)}
        onMessageClick={() => navigate(`/messages?user=${user.userId}`)}
        followButton={
          <FollowButton
            userId={user?.userId}
            serverFollowing={isFollowing}
            size="md"
          />
        }
        stats={stats}
      />

      {/* Незаполненный профиль */}
      {missingFields.length > 0 && isOwnProfile && (
        <div className={styles.incompleteWarning}>
          <WarningIcon />
          <div>
            <strong>Профиль не заполнен</strong>
            <p className={styles.missingFields}>Не хватает: {missingFields.join(', ')}</p>
          </div>
        </div>
      )}

      {isOwnProfile && user && (
        <EditProfileModal
          user={user}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(u) => { onUserUpdate(u); setIsEditModalOpen(false); }}
        />
      )}
    </div>
  );
}

function WarningIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}