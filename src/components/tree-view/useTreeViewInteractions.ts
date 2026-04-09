import { useCallback } from "react";
import type { FlattenedTreeItem, TreeViewNode } from "./TreeView.types";
import { collectExpandableIds, getNextFocusableId } from "./TreeView.utils";

type UseTreeViewInteractionsArgs = {
  data: TreeViewNode[];
  expandedSet: Set<string>;
  focusItem: (id: string) => void;
  items: FlattenedTreeItem[];
  itemsById: Map<string, FlattenedTreeItem>;
  updateExpandedIds: (expandedIds: string[]) => void;
};

export function useTreeViewInteractions({
  data,
  expandedSet,
  focusItem,
  items,
  itemsById,
  updateExpandedIds,
}: UseTreeViewInteractionsArgs) {
  const expand = useCallback(
    (id: string) => {
      const item = itemsById.get(id);
      if (!item || !item.hasChildren || !item.toggleable) {
        return;
      }

      const nextExpanded = new Set(expandedSet);
      nextExpanded.add(id);
      updateExpandedIds(Array.from(nextExpanded));
    },
    [expandedSet, itemsById, updateExpandedIds],
  );

  const collapse = useCallback(
    (id: string) => {
      const nextExpanded = new Set(expandedSet);
      nextExpanded.delete(id);
      updateExpandedIds(Array.from(nextExpanded));
    },
    [expandedSet, updateExpandedIds],
  );

  const toggle = useCallback(
    (id: string) => {
      const item = itemsById.get(id);
      if (!item || !item.hasChildren || !item.toggleable) {
        return;
      }

      if (expandedSet.has(id)) {
        collapse(id);
        return;
      }

      expand(id);
    },
    [collapse, expand, expandedSet, itemsById],
  );

  const expandAll = useCallback(() => {
    updateExpandedIds(collectExpandableIds(data));
  }, [data, updateExpandedIds]);

  const collapseAll = useCallback(() => {
    updateExpandedIds([]);
  }, [updateExpandedIds]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>, item: FlattenedTreeItem) => {
      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          const nextId = getNextFocusableId(items, item.id, 1);
          if (nextId) {
            focusItem(nextId);
          }
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const previousId = getNextFocusableId(items, item.id, -1);
          if (previousId) {
            focusItem(previousId);
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          const firstEnabled = items.find((candidate) => !candidate.disabled);
          if (firstEnabled) {
            focusItem(firstEnabled.id);
          }
          break;
        }
        case "End": {
          event.preventDefault();
          const lastEnabled = [...items]
            .reverse()
            .find((candidate) => !candidate.disabled);
          if (lastEnabled) {
            focusItem(lastEnabled.id);
          }
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          if (
            item.hasChildren &&
            item.toggleable &&
            !expandedSet.has(item.id)
          ) {
            expand(item.id);
            return;
          }

          const firstChildId = item.childIds.find((childId) =>
            itemsById.has(childId),
          );
          if (firstChildId) {
            focusItem(firstChildId);
          }
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          if (item.hasChildren && item.toggleable && expandedSet.has(item.id)) {
            collapse(item.id);
            return;
          }

          if (item.parentId) {
            focusItem(item.parentId);
          }
          break;
        }
        case "Enter":
        case " ": {
          if (!item.hasChildren || !item.toggleable || item.disabled) {
            return;
          }

          event.preventDefault();
          toggle(item.id);
          break;
        }
        default:
          break;
      }
    },
    [collapse, expand, expandedSet, focusItem, items, itemsById, toggle],
  );

  return {
    collapse,
    collapseAll,
    expand,
    expandAll,
    handleKeyDown,
    toggle,
  };
}
