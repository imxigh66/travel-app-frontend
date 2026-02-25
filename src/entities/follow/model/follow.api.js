import api from '../../../shared/api/axios'

export const followApi = {
  // Подписаться
  follow: async (userId) => {
    await api.post(`/users/${userId}/follow`)
  },

  // Отписаться
  unfollow: async (userId) => {
    await api.delete(`/users/${userId}/unfollow`)
  },

  // Проверить подписан ли текущий пользователь
  isFollowing: async (userId) => {
    const { data } = await api.get(`/users/${userId}/is-following`)
    return data.data // ApiResponse<bool>
  },

  // Получить подписчиков пользователя
  getFollowers: async (userId, pageNumber = 1, pageSize = 20) => {
    const { data } = await api.get(`/users/${userId}/followers`, {
      params: { pageNumber, pageSize }
    })
    return data
  },

  // Получить подписки пользователя
  getFollowing: async (userId, pageNumber = 1, pageSize = 20) => {
    const { data } = await api.get(`/users/${userId}/following`, {
      params: { pageNumber, pageSize }
    })
    return data
  },
}