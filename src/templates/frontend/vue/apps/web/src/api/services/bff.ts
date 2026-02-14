import { requestJson, type ApiPayload } from "../request";

const BFF_BASE = import.meta.env.VITE_BFF_BASE || "/bff";

export function getBffBase(): string {
  return BFF_BASE;
}

export function pingBff(): Promise<ApiPayload<{ message: string }>> {
  return requestJson<{ message: string }>(`${BFF_BASE}/ping`, { retries: 1, timeoutMs: 5000 });
}
