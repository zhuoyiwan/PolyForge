import { requestJson, type ApiPayload } from "../request";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export function getApiBase(): string {
  return API_BASE;
}

export function pingApi(): Promise<ApiPayload<{ message: string }>> {
  return requestJson<{ message: string }>(`${API_BASE}/v1/ping`, { retries: 1, timeoutMs: 5000 });
}

export function healthApi(): Promise<ApiPayload<{ status: string }>> {
  return requestJson<{ status: string }>(`/health`, { retries: 0, timeoutMs: 3000 });
}
