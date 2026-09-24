/* scratchpath.mjs — M0-146: THE ONE SCRATCH PATH, spelled ONCE, here.
 *
 * A worker's own files — a control pen's pristine copies, a gate log, a baseline capture, a run's output — belong
 * INSIDE its worktree: the shared scratchpad is not isolated between sessions, and a log under a generic `/tmp` name
 * is another session's (`docs/development/kickoffs/WORKER.md`). Until this landed, every such file was also a file of
 * the TREE, so the gate punished the practice the kickoff commands — twice in one night, 2026-09-24:
 *   - REC-185 kept its scratch in `.rec185/` inside its worktree. Untracked and unignored, it entered the UNIVERSE
 *     that `tools/gates.mjs` §2e derives each unit's input set from, and the battery's assertion total moved
 *     19513 -> 19512 with no source change.
 *   - D-487 wrote its gate log to `bio-plane/.d487-gate.log`. The run was fully GREEN and then REFUSED TO RECORD its
 *     verdict, because D-293 binds a verdict only to a clean tree — costing a 14-minute re-run.
 * So ONE path is named, `.scratch/` at the repository root, and the three readings that punished a worker's own files
 * skip what is UNTRACKED under it: §2e's universe, the tree state §0/§4 record a verdict against, and the read trace
 * (`tools/gatetrace.mjs`) that fails a unit by name for reading outside its key. `.gitignore` carries the same one
 * path on its own line, with a comment pointing here.
 *
 * WHY THE ROOT. The estate's other repository walkers already skip a ROOT dot-directory by name — the fleet walks in
 * `bio-plane/scripts/battery.mjs` and `bio-plane/scripts/coverage.mjs` both filter `!d.startsWith(".")`, and both
 * discover suites inside a member's own `test/` rather than by a tree walk — so a root `.scratch/` cannot be enrolled
 * as a source file or as a suite by any of them. A path nested inside `bio-plane/` would have none of that.
 *
 * WHY ONE NAME AND NOT A GLOB. `.gitignore`'s standing rule (stated at `.rec84-control-pristine/`) is that a wildcard
 * would silently cover a pen nobody declared. The same argument is sharper here: a gate that ignored EVERY
 * dot-directory would hide the NEXT stray one, and the stray is what these readings exist to catch. A dot-directory
 * that is not this one is still the tree's, and still moves the count.
 *
 * WHY UNTRACKED ONLY. A file COMMITTED under `.scratch/` is a real file of the tree and is measured as one. The skip
 * covers `??` status entries and the untracked half of the universe — never a tracked path, never a tracked file's
 * modification. This module WALKS NOTHING and reads nothing, so importing it adds no reach to any unit that does.
 */
export const SCRATCH = ".scratch";
export const SCRATCH_PREFIX = `${SCRATCH}/`;
/* A repository-relative path, `/`-separated, that IS the scratch directory or lies under it. */
export const inScratch = (p) => p === SCRATCH || String(p).startsWith(SCRATCH_PREFIX);
