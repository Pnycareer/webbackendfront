import axios from '../utils/axios';

const STORAGE_KEY = 'accessToken';

export function jwtDecode(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
}

export function isValidToken(token) {
  if (!token) return false;
  const decoded = jwtDecode(token);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 > Date.now();
}

export function setSession(token) {
  if (token) {
    sessionStorage.setItem(STORAGE_KEY, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
    delete axios.defaults.headers.common.Authorization;
  }
}

export function getToken() {
  return sessionStorage.getItem(STORAGE_KEY);
}
