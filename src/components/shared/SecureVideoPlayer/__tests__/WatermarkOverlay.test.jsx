import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WatermarkOverlay from "../WatermarkOverlay";

describe("WatermarkOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders site branding and course name", () => {
    render(<WatermarkOverlay courseName="Introduction to React" />);

    expect(screen.getByAltText("T-Square")).toBeInTheDocument();
    expect(screen.getByText("Introduction to React")).toBeInTheDocument();
  });

  it("returns null when course name is missing", () => {
    const { container } = render(<WatermarkOverlay courseName={null} />);
    expect(container.firstChild).toBeNull();
  });
});
