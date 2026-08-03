import axios from "axios";
import { notifyAxiosForbidden } from "../contexts/ForbiddenContext";
import { notifyRoleMismatch } from "../utils/authEvents";

const ALLOWED_WHEN_FORBIDDEN = ["/profile", "/logout", "/login"];

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

  // Exam endpoints return 403 for closed attempts — handled in the exam UI.
  if (isExamFlowRequest(url)) {
    return false;
  }

  return code === "FORBIDDEN" || !code;
}

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

    if (shouldTriggerGlobalForbidden(error)) {
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
