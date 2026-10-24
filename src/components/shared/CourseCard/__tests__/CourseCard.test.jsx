import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CourseCard from "../CourseCard";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../../../../utils/resolveApiOrigin", () => ({
  normalizeStorageUrl: (url) => url,
}));

const baseCourse = {
  id: 1,
  slug: "course-1",
  title: "Test Course",
  short_description: "Short description",
  duration_weeks: 4,
  duration_hours: 12,
  image: "/image.jpg",
  price: { final: 100, original: 120, discount: 20 },
  tags: [],
};

describe("CourseCard attendance badges", () => {
  it("renders multiple attendance badges", () => {
    render(
      <CourseCard
        course={{
          ...baseCourse,
          attendance_types: ["online", "offline", "hybrid"],
        }}
      />,
    );

    expect(screen.getByText("card.online")).toBeInTheDocument();
    expect(screen.getByText("card.offline")).toBeInTheDocument();
    expect(screen.getByText("card.hybrid")).toBeInTheDocument();
  });

  it("uses dir=auto on title, description, and tags", () => {
    render(
      <CourseCard
        course={{
          ...baseCourse,
          title: "كورس React المتقدم",
          short_description: "تعلم React مع مشروع Full Stack",
          tags: [{ id: 1, name: "برمجة" }],
        }}
      />,
    );

    expect(screen.getByText("كورس React المتقدم")).toHaveAttribute("dir", "auto");
    expect(screen.getByText("تعلم React مع مشروع Full Stack")).toHaveAttribute(
      "dir",
      "auto",
    );
    expect(screen.getByText("برمجة")).toHaveAttribute("dir", "auto");
    expect(screen.getByText("برمجة").closest(".course-tags")).not.toHaveAttribute(
      "dir",
      "ltr",
    );
  });

  it("does not throw when attendance_types is missing or null", () => {
    expect(() => render(<CourseCard course={baseCourse} />)).not.toThrow();
    expect(() =>
      render(<CourseCard course={{ ...baseCourse, attendance_types: null }} />),
    ).not.toThrow();

    expect(screen.queryByText("card.online")).not.toBeInTheDocument();
  });
});
