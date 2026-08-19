export const ATTENDANCE_CHART_COLORS = {
  present: "#198754",
  late: "#ffc107",
  absent: "#dc3545",
  not_marked: "#adb5bd",
};

export const ATTENDANCE_STATUS_ORDER = ["present", "late", "absent", "not_marked"];

export function resolveSessionStatus(session) {
  if (session.status !== "not_marked") {
    return session.status;
  }

  return session.session_status === "completed" ? "absent" : "not_marked";
}

export function countSessionsByStatus(sessions) {
  const counts = {
    present: 0,
    late: 0,
    absent: 0,
    not_marked: 0,
  };

  for (const session of sessions) {
    const status = resolveSessionStatus(session);
    if (status in counts) {
      counts[status] += 1;
    }
  }

  return counts;
}

export function buildAttendanceChartData({ counts, getLabel }) {
  const labels = [];
  const data = [];
  const backgroundColor = [];

  for (const status of ATTENDANCE_STATUS_ORDER) {
    const value = counts[status] ?? 0;
    if (value <= 0) {
      continue;
    }

    labels.push(getLabel(status));
    data.push(value);
    backgroundColor.push(ATTENDANCE_CHART_COLORS[status]);
  }

  if (data.length === 0) {
    return {
      labels: [getLabel("not_marked")],
      datasets: [
        {
          data: [1],
          backgroundColor: [ATTENDANCE_CHART_COLORS.not_marked],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
      isEmpty: true,
    };
  }

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
    isEmpty: false,
  };
}

export function buildAttendanceChartOptions({ isArabic, totalSessions }) {
  return {
    cutout: "70%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        rtl: isArabic,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const count = ctx.parsed ?? 0;
            const pct =
              totalSessions > 0
                ? Math.round((count / totalSessions) * 100)
                : 0;

            return ` ${ctx.label}: ${count} (${pct}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };
}
