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
    const response = await createGoogleStorageAccount({ name });
    toastSuccess(response?.message || "Account created.");
    await fetchAccounts();
    return response?.data;
  };

  const updateAccount = async (id, data) => {
    const response = await updateGoogleStorageAccount(id, data);
    toastSuccess(response?.message || "Account updated.");
    await fetchAccounts();
    return response?.data;
  };

  const removeAccount = async (id) => {
    const response = await deleteGoogleStorageAccount(id);
    toastSuccess(response?.message || "Account deleted.");
    await fetchAccounts();
  };

  const connectAccount = async (id) => {
    const response = await connectGoogleStorageAccount(id);
    const authUrl = response?.data?.auth_url;
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const disconnectAccount = async (id) => {
    const response = await disconnectGoogleStorageAccount(id);
    toastSuccess(response?.message || "Account disconnected.");
    await fetchAccounts();
  };

  const testConnection = async (id) => {
    const response = await testGoogleStorageAccountConnection(id);
    toastSuccess(response?.message || "Connection verified.");
    await fetchAccounts();
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
