import api from '../../../shared/api/axios'

export const commentApi = {
  getComments: async (postId, pageNumber = 1, pageSize = 20) => {
    const { data } = await api.get(`/posts/${postId}/comments`, {
      params: { pageNumber, pageSize }
    })
    return data 
  },


  createComment: async (postId, content) => {
    const { data } = await api.post(`/posts/${postId}/comments`, { content })
    return data.data 
  },


  deleteComment: async (postId, commentId) => {
    await api.delete(`/posts/${postId}/comments/${commentId}`)
  },
}