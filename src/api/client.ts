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

// Registration seam for a terminally-failed token refresh (see the response
// interceptor's catch block below). authStore.ts registers a callback here
// so it can reset isAuthenticated/user when the refresh token itself has
// expired — without this, the store keeps believing the user is logged in
// and every subsequent request silently 401s forever.
let onAuthExpired: (() => void) | null = null;
export const setOnAuthExpired = (cb: () => void) => { onAuthExpired = cb; };

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
        onAuthExpired?.();
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
  if (!raw) return null;
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
    // Backend returns the array directly as the envelope's `data` (with
    // `meta` as a sibling of `data`, not nested inside it) — NOT
    // `{ businesses: [...] }`. req() already unwraps to response.data.data,
    // so here that's the array itself.
    const businesses = await req<any[]>({
      method: 'GET',
      url: '/businesses/nearby',
      params,
    });
    return { businesses: (businesses || []).map(mapBusiness) };
  },
  // Backend now throws a proper NotFoundError (404) for a deleted/nonexistent
  // business instead of silently returning null — the mapBusiness null guard
  // above is defense-in-depth only; the real 404 surfaces via the caller's
  // own catch block.
  getBusinessDetail: async (id: string) => mapBusiness(await req<any>({ method: 'GET', url: `/businesses/${id}` })),
  getProducts: (businessId: string, params?: any) => req<any>({ method: 'GET', url: `/businesses/${businessId}/products`, params }),
  getCategories: () => req<any[]>({ method: 'GET', url: '/categories' }),
};

export const placesApi = {
  autocomplete: (input: string, sessionToken: string) =>
    req<{ placeId: string; description: string }[]>({
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

// Reshapes the real backend order row (camelCase, nested `business`/`items`)
// into the flat shape the Orders screens read. Returns null for a null/
// undefined input so callers (getById after a 404-turned-null response, or
// any other defensive path) don't crash dereferencing a missing order.
function mapOrder(raw: any) {
  if (!raw) return null;
  return {
    id: raw.id,
    business_id: raw.businessId,
    business_name: raw.business?.name,
    status: raw.status,
    total_amount: raw.totalAmount,
    payment_status: raw.paymentStatus,
    created_at: raw.createdAt,
    note: raw.note,
    items: (raw.items || []).map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    })),
  };
}

export const ordersApi = {
  // idempotencyKey is accepted (not generated here) — CheckoutScreen already
  // owns a stable per-checkout-attempt key via a useRef, matching the same
  // pattern rideApi.book below expects from its caller.
  place: async (data: any, idempotencyKey: string) =>
    mapOrder(await req<any>({ method: 'POST', url: '/orders', data, headers: { 'Idempotency-Key': idempotencyKey } })),
  listMine: async (params?: { page?: number; limit?: number; status?: string }) => {
    const orders = await req<any[]>({ method: 'GET', url: '/orders/mine', params });
    return { orders: (orders || []).map(mapOrder) };
  },
  getById: async (id: string) => mapOrder(await req<any>({ method: 'GET', url: `/orders/${id}` })),
  cancel: async (id: string, reason: string) =>
    mapOrder(await req<any>({ method: 'PATCH', url: `/orders/${id}/status`, data: { status: 'cancelled', reason } })),
};

export interface EstimateFareRequest {
  vehicle_type: 'auto' | 'car';
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  booking_type?: 'instant' | 'scheduled';
  // Required by the backend when booking_type='scheduled' — ISO 8601, must be a future instant.
  scheduled_at?: string;
}

export interface RideEstimate {
  fare: number;
  distance_km: number;
  duration_min: number;
  vehicle_type: 'auto' | 'car';
  // Decoded route path (pickup → drop) for drawing on the map; null when
  // the backend's Directions lookup failed and it fell back to haversine.
  polyline: { lat: number; lng: number }[] | null;
}

export interface RideRequestDto {
  id: string;
  status: string;
  vehicle_type: 'auto' | 'car';
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  booking_type?: 'instant' | 'scheduled';
  scheduled_at?: string | null;
}

export interface RideDto {
  id: string;
  status: string;
  fareAmount?: number;
  otpCode?: string;
}

export interface ActiveRideDto {
  request_id: string;
  ride_id: string | null;
  status: string;
  vehicle_type: 'auto' | 'car';
  pickup_lat: number;
  pickup_lng: number;
  drop_lat: number;
  drop_lng: number;
  estimated_distance_km: number;
  fare_amount: number | null;
  otp_code: string | null;
  partner: { name: string; phone: string } | null;
}

export const rideApi = {
  estimateFare: (data: EstimateFareRequest) =>
    req<RideEstimate>({ method: 'POST', url: '/rides/estimate', data }),
  // Reuses EstimateFareRequest for the request body — both endpoints post the
  // same coordinate/vehicle_type payload; book() additionally requires an
  // Idempotency-Key so a retried tap doesn't create two ride requests.
  book: (data: EstimateFareRequest, idempotencyKey: string) =>
    req<{ ride_request: RideRequestDto; ride: RideDto | null }>({
      method: 'POST',
      url: '/rides/request',
      data,
      headers: { 'Idempotency-Key': idempotencyKey },
    }),
  getActive: () => req<ActiveRideDto | null>({ method: 'GET', url: '/rides/active' }),
  cancel: (requestId: string, reason: string) =>
    req<RideRequestDto>({ method: 'PATCH', url: `/rides/requests/${requestId}/cancel`, data: { reason } }),
  listHistory: (params?: { limit?: number }) =>
    req<RideRequestDto[]>({ method: 'GET', url: '/rides/history', params }),
};

export default api;
