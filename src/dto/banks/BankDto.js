export default class BankDto {
  constructor(id, name, phone = "", email = "", order_prefix = "", created_at = "", updated_at = "") {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.order_prefix = order_prefix;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  formatContact() {
    const parts = [];
    if (this.phone) parts.push(`<i class="fas fa-phone mr-1"></i> ${this.phone}`);
    if (this.email) parts.push(`<i class="fas fa-envelope mr-1"></i> ${this.email}`);
    return parts.join("<br>");
  }
}
