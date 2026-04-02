import { useMemo, useRef } from "react";
import TreeView, { type TreeViewHandle, type TreeViewNode } from "twig-view";

const documentationTree: TreeViewNode[] = [
  {
    id: "docs",
    label: <strong>Project docs</strong>,
    defaultExpanded: true,
    children: [
      {
        id: "getting-started",
        label: "Getting started",
      },
      {
        id: "guides",
        label: "Guides",
        defaultExpanded: true,
        children: [
          {
            id: "accessibility",
            label: "Accessibility",
          },
          {
            id: "routing",
            label: "Connector routing",
          },
        ],
      },
    ],
  },
  {
    id: "always-open",
    label: "Always visible branch",
    toggleable: false,
    children: [
      {
        id: "child-a",
        label: "Child A",
      },
      {
        id: "child-b",
        label: "Child B",
      },
    ],
  },
  {
    id: "tokens",
    label: "Design tokens",
    children: [
      {
        id: "colors",
        label: "Colors",
      },
    ],
  },
];

const multilineTree: TreeViewNode[] = [
  {
    id: "release-plan",
    label: (
      <span>
        Release plan
        <br />
        <small style={{ color: "#94a3b8" }}>Multi-line label with nested notes</small>
      </span>
    ),
    defaultExpanded: true,
    children: [
      {
        id: "copy-review",
        label: (
          <span>
            Copy review
            <br />
            <small style={{ color: "#94a3b8" }}>Ends immediately after this branch</small>
          </span>
        ),
      },
      {
        id: "launch-assets",
        label: "Launch assets",
        defaultExpanded: true,
        children: [
          {
            id: "hero-lockups",
            label: (
              <span>
                Hero lockups
                <br />
                <small style={{ color: "#94a3b8" }}>Two-line terminal child</small>
              </span>
            ),
          },
          {
            id: "campaign-video",
            label: "Campaign video",
          },
        ],
      },
    ],
  },
  {
    id: "handoff",
    label: "Handoff",
    children: [
      {
        id: "docs-export",
        label: "Docs export",
      },
    ],
  },
];

const mixedTree: TreeViewNode[] = [
  {
    id: "systems",
    label: "Systems",
    defaultExpanded: true,
    children: [
      {
        id: "ingest",
        label: "Ingest",
      },
      {
        id: "processing",
        label: "Processing",
        defaultExpanded: true,
        children: [
          {
            id: "queue-a",
            label: "Queue A",
          },
          {
            id: "queue-b",
            label: "Queue B",
            defaultExpanded: true,
            children: [
              {
                id: "worker-1",
                label: "Worker 1",
              },
              {
                id: "worker-2",
                label: "Worker 2",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "always-open",
    label: "Always open branch",
    toggleable: false,
    children: [
      {
        id: "reporting",
        label: "Reporting",
      },
      {
        id: "alerts",
        label: "Alerts",
      },
    ],
  },
  {
    id: "disabled-root",
    label: "Disabled root",
    disabled: true,
    children: [
      {
        id: "disabled-child",
        label: "Disabled child",
      },
    ],
  },
];

const terminalTree: TreeViewNode[] = [
  {
    id: "branch-a",
    label: "Branch A",
    defaultExpanded: true,
    children: [
      {
        id: "leaf-a1",
        label: "Leaf A1",
      },
      {
        id: "leaf-a2",
        label: "Leaf A2",
      },
    ],
  },
  {
    id: "branch-b",
    label: "Branch B",
    defaultExpanded: true,
    children: [
      {
        id: "branch-b1",
        label: "Branch B1",
        defaultExpanded: true,
        children: [
          {
            id: "leaf-b1a",
            label: "Leaf B1A",
          },
          {
            id: "leaf-b1b",
            label: "Leaf B1B",
          },
        ],
      },
    ],
  },
  {
    id: "branch-c",
    label: "Branch C",
    children: [
      {
        id: "leaf-c1",
        label: "Leaf C1",
      },
    ],
  },
];

const roundedElbowTree: TreeViewNode[] = [
  {
    id: "rounded-root",
    label: "Rounded root",
    defaultExpanded: true,
    children: [
      {
        id: "straight-branch",
        label: "Straight branch",
      },
      {
        id: "rounded-branch",
        label: "Rounded elbow branch",
        defaultExpanded: true,
        children: [
          {
            id: "rounded-leaf-a",
            label: "Rounded leaf A",
          },
          {
            id: "rounded-leaf-b",
            label: "Rounded leaf B",
          },
        ],
      },
      {
        id: "rounded-terminal",
        label: "Terminal branch",
        defaultExpanded: true,
        children: [
          {
            id: "rounded-terminal-leaf",
            label: "Single leaf terminal",
          },
        ],
      },
    ],
  },
];

type Scenario = {
  id: string;
  title: string;
  note: string;
  data: TreeViewNode[];
  line: {
    color: string;
    radius: number;
    showParentLines: boolean;
    width: number;
  };
  toggleSize?: number;
  indent?: number;
  childGap?: number;
  rowGap?: number;
  focusId?: string;
};

const scenarios: Scenario[] = [
  {
    id: "rounded-elbows",
    title: "Rounded elbow reference",
    note: "Dedicated rounded-L demo. The last child rows here should show obvious curved elbows with no competing trunk segments.",
    data: roundedElbowTree,
    line: { color: "#22d3ee", radius: 18, showParentLines: true, width: 2.5 },
    toggleSize: 22,
    indent: 32,
    rowGap: 10,
    childGap: 8,
  },
  {
    id: "rounded-shown",
    title: "Rounded parent rails",
    note: "Parent rails shown, rounded terminal corners, mixed toggleable and always-visible branches.",
    data: documentationTree,
    line: { color: "#38bdf8", radius: 12, showParentLines: true, width: 1.5 },
    focusId: "routing",
  },
  {
    id: "square-hidden",
    title: "Hidden parent rails",
    note: "Parent rails suppressed while direct parent-child joins stay visible.",
    data: documentationTree,
    line: { color: "#38bdf8", radius: 0, showParentLines: false, width: 1.5 },
  },
  {
    id: "terminal-matrix",
    title: "Terminal branch matrix",
    note: "Multiple last-child endings on different levels to expose L-corner bugs quickly.",
    data: terminalTree,
    line: { color: "#f59e0b", radius: 10, showParentLines: true, width: 2 },
    toggleSize: 20,
  },
  {
    id: "multiline-rounded",
    title: "Multi-line labels",
    note: "Rows with wrapped labels, nested terminals, and varied row heights.",
    data: multilineTree,
    line: { color: "#4ade80", radius: 14, showParentLines: true, width: 1.5 },
    toggleSize: 18,
    rowGap: 10,
  },
  {
    id: "wide-toggle",
    title: "Wide lines and large toggles",
    note: "Stress test for alignment with thicker strokes, larger toggles, and deeper indentation.",
    data: mixedTree,
    line: { color: "#f472b6", radius: 0, showParentLines: true, width: 3 },
    toggleSize: 26,
    indent: 34,
    childGap: 10,
  },
  {
    id: "tight-hidden",
    title: "Compact hidden rails",
    note: "Thin lines, smaller toggles, and hidden parent rails for compact layouts.",
    data: terminalTree,
    line: { color: "#a78bfa", radius: 0, showParentLines: false, width: 1 },
    toggleSize: 14,
    indent: 24,
    rowGap: 6,
    childGap: 4,
  },
];

export default function App() {
  const treeRefs = useRef<Record<string, TreeViewHandle | null>>({});
  const focusScenario = useMemo(
    () => scenarios.find((scenario) => scenario.focusId) ?? scenarios[0],
    [],
  );

  function withTrees(action: (tree: TreeViewHandle) => void) {
    Object.values(treeRefs.current).forEach((tree) => {
      if (tree) {
        action(tree);
      }
    });
  }

  function renderNode(node: TreeViewNode, hasChildren: boolean, toggleable: boolean) {
    return (
      <div
        style={{
          display: "inline-flex",
          gap: 10,
          alignItems: "center",
          padding: "4px 0",
        }}
      >
        <span>{node.label}</span>
        {hasChildren && !toggleable ? (
          <span
            style={{
              fontSize: 12,
              color: "#7dd3fc",
              border: "1px solid rgba(125, 211, 252, 0.35)",
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            always visible
          </span>
        ) : null}
      </div>
    );
  }

  function renderToggle(expanded: boolean, size: number) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          display: "inline-grid",
          placeItems: "center",
          borderRadius: 999,
          background: expanded ? "rgb(22, 78, 99)" : "rgb(51, 65, 85)",
          boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.96)",
          color: expanded ? "#7dd3fc" : "#cbd5e1",
          fontSize: Math.max(11, size * 0.55),
          lineHeight: 1,
        }}
      >
        {expanded ? "−" : "+"}
      </span>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px",
      }}
    >
      <section
        style={{
          width: "min(1280px, 100%)",
          borderRadius: 24,
          padding: 24,
          background: "rgba(15, 23, 42, 0.82)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          boxShadow: "0 24px 90px rgba(15, 23, 42, 0.35)",
          backdropFilter: "blur(16px)",
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <p
            style={{
              margin: 0,
              color: "#7dd3fc",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: 12,
            }}
          >
            twig-view demo
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Accessible tree view
          </h1>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            onClick={() => withTrees((tree) => tree.expandAll())}
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => withTrees((tree) => tree.collapseAll())}
          >
            Collapse all
          </button>
          <button
            type="button"
            onClick={() => {
              const focusId = focusScenario.focusId;
              const tree = treeRefs.current[focusScenario.id];

              if (tree && focusId) {
                tree.focus(focusId);
              }
            }}
          >
            Focus routing
          </button>
        </div>

        <div className="demoTreeGrid">
          {scenarios.map((scenario) => (
            <section key={scenario.id} className="demoScenarioCard">
              <p className="demoTreeLabel">{scenario.title}</p>
              <p className="demoTreeNote">{scenario.note}</p>
              <TreeView
                ref={(tree) => {
                  treeRefs.current[scenario.id] = tree;
                }}
                ariaLabel={scenario.title}
                childGap={scenario.childGap}
                className="demoTree"
                data={scenario.data}
                indent={scenario.indent}
                line={scenario.line}
                rowGap={scenario.rowGap}
                toggleSize={scenario.toggleSize}
                renderNode={({ node, hasChildren, toggleable }) =>
                  renderNode(node, hasChildren, toggleable)
                }
                renderToggle={({ expanded, size }) => renderToggle(expanded, size)}
              />
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
