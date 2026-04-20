import { useState } from "react";
import {
  TwigTree,
  type TwigTreeItem,
  type TwigTreeRenderToggleIconArgs,
} from "./components";

const twigTreeItems: TwigTreeItem[] = [
  {
    id: "test-1",
    label: "test 1",
  },
  {
    id: "test-2",
    label: "test 2",
  },
  {
    id: "test-3",
    label: "test 3",
    defaultExpanded: true,
    children: [
      {
        id: "test-3-1",
        label: "test 3.1",
      },
      {
        id: "test-3-2",
        label: "test 3.2",
        children: [
          {
            id: "test-3-2-1",
            label: "test 3.2.1",
          },
          {
            id: "test-3-2-2",
            label: "test 3.2.2",
          },
          {
            id: "test-3-2-3",
            label: "test 3.2.3",
          },
        ],
      },
    ],
  },
  {
    id: "test-4",
    label: "test 4",
  },
  {
    id: "test-5",
    label: "test 5",
    children: [
      {
        id: "test-5-1",
        label: "test 5.1",
      },
      {
        id: "test-5-2",
        label: "test 5.2",
      },
      {
        id: "test-5-3",
        label: "test 5.3",
      },
    ],
  },
];

type ControlsState = {
  lineWidth: number;
  lineColor: string;
  lineRadius: number;
  toggleSize: number;
  spacing: number;
  itemPaddingBlock: number;
  itemPaddingInlineStart: number;
  itemPaddingInlineEnd: number;
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
  useCustomIcons: boolean;
  openSymbol: string;
  closedSymbol: string;
};

export default function App() {
  const [controls, setControls] = useState<ControlsState>({
    lineWidth: 1,
    lineColor: "#ff4d4f",
    lineRadius: 10,
    toggleSize: 16,
    spacing: 4,
    itemPaddingBlock: 2,
    itemPaddingInlineStart: 0,
    itemPaddingInlineEnd: 0,
    idPrefix: "twig-tree",
    animationEnabled: true,
    animationDuration: 220,
    animationEasing: "ease",
    animateOpacity: true,
    toggleIconSize: 10,
    toggleOpenFill: "#16a34a",
    toggleClosedFill: "#6b7280",
    toggleIconColor: "#ffffff",
    toggleShadow: "0 8px 20px rgba(15, 23, 42, 0.35)",
    useCustomIcons: false,
    openSymbol: "−",
    closedSymbol: "+",
  });

  function patchControls(patch: Partial<ControlsState>) {
    setControls((current) => ({ ...current, ...patch }));
  }

  function renderCustomToggleIcon({
    expanded,
    size,
  }: TwigTreeRenderToggleIconArgs) {
    if (!controls.useCustomIcons) {
      return undefined;
    }

    return (
      <span
        aria-hidden="true"
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: size,
          height: size,
          fontSize: Math.max(10, controls.toggleIconSize),
          lineHeight: 1,
          fontWeight: 700,
        }}
      >
        {expanded ? controls.openSymbol : controls.closedSymbol}
      </span>
    );
  }

  return (
    <main
      className="demoTreePlayground"
      style={
        {
          "--demo-toggle-open-fill": controls.toggleOpenFill,
          "--demo-toggle-closed-fill": controls.toggleClosedFill,
          "--demo-toggle-icon-color": controls.toggleIconColor,
          "--demo-toggle-shadow": controls.toggleShadow,
          width: "min(1100px, 100%)",
          margin: "0 auto",
          padding: 24,
          display: "grid",
          gap: 24,
        } as React.CSSProperties
      }
    >
      <section
        style={{
          borderRadius: 16,
          padding: 20,
          background: "rgba(2,6,23,0.6)",
          border: "1px solid rgba(148,163,184,0.12)",
        }}
      >
        <h2 style={{ margin: 0 }}>TwigTree controls</h2>
        <p style={{ margin: "8px 0 16px", color: "#94a3b8" }}>
          Change the tree props below. Tree data stays fixed.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <label>
            Line width
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={controls.lineWidth}
              onChange={(event) => {
                patchControls({ lineWidth: Number(event.target.value) });
              }}
            />
          </label>
          <label>
            Line color
            <input
              type="color"
              value={controls.lineColor}
              onChange={(event) => {
                patchControls({ lineColor: event.target.value });
              }}
            />
          </label>
          <label>
            Line radius
            <input
              type="number"
              min="0"
              step="1"
              value={controls.lineRadius}
              onChange={(event) => {
                patchControls({ lineRadius: Number(event.target.value) });
              }}
            />
          </label>
          <label>
            Toggle size
            <input
              type="number"
              min="12"
              step="1"
              value={controls.toggleSize}
              onChange={(event) => {
                patchControls({ toggleSize: Number(event.target.value) });
              }}
            />
          </label>
          <label>
            Toggle icon size
            <input
              type="number"
              min="8"
              step="1"
              value={controls.toggleIconSize}
              onChange={(event) => {
                patchControls({ toggleIconSize: Number(event.target.value) });
              }}
            />
          </label>
          <label>
            Spacing
            <input
              type="number"
              min="0"
              step="1"
              value={controls.spacing}
              onChange={(event) => {
                patchControls({ spacing: Number(event.target.value) });
              }}
            />
          </label>
          <label>
            Item padding block
            <input
              type="number"
              min="0"
              step="1"
              value={controls.itemPaddingBlock}
              onChange={(event) => {
                patchControls({
                  itemPaddingBlock: Number(event.target.value),
                });
              }}
            />
          </label>
          <label>
            Item padding start
            <input
              type="number"
              min="0"
              step="1"
              value={controls.itemPaddingInlineStart}
              onChange={(event) => {
                patchControls({
                  itemPaddingInlineStart: Number(event.target.value),
                });
              }}
            />
          </label>
          <label>
            Item padding end
            <input
              type="number"
              min="0"
              step="1"
              value={controls.itemPaddingInlineEnd}
              onChange={(event) => {
                patchControls({
                  itemPaddingInlineEnd: Number(event.target.value),
                });
              }}
            />
          </label>
          <label>
            ID prefix
            <input
              type="text"
              value={controls.idPrefix}
              onChange={(event) => {
                patchControls({ idPrefix: event.target.value });
              }}
            />
          </label>
          <label>
            Open toggle fill
            <input
              type="color"
              value={controls.toggleOpenFill}
              onChange={(event) => {
                patchControls({ toggleOpenFill: event.target.value });
              }}
            />
          </label>
          <label>
            Closed toggle fill
            <input
              type="color"
              value={controls.toggleClosedFill}
              onChange={(event) => {
                patchControls({ toggleClosedFill: event.target.value });
              }}
            />
          </label>
          <label>
            Toggle icon color
            <input
              type="color"
              value={controls.toggleIconColor}
              onChange={(event) => {
                patchControls({ toggleIconColor: event.target.value });
              }}
            />
          </label>
          <label>
            Toggle shadow
            <input
              type="text"
              value={controls.toggleShadow}
              onChange={(event) => {
                patchControls({ toggleShadow: event.target.value });
              }}
            />
          </label>
          <label>
            Animation duration
            <input
              type="number"
              min="0"
              step="10"
              value={controls.animationDuration}
              onChange={(event) => {
                patchControls({
                  animationDuration: Number(event.target.value),
                });
              }}
            />
          </label>
          <label>
            Animation easing
            <input
              type="text"
              value={controls.animationEasing}
              onChange={(event) => {
                patchControls({ animationEasing: event.target.value });
              }}
            />
          </label>
          <label>
            Open icon symbol
            <input
              type="text"
              value={controls.openSymbol}
              onChange={(event) => {
                patchControls({ openSymbol: event.target.value || "−" });
              }}
            />
          </label>
          <label>
            Closed icon symbol
            <input
              type="text"
              value={controls.closedSymbol}
              onChange={(event) => {
                patchControls({ closedSymbol: event.target.value || "+" });
              }}
            />
          </label>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 16,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={controls.animationEnabled}
              onChange={(event) => {
                patchControls({ animationEnabled: event.target.checked });
              }}
            />{" "}
            Enable animation
          </label>
          <label>
            <input
              type="checkbox"
              checked={controls.animateOpacity}
              onChange={(event) => {
                patchControls({ animateOpacity: event.target.checked });
              }}
            />{" "}
            Animate opacity
          </label>
          <label>
            <input
              type="checkbox"
              checked={controls.useCustomIcons}
              onChange={(event) => {
                patchControls({ useCustomIcons: event.target.checked });
              }}
            />{" "}
            Override plus/minus icons
          </label>
        </div>
      </section>

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
          paddingInlineStart: controls.itemPaddingInlineStart,
          paddingInlineEnd: controls.itemPaddingInlineEnd,
        }}
        slots={{
          tree: {
            className: "demoTree",
          },
        }}
        animation={{
          enabled: controls.animationEnabled,
          duration: controls.animationDuration,
          easing: controls.animationEasing,
          animateOpacity: controls.animateOpacity,
        }}
        toggle={{
          size: controls.toggleSize,
          button: {
            className: "demoToggleShell",
          },
          icon: {
            size: controls.toggleIconSize,
            className: "demoToggleGlyph",
          },
          open: {
            className: "demoToggleShellOpen",
          },
          closed: {
            className: "demoToggleShellClosed",
          },
        }}
        renderToggleIcon={
          controls.useCustomIcons ? renderCustomToggleIcon : undefined
        }
      />
    </main>
  );
}
