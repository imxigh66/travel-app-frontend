import { useEffect } from 'react'
import { followApi } from '../../entities/follow/model/follow.api'
import { useFollowContext } from './FollowContext'

export function useFollow(userId, serverFollowing = undefined) {
  const { isFollowing, toggle, initUser } = useFollowContext()

  // Инициализируем контекст данными с сервера
  useEffect(() => {
    if (serverFollowing !== undefined) {
      initUser(userId, serverFollowing)
    }
  }, [userId, serverFollowing, initUser])

  const handleToggle = async (e) => {
    e?.stopPropagation()
    const wasFollowing = isFollowing(userId)
    toggle(userId) // оптимистично

    try {
      wasFollowing
        ? await followApi.unfollow(userId)
        : await followApi.follow(userId)
    } catch {
      toggle(userId) // откат при ошибке
    }
  }

  return { isFollowing: isFollowing(userId), toggle: handleToggle }
}