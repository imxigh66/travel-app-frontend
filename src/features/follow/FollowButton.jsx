import { useState } from 'react'
import { useFollow } from './useFollow'
import styles from './FollowButton.module.css'

export default function FollowButton({ userId, serverFollowing = undefined, size = 'md' }) {
  const { isFollowing, toggle } = useFollow(userId, serverFollowing)
  const [hovered, setHovered] = useState(false)

  const label = isFollowing
    ? (hovered ? 'Отписаться' : '✓ Подписан')
    : '+ Подписаться'

  return (
    <button
      className={[
        styles.btn,
        styles[size],
        isFollowing ? (hovered ? styles.unfollow : styles.following) : styles.notFollowing,
      ].join(' ')}
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </button>
  )
}