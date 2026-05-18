import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
  toastWarning,
} from "../../../components/shared/Toaster/toaster";
import {
  getLearningGroups as fetchGroups,
  getLearningGroupsSelection as fetchGroupsSelection,
  getLearningGroupById as fetchGroupById,
  createLearningGroup as apiCreateGroup,
  updateLearningGroup as apiUpdateGroup,
  deleteLearningGroup as apiDeleteGroup,
  getAvailableStudents as fetchAvailableStudents,
  bulkAssignStudents as apiBulkAssignStudents,
} from "../services/learningGroupServices";

export const useGroups = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [groups, setGroups] = useState([]); // للمسؤول عن الـ CRUD والجدول
  const [selectionGroups, setSelectionGroups] = useState([]); // لدروب داون الفلترة
  const [availableStudents, setAvailableStudents] = useState([]);
  const [group, setGroup] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // جلب الكل للجدول مع الفلترة والترقيم
  const getGroups = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchGroups(params);
        const data = res?.data;
        const paginationData = res?.pagination;

        setGroups(Array.isArray(data) ? data : []);
        setPagination(paginationData || null);
        return data;
      } catch (err) {
        console.error("Error fetching groups:", err);
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
  const getAvailableStudents = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAvailableStudents(id);
        const data = res?.data;


        setAvailableStudents(Array.isArray(data) ? data : []);
        return data;
      } catch (err) {
        console.error("Error fetching available students:", err);
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

  // جلب المجموعات المخصصة للـ Select فقط (خفيفة وسريعة)
  const getGroupsSelection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGroupsSelection();
      const data = res?.data || [];
      setSelectionGroups(data);
      return data;
    } catch (err) {
      console.error("Error fetching groups selection:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getGroupById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchGroupById(id);
        const data = res?.data || res;
        setGroup(data);
        return data;
      } catch (err) {
        console.error("Error fetching group:", err);
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

  const createGroup = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateGroup(payload);
      toastSuccess(t("adminDashboard:success.created"));
      return response;
    } catch (err) {
      console.error("Error creating group:", err);
      const errorMsg =
        err.response?.data?.message || t("adminDashboard:errors.create_failed");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUpdateGroup(id, payload);
      toastSuccess(t("adminDashboard:success.updated"));
      return response;
    } catch (err) {
      console.error("Error updating group:", err);
      const errorMsg =
        err.response?.data?.message || t("adminDashboard:errors.update_failed");
      setError(errorMsg);
      toastError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiDeleteGroup(id);
      toastSuccess(t("adminDashboard:success.deleted"));
      return true;
    } catch (err) {
      console.error("Error deleting group:", err);
      const errorMsg =
        err.response?.data?.message || t("adminDashboard:errors.delete_failed");
      setError(errorMsg);
      toastError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkAssign = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiBulkAssignStudents(id, payload);
      if (response.data?.unpaid_students?.length > 0) {
        toastWarning(response.message);
      } else {
        toastSuccess(response.message || t("adminDashboard:success.updated"));
      }
      return response;
    } catch (err) {
      console.error("Error bulk assigning students:", err);
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
    groups,
    selectionGroups, // استخدم دي في الـ Select بتاع الفلترة
    group,
    pagination,
    loading,
    error,
    availableStudents,
    getGroups,
    getGroupsSelection,
    getAvailableStudents,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    bulkAssign,
  };
};
