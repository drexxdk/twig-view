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
- Target internal parts with your own CSS via `data-slot` attributes like `tree-item`, `tree-row`, `tree-toggle`, `tree-guides`, and `tree-content`.
- Standard `className` and `style` props are forwarded to the tree root.

## Development

```bash
npm install
npm test
npm run build
npm run dev
```
