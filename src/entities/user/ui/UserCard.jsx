import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UploadAvatarModal from '../../../features/edit-profile/ui/UploadAvatarModal';
import BannerModal from '../../../features/edit-profile/ui/BannerModal';
import styles from './UserCard.module.css';
import { BANNER_PRESETS } from '../../../shared/constants/bannerPresets';

const INTEREST_ICONS = {
  0: NatureTagIcon, 1: FoodTagIcon, 2: MountainTagIcon,
  3: LandmarkTagIcon, 4: CityTagIcon, 5: SunTagIcon, 6: PhotoTagIcon,
};
const INTEREST_KEYS = {
  0: 'travelInterests.nature', 1: 'travelInterests.food', 2: 'travelInterests.adventure',
  3: 'travelInterests.culture', 4: 'travelInterests.cityLife', 5: 'travelInterests.relax',
  6: 'travelInterests.photography',
};
const STYLE_ICONS = {
  0: FoodTagIcon, 1: BookTagIcon, 2: LaptopTagIcon,
  3: BackpackTagIcon, 4: StarTagIcon, 5: ClockTagIcon, 6: ZapTagIcon,
};
const STYLE_KEYS = {
  0: 'travelStyles.foodSeeker', 1: 'travelStyles.cultureExplorer', 2: 'travelStyles.digitalNomad',
  3: 'travelStyles.backpacker', 4: 'travelStyles.luxuryTraveler', 5: 'travelStyles.slowTraveler',
  6: 'travelStyles.adventurer',
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
  const { t } = useTranslation();
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
    const interestIcon = INTEREST_ICONS[user?.travelInterest];
    const interestKey  = INTEREST_KEYS[user?.travelInterest];
    const styleIcon    = STYLE_ICONS[user?.travelStyle];
    const styleKey     = STYLE_KEYS[user?.travelStyle];
    if (interestIcon && interestKey) tags.push({ Icon: interestIcon, label: t(interestKey) });
    if (styleIcon && styleKey)       tags.push({ Icon: styleIcon,    label: t(styleKey) });
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
            <CameraIcon /><span>{t('userCard.changeCover')}</span>
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
              <div className={styles.businessBadge} title={t('userCard.businessAccount')}>
                <BusinessBadgeIcon />
              </div>
            )}
          </div>

          {/* Name + actions */}
          <div className={styles.mainInfo}>
            <div className={styles.nameBlock}>
              <h1 className={styles.name}>{user?.name || t('userCard.noName')}</h1>
              <p className={styles.username}>@{user?.username}</p>
            </div>

            <div className={styles.actionButtons}>
              {isOwnProfile && onEditClick && (
                <button className={styles.editBtn} onClick={onEditClick}>
                  <EditIcon /> {t('userCard.edit')}
                </button>
              )}
              {!isOwnProfile && (
                <>
                  <button className={styles.messageBtn} onClick={onMessageClick}>
                    <MessageIcon /> {t('userCard.message')}
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
                {tags.map((tag, i) => (
                <span key={i} className={styles.tag}>
                  <tag.Icon />{tag.label}
                </span>
              ))}
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
            <span className={styles.statLabel}>{t('userCard.countries')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{stats.trips}</span>
            <span className={styles.statLabel}>{t('userCard.trips')}</span>
          </div>
          <div
            className={styles.stat}
            onClick={() => navigate(`/users/${user?.userId}/followers`)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.statValue}>{stats.followers}</span>
            <span className={styles.statLabel}>{t('userCard.followers')}</span>
          </div>
          <div
            className={styles.stat}
            onClick={() => navigate(`/users/${user?.userId}/following`)}
            style={{ cursor: 'pointer' }}
          >
            <span className={styles.statValue}>{stats.following}</span>
            <span className={styles.statLabel}>{t('userCard.following')}</span>
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

// ── Tag icons (monochrome SVG) ────────────────────────────────────────────────
function NatureTagIcon()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>; }
function FoodTagIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>; }
function MountainTagIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>; }
function LandmarkTagIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>; }
function CityTagIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function SunTagIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function PhotoTagIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>; }
function BookTagIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>; }
function LaptopTagIcon()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 20h20"/></svg>; }
function BackpackTagIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>; }
function StarTagIcon()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>; }
function ClockTagIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function ZapTagIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>; }

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