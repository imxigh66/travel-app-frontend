import api from '../../../shared/api/axios';

export const notificationApi = {
  getNotifications(pageSize = 20) {
    return api.get('/notifications', { params: { pageSize } }).then(r => r.data);
  },
  getUnreadCount() {
    return api.get('/notifications/unread-count').then(r => r.data);
  },
  markAllRead() {
    return api.patch('/notifications/read-all').then(r => r.data);
  },
};
