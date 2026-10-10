import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrders } from "../useOrders";
import * as ordersServices from "../../services/ordersServices";
import { toastError, toastSuccess } from "../../../../components/shared/Toaster/toaster";

vi.mock("../../services/ordersServices", () => ({
  getReviews: vi.fn(),
  getReviewById: vi.fn(),
  updatePaymentOrdersById: vi.fn(),
  deleteReview: vi.fn(),
  exportPayments: vi.fn(),
  createOrder: vi.fn(),
}));

vi.mock("../../../../components/shared/Toaster/toaster", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

describe("useOrders updateOrderStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends completed payload with attendance_type", async () => {
    ordersServices.updatePaymentOrdersById.mockResolvedValue({});

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      const success = await result.current.updateOrderStatus(5, {
        status: "completed",
        attendance_type: "offline",
      });
      expect(success).toBe(true);
    });

    expect(ordersServices.updatePaymentOrdersById).toHaveBeenCalledWith(5, {
      status: "completed",
      attendance_type: "offline",
    });
    expect(toastSuccess).toHaveBeenCalled();
  });

  it("sends cancelled payload without attendance_type", async () => {
    ordersServices.updatePaymentOrdersById.mockResolvedValue({});

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      await result.current.updateOrderStatus(5, { status: "cancelled" });
    });

    expect(ordersServices.updatePaymentOrdersById).toHaveBeenCalledWith(5, {
      status: "cancelled",
    });
  });

  it("surfaces backend validation errors for attendance_type", async () => {
    ordersServices.updatePaymentOrdersById.mockRejectedValue({
      response: {
        data: {
          message: "Validation failed",
          errors: {
            attendance_type: ["The selected attendance type is invalid."],
          },
        },
      },
    });

    const { result } = renderHook(() => useOrders());

    await act(async () => {
      const success = await result.current.updateOrderStatus(5, {
        status: "completed",
        attendance_type: "invalid",
      });
      expect(success).toBe(false);
    });

    expect(toastError).toHaveBeenCalledWith("The selected attendance type is invalid.");
  });
});
