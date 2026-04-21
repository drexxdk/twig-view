import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useLineWidthDpi from "../utils/useLineWidthDpi";
import TwigTreeBranch from "./TwigTreeBranch";
import styles from "./twigTree.module.css";
import {
  getActivatableDescendantLink,
  isNavigableTreeItem,
  isVisibleTreeItem,
  joinClassNames,
  mergeElementOptions,
  normalizeAnimation,
  scheduleTreeFocusMove,
  shouldHandleDescendantTreeNavigation,
} from "./TwigTree.shared";
import type {
  TwigTreeComponentsOptions,
  TwigTreeDefaultStyles,
  TwigTreeNavigationOptions,
  TwigTreeProps,
  TwigTreeResolvedToggleOptions,
  TwigTreeSlotOptions,
} from "./TwigTree.types";

export type {
  TwigTreeAnimationOptions,
  TwigTreeBranchItem,
  TwigTreeButtonItem,
  TwigTreeComponentsOptions,
  TwigTreeConnectorOptions,
  TwigTreeElementOptions,
  TwigTreeItem,
  TwigTreeItemLayoutOptions,
  TwigTreeLinkComponentProps,
  TwigTreeLinkItem,
  TwigTreeSlotOptions,
  TwigTreeToggleEvent,
  TwigTreeToggleOptions,
  TwigTreeToggleStateOptions,
} from "./TwigTree.types";

export default function TwigTree({
  items,
  connector,
  spacing = 16,
  itemLayout,
  useDefaultStyles,
  useDefaultDisabledStyles,
  useDefaultFocusStyles,
  useDefaultActionStyles,
  useDefaultStatusStyles,
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
  components,
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
  const resolvedDefaultStyles = useMemo<TwigTreeDefaultStyles>(
    () => ({
      disabled: useDefaultStyles ?? useDefaultDisabledStyles ?? false,
      focus: useDefaultStyles ?? useDefaultFocusStyles ?? false,
      action: useDefaultStyles ?? useDefaultActionStyles ?? false,
      status: useDefaultStyles ?? useDefaultStatusStyles ?? false,
    }),
    [
      useDefaultActionStyles,
      useDefaultDisabledStyles,
      useDefaultFocusStyles,
      useDefaultStatusStyles,
      useDefaultStyles,
    ],
  );
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
      action: slots?.action ?? {},
      children: slots?.children ?? {},
    }),
    [slots],
  );
  const resolvedToggle = useMemo<TwigTreeResolvedToggleOptions>(
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
  const resolvedComponents = useMemo<Required<TwigTreeComponentsOptions>>(
    () => ({
      link: components?.link ?? "a",
    }),
    [components],
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
    (key: string, options: TwigTreeNavigationOptions) => {
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
          if (options.hasAction) {
            options.activateAction();
            return true;
          }

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
      options: TwigTreeNavigationOptions,
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
      options: TwigTreeNavigationOptions,
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
      data-default-disabled-styles={
        resolvedDefaultStyles.disabled ? "true" : "false"
      }
      data-default-focus-styles={resolvedDefaultStyles.focus ? "true" : "false"}
      data-default-action-styles={
        resolvedDefaultStyles.action ? "true" : "false"
      }
      data-default-status-styles={
        resolvedDefaultStyles.status ? "true" : "false"
      }
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
              defaultStyles={resolvedDefaultStyles}
              linkComponent={resolvedComponents.link}
              toggle={resolvedToggle}
            />
          );
        })}
      </ul>
    </section>
  );
}
