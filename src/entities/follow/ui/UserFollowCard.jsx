import { useNavigate } from 'react-router-dom'
import FollowButton from '../../../features/follow/FollowButton'
import styles from './UserFollowCard.module.css'

export function UserFollowCard({ user }) {
  const navigate = useNavigate()

  return (
    <div className={styles.card} onClick={() => navigate(`/users/${user.userId}`)}>
      {/* Аватар */}
      <div className={styles.avatar}>
        {user.profilePicture ? (
          <img src={user.profilePicture} alt={user.name} />
        ) : (
          <span>{user.name?.[0]?.toUpperCase() ?? '?'}</span>
        )}
      </div>

      {/* Инфо */}
      <div className={styles.info}>
        <div className={styles.name}>{user.name}</div>
        <div className={styles.username}>@{user.username}</div>
        {user.bio && <div className={styles.bio}>{user.bio}</div>}
      </div>

      {/* Кнопка */}
      <div onClick={e => e.stopPropagation()}>
        <FollowButton
          userId={user.userId}
          serverFollowing={user.isFollowing}
          size="sm"
        />
      </div>
    </div>
  )
}