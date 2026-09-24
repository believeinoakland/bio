/* statepaths — WHICH FILES ARE STATE, and nothing else: no I/O, no walk, no import (M0-121, 2026-09-23).
 *
 * THE DEFECT, MEASURED (M-106, M0-116's residue). The predicate `isMovedPath` lived in `tools/coord.mjs`, and
 * `coord.mjs` also WALKS `docs/development/` (its `queuedRefs`, its `listState`). `tools/gates.mjs` selects by what a
 * unit reaches — its own files, the tools it names, and their relative imports, transitively — so every unit that
 * imported `coord.mjs` for this one pure function (`bio-plane/scripts/op-claims.mjs`, and through it every suite that
 * imports op-claims) inherited that walk, and a `MEASUREMENTS.md`-only landing selected them all (88 units of 345 on
 * `f05c1efd`, 41 of the 62 MEASUREMENTS readers through `coord.mjs`). An import that walks nothing selects nothing
 * (`VERIFICATION.md`; `ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER" rule 1), so the predicate lives HERE,
 * in a module that enumerates no directory, and `coord.mjs` RE-EXPORTS it: one definition, two doors. An importer that
 * needs only the predicate imports this file; one that reads state imports `coord.mjs`, and inherits its walk honestly.
 *
 * KEEP IT THIS WAY. A directory-enumerating call here — or an import of `coord.mjs`, which is the same thing one hop
 * away — puts every predicate-only importer back into every docs landing's selection. `statepaths.test.mjs` counts
 * the UNITS a planted MEASUREMENTS-only change selects, not an import path, so a module that re-exports from
 * `coord.mjs` fails it by the count.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/statepaths.control.mjs` from the repo root — see that driver's head.
 */

export const MOVED_FILES = [
  "docs/development/CLAIMS.md",
  "docs/development/QUEUE.md",
  "docs/development/BACKLOG.md",
  /* M0-119 (WORK-PIPELINE §2, BOB #28): the backlog's TAIL, the same order continued. Created on `coord` by its first
     demotion (or the `rebalance` intent), so it has no pointer on `main`; `readState` finds it on the ref. */
  "docs/development/BACKLOG-LATER.md",
  /* M0-140, 2026-09-24: `docs/development/DEBT.md` WAS HERE and is gone — the DEBT construct is retired
     (Bob, 2026-09-24; WORK-PIPELINE §3). It is not state any more because it is not a file any more: its last
     three rows closed and the whole file moved to `docs/archive/ledgers/DEBT-closed.md`. The archive is still
     state through MOVED_DIRS below, so `node tools/ledger.mjs find D-n` still resolves every closed row. This
     removal is what makes the file ABSENT for `readState`: while the path was listed here, a deleted pointer
     on `main` fell through to the coord ref and the file read as present. */
  "docs/development/PLACEMENT.md",
];
export const MOVED_DIRS = ["docs/archive/ledgers"];
/* PATHS THAT WERE STATE AND ARE RETIRED — named, never silently forgotten (M0-140, 2026-09-24). A retired path is
   NOT state: `isMovedPath` is false for it, so `readState` never consults the coord ref and the file is ABSENT for
   every reader, which is the point. This list exists for the ONE act that still has to reach it — deleting the file
   from `coord`, where it physically sits — and for the reader who greps for it and deserves to be told where it
   went rather than finding nothing. `coord.mjs`' `delete` intent is the only caller. */
export const RETIRED_FILES = [
  { path: "docs/development/DEBT.md", retired: "M0-140, 2026-09-24",
    to: "docs/archive/ledgers/DEBT-closed.md",
    why: "the DEBT construct is retired whole (Bob, 2026-09-24; WORK-PIPELINE §3) — a defect now goes straight into the build plan" },
];
export const isRetiredPath = (rel) => RETIRED_FILES.some((r) => r.path === rel);
export const NEXT_RE = /^docs\/development\/kickoffs\/[A-Z][A-Z0-9-]*-NEXT\.md$/;

export const isMovedPath = (rel) =>
  MOVED_FILES.includes(rel) || NEXT_RE.test(rel) || MOVED_DIRS.some((d) => rel.startsWith(d + "/"));
