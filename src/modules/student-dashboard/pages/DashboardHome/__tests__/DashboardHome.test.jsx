import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardHome from "../DashboardHome";
import { useAuth } from "../../../../../contexts/AuthContext";
import { getStudentCourses } from "../../../hooks/useCourses";

// Mocking the Context and Hooks
vi.mock("../../../../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../../hooks/useCourses", () => ({
  getStudentCourses: vi.fn(),
}));

// Mocking react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, params) => {
      if (params?.name) return `Welcome ${params.name}`;
      return key;
    },
    i18n: { language: "en" },
  }),
}));

// Mocking the imported components so we only test DashboardHome logic
vi.mock("../../../components/StatCard", () => ({
  default: ({ label, value }) => <div data-testid="stat-card">{label}: {value}</div>,
}));

vi.mock("../../../components/DashboardItemsSection", () => ({
  default: ({ items, title }) => (
    <div data-testid="items-section">
      <h3>{title}</h3>
      <ul data-testid="course-list">
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  ),
}));

describe("DashboardHome Component", () => {
  const mockUser = { name: "John Doe" };
  const mockStats = {
    total_platform_courses: 10,
    in_progress: 2,
    completed: 3,
    total_enrolled: 5,
  };

  const mockEnrolledCourses = [
    { id: 1, title: "React Basics", enrollment: { status: "in_progress" } },
    { id: 2, title: "Advanced Node", enrollment: { status: "completed" } },
    { id: 3, title: "CSS Mastery", enrollment: { status: "in_progress" } },
  ];

  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
    getStudentCourses.mockReturnValue({
      stats: mockStats,
      enrolledCourses: mockEnrolledCourses,
      loading: false,
    });
  });

  it("renders the welcome message with the user's first name", () => {
    render(<DashboardHome />);
    expect(screen.getByText("Welcome John")).toBeInTheDocument();
  });

  it("renders the loading spinner when loading is true", () => {
    getStudentCourses.mockReturnValue({ loading: true, stats: null, enrolledCourses: [] });
    const { container } = render(<DashboardHome />);
    expect(container.querySelector(".spinner-border")).toBeInTheDocument();
  });

  it("renders all courses by default", () => {
    render(<DashboardHome />);
    
    // Check if the DashboardItemsSection got all items
    expect(screen.getByText("React Basics")).toBeInTheDocument();
    expect(screen.getByText("Advanced Node")).toBeInTheDocument();
    expect(screen.getByText("CSS Mastery")).toBeInTheDocument();
  });

  it("filters courses based on search input", () => {
    render(<DashboardHome />);
    
    const searchInput = screen.getByPlaceholderText("Search courses...");
    fireEvent.change(searchInput, { target: { value: "react" } });

    expect(screen.getByText("React Basics")).toBeInTheDocument();
    expect(screen.queryByText("Advanced Node")).not.toBeInTheDocument();
    expect(screen.queryByText("CSS Mastery")).not.toBeInTheDocument();
  });

  it("filters courses based on category tabs (in_progress)", () => {
    render(<DashboardHome />);
    
    const inProgressTab = screen.getByText("active_courses.filter.in_progress");
    fireEvent.click(inProgressTab);

    expect(screen.getByText("React Basics")).toBeInTheDocument();
    expect(screen.getByText("CSS Mastery")).toBeInTheDocument();
    expect(screen.queryByText("Advanced Node")).not.toBeInTheDocument(); // completed
  });
});
