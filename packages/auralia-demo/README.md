# @metapet/auralia-demo

An archived Vite shell for experimenting with the Auralia experience. The package lives in the monorepo as a reference/demo alongside the production Next.js dashboard (`meta-pet`) and the lightweight Vite shell (`apps/web-vite`).

## Getting started

```bash
npm install
npm run dev --workspace @metapet/auralia-demo
```

## Build & lint

```bash
npm run build --workspace @metapet/auralia-demo
npm run lint --workspace @metapet/auralia-demo
```

The TypeScript configuration now extends the root tsconfig so shared path aliases and JSX settings stay consistent with the other apps.

## Notes

- The package is intended for demo/archival purposes; production work should target `meta-pet` (Next.js) or `apps/web-vite`.
- Dependencies are left in place to keep the original demo functional, but core utilities such as Auralia persistence and behavior live in shared workspaces.
