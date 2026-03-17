// =========================================================================
// API Service — Centralised fetch wrapper with JWT auth
// =========================================================================

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }

  return res.json();
}

// ── Auth ──
export async function login(email: string, password: string) {
  const data = await request<{
    _id: string; name: string; email: string; role: string; token: string;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function register(name: string, email: string, password: string, role: string) {
  const data = await request<{
    _id: string; name: string; email: string; role: string; token: string;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  setToken(data.token);
  return data;
}

// ── Environment ──
export const getEnvironmentData = () => request<any>('/environment');
export const getEnvironmentByVehicle = (vid: string) => request<any>(`/environment/${vid}`);

// ── ADAS ──
export const getADASByVehicle = (vid: string) => request<any>(`/adas/${vid}`);

// ── Safety ──
export const getSafetyPredictions = () => request<any>('/safety');
export const getSafetyByVehicle = (vid: string) => request<any>(`/safety/${vid}`);

// ── Admin dashboard ──
export const getEnvironmentSummary = () => request<any>('/admin/environment-summary');
export const getFleetRisk = () => request<any>('/admin/fleet-risk');
export const getADASSummary = () => request<any>('/admin/adas-summary');

// ── Driver dashboard ──
export const getDriverSafetyStatus = (driverId: string) => request<any>(`/driver/safety-status/${driverId}`);

// ── Generic data ──
export const getAlerts = () => request<any>('/alerts');
export const getSensorData = () => request<any>('/sensor');
export const getVehicles = () => request<any>('/vehicles');
export const getDrivers = () => request<any>('/drivers');
