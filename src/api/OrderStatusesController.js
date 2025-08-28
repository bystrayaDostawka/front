import api from "@/api/api";
import OrderStatusDto from "@/dto/orders/OrderStatusDto";

export default class OrderStatusesController {
  // Получение списка статусов
  static async getItems() {
    try {
      const { data } = await api.get("/order-statuses");
      return data.map(
        (item) =>
          new OrderStatusDto(item.id, item.title, item.color, item.created_at, item.updated_at)
      );
    } catch (error) {
      console.error("Ошибка при получении статусов заказов:", error);
      throw error;
    }
  }

  // Создание нового статуса
  static async storeItem(item) {
    try {
      const { data } = await api.post("/order-statuses", item);
      return new OrderStatusDto(data.id, data.title, data.color, data.created_at, data.updated_at);
    } catch (error) {
      console.error("Ошибка при создании статуса заказа:", error);
      throw error;
    }
  }

  // Обновление статуса
  static async updateItem(id, item) {
    try {
      const { data } = await api.put(`/order-statuses/${id}`, item);
      return new OrderStatusDto(data.id, data.title, data.color, data.created_at, data.updated_at);
    } catch (error) {
      console.error("Ошибка при обновлении статуса заказа:", error);
      throw error;
    }
  }

  // Удаление статуса
  static async deleteItem(id) {
    try {
      await api.delete(`/order-statuses/${id}`);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message) throw new Error(message);
      throw error;
    }
  }

  static async getActivityLog(statusId) {
    try {
      const { data } = await api.get(`/order-statuses/${statusId}/activity-log`);
      return data;
    } catch (error) {
      console.error("Ошибка при получении лога активности статуса:", error);
      throw error;
    }
  }

  static async getActivityLogsBatch(ids) {
    try {
      const { data } = await api.get('/activity-logs/batch', {
        params: { log_name: 'order_status', ids }
      });
      return data;
    } catch (error) {
      console.error('Ошибка при получении batch activity log статусов:', error);
      throw error;
    }
  }
}
