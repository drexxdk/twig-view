import { useCallback, useLayoutEffect, useState } from "react";

type ElementSize = {
  width: number;
  height: number;
  top: number;
  left: number;
};

const ZERO_SIZE: ElementSize = {
  width: 0,
  height: 0,
  top: 0,
  left: 0,
};

function readElementSize(element: Element) {
  const rect = element.getBoundingClientRect();
  const width = rect.width || (element as HTMLElement).offsetWidth || 0;
  const height = rect.height || (element as HTMLElement).offsetHeight || 0;

  return { width, height, top: rect.top, left: rect.left };
}

export default function useElementSize<T extends Element>(
  fallbackSize: Partial<ElementSize> = ZERO_SIZE,
) {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>({
    width: fallbackSize.width ?? 0,
    height: fallbackSize.height ?? 0,
    top: 0,
    left: 0,
  });

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!element) {
      return;
    }

    const updateSize = () => {
      const nextSize = readElementSize(element);

      setSize((currentSize) => {
        if (
          currentSize.width === nextSize.width &&
          currentSize.height === nextSize.height &&
          currentSize.top === nextSize.top &&
          currentSize.left === nextSize.left
        ) {
          return currentSize;
        }

        return nextSize;
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);

      return () => {
        window.removeEventListener("resize", updateSize);
      };
    }

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return { ref, size };
}
