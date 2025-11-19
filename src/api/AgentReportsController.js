import api from "@/api/api";

export default class AgentReportsController {
  static async getItems(params = {}) {
    try {
      const response = await api.get("/agent-reports", { params });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении актов-отчетов:", error);
      throw error;
    }
  }

  static async getItem(id) {
    try {
      const response = await api.get(`/agent-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении акта-отчета:", error);
      throw error;
    }
  }

  static async create(data) {
    try {
      const response = await api.post("/agent-reports", data);
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании акта-отчета:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await api.patch(`/agent-reports/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении акта-отчета:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await api.delete(`/agent-reports/${id}`);
      return true;
    } catch (error) {
      console.error("Ошибка при удалении акта-отчета:", error);
      throw error;
    }
  }

  static async download(id) {
    try {
      const response = await api.get(`/agent-reports/${id}/download`, {
        responseType: 'blob',
      });
      
      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Получаем имя файла из заголовка Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Акт-отчет_${id}.xlsx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Ошибка при скачивании акта-отчета:", error);
      throw error;
    }
  }

  static async getOrdersForPeriod(bankIds, periodFrom, periodTo) {
    try {
      const response = await api.get("/agent-reports/orders-for-period", {
        params: {
          bank_ids: bankIds,
          period_from: periodFrom,
          period_to: periodTo,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении заказов за период:", error);
      throw error;
    }
  }

  static async changeStatus(id, status) {
    try {
      const response = await api.patch(`/agent-reports/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error("Ошибка при изменении статуса акта-отчета:", error);
      throw error;
    }
  }
}

