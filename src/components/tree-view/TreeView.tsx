import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./tree-view.module.css";
import useLineWidthDpi from "./useLineWidthDpi";

export type TreeViewRouting = "indent-vertical";

export type TreeViewNode = {
  id: string;
  label: React.ReactNode;
  children?: TreeViewNode[];
  toggleable?: boolean;
  disabled?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  className?: string;
  meta?: Record<string, unknown>;
};

export type TreeViewRenderNodeArgs = {
  node: TreeViewNode;
  id: string;
  path: string;
  depth: number;
  expanded: boolean;
  focused: boolean;
  hasChildren: boolean;
  toggleable: boolean;
  disabled: boolean;
  toggle: () => void;
};

export type TreeViewRenderToggleArgs = {
  node: TreeViewNode;
  id: string;
  path: string;
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  toggleable: boolean;
  disabled: boolean;
  size: number;
};

export type TreeViewHandle = {
  expandAll: () => void;
  collapseAll: () => void;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  toggle: (id: string) => void;
  focus: (id: string) => void;
  getVisibleIds: () => string[];
};

export type TreeViewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onFocus"
> & {
  data: TreeViewNode[];
  ariaLabel?: string;
  ariaLabelledBy?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedIdsChange?: (expandedIds: string[]) => void;
  focusedId?: string;
  defaultFocusedId?: string;
  onFocusedIdChange?: (id: string | null) => void;
  loading?: React.ReactNode;
  lineWidth?: number;
  lineColor?: string;
  indent?: number;
  rowGap?: number;
  childGap?: number;
  toggleSize?: number;
  routing?: TreeViewRouting;
  renderNode?: (args: TreeViewRenderNodeArgs) => React.ReactNode;
  renderToggle?: (args: TreeViewRenderToggleArgs) => React.ReactNode;
};

type FlattenedTreeItem = {
  node: TreeViewNode;
  id: string;
  path: string;
  depth: number;
  parentId: string | null;
  childIds: string[];
  hasChildren: boolean;
  toggleable: boolean;
  disabled: boolean;
};

type TreeCssProperties = React.CSSProperties & Record<`--${string}`, string>;

const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_LINE_COLOR = "#94a3b8";
const DEFAULT_INDENT = 28;
const DEFAULT_ROW_GAP = 8;
const DEFAULT_CHILD_GAP = 6;
const DEFAULT_TOGGLE_SIZE = 18;

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function collectDefaultExpandedIds(nodes: TreeViewNode[]) {
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

function collectExpandableIds(nodes: TreeViewNode[]) {
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

function flattenVisibleTree(nodes: TreeViewNode[], expanded: Set<string>) {
  const items: FlattenedTreeItem[] = [];
  const itemsById = new Map<string, FlattenedTreeItem>();

  function visit(currentNodes: TreeViewNode[], depth: number, parentId: string | null, parentPath: string) {
    currentNodes.forEach((node, index) => {
      const path = `${parentPath}.${index}`;
      const childIds = (node.children ?? []).map((child) => child.id);
      const hasChildren = childIds.length > 0;
      const toggleable = node.toggleable ?? hasChildren;
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
      };

      items.push(item);
      itemsById.set(item.id, item);

      if (!hasChildren) {
        return;
      }

      if (!toggleable || expanded.has(node.id)) {
        visit(node.children ?? [], depth + 1, node.id, path);
      }
    });
  }

  visit(nodes, 1, null, "root");

  return { items, itemsById };
}

function getNextFocusableId(items: FlattenedTreeItem[], currentId: string | null, direction: 1 | -1) {
  const startIndex = currentId ? items.findIndex((item) => item.id === currentId) : -1;
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

function DefaultToggle({ expanded, size }: { expanded: boolean; size: number }) {
  return (
    <span aria-hidden="true" className={styles.defaultToggleIcon} style={{ width: size, height: size }}>
      <svg viewBox="0 0 16 16" width={size} height={size} focusable="false">
        <path
          d={expanded ? "M3 6l5 5 5-5" : "M6 3l5 5-5 5"}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    </span>
  );
}

export const TreeView = forwardRef<TreeViewHandle, TreeViewProps>(function TreeView(
  {
    data,
    ariaLabel,
    ariaLabelledBy,
    expandedIds,
    defaultExpandedIds,
    onExpandedIdsChange,
    focusedId,
    defaultFocusedId,
    onFocusedIdChange,
    loading,
    lineWidth = DEFAULT_LINE_WIDTH,
    lineColor = DEFAULT_LINE_COLOR,
    indent = DEFAULT_INDENT,
    rowGap = DEFAULT_ROW_GAP,
    childGap = DEFAULT_CHILD_GAP,
    toggleSize = DEFAULT_TOGGLE_SIZE,
    routing = "indent-vertical",
    renderNode,
    renderToggle,
    className,
    style,
    ...rest
  },
  ref,
) {
  const treeId = useId();
  const isExpandedControlled = expandedIds !== undefined;
  const isFocusedControlled = focusedId !== undefined;
  const initialExpandedIds = useMemo(
    () => defaultExpandedIds ?? collectDefaultExpandedIds(data),
    [data, defaultExpandedIds],
  );
  const [uncontrolledExpandedIds, setUncontrolledExpandedIds] = useState<string[]>(initialExpandedIds);
  const [uncontrolledFocusedId, setUncontrolledFocusedId] = useState<string | null>(defaultFocusedId ?? null);
  const resolvedExpandedIds = isExpandedControlled ? expandedIds ?? [] : uncontrolledExpandedIds;
  const expandedSet = useMemo(() => new Set(resolvedExpandedIds), [resolvedExpandedIds]);
  const { isResolved, lineWidthDpi } = useLineWidthDpi(lineWidth);
  const { items, itemsById } = useMemo(() => flattenVisibleTree(data, expandedSet), [data, expandedSet]);
  const resolvedFocusedId = isFocusedControlled ? focusedId ?? null : uncontrolledFocusedId;
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!items.length) {
      return;
    }

    if (resolvedFocusedId && itemsById.has(resolvedFocusedId)) {
      return;
    }

    const firstEnabledItem = items.find((item) => !item.disabled);
    if (!firstEnabledItem) {
      return;
    }

    if (!isFocusedControlled) {
      setUncontrolledFocusedId(firstEnabledItem.id);
    }

    onFocusedIdChange?.(firstEnabledItem.id);
  }, [isFocusedControlled, items, itemsById, onFocusedIdChange, resolvedFocusedId]);

  useEffect(() => {
    if (!resolvedFocusedId) {
      return;
    }

    const element = rowRefs.current.get(resolvedFocusedId);
    if (element && document.activeElement !== element) {
      element.focus();
    }
  }, [resolvedFocusedId]);

  const updateExpandedIds = useCallback(
    (nextExpandedIds: string[]) => {
      if (!isExpandedControlled) {
        setUncontrolledExpandedIds(nextExpandedIds);
      }

      onExpandedIdsChange?.(nextExpandedIds);
    },
    [isExpandedControlled, onExpandedIdsChange],
  );

  const updateFocusedId = useCallback(
    (nextFocusedId: string | null) => {
      if (!isFocusedControlled) {
        setUncontrolledFocusedId(nextFocusedId);
      }

      onFocusedIdChange?.(nextFocusedId);
    },
    [isFocusedControlled, onFocusedIdChange],
  );

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

  const focusItem = useCallback(
    (id: string) => {
      if (!itemsById.has(id)) {
        return;
      }

      updateFocusedId(id);
    },
    [itemsById, updateFocusedId],
  );

  useImperativeHandle(
    ref,
    () => ({
      expandAll,
      collapseAll,
      expand,
      collapse,
      toggle,
      focus: focusItem,
      getVisibleIds: () => items.map((item) => item.id),
    }),
    [collapse, collapseAll, expand, expandAll, focusItem, items, toggle],
  );

  const treeStyle: TreeCssProperties = {
    ...(style ?? {}),
    "--tree-line-width": `${lineWidthDpi}px`,
    "--tree-line-color": lineColor,
    "--tree-indent": `${indent}px`,
    "--tree-row-gap": `${rowGap}px`,
    "--tree-child-gap": `${childGap}px`,
    "--tree-toggle-size": `${toggleSize}px`,
  };

  if (routing !== "indent-vertical") {
    throw new Error(`Unsupported routing mode: ${routing}`);
  }

  if (!items.length) {
    return null;
  }

  if (!isResolved && loading !== undefined) {
    return <>{loading}</>;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>, item: FlattenedTreeItem) {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        updateFocusedId(getNextFocusableId(items, item.id, 1));
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        updateFocusedId(getNextFocusableId(items, item.id, -1));
        break;
      }
      case "Home": {
        event.preventDefault();
        const firstEnabled = items.find((candidate) => !candidate.disabled);
        if (firstEnabled) {
          updateFocusedId(firstEnabled.id);
        }
        break;
      }
      case "End": {
        event.preventDefault();
        const lastEnabled = [...items].reverse().find((candidate) => !candidate.disabled);
        if (lastEnabled) {
          updateFocusedId(lastEnabled.id);
        }
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        if (item.hasChildren && item.toggleable && !expandedSet.has(item.id)) {
          expand(item.id);
          return;
        }

        const firstChildId = item.childIds.find((childId) => itemsById.has(childId));
        if (firstChildId) {
          updateFocusedId(firstChildId);
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
          updateFocusedId(item.parentId);
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
  }

  return (
    <div
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={joinClassNames(styles.tree, className)}
      role="tree"
      style={treeStyle}
      {...rest}
    >
      {items.map((item) => {
        const expanded = expandedSet.has(item.id);
        const focused = resolvedFocusedId === item.id;
        const groupId = `${treeId}-${item.id}-group`;
        const toggleable = item.toggleable && item.hasChildren;
        const toggleNode = renderToggle ? (
          renderToggle({
            node: item.node,
            id: item.id,
            path: item.path,
            depth: item.depth,
            expanded,
            hasChildren: item.hasChildren,
            toggleable,
            disabled: item.disabled,
            size: toggleSize,
          })
        ) : (
          <DefaultToggle expanded={expanded} size={toggleSize} />
        );
        const content = renderNode
          ? renderNode({
              node: item.node,
              id: item.id,
              path: item.path,
              depth: item.depth,
              expanded,
              focused,
              hasChildren: item.hasChildren,
              toggleable,
              disabled: item.disabled,
              toggle: () => toggle(item.id),
            })
          : item.node.label;

        return (
          <div
            key={item.id}
            aria-disabled={item.disabled || undefined}
            aria-expanded={toggleable ? expanded : undefined}
            aria-level={item.depth}
            aria-owns={item.hasChildren ? groupId : undefined}
            className={joinClassNames(styles.treeItem, item.node.className, item.disabled && styles.treeItemDisabled)}
            data-depth={item.depth}
            ref={(element) => {
              if (element) {
                rowRefs.current.set(item.id, element);
                return;
              }

              rowRefs.current.delete(item.id);
            }}
            role="treeitem"
            style={{ "--tree-item-depth": String(item.depth - 1) } as React.CSSProperties}
            tabIndex={focused ? 0 : -1}
            onClick={() => updateFocusedId(item.id)}
            onFocus={() => updateFocusedId(item.id)}
            onKeyDown={(event) => handleKeyDown(event, item)}
          >
            <div className={styles.treeRow}>
              <span className={styles.treeGuides} aria-hidden="true" />
              {toggleable ? (
                <button
                  aria-controls={groupId}
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse node" : "Expand node"}
                  className={styles.toggleButton}
                  disabled={item.disabled}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(item.id);
                  }}
                >
                  {toggleNode}
                </button>
              ) : (
                <span aria-hidden="true" className={styles.togglePlaceholder} />
              )}
              <div className={styles.treeContent}>{content}</div>
            </div>
            {item.hasChildren ? <div className={styles.treeGroupMarker} id={groupId} role="group" /> : null}
          </div>
        );
      })}
    </div>
  );
});

export default TreeView;
