# Jewble Monorepo

This repository contains the Meta-Pet experience across mobile (Expo), Next.js web, and a Vite shell powered by a shared core gameplay engine.

## Packages

- `packages/core` – Platform-agnostic vitals, evolution, genome utilities, crypto adapter interfaces, RNG, and Zustand store.

## Apps

- `meta-pet` – Next.js dashboard consuming the shared core with a web-specific crypto adapter (`meta-pet/src/lib/genome/webCrypto.ts`).
- `meta-pet-mobile` – Expo app wired through light re-export shims to the shared store with persistence merging defaults.
- `apps/web-vite` – Vite + Netlify shell rendering vitals via the shared store.

## Development

Install dependencies from the workspace root (this bootstraps every app and package):

```bash
npm install
```

Workspace-level helper scripts:

```bash
# Next.js dashboard
npm run dev:web

# Vite shell
npm run dev:vite

# Expo app
npm run dev:mobile
```

### Run Next.js web app

```bash
cd meta-pet
npm run dev
```

### Run Vite shell

```bash
cd apps/web-vite
npm run dev
```

### Run Expo mobile app

```bash
cd meta-pet-mobile
npm run start
```

### Tests

Run the Vitest suite for the Next.js app:

```bash
cd meta-pet
npx vitest run
```

Manual smoke checks are recommended for the Expo and Vite applications, especially for persistence behavior.
