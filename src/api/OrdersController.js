import api from "@/api/api";
import OrderDto from "@/dto/orders/OrderDto";

export default class OrdersController {
  static async getItems(params = {}) {
    try {
      const response = await api.get("/orders", { params });
      const data = response.data;

      const items = data.map(
        (item) =>
          new OrderDto(
            item.id,
            item.product,
            item.name,
            item.surname,
            item.patronymic,
            item.phone,
            item.address,
            item.delivery_at,
            item.deliveried_at,
            item.note,
            item.declined_reason,
            item.bank_id,
            item.bank,
            item.courier_id,
            item.courier,
            item.order_status_id,
            item.status,
            item.order_number,
            item.created_at,
            item.updated_at
          )
      );

      return items;
    } catch (error) {
      console.error("Ошибка при получении заказов:", error);
      throw error;
    }
  }

  static async search(term) {
    try {
      const response = await api.get(`/orders/search?search_request=${term}`);
      const data = response.data;
      return data.map(
        (item) =>
          new OrderDto(
            item.id,
            item.product,
            item.name,
            item.surname,
            item.patronymic,
            item.phone,
            item.address,
            item.delivery_at,
            item.deliveried_at,
            item.note,
            item.declined_reason,
            item.bank_id,
            item.bank,
            item.courier_id,
            item.courier,
            item.order_status_id,
            item.status,
            item.order_number,
            item.created_at,
            item.updated_at
          )
      );
    } catch (error) {
      console.error("Ошибка при поиске заказов:", error);
      throw error;
    }
  }

  static async storeItem(item) {
    try {
      const { data } = await api.post("/orders", item);
      return new OrderDto(
        data.id,
        data.product,
        data.name,
        data.surname,
        data.patronymic,
        data.phone,
        data.address,
        data.delivery_at,
        data.deliveried_at,
        data.note,
        data.declined_reason,
        data.bank_id,
        data.bank,
        data.courier_id,
        data.courier,
        data.order_status_id,
        data.status,
        data.order_number,
        data.created_at,
        data.updated_at
      );
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      throw error;
    }
  }

  static async updateItem(id, item) {
    try {
      const { data } = await api.put(`/orders/${id}`, item);
      return new OrderDto(
        data.id,
        data.product,
        data.name,
        data.surname,
        data.patronymic,
        data.phone,
        data.address,
        data.delivery_at,
        data.deliveried_at,
        data.note,
        data.declined_reason,
        data.bank_id,
        data.bank,
        data.courier_id,
        data.courier,
        data.order_status_id,
        data.status,
        data.order_number,
        data.created_at,
        data.updated_at
      );
    } catch (error) {
      console.error("Ошибка при обновлении заказа:", error);
      throw error;
    }
  }

  static async deleteItem(id) {
    try {
      const { data } = await api.delete(`/orders/${id}`);
      return data;
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      if (serverMessage) throw new Error(serverMessage);
      throw error;
    }
  }

  static async changeStatus(id, order_status_id, extra = {}) {
    try {
      const { data } = await api.patch(`/orders/${id}/status`, {
        order_status_id,
        ...extra,
      });
      return data;
    } catch (error) {
      console.error("Ошибка при смене статуса заказа:", error);
      throw error;
    }
  }

  static async bulkDestroy(ids) {
    try {
      return await api.post("/orders/bulk-delete", { ids });
    } catch (error) {
      console.error("Ошибка при массовом удалении заказов:", error);
      throw error;
    }
  }

  static async bulkUpdate(ids, fields) {
    try {
      return await api.post("/orders/bulk-update", { ids, ...fields });
    } catch (error) {
      console.error("Ошибка при массовом обновлении заказов:", error);
      throw error;
    }
  }

  static async getActivityLogsBatch(ids) {
    try {
      const { data } = await api.get('/activity-logs/batch', {
        params: { log_name: 'order', ids }
      });
      return data;
    } catch (error) {
      console.error('Ошибка при получении batch activity log заказов:', error);
      throw error;
    }
  }
}
