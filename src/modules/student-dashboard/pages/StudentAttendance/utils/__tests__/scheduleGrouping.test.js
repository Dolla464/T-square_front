import { describe, it, expect, vi, afterEach } from "vitest";
import { groupScheduleByDate } from "../scheduleGrouping";

describe("groupScheduleByDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups sessions into today, tomorrow, this week, and later buckets", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-02T10:00:00"));

    const schedule = [
      { session_id: 1, session_date: "2026-10-02", course_title: "A" },
      { session_id: 2, session_date: "2026-10-03", course_title: "B" },
      { session_id: 3, session_date: "2026-10-05", course_title: "C" },
      { session_id: 4, session_date: "2026-10-20", course_title: "D" },
    ];

    const t = (key) => key.split(".").pop();
    const groups = groupScheduleByDate(schedule, t);

    expect(groups.map((group) => group.key)).toEqual([
      "today",
      "tomorrow",
      "thisWeek",
      "later",
    ]);
    expect(groups[0].items).toHaveLength(1);
    expect(groups[3].items[0].course_title).toBe("D");
  });
});
