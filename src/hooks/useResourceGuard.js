import { useForbidden } from "../contexts/ForbiddenContext";
import { getApiErrorMeta } from "../utils/apiErrors";

export function useResourceGuard(error, loading) {
  const { forbidden } = useForbidden();

  if (forbidden) {
    return {
      forbidden: true,
      notFound: false,
      error: null,
      loading: false,
    };
  }

  const meta = error ? getApiErrorMeta(error) : null;

  return {
    forbidden: meta?.isForbidden ?? false,
    notFound: meta?.isNotFound ?? false,
    error,
    loading,
  };
}
