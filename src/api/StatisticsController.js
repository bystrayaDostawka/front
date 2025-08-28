import api from "@/api/api";

export default class StatisticsController {
  static async getOrderStatistics(params = {}) {
    try {
      const response = await api.get("/statistics/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении статистики заказов:", error);
      throw error;
    }
  }

  static async getCourierStatistics(params = {}) {
    try {
      const response = await api.get("/statistics/couriers", { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении статистики курьеров:", error);
      throw error;
    }
  }

  static async getDashboardStats(params = {}) {
    try {
      const response = await api.get("/statistics/dashboard", { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении статистики дашборда:", error);
      throw error;
    }
  }

  static async getCouriers() {
    try {
      const response = await api.get("/users", { params: { role: 'courier' } });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении курьеров:", error);
      throw error;
    }
  }

  static async getBanks() {
    try {
      const response = await api.get("/banks");
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении банков:", error);
      throw error;
    }
  }
} 