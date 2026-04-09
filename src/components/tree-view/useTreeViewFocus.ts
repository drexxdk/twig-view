import { useCallback, useEffect, useRef } from "react";
import type { FlattenedTreeItem, TreeViewNode } from "./TreeView.types";
import { findVisibleFocusFallbackId } from "./TreeView.utils";

type UseTreeViewFocusArgs = {
  data: TreeViewNode[];
  items: FlattenedTreeItem[];
  itemsById: Map<string, FlattenedTreeItem>;
  resolvedFocusedId: string | null;
  updateFocusedId: (id: string | null) => void;
};

export function useTreeViewFocus({
  data,
  items,
  itemsById,
  resolvedFocusedId,
  updateFocusedId,
}: UseTreeViewFocusArgs) {
  const treeRef = useRef<HTMLUListElement | null>(null);
  const previousItemsByIdRef = useRef<Map<string, FlattenedTreeItem>>(
    new Map(),
  );
  const rowRefs = useRef(new Map<string, HTMLLIElement>());

  const setRowRef = useCallback((id: string, element: HTMLLIElement | null) => {
    if (element) {
      rowRefs.current.set(id, element);
      return;
    }

    rowRefs.current.delete(id);
  }, []);

  const focusRowElement = useCallback((id: string) => {
    const element = rowRefs.current.get(id);
    if (!element) {
      return;
    }

    const toggle = element.querySelector(
      '[data-slot="tree-toggle"]',
    ) as HTMLElement | null;

    if (toggle) {
      if (document.activeElement !== toggle) {
        toggle.focus();
      }
      return;
    }

    try {
      element.tabIndex = -1;
      if (document.activeElement !== element) {
        element.focus();
      }
    } catch {
      // Ignore focus failures from detached nodes.
    }
  }, []);

  useEffect(() => {
    if (!items.length) {
      return;
    }

    if (resolvedFocusedId && itemsById.has(resolvedFocusedId)) {
      return;
    }

    const nextFocusedId = resolvedFocusedId
      ? findVisibleFocusFallbackId(
          data,
          resolvedFocusedId,
          items,
          itemsById,
          previousItemsByIdRef.current,
        )
      : (items.find((item) => !item.disabled)?.id ?? null);

    if (!nextFocusedId) {
      return;
    }

    updateFocusedId(nextFocusedId);

    if (
      typeof document !== "undefined" &&
      treeRef.current &&
      (document.activeElement === null ||
        document.activeElement === document.body)
    ) {
      window.requestAnimationFrame(() => {
        focusRowElement(nextFocusedId);
      });
    }
  }, [
    data,
    focusRowElement,
    items,
    itemsById,
    resolvedFocusedId,
    updateFocusedId,
  ]);

  useEffect(() => {
    previousItemsByIdRef.current = itemsById;
  }, [itemsById]);

  const focusItem = useCallback(
    (id: string) => {
      const item = itemsById.get(id);
      if (!item || item.disabled) {
        return;
      }

      updateFocusedId(id);
      focusRowElement(id);

      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          focusRowElement(id);
        });
      }
    },
    [focusRowElement, itemsById, updateFocusedId],
  );

  return {
    focusItem,
    focusRowElement,
    setRowRef,
    treeRef,
  };
}
