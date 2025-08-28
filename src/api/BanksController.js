import api from "@/api/api";
import BankDto from "@/dto/banks/BankDto";

export default class BanksController {
  // Получение списка банков
  static async getItems() {
    try {
      const { data } = await api.get("/banks");
      return data.map(
        (item) =>
          new BankDto(item.id, item.name, item.phone, item.email, item.order_prefix, item.created_at, item.updated_at)
      );
    } catch (error) {
      console.error("Ошибка при получении банков:", error);
      throw error;
    }
  }

  // Создание нового банка
  static async storeItem(item) {
    try {
      const { data } = await api.post("/banks", item);
      return new BankDto(
        data.id,
        data.name,
        data.phone,
        data.email,
        data.order_prefix,
        data.created_at,
        data.updated_at
      );
    } catch (error) {
      console.error("Ошибка при создании банка:", error);
      throw error;
    }
  }

  // Обновление банка
  static async updateItem(id, item) {
    try {
      const { data } = await api.put(`/banks/${id}`, item);
      return new BankDto(
        data.id,
        data.name,
        data.phone,
        data.email,
        data.order_prefix,
        data.created_at,
        data.updated_at
      );
    } catch (error) {
      console.error("Ошибка при обновлении банка:", error);
      throw error;
    }
  }

  // Удаление банка
  static async deleteItem(id) {
    try {
      await api.delete(`/banks/${id}`);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message) throw new Error(message);
      throw error;
    }
  }

  static async getActivityLog(bankId) {
    try {
      const { data } = await api.get(`/banks/${bankId}/activity-log`);
      return data;
    } catch (error) {
      console.error("Ошибка при получении лога активности банка:", error);
      throw error;
    }
  }

  static async getActivityLogsBatch(ids) {
    try {
      const { data } = await api.get('/activity-logs/batch', {
        params: { log_name: 'bank', ids }
      });
      return data;
    } catch (error) {
      console.error('Ошибка при получении batch activity log банков:', error);
      throw error;
    }
  }
}
