import api from '../../../shared/api/axios';

export const tripMessageApi = {
  getMessages: (tripId, page = 1) =>
    api.get(`/trips/${tripId}/chat`, { params: { pageNumber: page, pageSize: 50 } })
      .then(r => r.data?.data ?? r.data),
};
