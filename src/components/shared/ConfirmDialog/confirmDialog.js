import Swal from "sweetalert2";

// ================================================================
// دالة مساعدة لمعرفة اتجاه اللغة الحالية
// الأكثر موثوقية: نقرأ dir من الـ document مباشرة
// ================================================================
const isRTL = () => document.documentElement.dir === "rtl";

// ================================================================
// HTML الأيقونات (Bootstrap Icons) لحقن داخل SweetAlert2
// ================================================================
const ICONS_HTML = {
  warning: `<i class="bi bi-exclamation-triangle-fill swal-bs-icon swal-icon-warning"></i>`,
  error:   `<i class="bi bi-x-circle-fill swal-bs-icon swal-icon-error"></i>`,
  success: `<i class="bi bi-check-circle-fill swal-bs-icon swal-icon-success"></i>`,
  info:    `<i class="bi bi-info-circle-fill swal-bs-icon swal-icon-info"></i>`,
  question:`<i class="bi bi-question-circle-fill swal-bs-icon swal-icon-question"></i>`,
};

// ================================================================
// ألوان زر التأكيد حسب variant
// ================================================================
const CONFIRM_COLORS = {
  danger:    { bg: "#be1522", hover: "#9a111b" },
  primary:   { bg: "#1a1a1a", hover: "#333" },
  secondary: { bg: "#6c757d", hover: "#555" },
  success:   { bg: "#166534", hover: "#14532d" },
};

// ================================================================
// الدالة الكاستوم الرئيسية — ابعت البيانات من أي مكوّن
// ================================================================

/**
 * showConfirmCustom — نافذة تأكيد مخصصة بهوية الموقع
 *
 * @param {Object} options
 * @param {string}  options.title                 - عنوان النافذة
 * @param {string} [options.message]              - رسالة نصية
 * @param {string} [options.html]                 - محتوى HTML كامل بدل message
 * @param {string} [options.confirmText="تأكيد"]  - نص زر التأكيد
 * @param {string} [options.cancelText="إلغاء"]   - نص زر الإلغاء
 * @param {boolean}[options.showCancel=true]      - إخفاء زر الإلغاء
 * @param {"warning"|"error"|"success"|"info"|"question"} [options.icon="warning"]
 * @param {"danger"|"primary"|"secondary"|"success"} [options.variant="danger"]
 * @param {boolean}[options.allowOutside=false]   - السماح بإغلاق بالنقر خارجاً
 * @returns {Promise<boolean>}
 *
 * @example
 * const ok = await showConfirmCustom({
 *   title: "حذف الكورس",
 *   message: "هل أنت متأكد؟",
 *   icon: "warning",
 *   variant: "danger",
 * });
 * if (ok) { deleteCourse(id); }
 */
export const showConfirmCustom = async ({
  title = "",
  message = "",
  html,
  confirmText,
  cancelText,
  showCancel = true,
  icon = "warning",
  variant = "danger",
  allowOutside = false,
} = {}) => {
  // نص الأزرار يتغير تلقائياً بحسب اللغة
  const rtl = isRTL();
  const resolvedConfirm = confirmText ?? (rtl ? "تأكيد" : "Confirm");
  const resolvedCancel  = cancelText  ?? (rtl ? "إلغاء"  : "Cancel");

  const colorConfig = CONFIRM_COLORS[variant] || CONFIRM_COLORS.danger;
  const iconHtml    = ICONS_HTML[icon] || ICONS_HTML.warning;

  // بناء HTML داخل النافذة: أيقونة + العنوان + الرسالة
  const popupHtml = `
    <div class="swal-inner" dir="${rtl ? "rtl" : "ltr"}">
      ${iconHtml}
      <h2 class="swal-custom-title">${title}</h2>
      ${message  ? `<p class="swal-custom-msg">${message}</p>` : ""}
      ${html     ? `<div class="swal-custom-html">${html}</div>` : ""}
    </div>
  `;

  const result = await Swal.fire({
    html: popupHtml,

    // إخفاء الـ icon الافتراضي لـ SweetAlert2 واستخدام أيقونتنا داخل الـ HTML
    showConfirmButton: true,
    showCancelButton: showCancel,
    confirmButtonText: resolvedConfirm,
    cancelButtonText: resolvedCancel,
    confirmButtonColor: colorConfig.bg,
    cancelButtonColor: "#e5e7eb",
    allowOutsideClick: allowOutside,
    allowEscapeKey: true,
    target: document.body,

    // كلاسات مخصصة مرتبطة بـ confirmDialog.css
    customClass: {
      popup:         "tsq-swal-popup",
      actions:       "tsq-swal-actions",
      confirmButton: "tsq-swal-confirm",
      cancelButton:  "tsq-swal-cancel",
    },
  });

  return result.isConfirmed;
};

// ================================================================
// دوال الاختصار الجاهزة
// ================================================================

/** نافذة تأكيد عامة */
export const showConfirm = (options = {}) =>
  showConfirmCustom({ icon: "warning", variant: "danger", ...options });

/** نافذة تأكيد الحذف */
export const showDeleteConfirm = (itemName = "") => {
  const rtl = isRTL();
  return showConfirmCustom({
    title:       rtl ? "تأكيد الحذف"  : "Confirm Delete",
    message:     rtl
      ? `هل أنت متأكد من حذف "${itemName}"؟ لا يمكن التراجع.`
      : `Are you sure you want to delete "${itemName}"? This cannot be undone.`,
    confirmText: rtl ? "نعم، احذفه" : "Yes, Delete",
    icon: "error",
    variant: "danger",
  });
};

/** نافذة تأكيد تسجيل الخروج */
export const showLogoutConfirm = () => {
  const rtl = isRTL();
  return showConfirmCustom({
    title:       rtl ? "تسجيل الخروج" : "Sign Out",
    message:     rtl ? "هل تريد تسجيل الخروج من حسابك؟" : "Are you sure you want to sign out?",
    confirmText: rtl ? "نعم، اخرج"   : "Yes, Sign Out",
    cancelText:  rtl ? "ابقَ"         : "Stay",
    icon: "question",
    variant: "primary",
    allowOutside: true,
  });
};

/** نافذة معلومات بدون إلغاء */
export const showInfoDialog = (title, message) => {
  const rtl = isRTL();
  return showConfirmCustom({
    title,
    message,
    confirmText: rtl ? "حسناً" : "OK",
    showCancel: false,
    icon: "info",
    variant: "primary",
  });
};
