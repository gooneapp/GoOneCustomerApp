/**
 * GoOne Customer App — Full API Client
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5001/api/v1'
  : 'https://api.goone.tech/api/v1';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (at: string, rt: string) => { accessToken = at; refreshToken = rt; };
export const clearTokens = () => { accessToken = null; refreshToken = null; };

const api: AxiosInstance = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  if (!accessToken) accessToken = await AsyncStorage.getItem('access_token');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let isRefreshing = false;
let queue: any[] = [];
const processQueue = (error: any, token: string | null) => {
  queue.forEach((p) => error ? p.reject(error) : p.resolve(token!));
  queue = [];
};

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const orig = error.config as any;
    if (error.response?.status === 401 && !orig._retry) {
      if (isRefreshing) return new Promise((resolve, reject) => { queue.push({ resolve, reject }); }).then((t) => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
      orig._retry = true; isRefreshing = true;
      try {
        const rt = refreshToken || await AsyncStorage.getItem('refresh_token');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: rt });
        accessToken = data.data.access_token; refreshToken = data.data.refresh_token;
        await AsyncStorage.multiSet([['access_token', accessToken!], ['refresh_token', refreshToken!]]);
        processQueue(null, accessToken);
        orig.headers.Authorization = `Bearer ${accessToken}`;
        return api(orig);
      } catch (e) {
        processQueue(e, null);
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        clearTokens();
        return Promise.reject(e);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  },
);

async function req<T>(config: AxiosRequestConfig): Promise<T> {
  const r = await api(config);
  return r.data.data as T;
}

export const authApi = {
  requestOtp: (phone_number: string, purpose: string) => req<any>({ method: 'POST', url: '/auth/otp/request', data: { phone_number, purpose } }),
  verifyOtp: (phone_number: string, otp: string, purpose: string) => req<any>({ method: 'POST', url: '/auth/otp/verify', data: { phone_number, otp, purpose } }),
  setPassword: (setup_token: string, password: string, name: string, preferred_language: string) => req<any>({ method: 'POST', url: '/auth/set-password', data: { setup_token, password, name, preferred_language } }),
  login: (phone_number: string, password: string) => req<any>({ method: 'POST', url: '/auth/login', data: { phone_number, password } }),
  recordConsent: (document_type: string, version: string) => req<any>({ method: 'POST', url: '/auth/consent', data: { document_type, version } }),
  logout: () => api.post('/auth/logout'),
};

export const catalogApi = {
  listBusinesses: (params?: any) => req<any>({ method: 'GET', url: '/customer/businesses', params }),
  getBusinessDetail: (id: string) => req<any>({ method: 'GET', url: `/customer/businesses/${id}` }),
  getProducts: (businessId: string, params?: any) => req<any>({ method: 'GET', url: `/customer/businesses/${businessId}/products`, params }),
  searchProducts: (params: any) => req<any>({ method: 'GET', url: '/customer/products/search', params }),
  getCategories: () => req<any[]>({ method: 'GET', url: '/categories' }),
};

export const ordersApi = {
  place: (data: any, idempotencyKey: string) => req<any>({ method: 'POST', url: '/orders', data, headers: { 'Idempotency-Key': idempotencyKey } }),
  listMine: (params?: any) => req<any>({ method: 'GET', url: '/customer/orders', params }),
  getById: (id: string) => req<any>({ method: 'GET', url: `/orders/${id}` }),
  cancel: (id: string, reason: string) => req<any>({ method: 'PATCH', url: `/orders/${id}/status`, data: { status: 'cancelled', reason } }),
};

export const rideApi = {
  estimateFare: (data: any) => req<any>({ method: 'POST', url: '/rides/estimate', data }),
  book: (data: any, idempotencyKey: string) => req<any>({ method: 'POST', url: '/rides', data, headers: { 'Idempotency-Key': idempotencyKey } }),
  getActive: () => req<any>({ method: 'GET', url: '/rides/active' }),
  cancel: (id: string, reason: string) => req<any>({ method: 'PATCH', url: `/rides/${id}/cancel`, data: { reason } }),
  listHistory: (params?: any) => req<any>({ method: 'GET', url: '/customer/rides', params }),
};

export const profileApi = {
  getProfile: () => req<any>({ method: 'GET', url: '/customer/profile' }),
  updateProfile: (data: any) => req<any>({ method: 'PATCH', url: '/customer/profile', data }),
  getAddresses: () => req<any[]>({ method: 'GET', url: '/customer/addresses' }),
  addAddress: (data: any) => req<any>({ method: 'POST', url: '/customer/addresses', data }),
};

export const creditApi = {
  getBalance: () => req<any>({ method: 'GET', url: '/customer/wallet' }),
  getExpenses: () => req<any[]>({ method: 'GET', url: '/customer/expenses' }),
  addExpense: (data: any) => req<any>({ method: 'POST', url: '/customer/expenses', data }),
};

export default api;
