import styles from './UserAvatar.module.css';

export default function UserAvatar({ 
  user, 
  size = 'medium', 
  onClick,
  showOnlineStatus = false 
}) {
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size];

  return (
    <div 
      className={`${styles.avatar} ${sizeClass} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      title={user?.name || 'User'}
    >
      {user?.profilePicture ? (
        <img 
          src={user.profilePicture} 
          alt={user.name} 
          className={styles.image}
        />
      ) : (
        <div className={styles.fallback}>
          {initials}
        </div>
      )}
      
      {showOnlineStatus && (
        <div className={styles.onlineIndicator} />
      )}
    </div>
  );
}