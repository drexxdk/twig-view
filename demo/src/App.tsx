import {
  Radio,
  RadioGroup,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { useMemo, useRef, useState } from "react";
import {
  TWIG_TREE_DEFAULTS,
  TwigTree,
  type TwigTreeButtonItem,
  type TwigTreeItem,
} from "../../src/components";

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

type ControlsState = {
  lineWidth: number;
  lineColor: string;
  lineRadius: number;
  toggleSize: number;
  toggleRadius: number;
  toggleLabelGap: number;
  spacing: number;
  itemGap: number;
  useDefaultDisabledStyles: boolean;
  useDefaultFocusStyles: boolean;
  useDefaultActionStyles: boolean;
  useDefaultStatusStyles: boolean;
  idPrefix: string;
  animationEnabled: boolean;
  animationDuration: number;
  animationEasing: string;
  animateOpacity: boolean;
  treeSlotClassName: string;
  treeSlotStyle: string;
  rowSlotClassName: string;
  rowSlotStyle: string;
  labelSlotClassName: string;
  labelSlotStyle: string;
  childrenSlotClassName: string;
  childrenSlotStyle: string;
  toggleIconSize: number;
  toggleButtonClassName: string;
  toggleButtonStyle: string;
  toggleIconClassName: string;
  toggleIconStyle: string;
  toggleOpenClassName: string;
  toggleOpenStyle: string;
  toggleClosedClassName: string;
  toggleClosedStyle: string;
  useCustomDemoToggles: boolean;
};

type ControlTabId =
  | "layout"
  | "connectors"
  | "animation"
  | "slots"
  | "styles"
  | "toggles";

const GITHUB_URL = "https://github.com/drexxdk/twig-view";
const NPM_URL = "https://www.npmjs.com/package/twig-view";
const INSTALL_COMMAND = "npm install twig-view";

const featureCards = [
  {
    title: "Accessible",
    body: "Tree semantics, keyboard navigation, and focus handling are built in.",
  },
  {
    title: "Configurable",
    body: "Adjust connectors, spacing, toggles, and default styles from one API.",
  },
  {
    title: "Customizable",
    body: "Use the default toggle or swap icons and state styling as needed.",
  },
  {
    title: "Lazy-ready",
    body: "Load branch children on demand without changing the tree model.",
  },
] as const;

const demoExampleCards = [
  {
    title: "Workspace navigation",
    branch: "Workspace navigation",
    body: "Shows deep nesting, rich labels, buttons, links, status pills, and connector continuity across multiple levels.",
    prompt:
      "Open Product roadmap and Launch rollout plan to inspect multi-level navigation and mixed content rows.",
  },
  {
    title: "Content library",
    branch: "Content library",
    body: "Demonstrates editorial-style labels with secondary metadata, publishing state, and reference-link items.",
    prompt:
      "Compare the drafted case study row with the linked Editorial guidelines item.",
  },
  {
    title: "Disabled release flow",
    branch: "Release operations",
    body: "Highlights disabled branch behavior and how nested items inherit the disabled state until the flow is enabled.",
    prompt:
      "Toggle the release operations checkbox to compare disabled and enabled branches.",
  },
  {
    title: "Async success",
    branch: "Analytics snapshots",
    body: "Illustrates a lazy branch that resolves immediately on first expand and then stays cached for later opens.",
    prompt:
      "Expand Analytics snapshots and inspect the loaded Daily pulse and Weekly KPI digest items.",
  },
  {
    title: "Async retry",
    branch: "Analytics workspace",
    body: "Shows a lazy branch with a first-load failure, inline error messaging, and retry-on-reopen behavior.",
    prompt:
      "Expand Analytics workspace once to see the error state, then collapse and reopen it to recover.",
  },
] as const;

const controlTabs: Array<{
  id: ControlTabId;
  label: string;
}> = [
  {
    id: "layout",
    label: "Layout",
  },
  {
    id: "connectors",
    label: "Connectors",
  },
  {
    id: "animation",
    label: "Animation",
  },
  {
    id: "slots",
    label: "Slots",
  },
  {
    id: "styles",
    label: "Default styles",
  },
  {
    id: "toggles",
    label: "Toggles",
  },
] as const;

const easingOptions = [
  {
    id: "ease",
    label: "Ease",
    value: "ease",
    description: "Balanced default curve for general UI motion.",
  },
  {
    id: "linear",
    label: "Linear",
    value: "linear",
    description: "Constant speed from start to finish.",
  },
  {
    id: "ease-in",
    label: "Ease in",
    value: "ease-in",
    description: "Starts slow and accelerates toward the end.",
  },
  {
    id: "ease-out",
    label: "Ease out",
    value: "ease-out",
    description: "Starts quickly and settles gently.",
  },
  {
    id: "ease-in-out",
    label: "Ease in out",
    value: "ease-in-out",
    description: "Slow start, fast middle, slow finish.",
  },
  {
    id: "custom",
    label: "Custom",
    value: null,
    description: "Enter any valid CSS easing function.",
  },
] as const;

function getEasingPreset(value: string) {
  return easingOptions.find(
    (option) => option.value !== null && option.value === value,
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="demoFieldLabel">
      <span>
        {label}
        <span className="demoFieldValue">{value}</span>
      </span>
      <input
        className="demoRangeInput"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  description,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  description?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="demoFieldLabel demoFieldLabelWide">
      <span>{label}</span>
      <textarea
        className="demoTextAreaInput"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      {description ? (
        <span className="demoFieldDescription">{description}</span>
      ) : null}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="demoFieldLabel">
      <span>{label}</span>
      <div className="demoColorFieldRow">
        <input
          className="demoColorInput"
          type="color"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <input
          className="demoTextInput"
          type="text"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  description,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  description?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="demoFieldLabel demoFieldLabelWide">
      <span>{label}</span>
      <input
        className="demoTextInput"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      {description ? (
        <span className="demoFieldDescription">{description}</span>
      ) : null}
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="demoCheckboxField">
      <input
        className="demoCheckboxInput"
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span>{label}</span>
    </label>
  );
}

function ControlSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="demoControlSection demoPanelInset">
      <header>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

function RichLabel({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="demoRichLabel">
      <span>{title}</span>
      <span className="demoMetaText">{meta}</span>
    </div>
  );
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="demoStatusPill">{children}</span>;
}

function EasingField({
  value,
  customValue,
  onPresetChange,
  onCustomValueChange,
}: {
  value: string;
  customValue: string;
  onPresetChange: (value: string) => void;
  onCustomValueChange: (value: string) => void;
}) {
  const selectedOptionId = getEasingPreset(value)?.id ?? "custom";

  return (
    <div className="demoFieldStack demoFieldStackWide">
      <div className="demoFieldHeaderBlock">
        <span className="demoFieldTitle">Animation easing</span>
        <p className="demoFieldDescription">
          Pick a common CSS easing curve or switch to Custom for
          <code> cubic-bezier(...)</code> and <code>steps(...)</code>.
        </p>
      </div>

      <RadioGroup
        value={selectedOptionId}
        onChange={onPresetChange}
        aria-label="Animation easing"
        className="demoOptionGrid"
      >
        {easingOptions.map((option) => (
          <Radio key={option.id} value={option.id} className="demoOptionCard">
            <div className="demoOptionCardHeader">
              <span className="demoOptionCardTitle">{option.label}</span>
              {option.value ? <code>{option.value}</code> : null}
            </div>
            <p className="demoOptionCardBody">{option.description}</p>
          </Radio>
        ))}
      </RadioGroup>

      {selectedOptionId === "custom" ? (
        <TextField
          label="Animation custom easing"
          value={customValue}
          placeholder="cubic-bezier(0.22, 1, 0.36, 1) or steps(4, end)"
          description="Use any valid CSS easing function. Examples: cubic-bezier(0.22, 1, 0.36, 1), steps(4, end), linear."
          onChange={onCustomValueChange}
        />
      ) : null}
    </div>
  );
}

function toCamelCase(value: string) {
  return value.replace(/-([a-z])/g, (_, character: string) =>
    character.toUpperCase(),
  );
}

function parseStyleDeclarations(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const styleEntries = value
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separatorIndex = entry.indexOf(":");

      if (separatorIndex < 0) {
        return null;
      }

      const property = entry.slice(0, separatorIndex).trim();
      const propertyValue = entry.slice(separatorIndex + 1).trim();

      if (!property || !propertyValue) {
        return null;
      }

      return [
        property.startsWith("--") ? property : toCamelCase(property),
        propertyValue,
      ] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  if (!styleEntries.length) {
    return undefined;
  }

  return Object.fromEntries(styleEntries) as React.CSSProperties;
}

function createDemoButtonItem(
  id: string,
  label: React.ReactNode,
  disabled = false,
): TwigTreeButtonItem {
  const loggedLabel = typeof label === "string" ? label : undefined;

  return {
    id,
    label,
    disabled,
    onClickCallback: () => {
      console.log("[twig-view demo] tree item clicked", {
        id,
        label: loggedLabel ?? null,
      });
    },
  };
}

export default function App() {
  const [managedBranchEnabled, setManagedBranchEnabled] = useState(false);
  const analyticsLazyLoadAttemptsRef = useRef(0);
  const [customAnimationEasing, setCustomAnimationEasing] = useState(
    "cubic-bezier(0.22, 1, 0.36, 1)",
  );
  const [controls, setControls] = useState<ControlsState>({
    lineWidth: TWIG_TREE_DEFAULTS.connector.width,
    lineColor: "#ffffff",
    lineRadius: TWIG_TREE_DEFAULTS.connector.radius,
    toggleSize: TWIG_TREE_DEFAULTS.toggle.size,
    toggleRadius: TWIG_TREE_DEFAULTS.toggle.radiusPercent,
    toggleLabelGap: TWIG_TREE_DEFAULTS.toggle.labelGapPx,
    spacing: 4,
    itemGap: TWIG_TREE_DEFAULTS.itemLayout.gap,
    useDefaultDisabledStyles: true,
    useDefaultFocusStyles: true,
    useDefaultActionStyles: true,
    useDefaultStatusStyles: true,
    idPrefix: TWIG_TREE_DEFAULTS.idPrefix,
    animationEnabled: TWIG_TREE_DEFAULTS.animation.enabled,
    animationDuration: TWIG_TREE_DEFAULTS.animation.duration,
    animationEasing: TWIG_TREE_DEFAULTS.animation.easing,
    animateOpacity: TWIG_TREE_DEFAULTS.animation.animateOpacity,
    treeSlotClassName: "demoTreeSlot",
    treeSlotStyle: "",
    rowSlotClassName: "demoPreviewRowSlot",
    rowSlotStyle: "",
    labelSlotClassName: "demoPreviewLabelSlot",
    labelSlotStyle: "",
    childrenSlotClassName: "demoPreviewChildrenSlot",
    childrenSlotStyle: "",
    toggleIconSize: Math.max(
      TWIG_TREE_DEFAULTS.toggle.iconMinSize,
      TWIG_TREE_DEFAULTS.toggle.size * TWIG_TREE_DEFAULTS.toggle.iconSizeFactor,
    ),
    toggleButtonClassName: "demoPreviewToggleButton",
    toggleButtonStyle: "",
    toggleIconClassName: "demoPreviewToggleIconSlot",
    toggleIconStyle: "",
    toggleOpenClassName: "demoPreviewToggleOpen",
    toggleOpenStyle: "",
    toggleClosedClassName: "demoPreviewToggleClosed",
    toggleClosedStyle: "",
    useCustomDemoToggles: false,
  });

  function patchControls(patch: Partial<ControlsState>) {
    setControls((current) => ({ ...current, ...patch }));
  }

  function patchAllDefaultStyles(value: boolean) {
    patchControls({
      useDefaultDisabledStyles: value,
      useDefaultFocusStyles: value,
      useDefaultActionStyles: value,
      useDefaultStatusStyles: value,
    });
  }

  function patchAnimationEasing(value: string) {
    patchControls({ animationEasing: value });
  }

  function selectAnimationEasing(nextOptionId: string) {
    const matchingOption = easingOptions.find(
      (option) => option.id === nextOptionId,
    );

    if (!matchingOption) {
      return;
    }

    if (matchingOption.value === null) {
      patchAnimationEasing(customAnimationEasing);
      return;
    }

    patchAnimationEasing(matchingOption.value);
  }

  function updateCustomAnimationEasing(value: string) {
    setCustomAnimationEasing(value);

    if (!value.trim()) {
      return;
    }

    patchAnimationEasing(value);
  }

  const customToggleIconVars = useMemo(
    () =>
      ({
        "--demo-toggle-icon-size": `${controls.toggleIconSize}px`,
      }) as React.CSSProperties,
    [controls.toggleIconSize],
  );

  const twigTreeItems = useMemo<TwigTreeItem[]>(
    () => [
      {
        id: "workspace-navigation",
        label: (
          <RichLabel
            title="Workspace navigation"
            meta="Product, billing, and engineering areas with nested sections."
          />
        ),
        trailing: <StatusPill>Pinned</StatusPill>,
        defaultExpanded: true,
        children: [
          {
            id: "workspace-product",
            label: (
              <RichLabel
                title="Product roadmap"
                meta="Q3 launches, dependency tracking, and design review notes."
              />
            ),
            defaultExpanded: true,
            children: [
              createDemoButtonItem("workspace-product-overview", "Overview"),
              {
                id: "workspace-product-spec",
                label: (
                  <RichLabel
                    title="Tree view refresh proposal"
                    meta="Multi-line labels, custom rows, and lazy branches for large datasets."
                  />
                ),
                href: GITHUB_URL,
                target: "_blank",
                rel: "noreferrer",
                trailing: <StatusPill>Spec</StatusPill>,
              },
              {
                id: "workspace-product-review",
                label: "Request design review",
                trailing: <StatusPill>Action</StatusPill>,
                onClickCallback: () => {
                  console.log("[twig-view demo] tree item clicked", {
                    id: "workspace-product-review",
                    label: "Request design review",
                  });
                },
              },
              {
                id: "workspace-product-rollout",
                label: (
                  <RichLabel
                    title="Launch rollout plan"
                    meta="Nested branch included to demonstrate deeper tree levels."
                  />
                ),
                defaultExpanded: true,
                children: [
                  {
                    id: "workspace-product-rollout-region",
                    label: "Regional rollout",
                    defaultExpanded: true,
                    children: [
                      {
                        id: "workspace-product-rollout-region-emea",
                        label: "EMEA launch",
                        defaultExpanded: true,
                        children: [
                          createDemoButtonItem(
                            "workspace-product-rollout-region-emea-pilot",
                            "Pilot customer checklist",
                          ),
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "workspace-support",
            label: (
              <RichLabel
                title="Customer support"
                meta="Queues grouped by priority, SLA, and owner."
              />
            ),
            children: [
              createDemoButtonItem(
                "workspace-support-high",
                "High priority queue",
              ),
              createDemoButtonItem(
                "workspace-support-billing",
                "Billing escalations",
              ),
              createDemoButtonItem(
                "workspace-support-vip",
                "VIP follow-ups",
                true,
              ),
            ],
          },
        ],
      },
      {
        id: "content-library",
        label: (
          <RichLabel
            title="Content library"
            meta="Custom items with summaries, owners, and publishing state."
          />
        ),
        defaultExpanded: true,
        children: [
          {
            id: "content-case-study",
            label: (
              <RichLabel
                title="Case study: enterprise onboarding"
                meta="Updated 2 hours ago by Mia Chen. Includes embedded media and release checklist."
              />
            ),
            trailing: <StatusPill>Draft</StatusPill>,
            onClickCallback: () => {
              console.log("[twig-view demo] tree item clicked", {
                id: "content-case-study",
                label: "Case study: enterprise onboarding",
              });
            },
          },
          {
            id: "content-guidelines",
            label: (
              <RichLabel
                title="Editorial guidelines"
                meta="Shared reference link item with a secondary line of descriptive text."
              />
            ),
            href: NPM_URL,
            target: "_blank",
            rel: "noreferrer",
            trailing: <StatusPill>Reference</StatusPill>,
          },
        ],
      },
      {
        id: "release-ops",
        label: "Release operations",
        defaultExpanded: true,
        disabled: !managedBranchEnabled,
        trailing: (
          <label
            className="demoBranchToggle"
            data-enabled={managedBranchEnabled ? "true" : "false"}
          >
            <input
              className="demoCheckboxInput"
              type="checkbox"
              checked={managedBranchEnabled}
              onChange={(event) => {
                setManagedBranchEnabled(event.target.checked);
              }}
              aria-label="Enable release operations"
            />
            <span>{managedBranchEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        ),
        children: [
          createDemoButtonItem(
            "release-checklist",
            "Release checklist",
            !managedBranchEnabled,
          ),
          {
            id: "release-notes",
            label: (
              <RichLabel
                title="Release notes"
                meta="Disabled branch state demonstrates inherited styling and navigation behavior."
              />
            ),
            disabled: !managedBranchEnabled,
            children: [
              createDemoButtonItem(
                "release-notes-web",
                "Web changelog",
                !managedBranchEnabled,
              ),
              createDemoButtonItem(
                "release-notes-api",
                "API changelog",
                !managedBranchEnabled,
              ),
            ],
          },
        ],
      },
      {
        id: "analytics-lazy-success",
        label: (
          <RichLabel
            title="Analytics snapshots"
            meta="Loads child reports on demand and succeeds on the first open."
          />
        ),
        loadingLabel: "Loading daily and weekly snapshots...",
        loadChildren: async () => {
          await delay(500);

          return [
            {
              id: "analytics-snapshot-daily",
              label: (
                <RichLabel
                  title="Daily pulse"
                  meta="Traffic, signups, and activation deltas from the last 24 hours."
                />
              ),
              onClickCallback: () => {
                console.log("[twig-view demo] tree item clicked", {
                  id: "analytics-snapshot-daily",
                  label: "Daily pulse",
                });
              },
              trailing: <StatusPill>Fresh</StatusPill>,
            },
            {
              id: "analytics-snapshot-weekly",
              label: "Weekly KPI digest",
              onClickCallback: () => {
                console.log("[twig-view demo] tree item clicked", {
                  id: "analytics-snapshot-weekly",
                  label: "Weekly KPI digest",
                });
              },
            },
          ];
        },
      },
      {
        id: "analytics-lazy",
        label: (
          <RichLabel
            title="Analytics workspace"
            meta="Loads child reports on demand, fails on the first open, and retries on the next reopen."
          />
        ),
        loadingLabel: "Loading dashboards and saved reports...",
        loadErrorLabel:
          "Dashboards failed to load. Collapse and reopen to retry.",
        loadChildren: async () => {
          await delay(700);

          analyticsLazyLoadAttemptsRef.current += 1;

          if (analyticsLazyLoadAttemptsRef.current === 1) {
            throw new Error("Demo analytics request failed");
          }

          return [
            {
              id: "analytics-overview",
              label: (
                <RichLabel
                  title="Executive overview"
                  meta="Weekly conversion trends, traffic sources, and rollout health."
                />
              ),
              onClickCallback: () => {
                console.log("[twig-view demo] tree item clicked", {
                  id: "analytics-overview",
                  label: "Executive overview",
                });
              },
              trailing: <StatusPill>Live</StatusPill>,
            },
            {
              id: "analytics-events",
              label: "Event schema reference",
              href: GITHUB_URL,
              target: "_blank",
              rel: "noreferrer",
            },
            {
              id: "analytics-cohorts",
              label: "Saved cohorts",
              children: [
                createDemoButtonItem("analytics-cohort-trial", "Trial users"),
                createDemoButtonItem(
                  "analytics-cohort-enterprise",
                  "Enterprise accounts",
                ),
              ],
            },
          ];
        },
      },
    ],
    [managedBranchEnabled],
  );

  const customToggleEnabled = controls.useCustomDemoToggles;
  const allDefaultStylesEnabled =
    controls.useDefaultDisabledStyles &&
    controls.useDefaultFocusStyles &&
    controls.useDefaultActionStyles &&
    controls.useDefaultStatusStyles;

  const treeToggle = customToggleEnabled
    ? {
        size: controls.toggleSize,
        radius: `${controls.toggleRadius}%`,
        labelGap: controls.toggleLabelGap,
        button: {
          className: controls.toggleButtonClassName || undefined,
          style: parseStyleDeclarations(controls.toggleButtonStyle),
        },
        icon: {
          size: controls.toggleIconSize,
          className: controls.toggleIconClassName || undefined,
          style: parseStyleDeclarations(controls.toggleIconStyle),
        },
        open: {
          className: controls.toggleOpenClassName || undefined,
          style: parseStyleDeclarations(controls.toggleOpenStyle),
          icon: (
            <span
              aria-hidden="true"
              className="demoCustomToggleIcon demoCustomToggleIconStar"
              style={customToggleIconVars}
            >
              ★
            </span>
          ),
        },
        closed: {
          className: controls.toggleClosedClassName || undefined,
          style: parseStyleDeclarations(controls.toggleClosedStyle),
          icon: (
            <span
              aria-hidden="true"
              className="demoCustomToggleIcon"
              style={customToggleIconVars}
            >
              ♥
            </span>
          ),
        },
      }
    : {
        size: controls.toggleSize,
        radius: `${controls.toggleRadius}%`,
        labelGap: controls.toggleLabelGap,
        button: {
          className: controls.toggleButtonClassName || undefined,
          style: parseStyleDeclarations(controls.toggleButtonStyle),
        },
        icon: {
          size: controls.toggleIconSize,
          className: controls.toggleIconClassName || undefined,
          style: parseStyleDeclarations(controls.toggleIconStyle),
        },
        open: {
          className: controls.toggleOpenClassName || undefined,
          style: parseStyleDeclarations(controls.toggleOpenStyle),
        },
        closed: {
          className: controls.toggleClosedClassName || undefined,
          style: parseStyleDeclarations(controls.toggleClosedStyle),
        },
      };

  return (
    <main className="demoShell">
      <section className="heroBand" aria-label="Introduction">
        <div className="heroInner">
          <div className="heroLead">
            <p className="heroEyebrow">Accessible React tree view</p>
            <h1 className="heroTitle">Accessible tree UI for React</h1>
            <p className="heroBody">
              ARIA-ready branches, configurable connectors, custom toggles, and
              lazy loading.
            </p>

            <div className="heroActions">
              <a
                className="heroButton heroButtonPrimary"
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub
              </a>
              <a
                className="heroButton heroButtonSecondary"
                href={NPM_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open npm package
              </a>
            </div>

            <div className="installCard" aria-label="Install command">
              <span className="installLabel">Install</span>
              <code>{INSTALL_COMMAND}</code>
            </div>
          </div>
        </div>
      </section>

      <div className="pageContent">
        <section className="playgroundSection" id="playground">
          <div className="demoWorkspace">
            <section className="demoPanel demoPreviewPanel demoPanelSurface demoPanelStack">
              <div className="demoPanelHeader demoPanelHeaderPreview">
                <div>
                  <p className="demoPanelEyebrow">Preview</p>
                </div>
              </div>

              <div className="demoPreviewTree">
                <TwigTree
                  items={twigTreeItems}
                  idPrefix={controls.idPrefix}
                  connector={{
                    width: controls.lineWidth,
                    color: controls.lineColor,
                    radius: controls.lineRadius,
                  }}
                  spacing={controls.spacing}
                  itemLayout={{
                    gap: controls.itemGap,
                  }}
                  useDefaultDisabledStyles={controls.useDefaultDisabledStyles}
                  useDefaultFocusStyles={controls.useDefaultFocusStyles}
                  useDefaultActionStyles={controls.useDefaultActionStyles}
                  useDefaultStatusStyles={controls.useDefaultStatusStyles}
                  ariaLabel="TwigTree demo"
                  slots={{
                    tree: {
                      className: controls.treeSlotClassName || undefined,
                      style: parseStyleDeclarations(controls.treeSlotStyle),
                    },
                    row: {
                      className: controls.rowSlotClassName || undefined,
                      style: parseStyleDeclarations(controls.rowSlotStyle),
                    },
                    label: {
                      className: controls.labelSlotClassName || undefined,
                      style: parseStyleDeclarations(controls.labelSlotStyle),
                    },
                    children: {
                      className: controls.childrenSlotClassName || undefined,
                      style: parseStyleDeclarations(controls.childrenSlotStyle),
                    },
                  }}
                  animation={{
                    enabled: controls.animationEnabled,
                    duration: controls.animationDuration,
                    easing: controls.animationEasing,
                    animateOpacity: controls.animateOpacity,
                  }}
                  toggle={treeToggle}
                />
              </div>
            </section>

            <section className="demoPanel demoControlsPanel demoPanelSurface">
              <div className="demoPanelHeader demoPanelHeaderControls">
                <div>
                  <p className="demoPanelEyebrow">Controls</p>
                </div>
              </div>

              <TabGroup className="demoTabsRoot">
                <TabList
                  className="demoTabList demoPanelInset"
                  aria-label="Control categories"
                >
                  {controlTabs.map((tab) => (
                    <Tab key={tab.id} className="demoTabButton">
                      <span className="demoTabButtonLabel">{tab.label}</span>
                    </Tab>
                  ))}
                </TabList>

                <TabPanels className="demoTabPanels">
                  <TabPanel className="demoTabPanel">
                    <ControlSection
                      title="Tree layout"
                      description="Spacing, item gap, and ID prefix."
                    >
                      <div className="demoGroupGrid">
                        <NumberField
                          label="Tree spacing"
                          value={controls.spacing}
                          min={0}
                          max={24}
                          step={1}
                          onChange={(value) => {
                            patchControls({ spacing: value });
                          }}
                        />
                        <NumberField
                          label="Tree item gap"
                          value={controls.itemGap}
                          min={0}
                          max={16}
                          step={1}
                          onChange={(value) => {
                            patchControls({ itemGap: value });
                          }}
                        />
                        <TextField
                          label="Tree ID prefix"
                          value={controls.idPrefix}
                          placeholder="twig-tree"
                          description="Used as the base for generated tree item IDs in the preview."
                          onChange={(value) => {
                            patchControls({ idPrefix: value });
                          }}
                        />
                      </div>
                    </ControlSection>
                  </TabPanel>

                  <TabPanel className="demoTabPanel">
                    <ControlSection
                      title="Connectors"
                      description="Line width, color, and corner radius."
                    >
                      <div className="demoGroupGrid">
                        <NumberField
                          label="Connector width"
                          value={controls.lineWidth}
                          min={0.5}
                          max={6}
                          step={0.5}
                          onChange={(value) => {
                            patchControls({ lineWidth: value });
                          }}
                        />
                        <NumberField
                          label="Connector radius"
                          value={controls.lineRadius}
                          min={0}
                          max={24}
                          step={1}
                          onChange={(value) => {
                            patchControls({ lineRadius: value });
                          }}
                        />
                        <ColorField
                          label="Connector color"
                          value={controls.lineColor}
                          onChange={(value) => {
                            patchControls({ lineColor: value });
                          }}
                        />
                      </div>
                    </ControlSection>
                  </TabPanel>

                  <TabPanel className="demoTabPanel">
                    <ControlSection
                      title="Animation"
                      description="Animation enablement, duration, easing, and opacity fade."
                    >
                      <div className="demoGroupGrid">
                        <CheckboxField
                          label="Animation enabled"
                          checked={controls.animationEnabled}
                          onChange={(value) => {
                            patchControls({ animationEnabled: value });
                          }}
                        />
                        <CheckboxField
                          label="Animation opacity fade"
                          checked={controls.animateOpacity}
                          onChange={(value) => {
                            patchControls({ animateOpacity: value });
                          }}
                        />
                        <NumberField
                          label="Animation duration"
                          value={controls.animationDuration}
                          min={0}
                          max={2500}
                          step={20}
                          onChange={(value) => {
                            patchControls({ animationDuration: value });
                          }}
                        />
                      </div>

                      <EasingField
                        value={controls.animationEasing}
                        customValue={customAnimationEasing}
                        onPresetChange={selectAnimationEasing}
                        onCustomValueChange={updateCustomAnimationEasing}
                      />
                    </ControlSection>
                  </TabPanel>

                  <TabPanel className="demoTabPanel">
                    <ControlSection
                      title="Slots"
                      description="These map directly to the public slots API. Clear a class name to see the preview lose that demo styling."
                    >
                      <div className="demoGroupGrid">
                        <TextField
                          label="Tree slot className"
                          value={controls.treeSlotClassName}
                          placeholder="demoTreeSlot"
                          description="Applied to the tree root element."
                          onChange={(value) => {
                            patchControls({ treeSlotClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Tree slot style"
                          value={controls.treeSlotStyle}
                          placeholder="min-height: 18px;"
                          description="Inline CSS declarations for the tree root, separated by semicolons."
                          onChange={(value) => {
                            patchControls({ treeSlotStyle: value });
                          }}
                        />
                        <TextField
                          label="Row slot className"
                          value={controls.rowSlotClassName}
                          placeholder="demoPreviewRowSlot"
                          description="Applied to both branch and leaf rows."
                          onChange={(value) => {
                            patchControls({ rowSlotClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Row slot style"
                          value={controls.rowSlotStyle}
                          placeholder="padding-block: 2px;"
                          description="Inline CSS declarations for all rows."
                          onChange={(value) => {
                            patchControls({ rowSlotStyle: value });
                          }}
                        />
                        <TextField
                          label="Label slot className"
                          value={controls.labelSlotClassName}
                          placeholder="demoPreviewLabelSlot"
                          description="Applied to label wrappers for both leaves and branches."
                          onChange={(value) => {
                            patchControls({ labelSlotClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Label slot style"
                          value={controls.labelSlotStyle}
                          placeholder="max-width: 62ch;"
                          description="Inline CSS declarations for label wrappers."
                          onChange={(value) => {
                            patchControls({ labelSlotStyle: value });
                          }}
                        />
                        <TextField
                          label="Children slot className"
                          value={controls.childrenSlotClassName}
                          placeholder="demoPreviewChildrenSlot"
                          description="Applied to the expandable children viewport."
                          onChange={(value) => {
                            patchControls({ childrenSlotClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Children slot style"
                          value={controls.childrenSlotStyle}
                          placeholder="padding-bottom: 4px;"
                          description="Inline CSS declarations for the children viewport container."
                          onChange={(value) => {
                            patchControls({ childrenSlotStyle: value });
                          }}
                        />
                      </div>
                    </ControlSection>
                  </TabPanel>

                  <TabPanel className="demoTabPanel">
                    <ControlSection
                      title="Default styles"
                      description="Toggle the built-in disabled, focus, action, and status treatments."
                    >
                      <div className="demoGroupGrid">
                        <CheckboxField
                          label="All default styles"
                          checked={allDefaultStylesEnabled}
                          onChange={(value) => {
                            patchAllDefaultStyles(value);
                          }}
                        />
                        <CheckboxField
                          label="Default disabled styles"
                          checked={controls.useDefaultDisabledStyles}
                          onChange={(value) => {
                            patchControls({ useDefaultDisabledStyles: value });
                          }}
                        />
                        <CheckboxField
                          label="Default focus styles"
                          checked={controls.useDefaultFocusStyles}
                          onChange={(value) => {
                            patchControls({ useDefaultFocusStyles: value });
                          }}
                        />
                        <CheckboxField
                          label="Default action styles"
                          checked={controls.useDefaultActionStyles}
                          onChange={(value) => {
                            patchControls({ useDefaultActionStyles: value });
                          }}
                        />
                        <CheckboxField
                          label="Default status styles"
                          checked={controls.useDefaultStatusStyles}
                          onChange={(value) => {
                            patchControls({ useDefaultStatusStyles: value });
                          }}
                        />
                      </div>
                    </ControlSection>
                  </TabPanel>

                  <TabPanel className="demoTabPanel">
                    <ControlSection
                      title="Toggles"
                      description="These map directly to the public toggle API. Use className and style fields instead of demo-only pseudo props."
                    >
                      <div className="demoGroupGrid">
                        <CheckboxField
                          label="Toggle custom icons"
                          checked={controls.useCustomDemoToggles}
                          onChange={(value) => {
                            patchControls({ useCustomDemoToggles: value });
                          }}
                        />
                        <NumberField
                          label="Toggle size"
                          value={controls.toggleSize}
                          min={12}
                          max={36}
                          step={1}
                          onChange={(value) => {
                            patchControls({ toggleSize: value });
                          }}
                        />
                        <NumberField
                          label="Toggle radius"
                          value={controls.toggleRadius}
                          min={0}
                          max={50}
                          step={1}
                          onChange={(value) => {
                            patchControls({ toggleRadius: value });
                          }}
                        />
                        <NumberField
                          label="Toggle label gap"
                          value={controls.toggleLabelGap}
                          min={0}
                          max={24}
                          step={1}
                          onChange={(value) => {
                            patchControls({ toggleLabelGap: value });
                          }}
                        />
                        <NumberField
                          label="Toggle icon size"
                          value={controls.toggleIconSize}
                          min={8}
                          max={28}
                          step={1}
                          onChange={(value) => {
                            patchControls({ toggleIconSize: value });
                          }}
                        />
                        <TextField
                          label="Toggle button className"
                          value={controls.toggleButtonClassName}
                          placeholder="demoPreviewToggleButton"
                          description="Applied to the toggle button wrapper."
                          onChange={(value) => {
                            patchControls({ toggleButtonClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Toggle button style"
                          value={controls.toggleButtonStyle}
                          placeholder="box-shadow: 0 8px 20px rgba(15, 23, 42, 0.35);"
                          description="Inline CSS declarations for the toggle button wrapper."
                          onChange={(value) => {
                            patchControls({ toggleButtonStyle: value });
                          }}
                        />
                        <TextField
                          label="Toggle icon className"
                          value={controls.toggleIconClassName}
                          placeholder="demoPreviewToggleIconSlot"
                          description="Applied to the icon wrapper around the default or custom icon node."
                          onChange={(value) => {
                            patchControls({ toggleIconClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Toggle icon style"
                          value={controls.toggleIconStyle}
                          placeholder="filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.35));"
                          description="Inline CSS declarations for the icon wrapper."
                          onChange={(value) => {
                            patchControls({ toggleIconStyle: value });
                          }}
                        />
                        <TextField
                          label="Toggle open className"
                          value={controls.toggleOpenClassName}
                          placeholder="demoPreviewToggleOpen"
                          description="Applied when a branch is expanded."
                          onChange={(value) => {
                            patchControls({ toggleOpenClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Toggle open style"
                          value={controls.toggleOpenStyle}
                          placeholder="background: #2563eb;"
                          description="Inline CSS declarations for the expanded state."
                          onChange={(value) => {
                            patchControls({ toggleOpenStyle: value });
                          }}
                        />
                        <TextField
                          label="Toggle closed className"
                          value={controls.toggleClosedClassName}
                          placeholder="demoPreviewToggleClosed"
                          description="Applied when a branch is collapsed."
                          onChange={(value) => {
                            patchControls({ toggleClosedClassName: value });
                          }}
                        />
                        <TextAreaField
                          label="Toggle closed style"
                          value={controls.toggleClosedStyle}
                          placeholder="background: #1d4ed8;"
                          description="Inline CSS declarations for the collapsed state."
                          onChange={(value) => {
                            patchControls({ toggleClosedStyle: value });
                          }}
                        />
                      </div>
                    </ControlSection>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </section>
          </div>
        </section>

        <section className="sectionBlock" id="examples">
          <div className="sectionIntro">
            <p className="sectionKicker">Example Scenarios</p>
            <h2 className="sectionHeading">
              Named examples in the live demo tree.
            </h2>
            <p className="sectionLead">
              The preview is more than a styling sandbox. Each top-level branch
              is a concrete product scenario you can open, tweak, and compare
              while adjusting the controls.
            </p>
          </div>
          <div className="exampleGrid">
            {demoExampleCards.map((card) => (
              <article key={card.title} className="exampleCard">
                <p className="exampleCardBranch">In tree: {card.branch}</p>
                <h3 className="exampleCardTitle">{card.title}</h3>
                <p className="exampleCardBody">{card.body}</p>
                <p className="exampleCardPrompt">Try: {card.prompt}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionBlock" id="features">
          <div className="sectionIntro">
            <p className="sectionKicker">Why twig-view</p>
            <h2 className="sectionHeading">
              Built for the hard parts of tree UIs.
            </h2>
          </div>
          <div className="cardGrid">
            {featureCards.map((card) => (
              <article key={card.title} className="infoCard">
                <h3 className="infoCardTitle">{card.title}</h3>
                <p className="infoCardBody">{card.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
