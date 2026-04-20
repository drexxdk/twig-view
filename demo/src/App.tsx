import { useState } from "react";
import { TwigTree, type TwigTreeItem } from "./components";

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
  });

  function patchControls(patch: Partial<ControlsState>) {
    setControls((current) => ({ ...current, ...patch }));
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

  return (
    <main
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
          Change the shared tree props below. The page renders one tree with the
          default toggles and one with custom toggle icons.
        </p>
        <p style={{ margin: "0 0 16px", color: "#7dd3fc", fontSize: 14 }}>
          The second demo provides icons directly through{" "}
          <code>toggle.open.icon</code>
          and <code>toggle.closed.icon</code>.
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
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <article
          style={{
            borderRadius: 16,
            padding: 20,
            background: "rgba(2,6,23,0.45)",
            border: "1px solid rgba(148,163,184,0.12)",
          }}
        >
          <h3 style={{ margin: 0 }}>Default Toggles</h3>
          <p style={{ margin: "8px 0 16px", color: "#94a3b8" }}>
            Uses the built-in plus/minus toggle icons.
          </p>
          <TwigTree
            items={twigTreeItems}
            idPrefix={`${controls.idPrefix}-default`}
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
            toggle={{
              size: controls.toggleSize,
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
            }}
          />
        </article>

        <article
          style={{
            borderRadius: 16,
            padding: 20,
            background: "rgba(2,6,23,0.45)",
            border: "1px solid rgba(148,163,184,0.12)",
          }}
        >
          <h3 style={{ margin: 0 }}>Custom Toggle Icons</h3>
          <p style={{ margin: "8px 0 16px", color: "#94a3b8" }}>
            Open uses a yellow star. Closed uses a red heart.
          </p>
          <TwigTree
            items={twigTreeItems}
            idPrefix={`${controls.idPrefix}-custom`}
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
            toggle={{
              size: controls.toggleSize,
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
                  background: "#9a3412",
                  color: "#facc15",
                },
                icon: (
                  <span aria-hidden="true" style={customStarIconStyle}>
                    ★
                  </span>
                ),
              },
              closed: {
                style: {
                  background: "#991b1b",
                  color: "#f87171",
                },
                icon: (
                  <span aria-hidden="true" style={customToggleIconStyle}>
                    ♥
                  </span>
                ),
              },
            }}
          />
        </article>
      </section>
    </main>
  );
}
