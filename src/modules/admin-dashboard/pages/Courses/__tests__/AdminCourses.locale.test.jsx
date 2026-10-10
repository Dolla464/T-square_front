import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminCourses from "../AdminCourses";

let mockLanguage = "en";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key) => {
        const en = {
          "courses_page.title": "Courses",
          "courses_page.subtitle": "Manage all courses on the platform",
          "courses_page.trash": "Trash",
          "courses_page.all_statuses": "All Statuses",
          "courses_page.all_categories": "All Categories",
          "courses_page.no_data": "No data available.",
          "courses_page.loading": "Loading...",
          "content.add_course": "Add Course",
          "content.search_courses": "Search courses...",
          "content.status.published": "Published",
          "content.status.draft": "Draft",
        };
        const ar = {
          "courses_page.title": "الكورسات",
          "courses_page.subtitle": "إدارة جميع الكورسات على المنصة",
          "courses_page.trash": "سلة المحذوفات",
          "courses_page.all_statuses": "كل الحالات",
          "courses_page.all_categories": "كل التصنيفات",
          "courses_page.no_data": "لا توجد بيانات.",
          "courses_page.loading": "جاري التحميل...",
          "content.add_course": "إضافة كورس",
          "content.search_courses": "ابحث عن كورس...",
          "content.status.published": "منشور",
          "content.status.draft": "مسودة",
        };
        const dict = mockLanguage.startsWith("ar") ? ar : en;
        return dict[key] ?? key;
      },
      i18n: { language: mockLanguage },
    }),
  };
});

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock("../../../hooks/useAdminCourses", () => ({
  useAdminCourses: () => ({
    courses: [],
    pagination: null,
    loading: false,
    getCourses: vi.fn(),
    getCourseById: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
    getTrashedCourses: vi.fn(),
    restoreCourse: vi.fn(),
    forceDeleteCourse: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useInstractor", () => ({
  useInstructors: () => ({
    instructors: [],
    getInstructors: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [],
    treeCategories: [],
    getCategoriesTree: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useTags", () => ({
  useTags: () => ({
    tags: [],
    getTags: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useCourseLessons", () => ({
  useCourseLessons: () => ({
    lessons: [],
    loading: false,
    createLesson: vi.fn(),
    updateLesson: vi.fn(),
    deleteLesson: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useGoogleStorageAccounts", () => ({
  useGoogleStorageAccounts: () => ({
    accounts: [],
  }),
}));

vi.mock("../hooks/useCourseFormLogic", () => ({
  useCourseFormLogic: () => ({
    formData: { curriculum: [] },
    setFormData: vi.fn(),
    setThumbnailFile: vi.fn(),
    setCoverFile: vi.fn(),
    setActiveTab: vi.fn(),
    activeTab: "basic",
    handleChange: vi.fn(),
    handleLearningChange: vi.fn(),
    addLearning: vi.fn(),
    removeLearning: vi.fn(),
    handleFileChange: vi.fn(),
    handleSectionTitleChange: vi.fn(),
    handleLessonChange: vi.fn(),
    handleVideoFileReady: vi.fn(),
    handleVideoUploadComplete: vi.fn(),
    handleVideoUploadError: vi.fn(),
    handleVideoUploadStateChange: vi.fn(),
    handleCancelUpload: vi.fn(),
    removeLesson: vi.fn(),
    addSection: vi.fn(),
    removeSection: vi.fn(),
    chunkUploads: {},
    ensureCourseDraft: vi.fn(),
    getAbortController: vi.fn(),
    tabOrder: ["basic"],
    currentTabIndex: 0,
    goToNextTab: vi.fn(),
    goToPrevTab: vi.fn(),
    resetForm: vi.fn(),
    thumbnailFile: null,
    coverFile: null,
  }),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(),
  showDeleteConfirm: vi.fn(),
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastError: vi.fn(),
}));

vi.mock("../../../../../components/layout/VideoPreviewModal", () => ({
  default: () => null,
}));

describe("AdminCourses locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it("renders English static labels", () => {
    render(<AdminCourses />);

    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("Manage all courses on the platform")).toBeInTheDocument();
    expect(screen.getByText("Add Course")).toBeInTheDocument();
    expect(screen.getByText("Trash")).toBeInTheDocument();
    expect(screen.getByText("All Statuses")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByText("No data available.")).toBeInTheDocument();
  });

  it("renders Arabic static labels when locale is ar", () => {
    mockLanguage = "ar";

    render(<AdminCourses />);

    expect(screen.getByText("الكورسات")).toBeInTheDocument();
    expect(screen.getByText("إدارة جميع الكورسات على المنصة")).toBeInTheDocument();
    expect(screen.getByText("إضافة كورس")).toBeInTheDocument();
    expect(screen.getByText("سلة المحذوفات")).toBeInTheDocument();
    expect(screen.getByText("كل الحالات")).toBeInTheDocument();
    expect(screen.getByText("كل التصنيفات")).toBeInTheDocument();
    expect(screen.getByText("لا توجد بيانات.")).toBeInTheDocument();
  });
});
