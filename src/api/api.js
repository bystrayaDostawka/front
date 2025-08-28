import axios from "axios";

const API_URL = 'http://courier.local/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Если используете Vue Router:
      // import router from '@/router';
      // router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
