import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import React, { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import TreeView, { type TreeViewHandle, type TreeViewNode } from "./TreeView";

const data: TreeViewNode[] = [
  {
    id: "root",
    label: "Root",
    defaultExpanded: true,
    children: [
      {
        id: "child-1",
        label: "Child 1",
      },
      {
        id: "child-2",
        label: "Child 2",
        children: [{ id: "grandchild", label: "Grandchild" }],
      },
    ],
  },
  {
    id: "always-open",
    label: "Always open",
    toggleable: false,
    children: [{ id: "visible-child", label: "Visible child" }],
  },
];

function renderMultilineLabel(title: string, note: string) {
  return (
    <span>
      {title}
      <br />
      <small>{note}</small>
    </span>
  );
}

function buildMultilineRegressionData(options?: { openLastRoot?: boolean }) {
  return [
    {
      id: "release-plan",
      label: renderMultilineLabel(
        "Release plan",
        "Multi-line label with nested notes",
      ),
      defaultExpanded: true,
      children: [
        {
          id: "copy-review",
          label: renderMultilineLabel(
            "Copy review",
            "Short branch that ends right after the elbow",
          ),
        },
        {
          id: "launch-assets",
          label:
            "Launch assets for paid social, partner email, and homepage hero delivery",
          defaultExpanded: true,
          children: [
            {
              id: "hero-lockups",
              label: renderMultilineLabel(
                "Hero lockups",
                "Two-line terminal child",
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
      label:
        "Handoff summary for localization review, stakeholder sign-off, and archive delivery",
      defaultExpanded: options?.openLastRoot,
      children: [
        {
          id: "docs-export",
          label: "Docs export",
        },
      ],
    },
  ] satisfies TreeViewNode[];
}

function buildWideNestedRegressionData() {
  return [
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
  ] satisfies TreeViewNode[];
}

function buildHiddenRailsRegressionData(options?: { openLastRoot?: boolean }) {
  return [
    {
      id: "project-docs",
      label: "Project docs",
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
              id: "connector-routing",
              label: "Connector routing",
            },
          ],
        },
      ],
    },
    {
      id: "always-visible",
      label: "Reference assets",
      toggleable: false,
      children: [
        {
          id: "reference-child-a",
          label: "Brand kit",
        },
        {
          id: "reference-child-b",
          label: "Launch checklist",
        },
      ],
    },
    {
      id: "handoff-root",
      label:
        "Handoff summary for localization review, stakeholder sign-off, and archive delivery",
      defaultExpanded: options?.openLastRoot,
      children: [
        {
          id: "handoff-export",
          label: "Docs export",
        },
      ],
    },
  ] satisfies TreeViewNode[];
}

describe("TreeView", () => {
  it("renders tree semantics and always-visible children", () => {
    render(<TreeView ariaLabel="Example tree" data={data} />);

    expect(
      screen.getByRole("tree", { name: "Example tree" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: /Root/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Visible child")).toBeInTheDocument();
  });

  it("supports imperative expand and collapse", async () => {
    const ref = createRef<TreeViewHandle>();

    render(<TreeView ariaLabel="Example tree" data={data} ref={ref} />);

    expect(screen.queryByText("Grandchild")).not.toBeInTheDocument();

    ref.current?.expand("child-2");
    await waitFor(() => {
      expect(screen.getByText("Grandchild")).toBeInTheDocument();
    });

    ref.current?.collapse("child-2");
    await waitFor(() => {
      expect(screen.queryByText("Grandchild")).not.toBeInTheDocument();
    });
  });

  it("supports imperative focus", async () => {
    const ref = createRef<TreeViewHandle>();

    render(<TreeView ariaLabel="Example tree" data={data} ref={ref} />);

    ref.current?.focus("child-2");

    await waitFor(() => {
      const item = screen.getByRole("treeitem", { name: /Child 2/i });
      const toggle = item.querySelector(
        '[data-slot="tree-toggle"]',
      ) as HTMLElement;
      expect(toggle).toBeTruthy();
      expect(toggle).toHaveFocus();
    });
  });

  it("falls back to focusing the row when an item has no toggle", async () => {
    const ref = createRef<TreeViewHandle>();

    render(<TreeView ariaLabel="Example tree" data={data} ref={ref} />);

    ref.current?.focus("child-1");

    await waitFor(() => {
      const item = screen.getByRole("treeitem", { name: /Child 1/i });
      expect(item).toHaveFocus();
    });
  });

  it("does not focus disabled items through the imperative handle", async () => {
    const ref = createRef<TreeViewHandle>();
    const onFocusedIdChange = vi.fn();
    const disabledData: TreeViewNode[] = [
      {
        id: "enabled-root",
        label: "Enabled root",
        defaultExpanded: true,
        children: [
          {
            id: "disabled-child",
            label: "Disabled child",
            disabled: true,
          },
        ],
      },
    ];

    render(
      <TreeView
        ariaLabel="Disabled tree"
        data={disabledData}
        onFocusedIdChange={onFocusedIdChange}
        ref={ref}
      />,
    );

    const rootItem = screen.getByRole("treeitem", { name: /Enabled root/i });
    const rootToggle = rootItem.querySelector(
      '[data-slot="tree-toggle"]',
    ) as HTMLElement;

    rootToggle.focus();
    onFocusedIdChange.mockClear();

    ref.current?.focus("disabled-child");

    await waitFor(() => {
      expect(rootToggle).toHaveFocus();
    });

    expect(onFocusedIdChange).not.toHaveBeenCalled();
  });

  it("skips disabled items during keyboard navigation", async () => {
    const keyboardData: TreeViewNode[] = [
      {
        id: "root-a",
        label: "Root A",
      },
      {
        id: "root-b",
        label: "Root B",
        disabled: true,
      },
      {
        id: "root-c",
        label: "Root C",
      },
    ];

    render(<TreeView ariaLabel="Keyboard tree" data={keyboardData} />);

    const rootA = screen.getByRole("treeitem", { name: /Root A/i });
    rootA.focus();

    fireEvent.keyDown(rootA, { key: "ArrowDown" });

    await waitFor(() => {
      const rootC = screen.getByRole("treeitem", { name: /Root C/i });
      expect(rootC).toHaveFocus();
    });
  });

  it("fires controlled expansion changes", () => {
    const onExpandedIdsChange = vi.fn();

    render(
      <TreeView
        ariaLabel="Controlled tree"
        data={data}
        expandedIds={["root"]}
        onExpandedIdsChange={onExpandedIdsChange}
      />,
    );

    const toggleButtons = screen.getAllByRole("button", {
      name: /expand node|collapse node/i,
    });
    fireEvent.click(toggleButtons[1]);

    expect(onExpandedIdsChange).toHaveBeenCalledWith(["root", "child-2"]);
  });

  it("supports keyboard navigation and expansion", async () => {
    render(<TreeView ariaLabel="Keyboard tree" data={data} />);

    const rootItem = screen.getByRole("treeitem", { name: /Root/i });
    const rootToggle = rootItem.querySelector(
      '[data-slot="tree-toggle"]',
    ) as HTMLElement;
    rootToggle.focus();

    fireEvent.keyDown(rootToggle, { key: "ArrowDown" });
    await waitFor(() => {
      const child1Item = screen.getByRole("treeitem", { name: /Child 1/i });
      const child1Toggle = child1Item.querySelector(
        '[data-slot="tree-toggle"]',
      ) as HTMLElement | null;
      if (child1Toggle) {
        expect(child1Toggle).toHaveFocus();
      } else {
        expect(child1Item).toHaveFocus();
      }
    });

    fireEvent.keyDown(document.activeElement as Element, {
      key: "ArrowDown",
    });
    await waitFor(() => {
      const child2Item = screen.getByRole("treeitem", { name: /Child 2/i });
      const child2Toggle = child2Item.querySelector(
        '[data-slot="tree-toggle"]',
      ) as HTMLElement;
      expect(child2Toggle).toBeTruthy();
      expect(child2Toggle).toHaveFocus();
    });

    fireEvent.keyDown(document.activeElement as Element, {
      key: "ArrowRight",
    });
    expect(screen.getByText("Grandchild")).toBeInTheDocument();
  });

  it("falls back to the nearest visible ancestor when a focused item is hidden", async () => {
    const ref = createRef<TreeViewHandle>();

    render(<TreeView ariaLabel="Example tree" data={data} ref={ref} />);

    ref.current?.expand("child-2");
    await waitFor(() => {
      expect(screen.getByText("Grandchild")).toBeInTheDocument();
    });

    ref.current?.focus("grandchild");

    await waitFor(() => {
      const grandchildItem = screen.getByRole("treeitem", {
        name: /Grandchild/i,
      });
      expect(grandchildItem).toHaveFocus();
    });

    ref.current?.collapse("child-2");

    await waitFor(() => {
      const child2Item = screen.getByRole("treeitem", { name: /Child 2/i });
      const child2Toggle = child2Item.querySelector(
        '[data-slot="tree-toggle"]',
      ) as HTMLElement;
      expect(child2Toggle).toHaveFocus();
    });
  });

  it("reports the nearest visible ancestor when controlled focus becomes hidden", async () => {
    const onFocusedIdChange = vi.fn();
    const { rerender } = render(
      <TreeView
        ariaLabel="Controlled focus tree"
        data={data}
        expandedIds={["root", "child-2"]}
        focusedId="grandchild"
        onFocusedIdChange={onFocusedIdChange}
      />,
    );

    onFocusedIdChange.mockClear();

    rerender(
      <TreeView
        ariaLabel="Controlled focus tree"
        data={data}
        expandedIds={["root"]}
        focusedId="grandchild"
        onFocusedIdChange={onFocusedIdChange}
      />,
    );

    await waitFor(() => {
      expect(onFocusedIdChange).toHaveBeenCalledWith("child-2");
    });
  });

  it("falls back to the nearest surviving ancestor when a focused item is removed", async () => {
    const ref = createRef<TreeViewHandle>();
    const removableData: TreeViewNode[] = [
      {
        id: "root",
        label: "Root",
        defaultExpanded: true,
        children: [
          {
            id: "branch",
            label: "Branch",
            defaultExpanded: true,
            children: [{ id: "leaf", label: "Leaf" }],
          },
        ],
      },
    ];

    const { rerender } = render(
      <TreeView ariaLabel="Removal tree" data={removableData} ref={ref} />,
    );

    ref.current?.focus("leaf");

    await waitFor(() => {
      const leafItem = screen.getByRole("treeitem", { name: /Leaf/i });
      expect(leafItem).toHaveFocus();
    });

    rerender(
      <TreeView
        ariaLabel="Removal tree"
        data={[
          {
            id: "root",
            label: "Root",
            defaultExpanded: true,
            children: [{ id: "branch", label: "Branch" }],
          },
        ]}
        ref={ref}
      />,
    );

    await waitFor(() => {
      const branchItem = screen.getByRole("treeitem", { name: /Branch/i });
      expect(branchItem).toHaveFocus();
    });
  });

  it("reports the nearest surviving ancestor when controlled focus is removed", async () => {
    const onFocusedIdChange = vi.fn();
    const { rerender } = render(
      <TreeView
        ariaLabel="Controlled removal tree"
        data={[
          {
            id: "root",
            label: "Root",
            defaultExpanded: true,
            children: [
              {
                id: "branch",
                label: "Branch",
                defaultExpanded: true,
                children: [{ id: "leaf", label: "Leaf" }],
              },
            ],
          },
        ]}
        focusedId="leaf"
        onFocusedIdChange={onFocusedIdChange}
      />,
    );

    onFocusedIdChange.mockClear();

    rerender(
      <TreeView
        ariaLabel="Controlled removal tree"
        data={[
          {
            id: "root",
            label: "Root",
            defaultExpanded: true,
            children: [{ id: "branch", label: "Branch" }],
          },
        ]}
        focusedId="leaf"
        onFocusedIdChange={onFocusedIdChange}
      />,
    );

    await waitFor(() => {
      expect(onFocusedIdChange).toHaveBeenCalledWith("branch");
    });
  });

  it("preserves focus when sibling branches reorder but the focused item still exists", async () => {
    const ref = createRef<TreeViewHandle>();
    const reorderableData: TreeViewNode[] = [
      {
        id: "alpha",
        label: "Alpha",
      },
      {
        id: "beta",
        label: "Beta",
        defaultExpanded: true,
        children: [{ id: "beta-leaf", label: "Beta leaf" }],
      },
    ];

    const { rerender } = render(
      <TreeView ariaLabel="Reorder tree" data={reorderableData} ref={ref} />,
    );

    ref.current?.focus("beta-leaf");

    await waitFor(() => {
      const leafItem = screen.getByRole("treeitem", { name: /Beta leaf/i });
      expect(leafItem).toHaveFocus();
    });

    rerender(
      <TreeView
        ariaLabel="Reorder tree"
        data={[
          {
            id: "beta",
            label: "Beta",
            defaultExpanded: true,
            children: [{ id: "beta-leaf", label: "Beta leaf" }],
          },
          {
            id: "alpha",
            label: "Alpha",
          },
        ]}
        ref={ref}
      />,
    );

    await waitFor(() => {
      const leafItem = screen.getByRole("treeitem", { name: /Beta leaf/i });
      expect(leafItem).toHaveFocus();
    });
  });

  it("does not report a focus change when a controlled focused subtree reorders", async () => {
    const onFocusedIdChange = vi.fn();
    const { rerender } = render(
      <TreeView
        ariaLabel="Controlled reorder tree"
        data={[
          {
            id: "alpha",
            label: "Alpha",
          },
          {
            id: "beta",
            label: "Beta",
            defaultExpanded: true,
            children: [{ id: "beta-leaf", label: "Beta leaf" }],
          },
        ]}
        focusedId="beta-leaf"
        onFocusedIdChange={onFocusedIdChange}
      />,
    );

    onFocusedIdChange.mockClear();

    rerender(
      <TreeView
        ariaLabel="Controlled reorder tree"
        data={[
          {
            id: "beta",
            label: "Beta",
            defaultExpanded: true,
            children: [{ id: "beta-leaf", label: "Beta leaf" }],
          },
          {
            id: "alpha",
            label: "Alpha",
          },
        ]}
        focusedId="beta-leaf"
        onFocusedIdChange={onFocusedIdChange}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("treeitem", { name: /Beta leaf/i }),
      ).toBeInTheDocument();
    });

    expect(onFocusedIdChange).not.toHaveBeenCalled();
  });

  it("applies line options to the tree root", async () => {
    render(
      <TreeView
        ariaLabel="Styled tree"
        data={data}
        line={{
          color: "tomato",
          radius: 12,
          showParentLines: false,
          style: "dashed",
          width: 2,
        }}
      />,
    );

    const tree = screen.getByRole("tree", {
      name: "Styled tree",
    }) as HTMLDivElement;

    await waitFor(() => {
      expect(tree.style.getPropertyValue("--tree-line-width")).toBe("2px");
    });

    expect(tree.style.getPropertyValue("--tree-line-color")).toBe("tomato");
    expect(tree.style.getPropertyValue("--tree-line-radius")).toBe("12px");
    expect(tree.style.getPropertyValue("--tree-line-style")).toBe("dashed");
  });

  it("applies toggle styling options to the tree root", () => {
    render(
      <TreeView
        ariaLabel="Styled tree"
        data={data}
        toggle={{
          background: "rebeccapurple",
          foreground: "mintcream",
          focusRingColor: "gold",
          focusRingOffset: 4,
        }}
      />,
    );

    const tree = screen.getByRole("tree", {
      name: "Styled tree",
    }) as HTMLDivElement;

    expect(tree.style.getPropertyValue("--tree-toggle-bg")).toBe(
      "rebeccapurple",
    );
    expect(tree.style.getPropertyValue("--tree-toggle-foreground")).toBe(
      "mintcream",
    );
    expect(tree.style.getPropertyValue("--tree-toggle-focus-ring-color")).toBe(
      "gold",
    );
    expect(tree.style.getPropertyValue("--tree-toggle-focus-ring-offset")).toBe(
      "4px",
    );
  });

  it("preserves consumer toggle CSS variables when toggle props are omitted", () => {
    render(
      <TreeView
        ariaLabel="Styled tree"
        data={data}
        style={
          {
            "--tree-toggle-bg": "hotpink",
            "--tree-toggle-foreground": "black",
            "--tree-toggle-focus-ring-color": "cyan",
          } as React.CSSProperties
        }
      />,
    );

    const tree = screen.getByRole("tree", {
      name: "Styled tree",
    }) as HTMLDivElement;

    expect(tree.style.getPropertyValue("--tree-toggle-bg")).toBe("hotpink");
    expect(tree.style.getPropertyValue("--tree-toggle-foreground")).toBe(
      "black",
    );
    expect(tree.style.getPropertyValue("--tree-toggle-focus-ring-color")).toBe(
      "cyan",
    );
  });

  it("applies merged toggle class and style to built-in toggle icons", () => {
    const customData: TreeViewNode[] = [
      {
        id: "custom-root",
        label: "Custom root",
        children: [
          {
            id: "custom-child",
            label: "Custom child",
            children: [{ id: "custom-leaf", label: "Custom leaf" }],
            toggleClassName: "node-toggle",
            toggleStyle: { backgroundColor: "rgb(1, 2, 3)" },
          },
        ],
        defaultExpanded: true,
      },
    ];

    render(
      <TreeView
        ariaLabel="Custom toggle tree"
        data={customData}
        toggleClassName="root-toggle"
        toggleStyle={{ borderColor: "rgb(4, 5, 6)" }}
      />,
    );

    const item = screen.getByRole("treeitem", { name: /Custom child/i });
    const button = within(item).getByRole("button", { name: /expand node/i });
    const icon = button.querySelector("span") as HTMLElement;

    expect(button.className).toContain("root-toggle");
    expect(button.className).toContain("node-toggle");
    expect(button.style.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(button.style.borderColor).toBe("rgb(4, 5, 6)");
    expect(icon.className).toContain("root-toggle");
    expect(icon.className).toContain("node-toggle");
    expect(icon.style.backgroundColor).toBe("rgb(1, 2, 3)");
    expect(icon.style.borderColor).toBe("rgb(4, 5, 6)");
  });

  it("preserves built-in toggle customization for disabled nodes", () => {
    const disabledToggleData: TreeViewNode[] = [
      {
        id: "root",
        label: "Root",
        defaultExpanded: true,
        children: [
          {
            id: "disabled-branch",
            label: "Disabled branch",
            disabled: true,
            children: [{ id: "leaf", label: "Leaf" }],
            toggleClassName: "disabled-node-toggle",
            toggleStyle: { backgroundColor: "rgb(7, 8, 9)" },
          },
        ],
      },
    ];

    render(
      <TreeView
        ariaLabel="Disabled custom toggle tree"
        data={disabledToggleData}
        toggleClassName="root-toggle"
        toggleStyle={{ borderColor: "rgb(10, 11, 12)" }}
      />,
    );

    const item = screen.getByRole("treeitem", { name: /Disabled branch/i });
    const button = within(item).getByRole("button", {
      name: /expand node|collapse node/i,
    });
    const icon = button.querySelector("span") as HTMLElement;

    expect(button).toBeDisabled();
    expect(icon.className).toContain("root-toggle");
    expect(icon.className).toContain("disabled-node-toggle");
    expect(icon.style.backgroundColor).toBe("rgb(7, 8, 9)");
    expect(icon.style.borderColor).toBe("rgb(10, 11, 12)");
  });

  it("marks first multiline roots for continuation selector coverage", () => {
    render(
      <TreeView
        ariaLabel="Multiline regression tree"
        data={buildMultilineRegressionData()}
        line={{
          color: "#4ade80",
          radius: 14,
          showParentLines: true,
          width: 1.5,
        }}
        rowGap={10}
        toggleSize={18}
      />,
    );

    const releasePlan = screen.getByRole("treeitem", { name: /Release plan/i });
    const releasePlanRow = releasePlan.querySelector(
      '[data-slot="tree-row"]',
    ) as HTMLElement;

    expect(releasePlan).toHaveAttribute("data-depth", "1");
    expect(releasePlan).toHaveAttribute("data-has-next-sibling", "true");
    expect(releasePlan).toHaveAttribute("data-visible-children", "true");
    expect(
      releasePlanRow.querySelector('[data-slot="tree-child-stem"]'),
    ).toBeNull();
  });

  it("renders a single outgoing child stem for wrapped nested branches", () => {
    render(
      <TreeView
        ariaLabel="Multiline regression tree"
        data={buildMultilineRegressionData()}
        line={{
          color: "#4ade80",
          radius: 14,
          showParentLines: true,
          width: 1.5,
        }}
        rowGap={10}
        toggleSize={18}
      />,
    );

    const launchAssets = screen.getByRole("treeitem", {
      name: /Launch assets/i,
    });
    const launchAssetsRow = launchAssets.querySelector(
      '[data-slot="tree-row"]',
    ) as HTMLElement;

    expect(launchAssets).toHaveAttribute("data-depth", "2");
    expect(launchAssets).toHaveAttribute("data-last-child", "true");
    expect(launchAssets).toHaveAttribute("data-visible-children", "true");
    expect(
      launchAssetsRow.querySelectorAll('[data-slot="tree-child-stem"]'),
    ).toHaveLength(1);
  });

  it("renders a single outgoing child stem for wide nested branches", () => {
    render(
      <TreeView
        ariaLabel="Wide nested tree"
        data={buildWideNestedRegressionData()}
        line={{ color: "#f472b6", radius: 0, showParentLines: true, width: 3 }}
        toggleSize={26}
        indent={34}
        childGap={10}
      />,
    );

    const queueB = screen.getByRole("treeitem", { name: /Queue B/i });
    const queueBRow = queueB.querySelector(
      '[data-slot="tree-row"]',
    ) as HTMLElement;

    expect(queueB).toHaveAttribute("data-depth", "3");
    expect(queueB).toHaveAttribute("data-last-child", "true");
    expect(queueB).toHaveAttribute("data-visible-children", "true");
    expect(
      queueBRow.querySelectorAll('[data-slot="tree-child-stem"]'),
    ).toHaveLength(1);
  });

  it("keeps hidden-rail always-visible roots expanded for connector coverage", () => {
    render(
      <TreeView
        ariaLabel="Hidden rails regression tree"
        data={buildHiddenRailsRegressionData()}
        line={{
          color: "#38bdf8",
          radius: 0,
          showParentLines: false,
          width: 1.5,
        }}
      />,
    );

    const tree = screen.getByRole("tree", {
      name: /Hidden rails regression tree/i,
    });
    const alwaysVisible = screen.getByRole("treeitem", {
      name: /Reference assets/i,
    });

    expect(tree).toHaveAttribute("data-show-parent-lines", "false");
    expect(alwaysVisible).toHaveAttribute("data-visible-children", "true");
    expect(alwaysVisible).not.toHaveAttribute("data-toggleable");
    expect(screen.getByText("Brand kit")).toBeInTheDocument();
  });

  it("keeps hidden-rail multiline last roots collapsed when not expanded", () => {
    render(
      <TreeView
        ariaLabel="Hidden rails regression tree"
        data={buildHiddenRailsRegressionData()}
        line={{
          color: "#38bdf8",
          radius: 0,
          showParentLines: false,
          width: 1.5,
        }}
      />,
    );

    const handoff = screen.getByRole("treeitem", { name: /Handoff summary/i });

    expect(handoff).toHaveAttribute("data-depth", "1");
    expect(handoff).toHaveAttribute("data-last-child", "true");
    expect(handoff).not.toHaveAttribute("data-visible-children");
    expect(screen.queryByText("Docs export")).not.toBeInTheDocument();
  });

  it("keeps hidden-rail multiline last roots open when expanded", () => {
    render(
      <TreeView
        ariaLabel="Hidden rails regression tree"
        data={buildHiddenRailsRegressionData({ openLastRoot: true })}
        line={{
          color: "#38bdf8",
          radius: 0,
          showParentLines: false,
          width: 1.5,
        }}
      />,
    );

    const handoff = screen.getByRole("treeitem", { name: /Handoff summary/i });
    const handoffRow = handoff.querySelector(
      '[data-slot="tree-row"]',
    ) as HTMLElement;

    expect(handoff).toHaveAttribute("data-depth", "1");
    expect(handoff).toHaveAttribute("data-last-child", "true");
    expect(handoff).toHaveAttribute("data-visible-children", "true");
    expect(
      handoffRow.querySelector('[data-slot="tree-child-stem"]'),
    ).toBeNull();
    expect(screen.getByText("Docs export")).toBeInTheDocument();
  });

  it("keeps rounded multiline last roots open when expanded", () => {
    render(
      <TreeView
        ariaLabel="Rounded multiline regression tree"
        data={buildMultilineRegressionData({ openLastRoot: true })}
        line={{
          color: "#4ade80",
          radius: 14,
          showParentLines: true,
          width: 1.5,
        }}
        rowGap={10}
        toggleSize={18}
      />,
    );

    const tree = screen.getByRole("tree", {
      name: /Rounded multiline regression tree/i,
    });
    const handoff = screen.getByRole("treeitem", { name: /Handoff summary/i });
    const handoffRow = handoff.querySelector(
      '[data-slot="tree-row"]',
    ) as HTMLElement;

    expect(tree).toHaveAttribute("data-line-rounded", "true");
    expect(handoff).toHaveAttribute("data-depth", "1");
    expect(handoff).toHaveAttribute("data-last-child", "true");
    expect(handoff).toHaveAttribute("data-visible-children", "true");
    expect(
      handoffRow.querySelector('[data-slot="tree-child-stem"]'),
    ).toBeNull();
    expect(screen.getByText("Docs export")).toBeInTheDocument();
  });

  it("can hide parent continuation rails", () => {
    const { container } = render(
      <TreeView
        ariaLabel="Compact tree"
        data={data}
        line={{ showParentLines: false }}
      />,
    );

    expect(container.querySelector('[data-slot="tree-guide-rail"]')).toBeNull();
  });
});
