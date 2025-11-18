<template>
  <aside class="app-sidebar">
    <nav>
      <ul>
        <li v-if="canSee('admin', 'manager', 'bank')">
          <router-link to="/">
            <i class="fas fa-file-alt mr-2"></i>
            Заявки
          </router-link>
        </li>
        <li v-if="canSee('admin', 'manager')">
          <router-link to="/dashboard">
            <i class="fas fa-chart-bar mr-2"></i>
            Дашборд
          </router-link>
        </li>
        <li v-if="canSee('bank')">
          <router-link to="/bank-dashboard">
            <i class="fas fa-chart-pie mr-2"></i>
            Дашборд банка
          </router-link>
        </li>
        <li v-if="canSee('admin', 'manager')">
          <router-link to="/users">
            <i class="fas fa-users mr-2"></i>
            Пользователи
          </router-link>
        </li>
        <li v-if="canSee('admin', 'manager')">
          <router-link to="/banks">
            <i class="fas fa-university mr-2"></i>
            Банки
          </router-link>
        </li>
        <li v-if="canSee('admin', 'manager', 'bank')">
          <router-link to="/order-statuses">
            <i class="fas fa-flag-checkered mr-2"></i>
            Статусы
          </router-link>
        </li>
        <li v-if="canSee('admin')">
          <router-link to="/agent-reports">
            <i class="fas fa-file-invoice mr-2"></i>
            Акт-отчет агента
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default {
  name: "AppSidebar",
  computed: {
    user() {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('AppSidebar - User data:', userData);
      return userData;
    }
  },
  methods: {
    canSee(...roles) {
      return roles.includes(this.user.role);
    }
  }
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  width: 200px;
  height: calc(100% - 56px);
  background: #f4f8fb;
  border-right: 1px solid #e0e6ed;
  padding-top: 20px;
  z-index: 40;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

nav li {
  margin-bottom: 12px;
}

nav a {
  color: #2F80ED;
  text-decoration: none;
  padding: 8px 18px;
  display: block;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

nav a.router-link-exact-active {
  background: #e6f0fa;
  color: #215aa0;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .app-sidebar {
    display: none;
    z-index: 50;
  }
  
  .app-sidebar.mobile-open {
    display: block;
  }
}
</style>
