import React from "react";
import styles from "./twigTree.module.css";
import type {
  NormalizedAnimationOptions,
  TwigTreeAnimationOptions,
  TwigTreeButtonItem,
  TwigTreeElementOptions,
  TwigTreeItem,
  TwigTreeLinkItem,
} from "./TwigTree.types";

export function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function mergeElementOptions(
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

export function normalizeAnimation(
  animation: boolean | TwigTreeAnimationOptions | undefined,
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

export function isLinkItem(item: TwigTreeItem): item is TwigTreeLinkItem {
  return "href" in item;
}

export function isButtonItem(item: TwigTreeItem): item is TwigTreeButtonItem {
  return "onClickCallback" in item;
}

export function isVisibleTreeItem(element: HTMLElement) {
  return !element.closest(`.${styles.childrenViewport}[data-expanded="false"]`);
}

export function hasNavigableDescendant(element: HTMLElement) {
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

export function isNavigableTreeItem(element: HTMLElement) {
  return (
    isVisibleTreeItem(element) &&
    element.dataset.disabled !== "true" &&
    (element.dataset.navigable === "true" || hasNavigableDescendant(element))
  );
}

export function hasInteractiveTreeContent(node: React.ReactNode): boolean {
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

export function shouldHandleDescendantTreeNavigation(
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

export function scheduleTreeFocusMove(callback: () => void) {
  window.setTimeout(callback, 0);
}

export function getActivatableDescendantLink(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const link = target.closest<HTMLElement>('a[href], [role="link"]');

  if (!(link instanceof HTMLElement)) {
    return null;
  }

  return link;
}
