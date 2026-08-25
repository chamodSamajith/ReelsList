# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Reelist — a movie discovery + personal watchlist app. React 19 + TypeScript + Vite, styled with Tailwind v4. No backend: it talks directly to two public APIs from the browser (TMDB for movie data, Internet Archive for embeddable public-domain films) and persists the user's watchlist to `localStorage`.

See @claude/best-practices/react-typescript.md for React/TypeScript conventions to follow in this codebase.

## Commands

```bash
npm run dev        # start dev server (Vite, http://localhost:5173)
npm run build      # tsc -b (typecheck) then vite build
npm run lint        # eslint .
npm run test        # vitest (component tests, watch mode)
npx vitest run       # vitest, single run
npx playwright test  # e2e tests (auto-starts the dev server via webServer config)
npx playwright test --project=chromium tests/watchlist.spec.ts   # single e2e file/browser
```

There's no separate typecheck script — `tsc -b` runs as part of `npm run build`.

## Environment

Requires `VITE_TMDB_TOKEN` in `.env.local` (a TMDB v4 read-access token). `src/lib/tmdb.ts` throws at import time if it's missing, which will break app startup, Vitest component tests that import anything touching `tmdb.ts` (e.g. `MovieCard`), and the Playwright dev server. Because Vite inlines `VITE_*` vars into the client bundle, this token is publicly visible in the built JS — acceptable for TMDB's read-only tier, but don't treat it as secret.

## Architecture

**Data flow**: pages call `@tanstack/react-query`'s `useQuery` directly against thin fetch wrappers in `src/lib/tmdb.ts` and `src/lib/archive.ts` — no separate API/service layer, no global query key constants file. Query client config (retry, staleTime, refetch-on-focus) lives in `src/main.tsx`.

**Watchlist state**: `src/store/watchlist.ts` is a single `zustand` store with the `persist` middleware (`localStorage` key `reelist-watchlist`). Two selector hooks are exported alongside the store: `useIsInWatchlist(movieId)` and `useStatusCounts()`. `useStatusCounts` must stay wrapped in `useShallow` — it builds a fresh object per call, and without shallow-equality checking that causes an infinite `useSyncExternalStore` re-render loop (this shipped as a real bug once; see git history around `store/watchlist.ts`).

**Routing**: `HashRouter` (not `BrowserRouter`) — required for GitHub Pages static hosting, where there's no server to rewrite deep links back to `index.html`. Routes are plain `/#/watchlist` style. `vite.config.ts`'s `base` must match whatever path segment the deployed site is actually served from (root `/` for a custom domain, `/RepoName/` for `username.github.io/RepoName/`) — get this wrong and every asset 404s in production while working fine in dev.

**Pages** (`src/pages/`) are route-level containers that own their own `useQuery` calls and local UI state (search text, filters); reusable presentational pieces live in `src/components/`. `src/pages/Watchlist.tsx` is the one page that reads from the zustand store instead of react-query, since watchlist data is local, not remote.

**Types**: all shared types (TMDB shapes, `WatchlistEntry`, Internet Archive doc) are centralized in `src/types/index.ts` rather than colocated with usage.

## Testing

Two separate, non-overlapping suites — don't let one runner pick up the other's files:
- **Vitest + React Testing Library** (`vite.config.ts` → `test.include: ['src/**/*.test.{ts,tsx}']`) — colocated `*.test.tsx` files next to the component/page they cover, e.g. `src/components/MovieCard.test.tsx`. Setup file at `src/test/setup.ts` imports jest-dom matchers. Tests that touch the real zustand store must reset it in `beforeEach` via `useWatchlist.setState({ entries: [] })` — it's a real module-level singleton, not something the test renderer isolates for you.
- **Playwright** (`tests/*.spec.ts`, config at `playwright.config.ts`) — full e2e against a real running dev server. `tests/helpers.ts` has `seedWatchlist()` to pre-populate `localStorage` before `page.goto`, so Watchlist e2e tests don't depend on live TMDB data. Note: seeding via `page.addInitScript` re-runs on every navigation including `page.reload()` — don't use `reload()` to assert persistence of something written *during* the test, since the init script will stomp it back to the seed value; instead assert against `localStorage` directly via `page.evaluate`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on push to `main`. The TMDB token is injected at build time from the `VITE_TMDB_TOKEN` repo secret. Feature-branch pushes and PRs do not trigger a deploy — only a push/merge to `main` does.
