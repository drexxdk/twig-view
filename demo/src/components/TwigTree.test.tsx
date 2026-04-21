import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TwigTree, { type TwigTreeItem } from "./TwigTree";

vi.mock("./twigTree.module.css", () => ({
  default: new Proxy(
    {},
    {
      get: (_, key) => String(key),
    },
  ),
}));

vi.mock("../utils/useLineWidthDpi", () => ({
  default: () => ({
    lineWidthDpi: 1,
    isLoading: false,
  }),
}));

function renderTree(items: TwigTreeItem[]) {
  return render(
    <TwigTree
      items={items}
      ariaLabel="Test tree"
      animation={false}
      useDefaultStyles
    />,
  );
}

describe("TwigTree", () => {
  it("renders ARIA tree semantics for branches and leaves", () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        children: [
          {
            id: "leaf",
            label: "Leaf",
          },
        ],
      },
    ]);

    expect(screen.getByRole("tree", { name: "Test tree" })).toBeInTheDocument();

    const branch = screen.getByRole("treeitem", { name: "Branch" });
    const leaf = screen.getByRole("treeitem", { name: "Leaf" });

    expect(branch).toHaveAttribute("aria-level", "1");
    expect(branch).toHaveAttribute("aria-expanded", "true");
    expect(leaf).toHaveAttribute("aria-level", "2");
    expect(leaf).not.toHaveAttribute("aria-expanded");
  });

  it("moves focus through visible treeitems with arrow keys", async () => {
    renderTree([
      {
        id: "first",
        label: "First",
        children: [{ id: "first-child", label: "First child" }],
      },
      {
        id: "second",
        label: "Second",
        disabled: true,
        children: [{ id: "second-child", label: "Second child" }],
      },
      {
        id: "third",
        label: "Third",
        children: [{ id: "third-child", label: "Third child" }],
      },
    ]);

    const first = screen.getByRole("treeitem", { name: "First" });
    const second = screen.getByRole("treeitem", { name: "Second" });
    const third = screen.getByRole("treeitem", { name: "Third" });

    first.focus();
    expect(first).toHaveFocus();

    fireEvent.keyDown(first, { key: "ArrowDown" });
    await waitFor(() => expect(third).toHaveFocus());

    fireEvent.keyDown(third, { key: "ArrowUp" });
    await waitFor(() => expect(first).toHaveFocus());
  });

  it("moves from a focused leaf to the next actionable treeitem", async () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        children: [{ id: "leaf", label: "Leaf" }],
      },
      {
        id: "next-branch",
        label: "Next branch",
        children: [{ id: "next-leaf", label: "Next leaf" }],
      },
    ]);

    const leaf = screen.getByRole("treeitem", { name: "Leaf" });
    const nextBranch = screen.getByRole("treeitem", { name: "Next branch" });

    leaf.focus();
    expect(leaf).toHaveFocus();

    fireEvent.keyDown(leaf, { key: "ArrowDown" });
    await waitFor(() => expect(nextBranch).toHaveFocus());
  });

  it("includes interactive leaf content in arrow navigation", async () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        children: [
          { id: "plain-leaf", label: "Plain leaf" },
          {
            id: "button-leaf",
            label: <button type="button">Button leaf</button>,
          },
          {
            id: "link-leaf",
            label: <a href="https://example.com">Link leaf</a>,
          },
        ],
      },
      {
        id: "next-branch",
        label: "Next branch",
        children: [{ id: "next-leaf", label: "Next leaf" }],
      },
    ]);

    const plainLeaf = screen.getByRole("treeitem", { name: "Plain leaf" });
    const buttonLeaf = screen.getByRole("treeitem", { name: "Button leaf" });
    const linkLeaf = screen.getByRole("treeitem", { name: "Link leaf" });
    const nextBranch = screen.getByRole("treeitem", { name: "Next branch" });

    plainLeaf.focus();
    expect(plainLeaf).toHaveFocus();

    fireEvent.keyDown(plainLeaf, { key: "ArrowDown" });
    await waitFor(() => expect(buttonLeaf).toHaveFocus());

    fireEvent.keyDown(buttonLeaf, { key: "ArrowDown" });
    await waitFor(() => expect(linkLeaf).toHaveFocus());

    fireEvent.keyDown(linkLeaf, { key: "ArrowDown" });
    await waitFor(() => expect(nextBranch).toHaveFocus());
  });

  it("handles arrow navigation when focus is on a descendant button or link", async () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        children: [
          {
            id: "button-leaf",
            label: <button type="button">Button leaf</button>,
          },
          {
            id: "link-leaf",
            label: <a href="https://example.com">Link leaf</a>,
          },
          {
            id: "next-branch",
            label: "Next branch",
            children: [{ id: "next-leaf", label: "Next leaf" }],
          },
        ],
      },
    ]);

    const button = screen.getByRole("button", { name: "Button leaf" });
    const link = screen.getByRole("link", { name: "Link leaf" });
    const linkLeaf = screen.getByRole("treeitem", { name: "Link leaf" });
    const nextBranch = screen.getByRole("treeitem", { name: "Next branch" });

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: "ArrowDown" });
    await waitFor(() => expect(linkLeaf).toHaveFocus());

    link.focus();
    expect(link).toHaveFocus();

    fireEvent.keyDown(link, { key: "ArrowDown" });
    await waitFor(() => expect(nextBranch).toHaveFocus());
  });

  it("activates a focused descendant link on space", () => {
    const onLinkClick = vi.fn((event: MouseEvent) => {
      event.preventDefault();
    });

    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        children: [
          {
            id: "link-leaf",
            label: (
              <a href="https://example.com" onClick={onLinkClick}>
                Link leaf
              </a>
            ),
          },
        ],
      },
    ]);

    const link = screen.getByRole("link", { name: "Link leaf" });

    link.focus();
    expect(link).toHaveFocus();

    fireEvent.keyDown(link, { key: " " });

    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard expansion, child focus, and collapse", async () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        children: [
          {
            id: "child-a",
            label: "Child A",
            children: [{ id: "child-a-leaf", label: "Child A leaf" }],
          },
          { id: "child-b", label: "Child B" },
        ],
      },
    ]);

    const branch = screen.getByRole("treeitem", { name: "Branch" });

    branch.focus();
    expect(branch).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(branch, { key: "ArrowRight" });
    expect(branch).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(branch, { key: "ArrowRight" });

    const childA = screen.getByRole("treeitem", { name: "Child A" });
    await waitFor(() => expect(childA).toHaveFocus());

    fireEvent.keyDown(childA, { key: "ArrowLeft" });
    await waitFor(() => expect(branch).toHaveFocus());

    fireEvent.keyDown(branch, { key: "ArrowLeft" });
    expect(branch).toHaveAttribute("aria-expanded", "false");
  });
});
