# Contributing

## Local setup

```bash
npm install
npm run dev
```

The demo app runs from `demo/` through Vite and is the fastest way to verify UI changes.

## Useful commands

```bash
npm run test
npm run build
npm run build:demo
npm run lint
```

Use `npm run build` before publishing package changes.

## What to include in contributions

- Keep changes focused and avoid mixing unrelated refactors with feature work.
- Add or update tests when behavior changes.
- Update `README.md` when the public API, install flow, or examples change.
- Update `CHANGELOG.md` for any user-visible package change.

## UI and accessibility expectations

- Preserve tree semantics and keyboard navigation behavior.
- Do not regress focus handling, disabled states, or async branch behavior.
- Prefer small, behavior-scoped validation steps after each change.

## Release notes

This repository currently publishes the demo through GitHub Pages and publishes the package through npm.

Before release:

1. Run `npm run test`.
2. Run `npm run build`.
3. Update `CHANGELOG.md`.
4. Confirm package metadata and README are accurate.
