import React, { forwardRef, useId, useImperativeHandle } from "react";
import {
  DEFAULT_CHILD_GAP,
  DEFAULT_INDENT,
  DEFAULT_ROW_GAP,
  DEFAULT_TOGGLE_SIZE,
} from "./TreeView.constants";
import type {
  TreeCssProperties,
  TreeViewHandle,
  TreeViewProps,
} from "./TreeView.types";
import TreeViewItems from "./TreeViewItems";
import styles from "./tree-view.module.css";
import { joinClassNames } from "./TreeView.utils";
import { useTreeViewFocus } from "./useTreeViewFocus";
import { useTreeViewInteractions } from "./useTreeViewInteractions";
import { useTreeViewState } from "./useTreeViewState";
export type {
  TreeViewHandle,
  TreeViewLineOptions,
  TreeViewLineStyle,
  TreeViewNode,
  TreeViewProps,
  TreeViewRenderNodeArgs,
  TreeViewRenderToggleArgs,
  TreeViewRouting,
  TreeViewToggleOptions,
} from "./TreeView.types";

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
      toggle: toggleOptions,
      indent = DEFAULT_INDENT,
      rowGap = DEFAULT_ROW_GAP,
      childGap = DEFAULT_CHILD_GAP,
      toggleSize = DEFAULT_TOGGLE_SIZE,
      routing = "indent-vertical",
      renderNode,
      renderToggle,
      toggleIcons,
      toggleClassName,
      toggleStyle,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const treeId = useId();
    const {
      expandedSet,
      isResolved,
      items,
      itemsById,
      lineWidthDpi,
      resolvedFocusedId,
      resolvedLineOptions,
      resolvedToggleOptions,
      updateExpandedIds,
      updateFocusedId,
    } = useTreeViewState({
      data,
      defaultExpandedIds,
      expandedIds,
      focusedId,
      defaultFocusedId,
      line,
      lineWidth,
      lineColor,
      onExpandedIdsChange,
      onFocusedIdChange,
      toggleOptions,
    });

    const { focusItem, setRowRef, treeRef } = useTreeViewFocus({
      data,
      items,
      itemsById,
      resolvedFocusedId,
      updateFocusedId,
    });

    const { collapse, collapseAll, expand, expandAll, handleKeyDown, toggle } =
      useTreeViewInteractions({
        data,
        expandedSet,
        focusItem,
        items,
        itemsById,
        updateExpandedIds,
      });

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
      "--tree-line-color": resolvedLineOptions.color,
      "--tree-line-radius": `${resolvedLineOptions.radius}px`,
      "--tree-line-style": resolvedLineOptions.style,
      "--tree-indent": `${indent}px`,
      "--tree-row-gap": `${rowGap}px`,
      "--tree-child-gap": `${childGap}px`,
      "--tree-toggle-size": `${toggleSize}px`,
      ...(resolvedToggleOptions.background
        ? { "--tree-toggle-bg": resolvedToggleOptions.background }
        : {}),
      ...(resolvedToggleOptions.foreground
        ? { "--tree-toggle-foreground": resolvedToggleOptions.foreground }
        : {}),
      ...(resolvedToggleOptions.focusRingColor
        ? {
            "--tree-toggle-focus-ring-color":
              resolvedToggleOptions.focusRingColor,
          }
        : {}),
      "--tree-toggle-focus-ring-offset": `${resolvedToggleOptions.focusRingOffset}px`,
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

    return (
      <ul
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={joinClassNames(styles.tree, className)}
        data-line-rounded={resolvedLineOptions.radius > 0 ? "true" : "false"}
        data-line-style={resolvedLineOptions.style}
        data-show-parent-lines={
          resolvedLineOptions.showParentLines ? "true" : "false"
        }
        data-slot="tree"
        ref={treeRef}
        role="tree"
        style={treeStyle}
        {...rest}
      >
        <TreeViewItems
          nodes={data}
          treeId={treeId}
          itemsById={itemsById}
          expandedSet={expandedSet}
          resolvedFocusedId={resolvedFocusedId}
          indent={indent}
          lineRadius={resolvedLineOptions.radius}
          lineStyle={resolvedLineOptions.style}
          lineWidth={lineWidthDpi}
          rowGap={rowGap}
          toggleSize={toggleSize}
          showParentLines={resolvedLineOptions.showParentLines}
          renderNode={renderNode}
          renderToggle={renderToggle}
          toggleIcons={toggleIcons}
          toggleClassName={toggleClassName}
          toggleStyle={toggleStyle}
          onItemFocus={updateFocusedId}
          onItemKeyDown={handleKeyDown}
          onToggle={toggle}
          setRowRef={setRowRef}
        />
      </ul>
    );
  },
);

export default TreeView;
