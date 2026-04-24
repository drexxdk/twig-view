# twig-view

Accessible React tree view for nested data with keyboard navigation, configurable connector lines, customizable toggles, async child loading, and slot-based styling hooks.

## Demo

Live demo: https://drexxdk.github.io/twig-view/

## Install

```bash
npm install twig-view
```

Peer dependencies:

- `react` `^18 || ^19`
- `react-dom` `^18 || ^19`

## Quick start

```tsx
import TwigTree, { type TwigTreeItem } from "twig-view";

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
  return (
    <TwigTree
      items={items}
      ariaLabel="Documentation tree"
      connector={{ color: "#22c55e", radius: 12, width: 1.5 }}
      spacing={4}
      itemLayout={{ paddingBlock: 2 }}
      animation={{ duration: 220, easing: "ease", animateOpacity: true }}
      toggle={{
        size: 16,
        radius: "50%",
        labelGap: 4,
      }}
      useDefaultFocusStyles
      useDefaultActionStyles
    />
  );
}
```

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
- `itemLayout`: currently supports `paddingBlock`
- `toggle`: default toggle size, radius, gap, icon, and open/closed element options
- `animation`: `enabled`, `duration`, `easing`, and `animateOpacity`
- `slots`: element-level `className` / `style` hooks for `tree`, `item`, `branch`, `leaf`, `row`, `branchRow`, `leafRow`, `label`, `action`, and `children`
- `components.link`: custom link component for link items
- `useDefaultDisabledStyles`, `useDefaultFocusStyles`, `useDefaultActionStyles`, `useDefaultStatusStyles`
- `onWillOpen`, `onOpenStart`, `onOpenEnd`, `onWillClose`, `onCloseStart`, `onCloseEnd`

## Styling

The package ships structural layout, connectors, and optional default state styles.

- Use `slots.*.className` and `slots.*.style` to target internal elements
- Use `toggle.button`, `toggle.icon`, `toggle.open`, and `toggle.closed` to theme the built-in toggle
- CSS custom properties are applied on the tree root for connector, spacing, toggle, and animation values
- If you need custom link rendering, provide `components.link`

## Development

```bash
npm install
npm run dev
npm test
npm run build
npm run build:demo
```

Notes:

- `npm run dev` starts the demo app from `demo/`
- `npm run build` builds the package library into `dist/`
- `npm run build:demo` builds the GitHub Pages demo into `demo/dist/`

## GitHub Pages

The repository includes a Pages workflow that builds the Vite demo and deploys `demo/dist` to GitHub Pages on pushes to `main`.
