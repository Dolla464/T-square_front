import axios from "axios";
import { resolveApiOrigin, resolveAxiosBaseUrl } from "../utils/resolveApiOrigin";

export const resolveApiRoot = () => resolveApiOrigin();

export async function initCsrf() {
  await axios.get(`${resolveApiRoot()}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      Accept: "application/json",
    },
  });
}

export function readCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : "";
}
