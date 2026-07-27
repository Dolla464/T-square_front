import axiosClient from "../api/axios";
import { normalizeAuthUser } from "../utils/normalizeAuthUser";

/**
 * Fetch the authenticated user from the backend (authoritative role).
 */
export async function fetchCurrentUser() {
  const response = await axiosClient.get("/user");
  const payload = response.data?.data ?? response.data;
  return normalizeAuthUser(payload);
}
