export function openExternalUrl(url, target = "_blank") {
  const popup = window.open(url, target, "noopener,noreferrer");

  if (popup) {
    popup.opener = null;
  }

  return popup;
}
