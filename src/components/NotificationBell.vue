<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      :class="{ 'bg-blue-100': hasUnreadNotifications }"
    >
      <i class="fas fa-bell text-gray-600 text-xl"></i>
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown с уведомлениями -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto"
    >
      <div class="p-3 border-b flex justify-between items-center">
        <h3 class="font-semibold">Уведомления</h3>
        <button
          v-if="unreadCount > 0"
          @click="markAllAsRead"
          class="text-sm text-blue-600 hover:underline"
        >
          Прочитать все
        </button>
      </div>

      <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500">
        Нет уведомлений
      </div>

      <div v-else>
        <div
          v-for="notification in notifications"
          :key="notification.id"
          @click="handleNotificationClick(notification)"
          class="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
          :class="{ 'bg-blue-50': !notification.read }"
        >
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <p class="font-medium text-sm">{{ notification.title }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(notification.created_at) }}</p>
            </div>
            <i
              v-if="!notification.read"
              class="fas fa-circle text-blue-500 text-xs mt-1"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotificationBell',
  data() {
    return {
      showDropdown: false,
      notifications: [],
      refreshInterval: null,
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.read).length;
    },
    hasUnreadNotifications() {
      return this.unreadCount > 0;
    },
  },
  mounted() {
    this.fetchNotifications();

    // Обновляем уведомления каждые 10 секунд
    this.refreshInterval = setInterval(() => {
      this.fetchNotifications();
    }, 10000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
      if (this.showDropdown) {
        this.fetchNotifications();
      }
    },
    async fetchNotifications() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');

        if (!token) return;

        // Получаем уведомления через API
        const response = await fetch('/api/mobile/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.notifications = data.notifications || [];
        }
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
      }
    },
    handleNotificationClick(notification) {
      // Помечаем как прочитанное
      notification.read = true;

      // Если есть order_id, открываем детали заявки
      if (notification.data?.order_id) {
        this.$router.push(`/orders/${notification.data.order_id}`);
      }

      // Закрываем dropdown
      this.showDropdown = false;
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'только что';
      if (minutes < 60) return `${minutes} мин назад`;
      if (hours < 24) return `${hours} ч назад`;
      if (days < 7) return `${days} дн назад`;

      return date.toLocaleDateString('ru-RU');
    },
  },
};
</script>

<style scoped>
/* Дополнительные стили если нужно */
</style>

