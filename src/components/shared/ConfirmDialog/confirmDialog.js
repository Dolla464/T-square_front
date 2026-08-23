import Swal from "sweetalert2";

// ================================================================
// دالة مساعدة لمعرفة اتجاه اللغة الحالية
// الأكثر موثوقية: نقرأ dir من الـ document مباشرة
// ================================================================
const isRTL = () => document.documentElement.dir === "rtl";

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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
      <h2 class="swal-custom-title">${escapeHtml(title)}</h2>
      ${message  ? `<p class="swal-custom-msg">${escapeHtml(message)}</p>` : ""}
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

/**
 * showInputDialog — نافذة إدخال نصية بهوية الموقع
 *
 * @returns {Promise<string|null>} القيمة المدخلة أو null عند الإلغاء
 */
export const showInputDialog = async ({
  title = "",
  message = "",
  inputPlaceholder = "",
  confirmText,
  cancelText,
  icon = "info",
  variant = "primary",
  requiredMessage,
} = {}) => {
  const rtl = isRTL();
  const resolvedConfirm = confirmText ?? (rtl ? "تأكيد" : "Confirm");
  const resolvedCancel = cancelText ?? (rtl ? "إلغاء" : "Cancel");
  const resolvedRequired =
    requiredMessage ?? (rtl ? "هذا الحقل مطلوب." : "This field is required.");

  const colorConfig = CONFIRM_COLORS[variant] || CONFIRM_COLORS.primary;
  const iconHtml = ICONS_HTML[icon] || ICONS_HTML.info;

  const popupHtml = `
    <div class="swal-inner swal-inner--input" dir="${rtl ? "rtl" : "ltr"}">
      ${iconHtml}
      <h2 class="swal-custom-title">${escapeHtml(title)}</h2>
      ${message ? `<p class="swal-custom-msg">${escapeHtml(message)}</p>` : ""}
    </div>
  `;

  const result = await Swal.fire({
    html: popupHtml,
    input: "text",
    inputPlaceholder: inputPlaceholder || title,
    inputAttributes: {
      dir: rtl ? "rtl" : "ltr",
      autocapitalize: "off",
      autocorrect: "off",
    },
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: resolvedConfirm,
    cancelButtonText: resolvedCancel,
    confirmButtonColor: colorConfig.bg,
    cancelButtonColor: "#e5e7eb",
    allowOutsideClick: false,
    allowEscapeKey: true,
    target: document.body,
    focusConfirm: false,
    customClass: {
      popup: "tsq-swal-popup tsq-swal-popup--input",
      actions: "tsq-swal-actions",
      confirmButton: "tsq-swal-confirm",
      cancelButton: "tsq-swal-cancel",
      input: "tsq-swal-input",
    },
    preConfirm: (value) => {
      const trimmed = value?.trim();
      if (!trimmed) {
        Swal.showValidationMessage(resolvedRequired);
        return false;
      }
      return trimmed;
    },
  });

  return result.isConfirmed ? result.value : null;
};

/** نافذة تأكيد خاصة بحالة الدفع (تظهر زرين للاختيار وزر كبير للإلغاء) */
export const showPaymentStatusConfirm = async (currentStatus) => {
  const rtl = isRTL();

  const statuses = {
    pending: { id: "pending", label: rtl ? "قيد الانتظار" : "Pending", color: "#ffc107", icon: '<i class="bi bi-clock-history me-1"></i>' },
    completed: { id: "completed", label: rtl ? "مكتمل" : "Completed", color: "#28a745", icon: '<i class="bi bi-check-circle me-1"></i>' },
    cancelled: { id: "cancelled", label: rtl ? "ملغي" : "Cancelled", color: "#dc3545", icon: '<i class="bi bi-x-circle me-1"></i>' },
    refunded: { id: "refunded", label: rtl ? "مسترجع" : "Refunded", color: "#6c757d", icon: '<i class="bi bi-arrow-counterclockwise me-1"></i>' },
  };

  let options = [];
  if (currentStatus === "pending") {
    options = [statuses.completed, statuses.cancelled];
  } else if (currentStatus === "completed") {
    options = [statuses.refunded, statuses.cancelled];
  } else if (currentStatus === "cancelled") {
    options = [statuses.completed, statuses.pending];
  } else {
    options = [statuses.completed, statuses.cancelled];
  }

  return new Promise((resolve) => {
    Swal.fire({
      html: `
        <div class="swal-inner" dir="${rtl ? "rtl" : "ltr"}">
          <i class="bi bi-credit-card swal-bs-icon swal-icon-primary" style="color: #0d6efd"></i>
          <h2 class="swal-custom-title">${rtl ? "تغيير حالة الدفع" : "Change Payment Status"}</h2>
          <p class="swal-custom-msg mb-4">${rtl ? "اختر الحالة الجديدة لهذا الطلب:" : "Select the new status for this order:"}</p>
          <div class="d-flex flex-row justify-content-center gap-2 mb-2 w-100">
            <button id="btn-status-1" class="btn text-white flex-fill py-2 fw-bold" style="background-color: ${options[0].color}">${options[0].icon} ${options[0].label}</button>
            <button id="btn-status-2" class="btn text-white flex-fill py-2 fw-bold" style="background-color: ${options[1].color}">${options[1].icon} ${options[1].label}</button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: rtl ? "إلغاء" : "Cancel",
      cancelButtonColor: "#e5e7eb",
      customClass: {
        popup: "tsq-swal-popup",
        cancelButton: "tsq-swal-cancel w-100 mt-2 py-2 fw-bold",
      },
      didOpen: () => {
        document.getElementById("btn-status-1").addEventListener("click", () => {
          Swal.close();
          resolve(options[0].id);
        });
        document.getElementById("btn-status-2").addEventListener("click", () => {
          Swal.close();
          resolve(options[1].id);
        });
      }
    }).then((result) => {
      if (result.isDismissed) {
        resolve(null);
      }
    });
  });
};

/** نافذة مخصصة للتقييمات المعلقة (قبول، رفض، إلغاء) */
export const showReviewPendingConfirm = async () => {
  const rtl = isRTL();

  return new Promise((resolve) => {
    Swal.fire({
      html: `
        <div class="swal-inner" dir="${rtl ? "rtl" : "ltr"}">
          <i class="bi bi-chat-left-dots swal-bs-icon swal-icon-info" style="color: #ffc107"></i>
          <h2 class="swal-custom-title">${rtl ? "مراجعة التقييم المعلق" : "Review Pending Feedback"}</h2>
          <p class="swal-custom-msg mb-4">${rtl ? "برجاء اختيار الإجراء المناسب لهذا التقييم المعلق:" : "Please select the appropriate action for this pending review:"}</p>
          <div class="d-flex flex-row justify-content-center gap-2 mb-2 w-100">
            <button id="btn-accept" class="btn btn-success flex-fill py-2 fw-bold text-white border-0" style="background-color: #166534">
              <i class="bi bi-patch-check-fill me-1"></i> ${rtl ? "قبول ونشر" : "Accept"}
            </button>
            <button id="btn-reject" class="btn btn-danger flex-fill py-2 fw-bold text-white border-0" style="background-color: #be1522">
              <i class="bi bi-shield-x me-1"></i> ${rtl ? "رفض وحظر" : "Reject"}
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: rtl ? "تراجع" : "Cancel",
      cancelButtonColor: "#e5e7eb",
      customClass: {
        popup: "tsq-swal-popup",
        cancelButton: "tsq-swal-cancel w-100 mt-2 py-2 fw-bold",
      },
      didOpen: () => {
        document.getElementById("btn-accept").addEventListener("click", () => {
          Swal.close();
          resolve("accepted");
        });
        document.getElementById("btn-reject").addEventListener("click", () => {
          Swal.close();
          resolve("rejected");
        });
      }
    }).then((result) => {
      if (result.isDismissed) {
        resolve(null);
      }
    });
  });
};


