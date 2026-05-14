import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFollow } from './useFollow'
import styles from './FollowButton.module.css'

export default function FollowButton({ userId, serverFollowing = undefined, size = 'md' }) {
  const { isFollowing, toggle } = useFollow(userId, serverFollowing)
  const { t } = useTranslation()
  const [hovered, setHovered] = useState(false)

  const label = isFollowing
    ? (hovered ? t('follow.unfollow') : t('follow.following'))
    : t('follow.follow')

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