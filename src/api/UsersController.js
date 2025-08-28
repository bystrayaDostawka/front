import api from "@/api/api";
import UserDto from "@/dto/users/UserDto";

export default class UsersController {
  // Получение всех пользователей
  static async getItems() {
    try {
      const { data } = await api.get("/users?with[]=bank");
      return data.map(
        (item) =>
          new UserDto(
            item.id,
            item.name,
            item.email,
            item.phone,
            item.role,
            item.is_active,
            item.bank_id,
            item.bank,
            item.created_at,
            item.updated_at
          )
      );
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      throw error;
    }
  }

  // Создание пользователя
  static async storeItem(item) {
    try {
      const { data } = await api.post("/users", item);
      return new UserDto(
        data.id,
        data.name,
        data.email,
        data.phone,
        data.role,
        data.is_active,
        data.bank_id,
        data.bank,
        data.created_at,
        data.updated_at
      );
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      throw error;
    }
  }

  // Обновление пользователя
  static async updateItem(id, item) {
    try {
      const { data } = await api.put(`/users/${id}`, item);
      return new UserDto(
        data.id,
        data.name,
        data.email,
        data.phone,
        data.role,
        data.is_active,
        data.bank_id,
        data.bank,
        data.created_at,
        data.updated_at
      );
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      throw error;
    }
  }

  // Удаление пользователя
  static async deleteItem(id) {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      const message = error?.response?.data?.message;
      if (message) throw new Error(message);
      throw error;
    }
  }

  // Получение курьеров
  static async getCouriers() {
    try {
      const { data } = await api.get("/users?role=courier");
      return data.map(
        (item) =>
          new UserDto(
            item.id,
            item.name,
            item.email,
            item.phone,
            item.role,
            item.is_active,
            item.bank_id,
            item.bank,
            item.created_at,
            item.updated_at
          )
      );
    } catch (error) {
      console.error("Ошибка при получении курьеров:", error);
      throw error;
    }
  }

  static async getActivityLog(userId) {
    try {
      const { data } = await api.get(`/users/${userId}/activity-log`);
      return data;
    } catch (error) {
      console.error("Ошибка при получении лога активности пользователя:", error);
      throw error;
    }
  }

  static async getActivityLogsBatch(ids) {
    try {
      const { data } = await api.get('/activity-logs/batch', {
        params: { log_name: 'user', ids }
      });
      return data;
    } catch (error) {
      console.error('Ошибка при получении batch activity log пользователей:', error);
      throw error;
    }
  }
}
