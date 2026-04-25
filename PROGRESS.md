# twig-view Progress

## Current Status

`twig-view` is now a working React package with a public `TwigTree` API, an interactive demo, release automation, and direct test coverage for keyboard behavior, imperative control, and async loading flows.

The current package surface is centered on accessible tree navigation, connector customization, slot-based styling, async child loading, and programmatic tree control.

## Completed

- Established the package, demo, build, and test setup for `twig-view`
- Published the `TwigTree` component and current exported type surface from `src/index.ts`
- Added accessible tree semantics with roving focus and keyboard navigation
- Added configurable connectors, spacing, animation, and toggle styling
- Added slot-based element customization and custom link rendering
- Added branch, link, and button item support with disabled and trailing content states
- Added async child loading with `loadingLabel`, `loadErrorLabel`, cached loaded children, and retry-on-reopen behavior
- Added imperative tree handle methods:
  - `focus(itemId)`
  - `expand(itemId)`
  - `collapse(itemId)`
  - `toggle(itemId)`
  - `expandAll()`
  - `collapseAll()`
  - `getExpandedIds()`
  - `getVisibleIds()`
- Expanded the demo to show richer labels, custom toggles, disabled states, and lazy-loading examples
- Strengthened npm/package presentation with a revised README, changelog, contributing guide, and release workflow
- Added release and demo deployment workflows in `.github/workflows/`

## Current Scope Implemented

Implemented item model:

- Branch items with nested `children`
- Branch items with `defaultExpanded`
- Link items with `href`, `target`, and `rel`
- Button items with `onClickCallback`
- Optional `id`, `trailing`, and `disabled` on all items
- Async branch loading with `loadChildren`, `loadingLabel`, and `loadErrorLabel`

Implemented accessibility behavior:

- root `tree` role
- item `treeitem` roles
- child `group` markers
- `aria-expanded` on expandable items
- `aria-disabled` handling for disabled items
- keyboard support for:
  - `ArrowUp`
  - `ArrowDown`
  - `ArrowLeft`
  - `ArrowRight`
  - `Home`
  - `End`
  - `Enter`
  - `Space`

Implemented customization surface:

- `connector` options for width, color, and radius
- `spacing` and `itemLayout.gap`
- `toggle` customization for size, radius, label gap, icon, and open/closed state styles
- `slots` for `tree`, `item`, `branch`, `leaf`, `row`, `branchRow`, `leafRow`, `label`, `action`, and `children`
- `components.link` for custom link rendering
- optional default disabled, focus, action, and status styles

## Validation Completed

Recent validation succeeded with:

- `npm run test`
- `npx vitest run src/components/TwigTree.test.tsx`
- `npm run build`

## Important Files

- `src/components/TwigTree.tsx`
- `src/components/TwigTreeBranch.tsx`
- `src/components/TwigTree.types.ts`
- `src/components/twigTree.module.css`
- `src/components/TwigTree.test.tsx`
- `src/utils/useLineWidthDpi.ts`
- `src/index.ts`
- `README.md`
- `demo/src/App.tsx`
- `.github/workflows/deploy-demo.yml`
- `.github/workflows/release-package.yml`

## Next Steps

### High Priority

- Keep expanding advanced behavior coverage in `src/components/TwigTree.test.tsx`, especially richer customization cases and deeper nested interaction paths
- Continue evolving the demo into a stronger public showcase with clearer, named real-world examples
- Review `PROGRESS.md` alongside future feature work so it stays aligned with the shipped surface instead of drifting behind the repo
- Keep the README as the primary complete document for now rather than splitting docs prematurely

### Product and API Follow-up

- Decide whether selection state belongs in the public API, and if so whether v1 should be single-select first
- Review whether additional imperative helpers are needed beyond the current handle methods
- Evaluate whether async loading needs more customization beyond the current label-based loading and error states

### Styling and UX

- Refine default toggle visuals and default status treatments
- Continue validating connector rendering and spacing at more zoom levels and DPI settings
- Add more showcase patterns such as file-explorer-like trees and content-outline examples

### Distribution and Adoption

- Keep the README optimized for conversion while it remains the single complete document
- Add runnable example templates or example repos beyond the live demo
- Publish comparison/tutorial content once the showcase surface is stronger
- Track npm/download and GitHub usage signals after each release cycle

## Notes

- The old `TreeView`/routing-mode notes in this file no longer describe the current implementation and have been removed.
- The current package is already usable and publishable, but there is still room to deepen examples, polish defaults, and expand advanced-state coverage.
- Accessibility, programmatic control, async behavior, and visual connector quality should continue to evolve together rather than as isolated features.
