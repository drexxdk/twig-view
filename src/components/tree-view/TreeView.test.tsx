import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    expect(screen.getByRole("tree", { name: "Example tree" })).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: /Root/i })).toHaveAttribute("aria-expanded", "true");
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

    const toggleButtons = screen.getAllByRole("button", { name: /expand node|collapse node/i });
    fireEvent.click(toggleButtons[1]);

    expect(onExpandedIdsChange).toHaveBeenCalledWith(["root", "child-2"]);
  });

  it("supports keyboard navigation and expansion", () => {
    render(<TreeView ariaLabel="Keyboard tree" data={data} />);

    const root = screen.getByRole("treeitem", { name: /Root/i });
    root.focus();

    fireEvent.keyDown(root, { key: "ArrowDown" });
    expect(screen.getByRole("treeitem", { name: /Child 1/i })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("treeitem", { name: /Child 1/i }), { key: "ArrowDown" });
    const childTwo = screen.getByRole("treeitem", { name: /Child 2/i });
    expect(childTwo).toHaveFocus();

    fireEvent.keyDown(childTwo, { key: "ArrowRight" });
    expect(screen.getByText("Grandchild")).toBeInTheDocument();
  });
});
