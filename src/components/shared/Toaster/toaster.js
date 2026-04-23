import { createElement } from "react";
import toast from "react-hot-toast";

// ================================================================
// دالة مساعدة لمعرفة اتجاه اللغة الحالية
// نعتمد على dir الـ document وهو الأكثر موثوقية لأنه يُحدَّث مع كل تغيير لغة
// ================================================================
const isRTL = () => document.documentElement.dir === "rtl";

// ================================================================
// أيقونات Bootstrap بدون إيموجي — نُنشئها كـ React elements
// ================================================================
const Icon = (cls, color) =>
  createElement("i", {
    className: `bi ${cls}`,
    style: { fontSize: "1.1rem", color, flexShrink: 0 },
  });

// ================================================================
// ثيم الألوان الموحد بهوية الموقع (أبيض / أحمر / أسود)
// ================================================================
const THEME = {
  success: {
    bg: "#fff",
    color: "#1a1a1a",
    border: "3px solid #be1522",
    iconEl: Icon("bi-check-circle-fill", "#be1522"),
  },
  error: {
    bg: "#fff",
    color: "#1a1a1a",
    border: "3px solid #7f0d15",
    iconEl: Icon("bi-x-circle-fill", "#7f0d15"),
  },
  warning: {
    bg: "#fff",
    color: "#1a1a1a",
    border: "3px solid #be1522",
    iconEl: Icon("bi-exclamation-triangle-fill", "#be1522"),
  },
  info: {
    bg: "#fff",
    color: "#1a1a1a",
    border: "3px solid #1a1a1a",
    iconEl: Icon("bi-info-circle-fill", "#1a1a1a"),
  },
  brand: {
    bg: "#be1522",
    color: "#fff",
    border: "3px solid #9a111b",
    iconEl: Icon("bi-person-check-fill", "#fff"),
  },
};

// الإعدادات الأساسية المشتركة
const baseStyle = {
  fontFamily: "inherit",
  fontSize: "0.9rem",
  fontWeight: "500",
  borderRadius: "10px",
  padding: "12px 16px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  maxWidth: "400px",
  lineHeight: "1.5",
};

// ================================================================
// الدالة الكاستوم الرئيسية — ابعت البيانات من أي مكوّن
// ================================================================

/**
 * toastCustom — إشعار مخصص بالكامل
 *
 * @param {Object} options
 * @param {string} options.message - نص الرسالة (مطلوب)
 * @param {"success"|"error"|"warning"|"info"|"brand"|"loading"} [options.type="success"]
 * @param {string}  [options.bsIcon] - كلاس Bootstrap Icon بدل الأفتراضي (مثل: "bi-trash-fill")
 * @param {number}  [options.duration=4000]
 * @param {string}  [options.id] - معرف فريد لمنع التكرار
 *
 * @example
 * toastCustom({ message: "تم الحفظ", type: "success" });
 * toastCustom({ message: "خطأ في الشبكة", type: "error", bsIcon: "bi-wifi-off" });
 */
export const toastCustom = ({
  message,
  type = "success",
  bsIcon,
  duration = 4000,
  id,
} = {}) => {
  // تحديد الاتجاه من الـ document مباشرة
  const dir = isRTL() ? "rtl" : "ltr";
  const theme = THEME[type] || THEME.success;

  // إذا كان loading نستخدم toast.loading بشكل مبسط
  if (type === "loading") {
    return toast.loading(message, {
      id,
      duration: Infinity,
      style: {
        ...baseStyle,
        background: "#fff",
        color: "#1a1a1a",
        border: "3px solid #1a1a1a",
        direction: dir,
      },
    });
  }

  // أيقونة مخصصة إن تم تمريرها
  const iconEl = bsIcon
    ? Icon(bsIcon, type === "brand" ? "#fff" : "#be1522")
    : theme.iconEl;

  return toast(message, {
    id,
    duration,
    icon: iconEl,
    style: {
      ...baseStyle,
      background: theme.bg,
      color: theme.color,
      border: theme.border,
      direction: dir,
    },
  });
};

// ================================================================
// دوال الاختصار الجاهزة
// ================================================================

/** إشعار نجاح */
export const toastSuccess = (message) =>
  toastCustom({ message, type: "success" });

/** إشعار خطأ */
export const toastError = (message) =>
  toastCustom({ message, type: "error" });

/** إشعار معلومة */
export const toastInfo = (message) =>
  toastCustom({ message, type: "info" });

/** إشعار تحذير */
export const toastWarning = (message) =>
  toastCustom({ message, type: "warning" });

/** إشعار تحميل — يُرجع id للتحديث أو الإغلاق لاحقاً */
export const toastLoading = (message = isRTL() ? "جارٍ التحميل..." : "Loading...") =>
  toastCustom({ message, type: "loading" });

/** إغلاق إشعار بالـ id */
export const toastDismiss = (id) => toast.dismiss(id);

/** إشعار ترحيب بعد تسجيل الدخول */
export const toastWelcome = (username) =>
  toastCustom({
    message: isRTL()
      ? `مرحباً بك، ${username}!`
      : `Welcome back, ${username}!`,
    type: "brand",
    duration: 5000,
  });

/** إشعار إنشاء حساب جديد */
export const toastAccountCreated = () =>
  toastCustom({
    message: isRTL() ? "تم إنشاء حسابك بنجاح!" : "Account created successfully!",
    type: "success",
    bsIcon: "bi-person-check-fill",
  });

/** إشعار إرسال نموذج التواصل */
export const toastContactSent = () =>
  toastCustom({
    message: isRTL()
      ? "تم إرسال رسالتك بنجاح"
      : "Your message has been sent successfully",
    type: "success",
    bsIcon: "bi-send-check-fill",
  });
