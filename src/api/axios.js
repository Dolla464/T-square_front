import axios from "axios";
import { notifyAxiosForbidden } from "../contexts/ForbiddenContext";
import { notifyRoleMismatch } from "../utils/authEvents";

const ALLOWED_WHEN_FORBIDDEN = ["/profile", "/logout", "/login"];

let accessForbidden = false;

export function resetAccessForbidden() {
  accessForbidden = false;
}

function isAllowedWhenForbidden(url = "") {
  return ALLOWED_WHEN_FORBIDDEN.some((path) => url.includes(path));
}

const resolveBaseUrl = () => {
  if (window.APP_CONFIG?.API_URL) {
    return window.APP_CONFIG.API_URL;
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return "http://t-square-lms.test/api";
};

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 150000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  if (accessForbidden && !isAllowedWhenForbidden(config.url || "")) {
    return Promise.reject(new axios.CanceledError("Request blocked after 403"));
  }

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    config.timeout = 0;
  } else if (config.data && typeof config.data === "object") {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 403 && (code === "FORBIDDEN" || !code)) {
      accessForbidden = true;
      notifyAxiosForbidden(error.config?.url || null);
      notifyRoleMismatch();
    }

    if (error.response && error.response.status === 503 && !token) {
      if (
        window.location.pathname !== "/maintenance" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/maintenance";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
