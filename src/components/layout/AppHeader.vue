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
      <div v-if="user && user.name" class="user-details">
        <span class="user-name">{{ user.name }}</span>
        <span class="user-role">{{ getRoleDisplayName(user.role) }}</span>
      </div>
      <div v-else class="user-details">
        <span class="user-name">Гость</span>
        <span class="user-role">Не авторизован</span>
      </div>
      <button @click="logout" class="logout-btn">Выйти</button>
    </div>
  </header>
</template>

<script>
import api from '@/api/api';

export default {
  name: "AppHeader",
  data() {
    return {
      isMobile: false
    }
  },
  computed: {
    user() {
      // Обычно данные пользователя хранят в store или localStorage
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData);
        return userData;
      } catch (error) {
        console.log('Error parsing user data:', error);
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
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    getRoleDisplayName(role) {
      const roleNames = {
        'admin': 'Администратор',
        'manager': 'Менеджер',
        'courier': 'Курьер',
        'bank': 'Банк'
      };
      return roleNames[role] || role;
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
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
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #e3f2fd;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  margin-top: 2px;
}

.logout-btn {
  background: #fff;
  color: #2F80ED;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

@media (min-width: 640px) {
  .user-info {
    gap: 16px;
  }
  
  .logout-btn {
    padding: 6px 18px;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }
  
  .logo {
    font-size: 18px;
  }
  
  .user-info {
    gap: 8px;
  }
  
  .user-details {
    align-items: flex-end;
  }
  
  .user-name {
    font-size: 13px;
  }
  
  .user-role {
    font-size: 11px;
    padding: 1px 6px;
  }
  
  .logout-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 16px;
  }
  
  button {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
