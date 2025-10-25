import "./assets/main.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Инициализация OneSignal после загрузки страницы
import './utils/onesignal';

createApp(App).use(router).mount("#app");
