export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

/** Same fetch path in mock and real mode. MSW intercepts mock requests. */
export async function requestJson(
  url: string,
  init: RequestInit = {},
): Promise<unknown> {
  const timeout = AbortSignal.timeout(15_000);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeout])
    : timeout;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(new URL(url, window.location.origin), {
      ...init,
      signal,
      headers,
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new ApiError(
      timeout.aborted
        ? "The request timed out. Please try again."
        : "Cannot reach the API. Check your connection and try again.",
      0,
    );
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const detail =
      body && typeof body === "object" && "detail" in body ? body.detail : null;
    throw new ApiError(
      typeof detail === "string"
        ? detail
        : `Request failed (${response.status}).`,
      response.status,
    );
  }
  return body;
}
