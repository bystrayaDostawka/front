export default class OrderStatusDto {
  constructor(id, title, color = "#eee", created_at = "", updated_at = "") {
    this.id = id;
    this.title = title;
    this.color = color;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  formatBadge() {
    return `<span class="px-2 py-1 rounded text-xs font-semibold" style="background-color:${this.color};">${this.title}</span>`;
  }

  getFormattedColor() {
    return `<div class="w-6 h-6 rounded border" style="background-color: ${this.color};"></div>`;
  }
}
