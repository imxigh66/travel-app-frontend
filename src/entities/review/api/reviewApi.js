import api from '../../../shared/api/axios';

export const reviewApi = {
  getReviews: (placeId, page = 1, pageSize = 10) =>
    api.get(`/places/${placeId}/reviews`, { params: { page, pageSize } }).then(r => r.data?.data ?? r.data),

  createReview: (placeId, data) =>
    api.post(`/places/${placeId}/reviews`, data).then(r => r.data.data),

  deleteReview: (placeId, reviewId) =>
    api.delete(`/places/${placeId}/reviews/${reviewId}`),
};
