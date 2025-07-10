import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import UserPage from "../views/users/UserPage.vue";
import OrderStatusesPage from "../views/statuses/OrderStatusesPage.vue";
import BankPage from "../views/banks/BankPage.vue";
import OrderPage from "@/views/orders/OrderPage.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/users", component: UserPage, meta: { requiresAuth: true } },
  { path: "/orders", component: OrderPage, meta: { requiresAuth: true } },
  { path: "/banks", component: BankPage, meta: { requiresAuth: true } },
  { path: "/order-statuses", component: OrderStatusesPage, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Redirect if not logged in
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.path === "/login" && token) {
    next("/");
  } else {
    next();
  }
});

export default router;
