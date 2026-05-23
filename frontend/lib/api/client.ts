export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export type ApiQueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  body?: unknown;
  headers?: HeadersInit;
  query?: Record<string, ApiQueryValue>;
  signal?: AbortSignal;
  /**
   * Auth UI is intentionally not implemented yet. Supply a Sanctum bearer
   * token here once an authenticated frontend session is introduced.
   */
  token?: string | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export class ApiValidationError extends ApiError {
  readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>, payload?: unknown) {
    super(message, 422, payload);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

export class ApiUnauthorizedError extends ApiError {
  constructor(message = "Authentication is required.", payload?: unknown) {
    super(message, 401, payload);
    this.name = "ApiUnauthorizedError";
  }
}

export class ApiNetworkError extends Error {
  readonly cause?: unknown;

  constructor(message = "Unable to reach the Novera API.", cause?: unknown) {
    super(message);
    this.name = "ApiNetworkError";
    this.cause = cause;
  }
}

async function request<T>(method: string, path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiNetworkError(undefined, error);
  }

  const payload = await parseJson(response);

  if (!response.ok) {
    throwResponseError(response.status, payload);
  }

  return payload as T;
}

function buildUrl(path: string, query?: Record<string, ApiQueryValue>) {
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const url = new URL(path.replace(/^\//, ""), base);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseJson(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiError("The API returned an invalid JSON response.", response.status, text);
  }
}

function throwResponseError(status: number, payload: unknown): never {
  const message = readMessage(payload) ?? `API request failed with status ${status}.`;

  if (status === 401) {
    throw new ApiUnauthorizedError(message, payload);
  }

  if (status === 422) {
    throw new ApiValidationError(message, readValidationErrors(payload), payload);
  }

  throw new ApiError(message, status, payload);
}

function readMessage(payload: unknown): string | undefined {
  if (isRecord(payload) && typeof payload.message === "string") {
    return payload.message;
  }

  return undefined;
}

function readValidationErrors(payload: unknown): Record<string, string[]> {
  if (!isRecord(payload) || !isRecord(payload.errors)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(payload.errors).flatMap(([field, value]) => {
      if (!Array.isArray(value)) {
        return [];
      }

      return [[field, value.filter((item): item is string => typeof item === "string")]];
    }),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<ApiRequestOptions, "body">) {
    return request<T>("GET", path, options);
  },
  post<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">) {
    return request<T>("POST", path, { ...options, body });
  },
  put<T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, "body">) {
    return request<T>("PUT", path, { ...options, body });
  },
  delete<T>(path: string, options?: Omit<ApiRequestOptions, "body">) {
    return request<T>("DELETE", path, options);
  },
};
