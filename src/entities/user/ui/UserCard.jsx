import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadAvatarModal from '../../../features/edit-profile/ui/UploadAvatarModal';
import BannerModal from '../../../features/edit-profile/ui/BannerModal';
import styles from './UserCard.module.css';
import { BANNER_PRESETS } from '../../../shared/constants/bannerPresets';

const TravelInterestLabel = {
  0: '🌿 Природа', 1: '🍜 Еда', 2: '🧗 Приключения',
  3: '🏛 Культура', 4: '🌆 Городская жизнь', 5: '🌴 Релакс', 6: '📷 Фотография'
};
const TravelStyleLabel = {
  0: '🍽 Гурман', 1: '🎭 Культурный исследователь', 2: '💻 Цифровой кочевник',
  3: '🎒 Бэкпэкер', 4: '✨ Люкс путешественник', 5: '🐢 Slow traveler', 6: '⚡ Искатель приключений'
};

export default function UserCard({
  user,
  onUserUpdate,
  isOwnProfile = true,
  onEditClick,
  onMessageClick,
  followButton,          
  stats = { countries: 0, trips: 0, followers: 0, following: 0 }
}) {
  const navigate = useNavigate();
  const [isUploadAvatarOpen, setIsUploadAvatarOpen] = useState(false);
  const [isUploadBannerOpen, setIsUploadBannerOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isBusiness = user?.accountType === 1;
  const isPersonal  = user?.accountType === 0;

  const handleAvatarSuccess = (url) => onUserUpdate?.({ ...user, profilePicture: url });
  const handleBannerSuccess = (result) => {
    if (!result) {
      onUserUpdate?.({ ...user, bannerImage: null, bannerPreset: null });
    } else if (typeof result === 'string') {
      onUserUpdate?.({ ...user, bannerImage: result, bannerPreset: null });
    } else if (result.preset) {
      onUserUpdate?.({ ...user, bannerImage: null, bannerPreset: result.preset, bannerCss: result.css });
    }
  };
  const bannerCss = user?.bannerCss 
  ?? (user?.bannerPreset ? BANNER_PRESETS.find(p => p.id === user.bannerPreset)?.css : null);

  const tags = [];
  if (isPersonal) {
    if (user?.travelInterest != null) tags.push(TravelInterestLabel[user.travelInterest]);
    if (user?.travelStyle    != null) tags.push(TravelStyleLabel[user.travelStyle]);
  }

  return (
    <div className={styles.card}>

      {/* ── Banner ── */}
      <div
        className={`${styles.banner} ${isOwnProfile ? styles.clickableBanner : ''}`}
        onClick={() => isOwnProfile && setIsUploadBannerOpen(true)}
      >
        {user?.bannerImage
          ? <img src={user.bannerImage} alt="Banner" className={styles.bannerImage} />
          : bannerCss
          ? <div className={styles.bannerImage} style={{ background: bannerCss }} />
          : <div className={styles.defaultBanner} />}
        {isOwnProfile && (
          <div className={styles.bannerOverlay}>
            <CameraIcon /><span>Изменить обложку</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>

        {/* Profile row */}
        <div className={styles.profileRow}>

          {/* Avatar */}
          <div className={styles.avatarWrap}>
            <div
              className={`${styles.avatarContainer} ${isOwnProfile ? styles.clickable : ''}`}
              onClick={() => isOwnProfile && setIsUploadAvatarOpen(true)}
            >
              {user?.profilePicture
                ? <img src={user.profilePicture} alt={user.name} className={styles.avatar} />
                : <div className={styles.avatarFallback}>{initials}</div>}
              {isOwnProfile && <div className={styles.avatarOverlay}><CameraIcon /></div>}
            </div>
            {isBusiness && (
              <div className={styles.businessBadge} title="Бизнес аккаунт">
                <BusinessBadgeIcon />
              </div>
            )}
          </div>

          {/* Name + actions */}
          <div className={styles.mainInfo}>
            <div className={styles.nameBlock}>
              <h1 className={styles.name}>{user?.name || 'Без имени'}</h1>
              <p className={styles.username}>@{user?.username}</p>
            </div>

            <div className={styles.actionButtons}>
              {isOwnProfile && onEditClick && (
                <button className={styles.editBtn} onClick={onEditClick}>
                  <EditIcon /> Редактировать
                </button>
              )}
              {!isOwnProfile && (
                <>
                  <button className={styles.messageBtn} onClick={onMessageClick}>
                    <MessageIcon /> Сообщение
                  </button>
                  {followButton}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio + tags */}
        {(user?.bio || tags.length > 0) && (
          <div className={styles.bioInline}>
            {user?.bio && <p className={styles.bioText}>{user.bio}</p>}
            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            )}
          </div>
        )}

        {/* Business info */}
        {isBusiness && (user?.businessAddress || user?.businessPhone || user?.businessWebsite) && (
          <div className={styles.businessInfo}>
            {user.businessAddress && (
              <span className={styles.businessItem}>
                <LocationIcon /> {user.businessAddress}
              </span>
            )}
            {user.businessPhone && (
              <span className={styles.businessItem}>
                <PhoneIcon /> {user.businessPhone}
              </span>
            )}
            {user.businessWebsite && (
              <a
                href={user.businessWebsite.startsWith('http') ? user.businessWebsite : `https://${user.businessWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.businessItem}
              >
                <WebIcon /> {user.businessWebsite}
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsDivider} />
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.countries}</span>
            <span className={styles.statLabel}>Countries</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.trips}</span>
            <span className={styles.statLabel}>Trips</span>
          </div>
          <div
            className={styles.stat}
            onClick={() => navigate(`/users/${user?.userId}/followers`)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.statValue}>{stats.followers}</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div
            className={styles.stat}
            onClick={() => navigate(`/users/${user?.userId}/following`)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.statValue}>{stats.following}</span>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <>
          <UploadAvatarModal
            isOpen={isUploadAvatarOpen}
            onClose={() => setIsUploadAvatarOpen(false)}
            onSuccess={handleAvatarSuccess}
          />
          <BannerModal
            isOpen={isUploadBannerOpen}
            onClose={() => setIsUploadBannerOpen(false)}
            onSuccess={handleBannerSuccess}
            currentBanner={user?.bannerImage ?? user?.bannerPreset ?? null}
            accountType={user?.accountType}
          />
        </>
      )}
    </div>
  );
}

function CameraIcon()        { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>; }
function EditIcon()          { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function BusinessBadgeIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function MessageIcon()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }

function LocationIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function PhoneIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function WebIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}