import { ensureBootstrapCssLoaded } from "./loadBootstrapCss.js";

/**
 * Loads bootstrap CSS, waits for i18n, then mounts React.
 * Extracted for startup-order regression tests.
 */
export async function renderApp({ createRoot, getRootElement, renderTree }) {
  await ensureBootstrapCssLoaded();

  const { i18nReady } = await import("../i18n");
  const { default: App } = await import("../App.jsx");

  await i18nReady;

  const root = createRoot(getRootElement());
  root.render(renderTree(App));
  return root;
}
