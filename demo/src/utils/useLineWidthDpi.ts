import { useEffect, useState } from "react";
import type { RefObject } from "react";

export default function useLineWidthDpi(
  lineWidth: number,
  targetRef?: RefObject<HTMLElement | null> | null,
) {
  // Start from the caller's width so the server-rendered HTML matches the
  // first client render before we can inspect devicePixelRatio.
  const [lineWidthDpi, setDpiOptimizedLineWidth] = useState<number>(
    () => lineWidth,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function update() {
      // Snap the requested width to the current DPR so thin connector borders
      // land on whole physical pixels and stay visually crisp.
      const dpr = window.devicePixelRatio || 1;
      const effective = Math.ceil(lineWidth * dpr) / dpr;
      setDpiOptimizedLineWidth(effective);

      // Consumers can render as soon as the effective width is known; the
      // target ref is carried for future extensibility, but not required here.
      setIsLoading(false);
    }

    update();

    const onResize = () => update();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [lineWidth, targetRef]);

  return { isLoading, lineWidthDpi };
}
