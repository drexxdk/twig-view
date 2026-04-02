# twig-view Progress

## Current Status

Initial implementation scaffold is complete and validated.

The project currently exists as a separate sibling repository at `C:\Users\draxx\Sources\twig-view`.

## Completed

- Created a standalone React package scaffold for `twig-view`
- Added package build, demo, and test setup
- Added package entrypoint and exported types
- Implemented an initial accessible `TreeView` component
- Added roving focus and core keyboard navigation
- Added controlled and uncontrolled expansion support
- Added imperative tree handle methods:
  - `expandAll()`
  - `collapseAll()`
  - `expand(id)`
  - `collapse(id)`
  - `toggle(id)`
  - `focus(id)`
  - `getVisibleIds()`
- Added support for always-visible non-toggleable branches
- Added custom node rendering via `renderNode`
- Added custom toggle rendering via `renderToggle`
- Added device-pixel-snapped connector width logic
- Added an initial demo app
- Added initial tests for semantics, imperative control, controlled expansion, and keyboard interaction

## Current Scope Implemented

Implemented routing mode:

- `indent-vertical`

Implemented accessibility behavior:

- root `tree` role
- item `treeitem` roles
- child `group` markers
- `aria-expanded` on expandable items
- keyboard support for:
  - `ArrowUp`
  - `ArrowDown`
  - `ArrowLeft`
  - `ArrowRight`
  - `Home`
  - `End`
  - `Enter`
  - `Space`

## Validation Completed

The following succeeded:

- `npm install`
- `npm test`
- `npx tsc --noEmit`
- `npm run build`

## Important Files

- `src/components/tree-view/TreeView.tsx`
- `src/components/tree-view/tree-view.module.css`
- `src/components/tree-view/useLineWidthDpi.ts`
- `src/components/tree-view/TreeView.test.tsx`
- `src/index.ts`
- `demo/src/App.tsx`

## Next Steps

### High Priority

- Add more built-in routing modes:
  - `right-then-down`
  - `down-then-right`
  - possibly a more compact file-tree variant
- Improve connector rendering so branch continuation and end-caps look closer to the target reference
- Add selection state as a separate concern from focus and expansion
- Tighten WAI-ARIA tree behavior for richer real-world accessibility coverage

### API Refinement

- Review whether `selectedId` or `selectedIds` should be part of v1
- Decide whether to expose only a single-select tree first or support multi-select
- Confirm whether `id` should remain strictly required for every node in v1
- Review whether `loading` behavior should remain optional SSR fallback or gain more explicit SSR docs

### Styling and UX

- Add richer demo scenarios with larger toggle controls and mixed node content
- Refine default toggle visuals
- Improve default spacing tokens and line aesthetics
- Test more browser zoom levels and high-DPI displays

### Testing

- Add tests for `expandAll()` and `collapseAll()`
- Add tests for focus movement through programmatic API calls
- Add tests for non-toggleable branch edge cases
- Add tests for additional routing modes once implemented
- Add hydration-oriented tests if SSR behavior expands

## Notes

- This is a strong v0.1 foundation, not a finished package.
- The current implementation favors correctness and API direction over final visual polish.
- Future work should keep accessibility, programmatic control, and connector flexibility aligned rather than treating them as separate concerns.