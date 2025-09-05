import api from './api.js';

export default {
  // Получить фотографии заказа
  async getOrderPhotos(orderId) {
    const response = await api.get(`/orders/${orderId}/photos`);
    return response.data;
  },

  // Загрузить фотографию (для курьеров)
  async uploadPhoto(orderId, file) {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post(`/mobile/orders/${orderId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Удалить фотографию (для курьеров)
  async deletePhoto(orderId, photoId) {
    const response = await api.delete(`/mobile/orders/${orderId}/photos/${photoId}`);
    return response.data;
  }
};
