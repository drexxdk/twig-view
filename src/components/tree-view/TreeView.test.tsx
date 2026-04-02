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
