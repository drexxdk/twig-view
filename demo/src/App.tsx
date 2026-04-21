import { useMemo, useState } from "react";
import {
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
  itemPaddingBlock: number;
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
        <p style={sectionTextStyle}>{description}</p>
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
  return {
    id,
    label,
    disabled,
    onClickCallback: () => {},
  };
}

export default function App() {
  const [managedBranchEnabled, setManagedBranchEnabled] = useState(false);
  const [controls, setControls] = useState<ControlsState>({
    lineWidth: 1,
    lineColor: "#ff4d4f",
    lineRadius: 10,
    toggleSize: 16,
    toggleRadius: 50,
    toggleLabelGap: 4,
    spacing: 4,
    itemPaddingBlock: 2,
    useDefaultDisabledStyles: true,
    useDefaultFocusStyles: true,
    useDefaultActionStyles: true,
    useDefaultStatusStyles: true,
    idPrefix: "twig-tree",
    animationEnabled: true,
    animationDuration: 220,
    animationEasing: "ease",
    animateOpacity: true,
    toggleIconSize: 10,
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

  const twigTreeItems = useMemo<TwigTreeItem[]>(
    () => [
      createDemoButtonItem("test-1", "test 1"),
      createDemoButtonItem("test-2", "test 2 (disabled)", true),
      {
        id: "test-3",
        label: "test 3",
        defaultExpanded: true,
        children: [
          createDemoButtonItem("test-3-1", "test 3.1"),
          {
            id: "test-3-action-button",
            label: "test 3 action button",
            onClickCallback: () => {
              window.alert("Demo action button clicked");
            },
          },
          {
            id: "test-3-action-link",
            label: "test 3 action link",
            href: "https://example.com",
            target: "_blank",
            rel: "noreferrer",
          },
          {
            id: "test-3-2",
            label: "test 3.2",
            children: [
              createDemoButtonItem("test-3-2-1", "test 3.2.1"),
              createDemoButtonItem("test-3-2-2", "test 3.2.2"),
              createDemoButtonItem("test-3-2-3", "test 3.2.3"),
            ],
          },
        ],
      },
      {
        id: "test-4",
        label: "managed branch",
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
              aria-label="Enable managed branch"
            />
            <span>{managedBranchEnabled ? "Enabled" : "Disabled"}</span>
          </label>
        ),
        children: [
          createDemoButtonItem("test-4-1", "test 4.1", !managedBranchEnabled),
          {
            id: "test-4-2",
            label: "test 4.2",
            disabled: !managedBranchEnabled,
            children: [
              createDemoButtonItem(
                "test-4-2-1",
                "test 4.2.1",
                !managedBranchEnabled,
              ),
            ],
          },
        ],
      },
      {
        id: "test-5",
        label: "test 5 (lazy)",
        loadingLabel: "Loading test 5 children...",
        loadChildren: async () => {
          await delay(700);

          return [
            createDemoButtonItem("test-5-1", "test 5.1"),
            createDemoButtonItem("test-5-2", "test 5.2 (disabled)", true),
            {
              id: "test-5-3",
              label: "test 5.3",
              children: [
                createDemoButtonItem("test-5-3-1", "test 5.3.1"),
                createDemoButtonItem("test-5-3-2", "test 5.3.2"),
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
          width: "min(1100px, 100%)",
          margin: "0 auto",
          padding: 24,
          display: "grid",
          gap: 24,
        } as React.CSSProperties
      }
    >
      <div className="demoWorkspace">
        <section
          className="demoPanel demoPreviewPanel"
          style={{
            ...panelStyle,
            display: "grid",
            gap: 12,
          }}
        >
          <div className="demoPanelHeader" style={{ display: "grid", gap: 4 }}>
            <h3 style={{ margin: 0 }}>
              {customToggleEnabled
                ? "TwigTree with custom demo toggles"
                : "TwigTree with default toggles"}
            </h3>
            <p style={{ margin: 0, color: "#94a3b8" }}>
              {customToggleEnabled
                ? "The tree is using the preset star and heart icons so you can quickly test custom toggle rendering."
                : "The tree is using the built-in plus and minus icons so you can inspect the default component behavior. This demo also includes disabled items, a right-side subtree enable toggle, and a lazy-loaded branch."}
            </p>
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
                paddingBlock: controls.itemPaddingBlock,
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
          <div className="demoControlsGrid">
            <ControlSection
              title="Tree layout"
              description="Tune row rhythm and the generated id prefix without mixing them into the styling controls."
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
                  label="Row padding"
                  value={controls.itemPaddingBlock}
                  min={0}
                  max={16}
                  step={1}
                  onChange={(value) => {
                    patchControls({ itemPaddingBlock: value });
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
              title="Default styles"
              description="Inspect the built-in style layers separately so disabled, focus, action, and status visuals can be tested independently. The demo toggle preset also lives here now."
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
              title="Connectors"
              description="Everything related to the tree lines is grouped here: thickness, color, and the elbow radius."
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
              description="Turn branch animation on or off and tune the timing when you want to inspect motion behavior."
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
              title="Toggles"
              description="Size, roundness, spacing, and general styling for the toggle button. The color fields apply to the default toggle mode, while the custom preset keeps its own demo colors."
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
    </main>
  );
}
