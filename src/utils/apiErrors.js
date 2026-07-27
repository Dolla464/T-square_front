import axios from "axios";

export function isAbortError(error) {
  return axios.isCancel(error) || error?.code === "ERR_CANCELED";
}

export function getApiErrorMeta(error) {
  const status = error?.response?.status ?? null;
  const data = error?.response?.data ?? null;
  const code = data?.code ?? null;

  return {
    status,
    code,
    message: data?.message || data?.error || error?.message || null,
    isNotFound: status === 404 && code === "NOT_FOUND",
    isForbidden: status === 403 && (code === "FORBIDDEN" || !code),
  };
}

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  const { message } = getApiErrorMeta(error);
  return message || fallback;
}
