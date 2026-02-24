import { useEffect } from 'react'
import { placeApi } from '../../entities/place/model/place.api'
import { useSavedContext } from './SavedContext'

export function useSavePlace(placeId, serverSaved = undefined) {
  const { isSaved, toggle, initPlace } = useSavedContext()

  // Если пришли данные с сервера — инициализируем контекст
  useEffect(() => {
    if (serverSaved !== undefined) {
      initPlace(placeId, serverSaved)
    }
  }, [placeId, serverSaved, initPlace])

  const handleToggle = async (e) => {
  e?.stopPropagation()
  const wasSaved = isSaved(placeId)  
  toggle(placeId)                  

  try {
    wasSaved                        
      ? await placeApi.unsave(placeId)
      : await placeApi.save(placeId)
  } catch {
    toggle(placeId)
  }
}

  return { isSaved: isSaved(placeId), toggle: handleToggle }
}