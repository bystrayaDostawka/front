<template>
  <div>
    <AppHeader v-if="showMenu" />
    <AppSidebar v-if="showMenu" />
    <div :class="['main-content', { 'with-sidebar': showMenu }]">
      <router-view />
    </div>
    <AppFooter v-if="showMenu" />
  </div>
</template>

<script>
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppFooter from './components/layout/AppFooter.vue'

export default {
  components: { AppHeader, AppSidebar, AppFooter },
  computed: {
    showMenu() {
      return this.$route.path !== '/login';
    }
  }
}
</script>

<style>
.main-content.with-sidebar {
  margin-left: 200px;
  margin-bottom: 60px;
  min-height: calc(100vh - 56px - 48px);
  padding: 32px;
  background: #fff;
}
</style>
