export const SESSION_STATUS_CONFIG = {
  upcoming: {
    bg: "bg-primary-subtle text-primary",
    icon: "bi-clock",
    labelEn: "Upcoming",
    labelAr: "قادمة",
  },
  active: {
    bg: "bg-success-subtle text-success",
    icon: "bi-play-circle-fill",
    labelEn: "Active",
    labelAr: "نشطة",
  },
  completed: {
    bg: "bg-secondary-subtle text-secondary",
    icon: "bi-check-circle-fill",
    labelEn: "Completed",
    labelAr: "مكتملة",
  },
  cancelled: {
    bg: "bg-danger-subtle text-danger",
    icon: "bi-x-circle-fill",
    labelEn: "Cancelled",
    labelAr: "ملغاة",
  },
};

export const getSessionStatusConfig = (status) =>
  SESSION_STATUS_CONFIG[status] ?? {
    bg: "bg-light text-dark",
    icon: "bi-circle",
    labelEn: status ?? "—",
    labelAr: status ?? "—",
  };
