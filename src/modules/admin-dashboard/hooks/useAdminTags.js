import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from "../services/tagsService";

export const useAdminTags = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTags = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getTags(params);
      const data = response?.data?.data || response?.data || response;
      setTags(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        t("adminDashboard:errors.fetch_failed", "Failed to fetch tags");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const addTag = useCallback(async (data) => {
    setSubmitting(true);
    try {
      await createTag(data);
      toast.success(t("adminDashboard:tags.created", "Tag created successfully"));
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        t("adminDashboard:errors.create_failed", "Failed to create tag");
      toast.error(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [t]);

  const editTag = useCallback(async (id, data) => {
    setSubmitting(true);
    try {
      await updateTag(id, data);
      toast.success(t("adminDashboard:tags.updated", "Tag updated successfully"));
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        t("adminDashboard:errors.update_failed", "Failed to update tag");
      toast.error(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [t]);

  const removeTag = useCallback(async (id) => {
    try {
      await deleteTag(id);
      toast.success(t("adminDashboard:tags.deleted", "Tag deleted successfully"));
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        t("adminDashboard:errors.delete_failed", "Failed to delete tag");
      toast.error(msg);
      return false;
    }
  }, [t]);

  return {
    tags,
    loading,
    submitting,
    fetchTags,
    addTag,
    editTag,
    removeTag,
  };
};
