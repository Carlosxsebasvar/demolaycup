import { hc } from "hono/client";
import type { AppType } from "../../api";

const client = hc<AppType>("/");
export const api = client.api;

// Helper para llamadas API autenticadas
export function authFetch(token: string | null, url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
}
