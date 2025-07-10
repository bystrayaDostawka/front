<template>
  <header class="app-header">
    <div class="logo">Курьерская служба</div>
    <div class="user-info">
      <span v-if="user">{{ user.name }} ({{ user.role }})</span>
      <button @click="logout">Выйти</button>
    </div>
  </header>
</template>

<script>
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
    logout() {
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
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 56px;
  justify-content: space-between;
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
</style>
