# React + TypeScript best practices for this repo

Grounded in what this codebase already does (React 19, TS 6 strict mode, Vite, Tailwind v4, `@tanstack/react-query`, `zustand`) — not generic advice. Follow the existing patterns in `src/` before reaching for something new.

## Components

- **Function components only**, typed via inline prop destructuring — `function Foo({ a, b }: { a: string; b: number })` for small components (see `ProviderRow` in `src/components/ProviderPanel.tsx`), or a named `interface`/`type` above the component when props are reused or exceed ~3-4 fields (see `SearchBarProps` in `src/components/SearchBar.tsx`). Don't use `React.FC`.
- Keep **pages** (`src/pages/`) as the layer that owns data fetching (`useQuery`) and route-local state (search text, filters); keep **components** (`src/components/`) presentational and reusable, taking data via props. `MovieCard` is a partial exception — it reads directly from the zustand store via `useIsInWatchlist`/`useWatchlist` because watchlist membership is genuinely global UI state, not something worth prop-drilling through every list.
- Co-locate a component's tiny helper subcomponents in the same file when they're only ever used there and have no independent reason to exist (see `ProviderRow` inside `ProviderPanel.tsx`) — don't create a file per trivial subcomponent.

## Types

- Centralize shared domain types in `src/types/index.ts` (TMDB shapes, `WatchlistEntry`, etc.) rather than colocating with usage — this repo treats types as a shared contract between `lib/`, `store/`, `pages/`, and `components/`.
- Prefer `type` for unions and object shapes describing data (`WatchStatus`, `Movie`); prefer `interface` for component props and store shapes that might be extended. Match whichever the neighboring code already uses rather than mixing conventions in one file.
- Avoid `any`. When a TMDB/Archive response is genuinely untyped at a boundary (see `searchArchive`'s `data?.response?.docs` in `src/lib/archive.ts`), narrow with `as` at the single point of entry and let everything downstream be fully typed — don't let `any` leak past that boundary.
- Let TypeScript infer return types for local functions and hooks; only annotate return types on exported functions where the inferred type would be misleading or where you want it enforced as a contract (e.g. `useIsInWatchlist(movieId: number): boolean` in `src/store/watchlist.ts`).

## Data fetching (`@tanstack/react-query`)

- One `queryFn` per concern, defined as a thin wrapper in `src/lib/*.ts` — never call `fetch` directly inside a component. Query keys are plain arrays colocated with the `useQuery` call (`['providers', movieId]`), not centralized in a constants file; keep it that way unless key collisions actually become a problem.
- Set `enabled` to skip a query rather than branching around calling the hook at all (see `trending` query in `src/pages/Discover.tsx` — `enabled: !isSearching`). Hooks must always run; don't conditionally call `useQuery`.
- Use `placeholderData: keepPreviousData` for anything driven by a debounced search input, so the UI doesn't flash to a loading state on every keystroke once the first result has loaded.
- Global defaults (`staleTime`, `retry`, `refetchOnWindowFocus`) belong on the single `QueryClient` in `src/main.tsx`, not per-query — only override per-query when a specific query genuinely needs different behavior (see the 24h `staleTime` on provider data in `ProviderPanel.tsx`, since watch-provider lists barely change).

## State management (`zustand`)

- Reach for a zustand store only for state that's genuinely global and needs to persist or be read from unrelated parts of the tree (the watchlist). Local UI state (search text, filter selection, "which item is playing") stays as `useState` in the owning page — don't move it into the store just because a store exists.
- Write **selector hooks**, not raw store access, for anything derived or filtered — see `useIsInWatchlist` and `useStatusCounts` in `src/store/watchlist.ts`. This keeps components re-rendering only when the slice they actually care about changes, instead of on every store mutation.
- **Any selector that returns a newly-constructed object or array must be wrapped in `useShallow`** from `zustand/react/shallow`. Without it, `useSyncExternalStore` sees a "new" reference on every read and can infinite-loop into a blank screen — this shipped as a real bug in `useStatusCounts` and was fixed by adding `useShallow`. A selector returning a primitive or an existing reference (e.g. `s.entries`) doesn't need it.
- Keep store actions (`add`, `remove`, `update`, `toggle`) inside the `create()` callback as plain functions using `set`/`get`; don't scatter store-mutation logic into components.

## Styling (Tailwind v4)

- Use the `cn()` helper from `src/utils/format.ts` for any conditional class list — never string-template classes by hand or use array `.join(' ')` inline.
- Brand colors are defined once via `@theme` in `src/index.css` (`--color-brand-navy`, `--color-brand-teal`, etc.) and consumed as `bg-brand-navy`, `text-brand-teal`, etc. Add new brand colors there, not as one-off hex values in `className`.
- Keep responsive/interactive variants (`sm:`, `hover:`, `group-hover:`) inline in the JSX `className` — this codebase doesn't extract component-level CSS or use CSS modules.

## Testing

- **Vitest + React Testing Library** for component/unit tests (colocated `*.test.tsx` next to the file under test), **Playwright** for e2e (`tests/*.spec.ts`) — see `claude/CLAUDE.md`'s Testing section for the split and its gotchas. Don't add a third testing approach without a real reason.
- Query by role/text/label (`getByRole`, `getByPlaceholderText`) over test IDs or class-name selectors, in both RTL and Playwright specs — matches how this repo's existing tests are written and keeps tests resilient to styling changes.
- When a test touches the real zustand store, reset it explicitly in `beforeEach` (`useWatchlist.setState({ entries: [] })`) — it's a module-level singleton shared across the test file, not isolated per-test automatically.

## General

- Run `npm run build` (which runs `tsc -b` before `vite build`) before considering a change done — this repo has no separate typecheck script, and CI/deploy will fail on type errors even if `vite dev` looks fine.
- Prefer small, focused pure functions in `src/utils/` (see `format.ts`: `yearOf`, `formatDate`, `toPercent`, `scoreColor`) over inlining formatting logic in JSX — makes them independently testable and reusable across pages.
