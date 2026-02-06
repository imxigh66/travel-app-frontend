import styles from './ProfileHeader.module.css';

export default function ProfileHeader({ user }) {
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={styles.header}>
      <div className={styles.banner} />

      <div className={styles.content}>
        <div className={styles.avatarWrap}>
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarFallback}>{initials}</div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.username}>@{user.username}</p>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
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
        </div>

        <button className={styles.editBtn}>
          <EditIcon />
          Редактировать
        </button>
      </div>
    </div>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}