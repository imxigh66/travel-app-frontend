import api from '../../../shared/api/axios'

// ── Places ──
export const moderatorPlaceApi = {
  getPending: (page = 1, size = 10, sortBy = 'newest') =>
    api.get('/places/pending', { params: { pageNumber: page, pageSize: size, sortBy } })
      .then(r => r.data),

  approve: (id) =>
    api.post(`/places/${id}/approve`).then(r => r.data),

  reject: (id, reason) =>
    api.post(`/places/${id}/reject`, { reason }).then(r => r.data),

  getAll: (params = {}) =>
    api.get('/places', { params }).then(r => r.data),

  assignTags: (placeId, tagIds) =>
    api.put(`/category-tags/places/${placeId}`, tagIds).then(r => r.data),
}

// ── Category Tags ──
export const moderatorTagApi = {
  getAll: () =>
    api.get('/category-tags').then(r => r.data),

  create: (data) =>
    api.post('/category-tags', data).then(r => r.data),

  update: (id, data) =>
    api.put(`/category-tags/${id}`, data).then(r => r.data),

  delete: (id) =>
    api.delete(`/category-tags/${id}`).then(r => r.data),
}

// ── Users ──
export const moderatorUserApi = {
  getAll: (params = {}) =>
    api.get('/users', { params }).then(r => r.data),
}