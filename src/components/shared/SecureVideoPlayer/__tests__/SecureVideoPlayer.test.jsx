import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SecureVideoPlayer from "../SecureVideoPlayer";

const errorHandlers = [];
let postCallCount = 0;

const mockPlayer = {
  on: vi.fn((event, handler) => {
    if (event === "error") {
      errorHandlers.push(handler);
    }
  }),
  off: vi.fn((event, handler) => {
    if (event === "error") {
      const index = errorHandlers.indexOf(handler);
      if (index >= 0) {
        errorHandlers.splice(index, 1);
      }
    }
  }),
  src: vi.fn(),
  dispose: vi.fn(),
};

function emitPlayerError() {
  errorHandlers.forEach((handler) => handler());
}

const mockPost = vi.fn(async () => {
  postCallCount += 1;

  return {
    data: {
      data: {
        stream_url: `/api/student/lessons/1/stream?token=token-${postCallCount}`,
        content_type: "video/mp4",
      },
    },
  };
});

vi.mock("video.js", () => ({
  default: vi.fn(() => mockPlayer),
}));

vi.mock("../../../../api/axios", () => ({
  default: {
    post: (...args) => mockPost(...args),
  },
}));

vi.mock("../../../../utils/resolveApiOrigin", () => ({
  normalizeStorageUrl: (url) => url,
}));

vi.mock("../WatermarkOverlay", () => ({
  default: () => <div data-testid="watermark-overlay" />,
}));

describe("SecureVideoPlayer", () => {
  beforeEach(() => {
    postCallCount = 0;
    errorHandlers.length = 0;
    mockPost.mockClear();
    mockPlayer.on.mockClear();
    mockPlayer.off.mockClear();
    mockPlayer.src.mockClear();
    mockPlayer.dispose.mockClear();
  });

  afterEach(() => {
    errorHandlers.length = 0;
  });

  it("auto-retries playback once on media error and shows error UI on second failure", async () => {
    render(<SecureVideoPlayer lessonId="1" courseTitle="Test Course" />);

    await waitFor(() => {
      expect(postCallCount).toBe(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId("watermark-overlay")).toBeInTheDocument();
    });

    emitPlayerError();

    await waitFor(() => {
      expect(postCallCount).toBe(2);
    });

    emitPlayerError();

    await waitFor(() => {
      expect(screen.getByText("Unable to load video. Please try again.")).toBeInTheDocument();
    });

    expect(postCallCount).toBe(2);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("does not re-authorize when parent re-renders with new inline callbacks", async () => {
    const { rerender } = render(
      <SecureVideoPlayer
        lessonId="1"
        courseTitle="Test Course"
        onUnauthorized={() => {}}
        onUnavailable={() => {}}
      />,
    );

    await waitFor(() => {
      expect(postCallCount).toBe(1);
    });

    rerender(
      <SecureVideoPlayer
        lessonId="1"
        courseTitle="Test Course"
        onUnauthorized={() => {}}
        onUnavailable={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("watermark-overlay")).toBeInTheDocument();
    });

    expect(postCallCount).toBe(1);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
