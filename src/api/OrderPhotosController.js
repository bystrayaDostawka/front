import api from './api.js';

export default {
  // Получить фотографии заказа
  async getOrderPhotos(orderId) {
    const response = await api.get(`/orders/${orderId}/photos`);
    return response.data;
  },

  // Загрузить фотографии (для курьеров)
  async uploadPhotos(orderId, files) {
    const formData = new FormData();
    
    // Добавляем все файлы в FormData
    files.forEach((file, index) => {
      formData.append(`photos[${index}]`, file);
    });

    const response = await api.post(`/mobile/orders/${orderId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Загрузить одну фотографию (для обратной совместимости)
  async uploadPhoto(orderId, file) {
    return this.uploadPhotos(orderId, [file]);
  },

  // Удалить фотографию (для курьеров)
  async deletePhoto(orderId, photoId) {
    const response = await api.delete(`/mobile/orders/${orderId}/photos/${photoId}`);
    return response.data;
  },

  // Удалить фотографию (для админов и менеджеров)
  async deletePhotoAdmin(orderId, photoId) {
    const response = await api.delete(`/orders/${orderId}/photos/${photoId}`);
    return response.data;
  }
};
