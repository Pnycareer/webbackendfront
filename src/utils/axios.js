import axios from 'axios';
import { getToken } from '../context/session';

// Create the axios instance
const instance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
});

// Interceptor: attach different tokens based on request method
instance.interceptors.request.use((config) => {
  const method = config.method.toLowerCase();

  if (method === 'get') {
    // For public GET requests, use the static token from .env
    const publicToken = import.meta.env.VITE_PUBLIC_ACCESS_TOKEN;
    if (publicToken) {
      config.headers.Authorization = `Bearer ${publicToken}`;
    }
  } else {
    // For non-GET methods, use the logged-in user's token
    const userToken = getToken();
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }

  return config;
}, (error) => Promise.reject(error));

export default instance;
