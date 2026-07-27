let roleMismatchHandler = null;

export function registerRoleMismatchHandler(handler) {
  roleMismatchHandler = handler;
}

export function notifyRoleMismatch() {
  if (typeof roleMismatchHandler === "function") {
    roleMismatchHandler();
  }
}
