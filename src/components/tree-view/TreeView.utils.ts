import type { SyntheticEvent } from "react";
import type { FlattenedTreeItem, TreeViewNode } from "./TreeView.types";

export function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}

export function isDirectTreeItemEventTarget(
  event: SyntheticEvent<HTMLElement>,
) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest('[role="treeitem"]') === event.currentTarget;
}

export function collectDefaultExpandedIds(nodes: TreeViewNode[]) {
  const ids: string[] = [];

  function visit(currentNodes: TreeViewNode[]) {
    currentNodes.forEach((node) => {
      if (node.defaultExpanded) {
        ids.push(node.id);
      }

      if (node.children?.length) {
        visit(node.children);
      }
    });
  }

  visit(nodes);
  return ids;
}

export function collectExpandableIds(nodes: TreeViewNode[]) {
  const ids: string[] = [];

  function visit(currentNodes: TreeViewNode[]) {
    currentNodes.forEach((node) => {
      const hasChildren = (node.children?.length ?? 0) > 0;
      const toggleable = node.toggleable ?? hasChildren;

      if (hasChildren && toggleable) {
        ids.push(node.id);
      }

      if (hasChildren) {
        visit(node.children ?? []);
      }
    });
  }

  visit(nodes);
  return ids;
}

export function flattenVisibleTree(
  nodes: TreeViewNode[],
  expanded: Set<string>,
) {
  const items: FlattenedTreeItem[] = [];
  const itemsById = new Map<string, FlattenedTreeItem>();

  function visit(
    currentNodes: TreeViewNode[],
    depth: number,
    parentId: string | null,
    parentPath: string,
    ancestorContinuation: boolean[],
    parentHasNextSibling: boolean,
  ) {
    currentNodes.forEach((node, index) => {
      const path = `${parentPath}.${index}`;
      const childIds = (node.children ?? []).map((child) => child.id);
      const hasChildren = childIds.length > 0;
      const toggleable = node.toggleable ?? hasChildren;
      const hasNextSibling = index < currentNodes.length - 1;
      const item: FlattenedTreeItem = {
        node,
        id: node.id,
        path,
        depth,
        parentId,
        childIds,
        hasChildren,
        toggleable,
        disabled: node.disabled ?? false,
        hasNextSibling,
        ancestorContinuation,
      };

      items.push(item);
      itemsById.set(item.id, item);

      if (!hasChildren) {
        return;
      }

      if (!toggleable || expanded.has(node.id)) {
        const nextAncestorContinuation =
          depth > 1
            ? [...ancestorContinuation, parentHasNextSibling]
            : ancestorContinuation;
        visit(
          node.children ?? [],
          depth + 1,
          node.id,
          path,
          nextAncestorContinuation,
          hasNextSibling,
        );
      }
    });
  }

  visit(nodes, 1, null, "root", [], false);

  return { items, itemsById };
}

export function findVisibleFocusFallbackId(
  nodes: TreeViewNode[],
  targetId: string,
  items: FlattenedTreeItem[],
  itemsById: Map<string, FlattenedTreeItem>,
  previousItemsById?: Map<string, FlattenedTreeItem>,
) {
  function findTargetPath(
    currentNodes: TreeViewNode[],
    ancestorIds: string[],
  ): string[] | null {
    for (const node of currentNodes) {
      const nextAncestorIds = [...ancestorIds, node.id];

      if (node.id === targetId) {
        return nextAncestorIds;
      }

      if (node.children?.length) {
        const childPath = findTargetPath(node.children, nextAncestorIds);

        if (childPath) {
          return childPath;
        }
      }
    }

    return null;
  }

  const targetPath = findTargetPath(nodes, []);

  if (targetPath !== null) {
    for (let index = targetPath.length - 2; index >= 0; index -= 1) {
      const ancestorItem = itemsById.get(targetPath[index]);

      if (ancestorItem && !ancestorItem.disabled) {
        return ancestorItem.id;
      }
    }
  }

  const previousItem = previousItemsById?.get(targetId);
  let ancestorId = previousItem?.parentId ?? null;

  while (ancestorId) {
    const visibleAncestor = itemsById.get(ancestorId);

    if (visibleAncestor && !visibleAncestor.disabled) {
      return visibleAncestor.id;
    }

    ancestorId = previousItemsById?.get(ancestorId)?.parentId ?? null;
  }

  return items.find((item) => !item.disabled)?.id ?? null;
}

export function getNextFocusableId(
  items: FlattenedTreeItem[],
  currentId: string | null,
  direction: 1 | -1,
) {
  const startIndex = currentId
    ? items.findIndex((item) => item.id === currentId)
    : -1;
  let index = startIndex;

  while (true) {
    index += direction;

    if (index < 0 || index >= items.length) {
      return currentId;
    }

    if (!items[index].disabled) {
      return items[index].id;
    }
  }
}

export function sharesContinuingAxis(
  item: FlattenedTreeItem,
  itemsById: Map<string, FlattenedTreeItem>,
) {
  if (item.depth !== 2 || !item.parentId) {
    return false;
  }

  return Boolean(itemsById.get(item.parentId)?.hasNextSibling);
}
