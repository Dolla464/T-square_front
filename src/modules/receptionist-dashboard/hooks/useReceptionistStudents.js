import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";

import {
  getStudents as apiGetStudents,
  getStudentById as apiGetStudentById,
  registerStudents as apiRegisterStudent,
  updateStudent as apiUpdateStudent,
  deleteStudent as apiDeleteStudent,
  updateStudentStatus as apiUpdateStatus,
  toggleStudentVerify as apiToggleVerify,
  updateStudentCourseGroup as apiUpdateStudentCourseGroup,
  updateStudentCourseStatus as apiUpdateStudentCourseStatus,
} from "../services/receptionistStudentsService";

export const useReceptionistStudents = () => {
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

  // ================= UPDATE STUDENT STATUS =================
  const updateStudentStatus = async (id, status) => {
    try {
      await apiUpdateStatus(id, status);

      // التحديث المحلي للـ State (Optimistic Update)
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: status } : s)),
      );

      toastSuccess(t("Updated Success"));
    } catch (err) {
      handleError(err, "Sorry, we couldn't update the status. Please try again.");
      throw err;
    }
  };

  // ================= TOGGLE VERIFICATION =================
  const toggleStudentVerify = async (id) => {
    try {
      await apiToggleVerify(id);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, is_verified: !s.is_verified } : s,
        ),
      );

      toastSuccess(t("Updated Success"));
    } catch (err) {
      handleError(err, "Sorry, we couldn't update the verification status. Please try again.");
      throw err;
    }
  };

  // ================= UPDATE COURSE GROUP =================
 const updateStudentCourseGroup = async (studentId, courseId, groupId) => {
   try {
     await apiUpdateStudentCourseGroup(studentId, courseId, groupId);

     setStudents((prev) =>
       prev.map((s) =>
         s.id === studentId
           ? {
               ...s,
               group_id: parseInt(groupId),

               enrolled_courses: (s.enrolled_courses || []).map((c) =>
                 c.id === courseId ? { ...c, group_id: parseInt(groupId) } : c,
               ),
             }
           : s,
       ),
     );

     toastSuccess(t("Updated Success"));
   } catch (err) {
     const backendMessage = err.response?.data?.message;

     handleError(
       err,
       backendMessage ||
         "Sorry, we couldn't update the student's group. Please try again.",
     );

     throw err;
   }
 };

 // ================= UPDATE COURSE STATUS =================
 const updateStudentCourseStatus = async (studentId, courseId, isCompleted) => {
   try {
     await apiUpdateStudentCourseStatus(studentId, courseId, isCompleted);

     setStudents((prev) =>
       prev.map((s) =>
         s.id === studentId
           ? {
               ...s,
               enrolled_courses: (s.enrolled_courses || []).map((c) =>
                 c.id === courseId ? { ...c, is_completed: isCompleted } : c,
               ),
             }
           : s,
       ),
     );

     toastSuccess(t("Status Updated Success"));
   } catch (err) {
     const backendMessage = err.response?.data?.message;
     handleError(err, backendMessage || "Failed to update course status.");
     throw err;
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
    updateStudentStatus,
    toggleStudentVerify,
    updateStudentCourseGroup,
    updateStudentCourseStatus,
  };
};
