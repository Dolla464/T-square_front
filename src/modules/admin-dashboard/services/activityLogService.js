import axiosClient from "../../../api/axios";

export const ACTIVITY_LOG_TOKEN_KEY = "activityLogToken";
export const ACTIVITY_LOG_EXPIRES_KEY = "activityLogTokenExpires";

export const getStoredActivityLogToken = () => {
  const token = sessionStorage.getItem(ACTIVITY_LOG_TOKEN_KEY);
  const expiresAt = sessionStorage.getItem(ACTIVITY_LOG_EXPIRES_KEY);

  if (!token || !expiresAt) {
    return null;
  }

  if (new Date(expiresAt).getTime() <= Date.now()) {
    clearStoredActivityLogToken();
    return null;
  }

  return token;
};

export const storeActivityLogToken = (token, expiresAt) => {
  sessionStorage.setItem(ACTIVITY_LOG_TOKEN_KEY, token);
  sessionStorage.setItem(ACTIVITY_LOG_EXPIRES_KEY, expiresAt);
};

export const clearStoredActivityLogToken = () => {
  sessionStorage.removeItem(ACTIVITY_LOG_TOKEN_KEY);
  sessionStorage.removeItem(ACTIVITY_LOG_EXPIRES_KEY);
};

export const verifyActivityLogPassword = async (password) => {
  const response = await axiosClient.post("/admin/activity-logs/verify-password", {
    password,
  });
  return response.data;
};

export const getActivityLogs = async (params = {}) => {
  const token = getStoredActivityLogToken();

  const response = await axiosClient.get("/admin/activity-logs", {
    params,
    headers: token ? { "X-Activity-Log-Token": token } : {},
  });

  return response.data;
};
