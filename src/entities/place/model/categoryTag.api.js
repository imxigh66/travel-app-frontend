import api from '../../../shared/api/axios';    

export const categoryTagApi = {
  getAll: async () => {
    const { data } = await api.get('/category-tags')
    return data
  },

  // Места по конкретному тегу — отдельный эндпоинт
  getPlacesByTag: async (id, params = {}) => {
    const { data } = await api.get(`/category-tags/${id}/places`, { params })
    return data
  },
}