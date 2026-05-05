import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
    getInstructors as fetchInstructors,
    getInstructorById as fetchInstructorById,
    createInstructor as apiCreateInstructor,
    updateInstructor as apiUpdateInstructor,
    deleteInstructor as apiDeleteInstructor,
} from "../services/instractorServices";

export const useInstructors = () => {
    const { t } = useTranslation(["common", "adminDashboard"]);
    const [instructors, setInstructors] = useState([]);
    const [instructor, setInstructor] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getInstructors = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchInstructors(params);
            const data = res?.data;
            const paginationData = res?.pagination;

            setInstructors(Array.isArray(data) ? data : []);
            setPagination(paginationData || null);
            return data;
        } catch (err) {
            console.error("Error fetching instructors:", err);
            const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
            setError(errorMsg);
            toastError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [t]);

    const getInstructorById = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchInstructorById(id);
            const data = res?.data || res;
            setInstructor(data);
            return data;
        } catch (err) {
            console.error("Error fetching instructor:", err);
            const errorMsg = err.response?.data?.message || t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
            setError(errorMsg);
            toastError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [t]);

    const createInstructor = async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCreateInstructor(payload);
            toastSuccess(t("adminDashboard:success.created", "Created successfully"));
            return response;
        } catch (err) {
            console.error("Error creating instructor:", err);
            const errorMsg = err.response?.data?.message || t("adminDashboard:errors.create_failed", "Failed to create");
            setError(errorMsg);
            toastError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateInstructor = async (id, payload) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiUpdateInstructor(id, payload);
            toastSuccess(t("adminDashboard:success.updated", "Updated successfully"));
            return response;
        } catch (err) {
            console.error("Error updating instructor:", err);
            const errorMsg = err.response?.data?.message || t("adminDashboard:errors.update_failed", "Failed to update");
            setError(errorMsg);
            toastError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteInstructor = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await apiDeleteInstructor(id);
            toastSuccess(t("adminDashboard:success.deleted", "Deleted successfully"));
            return true;
        } catch (err) {
            console.error("Error deleting instructor:", err);
            const errorMsg = err.response?.data?.message || t("adminDashboard:errors.delete_failed", "Failed to delete");
            setError(errorMsg);
            toastError(errorMsg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        instructors,
        instructor,
        pagination,
        loading,
        error,
        getInstructors,
        getInstructorById,
        createInstructor,
        updateInstructor,
        deleteInstructor,
    };
};