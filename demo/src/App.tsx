import { useMemo, useState } from "react";
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
  toggleIconSize: number;
  toggleOpenFill: string;
  toggleClosedFill: string;
  toggleIconColor: string;
  toggleShadow: string;
  useCustomDemoToggles: boolean;
};

const panelStyle = {
  borderRadius: 20,
  padding: 18,
  background: "linear-gradient(180deg, rgba(15,23,42,0.84), rgba(2,6,23,0.72))",
  border: "1px solid rgba(148,163,184,0.14)",
  boxShadow: "0 24px 60px rgba(2, 6, 23, 0.28)",
} as const;

const groupGridStyle = {
  display: "grid",
  gap: 10,
  gridTemplateColumns: "repeat(auto-fit, minmax(156px, 1fr))",
} as const;

const fieldLabelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 14,
  color: "#cbd5e1",
} as const;

const inputStyle = {
  width: "100%",
  minHeight: 40,
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,0.18)",
  background: "rgba(15,23,42,0.9)",
  color: "#e2e8f0",
  padding: "0 12px",
} as const;

const sectionTitleStyle = {
  margin: 0,
  fontSize: 16,
  color: "#f8fafc",
} as const;

const sectionTextStyle = {
  margin: "6px 0 0",
  fontSize: 13,
  color: "#94a3b8",
  lineHeight: 1.5,
} as const;

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
    <label style={fieldLabelStyle}>
      <span>
        {label}
        <span
          style={{
            marginLeft: 8,
            color: "#7dd3fc",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
      </span>
      <input
        style={{ accentColor: "#38bdf8" }}
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
    <label style={fieldLabelStyle}>
      <span>{label}</span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px minmax(0, 1fr)",
          gap: 8,
          alignItems: "center",
        }}
      >
        <input
          style={{
            width: 48,
            height: 40,
            borderRadius: 10,
            border: "1px solid rgba(148,163,184,0.18)",
            background: "transparent",
            padding: 4,
          }}
          type="color"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
        <input
          style={inputStyle}
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
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={fieldLabelStyle}>
      <span>{label}</span>
      <input
        style={inputStyle}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
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
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 40,
        fontSize: 14,
        color: "#cbd5e1",
      }}
    >
      <input
        style={{ accentColor: "#38bdf8" }}
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
  wide = false,
  children,
}: {
  title: string;
  description: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        wide
          ? "demoControlSection demoControlSectionWide"
          : "demoControlSection"
      }
      style={{
        display: "grid",
        gap: 12,
        padding: 14,
        borderRadius: 16,
        background: "rgba(15,23,42,0.46)",
        border: "1px solid rgba(148,163,184,0.1)",
      }}
    >
      <header>
        <h3 style={sectionTitleStyle}>{title}</h3>
        {description ? <p style={sectionTextStyle}>{description}</p> : null}
      </header>
      {children}
    </section>
  );
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
    toggleIconSize: Math.max(
      TWIG_TREE_DEFAULTS.toggle.iconMinSize,
      TWIG_TREE_DEFAULTS.toggle.size * TWIG_TREE_DEFAULTS.toggle.iconSizeFactor,
    ),
    toggleOpenFill: "#2563eb",
    toggleClosedFill: "#1d4ed8",
    toggleIconColor: "#ffffff",
    toggleShadow: "0 8px 20px rgba(15, 23, 42, 0.35)",
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

  const customToggleIconStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    fontSize: controls.toggleIconSize,
    lineHeight: 1,
    fontWeight: 700,
    textAlign: "center",
    overflow: "visible",
  } as const;

  const customStarIconStyle = {
    ...customToggleIconStyle,
    transform: "translateY(-0.08em)",
  } as const;

  const branchToggleStyle = useMemo(
    () =>
      ({
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "4px 10px",
        borderRadius: 999,
        background: managedBranchEnabled
          ? "rgba(37,99,235,0.18)"
          : "rgba(148,163,184,0.12)",
        border: managedBranchEnabled
          ? "1px solid rgba(96,165,250,0.35)"
          : "1px solid rgba(148,163,184,0.18)",
        color: "#cbd5e1",
        fontSize: 12,
        fontWeight: 600,
      }) as const,
    [managedBranchEnabled],
  );

  const statusPillStyle = {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 24,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid rgba(125, 211, 252, 0.18)",
    background: "rgba(56, 189, 248, 0.08)",
    color: "#d8f3ff",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  } as const;

  const metaTextStyle = {
    color: "#8aa0bb",
    fontSize: 12,
    lineHeight: 1.45,
  } as const;

  const richLabelStyle = {
    display: "grid",
    gap: 2,
    minWidth: 0,
  } as const;

  const twigTreeItems = useMemo<TwigTreeItem[]>(
    () => [
      {
        id: "workspace-navigation",
        label: (
          <div style={richLabelStyle}>
            <span>Workspace navigation</span>
            <span style={metaTextStyle}>
              Product, billing, and engineering areas with nested sections.
            </span>
          </div>
        ),
        trailing: <span style={statusPillStyle}>Pinned</span>,
        defaultExpanded: true,
        children: [
          {
            id: "workspace-product",
            label: (
              <div style={richLabelStyle}>
                <span>Product roadmap</span>
                <span style={metaTextStyle}>
                  Q3 launches, dependency tracking, and design review notes.
                </span>
              </div>
            ),
            defaultExpanded: true,
            children: [
              createDemoButtonItem("workspace-product-overview", "Overview"),
              {
                id: "workspace-product-spec",
                label: (
                  <div style={richLabelStyle}>
                    <span>Tree view refresh proposal</span>
                    <span style={metaTextStyle}>
                      Multi-line labels, custom rows, and lazy branches for
                      large datasets.
                    </span>
                  </div>
                ),
                href: GITHUB_URL,
                target: "_blank",
                rel: "noreferrer",
                trailing: <span style={statusPillStyle}>Spec</span>,
              },
              {
                id: "workspace-product-review",
                label: "Request design review",
                trailing: <span style={statusPillStyle}>Action</span>,
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
                  <div style={richLabelStyle}>
                    <span>Launch rollout plan</span>
                    <span style={metaTextStyle}>
                      Nested branch included to demonstrate deeper tree levels.
                    </span>
                  </div>
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
              <div style={richLabelStyle}>
                <span>Customer support</span>
                <span style={metaTextStyle}>
                  Queues grouped by priority, SLA, and owner.
                </span>
              </div>
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
          <div style={richLabelStyle}>
            <span>Content library</span>
            <span style={metaTextStyle}>
              Custom items with summaries, owners, and publishing state.
            </span>
          </div>
        ),
        defaultExpanded: true,
        children: [
          {
            id: "content-case-study",
            label: (
              <div style={richLabelStyle}>
                <span>Case study: enterprise onboarding</span>
                <span style={metaTextStyle}>
                  Updated 2 hours ago by Mia Chen. Includes embedded media and
                  release checklist.
                </span>
              </div>
            ),
            trailing: <span style={statusPillStyle}>Draft</span>,
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
              <div style={richLabelStyle}>
                <span>Editorial guidelines</span>
                <span style={metaTextStyle}>
                  Shared reference link item with a secondary line of
                  descriptive text.
                </span>
              </div>
            ),
            href: NPM_URL,
            target: "_blank",
            rel: "noreferrer",
            trailing: <span style={statusPillStyle}>Reference</span>,
          },
        ],
      },
      {
        id: "release-ops",
        label: "Release operations",
        defaultExpanded: true,
        disabled: !managedBranchEnabled,
        trailing: (
          <label style={branchToggleStyle}>
            <input
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
              <div style={richLabelStyle}>
                <span>Release notes</span>
                <span style={metaTextStyle}>
                  Disabled branch state demonstrates inherited styling and
                  navigation behavior.
                </span>
              </div>
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
        id: "analytics-lazy",
        label: (
          <div style={richLabelStyle}>
            <span>Analytics workspace</span>
            <span style={metaTextStyle}>
              Loads child reports on demand to demonstrate asynchronous branch
              expansion.
            </span>
          </div>
        ),
        loadingLabel: "Loading dashboards and saved reports...",
        loadChildren: async () => {
          await delay(700);

          return [
            {
              id: "analytics-overview",
              label: (
                <div style={richLabelStyle}>
                  <span>Executive overview</span>
                  <span style={metaTextStyle}>
                    Weekly conversion trends, traffic sources, and rollout
                    health.
                  </span>
                </div>
              ),
              onClickCallback: () => {
                console.log("[twig-view demo] tree item clicked", {
                  id: "analytics-overview",
                  label: "Executive overview",
                });
              },
              trailing: <span style={statusPillStyle}>Live</span>,
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
    [branchToggleStyle, managedBranchEnabled],
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
          style: {
            boxShadow: controls.toggleShadow,
            background: "#0f172a",
          },
        },
        icon: {
          size: controls.toggleIconSize,
        },
        open: {
          style: {
            background: "#facc15",
            color: "#9a3412",
          },
          icon: (
            <span aria-hidden="true" style={customStarIconStyle}>
              ★
            </span>
          ),
        },
        closed: {
          style: {
            background: "#f87171",
            color: "#991b1b",
          },
          icon: (
            <span aria-hidden="true" style={customToggleIconStyle}>
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
          style: {
            color: controls.toggleIconColor,
            boxShadow: controls.toggleShadow,
          },
        },
        icon: {
          size: controls.toggleIconSize,
        },
        open: {
          style: {
            background: controls.toggleOpenFill,
          },
        },
        closed: {
          style: {
            background: controls.toggleClosedFill,
          },
        },
      };

  return (
    <main
      className="demoShell"
      style={
        {
          display: "grid",
        } as React.CSSProperties
      }
    >
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
            <section
              className="demoPanel demoPreviewPanel"
              style={{
                ...panelStyle,
                display: "grid",
                gap: 12,
              }}
            >
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
                      style: {
                        minHeight: 18,
                      },
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

            <section className="demoPanel demoControlsPanel" style={panelStyle}>
              <div className="demoPanelHeader demoPanelHeaderControls">
                <div>
                  <p className="demoPanelEyebrow">Controls</p>
                </div>
              </div>

              <div className="demoControlsGrid">
                <ControlSection
                  title="Tree layout"
                  description="Spacing, item gap, and ID prefix."
                >
                  <div style={groupGridStyle}>
                    <NumberField
                      label="Spacing"
                      value={controls.spacing}
                      min={0}
                      max={24}
                      step={1}
                      onChange={(value) => {
                        patchControls({ spacing: value });
                      }}
                    />
                    <NumberField
                      label="Item gap"
                      value={controls.itemGap}
                      min={0}
                      max={16}
                      step={1}
                      onChange={(value) => {
                        patchControls({ itemGap: value });
                      }}
                    />
                    <TextField
                      label="ID prefix"
                      value={controls.idPrefix}
                      onChange={(value) => {
                        patchControls({ idPrefix: value });
                      }}
                    />
                  </div>
                </ControlSection>

                <ControlSection
                  title="Connectors"
                  description="Line width, color, and radius."
                >
                  <div style={groupGridStyle}>
                    <NumberField
                      label="Line width"
                      value={controls.lineWidth}
                      min={0.5}
                      max={6}
                      step={0.5}
                      onChange={(value) => {
                        patchControls({ lineWidth: value });
                      }}
                    />
                    <NumberField
                      label="Line radius"
                      value={controls.lineRadius}
                      min={0}
                      max={24}
                      step={1}
                      onChange={(value) => {
                        patchControls({ lineRadius: value });
                      }}
                    />
                    <ColorField
                      label="Line color"
                      value={controls.lineColor}
                      onChange={(value) => {
                        patchControls({ lineColor: value });
                      }}
                    />
                  </div>
                </ControlSection>

                <ControlSection
                  title="Animation"
                  description="Animation toggle, duration, and easing."
                >
                  <div style={groupGridStyle}>
                    <CheckboxField
                      label="Enable animation"
                      checked={controls.animationEnabled}
                      onChange={(value) => {
                        patchControls({ animationEnabled: value });
                      }}
                    />
                    <CheckboxField
                      label="Animate opacity"
                      checked={controls.animateOpacity}
                      onChange={(value) => {
                        patchControls({ animateOpacity: value });
                      }}
                    />
                    <NumberField
                      label="Duration"
                      value={controls.animationDuration}
                      min={0}
                      max={800}
                      step={20}
                      onChange={(value) => {
                        patchControls({ animationDuration: value });
                      }}
                    />
                    <TextField
                      label="Easing"
                      value={controls.animationEasing}
                      onChange={(value) => {
                        patchControls({ animationEasing: value });
                      }}
                    />
                  </div>
                </ControlSection>

                <ControlSection
                  title="Default styles"
                  description="Toggle built-in disabled, focus, action, and status styles."
                >
                  <div style={groupGridStyle}>
                    <CheckboxField
                      label="Custom toggle icons"
                      checked={controls.useCustomDemoToggles}
                      onChange={(value) => {
                        patchControls({ useCustomDemoToggles: value });
                      }}
                    />
                    <CheckboxField
                      label="Enable all default styles"
                      checked={allDefaultStylesEnabled}
                      onChange={(value) => {
                        patchAllDefaultStyles(value);
                      }}
                    />
                    <CheckboxField
                      label="Disabled styles"
                      checked={controls.useDefaultDisabledStyles}
                      onChange={(value) => {
                        patchControls({ useDefaultDisabledStyles: value });
                      }}
                    />
                    <CheckboxField
                      label="Focus styles"
                      checked={controls.useDefaultFocusStyles}
                      onChange={(value) => {
                        patchControls({ useDefaultFocusStyles: value });
                      }}
                    />
                    <CheckboxField
                      label="Action styles"
                      checked={controls.useDefaultActionStyles}
                      onChange={(value) => {
                        patchControls({ useDefaultActionStyles: value });
                      }}
                    />
                    <CheckboxField
                      label="Status styles"
                      checked={controls.useDefaultStatusStyles}
                      onChange={(value) => {
                        patchControls({ useDefaultStatusStyles: value });
                      }}
                    />
                  </div>
                </ControlSection>

                <ControlSection
                  title="Toggles"
                  description="Size, spacing, icon size, and state styling."
                  wide
                >
                  <div style={groupGridStyle}>
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
                      label="Toggle gap"
                      value={controls.toggleLabelGap}
                      min={0}
                      max={24}
                      step={1}
                      onChange={(value) => {
                        patchControls({ toggleLabelGap: value });
                      }}
                    />
                    <NumberField
                      label="Icon size"
                      value={controls.toggleIconSize}
                      min={8}
                      max={28}
                      step={1}
                      onChange={(value) => {
                        patchControls({ toggleIconSize: value });
                      }}
                    />
                    <ColorField
                      label="Open fill"
                      value={controls.toggleOpenFill}
                      onChange={(value) => {
                        patchControls({ toggleOpenFill: value });
                      }}
                    />
                    <ColorField
                      label="Closed fill"
                      value={controls.toggleClosedFill}
                      onChange={(value) => {
                        patchControls({ toggleClosedFill: value });
                      }}
                    />
                    <ColorField
                      label="Icon color"
                      value={controls.toggleIconColor}
                      onChange={(value) => {
                        patchControls({ toggleIconColor: value });
                      }}
                    />
                    <TextField
                      label="Toggle shadow"
                      value={controls.toggleShadow}
                      onChange={(value) => {
                        patchControls({ toggleShadow: value });
                      }}
                    />
                  </div>
                </ControlSection>
              </div>
            </section>
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
