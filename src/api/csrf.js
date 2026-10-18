import axios from "axios";

export const resolveApiRoot = () => window.location.origin;

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
