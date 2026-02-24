import { createContext, useContext, useState, useCallback } from 'react'

const SavedContext = createContext(null)

export function SavedProvider({ children }) {
  const [savedIds, setSavedIds] = useState(new Set())

  const initPlace = useCallback((placeId, serverSaved) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      serverSaved ? next.add(placeId) : next.delete(placeId)
      return next
    })
  }, [])

  const toggle = useCallback((placeId) => {
    setSavedIds(prev => {
      const next = new Set(prev)
      next.has(placeId) ? next.delete(placeId) : next.add(placeId)
      return next
    })
  }, [])

  const isSaved = useCallback((placeId) => savedIds.has(placeId), [savedIds])

  return (
    <SavedContext.Provider value={{ toggle, isSaved, initPlace }}>  {/* ← initPlace здесь */}
      {children}
    </SavedContext.Provider>
  )
}

export const useSavedContext = () => {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSavedContext must be used inside SavedProvider')
  return ctx
}