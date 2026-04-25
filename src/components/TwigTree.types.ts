import type React from "react";

type TwigTreeItemBase = {
  id?: string;
  label: React.ReactNode;
  trailing?: React.ReactNode;
  disabled?: boolean;
};

export type TwigTreeBranchItem = TwigTreeItemBase & {
  children?: TwigTreeItem[];
  defaultExpanded?: boolean;
  loadChildren?: () => Promise<TwigTreeItem[]>;
  loadingLabel?: React.ReactNode;
  href?: never;
  target?: never;
  rel?: never;
  onClickCallback?: never;
};

export type TwigTreeLinkItem = TwigTreeItemBase & {
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  onClickCallback?: never;
  children?: never;
  defaultExpanded?: never;
  loadChildren?: never;
  loadingLabel?: never;
};

export type TwigTreeButtonItem = TwigTreeItemBase & {
  onClickCallback: React.MouseEventHandler<HTMLButtonElement>;
  href?: never;
  target?: never;
  rel?: never;
  children?: never;
  defaultExpanded?: never;
  loadChildren?: never;
  loadingLabel?: never;
};

export type TwigTreeItem =
  | TwigTreeBranchItem
  | TwigTreeLinkItem
  | TwigTreeButtonItem;

export type TwigTreeLinkComponentProps = {
  id?: string;
  href: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  tabIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
  children: React.ReactNode;
  "aria-disabled"?: React.AriaAttributes["aria-disabled"];
};

export type TwigTreeComponentsOptions = {
  link?: React.ElementType<TwigTreeLinkComponentProps>;
};

export type TwigTreeToggleEvent = {
  item: TwigTreeItem;
  id: string;
  path: number[];
};

export type TwigTreeAnimationOptions = {
  enabled?: boolean;
  duration?: number;
  easing?: string;
  animateOpacity?: boolean;
};

export type TwigTreeElementOptions = {
  className?: string;
  style?: React.CSSProperties;
};

export type TwigTreeConnectorOptions = {
  width?: number;
  color?: string;
  radius?: number;
};

export type TwigTreeItemLayoutOptions = {
  gap?: number;
  paddingBlock?: number;
};

export type TwigTreeToggleStateOptions = TwigTreeElementOptions & {
  icon?: React.ReactNode;
};

export type TwigTreeToggleOptions = {
  size?: number;
  radius?: number | string;
  labelGap?: number | string;
  button?: TwigTreeElementOptions;
  icon?: TwigTreeElementOptions & {
    size?: number;
  };
  open?: TwigTreeToggleStateOptions;
  closed?: TwigTreeToggleStateOptions;
};

export type TwigTreeSlotOptions = {
  tree?: TwigTreeElementOptions;
  item?: TwigTreeElementOptions;
  branch?: TwigTreeElementOptions;
  leaf?: TwigTreeElementOptions;
  row?: TwigTreeElementOptions;
  branchRow?: TwigTreeElementOptions;
  leafRow?: TwigTreeElementOptions;
  label?: TwigTreeElementOptions;
  action?: TwigTreeElementOptions;
  children?: TwigTreeElementOptions;
};

export type TwigTreeProps = {
  items: TwigTreeItem[];
  connector?: TwigTreeConnectorOptions;
  spacing?: number;
  itemLayout?: TwigTreeItemLayoutOptions;
  useDefaultStyles?: boolean;
  useDefaultDisabledStyles?: boolean;
  useDefaultFocusStyles?: boolean;
  useDefaultActionStyles?: boolean;
  useDefaultStatusStyles?: boolean;
  idPrefix?: string;
  ariaLabel?: string;
  slots?: TwigTreeSlotOptions;
  animation?: boolean | TwigTreeAnimationOptions;
  onWillOpen?: (event: TwigTreeToggleEvent) => void;
  onOpenStart?: (event: TwigTreeToggleEvent) => void;
  onOpenEnd?: (event: TwigTreeToggleEvent) => void;
  onWillClose?: (event: TwigTreeToggleEvent) => void;
  onCloseStart?: (event: TwigTreeToggleEvent) => void;
  onCloseEnd?: (event: TwigTreeToggleEvent) => void;
  toggle?: TwigTreeToggleOptions;
  components?: TwigTreeComponentsOptions;
};

export type TwigTreeHandle = {
  focus: (itemId: string) => boolean;
  expand: (itemId: string) => boolean;
  collapse: (itemId: string) => boolean;
  toggle: (itemId: string) => boolean;
  expandAll: () => number;
  collapseAll: () => number;
  getExpandedIds: () => string[];
  getVisibleIds: () => string[];
};

export type NormalizedAnimationOptions = {
  enabled: boolean;
  duration: number;
  easing: string;
  animateOpacity: boolean;
};

export type TwigTreeNavigationOptions = {
  treeItemId: string;
  parentTreeItemId?: string;
  canExpand: boolean;
  expanded: boolean;
  disabled: boolean;
  hasAction: boolean;
  activateAction: () => void;
  focusFirstChild: () => void;
  toggleExpanded: () => void;
};

export type TwigTreeDefaultStyles = {
  disabled: boolean;
  focus: boolean;
  action: boolean;
  status: boolean;
};

export type TwigTreeResolvedToggleOptions = {
  size: number;
  radius: string;
  labelGap: string;
  button: TwigTreeElementOptions;
  icon: TwigTreeElementOptions & {
    size: number;
  };
  open: TwigTreeToggleStateOptions;
  closed: TwigTreeToggleStateOptions;
};

export type TwigTreeBranchProps = {
  item: TwigTreeItem;
  path: number[];
  domId: string;
  treeItemId: string;
  parentTreeItemId?: string;
  level: number;
  animation: NormalizedAnimationOptions;
  onWillOpen?: (event: TwigTreeToggleEvent) => void;
  onOpenStart?: (event: TwigTreeToggleEvent) => void;
  onOpenEnd?: (event: TwigTreeToggleEvent) => void;
  onWillClose?: (event: TwigTreeToggleEvent) => void;
  onCloseStart?: (event: TwigTreeToggleEvent) => void;
  onCloseEnd?: (event: TwigTreeToggleEvent) => void;
  slots: Required<TwigTreeSlotOptions>;
  activeTreeItemId: string | null;
  onTreeItemFocus: (treeItemId: string) => void;
  onTreeItemKeyDown: (
    event: React.KeyboardEvent<HTMLElement>,
    options: TwigTreeNavigationOptions,
  ) => void;
  onTreeItemDescendantKeyDownCapture: (
    event: React.KeyboardEvent<HTMLElement>,
    options: TwigTreeNavigationOptions,
  ) => void;
  defaultStyles: TwigTreeDefaultStyles;
  linkComponent: React.ElementType<TwigTreeLinkComponentProps>;
  toggle: TwigTreeResolvedToggleOptions;
};
