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
export type TreeViewLineStyle = "solid" | "dashed" | "dotted";

export type TreeViewLineOptions = {
  width?: number;
  color?: string;
  radius?: number;
  showParentLines?: boolean;
  style?: TreeViewLineStyle;
};

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
  React.HTMLAttributes<HTMLElement>,
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
  line?: TreeViewLineOptions;
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
  hasNextSibling: boolean;
  ancestorContinuation: boolean[];
};

type TreeCssProperties = React.CSSProperties & Record<`--${string}`, string>;

const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_LINE_COLOR = "currentColor";
const DEFAULT_LINE_RADIUS = 0;
const DEFAULT_SHOW_PARENT_LINES = true;
const DEFAULT_LINE_STYLE: TreeViewLineStyle = "solid";
const DEFAULT_INDENT = 28;
const DEFAULT_ROW_GAP = 8;
const DEFAULT_CHILD_GAP = 6;
const DEFAULT_TOGGLE_SIZE = 18;

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames.filter(Boolean).join(" ");
}

function isDirectTreeItemEventTarget(event: React.SyntheticEvent<HTMLElement>) {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.closest('[role="treeitem"]') === event.currentTarget;
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

function getNextFocusableId(
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

function DefaultToggle({
  expanded,
  size,
}: {
  expanded: boolean;
  size: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={styles.defaultToggleIcon}
      style={{ width: size, height: size }}
    >
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

export const TreeView = forwardRef<TreeViewHandle, TreeViewProps>(
  function TreeView(
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
      line,
      lineWidth,
      lineColor,
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
    const resolvedLineWidth = line?.width ?? lineWidth ?? DEFAULT_LINE_WIDTH;
    const resolvedLineColor = line?.color ?? lineColor ?? DEFAULT_LINE_COLOR;
    const resolvedLineRadius = line?.radius ?? DEFAULT_LINE_RADIUS;
    const resolvedShowParentLines =
      line?.showParentLines ?? DEFAULT_SHOW_PARENT_LINES;
    const resolvedLineStyle = line?.style ?? DEFAULT_LINE_STYLE;
    const treeId = useId();
    const isExpandedControlled = expandedIds !== undefined;
    const isFocusedControlled = focusedId !== undefined;
    const initialExpandedIds = useMemo(
      () => defaultExpandedIds ?? collectDefaultExpandedIds(data),
      [data, defaultExpandedIds],
    );
    const [uncontrolledExpandedIds, setUncontrolledExpandedIds] =
      useState<string[]>(initialExpandedIds);
    const [uncontrolledFocusedId, setUncontrolledFocusedId] = useState<
      string | null
    >(defaultFocusedId ?? null);
    const resolvedExpandedIds = isExpandedControlled
      ? (expandedIds ?? [])
      : uncontrolledExpandedIds;
    const expandedSet = useMemo(
      () => new Set(resolvedExpandedIds),
      [resolvedExpandedIds],
    );
    const { isResolved, lineWidthDpi } = useLineWidthDpi(resolvedLineWidth);
    const { items, itemsById } = useMemo(
      () => flattenVisibleTree(data, expandedSet),
      [data, expandedSet],
    );
    const resolvedFocusedId = isFocusedControlled
      ? (focusedId ?? null)
      : uncontrolledFocusedId;
    const rowRefs = useRef(new Map<string, HTMLLIElement>());
    const rowObservers = useRef(new Map<string, ResizeObserver>());
    const itemObservers = useRef(new Map<string, ResizeObserver>());
    const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
    const [itemHeights, setItemHeights] = useState<Record<string, number>>({});

    const focusRowElement = useCallback((id: string) => {
      const element = rowRefs.current.get(id);
      if (element && document.activeElement !== element) {
        element.focus();
      }
    }, []);

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
    }, [
      isFocusedControlled,
      items,
      itemsById,
      onFocusedIdChange,
      resolvedFocusedId,
    ]);

    useEffect(() => {
      if (!resolvedFocusedId) {
        return;
      }

      focusRowElement(resolvedFocusedId);
    }, [focusRowElement, resolvedFocusedId]);

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
        focusRowElement(id);

        if (typeof window !== "undefined") {
          window.requestAnimationFrame(() => {
            focusRowElement(id);
          });
        }
      },
      [focusRowElement, itemsById, updateFocusedId],
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
      "--tree-line-color": resolvedLineColor,
      "--tree-line-radius": `${resolvedLineRadius}px`,
      "--tree-line-style": resolvedLineStyle,
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

    function sharesContinuingAxis(item: FlattenedTreeItem) {
      if (item.depth !== 2 || !item.parentId) {
        return false;
      }

      return Boolean(itemsById.get(item.parentId)?.hasNextSibling);
    }

    function handleKeyDown(
      event: React.KeyboardEvent<HTMLElement>,
      item: FlattenedTreeItem,
    ) {
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
    }

    function renderVisibleNodes(nodes: TreeViewNode[], depth: number) {
      return nodes.map((node, index) => {
        const item = itemsById.get(node.id);

        if (!item) {
          return null;
        }

        const expanded = expandedSet.has(item.id);
        const focused = resolvedFocusedId === item.id;
        const toggleable = item.toggleable && item.hasChildren;
        const hasVisibleChildren =
          item.hasChildren && (!toggleable || expanded);
        const groupId = `${treeId}-${item.id}-group`;
        const labelId = `${treeId}-${item.id}-label`;
        const childNodes = hasVisibleChildren ? (node.children ?? []) : [];
        const parentItem = item.parentId ? itemsById.get(item.parentId) : null;
        const itemSharesContinuingAxis = sharesContinuingAxis(item);
        const ancestorRailCount = item.ancestorContinuation.length;
        const resolvedRowHeight = rowHeights[item.id] ?? toggleSize;
        const childrenStemHeight = hasVisibleChildren
          ? (() => {
              const lastChild = childNodes[childNodes.length - 1];

              if (!lastChild) {
                return 0;
              }

              const lastChildItem = itemsById.get(lastChild.id);

              const previousSiblingOffset = childNodes
                .slice(0, -1)
                .reduce((total, childNode) => {
                  const childItemHeight =
                    itemHeights[childNode.id] ??
                    rowHeights[childNode.id] ??
                    toggleSize;
                  return total + childItemHeight + rowGap;
                }, 0);
              const lastChildRowHeight = rowHeights[lastChild.id] ?? toggleSize;
              const lastChildHasVisibleChildren = lastChildItem
                ? lastChildItem.hasChildren &&
                  (!lastChildItem.toggleable ||
                    expandedSet.has(lastChildItem.id))
                : false;
              const lastChildUsesTerminalCorner =
                Boolean(lastChildItem) &&
                !lastChildHasVisibleChildren &&
                !(lastChildItem ? sharesContinuingAxis(lastChildItem) : false);
              const lastChildUsesRoundedTerminalBend =
                resolvedLineRadius > 0 &&
                Boolean(lastChildItem) &&
                lastChildHasVisibleChildren &&
                !(lastChildItem ? sharesContinuingAxis(lastChildItem) : false);
              const lastChildOffsetWithinGroup =
                previousSiblingOffset +
                (lastChildUsesTerminalCorner || lastChildUsesRoundedTerminalBend
                  ? 0
                  : lastChildRowHeight / 2);

              return (
                resolvedRowHeight / 2 + rowGap + lastChildOffsetWithinGroup
              );
            })()
          : 0;
        const itemStyle = {
          ...(ancestorRailCount
            ? { "--tree-ancestor-width": `${ancestorRailCount * indent}px` }
            : {}),
          "--tree-row-height": `${resolvedRowHeight}px`,
          "--tree-children-stem-height": `${childrenStemHeight}px`,
        } as TreeCssProperties;
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
          <li
            key={item.id}
            aria-disabled={item.disabled || undefined}
            aria-expanded={toggleable ? expanded : undefined}
            aria-level={item.depth}
            aria-labelledby={labelId}
            aria-owns={item.hasChildren ? groupId : undefined}
            className={joinClassNames(
              styles.treeItem,
              item.node.className,
              item.disabled && styles.treeItemDisabled,
            )}
            data-disabled={item.disabled ? "true" : undefined}
            data-depth={item.depth}
            data-expanded={toggleable ? String(expanded) : undefined}
            data-focused={focused ? "true" : undefined}
            data-has-children={item.hasChildren ? "true" : undefined}
            data-has-next-sibling={item.hasNextSibling ? "true" : undefined}
            data-last-child={index === nodes.length - 1 ? "true" : undefined}
            data-shares-continuing-axis={
              itemSharesContinuingAxis ? "true" : undefined
            }
            data-slot="tree-item"
            data-toggleable={toggleable ? "true" : undefined}
            data-visible-children={hasVisibleChildren ? "true" : undefined}
            ref={(element) => {
              const itemObserver = itemObservers.current.get(item.id);

              if (element) {
                rowRefs.current.set(item.id, element);

                const updateHeight = () => {
                  const nextHeight = element.getBoundingClientRect().height;

                  setItemHeights((previous) => {
                    if (previous[item.id] === nextHeight) {
                      return previous;
                    }

                    return {
                      ...previous,
                      [item.id]: nextHeight,
                    };
                  });
                };

                updateHeight();

                if (typeof ResizeObserver !== "undefined") {
                  itemObserver?.disconnect();

                  const nextItemObserver = new ResizeObserver(() => {
                    updateHeight();
                  });

                  nextItemObserver.observe(element);
                  itemObservers.current.set(item.id, nextItemObserver);
                }

                return;
              }

              itemObserver?.disconnect();
              itemObservers.current.delete(item.id);
              rowRefs.current.delete(item.id);
            }}
            role="treeitem"
            style={itemStyle}
            tabIndex={focused ? 0 : -1}
            onClick={(event) => {
              if (isDirectTreeItemEventTarget(event)) {
                updateFocusedId(item.id);
              }
            }}
            onFocus={(event) => {
              if (isDirectTreeItemEventTarget(event)) {
                updateFocusedId(item.id);
              }
            }}
            onKeyDown={(event) => {
              if (isDirectTreeItemEventTarget(event)) {
                handleKeyDown(event, item);
              }
            }}
          >
            {resolvedShowParentLines && ancestorRailCount > 0 ? (
              <span
                aria-hidden="true"
                className={styles.treeAncestors}
                data-slot="tree-ancestors"
              >
                {item.ancestorContinuation.map(
                  (hasContinuation, ancestorIndex) => (
                    <span
                      key={`${item.id}-ancestor-${ancestorIndex}`}
                      className={styles.treeAncestorRail}
                      data-active={hasContinuation ? "true" : undefined}
                    />
                  ),
                )}
              </span>
            ) : null}
            <div
              className={styles.treeRow}
              data-slot="tree-row"
              ref={(element) => {
                const observer = rowObservers.current.get(item.id);

                if (!element) {
                  observer?.disconnect();
                  rowObservers.current.delete(item.id);
                  return;
                }

                const updateHeight = () => {
                  const nextHeight = element.getBoundingClientRect().height;

                  setRowHeights((previous) => {
                    if (previous[item.id] === nextHeight) {
                      return previous;
                    }

                    return {
                      ...previous,
                      [item.id]: nextHeight,
                    };
                  });
                };

                updateHeight();

                if (typeof ResizeObserver === "undefined") {
                  observer?.disconnect();
                  rowObservers.current.delete(item.id);
                  return;
                }

                observer?.disconnect();

                const nextObserver = new ResizeObserver(() => {
                  updateHeight();
                });

                nextObserver.observe(element);
                rowObservers.current.set(item.id, nextObserver);
              }}
            >
              {toggleable ? (
                <button
                  aria-controls={groupId}
                  aria-expanded={expanded}
                  aria-label={expanded ? "Collapse node" : "Expand node"}
                  className={styles.toggleButton}
                  data-slot="tree-toggle"
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
                <span
                  aria-hidden="true"
                  className={styles.togglePlaceholder}
                  data-slot="tree-toggle-placeholder"
                />
              )}
              <div
                className={styles.treeContent}
                data-slot="tree-content"
                id={labelId}
              >
                {content}
              </div>
            </div>
            {hasVisibleChildren ? (
              <span
                aria-hidden="true"
                className={styles.treeChildrenStem}
                data-slot="tree-children-stem"
              />
            ) : null}
            {hasVisibleChildren ? (
              <ul
                className={styles.treeGroup}
                data-show-parent-lines={
                  resolvedShowParentLines ? "true" : "false"
                }
                data-slot="tree-group"
                id={groupId}
                role="group"
              >
                {renderVisibleNodes(childNodes, depth + 1)}
              </ul>
            ) : null}
          </li>
        );
      });
    }

    return (
      <ul
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={joinClassNames(styles.tree, className)}
        data-line-rounded={resolvedLineRadius > 0 ? "true" : "false"}
        data-show-parent-lines={resolvedShowParentLines ? "true" : "false"}
        data-slot="tree"
        role="tree"
        style={treeStyle}
        {...rest}
      >
        {renderVisibleNodes(data, 1)}
      </ul>
    );
  },
);

export default TreeView;
