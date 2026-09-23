let loadedDirection = null;

export function getPreferredBootstrapDirection() {
  if (typeof localStorage === "undefined") {
    return "ltr";
  }

  const lang = localStorage.getItem("i18nextLng") || "en";
  return lang.toLowerCase().startsWith("ar") ? "rtl" : "ltr";
}

export function ensureBootstrapCssLoaded(
  direction = getPreferredBootstrapDirection(),
) {
  if (loadedDirection === direction) {
    return Promise.resolve(direction);
  }

  loadedDirection = direction;

  return direction === "rtl"
    ? import("bootstrap/dist/css/bootstrap.rtl.min.css").then(() => direction)
    : import("bootstrap/dist/css/bootstrap.min.css").then(() => direction);
}
