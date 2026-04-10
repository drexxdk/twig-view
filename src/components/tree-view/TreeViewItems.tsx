import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import DefaultToggle from "./DefaultToggle";
import TreeItemConnectors from "./TreeItemConnectors";
import styles from "./tree-view.module.css";
import type {
  FlattenedTreeItem,
  TreeCssProperties,
  TreeViewLineStyle,
  TreeViewNode,
  TreeViewRenderNodeArgs,
  TreeViewRenderToggleArgs,
} from "./TreeView.types";
import useElementSize from "./useElementSize";
import {
  isDirectTreeItemEventTarget,
  joinClassNames,
  sharesContinuingAxis,
} from "./TreeView.utils";

type TreeViewItemsProps = {
  nodes: TreeViewNode[];
  treeId: string;
  itemsById: Map<string, FlattenedTreeItem>;
  expandedSet: Set<string>;
  resolvedFocusedId: string | null;
  indent: number;
  lineRadius: number;
  lineStyle: TreeViewLineStyle;
  lineWidth: number;
  rowGap: number;
  toggleSize: number;
  showParentLines: boolean;
  renderNode?: (args: TreeViewRenderNodeArgs) => ReactNode;
  renderToggle?: (args: TreeViewRenderToggleArgs) => ReactNode;
  toggleIcons?: { open?: ReactNode; closed?: ReactNode };
  toggleClassName?: string;
  toggleStyle?: CSSProperties;
  onItemFocus: (id: string) => void;
  onItemKeyDown: (
    event: KeyboardEvent<HTMLElement>,
    item: FlattenedTreeItem,
  ) => void;
  onToggle: (id: string) => void;
  setRowRef: (id: string, element: HTMLLIElement | null) => void;
};

type TreeViewItemProps = Omit<TreeViewItemsProps, "nodes"> & {
  node: TreeViewNode;
  index: number;
  siblingCount: number;
};

function TreeViewItem({
  node,
  index,
  siblingCount,
  treeId,
  itemsById,
  expandedSet,
  resolvedFocusedId,
  indent,
  lineRadius,
  lineStyle,
  lineWidth,
  rowGap,
  toggleSize,
  showParentLines,
  renderNode,
  renderToggle,
  toggleIcons,
  toggleClassName,
  toggleStyle,
  onItemFocus,
  onItemKeyDown,
  onToggle,
  setRowRef,
}: TreeViewItemProps) {
  const item = itemsById.get(node.id);

  if (!item) {
    return null;
  }

  const expanded = expandedSet.has(item.id);
  const focused = resolvedFocusedId === item.id;
  const toggleable = item.toggleable && item.hasChildren;
  const hasVisibleChildren = item.hasChildren && (!toggleable || expanded);
  const groupId = `${treeId}-${item.id}-group`;
  const labelId = `${treeId}-${item.id}-label`;
  const childNodes = hasVisibleChildren ? (node.children ?? []) : [];
  const itemSharesContinuingAxis = sharesContinuingAxis(item, itemsById);
  const ancestorRailCount = showParentLines
    ? item.ancestorContinuation.length
    : 0;
  const itemStyle = {
    ...(ancestorRailCount
      ? { "--tree-ancestor-width": `${ancestorRailCount * indent}px` }
      : {}),
  } as TreeCssProperties;
  const mergedToggleClassName = joinClassNames(
    toggleClassName,
    item.node.toggleClassName,
  );
  const mergedToggleStyle = {
    ...(toggleStyle ?? {}),
    ...(item.node.toggleStyle ?? {}),
  } as CSSProperties;
  const { ref: itemSizeRef, size: itemSize } = useElementSize<HTMLLIElement>({
    height: toggleSize + (hasVisibleChildren ? rowGap : 0),
  });
  const { ref: rowSizeRef, size: rowSize } = useElementSize<HTMLDivElement>({
    height: toggleSize,
  });

  let toggleNode: ReactNode;

  if (renderToggle) {
    toggleNode = renderToggle({
      node: item.node,
      id: item.id,
      path: item.path,
      depth: item.depth,
      expanded,
      hasChildren: item.hasChildren,
      toggleable,
      disabled: item.disabled,
      size: toggleSize,
    });
  } else {
    const openIcon = item.node.toggleIconOpen ?? toggleIcons?.open;
    const closedIcon = item.node.toggleIconClosed ?? toggleIcons?.closed;

    if (openIcon || closedIcon) {
      toggleNode = (
        <span
          aria-hidden="true"
          className={joinClassNames(
            styles.defaultToggleIcon,
            mergedToggleClassName,
          )}
          style={mergedToggleStyle}
        >
          {expanded ? (openIcon ?? closedIcon) : (closedIcon ?? openIcon)}
        </span>
      );
    } else {
      toggleNode = (
        <DefaultToggle
          expanded={expanded}
          className={mergedToggleClassName}
          style={mergedToggleStyle}
        />
      );
    }

    if (item.disabled && toggleable) {
      toggleNode = (
        <span
          aria-hidden="true"
          className={joinClassNames(
            styles.defaultToggleIcon,
            mergedToggleClassName,
          )}
          style={mergedToggleStyle}
        />
      );
    }
  }

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
        toggle: () => onToggle(item.id),
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
      data-last-child={index === siblingCount - 1 ? "true" : undefined}
      data-shares-continuing-axis={
        itemSharesContinuingAxis ? "true" : undefined
      }
      data-slot="tree-item"
      data-toggleable={toggleable ? "true" : undefined}
      data-visible-children={hasVisibleChildren ? "true" : undefined}
      ref={(element) => {
        itemSizeRef(element);
        setRowRef(item.id, element);
      }}
      role="treeitem"
      style={itemStyle}
      onClick={(event) => {
        if (isDirectTreeItemEventTarget(event)) {
          onItemFocus(item.id);
        }
      }}
      onFocus={(event) => {
        if (isDirectTreeItemEventTarget(event)) {
          onItemFocus(item.id);
        }
      }}
      onKeyDown={(event) => {
        if (isDirectTreeItemEventTarget(event)) {
          onItemKeyDown(event, item);
        }
      }}
    >
      <TreeItemConnectors
        ancestorContinuation={item.ancestorContinuation}
        depth={item.depth}
        hasNextSibling={item.hasNextSibling}
        hasVisibleChildren={hasVisibleChildren}
        indent={indent}
        itemLeft={itemSize.left}
        itemTop={itemSize.top}
        isFirstSibling={index === 0}
        itemHeight={itemSize.height}
        lineRadius={lineRadius}
        lineStyle={lineStyle}
        lineWidth={lineWidth}
        rowGap={rowGap}
        rowHeight={rowSize.height}
        sharesContinuingAxis={itemSharesContinuingAxis}
        showParentLines={showParentLines}
        toggleSize={toggleSize}
      />
      <div ref={rowSizeRef} className={styles.treeRow} data-slot="tree-row">
        {toggleable ? (
          <button
            aria-controls={groupId}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse node" : "Expand node"}
            className={joinClassNames(
              styles.toggleButton,
              mergedToggleClassName,
            )}
            data-slot="tree-toggle"
            disabled={item.disabled}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(item.id);
            }}
            style={mergedToggleStyle}
          >
            {toggleNode}
          </button>
        ) : (
          <span
            aria-hidden="true"
            className={styles.togglePlaceholder}
            data-slot="tree-toggle-placeholder"
          >
            {item.hasChildren ? (
              <span
                aria-hidden="true"
                className={joinClassNames(
                  styles.defaultToggleIcon,
                  mergedToggleClassName,
                )}
                style={mergedToggleStyle}
              />
            ) : null}
          </span>
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
        <ul
          className={styles.treeGroup}
          data-show-parent-lines={showParentLines ? "true" : "false"}
          data-slot="tree-group"
          id={groupId}
          role="group"
        >
          <TreeViewItems
            nodes={childNodes}
            treeId={treeId}
            itemsById={itemsById}
            expandedSet={expandedSet}
            resolvedFocusedId={resolvedFocusedId}
            indent={indent}
            lineRadius={lineRadius}
            lineStyle={lineStyle}
            lineWidth={lineWidth}
            rowGap={rowGap}
            toggleSize={toggleSize}
            showParentLines={showParentLines}
            renderNode={renderNode}
            renderToggle={renderToggle}
            toggleIcons={toggleIcons}
            toggleClassName={toggleClassName}
            toggleStyle={toggleStyle}
            onItemFocus={onItemFocus}
            onItemKeyDown={onItemKeyDown}
            onToggle={onToggle}
            setRowRef={setRowRef}
          />
        </ul>
      ) : null}
    </li>
  );
}

export default function TreeViewItems({
  nodes,
  treeId,
  itemsById,
  expandedSet,
  resolvedFocusedId,
  indent,
  lineRadius,
  lineStyle,
  lineWidth,
  rowGap,
  toggleSize,
  showParentLines,
  renderNode,
  renderToggle,
  toggleIcons,
  toggleClassName,
  toggleStyle,
  onItemFocus,
  onItemKeyDown,
  onToggle,
  setRowRef,
}: TreeViewItemsProps) {
  return nodes.map((node, index) => (
    <TreeViewItem
      key={node.id}
      expandedSet={expandedSet}
      indent={indent}
      index={index}
      itemsById={itemsById}
      lineRadius={lineRadius}
      lineStyle={lineStyle}
      lineWidth={lineWidth}
      node={node}
      onItemFocus={onItemFocus}
      onItemKeyDown={onItemKeyDown}
      onToggle={onToggle}
      renderNode={renderNode}
      renderToggle={renderToggle}
      resolvedFocusedId={resolvedFocusedId}
      rowGap={rowGap}
      setRowRef={setRowRef}
      showParentLines={showParentLines}
      siblingCount={nodes.length}
      toggleClassName={toggleClassName}
      toggleIcons={toggleIcons}
      toggleSize={toggleSize}
      toggleStyle={toggleStyle}
      treeId={treeId}
    />
  ));
}
