import { getBackendUrl } from "./getBackendUrl";

export async function fetchFromBackend(path: string, options?: RequestInit) {
  const url = `${getBackendUrl()}${path.startsWith("/") ? path : "/" + path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`);
  }
  return res.json();
}
