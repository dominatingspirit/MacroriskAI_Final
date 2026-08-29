import type { ApiErrorBody } from "./types";

/**
 * The backend has no environment-driven base URL of its own (main.py binds
 * uvicorn to 0.0.0.0:8000; the reference index.html hardcodes 127.0.0.1:8000).
 * We make it configurable here without touching the backend.
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://127.0.0.1:8000";
}

export type ApiErrorKind = "network" | "http" | "parse";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly detail: string;

  constructor(kind: ApiErrorKind, status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Thin fetch wrapper shared by every endpoint function. Every non-2xx
 * response from this backend is FastAPI's standard {"detail": "..."} shape
 * (see the dossier's per-route error tables), so we surface `detail`
 * directly wherever it's available.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const { method = "GET", body, signal } = options;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError(
      "network",
      0,
      `Could not reach the MacroRisk AI backend at ${getApiBaseUrl()}. Is it running?`,
    );
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}.`;
    try {
      const body = (await response.json()) as ApiErrorBody | Record<string, unknown>;
      if (typeof (body as ApiErrorBody).detail === "string") {
        detail = (body as ApiErrorBody).detail;
      } else if (Array.isArray((body as { detail?: unknown }).detail)) {
        // FastAPI 422 validation errors return detail as an array of issue objects.
        const issues = (body as { detail: Array<{ msg?: string; loc?: unknown[] }> }).detail;
        detail = issues
          .map((issue) => {
            const field = Array.isArray(issue.loc) ? issue.loc.at(-1) : undefined;
            return field ? `${field}: ${issue.msg ?? "invalid"}` : issue.msg ?? "invalid request";
          })
          .join("; ");
      }
    } catch {
      // response body wasn't JSON — fall back to the generic message above
    }
    throw new ApiError("http", response.status, detail);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("parse", response.status, "The backend returned a response that could not be parsed as JSON.");
  }
}
