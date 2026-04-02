import { useEffect, useState } from "react";

export function snapToDeviceGrid(value: number, dpr: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return value;
  }

  return Math.ceil(value * dpr) / dpr;
}

export default function useLineWidthDpi(lineWidth: number) {
  const [lineWidthDpi, setLineWidthDpi] = useState(() => lineWidth);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function update() {
      const dpr = window.devicePixelRatio || 1;
      setLineWidthDpi(snapToDeviceGrid(lineWidth, dpr));
      setIsResolved(true);
    }

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [lineWidth]);

  return {
    isResolved,
    lineWidthDpi,
  };
}
