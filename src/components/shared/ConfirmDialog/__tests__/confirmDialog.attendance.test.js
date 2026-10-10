import { describe, it, expect, vi } from "vitest";
import {
  normalizeSupportedAttendanceTypes,
  resolvePaymentStatusSelection,
} from "../confirmDialog";

vi.mock("../../../../i18n", () => ({
  default: {
    t: (key) => key,
  },
}));

describe("confirmDialog attendance helpers", () => {
  it("filters unsupported attendance types", () => {
    expect(
      normalizeSupportedAttendanceTypes(["online", "invalid", "offline"]),
    ).toEqual(["online", "offline"]);
  });

  it("returns status only for cancelled transitions", async () => {
    const result = await resolvePaymentStatusSelection(
      "cancelled",
      "pending",
      ["online"],
    );

    expect(result).toEqual({ status: "cancelled" });
    expect(result.attendance_type).toBeUndefined();
  });

  it("returns status only for refunded transitions", async () => {
    const result = await resolvePaymentStatusSelection(
      "refunded",
      "completed",
      ["online"],
    );

    expect(result).toEqual({ status: "refunded" });
  });

  it("does not require attendance when current status is already completed", async () => {
    const result = await resolvePaymentStatusSelection(
      "cancelled",
      "completed",
      ["online"],
    );

    expect(result).toEqual({ status: "cancelled" });
  });

  it("does not include unsupported attendance types in normalized list", () => {
    expect(normalizeSupportedAttendanceTypes(["invalid", "unknown"])).toEqual([]);
  });
});
