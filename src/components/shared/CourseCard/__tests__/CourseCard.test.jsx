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

  it("does not throw when attendance_types is missing or null", () => {
    expect(() => render(<CourseCard course={baseCourse} />)).not.toThrow();
    expect(() =>
      render(<CourseCard course={{ ...baseCourse, attendance_types: null }} />),
    ).not.toThrow();

    expect(screen.queryByText("card.online")).not.toBeInTheDocument();
  });
});
