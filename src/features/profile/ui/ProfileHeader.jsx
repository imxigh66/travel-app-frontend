// widgets/ProfileHeader/ProfileHeader.jsx
import { useState } from 'react';
import EditProfileModal from '../../../features/profile/ui/EditProfileModal';
import styles from './ProfileHeader.module.css';

const TravelInterest = {
  0: 'Природа',
  1: 'Еда',
  2: 'Приключения',
  3: 'Культура',
  4: 'Городская жизнь',
  5: 'Релакс',
  6: 'Фотография'
};

const TravelStyle = {
  0: 'Гурман',
  1: 'Культурный исследователь',
  2: 'Цифровой кочевник',
  3: 'Бэкпэкер',
  4: 'Люкс путешественник',
  5: 'Медленный путешественник',
  6: 'Искатель приключений'
};

const BusinessType = {
  0: 'Отель',
  1: 'Ресторан',
  2: 'Кафе',
  3: 'Турагентство',
  4: 'Туроператор',
  5: 'Коворкинг',
  6: 'Местный гид',
  7: 'Провайдер впечатлений'
};

export default function ProfileHeader({ user, onUserUpdate, isOwnProfile = true }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isPersonal = user.accountType === 0;
  const isBusiness = user.accountType === 1;

  const getMissingFields = () => {
    const missing = [];
    
    if (!user.name) missing.push('Имя');
    if (!user.bio) missing.push('Описание');
    if (!user.country) missing.push('Страна');
    if (!user.city) missing.push('Город');
    if (!user.profilePicture) missing.push('Фото профиля');

    if (isPersonal) {
      if (user.travelInterest === null || user.travelInterest === undefined) {
        missing.push('Интересы в путешествиях');
      }
      if (user.travelStyle === null || user.travelStyle === undefined) {
        missing.push('Стиль путешествий');
      }
    }

    if (isBusiness) {
      if (user.businessType === null || user.businessType === undefined) {
        missing.push('Тип бизнеса');
      }
      if (!user.businessAddress) missing.push('Адрес');
      if (!user.businessWebsite) missing.push('Веб-сайт');
      if (!user.businessPhone) missing.push('Телефон');
    }

    return missing;
  };

  const missingFields = getMissingFields();
  const profileComplete = missingFields.length === 0;

  const handleUpdateSuccess = (updatedUser) => {
    onUserUpdate(updatedUser);
    setIsEditModalOpen(false);
  };

  return (
    <div className={styles.header}>
      <div className={styles.banner} />

      <div className={styles.content}>
        {/* Аватар */}
        <div className={styles.avatarWrap}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{initials}</div>
          )}
          
          {isBusiness && (
            <div className={styles.businessBadge} title="Бизнес аккаунт">
              <BusinessBadgeIcon />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h1 className={styles.name}>{user.name || 'Без имени'}</h1>
            <span className={styles.accountType}>
              {isBusiness ? '🏢 Бизнес' : '👤 Персональный'}
            </span>
          </div>
          
          <p className={styles.username}>@{user.username}</p>
          
          {user.bio && <p className={styles.bio}>{user.bio}</p>}

          {/* Дополнительная информация */}
          <div className={styles.details}>
            {isPersonal && (
              <>
                {user.travelInterest !== null && user.travelInterest !== undefined && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🌍</span>
                    <span className={styles.detailLabel}>Интересы:</span>
                    <span className={styles.detailValue}>
                      {TravelInterest[user.travelInterest] || 'Не указано'}
                    </span>
                  </div>
                )}
                
                {user.travelStyle !== null && user.travelStyle !== undefined && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>✈️</span>
                    <span className={styles.detailLabel}>Стиль:</span>
                    <span className={styles.detailValue}>
                      {TravelStyle[user.travelStyle] || 'Не указано'}
                    </span>
                  </div>
                )}
              </>
            )}

            {isBusiness && (
              <>
                {user.businessType !== null && user.businessType !== undefined && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🏢</span>
                    <span className={styles.detailLabel}>Тип:</span>
                    <span className={styles.detailValue}>
                      {BusinessType[user.businessType] || 'Не указано'}
                    </span>
                  </div>
                )}
                
                {user.businessAddress && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📍</span>
                    <span className={styles.detailLabel}>Адрес:</span>
                    <span className={styles.detailValue}>{user.businessAddress}</span>
                  </div>
                )}
                
                {user.businessWebsite && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>🌐</span>
                    <span className={styles.detailLabel}>Сайт:</span>
                    <a 
                      href={user.businessWebsite.startsWith('http') ? user.businessWebsite : `https://${user.businessWebsite}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.detailLink}
                    >
                      {user.businessWebsite}
                    </a>
                  </div>
                )}
                
                {user.businessPhone && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📞</span>
                    <span className={styles.detailLabel}>Телефон:</span>
                    <a href={`tel:${user.businessPhone}`} className={styles.detailLink}>
                      {user.businessPhone}
                    </a>
                  </div>
                )}
              </>
            )}

            {(user.country || user.city) && (
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>🌎</span>
                <span className={styles.detailLabel}>Локация:</span>
                <span className={styles.detailValue}>
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Метаинформация */}
          <p className={styles.meta}>
            <span className={styles.metaItem}>
              <MailIcon /> {user.email}
            </span>
            <span className={styles.metaItem}>
              <CalendarIcon /> Присоединился {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </p>

          {/* Предупреждение о незаполненном профиле */}
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
        </div>

        {/* Кнопка редактирования */}
        {isOwnProfile && (
          <button 
            className={styles.editBtn}
            onClick={() => setIsEditModalOpen(true)}
          >
            <EditIcon />
            Редактировать
          </button>
        )}
      </div>

      {/* Модалка редактирования */}
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

// Icons
function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function BusinessBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm15 0h-3v3h-3v2h3v3h2v-3h3v-2h-2z"/>
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}