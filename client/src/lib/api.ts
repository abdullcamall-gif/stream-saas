import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ----- REQUEST: Injetar token automaticamente -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----- RESPONSE: Tratar erros globalmente -----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Erro de ligação ao servidor';

    // Token expirado → logout automático
    if (error.response?.status === 401) {
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;