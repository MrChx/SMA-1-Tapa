/**
 * Per-tab authenticated fetch.
 * Reads session token from sessionStorage (per-tab) and sends it
 * as an Authorization header so multiple tabs can use different accounts.
 */
export function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("session_token") : null;
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
