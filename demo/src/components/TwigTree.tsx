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

export type TwigTreeRenderToggleIconArgs = {
  item: TwigTreeItem;
  id: string;
  path: number[];
  expanded: boolean;
  size: number;
};

export type TwigTreeToggleOptions = {
  openBackground?: string;
  closedBackground?: string;
  foreground?: string;
  iconSize?: number;
  openIcon?: React.ReactNode;
  closedIcon?: React.ReactNode;
};

type TwigTreeProps = {
  items: TwigTreeItem[];
  lineWidth?: number;
  lineColor?: string;
  lineRadius?: number;
  toggleSize?: number;
  spacing?: number;
  itemPaddingBlock?: number;
  itemPaddingInlineStart?: number;
  itemPaddingInlineEnd?: number;
  className?: string;
  idPrefix?: string;
  style?: React.CSSProperties;
  animation?: boolean | TwigTreeAnimationOptions;
  onWillOpen?: (event: TwigTreeToggleEvent) => void;
  onOpenStart?: (event: TwigTreeToggleEvent) => void;
  onOpenEnd?: (event: TwigTreeToggleEvent) => void;
  onWillClose?: (event: TwigTreeToggleEvent) => void;
  onCloseStart?: (event: TwigTreeToggleEvent) => void;
  onCloseEnd?: (event: TwigTreeToggleEvent) => void;
  toggle?: TwigTreeToggleOptions;
  renderToggleIcon?: (args: TwigTreeRenderToggleIconArgs) => React.ReactNode;
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
  toggle: Required<
    Pick<
      TwigTreeToggleOptions,
      "openBackground" | "closedBackground" | "foreground" | "iconSize"
    >
  > &
    Pick<TwigTreeToggleOptions, "openIcon" | "closedIcon">;
  renderToggleIcon?: (args: TwigTreeRenderToggleIconArgs) => React.ReactNode;
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
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
  toggle,
  renderToggleIcon,
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
  const toggleIcon = renderToggleIcon
    ? renderToggleIcon({
        item,
        id: eventPayload.id,
        path,
        expanded,
        size: toggle.iconSize,
      })
    : expanded
      ? (toggle.openIcon ?? <DefaultToggleIcon expanded />)
      : (toggle.closedIcon ?? <DefaultToggleIcon expanded={false} />);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!hasChildren) {
    return (
      <li>
        <span className={`${styles.itemRow} ${styles.leafRow}`}>
          {item.label}
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
    <li data-expanded={expanded ? "true" : "false"} data-phase={phase}>
      <button
        type="button"
        className={`${styles.itemRow} ${styles.toggleRow}`}
        aria-controls={`${domId}-children`}
        aria-expanded={expanded}
        onClick={toggleExpanded}
      >
        <i className={styles.toggleButtonIcon}>{toggleIcon}</i>
        <span>{item.label}</span>
      </button>
      <div
        className={styles.childrenViewport}
        data-animate={animation.enabled ? "true" : "false"}
        data-expanded={expanded ? "true" : "false"}
        id={`${domId}-children`}
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
                toggle={toggle}
                renderToggleIcon={renderToggleIcon}
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
  lineWidth = 1,
  lineColor = "rgba(255, 0, 0, 0.5)",
  lineRadius = 10,
  toggleSize = 16,
  spacing = 4,
  itemPaddingBlock = 2,
  itemPaddingInlineStart = 0,
  itemPaddingInlineEnd = 0,
  className,
  idPrefix = "twig-tree",
  style,
  animation,
  onWillOpen,
  onOpenStart,
  onOpenEnd,
  onWillClose,
  onCloseStart,
  onCloseEnd,
  toggle,
  renderToggleIcon,
}: TwigTreeProps) {
  const { lineWidthDpi } = useLineWidthDpi(lineWidth);
  const resolvedAnimation = useMemo(
    () => normalizeAnimation(animation),
    [animation],
  );
  const resolvedToggle = useMemo(
    () => ({
      openBackground: toggle?.openBackground ?? "#16a34a",
      closedBackground: toggle?.closedBackground ?? "#6b7280",
      foreground: toggle?.foreground ?? "#ffffff",
      iconSize: toggle?.iconSize ?? Math.max(10, toggleSize * 0.6),
      openIcon: toggle?.openIcon,
      closedIcon: toggle?.closedIcon,
    }),
    [toggle, toggleSize],
  );

  return (
    <section
      className={joinClassNames(styles.tree, className)}
      style={
        {
          "--line-width": `${lineWidthDpi}px`,
          "--line-color": lineColor,
          "--line-radius": `${lineRadius}px`,
          "--toggle-size": `${toggleSize}px`,
          "--spacing": `${spacing}px`,
          "--item-padding-block": `${itemPaddingBlock}px`,
          "--item-padding-inline-start": `${itemPaddingInlineStart}px`,
          "--item-padding-inline-end": `${itemPaddingInlineEnd}px`,
          "--twig-toggle-open-bg": resolvedToggle.openBackground,
          "--twig-toggle-closed-bg": resolvedToggle.closedBackground,
          "--twig-toggle-foreground": resolvedToggle.foreground,
          "--twig-toggle-icon-size": `${resolvedToggle.iconSize}px`,
          "--twig-animation-duration": `${resolvedAnimation.duration}ms`,
          "--twig-animation-easing": resolvedAnimation.easing,
          "--twig-animation-opacity": resolvedAnimation.animateOpacity
            ? "1"
            : "0",
          ...(style ?? {}),
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
              toggle={resolvedToggle}
              renderToggleIcon={renderToggleIcon}
            />
          );
        })}
      </ul>
    </section>
  );
}
