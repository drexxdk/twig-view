import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TwigTree, {
  type TwigTreeComponentsOptions,
  type TwigTreeItem,
  type TwigTreeLinkComponentProps,
} from "./TwigTree";

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

function renderTree(
  items: TwigTreeItem[],
  options?: {
    components?: TwigTreeComponentsOptions;
  },
) {
  return render(
    <TwigTree
      items={items}
      ariaLabel="Test tree"
      animation={false}
      useDefaultStyles
      components={options?.components}
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
            onClickCallback: () => {},
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
        onClickCallback: () => {},
      },
      {
        id: "second",
        label: "Second",
        disabled: true,
        onClickCallback: () => {},
      },
      {
        id: "third",
        label: "Third",
        href: "/third",
      },
    ]);

    const first = screen.getByRole("treeitem", { name: "First" });
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
        children: [{ id: "leaf", label: "Leaf", onClickCallback: () => {} }],
      },
      {
        id: "next-branch",
        label: "Next branch",
        children: [
          { id: "next-leaf", label: "Next leaf", onClickCallback: () => {} },
        ],
      },
    ]);

    const leaf = screen.getByRole("treeitem", { name: "Leaf" });
    const nextBranch = screen.getByRole("treeitem", { name: "Next branch" });

    leaf.focus();
    expect(leaf).toHaveFocus();

    fireEvent.keyDown(leaf, { key: "ArrowDown" });
    await waitFor(() => expect(nextBranch).toHaveFocus());
  });

  it("includes action leaf items in arrow navigation", async () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        children: [
          {
            id: "first-action",
            label: "First action",
            onClickCallback: () => {},
          },
          {
            id: "second-action",
            label: "Second action",
            href: "https://example.com",
          },
        ],
      },
      {
        id: "next-branch",
        label: "Next branch",
        children: [
          { id: "next-leaf", label: "Next leaf", onClickCallback: () => {} },
        ],
      },
    ]);

    const branch = screen.getByRole("treeitem", { name: "Branch" });
    const firstAction = screen.getByRole("treeitem", { name: "First action" });
    const secondAction = screen.getByRole("treeitem", {
      name: "Second action",
    });
    const nextBranch = screen.getByRole("treeitem", { name: "Next branch" });

    branch.focus();
    expect(branch).toHaveFocus();

    fireEvent.keyDown(branch, { key: "ArrowDown" });
    await waitFor(() => expect(firstAction).toHaveFocus());

    fireEvent.keyDown(firstAction, { key: "ArrowDown" });
    await waitFor(() => expect(secondAction).toHaveFocus());

    fireEvent.keyDown(secondAction, { key: "ArrowDown" });
    await waitFor(() => expect(nextBranch).toHaveFocus());
  });

  it("activates a button leaf on enter and space", () => {
    const onClickCallback = vi.fn();

    renderTree([
      {
        id: "leaf",
        label: "Leaf button",
        onClickCallback,
      },
    ]);

    const leaf = screen.getByRole("treeitem", { name: "Leaf button" });

    leaf.focus();
    expect(leaf).toHaveFocus();

    fireEvent.keyDown(leaf, { key: "Enter" });
    fireEvent.keyDown(leaf, { key: " " });

    expect(onClickCallback).toHaveBeenCalledTimes(2);
  });

  it("activates a link leaf on space", () => {
    const onLeafClick = vi.fn();

    const NextLinkMock = ({
      children,
      onClick,
      ...props
    }: TwigTreeLinkComponentProps) => (
      <a
        {...props}
        data-next-link="true"
        onClick={(event) => {
          event.preventDefault();
          onLeafClick();
          onClick?.(event);
        }}
      >
        {children}
      </a>
    );

    renderTree(
      [
        {
          id: "link-leaf",
          label: "Link leaf",
          href: "https://example.com",
        },
      ],
      {
        components: {
          link: NextLinkMock,
        },
      },
    );

    const leaf = screen.getByRole("treeitem", { name: "Link leaf" });
    const link = screen.getByRole("link", { name: "Link leaf" });

    leaf.focus();
    expect(leaf).toHaveFocus();

    fireEvent.keyDown(leaf, { key: " " });

    expect(onLeafClick).toHaveBeenCalledTimes(1);
    expect(link).toHaveAttribute("data-next-link", "true");
    expect(link).toHaveAttribute("target", "_self");
  });

  it("does not toggle a branch on descendant button enter or space", () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        trailing: <button type="button">Branch action</button>,
        children: [{ id: "child", label: "Child" }],
      },
    ]);

    const branch = screen.getByRole("treeitem", { name: "Branch" });
    const button = screen.getByRole("button", { name: "Branch action" });

    expect(branch).toHaveAttribute("aria-expanded", "false");

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: "Enter" });
    expect(branch).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(button, { key: " " });
    expect(branch).toHaveAttribute("aria-expanded", "false");
  });

  it("handles left and right navigation from a descendant branch control", async () => {
    renderTree([
      {
        id: "parent",
        label: "Parent",
        defaultExpanded: true,
        children: [
          {
            id: "branch",
            label: "Branch",
            trailing: <button type="button">Branch action</button>,
            children: [{ id: "child", label: "Child" }],
          },
        ],
      },
    ]);

    const branch = screen.getByRole("treeitem", { name: "Branch" });
    const parent = screen.getByRole("treeitem", { name: "Parent" });
    const button = screen.getByRole("button", { name: "Branch action" });

    button.focus();
    expect(button).toHaveFocus();
    expect(branch).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(button, { key: "ArrowRight" });
    expect(branch).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(button, { key: "ArrowLeft" });
    expect(branch).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(button, { key: "ArrowLeft" });
    await waitFor(() => expect(parent).toHaveFocus());
  });

  it("preserves native behavior for a descendant text input", async () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        trailing: <input aria-label="Branch input" defaultValue="abc" />,
        children: [
          {
            id: "child",
            label: "Child",
            onClickCallback: () => {},
          },
        ],
      },
      {
        id: "next-branch",
        label: "Next branch",
        children: [
          { id: "next-leaf", label: "Next leaf", onClickCallback: () => {} },
        ],
      },
    ]);

    const input = screen.getByRole("textbox", { name: "Branch input" });
    const branch = screen.getByRole("treeitem", { name: "Branch" });
    const nextBranch = screen.getByRole("treeitem", { name: "Next branch" });

    input.focus();
    expect(input).toHaveFocus();

    fireEvent.keyDown(input, { key: "ArrowDown" });

    expect(input).toHaveFocus();
    expect(branch).not.toHaveFocus();
    expect(nextBranch).not.toHaveFocus();
  });

  it("preserves native behavior for a descendant select", () => {
    renderTree([
      {
        id: "branch",
        label: "Branch",
        trailing: (
          <select aria-label="Branch select" defaultValue="a">
            <option value="a">A</option>
            <option value="b">B</option>
          </select>
        ),
        children: [{ id: "child", label: "Child", onClickCallback: () => {} }],
      },
    ]);

    const select = screen.getByRole("combobox", { name: "Branch select" });

    select.focus();
    expect(select).toHaveFocus();

    fireEvent.keyDown(select, { key: "ArrowDown" });

    expect(select).toHaveFocus();
  });

  it("lets a descendant checkbox keep space activation without toggling the branch", () => {
    const onChange = vi.fn();

    renderTree([
      {
        id: "branch",
        label: "Branch",
        defaultExpanded: true,
        trailing: (
          <label>
            <input
              aria-label="Branch checkbox"
              type="checkbox"
              onChange={onChange}
            />
            Checkbox leaf
          </label>
        ),
        children: [{ id: "child", label: "Child", onClickCallback: () => {} }],
      },
    ]);

    const checkbox = screen.getByRole("checkbox", { name: "Branch checkbox" });
    const branch = screen.getByRole("treeitem", { name: "Branch" });

    checkbox.focus();
    expect(checkbox).toHaveFocus();
    expect(branch).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(checkbox, { key: " " });
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(branch).toHaveAttribute("aria-expanded", "true");
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
            children: [
              {
                id: "child-a-leaf",
                label: "Child A leaf",
                onClickCallback: () => {},
              },
            ],
          },
          { id: "child-b", label: "Child B", onClickCallback: () => {} },
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
