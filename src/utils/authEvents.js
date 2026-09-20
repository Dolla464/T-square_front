let roleMismatchHandler = null;
let sessionExpiredHandler = null;

export function registerRoleMismatchHandler(handler) {
  roleMismatchHandler = handler;
}

export function notifyRoleMismatch() {
  if (typeof roleMismatchHandler === "function") {
    roleMismatchHandler();
  }
}

export function registerSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired() {
  if (typeof sessionExpiredHandler === "function") {
    sessionExpiredHandler();
  }
}
