import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminCategories from "../AdminCategories";

let mockLanguage = "en";

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTranslation: () => ({
      t: (key) => {
        const en = {
          "categories_page.title": "Categories",
          "categories_page.subtitle": "Manage all categories",
          "categories_page.add_category": "Add Category",
          "categories_page.parent_categories": "Parent Categories",
          "categories_page.sub_categories_all": "All Sub-Categories",
          "categories_page.col_name": "Category Name",
          "categories_page.no_parent_categories": "No parent categories found",
          "categories_page.no_categories": "No categories found",
          "categories_page.loading": "Loading...",
          "categories_page.view": "View",
          "categories_page.edit": "Edit",
        };
        const ar = {
          "categories_page.title": "التصنيفات",
          "categories_page.subtitle": "إدارة جميع التصنيفات",
          "categories_page.add_category": "إضافة تصنيف",
          "categories_page.parent_categories": "التصنيفات الرئيسية",
          "categories_page.sub_categories_all": "كل التصنيفات الفرعية",
          "categories_page.col_name": "اسم التصنيف",
          "categories_page.no_parent_categories": "لا توجد تصنيفات رئيسية",
          "categories_page.no_categories": "لا توجد تصنيفات",
          "categories_page.loading": "جاري التحميل...",
          "categories_page.view": "عرض",
          "categories_page.edit": "تعديل",
        };
        const dict = mockLanguage.startsWith("ar") ? ar : en;
        return dict[key] ?? key;
      },
      i18n: { language: mockLanguage },
    }),
  };
});

vi.mock("../../../hooks/useCategories", () => ({
  useCategories: () => ({
    categories: [],
    treeCategories: [],
    pagination: null,
    loading: false,
    treeLoading: false,
    getCategories: vi.fn(),
    getCategoriesTree: vi.fn(),
    getCategoryById: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
  }),
}));

vi.mock("../../../../../components/shared/ConfirmDialog/confirmDialog", () => ({
  showConfirmCustom: vi.fn(),
}));

vi.mock("../../../../../components/shared/Toaster/toaster", () => ({
  toastError: vi.fn(),
}));

describe("AdminCategories locale UI", () => {
  beforeEach(() => {
    mockLanguage = "en";
  });

  it("renders English static labels", () => {
    render(<AdminCategories />);

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Add Category")).toBeInTheDocument();
    expect(screen.getByText("Parent Categories")).toBeInTheDocument();
    expect(screen.getByText("All Sub-Categories")).toBeInTheDocument();
    expect(screen.getByText("No parent categories found")).toBeInTheDocument();
    expect(screen.getByText("No categories found")).toBeInTheDocument();
  });

  it("renders Arabic static labels when locale is ar", () => {
    mockLanguage = "ar";

    render(<AdminCategories />);

    expect(screen.getByText("التصنيفات")).toBeInTheDocument();
    expect(screen.getByText("إضافة تصنيف")).toBeInTheDocument();
    expect(screen.getByText("التصنيفات الرئيسية")).toBeInTheDocument();
    expect(screen.getByText("كل التصنيفات الفرعية")).toBeInTheDocument();
    expect(screen.getByText("لا توجد تصنيفات رئيسية")).toBeInTheDocument();
    expect(screen.getByText("لا توجد تصنيفات")).toBeInTheDocument();
  });
});
