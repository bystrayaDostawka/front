export default class OrderDto {
  constructor(
    id,
    product,
    name,
    surname = "",
    patronymic = "",
    phone,
    address,
    delivery_at,
    deliveried_at = "",
    note = "",
    declined_reason = "",
    bank_id = null,
    bank = null,
    courier_id = null,
    courier = null,
    order_status_id = null,
    status = null,
    order_number = null,
    created_at = "",
    updated_at = ""
  ) {
    this.id = id; // ID заказа
    this.product = product; // Название или описание товара/услуги
    this.name = name; // Имя клиента
    this.surname = surname; // Фамилия клиента
    this.patronymic = patronymic; // Отчество клиента
    this.phone = phone; // Телефон клиента
    this.address = address; // Адрес клиента
    this.delivery_at = delivery_at; // Дата планируемой доставки
    this.deliveried_at = deliveried_at; // Фактическая дата доставки
    this.note = note; // Примечание к заказу
    this.declined_reason = declined_reason; // Причина отказа, если заказ отменён

    this.bank_id = bank_id; // ID банка
    this.bank = bank; // Объект банка

    this.courier_id = courier_id; // ID курьера
    this.courier = courier; // Объект курьера

    this.order_status_id = order_status_id; // ID статуса заказа
    this.status = status; // Объект статуса заказа
    this.order_number = order_number; // Уникальный номер заказа для банка

    this.created_at = created_at; // Дата создания заказа
    this.updated_at = updated_at; // Дата последнего обновления заказа
  }

  // Метод для отображения статуса в виде HTML-строки
  formatStatus() {
    if (!this.status) return "";
    return `<span class="px-2 py-1 rounded text-xs font-semibold" style="background-color:${this.status.color};">${this.status.title}</span>`;
  }

  // Метод для отображения статуса с пометкой и тултипом причины отмены/переноса
  formatStatusWithReason() {
    let statusHtml = this.formatStatus();
    if (this.declined_reason) {
      statusHtml += `\n        <span 
          style=\"display:inline-block;vertical-align:middle;margin-left:6px;cursor:pointer;\"
          title=\"${this.declined_reason.replace(/\"/g, '&quot;')}\"
        >
          <span style=\"display:inline-block;width:10px;height:10px;background:#e53e3e;border-radius:50%;\"></span>
        </span>
      `;
    }
    return statusHtml;
  }

  // Метод для форматирования информации о клиенте
  formatClient() {
    return `${this.surname} ${this.name} ${this.patronymic}<br><small>${this.phone}<br>${this.address}</small>`;
  }

  // Метод для форматирования даты доставки
  formatDeliveryDate() {
    return this.delivery_at ? new Date(this.delivery_at).toLocaleString() : "-";
  }

  // Метод для отображения номера заказа
  formatOrderNumber() {
    return this.order_number || this.id;
  }
}
