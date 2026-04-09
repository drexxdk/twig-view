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
