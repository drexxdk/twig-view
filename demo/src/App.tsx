import { useRef, useState } from "react";
import TreeView, { type TreeViewHandle, type TreeViewNode } from "twig-view";

const data: TreeViewNode[] = [
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

export default function App() {
  const detailedTreeRef = useRef<TreeViewHandle>(null);
  const compactTreeRef = useRef<TreeViewHandle>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>(["docs", "guides"]);

  function withTrees(action: (tree: TreeViewHandle) => void) {
    [detailedTreeRef.current, compactTreeRef.current].forEach((tree) => {
      if (tree) {
        action(tree);
      }
    });
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
          width: "min(760px, 100%)",
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
            onClick={() => detailedTreeRef.current?.focus("routing")}
          >
            Focus routing
          </button>
        </div>

        <div className="demoTreeGrid">
          <div>
            <p className="demoTreeLabel">Parent lines shown</p>
            <TreeView
              ref={detailedTreeRef}
              ariaLabel="Documentation tree with parent lines"
              className="demoTree"
              data={data}
              expandedIds={expandedIds}
              line={{
                color: "#38bdf8",
                radius: 12,
                showParentLines: true,
                width: 1.5,
              }}
              onExpandedIdsChange={setExpandedIds}
              renderNode={({ node, hasChildren, toggleable }) => (
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
              )}
              renderToggle={({ expanded, size }) => (
                <span
                  aria-hidden="true"
                  style={{
                    width: size,
                    height: size,
                    display: "inline-grid",
                    placeItems: "center",
                    borderRadius: 999,
                    background: expanded
                      ? "rgb(22, 78, 99)"
                      : "rgb(51, 65, 85)",
                    boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.96)",
                    color: expanded ? "#7dd3fc" : "#cbd5e1",
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  {expanded ? "−" : "+"}
                </span>
              )}
            />
          </div>

          <div>
            <p className="demoTreeLabel">Parent lines hidden</p>
            <TreeView
              ref={compactTreeRef}
              ariaLabel="Documentation tree without parent lines"
              className="demoTree"
              data={data}
              expandedIds={expandedIds}
              line={{
                color: "#38bdf8",
                radius: 0,
                showParentLines: false,
                width: 1.5,
              }}
              onExpandedIdsChange={setExpandedIds}
              renderNode={({ node, hasChildren, toggleable }) => (
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
              )}
              renderToggle={({ expanded, size }) => (
                <span
                  aria-hidden="true"
                  style={{
                    width: size,
                    height: size,
                    display: "inline-grid",
                    placeItems: "center",
                    borderRadius: 999,
                    background: expanded
                      ? "rgb(22, 78, 99)"
                      : "rgb(51, 65, 85)",
                    boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.96)",
                    color: expanded ? "#7dd3fc" : "#cbd5e1",
                    fontSize: 12,
                    lineHeight: 1,
                  }}
                >
                  {expanded ? "−" : "+"}
                </span>
              )}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
