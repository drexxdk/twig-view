export const TWIG_TREE_DEFAULTS = {
  spacing: 16,
  idPrefix: "twig-tree",
  ariaLabel: "Tree",
  connector: {
    width: 1,
    color: "rgba(255, 0, 0, 0.5)",
    radius: 10,
  },
  itemLayout: {
    gap: 8,
  },
  animation: {
    enabled: true,
    duration: 1500,
    easing: "ease",
    animateOpacity: true,
    disabledAnimateOpacity: false,
  },
  toggle: {
    size: 16,
    radius: "50%",
    radiusPercent: 50,
    labelGap: "4px",
    labelGapPx: 8,
    iconMinSize: 10,
    iconSizeFactor: 0.6,
  },
  components: {
    link: "a",
  },
} as const;
