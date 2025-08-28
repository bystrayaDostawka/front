export default class UserDto {
  constructor(
    id,
    name,
    email,
    phone,
    role,
    is_active,
    bank_id = null,
    bank = null,
    created_at = "",
    updated_at = ""
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.is_active = is_active;
    this.bank_id = bank_id;
    this.bank = bank; // объект { id, name } или null
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  formatStatus() {
    return this.is_active
      ? `<span class="px-2 py-1 rounded text-xs font-semibold bg-green-200 text-green-700">Активен</span>`
      : `<span class="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-600">Отключен</span>`;
  }

  formatRole() {
    const labels = {
      admin: "Админ",
      manager: "Менеджер",
      courier: "Курьер",
      bank: "Банк",
    };
    const classes = {
      admin: "bg-blue-100 text-blue-700",
      manager: "bg-yellow-100 text-yellow-800",
      courier: "bg-green-100 text-green-700",
      bank: "bg-purple-100 text-purple-700",
    };

    return `<span class="px-2 py-1 rounded text-xs font-semibold ${classes[this.role] || ""}">
      ${labels[this.role] || this.role}
    </span>`;
  }
}
