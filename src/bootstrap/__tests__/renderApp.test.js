import { describe, expect, it, vi, beforeEach } from "vitest";

const order = [];

vi.mock("../loadBootstrapCss.js", () => ({
  ensureBootstrapCssLoaded: vi.fn(async () => {
    order.push("bootstrap-css");
  }),
}));

vi.mock("../../i18n", () => ({
  i18nReady: new Promise((resolve) => {
    order.push("i18n-init-started");
    queueMicrotask(() => {
      order.push("i18n-init-resolved");
      resolve();
    });
  }),
}));

vi.mock("../../App.jsx", () => ({
  default: () => null,
}));

import { renderApp } from "../renderApp.js";

describe("renderApp startup order", () => {
  beforeEach(() => {
    order.length = 0;
  });

  it("waits for i18n before rendering React", async () => {
    const createRoot = vi.fn(() => ({ render: vi.fn() }));
    const getRootElement = vi.fn(() => ({}));
    const renderTree = vi.fn(() => "tree");

    let renderCalled = false;
    createRoot.mockImplementation(() => ({
      render: () => {
        renderCalled = true;
        order.push("react-render");
      },
    }));

    await renderApp({ createRoot, getRootElement, renderTree });

    expect(renderCalled).toBe(true);
    expect(order).toEqual([
      "bootstrap-css",
      "i18n-init-started",
      "i18n-init-resolved",
      "react-render",
    ]);
    expect(order.indexOf("react-render")).toBeGreaterThan(
      order.indexOf("i18n-init-resolved"),
    );
  });
});
