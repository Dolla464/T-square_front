import axios from "axios";

const axiosClient = axios.create({
  baseURL:
    window.APP_CONFIG && window.APP_CONFIG.API_URL
      ? window.APP_CONFIG.API_URL
      : "http://t-square-lms.test/api",
  timeout: 8000,
  // تم حذف withCredentials: true لأننا نستخدم Bearer Token
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 1. مراقب الطلبات المرسلة (Request Interceptor) - كودك القديم كما هو
axiosClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 2. مراقب الاستجابات القادمة (Response Interceptor) - التعديل الجديد 💥
axiosClient.interceptors.response.use(
  (response) => {
    // لو الـ API نجح ورجع داتا عادية (زي الـ 200 OK)، مرر الاستجابة بشكل طبيعي
    return response;
  },
  (error) => {
    // نجيب التوكن عشان نعرف هل اللي فاتح ده أدمن/مستخدم مسجل ولا زائر عادي
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    // ── التعديل السحري لمنع الـ Loop ──
    // حوّل لصفحة الصيانة فقط لو السيرفر رجع 503 وبشرط إن المستخدم ملوش توكن (زائر عادي)
    if (error.response && error.response.status === 503 && !token) {
      if (window.location.pathname !== "/maintenance" && window.location.pathname !== "/login") {
        window.location.href = "/maintenance";
      }
    }

    // لو معاه توكن ورجع 503، ده معناه إن التوكن لسه مسمعش في السيرفر أو فيه مشكلة في الـ Guard
    // سيبه يكمل ومتعملش Redirect عشان تكسر اللوب اللانهائية
    return Promise.reject(error);
  },
);

export default axiosClient;
