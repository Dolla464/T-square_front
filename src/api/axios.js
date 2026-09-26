import axios from "axios";
import { notifyAxiosForbidden } from "../contexts/ForbiddenContext";
import { notifyRoleMismatch, notifySessionExpired } from "../utils/authEvents";
import { initCsrf, readCsrfToken } from "./csrf";
import { resolveAxiosBaseUrl } from "../utils/resolveApiOrigin";

const ALLOWED_WHEN_FORBIDDEN = ["/profile", "/logout", "/login"];

const SESSION_EXPIRY_SKIP_URLS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const EXAM_FLOW_URL_PATTERN = /\/exams\/(?:save-answer|\d+\/submit)/;

function isExamFlowRequest(url = "") {
  return EXAM_FLOW_URL_PATTERN.test(url);
}

function shouldTriggerGlobalForbidden(error) {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  const url = error.config?.url || "";

  if (status !== 403) {
    return false;
  }

  if (isExamFlowRequest(url)) {
    return false;
  }

  return code === "FORBIDDEN" || !code;
}

let accessForbidden = false;
let sessionExpiredHandled = false;

export function resetAccessForbidden() {
  accessForbidden = false;
}

export function resetSessionExpiredHandled() {
  sessionExpiredHandled = false;
}

function shouldHandleSessionExpired(error) {
  const status = error.response?.status;
  const url = error.config?.url || "";

  if (status !== 401 && status !== 419) {
    return false;
  }

  return !SESSION_EXPIRY_SKIP_URLS.some((path) => url.includes(path));
}

function isAllowedWhenForbidden(url = "") {
  return ALLOWED_WHEN_FORBIDDEN.some((path) => url.includes(path));
}

function getCachedSessionUserRole() {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.role ?? null;
  } catch {
    return null;
  }
}

function shouldSkipMaintenanceRedirect() {
  if (window.location.pathname.startsWith("/admin")) {
    return true;
  }

  return getCachedSessionUserRole() === "admin";
}

const resolveBaseUrl = () => resolveAxiosBaseUrl();

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 150000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  if (accessForbidden && !isAllowedWhenForbidden(config.url || "")) {
    return Promise.reject(new axios.CanceledError("Request blocked after 403"));
  }

  const csrfToken = readCsrfToken();
  if (csrfToken) {
    config.headers["X-XSRF-TOKEN"] = csrfToken;
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
    const status = error.response?.status;

    if (shouldTriggerGlobalForbidden(error)) {
      accessForbidden = true;
      notifyAxiosForbidden(error.config?.url || null);
      notifyRoleMismatch();
    } else if (shouldHandleSessionExpired(error) && !sessionExpiredHandled) {
      sessionExpiredHandled = true;
      notifySessionExpired();
    }

    if (error.response && status === 503) {
      if (
        !shouldSkipMaintenanceRedirect() &&
        window.location.pathname !== "/maintenance" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/maintenance";
      }
    }

    return Promise.reject(error);
  },
);

export { initCsrf };
export default axiosClient;
