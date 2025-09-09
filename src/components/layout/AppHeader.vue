<template>
  <header class="app-header">
    <div class="flex items-center">
      <!-- Mobile menu button -->
      <button 
        @click="toggleMobileMenu" 
        class="lg:hidden mr-3 p-2 text-white hover:bg-blue-600 rounded"
        aria-label="Открыть меню"
      >
        <i class="fas fa-bars text-lg"></i>
      </button>
      <div class="logo flex items-center">
        <img src="/logo.png" alt="Быстрая доставка" class="h-8 w-8 mr-2" />
        <span class="text-white font-bold">Быстрая Доставка</span>
      </div>
    </div>
    <div class="user-info">
      <span v-if="user" class="hidden sm:inline">{{ user.name }} ({{ user.role }})</span>
      <span v-if="user" class="sm:hidden">{{ user.name }}</span>
      <button @click="logout" class="text-sm">Выйти</button>
    </div>
  </header>
</template>

<script>
import api from '@/api/api';

export default {
  name: "AppHeader",
  computed: {
    user() {
      // Обычно данные пользователя хранят в store или localStorage
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    }
  },
  methods: {
    toggleMobileMenu() {
      this.$emit('toggle-mobile-menu');
    },
    async logout() {
      try {
        await api.post('/logout');
      } catch {}
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.app-header {
  background: #2F80ED;
  color: #fff;
  padding: 0 16px;
  display: flex;
  align-items: center;
  height: 56px;
  justify-content: space-between;
  position: relative;
  z-index: 50;
}

@media (min-width: 640px) {
  .app-header {
    padding: 0 24px;
  }
}

.logo {
  font-weight: bold;
  font-size: 18px;
}

.logo img {
  object-fit: contain;
}

@media (min-width: 640px) {
  .logo {
    font-size: 20px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (min-width: 640px) {
  .user-info {
    gap: 16px;
  }
}

button {
  background: #fff;
  color: #2F80ED;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
}

@media (min-width: 640px) {
  button {
    padding: 6px 18px;
  }
}
</style>
