import api from '../../../shared/api/axios';

export const messageApi = {
  getConversations: () =>
    api.get('/conversations').then(r => r.data?.data ?? r.data),

  startConversation: (otherUserId) =>
    api.post('/conversations', { otherUserId }).then(r => r.data?.data ?? r.data),

  getMessages: (conversationId, page = 1, pageSize = 30) =>
    api.get(`/conversations/${conversationId}/messages`, {
      params: { pageNumber: page, pageSize },
    }).then(r => r.data?.data ?? r.data),
};
