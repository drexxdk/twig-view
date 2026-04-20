import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import useLineWidthDpi from "./useLineWidthDpi";

describe("useLineWidthDpi", () => {
  const originalDevicePixelRatio = window.devicePixelRatio;

  beforeEach(() => {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 1.5,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: originalDevicePixelRatio,
    });
  });

  it("snaps the line width to the device pixel ratio", async () => {
    const { result } = renderHook(() => useLineWidthDpi(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lineWidthDpi).toBeCloseTo(4 / 3);
  });
});
