import axios from "axios";

const axiosClient = axios.create({
  baseURL:
    window.APP_CONFIG && window.APP_CONFIG.API_URL
      ? window.APP_CONFIG.API_URL
      : "http://127.0.0.1:8000/api",
  timeout: 10000,
  // تم حذف withCredentials: true لأننا نستخدم Bearer Token
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // فقط هذا التعديل - للتعامل مع FormData
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (config.data && typeof config.data === "object") {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

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
