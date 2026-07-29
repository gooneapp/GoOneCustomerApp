/**
 * GoOne Customer App — Full API Client
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__
  ? 'http://localhost:4000/api/v1'
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

// Reshapes the real backend business row — camelCase fields + nested
// `category: {id, name}` — into the flat shape Home/Shop already read
// ({category_id, category_name, location: {lat, lng}}). Exported so screens
// can reuse it if they ever map a single business outside listBusinesses.
export function mapBusiness(raw: any) {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    category_id: raw.category?.id,
    category_name: raw.category?.name,
    location: { lat: raw.locationLat, lng: raw.locationLng },
    address: raw.address,
  };
}

export interface ListBusinessesParams {
  // NOTE: the real backend schema (nearbyBusinessesSchema) has no
  // `.optional()` on lat/lng — a request without them will 400. They are
  // typed optional here only so this signature doesn't break the existing
  // HomeScreen/ShopScreen call sites (which don't pass them yet) while
  // those screens are reworked in a separate pass to source them from
  // useLocationStore(). Always pass both in new code.
  lat?: number;
  lng?: number;
  radius?: number;
  category_id?: string;
  page?: number;
  limit?: number;
}

export const catalogApi = {
  // Backend route is /businesses/nearby (no /customer prefix). There is no
  // server-side `search` param, so none is sent here — screens filter
  // client-side over the fetched list instead.
  listBusinesses: async (params?: ListBusinessesParams) => {
    const data = await req<{ businesses: any[]; meta?: any }>({
      method: 'GET',
      url: '/businesses/nearby',
      params,
    });
    return { ...data, businesses: (data?.businesses || []).map(mapBusiness) };
  },
  getBusinessDetail: (id: string) => req<any>({ method: 'GET', url: `/businesses/${id}` }),
  getProducts: (businessId: string, params?: any) => req<any>({ method: 'GET', url: `/businesses/${businessId}/products`, params }),
  searchProducts: (params: any) => req<any>({ method: 'GET', url: '/customer/products/search', params }),
  getCategories: () => req<any[]>({ method: 'GET', url: '/categories' }),
};

export const placesApi = {
  autocomplete: (input: string, sessionToken: string) =>
    req<{ predictions: { placeId: string; description: string }[] }>({
      method: 'GET',
      url: '/places/autocomplete',
      params: { input, session_token: sessionToken },
    }),
  details: (placeId: string, sessionToken: string) =>
    req<{ lat: number; lng: number; formattedAddress: string }>({
      method: 'GET',
      url: '/places/details',
      params: { place_id: placeId, session_token: sessionToken },
    }),
  reverseGeocode: (lat: number, lng: number) =>
    req<{ formattedAddress: string | null }>({
      method: 'GET',
      url: '/places/reverse-geocode',
      params: { lat, lng },
    }),
};

export const notificationsApi = {
  list: () => req<any[]>({ method: 'GET', url: '/notifications' }),
  markRead: (id: string) => req<any>({ method: 'PATCH', url: `/notifications/${id}/read` }),
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
