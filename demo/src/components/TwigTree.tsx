import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./twigTree.module.css";
import useLineWidthDpi from "../utils/useLineWidthDpi";

export type TwigTreeItem = {
  id?: string;
  label: React.ReactNode;
  trailing?: React.ReactNode;
  children?: TwigTreeItem[];
  defaultExpanded?: boolean;
  disabled?: boolean;
  loadChildren?: () => Promise<TwigTreeItem[]>;
  loadingLabel?: React.ReactNode;
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
  children?: TwigTreeElementOptions;
};

type TwigTreeProps = {
  items: TwigTreeItem[];
  connector?: TwigTreeConnectorOptions;
  spacing?: number;
  itemLayout?: TwigTreeItemLayoutOptions;
  useDefaultStyles?: boolean;
  useDefaultDisabledStyles?: boolean;
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
};

type NormalizedAnimationOptions = {
  enabled: boolean;
  duration: number;
  easing: string;
  animateOpacity: boolean;
};

type TwigTreeBranchProps = {
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
    options: {
      treeItemId: string;
      parentTreeItemId?: string;
      canExpand: boolean;
      expanded: boolean;
      disabled: boolean;
      focusFirstChild: () => void;
      toggleExpanded: () => void;
    },
  ) => void;
  onTreeItemDescendantKeyDownCapture: (
    event: React.KeyboardEvent<HTMLElement>,
    options: {
      treeItemId: string;
      parentTreeItemId?: string;
      canExpand: boolean;
      expanded: boolean;
      disabled: boolean;
      focusFirstChild: () => void;
      toggleExpanded: () => void;
    },
  ) => void;
  useDefaultStyles: boolean;
  toggle: {
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
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function mergeElementOptions(
  ...values: Array<TwigTreeElementOptions | undefined>
): TwigTreeElementOptions {
  return values.reduce<TwigTreeElementOptions>(
    (result, value) => ({
      className: joinClassNames(result.className, value?.className),
      style: value?.style
        ? { ...(result.style ?? {}), ...value.style }
        : result.style,
    }),
    {},
  );
}

function normalizeAnimation(
  animation: TwigTreeProps["animation"],
): NormalizedAnimationOptions {
  if (animation === false) {
    return {
      enabled: false,
      duration: 0,
      easing: "ease",
      animateOpacity: false,
    };
  }

  if (animation === true || animation === undefined) {
    return {
      enabled: true,
      duration: 220,
      easing: "ease",
      animateOpacity: true,
    };
  }

  return {
    enabled: animation.enabled ?? true,
    duration: animation.duration ?? 220,
    easing: animation.easing ?? "ease",
    animateOpacity: animation.animateOpacity ?? true,
  };
}

function isVisibleTreeItem(element: HTMLElement) {
  return !element.closest(`.${styles.childrenViewport}[data-expanded="false"]`);
}

function hasNavigableDescendant(element: HTMLElement) {
  return Boolean(
    element.querySelector(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[role="button"]',
        '[role="link"]',
        '[tabindex]:not([tabindex="-1"])',
      ].join(", "),
    ),
  );
}

function isNavigableTreeItem(element: HTMLElement) {
  return (
    isVisibleTreeItem(element) &&
    element.dataset.disabled !== "true" &&
    (element.dataset.navigable === "true" || hasNavigableDescendant(element))
  );
}

function hasInteractiveTreeContent(node: React.ReactNode): boolean {
  if (node === null || node === undefined || typeof node === "boolean") {
    return false;
  }

  if (Array.isArray(node)) {
    return node.some(hasInteractiveTreeContent);
  }

  if (!React.isValidElement(node)) {
    return false;
  }

  const { children, href, onClick, role, tabIndex } = node.props as Record<
    string,
    unknown
  >;

  if (
    (typeof node.type === "string" &&
      ["a", "button", "input", "select", "textarea"].includes(node.type)) ||
    typeof href === "string" ||
    typeof onClick === "function" ||
    role === "button" ||
    role === "link" ||
    (typeof tabIndex === "number" && tabIndex >= 0)
  ) {
    return true;
  }

  return hasInteractiveTreeContent(children as React.ReactNode);
}

function shouldHandleDescendantTreeNavigation(
  event: React.KeyboardEvent<HTMLElement>,
) {
  if (event.target === event.currentTarget) {
    return true;
  }

  if (
    ![
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowRight",
    ].includes(event.key)
  ) {
    return false;
  }

  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return false;
  }

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return false;
  }

  return true;
}

function scheduleTreeFocusMove(callback: () => void) {
  window.setTimeout(callback, 0);
}

function getActivatableDescendantLink(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const link = target.closest<HTMLElement>('a[href], [role="link"]');

  if (!(link instanceof HTMLElement)) {
    return null;
  }

  return link;
}

function DefaultToggleIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={styles.toggleButtonIconSvg}
      viewBox="0 0 16 16"
    >
      <path
        d="M3 8h10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      {!expanded ? (
        <path
          d="M8 3v10"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  );
}

function TwigTreeBranch({
  item,
  path,
  domId,
  treeItemId,
  parentTreeItemId,
  level,
  animation,
  onWillOpen,
  onOpenStart,
  onOpenEnd,
  onWillClose,
  onCloseStart,
  onCloseEnd,
  slots,
  activeTreeItemId,
  onTreeItemFocus,
  onTreeItemKeyDown,
  onTreeItemDescendantKeyDownCapture,
  useDefaultStyles,
  toggle,
}: TwigTreeBranchProps) {
  const [loadedChildren, setLoadedChildren] = useState<
    TwigTreeItem[] | undefined
  >(item.children);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [expanded, setExpanded] = useState(Boolean(item.defaultExpanded));
  const [phase, setPhase] = useState<"open" | "closed" | "opening" | "closing">(
    item.defaultExpanded ? "open" : "closed",
  );
  const timeoutRef = useRef<number | null>(null);
  const resolvedChildren = loadedChildren ?? item.children;
  const hasChildren = Boolean(resolvedChildren?.length);
  const canExpand = hasChildren || Boolean(item.loadChildren);

  const eventPayload = useMemo<TwigTreeToggleEvent>(
    () => ({
      item,
      id: item.id ?? path.join("-"),
      path,
    }),
    [item, path],
  );
  const resolvedToggleState = expanded ? toggle.open : toggle.closed;
  const toggleIcon =
    resolvedToggleState.icon ??
    (expanded ? (
      <DefaultToggleIcon expanded />
    ) : (
      <DefaultToggleIcon expanded={false} />
    ));
  const itemOptions = mergeElementOptions(
    slots.item,
    canExpand ? slots.branch : slots.leaf,
  );
  const rowOptions = mergeElementOptions(
    slots.row,
    canExpand ? slots.branchRow : slots.leafRow,
  );
  const labelOptions = slots.label;
  const childrenOptions = slots.children;
  const toggleButtonOptions = mergeElementOptions(
    toggle.button,
    resolvedToggleState,
  );
  const toggleIconOptions = mergeElementOptions(toggle.icon);
  const toggleGlyphStyle = {
    width: `${toggle.icon.size}px`,
    height: `${toggle.icon.size}px`,
    ...(toggleIconOptions.style ?? {}),
  };
  const itemClassName = joinClassNames(itemOptions.className);
  const rowClassName = joinClassNames(rowOptions.className);
  const labelClassName = joinClassNames(labelOptions.className);
  const childrenClassName = joinClassNames(childrenOptions.className);
  const isFocusable = activeTreeItemId === treeItemId;
  const labelHasInteractiveContent = hasInteractiveTreeContent(item.label);
  const trailingHasInteractiveContent = hasInteractiveTreeContent(
    item.trailing,
  );
  const isTreeItemNavigable =
    !item.disabled &&
    (canExpand || labelHasInteractiveContent || trailingHasInteractiveContent);
  const labelId = `${domId}-label`;
  const treeItemAriaDisabled =
    item.disabled && !item.trailing ? "true" : undefined;
  const rowShellClassName = joinClassNames(
    styles.itemRow,
    canExpand ? styles.branchRowShell : styles.leafRowShell,
    rowClassName,
  );
  const toggleButtonClassName = joinClassNames(
    styles.toggleButton,
    toggleButtonOptions.className,
  );
  const toggleGlyphClassName = joinClassNames(
    styles.toggleButtonGlyph,
    toggleIconOptions.className,
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setLoadedChildren(item.children);
  }, [item.children]);

  useEffect(() => {
    if (
      !expanded ||
      !item.loadChildren ||
      loadedChildren !== undefined ||
      loadError
    ) {
      return;
    }

    let cancelled = false;

    setIsLoading(true);

    item
      .loadChildren()
      .then((nextChildren) => {
        if (cancelled) {
          return;
        }

        setLoadedChildren(nextChildren);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setLoadError(true);
      })
      .finally(() => {
        if (cancelled) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [expanded, item.loadChildren, loadedChildren, loadError]);

  if (!canExpand) {
    return (
      <li
        role="treeitem"
        className={itemClassName}
        style={itemOptions.style}
        id={treeItemId}
        tabIndex={isFocusable ? 0 : -1}
        aria-level={level}
        aria-labelledby={labelId}
        aria-disabled={treeItemAriaDisabled}
        data-treeitem-id={treeItemId}
        data-parent-treeitem-id={parentTreeItemId}
        data-navigable={isTreeItemNavigable ? "true" : "false"}
        data-level={level}
        data-disabled={item.disabled ? "true" : "false"}
        data-interactive-focus-target={
          labelHasInteractiveContent
            ? "label"
            : trailingHasInteractiveContent
              ? "trailing"
              : "none"
        }
        onFocus={() => {
          onTreeItemFocus(treeItemId);
        }}
        onKeyDown={(event) => {
          onTreeItemKeyDown(event, {
            treeItemId,
            parentTreeItemId,
            canExpand: false,
            expanded: false,
            disabled: Boolean(item.disabled),
            focusFirstChild: () => {},
            toggleExpanded: () => {},
          });
        }}
      >
        <span
          className={rowShellClassName}
          style={rowOptions.style}
          data-disabled={item.disabled ? "true" : "false"}
          onClick={() => {
            focusCurrentTreeItem();
          }}
        >
          <span
            id={labelId}
            className={joinClassNames(
              styles.labelContent,
              item.disabled && useDefaultStyles
                ? styles.itemDisabled
                : undefined,
              labelClassName,
            )}
            style={labelOptions.style}
            onKeyDownCapture={(event) => {
              onTreeItemDescendantKeyDownCapture(event, {
                treeItemId,
                parentTreeItemId,
                canExpand: false,
                expanded: false,
                disabled: Boolean(item.disabled),
                focusFirstChild: () => {},
                toggleExpanded: () => {},
              });
            }}
          >
            {item.label}
          </span>
          {item.trailing ? (
            <span
              className={styles.trailingContent}
              onKeyDownCapture={(event) => {
                onTreeItemDescendantKeyDownCapture(event, {
                  treeItemId,
                  parentTreeItemId,
                  canExpand: false,
                  expanded: false,
                  disabled: Boolean(item.disabled),
                  focusFirstChild: () => {},
                  toggleExpanded: () => {},
                });
              }}
            >
              {item.trailing}
            </span>
          ) : null}
        </span>
      </li>
    );
  }

  function finishPhase(nextPhase: "open" | "closed") {
    setPhase(nextPhase);

    if (nextPhase === "open") {
      onOpenEnd?.(eventPayload);
      return;
    }

    onCloseEnd?.(eventPayload);
  }

  function schedulePhaseEnd(nextPhase: "open" | "closed") {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!animation.enabled || animation.duration <= 0) {
      finishPhase(nextPhase);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      finishPhase(nextPhase);
      timeoutRef.current = null;
    }, animation.duration);
  }

  function toggleExpanded() {
    if (item.disabled) {
      return;
    }

    if (expanded) {
      onWillClose?.(eventPayload);
      onCloseStart?.(eventPayload);
      setExpanded(false);
      setPhase(animation.enabled ? "closing" : "closed");
      schedulePhaseEnd("closed");
      return;
    }

    onWillOpen?.(eventPayload);
    onOpenStart?.(eventPayload);
    setLoadError(false);
    setExpanded(true);
    setPhase(animation.enabled ? "opening" : "open");
    schedulePhaseEnd("open");
  }

  function focusFirstChild() {
    const root = document.getElementById(`${domId}-children`);
    const nextItem = root?.querySelector<HTMLElement>('[role="treeitem"]');

    if (!nextItem || !isNavigableTreeItem(nextItem)) {
      return;
    }

    nextItem.focus();
  }

  function focusCurrentTreeItem() {
    const currentItem = document.getElementById(treeItemId);

    if (!(currentItem instanceof HTMLElement)) {
      return;
    }

    currentItem.focus();
  }

  return (
    <li
      role="treeitem"
      className={itemClassName}
      style={itemOptions.style}
      id={treeItemId}
      tabIndex={isFocusable ? 0 : -1}
      aria-level={level}
      aria-labelledby={labelId}
      aria-disabled={treeItemAriaDisabled}
      aria-expanded={canExpand ? expanded : undefined}
      data-treeitem-id={treeItemId}
      data-parent-treeitem-id={parentTreeItemId}
      data-navigable={!item.disabled ? "true" : "false"}
      data-expanded={expanded ? "true" : "false"}
      data-phase={phase}
      data-level={level}
      data-disabled={item.disabled ? "true" : "false"}
      onFocus={() => {
        onTreeItemFocus(treeItemId);
      }}
      onKeyDown={(event) => {
        onTreeItemKeyDown(event, {
          treeItemId,
          parentTreeItemId,
          canExpand,
          expanded,
          disabled: Boolean(item.disabled),
          focusFirstChild,
          toggleExpanded,
        });
      }}
    >
      <div
        className={rowShellClassName}
        style={rowOptions.style}
        data-disabled={item.disabled ? "true" : "false"}
      >
        {canExpand ? (
          <div
            className={joinClassNames(
              styles.toggleRow,
              item.disabled && useDefaultStyles
                ? styles.itemDisabled
                : undefined,
            )}
            aria-hidden="true"
            data-disabled={item.disabled ? "true" : "false"}
            onClick={() => {
              focusCurrentTreeItem();
              toggleExpanded();
            }}
          >
            <i
              className={toggleButtonClassName}
              style={toggleButtonOptions.style}
            >
              <span className={toggleGlyphClassName} style={toggleGlyphStyle}>
                {toggleIcon}
              </span>
            </i>
            <span
              id={labelId}
              className={joinClassNames(styles.labelContent, labelClassName)}
              style={labelOptions.style}
              onKeyDownCapture={(event) => {
                onTreeItemDescendantKeyDownCapture(event, {
                  treeItemId,
                  parentTreeItemId,
                  canExpand,
                  expanded,
                  disabled: Boolean(item.disabled),
                  focusFirstChild,
                  toggleExpanded,
                });
              }}
            >
              {item.label}
            </span>
          </div>
        ) : (
          <span
            id={labelId}
            className={joinClassNames(
              styles.labelContent,
              item.disabled && useDefaultStyles
                ? styles.itemDisabled
                : undefined,
              labelClassName,
            )}
            style={labelOptions.style}
            onKeyDownCapture={(event) => {
              onTreeItemDescendantKeyDownCapture(event, {
                treeItemId,
                parentTreeItemId,
                canExpand,
                expanded,
                disabled: Boolean(item.disabled),
                focusFirstChild,
                toggleExpanded,
              });
            }}
          >
            {item.label}
          </span>
        )}
        {item.trailing ? (
          <span
            className={styles.trailingContent}
            onKeyDownCapture={(event) => {
              onTreeItemDescendantKeyDownCapture(event, {
                treeItemId,
                parentTreeItemId,
                canExpand,
                expanded,
                disabled: Boolean(item.disabled),
                focusFirstChild,
                toggleExpanded,
              });
            }}
          >
            {item.trailing}
          </span>
        ) : null}
      </div>
      <div
        className={joinClassNames(styles.childrenViewport, childrenClassName)}
        data-animate={animation.enabled ? "true" : "false"}
        data-expanded={expanded ? "true" : "false"}
        id={`${domId}-children`}
        aria-busy={isLoading}
        style={childrenOptions.style}
      >
        <ul role="group">
          {isLoading ? (
            <li role="none">
              <span
                className={joinClassNames(styles.itemRow, styles.statusRow)}
                role="status"
              >
                <span>{item.loadingLabel ?? "Loading..."}</span>
              </span>
            </li>
          ) : loadError ? (
            <li role="none">
              <span
                className={joinClassNames(styles.itemRow, styles.statusRow)}
                role="status"
              >
                <span>Unable to load items</span>
              </span>
            </li>
          ) : (
            resolvedChildren?.map((child, index) => {
              const childId = child.id ?? [...path, index].join("-");

              return (
                <TwigTreeBranch
                  key={childId}
                  item={child}
                  path={[...path, index]}
                  domId={`${domId}-${childId}`}
                  treeItemId={`${domId}-${childId}`}
                  parentTreeItemId={treeItemId}
                  level={level + 1}
                  animation={animation}
                  onWillOpen={onWillOpen}
                  onOpenStart={onOpenStart}
                  onOpenEnd={onOpenEnd}
                  onWillClose={onWillClose}
                  onCloseStart={onCloseStart}
                  onCloseEnd={onCloseEnd}
                  slots={slots}
                  activeTreeItemId={activeTreeItemId}
                  onTreeItemFocus={onTreeItemFocus}
                  onTreeItemKeyDown={onTreeItemKeyDown}
                  onTreeItemDescendantKeyDownCapture={
                    onTreeItemDescendantKeyDownCapture
                  }
                  useDefaultStyles={useDefaultStyles}
                  toggle={toggle}
                />
              );
            })
          )}
        </ul>
      </div>
    </li>
  );
}

export default function TwigTree({
  items,
  connector,
  spacing = 4,
  itemLayout,
  useDefaultStyles,
  useDefaultDisabledStyles,
  idPrefix = "twig-tree",
  ariaLabel = "Tree",
  slots,
  animation,
  onWillOpen,
  onOpenStart,
  onOpenEnd,
  onWillClose,
  onCloseStart,
  onCloseEnd,
  toggle,
}: TwigTreeProps) {
  const treeRef = useRef<HTMLElement | null>(null);
  const [activeTreeItemId, setActiveTreeItemId] = useState<string | null>(null);
  const resolvedConnector = useMemo(
    () => ({
      width: connector?.width ?? 1,
      color: connector?.color ?? "rgba(255, 0, 0, 0.5)",
      radius: connector?.radius ?? 10,
    }),
    [connector],
  );
  const resolvedItemLayout = useMemo(
    () => ({
      paddingBlock: itemLayout?.paddingBlock ?? 2,
    }),
    [itemLayout],
  );
  const { lineWidthDpi } = useLineWidthDpi(resolvedConnector.width);
  const resolvedAnimation = useMemo(
    () => normalizeAnimation(animation),
    [animation],
  );
  const resolvedUseDefaultStyles =
    useDefaultStyles ?? useDefaultDisabledStyles ?? false;
  const resolvedSlots = useMemo<Required<TwigTreeSlotOptions>>(
    () => ({
      tree: slots?.tree ?? {},
      item: slots?.item ?? {},
      branch: slots?.branch ?? {},
      leaf: slots?.leaf ?? {},
      row: slots?.row ?? {},
      branchRow: slots?.branchRow ?? {},
      leafRow: slots?.leafRow ?? {},
      label: slots?.label ?? {},
      children: slots?.children ?? {},
    }),
    [slots],
  );
  const resolvedToggle = useMemo(
    () => ({
      size: toggle?.size ?? 16,
      radius:
        typeof toggle?.radius === "number"
          ? `${toggle.radius}%`
          : (toggle?.radius ?? "50%"),
      labelGap:
        typeof toggle?.labelGap === "number"
          ? `${toggle.labelGap}px`
          : (toggle?.labelGap ?? "4px"),
      button: toggle?.button ?? {},
      icon: {
        size: toggle?.icon?.size ?? Math.max(10, (toggle?.size ?? 16) * 0.6),
        className: toggle?.icon?.className,
        style: toggle?.icon?.style,
      },
      open: toggle?.open ?? {},
      closed: toggle?.closed ?? {},
    }),
    [toggle],
  );
  const treeOptions = mergeElementOptions(resolvedSlots.tree);

  const focusTreeItemById = useCallback((treeItemId: string) => {
    const root = treeRef.current;

    if (!root) {
      return;
    }

    const nextItem = root.querySelector<HTMLElement>(
      `[data-treeitem-id="${treeItemId}"]`,
    );

    if (!nextItem || !isNavigableTreeItem(nextItem)) {
      return;
    }

    nextItem.focus();
  }, []);

  const getVisibleTreeItems = useCallback(() => {
    const root = treeRef.current;

    if (!root) {
      return [] as HTMLElement[];
    }

    return Array.from(
      root.querySelectorAll<HTMLElement>('[role="treeitem"]'),
    ).filter(isNavigableTreeItem);
  }, []);

  const getOrderedVisibleTreeItems = useCallback(() => {
    const root = treeRef.current;

    if (!root) {
      return [] as HTMLElement[];
    }

    return Array.from(
      root.querySelectorAll<HTMLElement>('[role="treeitem"]'),
    ).filter(isVisibleTreeItem);
  }, []);

  const focusRelativeTreeItem = useCallback(
    (treeItemId: string, offset: number) => {
      const visibleItems = getVisibleTreeItems();

      const currentIndex = visibleItems.findIndex(
        (element) => element.dataset.treeitemId === treeItemId,
      );

      if (currentIndex >= 0) {
        const nextIndex = currentIndex + offset;

        if (nextIndex < 0 || nextIndex >= visibleItems.length) {
          return;
        }

        visibleItems[nextIndex]?.focus();
        return;
      }

      const orderedVisibleItems = getOrderedVisibleTreeItems();
      const orderedCurrentIndex = orderedVisibleItems.findIndex(
        (element) => element.dataset.treeitemId === treeItemId,
      );

      if (orderedCurrentIndex < 0) {
        return;
      }

      for (
        let index = orderedCurrentIndex + offset;
        index >= 0 && index < orderedVisibleItems.length;
        index += offset
      ) {
        const nextElement = orderedVisibleItems[index];

        if (nextElement && isNavigableTreeItem(nextElement)) {
          nextElement.focus();
          return;
        }
      }
    },
    [getOrderedVisibleTreeItems, getVisibleTreeItems],
  );

  const onTreeItemFocus = useCallback((treeItemId: string) => {
    setActiveTreeItemId(treeItemId);
  }, []);

  const handleTreeItemNavigation = useCallback(
    (
      key: string,
      options: {
        treeItemId: string;
        parentTreeItemId?: string;
        canExpand: boolean;
        expanded: boolean;
        disabled: boolean;
        focusFirstChild: () => void;
        toggleExpanded: () => void;
      },
    ) => {
      switch (key) {
        case "ArrowDown":
          scheduleTreeFocusMove(() => {
            focusRelativeTreeItem(options.treeItemId, 1);
          });
          return true;
        case "ArrowUp":
          scheduleTreeFocusMove(() => {
            focusRelativeTreeItem(options.treeItemId, -1);
          });
          return true;
        case "Home":
          scheduleTreeFocusMove(() => {
            getVisibleTreeItems()[0]?.focus();
          });
          return true;
        case "End":
          scheduleTreeFocusMove(() => {
            const visibleItems = getVisibleTreeItems();
            visibleItems[visibleItems.length - 1]?.focus();
          });
          return true;
        case "ArrowRight":
          if (!options.canExpand) {
            return true;
          }

          if (!options.expanded) {
            options.toggleExpanded();
            return true;
          }

          scheduleTreeFocusMove(() => {
            options.focusFirstChild();
          });
          return true;
        case "ArrowLeft":
          if (options.canExpand && options.expanded) {
            options.toggleExpanded();
            return true;
          }

          if (options.parentTreeItemId) {
            scheduleTreeFocusMove(() => {
              focusTreeItemById(options.parentTreeItemId!);
            });
          }

          return true;
        case "Enter":
        case " ":
          if (!options.canExpand) {
            return false;
          }

          options.toggleExpanded();
          return true;
        default:
          return false;
      }
    },
    [focusRelativeTreeItem, focusTreeItemById, getVisibleTreeItems],
  );

  const onTreeItemKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLElement>,
      options: {
        treeItemId: string;
        parentTreeItemId?: string;
        canExpand: boolean;
        expanded: boolean;
        disabled: boolean;
        focusFirstChild: () => void;
        toggleExpanded: () => void;
      },
    ) => {
      if (event.target !== event.currentTarget) {
        return;
      }

      if (handleTreeItemNavigation(event.key, options)) {
        event.preventDefault();
      }
    },
    [handleTreeItemNavigation],
  );

  const onTreeItemDescendantKeyDownCapture = useCallback(
    (
      event: React.KeyboardEvent<HTMLElement>,
      options: {
        treeItemId: string;
        parentTreeItemId?: string;
        canExpand: boolean;
        expanded: boolean;
        disabled: boolean;
        focusFirstChild: () => void;
        toggleExpanded: () => void;
      },
    ) => {
      if (event.key === " ") {
        const activatableLink = getActivatableDescendantLink(event.target);

        if (activatableLink) {
          event.preventDefault();
          event.stopPropagation();
          activatableLink.click();
          return;
        }
      }

      if (!shouldHandleDescendantTreeNavigation(event)) {
        return;
      }

      if (event.target === event.currentTarget) {
        return;
      }

      if (handleTreeItemNavigation(event.key, options)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [handleTreeItemNavigation],
  );

  useEffect(() => {
    const visibleItems = getVisibleTreeItems();

    if (visibleItems.length === 0) {
      return;
    }

    if (!activeTreeItemId) {
      setActiveTreeItemId(visibleItems[0].dataset.treeitemId ?? null);
      return;
    }

    const currentItem = visibleItems.find(
      (element) => element.dataset.treeitemId === activeTreeItemId,
    );

    if (!currentItem) {
      setActiveTreeItemId(visibleItems[0].dataset.treeitemId ?? null);
    }
  }, [activeTreeItemId, getVisibleTreeItems, items]);

  return (
    <section
      ref={treeRef}
      className={joinClassNames(styles.tree, treeOptions.className)}
      data-default-styles={resolvedUseDefaultStyles ? "true" : "false"}
      data-theme={resolvedUseDefaultStyles ? "default" : "minimal"}
      style={
        {
          "--line-width": `${lineWidthDpi}px`,
          "--line-color": resolvedConnector.color,
          "--line-radius": `${resolvedConnector.radius}px`,
          "--toggle-size": `${resolvedToggle.size}px`,
          "--toggle-radius": resolvedToggle.radius,
          "--toggle-label-gap": resolvedToggle.labelGap,
          "--spacing": `${spacing}px`,
          "--item-padding-block": `${resolvedItemLayout.paddingBlock}px`,
          "--twig-animation-duration": `${resolvedAnimation.duration}ms`,
          "--twig-animation-easing": resolvedAnimation.easing,
          "--twig-animation-opacity": resolvedAnimation.animateOpacity
            ? "1"
            : "0",
          ...(treeOptions.style ?? {}),
        } as React.CSSProperties
      }
    >
      <ul role="tree" aria-label={ariaLabel}>
        {items.map((item, index) => {
          const itemId = item.id ?? `${index}`;
          const treeItemId = `${idPrefix}-${itemId}`;

          return (
            <TwigTreeBranch
              key={itemId}
              item={item}
              path={[index]}
              domId={treeItemId}
              treeItemId={treeItemId}
              level={1}
              animation={resolvedAnimation}
              onWillOpen={onWillOpen}
              onOpenStart={onOpenStart}
              onOpenEnd={onOpenEnd}
              onWillClose={onWillClose}
              onCloseStart={onCloseStart}
              onCloseEnd={onCloseEnd}
              slots={resolvedSlots}
              activeTreeItemId={activeTreeItemId}
              onTreeItemFocus={onTreeItemFocus}
              onTreeItemKeyDown={onTreeItemKeyDown}
              onTreeItemDescendantKeyDownCapture={
                onTreeItemDescendantKeyDownCapture
              }
              useDefaultStyles={resolvedUseDefaultStyles}
              toggle={resolvedToggle}
            />
          );
        })}
      </ul>
    </section>
  );
}
