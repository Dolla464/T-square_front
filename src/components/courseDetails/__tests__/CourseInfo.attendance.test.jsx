import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CourseInfo from "../CourseInfo";

vi.mock("react-router-dom", () => ({
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: "en" },
  }),
}));

describe("CourseInfo attendance types", () => {
  it("renders current course attendance types on public course details", () => {
    render(
      <CourseInfo
        course={{
          title: "Public Course",
          short_description: "Short",
          description: "Long",
          cover_image: "/cover.jpg",
          attendance_types: ["online", "offline"],
          learnings: [],
        }}
      />,
    );

    expect(screen.getByText("coursesDetails:attendance_types_label:")).toBeInTheDocument();
    expect(screen.getByText("courses:card.online")).toBeInTheDocument();
    expect(screen.getByText("courses:card.offline")).toBeInTheDocument();
  });
});
