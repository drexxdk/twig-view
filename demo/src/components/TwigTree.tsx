import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./twigTree.module.css";
import useLineWidthDpi from "../utils/useLineWidthDpi";

export type TwigTreeItem = {
  id?: string;
  label: React.ReactNode;
  children?: TwigTreeItem[];
  defaultExpanded?: boolean;
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
  idPrefix?: string;
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
  animation: NormalizedAnimationOptions;
  onWillOpen?: (event: TwigTreeToggleEvent) => void;
  onOpenStart?: (event: TwigTreeToggleEvent) => void;
  onOpenEnd?: (event: TwigTreeToggleEvent) => void;
  onWillClose?: (event: TwigTreeToggleEvent) => void;
  onCloseStart?: (event: TwigTreeToggleEvent) => void;
  onCloseEnd?: (event: TwigTreeToggleEvent) => void;
  slots: Required<TwigTreeSlotOptions>;
  toggle: {
    size: number;
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
  animation,
  onWillOpen,
  onOpenStart,
  onOpenEnd,
  onWillClose,
  onCloseStart,
  onCloseEnd,
  slots,
  toggle,
}: TwigTreeBranchProps) {
  const hasChildren = Boolean(item.children?.length);
  const [expanded, setExpanded] = useState(Boolean(item.defaultExpanded));
  const [phase, setPhase] = useState<"open" | "closed" | "opening" | "closing">(
    item.defaultExpanded ? "open" : "closed",
  );
  const timeoutRef = useRef<number | null>(null);

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
    hasChildren ? slots.branch : slots.leaf,
  );
  const rowOptions = mergeElementOptions(
    slots.row,
    hasChildren ? slots.branchRow : slots.leafRow,
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
  const toggleButtonClassName = joinClassNames(
    styles.toggleButtonIcon,
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

  if (!hasChildren) {
    return (
      <li className={itemClassName} style={itemOptions.style}>
        <span
          className={joinClassNames(
            styles.itemRow,
            styles.leafRow,
            rowClassName,
          )}
          style={rowOptions.style}
        >
          <span className={labelClassName} style={labelOptions.style}>
            {item.label}
          </span>
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
    setExpanded(true);
    setPhase(animation.enabled ? "opening" : "open");
    schedulePhaseEnd("open");
  }

  return (
    <li
      className={itemClassName}
      style={itemOptions.style}
      data-expanded={expanded ? "true" : "false"}
      data-phase={phase}
    >
      <button
        type="button"
        className={joinClassNames(
          styles.itemRow,
          styles.toggleRow,
          rowClassName,
        )}
        aria-controls={`${domId}-children`}
        aria-expanded={expanded}
        onClick={toggleExpanded}
        style={rowOptions.style}
      >
        <i className={toggleButtonClassName} style={toggleButtonOptions.style}>
          <span className={toggleGlyphClassName} style={toggleGlyphStyle}>
            {toggleIcon}
          </span>
        </i>
        <span className={labelClassName} style={labelOptions.style}>
          {item.label}
        </span>
      </button>
      <div
        className={joinClassNames(styles.childrenViewport, childrenClassName)}
        data-animate={animation.enabled ? "true" : "false"}
        data-expanded={expanded ? "true" : "false"}
        id={`${domId}-children`}
        style={childrenOptions.style}
      >
        <ul>
          {item.children?.map((child, index) => {
            const childId = child.id ?? [...path, index].join("-");

            return (
              <TwigTreeBranch
                key={childId}
                item={child}
                path={[...path, index]}
                domId={`${domId}-${childId}`}
                animation={animation}
                onWillOpen={onWillOpen}
                onOpenStart={onOpenStart}
                onOpenEnd={onOpenEnd}
                onWillClose={onWillClose}
                onCloseStart={onCloseStart}
                onCloseEnd={onCloseEnd}
                slots={slots}
                toggle={toggle}
              />
            );
          })}
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
  idPrefix = "twig-tree",
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

  return (
    <section
      className={joinClassNames(styles.tree, treeOptions.className)}
      style={
        {
          "--line-width": `${lineWidthDpi}px`,
          "--line-color": resolvedConnector.color,
          "--line-radius": `${resolvedConnector.radius}px`,
          "--toggle-size": `${resolvedToggle.size}px`,
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
      <ul>
        {items.map((item, index) => {
          const itemId = item.id ?? `${index}`;

          return (
            <TwigTreeBranch
              key={itemId}
              item={item}
              path={[index]}
              domId={`${idPrefix}-${itemId}`}
              animation={resolvedAnimation}
              onWillOpen={onWillOpen}
              onOpenStart={onOpenStart}
              onOpenEnd={onOpenEnd}
              onWillClose={onWillClose}
              onCloseStart={onCloseStart}
              onCloseEnd={onCloseEnd}
              slots={resolvedSlots}
              toggle={resolvedToggle}
            />
          );
        })}
      </ul>
    </section>
  );
}
