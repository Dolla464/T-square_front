import { useCallback, useEffect, useState } from "react";
import {
  connectGoogleStorageAccount,
  createGoogleStorageAccount,
  deleteGoogleStorageAccount,
  disconnectGoogleStorageAccount,
  getGoogleStorageAccounts,
  testGoogleStorageAccountConnection,
  updateGoogleStorageAccount,
} from "../services/googleStorageAccountsService";
import { toastError, toastSuccess } from "../../../components/shared/Toaster/toaster";

export function useGoogleStorageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getGoogleStorageAccounts();
      setAccounts(response?.data ?? []);
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to load Google storage accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createAccount = async (name) => {
    try {
      const response = await createGoogleStorageAccount({ name });
      toastSuccess(response?.message || "Account created.");
      await fetchAccounts();
      return response?.data;
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Failed to create Google storage account.",
      );
      return null;
    }
  };

  const updateAccount = async (id, data) => {
    try {
      const response = await updateGoogleStorageAccount(id, data);
      toastSuccess(response?.message || "Account updated.");
      await fetchAccounts();
      return response?.data;
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Failed to update Google storage account.",
      );
      return null;
    }
  };

  const removeAccount = async (id) => {
    try {
      const response = await deleteGoogleStorageAccount(id);
      toastSuccess(response?.message || "Account deleted.");
      await fetchAccounts();
      return true;
    } catch (error) {
      toastError(
        error?.response?.data?.message ||
          "Cannot delete this account while courses are still assigned to it.",
      );
      return false;
    }
  };

  const connectAccount = async (id) => {
    try {
      const response = await connectGoogleStorageAccount(id);
      const authUrl = response?.data?.auth_url;
      if (authUrl) {
        window.location.href = authUrl;
      }
      return true;
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Failed to start Google connection.",
      );
      return false;
    }
  };

  const disconnectAccount = async (id) => {
    try {
      const response = await disconnectGoogleStorageAccount(id);
      toastSuccess(response?.message || "Account disconnected.");
      await fetchAccounts();
      return true;
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Failed to disconnect Google storage account.",
      );
      return false;
    }
  };

  const testConnection = async (id) => {
    try {
      const response = await testGoogleStorageAccountConnection(id);
      toastSuccess(response?.message || "Connection verified.");
      await fetchAccounts();
      return true;
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Google storage connection test failed.",
      );
      return false;
    }
  };

  return {
    accounts,
    loading,
    fetchAccounts,
    createAccount,
    updateAccount,
    removeAccount,
    connectAccount,
    disconnectAccount,
    testConnection,
  };
}
