
import api from '../../../shared/api/axios'
import type { GetPlacesParams, PaginatedList, PlaceDto,PostDto } from './place.types'


export const placeApi = {
  getAll: async (params: GetPlacesParams = {}): Promise<PaginatedList<PlaceDto>> => {
   
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
    console.log('📡 placeApi.getAll:', cleanParams)
    const { data } = await api.get('/places', { params: cleanParams })
    return data
  },

  getById: async (id: number): Promise<PlaceDto> => {
    const { data } = await api.get(`/places/${id}`)
    return data.data
  },
   getNearby: async (id: number): Promise<PlaceDto[]> => {
    const { data } = await api.get(`/places/${id}/nearby`)
    return data
  },

  getPosts: async (
    id: number,
    pageNumber = 1,
    pageSize = 10
  ): Promise<PaginatedList<PostDto>> => {
    const { data } = await api.get(`/places/${id}/posts`, {
      params: { pageNumber, pageSize }
    })
    return data
  },


save: async (placeId: number): Promise<void> => {
    await api.post(`/places/${placeId}/save`)
  },

  unsave: async (placeId: number): Promise<void> => {
    await api.delete(`/places/${placeId}/unsave`)
  },

  getSaved: async (pageNumber = 1, pageSize = 10): Promise<PaginatedList<PlaceDto>> => {
    const { data } = await api.get('/users/saved', {
      params: { pageNumber, pageSize }
    })
    return data
  },

 isSaved: async (placeId: number) => {
    const { data } = await api.get(`/places/${placeId}/is-saved`)
    return data.data  // ApiResponse<bool> → data.data
  },
  
}