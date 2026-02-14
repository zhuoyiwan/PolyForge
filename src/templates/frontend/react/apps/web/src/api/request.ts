export type ApiPayload<T = unknown> = {
  code: number;
  message: string;
  data: T;
  traceId: string;
  timestamp: string;
};

export class ApiRequestError extends Error {
  status: number;
  code: number | null;
  traceId: string | null;
  retryable: boolean;

  constructor(message: string, status: number, code: number | null, traceId: string | null, retryable: boolean) {
    super(message);
    this.status = status;
    this.code = code;
    this.traceId = traceId;
    this.retryable = retryable;
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
};

const DEFAULT_TIMEOUT_MS = 5000;

function randomTraceId(): string {
  return `web-${Math.random().toString(16).slice(2, 10)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof payload === "string" && payload.trim()) {
    return payload.slice(0, 160);
  }
  return `HTTP ${status}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function requestJson<T = unknown>(url: string, options: RequestOptions = {}): Promise<ApiPayload<T>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? 0;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const traceId = randomTraceId();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Trace-Id": traceId,
        ...(options.headers ?? {}),
      };

      const response = await fetch(url, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });

      const raw = await parseResponseBody(response);
      if (!response.ok) {
        const retryable = response.status >= 500;
        const code = typeof raw === "object" && raw && "code" in raw ? Number((raw as { code: unknown }).code) : null;
        const respTraceId = typeof raw === "object" && raw && "traceId" in raw ? String((raw as { traceId: unknown }).traceId) : null;
        const error = new ApiRequestError(makeErrorMessage(response.status, raw), response.status, code, respTraceId, retryable);
        if (retryable && attempt < retries) {
          await delay(200 * (attempt + 1));
          continue;
        }
        throw error;
      }

      if (!raw || typeof raw !== "object") {
        throw new ApiRequestError("invalid non-JSON response body", response.status, null, null, response.status >= 500);
      }

      return raw as ApiPayload<T>;
    } catch (error) {
      const retryable = error instanceof ApiRequestError ? error.retryable : true;
      if (attempt < retries && retryable) {
        await delay(200 * (attempt + 1));
        continue;
      }
      if (error instanceof ApiRequestError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiRequestError("request timeout", 408, null, null, true);
      }
      throw new ApiRequestError(error instanceof Error ? error.message : String(error), 0, null, null, true);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new ApiRequestError("request failed", 0, null, null, true);
}
