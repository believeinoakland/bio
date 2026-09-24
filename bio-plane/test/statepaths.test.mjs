/* statepaths.test — M0-121: the state-path predicate lives in a module that WALKS NOTHING, so a `MEASUREMENTS.md`-only
 * change stops selecting every unit that imports it (`tools/statepaths.mjs`; M0-116's residue, M-106).
 *
 * WHAT IS MEASURED, AND WHY BY COUNT. `tools/gates.mjs` selects the units that reach a changed path — a unit's own
 * files, the tools it names, and their relative imports, transitively. `isMovedPath` used to live in `tools/coord.mjs`,
 * which enumerates `docs/development/`, so every importer of `bio-plane/scripts/op-claims.mjs` (which needs only the
 * predicate) inherited that walk and a MEASUREMENTS-only landing selected it. The defect is a SELECTION COUNT, so the
 * arm that holds it counts units: it reproduces M-106's method exactly — a scratch `git clone --shared` of THIS tree
 * (HEAD plus the working tree's changes, committed in the clone), `origin/main` set to the clone's own HEAD, ONE line
 * appended to `docs/development/MEASUREMENTS.md` plus an EMPTY root file nobody names so the class reads TARGETED
 * (MEASUREMENTS alone is class DOCS and never asks MENTION), then `node tools/gates.mjs --explain`. An import path is
 * never the evidence: a `statepaths.mjs` that re-exported from `coord.mjs` would pass an import check and still walk.
 * This repository's working tree is never written; the clone is removed at the end.
 *
 * THE FIGURES, PRINTED by the M0-121 worker's run of M-106's method, 2026-09-23 (`MEASUREMENTS.md`, M0-121's entry):
 * on `f05c1efd` (before) 88 units of 345, 62 MEASUREMENTS readers, 41 of them through `tools/coord.mjs`; with this
 * change 60 units of 346, 28 readers, 5 through `tools/coord.mjs` (units that call its state readers, honestly) — the
 * one unit and reader more than 59/27 is THIS suite, which plants the ledger and so reads it, and it is also the fifth
 * reader through `coord.mjs`, which it imports to hold the re-export (the other four: ledger, owed, planning-hygiene,
 * readbudget). Arm (a) of the control reads 89 units, 63 readers, 42 through `coord.mjs` on this tree. The ceilings
 * below are those printed figures. A CEILING IS NOT A RATCHET THAT MAY DRIFT: when another landing legitimately adds a
 * MEASUREMENTS reader (a unit that names or walks it in CODE), move the ceiling to the figure this suite PRINTS, with
 * the reason at the site — never by arithmetic on the file.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/statepaths.control.mjs` from the repo root — (a) `op-claims.mjs` imports
 * `isMovedPath` from `tools/coord.mjs` again -> "a MEASUREMENTS-only change selects at most 60 units" FAILS (and the
 * through-coord ceiling); (b) THE LIAR: `statepaths.mjs` re-exports from `coord.mjs`, which holds the definitions
 * again -> the same unit-count arm FAILS by count; (c) OVER-STRICTNESS: `op-claims.mjs` imports the module by
 * namespace (`import * as`), a spelling the brief did not anticipate -> every arm must still PASS.
 * RUN 2026-09-23 by the M0-121 worker, ALL AS DECLARED (driver 23 pass, 0 fail): baseline 20/0 at 60 units; arm (a)
 * 17/3 at 89 units, 42 through coord.mjs; arm (b) 16/4 at 89 units, "imports nothing" failing too; arm (c) 20/0 at
 * 60 units. Every restore byte-identical by sha256 + cmp + size (statepaths.mjs d7c599ed…, coord.mjs 00b2a83e…,
 * op-claims.mjs 372a05d4…), and re-checked by `sha256sum -c` after the driver exited.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as S from "../../tools/statepaths.mjs";
import * as C from "../../tools/coord.mjs";
import { stripComments } from "../scripts/walkfloor.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 3;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const git = (args, cwd, input) => spawnSync("git", args, { cwd, encoding: "utf8", input, maxBuffer: 1 << 28 });

/* The printed figures (see the head). */
/* MOVED 2026-09-23 by M0-100, 60 -> 61, to the figure this suite PRINTED on the merged tree (`41c7e0c3` + M0-100): the
   one unit more is `entries.test.mjs`, which reads the frozen `MEASUREMENTS.md` by design through `tools/entries.mjs`,
   the one reader of both ledgers (29 readers, 4 through `coord.mjs`). `mintid.test`, `owed.test` and `pipeline-readers`
   now reach the file through `entries.mjs` instead of `mintid.mjs`'s own string — the same units, a different edge.
   Since M0-100 a measurement is a NEW FILE (`measurements/<id>.md`), which selects 59 units by the same method. */
/* MOVED AGAIN 2026-09-23 by M0-127, 61 -> 62 on the tree merged with M0-100, from the figure this suite PRINTED (M0-127's
   own branch printed `61 unit(s) of 350` before M0-100 reached it): the one new reader is M0-127's new suite `plane:gateverdict.test.mjs`, which imports `tools/pushguard.mjs` (the FAILED= grammar's
   reader) and so "walks docs/ in tools/pushguard.mjs" — the same reach `pushguard-check.test.mjs` already had. A
   legitimately added unit, not drift; `coord.mjs`'s reach (the subject here) is not moved by it. */
/* MOVED AGAIN 2026-09-23 by CONDUCT #16 at the merge of M0-126 with M0-127 (each branch printed 62 alone; 62 -> 63): both
   new readers are present on the merged tree, M0-127's `gateverdict.test.mjs` and M0-126's `gateresults.test.mjs`, each
   importing `tools/pushguard.mjs` and so walking docs/. The figure below is the one this suite PRINTED on the merge.
   M0-126's own note, kept: `gateresults.test.mjs` drives the guard's `gate-results` arm — a legitimate reader. */
/* MOVED AGAIN 2026-09-23 by CONDUCT #17 at c17-batch1 (63 -> 64), from the figure this suite PRINTED on the merged tree
   (`64 unit(s) of 373 selected · 31 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`); main @ 91bcea6b prints 63.
   The one new unit, found by diffing the selected lists of the two trees: D-82's `ui:agent-surfaced-inquiry.test.mjs`,
   selected as "doc-facing, and docs/development/MEASUREMENTS.md changed" — a legitimately added doc-facing UI suite,
   not a reader of the ledger (the reader list is identical, 31 on both) and not reach through `coord.mjs`. */
/* MOVED AGAIN 2026-09-23 by c17-unionfix (64 -> 67), from the figure this suite PRINTED on the train's union
   (c17-batch5 + scheduler16/integrated + bob/message-driven: `67 unit(s) of 390 selected · 32 MEASUREMENTS reader(s) ·
   4 through tools/coord.mjs`); origin/main @ 02603e88 prints 64 of 377. Three new units, found by diffing the selected
   lists of the two trees, each a NEW suite and none reaching through `coord.mjs`: D-52's `plane:exportnotice.test.mjs`
   ("names MEASUREMENTS.md in tools/entries.mjs" — it imports `tools/mintid.mjs` to mint the N-1 id, the edge
   `mintid.test` already has; the one new reader, 31 -> 32), and two doc-facing suites selected as "doc-facing, and
   docs/development/MEASUREMENTS.md changed": D-125's `plane:d125-findingmute.test.mjs` and D-278's
   `plane:d278-codeless-refusals.test.mjs`. */
/* MOVED AGAIN 2026-09-23 by D-242 (67 -> 68), from the figure this suite PRINTED on D-242's tree over origin/main
   a8f6094a (`68 unit(s) of 391 selected · 33 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`): the one new unit
   and the one new reader (32 -> 33) is D-242's new suite `mintid-take.test.mjs`, which imports `tools/mintid.mjs` to
   drive `take` — the edge `mintid.test` and `exportnotice.test` already have; nothing new reaches through `coord.mjs`. */
/* MOVED AGAIN 2026-09-24 by the D-176 worker (67 -> 68), from the figure this suite PRINTED on its branch
   (`68 unit(s) of 391 selected · 32 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`); origin/main @ 3f4b8f8c prints
   67 of 390. The one new unit, confirmed by name in `gates --explain` over a clone with MEASUREMENTS.md planted: D-176's
   NEW suite `ui:queue-allclear-limit.test.mjs`, which reads `docs/development/CIVICOS_UI_STATE.md` and so is doc-facing
   and selected as "doc-facing, and docs/development/MEASUREMENTS.md changed" — the same case as D-82's move above. Not
   a reader of the ledger (32 on both trees) and not reach through `coord.mjs`. */
/* MOVED AGAIN 2026-09-24 at integration by c19-unionfix (68 -> 74), from the figure this suite PRINTED on the union
   c19-batch9 (b23f5c946: `74 unit(s) of 416 selected · 33 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`);
   origin/main @ 15b2a4c0 prints 67 of 391 by the same method. Found by DIFFING THE SELECTED LISTS of the two trees
   (a MEASUREMENTS.md plant, `gates --explain` in a clone of each): SEVEN units are new on the union. One of them is
   already counted by the 68 above — D-242's `mintid-take.test.mjs` and D-176's `ui:queue-allclear-limit.test.mjs`
   each moved this figure 67 -> 68 on its own branch, so the union holds both. The six beyond 68, each a NEW suite:
   - D-242 / D-176, whichever of the pair the 68 did not count (both named above);
   - M0-71's `plane:contradiction-overstrict.test.mjs`, doc-facing ("doc-facing, and MEASUREMENTS.md changed");
   - D-149's `plane:d149-governing-laws.test.mjs`, doc-facing;
   - MK-6's `plane:mk6-bundle-names-no-author.test.mjs`, doc-facing;
   - REC-182's `plane:rec-182-created-tie.test.mjs`, doc-facing;
   - UI-68's `ui:review-copy.test.mjs`, doc-facing.
   The one new READER of the ledger (32 -> 33) is `mintid-take.test.mjs` (names MEASUREMENTS.md in tools/entries.mjs,
   as recorded at D-242's own move); none of the seven reaches through `coord.mjs` (4 on both trees). */
const UNITS_CEILING = 74;
const THROUGH_COORD_CEILING = 5;
const UNITS_FLOOR = 300;          /* the unit corpus (345 at `f05c1efd`): a selector narrowed to nothing is not a pass */

/* ========================================================================== */
section("ONE DEFINITION, TWO DOORS — coord.mjs re-exports the walk-free module's bindings");
{
  for (const k of ["MOVED_FILES", "MOVED_DIRS", "NEXT_RE", "isMovedPath"])
    t(`coord.mjs' ${k} IS statepaths.mjs' ${k} (the same binding, not a copy)`, C[k] === S[k] && S[k] !== undefined, true);
  const cases = [
    ["docs/development/QUEUE.md", true], ["docs/development/BACKLOG-LATER.md", true],
    ["docs/development/kickoffs/CONDUCT-NEXT.md", true], ["docs/archive/ledgers/QUEUE-cut-2026-09-22.md", true],
    ["docs/development/MEASUREMENTS.md", false], ["docs/development/kickoffs/WORKER.md", false],
    ["docs/archive/ledgersX/a.md", false],
  ];
  t("isMovedPath answers the state paths and only them", cases.map(([p]) => S.isMovedPath(p)), cases.map(([, w]) => w));
  const code = stripComments(readFileSync(join(REPO, "tools/statepaths.mjs"), "utf8"));
  t("statepaths.mjs imports nothing (its code, comments blanked; `export … from` is an import too)",
    /\bimport\b|\brequire\s*\(|\bfrom\s*["'`]/.test(code), false);
}

/* ========================================================================== */
section("THE SCRATCH CLONE CARRIES THIS TREE (so the count below is a count OF this tree)");
const SANDBOX = mkdtempSync(join(tmpdir(), "statepaths-"));
const SCR = join(SANDBOX, "clone");
const ID = ["-c", "user.email=m0121@example.invalid", "-c", "user.name=M0-121 suite"];
let built = false;
{
  const cl = git(["clone", "-q", "--shared", REPO, SCR], SANDBOX);
  t("the scratch clone was made", cl.status, 0);
  /* The working tree's changes, so a run over an uncommitted tree (a worker's, a control's arm) measures IT. */
  const diff = git(["diff", "--binary", "HEAD"], REPO);
  if (diff.stdout.trim()) t("the working tree's tracked changes apply in the clone", git(["apply", "--whitespace=nowarn"], SCR, diff.stdout).status, 0);
  const others = git(["ls-files", "--others", "--exclude-standard", "-z"], REPO).stdout.split("\0").filter(Boolean);
  for (const f of others) { mkdirSync(dirname(join(SCR, f)), { recursive: true }); copyFileSync(join(REPO, f), join(SCR, f)); }
  git([...ID, "add", "-A"], SCR);
  git([...ID, "commit", "-q", "--allow-empty", "-m", "the tree under test"], SCR);
  git(["update-ref", "refs/remotes/origin/main", "HEAD"], SCR);
  const same = ["tools/statepaths.mjs", "tools/coord.mjs", "bio-plane/scripts/op-claims.mjs"].map((f) =>
    existsSync(join(SCR, f)) && sha(readFileSync(join(SCR, f))) === sha(readFileSync(join(REPO, f))));
  t("the clone's statepaths.mjs, coord.mjs and op-claims.mjs are this tree's, byte for byte", same, [true, true, true]);
  t("the clone is clean and its origin/main is its own HEAD", [git(["status", "--porcelain"], SCR).stdout.trim(),
    git(["rev-parse", "origin/main"], SCR).stdout.trim() === git(["rev-parse", "HEAD"], SCR).stdout.trim()], ["", true]);
  built = same.every(Boolean);
}

/* ========================================================================== */
section("THE UNIT-COUNT ARM — a MEASUREMENTS-only change, M-106's method");
{
  const M = join(SCR, "docs/development/MEASUREMENTS.md");
  const pristine = built ? readFileSync(M) : Buffer.alloc(0);
  t("the planted file is the real ledger (floored at 1,000,000 bytes)", pristine.length >= 1_000_000, true);
  writeFileSync(M, Buffer.concat([pristine, Buffer.from("\nM0-121 plant: one measurement line\n")]));
  writeFileSync(join(SCR, "m0121-plant.txt"), "");
  const r = spawnSync("node", ["tools/gates.mjs", "--explain"], { cwd: SCR, encoding: "utf8", maxBuffer: 1 << 28 });
  const out = `${r.stdout}${r.stderr}`;
  const cls = (out.match(/change class (\S+)/) || [])[1] ?? null;
  const sel = out.match(/selection derived fresh — (\d+) unit\(s\) of (\d+)/);
  const units = sel ? Number(sel[1]) : -1, of = sel ? Number(sel[2]) : -1;
  const lines = out.split("\n").filter((l) => /^gates: {3}\S+ {2}<- /.test(l));
  const readers = lines.filter((l) => l.includes("<- docs/development/MEASUREMENTS.md"));
  const viaCoord = readers.filter((l) => l.includes("in tools/coord.mjs"));
  const viaPred = lines.filter((l) => l.includes("statepaths.mjs"));
  console.log(`  PRINTED: class ${cls} · ${units} unit(s) of ${of} selected · ${readers.length} MEASUREMENTS reader(s) · `
    + `${viaCoord.length} through tools/coord.mjs · ${viaPred.length} citing statepaths.mjs`);
  for (const l of viaCoord) console.log(`    through coord: ${l.replace(/^gates: +/, "")}`);
  t("gates --explain ran (exit 0)", r.status, 0);
  t("the plant reads class TARGETED (so MENTION is asked)", cls, "TARGETED");
  t(`the unit corpus is not empty (>= ${UNITS_FLOOR} units)`, of >= UNITS_FLOOR, true);
  t("the method sees a real reader: calibration.test.mjs, which names MEASUREMENTS.md in its code, is selected",
    readers.some((l) => /^gates: {3}plane:calibration\.test\.mjs /.test(l)), true);
  t(`a MEASUREMENTS-only change selects at most ${UNITS_CEILING} units (88 when the predicate lived in coord.mjs)`, units >= 0 && units <= UNITS_CEILING, true);
  t(`at most ${THROUGH_COORD_CEILING} MEASUREMENTS readers reach it through tools/coord.mjs (41 before)`, viaCoord.length <= THROUGH_COORD_CEILING, true);
  t("no unit is selected for MEASUREMENTS.md through the predicate's module", viaPred.filter((l) => l.includes("MEASUREMENTS")).length, 0);
  /* acquire.test.mjs reaches `op-claims.mjs` (through the scripts it names) and nothing else of the state layer: on
     `f05c1efd` it was selected "walks docs/development/ in tools/coord.mjs", only through the predicate's import. */
  t("acquire.test.mjs, which reached coord.mjs only through op-claims' predicate import, is NOT selected",
    lines.some((l) => /^gates: {3}plane:acquire\.test\.mjs /.test(l)), false);
}

try { rmSync(SANDBOX, { recursive: true, force: true }); } catch { /* sandbox.mjs removes the ground at exit */ }

/* ========================================================================== */
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
