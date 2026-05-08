import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";

import {
  getStudents as apiGetStudents,
  getStudentById as apiGetStudentById,
  registerStudents as apiRegisterStudent,
  updateStudent as apiUpdateStudent,
  deleteStudent as apiDeleteStudent,
} from "../services/studentsServices";

export const useStudents = () => {
  const { t } = useTranslation(["adminDashboard"]);

  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err, key) => {
    const msg =
      err?.response?.data?.message ||
      t(key, "Something went wrong");

    setError(msg);
    toastError(msg);
  };

  // ================= GET ALL =================
  const getStudents = useCallback(async (params = {}) => {
    const isSearch = !!params.search;
    if (!isSearch) setLoading(true);
    setError(null);

    try {
      const res = await apiGetStudents(params);

      setStudents(res?.data || []);
      setPagination(res?.pagination || null);

      return res;
    } catch (err) {
      handleError(err, "errors.fetch_failed");
    } finally {
      if (!isSearch) setLoading(false);
    }
  }, [t]);

  // ================= GET ONE =================
  const getStudentById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiGetStudentById(id);

      setStudent(res?.data || null);

      return res?.data;
    } catch (err) {
      handleError(err, "errors.fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [t]);

  // ================= CREATE =================
  const createStudent = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiRegisterStudent(payload);
      toastSuccess("Created successfully");

      return res;
    } catch (err) {
      handleError(err, "errors.create_failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE =================
  const updateStudent = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiUpdateStudent(id, payload);
      toastSuccess("Updated successfully");

      return res;
    } catch (err) {
      handleError(err, "errors.update_failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const deleteStudent = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await apiDeleteStudent(id);
      toastSuccess("Deleted successfully");

      return true;
    } catch (err) {
      handleError(err, "errors.delete_failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    student,
    pagination,
    loading,
    error,
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};