# twig-view

Accessible React tree view with flexible connector lines, controlled or uncontrolled expansion, keyboard navigation, and imperative tree APIs.

## Status

Initial implementation scaffold with:

- accessible tree semantics
- roving focus and keyboard navigation
- controlled and uncontrolled expansion
- imperative tree handle
- custom node and toggle rendering
- rounded or styled connector line options
- stable styling hooks via `data-slot` attributes
- device-pixel-snapped connector line widths

## Styling

The package only ships structural tree layout and connector geometry.

- Use `renderNode` and `renderToggle` for custom content.
- Use the `line` prop to control connector width, color, radius, and style.
- Use the `toggle` prop to control default toggle background, foreground, and focus ring tokens without replacing the built-in toggle renderer.
- Target internal parts with your own CSS via `data-slot` attributes like `tree-item`, `tree-row`, `tree-toggle`, `tree-guides`, and `tree-content`.
- Toggle focus styles are exposed through CSS variables: `--tree-toggle-bg`, `--tree-toggle-foreground`, `--tree-toggle-focus-ring-color`, and `--tree-toggle-focus-ring-offset`.
- For the built-in toggle renderer, root `toggleClassName` and `toggleStyle` are merged with `node.toggleClassName` and `node.toggleStyle`, with node-level values taking precedence when they overlap.
- `renderToggle` replaces the built-in toggle icon markup. The root toggle CSS variables still exist on the tree, but class/style merging for the built-in icon no longer applies once you fully custom-render the toggle.
- If the currently focused item disappears from the visible tree, including when it is removed from `data`, focus falls back to the nearest visible enabled ancestor. If no visible ancestor exists, the tree falls back to the first visible enabled item.
- Node `id` values should be globally unique and stable across rerenders, reorders, and controlled updates. Focus recovery, imperative methods, and subtree preservation all rely on stable IDs rather than array position.
- Standard `className` and `style` props are forwarded to the tree root.

## Development

```bash
npm install
npm test
npm run build
npm run dev
```
