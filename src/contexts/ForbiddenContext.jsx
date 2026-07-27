import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ForbiddenContext = createContext(null);

let forbiddenHandler = null;

export function registerAxiosForbiddenHandler(handler) {
  forbiddenHandler = handler;
}

export function notifyAxiosForbidden(resourcePath) {
  if (typeof forbiddenHandler === "function") {
    forbiddenHandler(resourcePath);
  }
}

export function ForbiddenProvider({ children }) {
  const [forbidden, setForbiddenState] = useState(false);
  const [resourcePath, setResourcePath] = useState(null);

  const setForbidden = useCallback((path = null) => {
    setForbiddenState(true);
    setResourcePath(path);
  }, []);

  const clearForbidden = useCallback(() => {
    setForbiddenState(false);
    setResourcePath(null);
  }, []);

  const value = useMemo(
    () => ({
      forbidden,
      resourcePath,
      setForbidden,
      clearForbidden,
    }),
    [forbidden, resourcePath, setForbidden, clearForbidden],
  );

  registerAxiosForbiddenHandler(setForbidden);

  return (
    <ForbiddenContext.Provider value={value}>{children}</ForbiddenContext.Provider>
  );
}

export function useForbidden() {
  const context = useContext(ForbiddenContext);

  if (!context) {
    throw new Error("useForbidden must be used within ForbiddenProvider");
  }

  return context;
}
