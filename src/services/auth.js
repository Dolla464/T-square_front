import axiosClient, { initCsrf } from "../api/axios";
import { normalizeAuthUser } from "../utils/normalizeAuthUser";

/**
 * Fetch the authenticated user from the backend (authoritative role).
 */
export async function fetchCurrentUser() {
  const response = await axiosClient.get("/user", {
    validateStatus: (status) => status === 200 || status === 401,
  });

  if (response.status === 401) {
    const error = new Error("Unauthenticated");
    error.response = response;
    throw error;
  }

  const payload = response.data?.data ?? response.data;
  return normalizeAuthUser(payload);
}

export async function ensureCsrfCookie() {
  await initCsrf();
}
