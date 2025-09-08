<template>
  <div>
    <AppHeader v-if="showMenu" @toggle-mobile-menu="toggleMobileMenu" />
    <AppSidebar v-if="showMenu" :class="{ 'mobile-open': mobileMenuOpen }" />
    <div :class="['main-content', { 'with-sidebar': showMenu }]">
      <router-view />
    </div>
    <AppFooter v-if="showMenu" />
    <!-- Mobile menu overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
  </div>
</template>

<script>
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppFooter from './components/layout/AppFooter.vue'

export default {
  components: { AppHeader, AppSidebar, AppFooter },
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  computed: {
    showMenu() {
      return this.$route.path !== '/login';
    }
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    }
  },
  watch: {
    $route() {
      this.closeMobileMenu();
    }
  }
}
</script>

<style>
.main-content.with-sidebar {
  margin-left: 200px;
  margin-bottom: 60px;
  margin-top: 56px;
  min-height: calc(100vh - 56px - 48px);
  padding: 32px;
  background: #fff;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
    margin-bottom: 80px;
    margin-top: 56px;
    padding: 16px;
    min-height: calc(100vh - 56px - 60px);
    overflow-x: hidden; /* Prevent horizontal scroll */
  }
  
  /* Ensure proper touch scrolling */
  .main-content {
    -webkit-overflow-scrolling: touch;
  }
}

/* Mobile menu styles */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
}

@media (max-width: 768px) {
  .app-sidebar.mobile-open {
    display: block;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }
  
  .app-sidebar:not(.mobile-open) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
}
</style>
