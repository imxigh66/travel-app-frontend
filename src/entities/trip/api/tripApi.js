import api from '../../../shared/api/axios';

export const tripApi = {
  // Трипы
  createTrip: (data) =>
    api.post('/trips', data).then(r => r.data.data),

  getMyTrips: () =>
    api.get('/trips/my').then(r => r.data.data),

  getTripById: (id) =>
    api.get(`/trips/${id}`).then(r => r.data.data),

  getUserTrips: (userId) =>
    api.get(`/trips/user/${userId}`).then(r => r.data.data),

  deleteTrip: (id) =>
    api.delete(`/trips/${id}`),

  // Места
  addPlace: (tripId, data) =>
  api.post(`/trips/${tripId}/places`, data).then(r => r.data.data),

  removePlace: (tripId, placeId) =>
    api.delete(`/trips/${tripId}/places/${placeId}`),

  reorderPlaces: (tripId, places) =>
    api.put(`/trips/${tripId}/places/reorder`, places),

  // Заметки
  getNotes: (tripId) =>
    api.get(`/trips/${tripId}/notes`).then(r => r.data.data),

  createNote: (tripId, data) =>
    api.post(`/trips/${tripId}/notes`, data).then(r => r.data.data),

  updateNote: (tripId, noteId, data) =>
    api.put(`/trips/${tripId}/notes/${noteId}`, data).then(r => r.data.data),

  deleteNote: (tripId, noteId) =>
    api.delete(`/trips/${tripId}/notes/${noteId}`),
};