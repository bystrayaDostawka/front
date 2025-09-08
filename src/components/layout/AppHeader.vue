<template>
  <header class="app-header">
    <div class="header-left">
      <button v-if="isMobile" @click="toggleMobileMenu" class="hamburger-btn">
        <i class="fas fa-bars"></i>
      </button>
      <div class="logo">Курьерская служба</div>
    </div>
    <div class="user-info">
      <span v-if="user && !isMobile">{{ user.name }} ({{ user.role }})</span>
      <button @click="logout">Выйти</button>
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
        return JSON.parse(localStorage.getItem('user'));
      } catch {
        return null;
      }
    }
  },
  methods: {
    async logout() {
      try {
        await api.post('/logout');
      } catch {}
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },
    toggleMobileMenu() {
      this.$emit('toggle-mobile-menu');
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
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
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 56px;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hamburger-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.hamburger-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.logo {
  font-weight: bold;
  font-size: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

button {
  background: #fff;
  color: #2F80ED;
  border: none;
  padding: 6px 18px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 500;
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
  
  .user-info span {
    display: none;
  }
  
  button {
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
