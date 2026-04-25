# twig-view

[![npm version](https://img.shields.io/npm/v/twig-view.svg)](https://www.npmjs.com/package/twig-view)
[![npm license](https://img.shields.io/npm/l/twig-view.svg)](https://www.npmjs.com/package/twig-view)
[![Demo](https://img.shields.io/badge/demo-live-0ea5e9)](https://drexxdk.github.io/twig-view/)
[![Deploy demo](https://github.com/drexxdk/twig-view/actions/workflows/deploy-demo.yml/badge.svg)](https://github.com/drexxdk/twig-view/actions/workflows/deploy-demo.yml)

Accessible React tree view for nested data with keyboard navigation, crisp connector lines, customizable toggles, async child loading, and slot-based styling hooks.

Use it for documentation sidebars, content outlines, file explorers, navigation trees, or any nested UI where accessibility and customization both matter.

## Why twig-view

- Accessible tree semantics and keyboard navigation are built in.
- Connector lines, spacing, toggles, and animation are configurable from the public API.
- Branches can lazy-load children on demand.
- Labels can be plain text, links, buttons, or richer React content.
- Slot hooks let you style the tree without forking the component.

## Demo and package links

- Live demo: https://drexxdk.github.io/twig-view/
- npm package: https://www.npmjs.com/package/twig-view
- GitHub repository: https://github.com/drexxdk/twig-view

## Install

```bash
npm install twig-view
```

Peer dependencies:

- `react` `^18 || ^19`
- `react-dom` `^18 || ^19`

Also works with `pnpm add twig-view` and `yarn add twig-view` if that matches your app.

## Quick start

```tsx
import { useRef } from "react";
import TwigTree, { type TwigTreeHandle, type TwigTreeItem } from "twig-view";

const items: TwigTreeItem[] = [
  {
    id: "docs",
    label: "Documentation",
    defaultExpanded: true,
    children: [
      {
        id: "guides",
        label: "Guides",
        children: [
          {
            id: "api",
            label: "API reference",
            children: [
              {
                id: "v1",
                label: "v1",
                onClickCallback: () => {
                  console.log("Open API v1");
                },
              },
            ],
          },
        ],
      },
      {
        id: "repo",
        label: "Repository",
        href: "https://github.com/drexxdk/twig-view",
        target: "_blank",
        rel: "noreferrer",
      },
    ],
  },
];

export function Example() {
  const treeRef = useRef<TwigTreeHandle>(null);

  return (
    <>
      <button type="button" onClick={() => treeRef.current?.expandAll()}>
        Expand all
      </button>

      <TwigTree
        ref={treeRef}
        items={items}
        ariaLabel="Documentation tree"
        connector={{ color: "#22c55e", radius: 12, width: 1.5 }}
        spacing={4}
        itemLayout={{ gap: 4 }}
        animation={{ duration: 220, easing: "ease", animateOpacity: true }}
        toggle={{
          size: 16,
          radius: "50%",
          labelGap: 4,
        }}
        useDefaultFocusStyles
        useDefaultActionStyles
      />
    </>
  );
}
```

## What the component supports

- Branch items with nested children and default expanded state
- Link items with custom `href`, `target`, and `rel`
- Button items with `onClickCallback`
- Async branches through `loadChildren`
- Disabled items and trailing content
- Custom link rendering through `components.link`
- Element-level customization through `slots`

## Data model

`TwigTreeItem` is a union of three item shapes:

- Branch item: `label`, optional `children`, optional `defaultExpanded`, optional `loadChildren`, optional `loadingLabel`
- Link item: `label`, `href`, optional `target`, optional `rel`
- Button item: `label`, `onClickCallback`

Every item can also define:

- `id?`
- `trailing?`
- `disabled?`

Use stable `id` values when items can move or rerender dynamically.

## Main props

- `items`: tree data to render
- `ariaLabel`: accessible label for the tree root
- `connector`: line `width`, `color`, and `radius`
- `spacing`: horizontal distance between levels
- `itemLayout`: supports `gap` for vertical spacing between items and branches. `paddingBlock` is still accepted as a backward-compatible alias.
- `toggle`: default toggle size, radius, gap, icon, and open/closed element options
- `animation`: `enabled`, `duration`, `easing`, and `animateOpacity`
- `slots`: element-level `className` and `style` hooks for `tree`, `item`, `branch`, `leaf`, `row`, `branchRow`, `leafRow`, `label`, `action`, and `children`
- `components.link`: custom link component for link items
- `useDefaultDisabledStyles`, `useDefaultFocusStyles`, `useDefaultActionStyles`, `useDefaultStatusStyles`
- `onWillOpen`, `onOpenStart`, `onOpenEnd`, `onWillClose`, `onCloseStart`, `onCloseEnd`

## Styling and customization

The package ships structural layout, connector rendering, and optional default state styles.

- Use `slots.*.className` and `slots.*.style` to target internal elements.
- Use `toggle.button`, `toggle.icon`, `toggle.open`, and `toggle.closed` to theme the built-in toggle.
- CSS custom properties are applied on the tree root for connector, spacing, toggle, and animation values.
- If you need custom link rendering, provide `components.link`.

The demo app shows richer label content, custom toggle states, and different spacing/connector combinations.

## Async child loading

For large trees or data fetched on demand, provide `loadChildren` on a branch item instead of preloading `children`.

When a branch opens, twig-view shows `loadingLabel` while `loadChildren` is pending, then caches the returned children for later expands until that item changes. If loading fails, the branch shows an inline error state and retries on the next reopen.

```tsx
const items: TwigTreeItem[] = [
  {
    id: "analytics",
    label: "Analytics",
    loadingLabel: "Loading dashboards...",
    loadChildren: async () => {
      const response = await fetch("/api/tree/analytics");
      return response.json();
    },
  },
];
```

## Imperative controls

Attach a ref when you need to focus, expand, or inspect tree state from outside the component.

```tsx
import { useRef } from "react";
import TwigTree, { type TwigTreeHandle } from "twig-view";

const treeRef = useRef<TwigTreeHandle>(null);

treeRef.current?.focus("docs");
treeRef.current?.expand("docs");
treeRef.current?.collapse("docs");
treeRef.current?.toggle("docs");
treeRef.current?.expandAll();
treeRef.current?.collapseAll();
treeRef.current?.getExpandedIds();
treeRef.current?.getVisibleIds();
```

- `focus(itemId)`: moves focus to a visible item and returns whether it succeeded
- `expand(itemId)`, `collapse(itemId)`, `toggle(itemId)`: control a single branch by item id and return whether an action was applied
- `expandAll()` and `collapseAll()`: return the number of branches changed
- `getExpandedIds()` and `getVisibleIds()`: return the current branch and visible item ids

Use stable item `id` values for any tree you plan to control imperatively.

## Compatibility

- React 18 and 19
- TypeScript support through shipped declaration files
- ESM package output

## Development

```bash
npm install
npm run dev
npm test
npm run build
npm run build:demo
```

- `npm run dev` starts the demo app from `demo/`
- `npm run build` builds the package library into `dist/`
- `npm run build:demo` builds the GitHub Pages demo into `demo/dist/`

## Changelog and contributing

- Changelog: see `CHANGELOG.md`
- Contributing guide: see `CONTRIBUTING.md`

## GitHub Pages

The repository includes a Pages workflow that builds the Vite demo and deploys `demo/dist` to GitHub Pages on pushes to `main`.
