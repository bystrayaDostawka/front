import api from './api.js';

export default {
  // Получить файлы заказа
  async getOrderFiles(orderId) {
    const response = await api.get(`/orders/${orderId}/files`);
    return response.data;
  },

  // Загрузить файл
  async uploadFile(orderId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/orders/${orderId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Получить информацию о файле
  async getFileInfo(orderId, fileId) {
    const response = await api.get(`/orders/${orderId}/files/${fileId}`);
    return response.data;
  },

  // Скачать файл
  async downloadFile(orderId, fileId) {
    const response = await api.get(`/orders/${orderId}/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // Удалить файл
  async deleteFile(orderId, fileId) {
    const response = await api.delete(`/orders/${orderId}/files/${fileId}`);
    return response.data;
  }
};
