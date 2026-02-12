import styles from './UserAvatar.module.css';

export default function UserAvatar({ user, size = 'medium', onClick }) {
  if (!user) {
    return null;
  }

  const sizeClass = styles[size] || styles.medium;
  
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user.username
    ? user.username.slice(0, 2).toUpperCase()
    : '?';

  const handleImageError = (e) => {
    // Если картинка не загрузилась, скрываем img и показываем fallback
    e.target.style.display = 'none';
    const fallback = e.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div 
      className={`${styles.avatar} ${sizeClass} ${onClick ? styles.clickable : ''}`}
      onClick={onClick}
      title={user.name || user.username}
    >
      {user.profilePicture && (
        <img 
          src={user.profilePicture} 
          alt={user.name || user.username} 
          className={styles.image}
          onError={handleImageError}
        />
      )}
      
      <div 
        className={styles.fallback}
        style={{ display: user.profilePicture ? 'none' : 'flex' }}
      >
        {initials}
      </div>
    </div>
  );
}