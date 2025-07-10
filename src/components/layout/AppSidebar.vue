<template>
  <aside class="app-sidebar">
    <nav>
      <ul>
        <li>
          <router-link to="/">
            <i class="fas fa-home mr-2"></i>
            Дашборд
          </router-link>
        </li>
        <li>
          <router-link to="/orders">
            <i class="fas fa-file-alt mr-2"></i>
            Заявки
          </router-link>
        </li>
        <li>
          <router-link to="/users">
            <i class="fas fa-users mr-2"></i>
            Пользователи
          </router-link>
        </li>
        <li>
          <router-link to="/banks">
            <i class="fas fa-university mr-2"></i>
            Банки
          </router-link>
        </li>
        <li>
          <router-link to="/order-statuses">
            <i class="fas fa-flag-checkered mr-2"></i>
            Статусы
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script>
export default { name: "AppSidebar" }
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 56px;
  /* высота header */
  left: 0;
  width: 200px;
  height: calc(100% - 56px);
  background: #f4f8fb;
  border-right: 1px solid #e0e6ed;
  padding-top: 20px;
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
  font-weight: 500;
}

nav a.router-link-exact-active {
  background: #e6f0fa;
  color: #215aa0;
}
</style>
