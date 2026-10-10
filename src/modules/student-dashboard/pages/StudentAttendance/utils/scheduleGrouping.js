function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function parseSessionDate(value) {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function groupScheduleByDate(schedule, t) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const labels = {
    today: t("attendance.scheduleGroups.today"),
    tomorrow: t("attendance.scheduleGroups.tomorrow"),
    thisWeek: t("attendance.scheduleGroups.thisWeek"),
    later: t("attendance.scheduleGroups.later"),
  };

  const buckets = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  };

  (schedule ?? []).forEach((item) => {
    const sessionDate = parseSessionDate(item.session_date);
    if (!sessionDate) {
      buckets.later.push(item);
      return;
    }

    const day = startOfDay(sessionDate).getTime();

    if (day === today.getTime()) {
      buckets.today.push(item);
      return;
    }

    if (day === tomorrow.getTime()) {
      buckets.tomorrow.push(item);
      return;
    }

    if (sessionDate >= today && sessionDate < weekEnd) {
      buckets.thisWeek.push(item);
      return;
    }

    buckets.later.push(item);
  });

  return [
    { key: "today", label: labels.today, items: buckets.today },
    { key: "tomorrow", label: labels.tomorrow, items: buckets.tomorrow },
    { key: "thisWeek", label: labels.thisWeek, items: buckets.thisWeek },
    { key: "later", label: labels.later, items: buckets.later },
  ].filter((group) => group.items.length > 0);
}
