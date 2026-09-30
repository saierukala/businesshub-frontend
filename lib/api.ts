// Single fetch wrapper for the browser. Every call goes to /api/* (rewritten to the backend).
// Errors from the API have the shape { error: { code, message, details } } and are thrown as ApiError.

export type FieldIssue = { path: string; message: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: unknown[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }

  // Validation errors from Zod on the backend: [{ path: "email", message: "..." }]
  get fieldIssues(): FieldIssue[] {
    return this.details.filter(
      (d): d is FieldIssue =>
        typeof d === "object" && d !== null && "path" in d && "message" in d,
    );
  }
}

type Options = { method?: string; body?: unknown };

// { q: "ravi", page: 2, customerId: undefined } -> "?q=ravi&page=2" (skips empty values)
export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function api<T = unknown>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const e = data?.error;
    throw new ApiError(
      res.status,
      e?.code ?? "UNKNOWN_ERROR",
      e?.message ?? "Something went wrong. Please try again.",
      Array.isArray(e?.details) ? e.details : [],
    );
  }
  return data as T;
}
