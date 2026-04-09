import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type TreeViewRouting = "indent-vertical";
export type TreeViewLineStyle = "solid" | "dashed" | "dotted";

export type TreeViewLineOptions = {
  width?: number;
  color?: string;
  radius?: number;
  showParentLines?: boolean;
  style?: TreeViewLineStyle;
};

export type TreeViewToggleOptions = {
  background?: string;
  foreground?: string;
  focusRingColor?: string;
  focusRingOffset?: number;
};

export type TreeViewNode = {
  id: string;
  label: ReactNode;
  children?: TreeViewNode[];
  toggleable?: boolean;
  disabled?: boolean;
  defaultExpanded?: boolean;
  icon?: ReactNode;
  toggleIconOpen?: ReactNode;
  toggleIconClosed?: ReactNode;
  toggleClassName?: string;
  toggleStyle?: CSSProperties;
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
  HTMLAttributes<HTMLElement>,
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
  loading?: ReactNode;
  line?: TreeViewLineOptions;
  lineWidth?: number;
  lineColor?: string;
  indent?: number;
  rowGap?: number;
  childGap?: number;
  toggleSize?: number;
  routing?: TreeViewRouting;
  renderNode?: (args: TreeViewRenderNodeArgs) => ReactNode;
  renderToggle?: (args: TreeViewRenderToggleArgs) => ReactNode;
  toggleIcons?: { open?: ReactNode; closed?: ReactNode };
  toggle?: TreeViewToggleOptions;
  toggleClassName?: string;
  toggleStyle?: CSSProperties;
};

export type FlattenedTreeItem = {
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

export type TreeCssProperties = CSSProperties & Record<`--${string}`, string>;
