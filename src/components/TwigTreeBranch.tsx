import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DefaultToggle from "./DefaultToggle";
import styles from "./twigTree.module.css";
import {
  hasInteractiveTreeContent,
  isButtonItem,
  isLinkItem,
  isNavigableTreeItem,
  joinClassNames,
  mergeElementOptions,
} from "./TwigTree.shared";
import type {
  TwigTreeBranchProps,
  TwigTreeItem,
  TwigTreeToggleEvent,
} from "./TwigTree.types";

export default function TwigTreeBranch({
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
  defaultStyles,
  linkComponent: LinkComponent,
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
  const rowShellRef = useRef<HTMLElement | null>(null);
  const loadChildren = item.loadChildren;
  const resolvedChildren = loadedChildren ?? item.children;
  const hasChildren = Boolean(resolvedChildren?.length);
  const canExpand = hasChildren || Boolean(loadChildren);

  const eventPayload = useMemo<TwigTreeToggleEvent>(
    () => ({
      item,
      id: item.id ?? path.join("-"),
      path,
    }),
    [item, path],
  );
  const resolvedToggleState = expanded ? toggle.open : toggle.closed;
  const toggleIcon = resolvedToggleState.icon ?? (
    <DefaultToggle expanded={expanded} />
  );
  const itemOptions = mergeElementOptions(
    slots.item,
    canExpand ? slots.branch : slots.leaf,
  );
  const rowOptions = mergeElementOptions(
    slots.row,
    canExpand ? slots.branchRow : slots.leafRow,
  );
  const labelOptions = slots.label;
  const actionOptions = slots.action;
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
  const isLinkActionItem = isLinkItem(item);
  const isButtonActionItem = isButtonItem(item);
  const hasPrimaryAction = isLinkActionItem || isButtonActionItem;
  const labelHasInteractiveContent = hasPrimaryAction;
  const trailingHasInteractiveContent = hasInteractiveTreeContent(
    item.trailing,
  );
  const isTreeItemNavigable =
    !item.disabled &&
    (canExpand || hasPrimaryAction || trailingHasInteractiveContent);
  const labelId = `${domId}-label`;
  const actionId = `${domId}-action`;
  const treeItemAriaDisabled =
    item.disabled && !item.trailing ? "true" : undefined;
  const rowShellClassName = joinClassNames(
    styles.itemRow,
    canExpand ? styles.branchRowShell : styles.leafRowShell,
    rowClassName,
  );
  const toggleButtonClassName = joinClassNames(
    styles.toggleButton,
    item.disabled && defaultStyles.disabled
      ? styles.toggleButtonDisabled
      : undefined,
    toggleButtonOptions.className,
  );
  const toggleGlyphClassName = joinClassNames(
    styles.toggleButtonGlyph,
    toggleIconOptions.className,
  );
  const [rowCenterOffset, setRowCenterOffset] = useState<number | null>(null);
  const itemStyle = {
    ...(itemOptions.style ?? {}),
    ...(rowCenterOffset !== null
      ? { ["--row-center-offset" as const]: `${rowCenterOffset}px` }
      : {}),
  } as React.CSSProperties;

  function clickPrimaryAction() {
    if (!hasPrimaryAction || item.disabled) {
      return;
    }

    const actionElement = document.getElementById(actionId);

    if (!(actionElement instanceof HTMLElement)) {
      return;
    }

    actionElement.click();
  }

  function renderLeafAction() {
    const actionClassName = joinClassNames(
      styles.itemAction,
      actionOptions.className,
    );
    const actionStyle = actionOptions.style;

    if (isLinkActionItem) {
      return (
        <LinkComponent
          id={actionId}
          href={item.href}
          target={item.target ?? "_self"}
          rel={item.rel}
          tabIndex={-1}
          className={actionClassName}
          style={actionStyle}
          aria-disabled={item.disabled ? true : undefined}
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            if (item.disabled) {
              event.preventDefault();
            }
          }}
        >
          {item.label}
        </LinkComponent>
      );
    }

    if (isButtonActionItem) {
      return (
        <button
          id={actionId}
          type="button"
          className={actionClassName}
          tabIndex={-1}
          style={actionStyle}
          disabled={item.disabled}
          onClick={item.onClickCallback}
        >
          {item.label}
        </button>
      );
    }

    return item.label;
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const rowShellElement = rowShellRef.current;

    if (!rowShellElement) {
      return;
    }

    const updateRowCenterOffset = () => {
      setRowCenterOffset(rowShellElement.getBoundingClientRect().height / 2);
    };

    updateRowCenterOffset();

    const resizeObserver = new ResizeObserver(() => {
      updateRowCenterOffset();
    });

    resizeObserver.observe(rowShellElement, { box: "border-box" });

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    item.label,
    item.trailing,
    expanded,
    loadedChildren,
    isLoading,
    loadError,
  ]);

  useEffect(() => {
    setLoadedChildren(item.children);
  }, [item.children]);

  useEffect(() => {
    if (
      !expanded ||
      !loadChildren ||
      loadedChildren !== undefined ||
      loadError
    ) {
      return;
    }

    let cancelled = false;

    setIsLoading(true);

    loadChildren()
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
  }, [expanded, loadChildren, loadedChildren, loadError]);

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

  const baseNavigationOptions = {
    treeItemId,
    parentTreeItemId,
    canExpand,
    expanded,
    disabled: Boolean(item.disabled),
  };

  if (!canExpand) {
    return (
      <li
        role="treeitem"
        className={itemClassName}
        style={itemStyle}
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
            ...baseNavigationOptions,
            hasAction: hasPrimaryAction,
            activateAction: clickPrimaryAction,
            focusFirstChild: () => {},
            toggleExpanded: () => {},
          });
        }}
      >
        <span
          ref={rowShellRef as React.RefObject<HTMLSpanElement>}
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
              item.disabled && defaultStyles.disabled
                ? styles.itemDisabled
                : undefined,
              labelClassName,
            )}
            style={labelOptions.style}
            onKeyDownCapture={(event) => {
              onTreeItemDescendantKeyDownCapture(event, {
                ...baseNavigationOptions,
                hasAction: hasPrimaryAction,
                activateAction: clickPrimaryAction,
                focusFirstChild: () => {},
                toggleExpanded: () => {},
              });
            }}
          >
            {renderLeafAction()}
          </span>
          {item.trailing ? (
            <span
              className={styles.trailingContent}
              onKeyDownCapture={(event) => {
                onTreeItemDescendantKeyDownCapture(event, {
                  ...baseNavigationOptions,
                  hasAction: hasPrimaryAction,
                  activateAction: clickPrimaryAction,
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

  return (
    <li
      role="treeitem"
      className={itemClassName}
      style={itemStyle}
      id={treeItemId}
      tabIndex={isFocusable ? 0 : -1}
      aria-level={level}
      aria-labelledby={labelId}
      aria-disabled={treeItemAriaDisabled}
      aria-expanded={expanded}
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
          ...baseNavigationOptions,
          hasAction: false,
          activateAction: () => {},
          focusFirstChild,
          toggleExpanded,
        });
      }}
    >
      <div
        ref={rowShellRef as React.RefObject<HTMLDivElement>}
        className={rowShellClassName}
        style={rowOptions.style}
        data-disabled={item.disabled ? "true" : "false"}
      >
        <div
          className={joinClassNames(styles.toggleRow)}
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
            className={joinClassNames(
              styles.labelContent,
              item.disabled && defaultStyles.disabled
                ? styles.itemDisabled
                : undefined,
              labelClassName,
            )}
            style={labelOptions.style}
            onKeyDownCapture={(event) => {
              onTreeItemDescendantKeyDownCapture(event, {
                ...baseNavigationOptions,
                hasAction: false,
                activateAction: () => {},
                focusFirstChild,
                toggleExpanded,
              });
            }}
          >
            {item.label}
          </span>
        </div>
        {item.trailing ? (
          <span
            className={joinClassNames(
              styles.trailingContent,
              item.disabled && defaultStyles.disabled
                ? styles.itemDisabled
                : undefined,
            )}
            onKeyDownCapture={(event) => {
              onTreeItemDescendantKeyDownCapture(event, {
                ...baseNavigationOptions,
                hasAction: false,
                activateAction: () => {},
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
                  defaultStyles={defaultStyles}
                  linkComponent={LinkComponent}
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
