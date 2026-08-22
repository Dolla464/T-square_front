import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WatermarkOverlay from "../WatermarkOverlay";

describe("WatermarkOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("renders student watermark text", () => {
    render(
      <WatermarkOverlay
        watermark={{ name: "Adel Abdelmoneim", student_number: 1258 }}
      />,
    );

    expect(screen.getByText("Adel Abdelmoneim")).toBeInTheDocument();
    expect(screen.getByText("Student #1258")).toBeInTheDocument();
  });

  it("returns null when watermark is missing", () => {
    const { container } = render(<WatermarkOverlay watermark={null} />);
    expect(container.firstChild).toBeNull();
  });
});
