// Utility to get backend URL based on environment
export function getBackendUrl() {
  if (typeof window !== "undefined") {
    // Client-side: use relative or env var
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }
  // Server-side: use env var or fallback
  return process.env.BACKEND_URL || "http://localhost:3001";
}
