import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getCategories as apiGetCategories,
  getCategoriesTree as apiGetCategoriesTree,
  getCategoryById as apiGetCategoryById,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
} from "../services/categoriesServices";

export const useCategories = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [categories, setCategories] = useState([]);
  const [treeCategories, setTreeCategories] = useState([]); // لدروب داون الأب
  const [category, setCategory] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب الكل للجدول مع الفلترة والترقيم
  const getCategories = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetCategories(params);
        const data = res?.data;
        const paginationData = res?.pagination;

        setCategories(Array.isArray(data) ? data : []);
        setPagination(paginationData || null);
        return data;
      } catch (err) {
        console.error("Error fetching categories:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // جلب شجرة التصنيفات للمنسدلة
  const getCategoriesTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGetCategoriesTree();
      const data = res?.data || [];
      setTreeCategories(data);
      return data;
    } catch (err) {
      console.error("Error fetching categories tree:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGetCategoryById(id);
        const data = res?.data || res;
        setCategory(data);
        return data;
      } catch (err) {
        console.error("Error fetching category:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const createCategory = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateCategory(payload);
      toastSuccess(t("adminDashboard:success.created") || "Created successfully");
      return response;
    } catch (err) {
      console.error("Error creating category:", err);
      const errorMsg =
        err.response?.data?.message || t("adminDashboard:errors.create_failed");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateCategory(id, payload);
      toastSuccess(t("adminDashboard:success.updated") || "Updated successfully");
      return response;
    } catch (err) {
      console.error("Error updating category:", err);
      const errorMsg =
        err.response?.data?.message || t("adminDashboard:errors.update_failed");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    treeCategories,
    category,
    pagination,
    loading,
    error,
    getCategories,
    getCategoriesTree,
    getCategoryById,
    createCategory,
    updateCategory,
  };
};
