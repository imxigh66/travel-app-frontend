import api from '../../../shared/api/axios';

export const tripMemberApi = {
  getMembers: (tripId) =>
    api.get(`/trips/${tripId}/members`)
      .then(r => r.data?.data ?? r.data ?? []),

  addMember: (tripId, targetUserId, role) =>
    api.post(`/trips/${tripId}/members`, { targetUserId, role })
      .then(r => r.data?.data ?? r.data),

  updateRole: (tripId, targetUserId, role) =>
    api.patch(`/trips/${tripId}/members/${targetUserId}`, { role })
      .then(r => r.data?.data ?? r.data),

  removeMember: (tripId, targetUserId) =>
    api.delete(`/trips/${tripId}/members/${targetUserId}`),
};
