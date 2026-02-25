import { createContext, useContext, useState, useCallback } from 'react'

const FollowContext = createContext(null)

export function FollowProvider({ children }) {
  const [followingIds, setFollowingIds] = useState(new Set())

  // Инициализируем состояние данными с сервера
  const initUser = useCallback((userId, serverFollowing) => {
    setFollowingIds(prev => {
      const next = new Set(prev)
      serverFollowing ? next.add(userId) : next.delete(userId)
      return next
    })
  }, [])

  const toggle = useCallback((userId) => {
    setFollowingIds(prev => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }, [])

  const isFollowing = useCallback((userId) => followingIds.has(userId), [followingIds])

  return (
    <FollowContext.Provider value={{ toggle, isFollowing, initUser }}>
      {children}
    </FollowContext.Provider>
  )
}

export const useFollowContext = () => {
  const ctx = useContext(FollowContext)
  if (!ctx) throw new Error('useFollowContext must be used inside FollowProvider')
  return ctx
}