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
 * (d) M0-165's arm, ADDED 2026-09-24: ONE provenance label in `textchain.test.mjs` gets its `.md` back
 * (`measured_by: "MEASUREMENTS 2026-08-03 (CPDF-9)"` -> `"MEASUREMENTS.md …"`, armed ALONE — the other three suites'
 * labels stay corrected, so the arm moves exactly one variable) -> "no unit is a MEASUREMENTS reader through a
 * basename-only provenance label" MUST FAIL NAMING the file, and "selects at most 42 units" MUST FAIL by count;
 * "the method sees a real reader" MUST NOT (`tools/entries.mjs` spells the path and is untouched).
 * RUN 2026-09-24 by the M0-165 worker, ALL FOUR ARMS AS DECLARED (driver 31 pass, 0 fail): baseline 21/0 at 42 units;
 * (a) 19/2 at 46 units, 9 through coord.mjs; (b) 18/3 at 46; (c) 21/0 at 42; (d) 19/2 at 43 units and 28 readers, the
 * label arm failing with `got ["bio-plane/test/textchain.test.mjs"]` — BY NAME, which is what the row asked for. Every
 * restore sha256-MATCH and cmp-IDENTICAL against a uniquely-named per-arm pristine copy with its byte count floored
 * (textchain.test.mjs 04dd39b6…, 68,985 B).
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
/* MOVED 74 -> 47 by M0-143 (2026-09-24), from the figure THIS suite PRINTED on its own clone of the M0-143 tree
   (`47 unit(s) of 416 selected · 33 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`), never by subtracting from
   the old number. THE REASON, and it is a narrowing rather than slack: `gates.mjs` §2 now reads a suite's own source,
   its control and the tools it names AS CODE, comments blanked — so a suite whose only `docs/` mention is in its
   prose is no longer doc-facing, and a MEASUREMENTS plant no longer sweeps it in. Estate-wide the doc-facing set
   went 72 -> 41 (plane 60 -> 37, ui 12 -> 4); `measurements/M-134.md` has the dropped list. A CEILING IS NOT A
   RATCHET: this one is left at the printed figure, with no slack bought for a future landing. */
/* RE-MEASURED AT UI-89's MERGE WITH c20-batch18 (2026-09-24) AND LEFT AT 47 — a delta on 47, and the whole of it is
   that M0-143's narrowing SUPERSEDED a move made hours earlier the same day. UI-89 had moved this 74 -> 75 on its
   own branch, correctly for the selector as it then was: its new suite `ui:statement-ack.test.mjs` mentions
   `docs/` only in its header PROSE, which made it doc-facing and swept it into a MEASUREMENTS plant. M0-143 now
   reads a suite's source AS CODE with comments blanked, so that suite is no longer doc-facing and the 75 became
   wrong rather than merely stale. The MERGED tree prints `47 unit(s) of 420 selected · 33 MEASUREMENTS reader(s) ·
   4 through tools/coord.mjs`, 20 pass / 0 fail — the corpus carries UI-89's new unit (417 -> 420 across the batch)
   and the selected set does NOT. So the figure is unchanged and no slack is bought; the superseded move is recorded
   here rather than silently dropped, because a constant that moved twice in one day and came back is exactly the
   history a later reader needs. */
/* MOVED 47 -> 45 by M0-153 (2026-09-24), from the figure THIS suite PRINTED on its own clone of the M0-153 tree
   (`45 unit(s) of 427 selected · 31 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`), never by subtracting from
   the old number. THE REASON, and it is again a narrowing rather than slack: `gates.mjs` §2b now cuts the CLOSURE'S
   OWN EDGES from a unit's code rather than its whole text, so a tool NAMED IN A COMMENT no longer enters the closure
   and no longer lends the unit everything that tool reads. The two that left are `plane:fleetbundles.test.mjs`
   (its header names `tools/gates.mjs` in the sentence saying it does NOT drive it) and `plane:hygiene.test.mjs`
   (a comment names `scripts/op-claims-ledger.mjs`); both were checked at the code. `plane:gateverdict.test.mjs`
   left and came BACK, because it really does load `tools/pushguard.mjs` — through `join(REPO, "tools",
   "pushguard.mjs")`, whose literal spelling lived only in a comment — and §2b now reads that assembled spelling too.
   A CEILING IS NOT A RATCHET: left at the printed figure, with no slack bought for a future landing. */
/* MOVED 45 -> 42 by M0-165 (2026-09-24), from the figure THIS SUITE PRINTED on its own clone of this tree
   (`42 unit(s) of 427 selected · 27 MEASUREMENTS reader(s) · 4 through tools/coord.mjs`), never by subtracting
   from the old number. THE REASON, and it is a narrowing rather than slack: four suites carried the PROVENANCE
   LABEL `measured_by: "MEASUREMENTS.md …"` in a fixture chain. `measured_by` is a free string (index.mjs' chain
   contract) saying WHERE a fidelity grade was measured — it is not a path and nothing opens it — but the gate's
   lexer keeps strings on purpose (D-301: a path is a string), so `fileHit`'s basename probe read the label as
   a read of the ledger and made `calibration`, `reextract`, `textchain` and `tier3-layer-parts` MEASUREMENTS
   readers. Dropping `.md` from the labels leaves the provenance intact (textchain's own `/MEASUREMENTS/`
   assertion on the wire still passes) and takes the edge away. THREE of the four left the selection; the
   readers fell 31 -> 27 (four labels went, and `calibration` lost its reader edge too). CALIBRATION IS STILL
   SELECTED, and that is a DELIBERATE CLOSURE rather than a miss: it really does open `docs/development/
   SCHEDULER.md` and assert on its text, so it is in DOCS' own doc-facing set, and §2's "net" bound gives every
   doc-facing unit any `docs/` change — prose is never checked more narrowly than DOCS checks it. It was in that
   set before this item too, verified in a clone of the unchanged tree. A CEILING IS NOT A RATCHET: left at the
   printed figure, with no slack bought for a future landing. */
const UNITS_CEILING = 42;
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
  /* CORRECTED by M0-165 (2026-09-24). The old assertion named `calibration.test.mjs` as "a real reader,
     which names MEASUREMENTS.md in its code" — and it was WRONG about that suite when it was written, not
     merely overtaken. `calibration.test.mjs` never read the ledger: it carried the PROVENANCE LABEL
     `measured_by: "MEASUREMENTS.md"` in a fixture chain, a data string the lexer keeps (a path is a string,
     D-301) and `fileHit`'s basename probe cannot tell from a path. So the canary for "the method still sees a
     real reader" was itself an instance of the over-selection this suite exists to bound — it would have gone
     on passing after the method stopped seeing every genuine reader, which is the one failure it must catch.
     M0-165 dropped `.md` from those labels, so the false edge is gone and the old canary can no longer hold.
     The replacement is a reader that OPENS the file: `entries.test.mjs` reaches it through `tools/entries.mjs`,
     whose `FROZEN.M.frozen` is the literal path `docs/development/MEASUREMENTS.md` handed to `readRel`'s
     `readFileSync` — this suite's own head has named it as that reader since M0-100. */
  t("the method sees a real reader: entries.test.mjs, which OPENS MEASUREMENTS.md through tools/entries.mjs, is selected",
    readers.some((l) => /^gates: {3}plane:entries\.test\.mjs /.test(l)), true);
  t(`a MEASUREMENTS-only change selects at most ${UNITS_CEILING} units (88 when the predicate lived in coord.mjs)`, units >= 0 && units <= UNITS_CEILING, true);
  t(`at most ${THROUGH_COORD_CEILING} MEASUREMENTS readers reach it through tools/coord.mjs (41 before)`, viaCoord.length <= THROUGH_COORD_CEILING, true);
  t("no unit is selected for MEASUREMENTS.md through the predicate's module", viaPred.filter((l) => l.includes("MEASUREMENTS")).length, 0);
  /* M0-165 — THE PROVENANCE-LABEL ARM, and it is written as a PROPERTY rather than as a list of four suites.
     A unit that really reads the ledger spells its PATH: `tools/entries.mjs` hands `docs/development/MEASUREMENTS.md`
     to `readRel`'s `readFileSync`. A unit that merely carries a provenance LABEL spells the BASENAME ALONE, in a
     data string — `measured_by: "MEASUREMENTS.md 2026-08-03 (CPDF-9)"`, the free string of index.mjs' chain contract
     saying where a fidelity grade was measured. The gate's lexer keeps strings on purpose (D-301: a path IS a string),
     so `fileHit`'s basename and stem probes cannot tell the two apart and read the label as a read. The discriminator
     is the spelling, not a list: BASENAME ALONE, with no path anywhere in the file's code, is a label. Four suites
     read that way before this item (calibration, reextract, textchain, tier3-layer-parts); a list of those four would
     go stale the moment a fifth is written. */
  const byName = readers.map((l) => [l, (l.match(/ names (?:MEASUREMENTS\.md|"MEASUREMENTS") in (\S+)/) || [])[1]])
    .filter(([, f]) => f);
  const labelOnly = byName.filter(([, f]) => {
    let code = null;
    try { code = stripComments(readFileSync(join(SCR, f), "utf8")); } catch { return false; }
    return !code.includes("docs/development/MEASUREMENTS.md");
  });
  console.log(`    MEASUREMENTS readers selected by basename: ${byName.length} (${byName.map(([, f]) => f).join(", ") || "none"})`);
  t("every one of them SPELLS THE PATH — no unit is a MEASUREMENTS reader through a basename-only provenance label (M0-165)",
    labelOnly.map(([, f]) => f), []);
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
