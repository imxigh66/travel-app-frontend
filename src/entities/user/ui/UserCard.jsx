// shared/ui/UserCard/UserCard.jsx
import { useState } from 'react';
import UploadAvatarModal from '../../../features/edit-profile/ui/UploadAvatarModal';
import UploadBannerModal from '../../../features/edit-profile/ui/Uploadbannermodal';
import styles from './UserCard.module.css';

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

export default function UserCard({ 
  user, 
  onUserUpdate, 
  isOwnProfile = true,
  onEditClick,
  stats = { countries: 24, trips: 8, followers: 100, following: 12 }
}) {
  const [isUploadAvatarOpen, setIsUploadAvatarOpen] = useState(false);
  const [isUploadBannerOpen, setIsUploadBannerOpen] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isPersonal = user?.accountType === 0;
  const isBusiness = user?.accountType === 1;

  const handleAvatarUploadSuccess = (newAvatarUrl) => {
    if (onUserUpdate) {
      const updatedUser = {
        ...user,
        profilePicture: newAvatarUrl
      };
      onUserUpdate(updatedUser);
    }
  };

  const handleBannerUploadSuccess = (newBannerUrl) => {
    if (onUserUpdate) {
      const updatedUser = {
        ...user,
        bannerImage: newBannerUrl
      };
      onUserUpdate(updatedUser);
    }
  };

  return (
    <div className={styles.card}>
      <div 
        className={`${styles.banner} ${isOwnProfile ? styles.clickableBanner : ''}`}
        onClick={() => isOwnProfile && setIsUploadBannerOpen(true)}
      >
        {user?.bannerImage ? (
          <img src={user.bannerImage} alt="Banner" className={styles.bannerImage} />
        ) : (
          <div className={styles.defaultBanner} />
        )}
        
        {isOwnProfile && (
          <div className={styles.bannerOverlay}>
            <CameraIcon />
            <span>Изменить обложку</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.profileRow}>
          <div className={styles.avatarWrap}>
            <div 
              className={`${styles.avatarContainer} ${isOwnProfile ? styles.clickable : ''}`}
              onClick={() => isOwnProfile && setIsUploadAvatarOpen(true)}
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>{initials}</div>
              )}
              
              {isOwnProfile && (
                <div className={styles.avatarOverlay}>
                  <CameraIcon />
                </div>
              )}
            </div>
            
            {isBusiness && (
              <div className={styles.businessBadge} title="Бизнес аккаунт">
                <BusinessBadgeIcon />
              </div>
            )}
          </div>

          <div className={styles.mainInfo}>
            <div className={styles.topRow}>
              <div>
                <h1 className={styles.name}>{user?.name || 'Без имени'}</h1>
                <p className={styles.username}>@{user?.username}</p>
              </div>

              {isOwnProfile && onEditClick && (
                <button 
                  className={styles.editBtn}
                  onClick={onEditClick}
                >
                  <EditIcon />
                  Редактировать
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.countries}</span>
            <span className={styles.statLabel}>Conrties visited</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.trips}</span>
            <span className={styles.statLabel}>Total Trips</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.followers}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.following}</span>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>

        <button 
          className={styles.toggleDetails}
          onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
        >
          <ChevronIcon rotated={isDetailsExpanded} />
          <span>{isDetailsExpanded ? 'Скрыть детали' : 'Показать детали'}</span>
        </button>

        {isDetailsExpanded && (
          <div className={styles.expandedDetails}>
          {user?.bio && (
            <div className={styles.bioSection}>
              <h3 className={styles.sectionTitle}>О себе</h3>
              <p className={styles.bio}>{user.bio}</p>
            </div>
          )}

          <div className={styles.detailsList}>
            {isPersonal && (
              <>
                {user?.travelInterest !== null && user?.travelInterest !== undefined && (
                  <div className={styles.detailItem}>
                    <GlobeIcon />
                    <span className={styles.detailLabel}>Интересы:</span>
                    <span className={styles.detailValue}>
                      {TravelInterest[user.travelInterest] || 'Не указано'}
                    </span>
                  </div>
                )}
                
                {user?.travelStyle !== null && user?.travelStyle !== undefined && (
                  <div className={styles.detailItem}>
                    <PlaneIcon />
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
                {user?.businessType !== null && user?.businessType !== undefined && (
                  <div className={styles.detailItem}>
                    <BuildingIcon />
                    <span className={styles.detailLabel}>Тип бизнеса:</span>
                    <span className={styles.detailValue}>
                      {BusinessType[user.businessType] || 'Не указано'}
                    </span>
                  </div>
                )}
                
                {user?.businessAddress && (
                  <div className={styles.detailItem}>
                    <MapPinIcon />
                    <span className={styles.detailLabel}>Адрес:</span>
                    <span className={styles.detailValue}>{user.businessAddress}</span>
                  </div>
                )}
                
                {user?.businessWebsite && (
                  <div className={styles.detailItem}>
                    <LinkIcon />
                    <span className={styles.detailLabel}>Веб-сайт:</span>
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
                
                {user?.businessPhone && (
                  <div className={styles.detailItem}>
                    <PhoneIcon />
                    <span className={styles.detailLabel}>Телефон:</span>
                    <a href={`tel:${user.businessPhone}`} className={styles.detailLink}>
                      {user.businessPhone}
                    </a>
                  </div>
                )}
              </>
            )}

            {(user?.country || user?.city) && (
              <div className={styles.detailItem}>
                <LocationIcon />
                <span className={styles.detailLabel}>Локация:</span>
                <span className={styles.detailValue}>
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {user?.email && (
              <div className={styles.detailItem}>
                <MailIcon />
                <span className={styles.detailLabel}>Email:</span>
                <span className={styles.detailValue}>{user.email}</span>
              </div>
            )}

            {user?.createdAt && (
              <div className={styles.detailItem}>
                <CalendarIcon />
                <span className={styles.detailLabel}>Присоединился:</span>
                <span className={styles.detailValue}>
                  {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {isOwnProfile && (
        <>
          <UploadAvatarModal
            isOpen={isUploadAvatarOpen}
            onClose={() => setIsUploadAvatarOpen(false)}
            onSuccess={handleAvatarUploadSuccess}
            currentAvatar={user?.profilePicture}
          />

          <UploadBannerModal
            isOpen={isUploadBannerOpen}
            onClose={() => setIsUploadBannerOpen(false)}
            onSuccess={handleBannerUploadSuccess}
            currentBanner={user?.bannerImage}
          />
        </>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
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

function ChevronIcon({ rotated }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ 
        transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)', 
        transition: 'transform 0.3s' 
      }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M22 4L12 13 2 4"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}