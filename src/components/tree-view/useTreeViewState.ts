import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_LINE_COLOR,
  DEFAULT_LINE_RADIUS,
  DEFAULT_LINE_STYLE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_SHOW_PARENT_LINES,
  DEFAULT_TOGGLE_FOCUS_RING_OFFSET,
} from "./TreeView.constants";
import type {
  TreeViewLineOptions,
  TreeViewNode,
  TreeViewToggleOptions,
} from "./TreeView.types";
import {
  collectDefaultExpandedIds,
  flattenVisibleTree,
} from "./TreeView.utils";
import useLineWidthDpi from "./useLineWidthDpi";

type UseTreeViewStateArgs = {
  data: TreeViewNode[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  focusedId?: string;
  defaultFocusedId?: string;
  line?: TreeViewLineOptions;
  lineWidth?: number;
  lineColor?: string;
  onExpandedIdsChange?: (expandedIds: string[]) => void;
  onFocusedIdChange?: (id: string | null) => void;
  toggleOptions?: TreeViewToggleOptions;
};

export function useTreeViewState({
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
}: UseTreeViewStateArgs) {
  const resolvedLineOptions = useMemo(
    () => ({
      width: line?.width ?? lineWidth ?? DEFAULT_LINE_WIDTH,
      color: line?.color ?? lineColor ?? DEFAULT_LINE_COLOR,
      radius: line?.radius ?? DEFAULT_LINE_RADIUS,
      showParentLines: line?.showParentLines ?? DEFAULT_SHOW_PARENT_LINES,
      style: line?.style ?? DEFAULT_LINE_STYLE,
    }),
    [line, lineColor, lineWidth],
  );

  const resolvedToggleOptions = useMemo(
    () => ({
      background: toggleOptions?.background,
      foreground: toggleOptions?.foreground,
      focusRingColor: toggleOptions?.focusRingColor,
      focusRingOffset:
        toggleOptions?.focusRingOffset ?? DEFAULT_TOGGLE_FOCUS_RING_OFFSET,
    }),
    [toggleOptions],
  );

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
  const { isResolved, lineWidthDpi } = useLineWidthDpi(
    resolvedLineOptions.width,
  );
  const { items, itemsById } = useMemo(
    () => flattenVisibleTree(data, expandedSet),
    [data, expandedSet],
  );
  const resolvedFocusedId = isFocusedControlled
    ? (focusedId ?? null)
    : uncontrolledFocusedId;

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

  return {
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
  };
}
