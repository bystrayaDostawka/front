import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import UserPage from "../views/users/UserPage.vue";
import OrderStatusesPage from "../views/statuses/OrderStatusesPage.vue";
import BankPage from "../views/banks/BankPage.vue";
import OrderPage from "@/views/orders/OrderPage.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/", component: OrderPage, meta: { requiresAuth: true, roles: ['admin', 'manager', 'bank', 'courier'] } },
  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true, roles: ['admin', 'manager'] } },
  { path: "/users", component: UserPage, meta: { requiresAuth: true, roles: ['admin', 'manager'] } },
  { path: "/orders", component: OrderPage, meta: { requiresAuth: true, roles: ['admin', 'manager', 'bank'] } },
  { path: "/banks", component: BankPage, meta: { requiresAuth: true, roles: ['admin', 'manager'] } },
  { path: "/order-statuses", component: OrderStatusesPage, meta: { requiresAuth: true, roles: ['admin', 'manager'] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Redirect if not logged in or not allowed by role
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || '{}');
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.meta.roles && !to.meta.roles.includes(user.role)) {
    // Если роль не разрешена для этого роута
    next("/"); // или на страницу "Нет доступа"
  } else if (to.path === "/login" && token) {
    next("/");
  } else {
    next();
  }
});

export default router;
