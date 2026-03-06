import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from '../../../shared/utils/dateUtils'
import styles from './CommentItem.module.css'

export function CommentItem({ comment, currentUserId, onDelete }) {
  const navigate = useNavigate()

  const initials = comment.username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className={styles.item}>
      {/* Аватар */}
      <div
        className={styles.avatar}
        onClick={() => navigate(`/users/${comment.userId}`)}
      >
        {comment.userProfilePicture
          ? <img src={comment.userProfilePicture} alt={comment.username} />
          : initials
        }
      </div>

      {/* Тело */}
      <div className={styles.body}>
        <div className={styles.header}>
          <span
            className={styles.username}
            onClick={() => navigate(`/users/${comment.userId}`)}
          >
            {comment.username}
          </span>
          <span className={styles.time}>
            {formatDistanceToNow(comment.createdAt)}
          </span>
        </div>
        <p className={styles.content}>{comment.content}</p>
      </div>

      {/* Удалить — только свои */}
      {currentUserId === comment.userId && (
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(comment.commentId)}
          title="Удалить"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}