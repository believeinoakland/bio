/* M0-100 — ONE FILE PER NEW MEASUREMENT AND INTERFACE-CHANGE ENTRY; `MEASUREMENTS.md` and `INTERFACE-CHANGES.md` FROZEN
 * HISTORY; ONE READER (`tools/entries.mjs`) for both. Design: `docs/development/ORCHESTRATION.md` §"THE RECORD IS
 * PARTITIONED BY WRITER" rule 3, narrowed by BOB #27 to these two files (`TREE-SHARING.md` §1), under M0-111's train.
 *
 * ACCEPTS WHEN (the row): two `land/*` branches each adding a measurement land in ONE train with NO conflict; every
 * reader's counts over the frozen history are unchanged.
 *
 * HOW A LIAR PASSES IT, STATED BEFORE WHAT IT CHECKS: `merge=union` on the old files — the train then lands two tail
 * appends with no conflict, and a displaced line hides inside the union. So the train arm asserts EACH ENTRY IS WHOLE
 * IN ITS OWN FILE (the merged blob byte-identical to its lane's), and the liar is DRIVEN on a fixture of its own: it
 * lands with no conflict and `audit()` names both entries it put in the frozen file. "No conflict" alone is its word.
 * And a reader that still reads only the frozen file answers every count over the frozen history unchanged — so each
 * reader's arm plants an entry that exists ONLY in its own file and asserts that reader sees it.
 *
 * WHY FIXTURES: the train arms push and merge, so they run against a throwaway bare remote in the OS temp dir with the
 * REAL `train.mjs`, `gates.mjs` and `pushguard.mjs` copied in (only the steps the gate RUNS are stubs, as in
 * `train.test.mjs`); never this repository's remote. The reader arms read a planted repo in the temp dir; the live arms
 * read this tree and write nothing.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/entries.control.mjs` from the repo root, each arm ALONE against pristine
 * copies restored by sha256 AND `cmp` —
 *   (1) `mintid`'s M corpus pointed back at the frozen file alone (`...entryCorpus("M")` -> the old path) ->
 *       "mintid: a measurement in its own file raises the M floor" FAILS; the frozen-history counts stay green;
 *   (2) `mintid`'s allocation corpus stops expanding the entry directory -> "mintid: the SAME id in the frozen file and
 *       its own file is a DUPLICATE" FAILS; the floor arm stays green;
 *   (3) `ledger.mjs find` stops asking the reader -> "ledger.mjs find answers a measurement in its own file" FAILS;
 *   (4) `audit()`'s whole-in-its-own-file check dropped (a file's foreign headings ignored) -> "a file holding another
 *       entry's heading FAILS" FAILS; the train's no-conflict arm and the liar arm stay green.
 *   RUN 2026-09-23 by the M0-100 worker, all four AS DECLARED: baseline 58 pass / 0 fail; each arm alone, every declared
 *   must-stay-green assertion green and the collateral assertion never red; failing counts per arm 3, 2, 2, 1; driver
 *   37 pass / 0 fail, every restore byte-identical by sha256 and `cmp`, closing 58 / 0, pen removed. ARM (1)'s run found
 *   one more red than it declared: "an entry file's heading is an ALLOCATION SITE" fails with it too — the allocation
 *   read and the floor read share the corpus the arm re-pointed, so a reader of the old file alone loses both.
 */
/* NEGATIVE CONTROL: RAN 2026-09-24 by the M0-154 worker, by hand, over the DERIVED fixture copy list
 * (`test/gatedeps.mjs`). Declared before arming; each arm ALONE, the other three suites held open; every
 * restore by `cp` from a uniquely-named pristine copy, verified by sha256 AND `cmp` AND a byte count.
 *   BASELINE (this tree, before the arms): entries.test.mjs 58 pass / 0 fail before this item's added assertion, 59 after.
 *   (A1) ACCEPTS-WHEN — `tools/m0154probe.mjs` added and imported by `tools/gates.mjs`. MUST NOT fail:
 *        all four suites GREEN, each fixture's printed `gatedeps:` list one file longer. ACTUAL: green
 *        (gates 96/0, gateresults 52/0, entries 59/0, train 53/0), every list carrying `tools/m0154probe.mjs`.
 *   (A2) THE CONTROL THE ROW NAMES — A1 still armed, and `gates.test.mjs`'s HAND copy list restored verbatim.
 *        MUST fail, BY NAME, at "the fixture carries the REAL … (DERIVED)". ACTUAL (in `gates.test.mjs`,
 *        the suite armed): 24 pass / 72 fail, that assertion first and naming the file —
 *        `want [true,true,true,[]] got [true,true,true,["tools/m0154probe.mjs"]]`.
 *   (A2') A FINDING ABOUT THE ARM, not smoothed: A2's FIRST run threw `ENOENT` out of the assertion and
 *        ended the module with NO TALLY AT ALL — a control that dies proves nothing (`kickoffs/WORKER.md`).
 *        `missingFrom` below is that correction; A2 as recorded is the re-run against it.
 *   (A3) OVER-STRICTNESS — the same import written three ways the derivation was not written against:
 *        `await import("./m0154probe.mjs")`, `export { … } from "./m0154reexport.mjs"`, and an
 *        `import … from "./m0154absent.mjs"` inside a COMMENT whose target EXISTS on disk. MUST pass, and
 *        MUST copy the first two and NOT the third. ACTUAL: exactly that; gates 96/0, entries 59/0.
 *   (A4) THE HELPER'S OWN REFUSALS, driven directly: a `without` naming a file outside the closure THROWS
 *        (a stale exclusion cannot outlive its import); a missing root THROWS; `const IMPORT_RE` renamed in
 *        a scratch copy of `tools/gates.mjs` THROWS naming the line. All three as declared.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import * as E from "../../tools/entries.mjs";
import { corpusFloor, allocations } from "../../tools/mintid.mjs";
import { install } from "../../tools/pushguard.mjs";
import { gateDeps } from "./gatedeps.mjs";     /* M0-154: the fixture's copy list is DERIVED, never kept by hand */

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
/* M0-154 · WHAT THE FIXTURE CARRIES, DERIVED FROM `tools/gates.mjs`'s OWN IMPORTS, transitively, by the
   ONE shared helper — never a hand list here, which is the D-93 defect and cannot fail when it falls
   behind (`gates.mjs` loads each of these under a `try` and DEGRADES rather than crashing, so a missing
   copy silently weakens every assertion below). ONE derived dependency is deliberately NOT carried,
   `tools/gateresults.mjs`, and `without` is checked against the closure so the exclusion cannot outlive
   the import it names. Both reasons MEASURED 2026-09-24: (1) its mere PRESENCE turns the per-unit record
   on — `PER_UNIT_ON` in `gates.mjs` is `isFile(tools/gateresults.mjs)` — armed, this suite stayed green, so the exclusion rests on (2) alone. (2) this suite hands the
   fixture's gate `process.env` whole, so under a real outer gate the fixture would inherit
   `BIO_GATE_RESULTS_REMOTE` and write its own PASS records to the OUTER gate's results remote: the
   incident `gateresults.test.mjs` records against itself, which only its `CLEAN_ENV` prevents. */
const GATE_DEPS = gateDeps({ repo: REPO, roots: ["tools/gates.mjs", "tools/train.mjs"], without: ["tools/gateresults.mjs"] });
console.log(`gatedeps: entries.test.mjs fixture carries ${GATE_DEPS.length} derived file(s) — ${GATE_DEPS.join(", ")}`);
/* A FILE THE FIXTURE LACKS MUST FAIL AN ASSERTION, NEVER THROW PAST ONE. Found by this item's own control
   arm (M0-154, 2026-09-24): the first draft compared with a bare `readFileSync` on both sides, so a fixture
   missing a derived file ended the module with an ENOENT and NO TALLY AT ALL — a control that "fails" by
   dying proves nothing about the assertion, and `kickoffs/WORKER.md` records the same shape as a suite whose
   count reads clean. It reports the offending paths BY NAME instead. */
const missingFrom = (dir) => GATE_DEPS.filter((p) => {
  try { return !readFileSync(join(dir, p)).equals(readFileSync(join(REPO, p))); } catch { return true; }
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

const SANDBOX = mkdtempSync(join(tmpdir(), "entries-"));
const put = (root, rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
const M = E.KINDS.M, IC = E.KINDS.IC;

/* A planted ledger pair: a frozen M file with prose, two numbered entries out of order and the one legacy heading
   shape; a frozen IC file with one entry. Its freeze is { M: max 3, 2 sites; IC: max 2, 1 site }. */
const FX_FROZEN = { M: { max: 3, sites: 2 }, IC: { max: 2, sites: 1 } };
const frozenM = () => ["# Measurements", "", E.frozenMark("M"), "", "## Runtime limits", "", "a table", "",
  "## M-3 · 2026-09-01 · the third", "", "three", "", "## M-1 · 2026-08-01 · the first", "", "one", "",
  "## 2026-08-08 · M-4 — the legacy heading shape", "", "four", ""].join("\n");
const frozenIC = () => ["# Interface change proposals", "", E.frozenMark("IC"), "", "## The protocol", "", "steps", "",
  "## IC-2 · I3: a change · PROPOSED", "", "### 1 · PROPOSED", "", "proposed", ""].join("\n");
function planted(name, { files = {} } = {}) {
  const root = join(SANDBOX, name);
  put(root, M.frozen, frozenM());
  put(root, IC.frozen, frozenIC());
  for (const [rel, body] of Object.entries(files)) put(root, rel, body);
  return root;
}
const fails = (root, extra = {}) => E.audit({ repo: root, frozen: FX_FROZEN, admit: [], ...extra }).fails;

/* ========================================================================== */
section("THE LIVE TREE — the frozen history is unchanged and whole, and the layout holds");
{
  const a = E.audit();
  for (const n of a.notes) console.log(`  ${n}`);
  t("the live tree passes the entries audit (the freeze, the head lines, every entry file)", a.fails, []);
  for (const kind of ["M", "IC"]) {
    const k = E.KINDS[kind];
    const r = E.read(kind);
    const frozenText = readFileSync(join(REPO, k.frozen), "utf8");
    const sites = [...frozenText.matchAll(new RegExp(`^##\\s+${kind}-(\\d+)\\s+·`, "gm"))].length;
    const admitted = E.ADMITTED.filter((x) => new RegExp(`^##\\s+${x.id}\\s+·`, "m").test(frozenText)).length;
    console.log(`  ${kind}: ${r.entries.length} entries read — ${r.entries.filter((e) => e.source !== "file").length} from ${k.frozen}, `
      + `${r.entries.filter((e) => e.source === "file").length} in ${k.dir}/ · ${r.unnumbered} unnumbered section(s) · unreadable ${r.unreadable.length}`);
    t(`${kind}: the reader yields EVERY frozen entry — ${E.FROZEN[kind].sites} at the freeze${admitted ? ` plus ${admitted} admitted` : ""}`,
      r.entries.filter((e) => e.source !== "file").length, E.FROZEN[kind].sites + admitted);
    t(`${kind}: ...the frozen file's allocation sites are the freeze's (the history's count is unchanged)`, sites, E.FROZEN[kind].sites + admitted);
    t(`${kind}: ...in id order`, r.entries.every((e, i) => i === 0 || r.entries[i - 1].n <= e.n), true);
    t(`${kind}: ...and every file in ${k.dir}/ is an entry the reader yields`,
      E.entryFiles(kind).every((f) => r.entries.some((e) => e.parts.some((p) => p.file === f))), true);
    t(`${kind}: the generated single-file view opens with the frozen file byte for byte`, E.view(kind).startsWith(frozenText), true);
    t(`${kind}: the frozen file carries its head line`, frozenText.includes(E.frozenMark(kind)), true);
  }
  t("the floor of the frozen history is non-empty (a reader of nothing passes every count)",
    [E.read("M").entries.length > 80, E.read("IC").entries.length > 150], [true, true]);
}

/* ========================================================================== */
section("THE READER — frozen and new entries in id order, a continuation joined, an absent directory empty");
const FX = planted("fx", { files: {
  [`${M.dir}/M-7.md`]: "## M-7 · 2026-09-23 · a new measurement in its own file\n\nseven\n",
  [`${IC.dir}/IC-2.md`]: "### IC-2 · RESOLUTION\n\nresolved, appended to the frozen entry's own file\n",
  [`${IC.dir}/IC-5.md`]: "## IC-5 · I3: a new change · PROPOSED\n\nfive\n",
} });
{
  const m = E.read("M", { repo: FX });
  t("M ids in id order across both places", m.entries.map((e) => e.id), ["M-1", "M-3", "M-7"]);
  t("...each from where it is", m.entries.map((e) => `${e.source}:${e.parts[0].file}:${e.parts[0].line}`),
    [`frozen:${M.frozen}:13`, `frozen:${M.frozen}:9`, `file:${M.dir}/M-7.md:1`]);
  t("...and what the grammar cannot read is COUNTED, not dropped (the prose section and the legacy heading)", m.unnumbered, 2);
  const ic = E.read("IC", { repo: FX });
  t("IC: a frozen entry and its continuation file are ONE entry, joined in order", ic.entries.map((e) => [e.id, e.source, e.parts.length]),
    [["IC-2", "frozen+file", 2], ["IC-5", "file", 1]]);
  t("...its text runs from the frozen heading through the appended RESOLUTION",
    /^## IC-2 ·[\s\S]*### 1 · PROPOSED[\s\S]*### IC-2 · RESOLUTION/.test(ic.entries[0].text), true);
  t("find() answers one entry by id, and nothing for an absent one",
    [E.find("IC-2", { repo: FX }).length, E.find("M-7", { repo: FX })[0].parts[0].file, E.find("M-99", { repo: FX })], [1, `${M.dir}/M-7.md`, []]);
  t("kindOf() places each path", [E.kindOf(M.frozen), E.kindOf(`${IC.dir}/IC-5.md`), E.kindOf(`${M.dir}/sub/M-1.md`), E.kindOf("docs/x.md")],
    [{ kind: "M", part: "frozen" }, { kind: "IC", part: "entry" }, null, null]);
  t("the single-file view is the frozen text, then each file in id order", E.view("M", { repo: FX }).split("<!-- ").length, 2);
  const bare = planted("bare");
  t("an ABSENT entry directory reads as empty, never as unreadable", [E.read("M", { repo: bare }).entries.length, E.read("M", { repo: bare }).unreadable], [2, []]);
  t("the planted fixture passes the audit under its own freeze", fails(FX), []);
}

/* ========================================================================== */
section("EVERY READER SEES AN ENTRY THAT EXISTS ONLY IN ITS OWN FILE");
{
  const fm = corpusFloor("M", { repo: FX });
  t("mintid: a measurement in its own file raises the M floor", [fm.floor, fm.allocFloor], [7, 7]);
  const fi = corpusFloor("IC", { repo: FX });
  t("mintid: ...and an interface change in its own file raises the IC floor", [fi.floor, fi.allocFloor], [5, 5]);
  const am = allocations("M", { repo: FX });
  t("mintid: an entry file's heading is an ALLOCATION SITE, by repo-relative path and line",
    am.sites.filter((s) => s.id === "M-7").map((s) => `${s.file}:${s.line}`), [`${M.dir}/M-7.md:1`]);
  const DUP = planted("dup", { files: { [`${M.dir}/M-3.md`]: "## M-3 · 2026-09-23 · a second M-3, the allocator bypassed\n" } });
  t("mintid: the SAME id in the frozen file and its own file is a DUPLICATE", allocations("M", { repo: DUP }).duplicates.map((d) => d.id), ["M-3"]);

  /* Through the CLI a session runs (`CLAUDE.md` §1's table), on this tree: an M id that exists only in its own file. */
  const own = E.entryFiles("M")[0];
  t("(this tree carries at least one measurement in its own file)", typeof own === "string", true);
  if (own) {
    const id = own.slice(M.dir.length + 1, -3);
    const r = spawnSync(process.execPath, [join(REPO, "tools/ledger.mjs"), "find", id], { cwd: REPO, encoding: "utf8" });
    t(`ledger.mjs find answers a measurement in its own file (${id})`, [r.status, r.stdout.includes(`${own}:1`)], [0, true]);
  }
  const fz = spawnSync(process.execPath, [join(REPO, "tools/ledger.mjs"), "find", "IC-178"], { cwd: REPO, encoding: "utf8" });
  t("ledger.mjs find answers a FROZEN interface change too", [fz.status, fz.stdout.includes(`${IC.frozen}:`)], [0, true]);

  /* The walkers read every file under their roots, so they see a new entry file without naming it; asserted, not assumed. */
  if (own) {
    const { corpus: decidedCorpus } = await import("../../tools/decided.mjs");
    t("decided.mjs walks the new entry file", decidedCorpus().includes(join(REPO, own)), true);
    const { corpusFiles } = await import("../../tools/attribution.mjs");
    t("attribution.mjs walks the new entry file", corpusFiles().includes(own), true);
    const { coverage } = await import("../../tools/corpuscheck.mjs");
    const cov = coverage();
    t("corpuscheck classifies the new entry file (excluded as a ledger, never unclassified)", [cov.excluded.includes(own), cov.unclassified], [true, []]);
  }
  /* plancheck self-executes and cannot be imported; its two sites are pinned at the code, and `audit()` itself is
     driven above and below. */
  const pc = readFileSync(join(REPO, "tools/plancheck.mjs"), "utf8");
  t("plancheck §2e runs the entries audit, and §10 exempts a measurement entry as it exempts the frozen file",
    [/E\.audit\(\{ repo: ROOT \}\)/.test(pc), /EK\(f\)\?\.kind === "M"/.test(pc)], [true, true]);
}

/* ========================================================================== */
section("THE FREEZE — each way a frozen file or an entry file goes wrong FAILS by name");
{
  const add = (root, rel, text) => writeFileSync(join(root, rel), readFileSync(join(root, rel), "utf8") + text);
  const A1 = planted("f1"); add(A1, M.frozen, "## M-9 · 2026-09-23 · appended the old way\n\nnine\n");
  t("an entry APPENDED to a frozen file FAILS naming it", fails(A1).some((f) => f.includes("NEW ENTRY IN A FROZEN FILE — M-9")), true);
  t("...unless it is ADMITTED by id (a branch cut before the freeze)", fails(A1, { admit: [{ id: "M-9", why: "fixture" }] }), []);
  const A2 = planted("f2"); add(A2, M.frozen, "## M-2 · 2026-09-23 · a low id added to the frozen file\n");
  t("a new entry under a LOW id in a frozen file FAILS (the sites moved)", fails(A2).some((f) => f.includes("allocation sites moved")), true);
  const A3 = planted("f3", { files: { [`${M.dir}/M-7.md`]: "## M-7 · 2026-09-23 · seven\n\nseven\n## M-8 · 2026-09-23 · eight, displaced into seven\n" } });
  t("a file holding another entry's heading FAILS — each entry is WHOLE IN ITS OWN FILE",
    fails(A3).some((f) => f.includes("M-8") && f.includes("WHOLE IN ITS OWN FILE")), true);
  const A4 = planted("f4", { files: { [`${M.dir}/notes.md`]: "# notes\n" } });
  t("a file in the entry directory that is not `<id>.md` FAILS", fails(A4).some((f) => f.includes("not an entry file")), true);
  const A5 = planted("f5"); writeFileSync(join(A5, M.frozen), frozenM().replace(E.frozenMark("M"), ""));
  t("a frozen file whose head line was dropped FAILS", fails(A5).some((f) => f.includes("head line")), true);
  const A6 = planted("f6", { files: { [`${IC.dir}/IC-2.md`]: "## IC-2 · I3: a second allocation · PROPOSED\n" } });
  t("a continuation of a frozen entry that ALLOCATES its id again FAILS", fails(A6).some((f) => f.includes("continues it and must not allocate")), true);
  const A7 = planted("f7", { files: { [`${M.dir}/M-7.md`]: "some prose first\n## M-7 · 2026-09-23 · seven\n" } });
  t("an entry file that does not OPEN with its own heading FAILS", fails(A7).some((f) => f.includes("opens with its own heading")), true);

  /* carry: what a branch cut before the freeze runs after rebasing. */
  const C1 = planted("c1");
  const before = readFileSync(join(C1, M.frozen), "utf8");
  add(C1, M.frozen, "## M-9 · 2026-09-23 · nine\n\nnine body\n\n## M-10 · 2026-09-23 · ten\n\nten body\n");
  const fs = await import("node:fs");
  const moved = E.carry({ repo: C1, write: fs, frozen: FX_FROZEN, admit: [] });
  t("carry moves each entry past the freeze into its own file", moved.map((m) => m.file), [`${M.dir}/M-9.md`, `${M.dir}/M-10.md`]);
  t("...verbatim", [readFileSync(join(C1, M.dir, "M-9.md"), "utf8"), readFileSync(join(C1, M.dir, "M-10.md"), "utf8")],
    ["## M-9 · 2026-09-23 · nine\n\nnine body\n", "## M-10 · 2026-09-23 · ten\n\nten body\n"]);
  t("...and the frozen file is back to its frozen bytes", readFileSync(join(C1, M.frozen), "utf8"), before);
  t("...so the audit passes", fails(C1), []);
}

/* ========================================================================== */
/* THE TRAIN, driven for real: `train.test.mjs`'s fixture, lean — the real train, gate and guard, stubbed steps. */
let tick = 0;
const git = (args, cwd, env = {}) => spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...env } });
const out1 = (args, cwd) => git(args, cwd).stdout.trim();
const commitAll = (root, msg) => {
  tick++;
  const when = `2026-09-23T12:${String(Math.floor(tick / 60)).padStart(2, "0")}:${String(tick % 60).padStart(2, "0")}Z`;
  git(["add", "-A"], root);
  return git(["commit", "-q", "-m", msg], root, { GIT_COMMITTER_DATE: when, GIT_AUTHOR_DATE: when });
};
const ident = (root) => {
  git(["config", "user.email", "m0100@example.invalid"], root);
  git(["config", "user.name", "M0-100 suite"], root);
  git(["config", "commit.gpgsign", "false"], root);
};
const stub = () => "process.exit(0);\n";
function fixture(name, extra = {}) {
  const seed = join(SANDBOX, `${name}-seed`);
  for (const p of GATE_DEPS) put(seed, p, readFileSync(join(REPO, p)));
  const files = {
    "tools/plancheck.mjs": stub(),
    "bio-plane/package.json": `${JSON.stringify({ name: "fixture-plane", private: true, type: "module", scripts: { "test:battery": "node scripts/battery.mjs" } })}\n`,
    "bio-plane/scripts/battery.mjs": stub(), "bio-plane/scripts/coverage.mjs": stub(),
    "bio-plane/test/unrelated.test.mjs": stub(), "civicos-ui/test/run.mjs": stub(),
    "CLAUDE.md": "# fixture\n", ".gitignore": "node_modules/\n",
    [M.frozen]: frozenM(), [IC.frozen]: frozenIC(), ...extra,
  };
  for (const [rel, body] of Object.entries(files)) put(seed, rel, body);
  git(["init", "-q", "-b", "main"], seed); ident(seed);
  commitAll(seed, "base");
  const remote = join(SANDBOX, `${name}-remote.git`);
  git(["init", "-q", "--bare", "-b", "main", remote], SANDBOX);
  git(["push", "-q", remote, "main"], seed);         /* the remote's creation, before any hook exists */
  const clone = (who) => {
    const dir = join(SANDBOX, `${name}-${who}`);
    git(["clone", "-q", remote, dir], SANDBOX); ident(dir); install({ repo: dir });
    return dir;
  };
  return { remote, A: clone("alpha"), B: clone("beta"), C: clone("conduct") };
}
const onRemote = (remote, ref) => out1(["rev-parse", "--verify", "--quiet", `refs/heads/${ref}`], remote);
const isAncestor = (remote, sha) => git(["merge-base", "--is-ancestor", sha, "refs/heads/main"], remote).status === 0;
const lane = (root, branch, edits, msg) => {
  git(["fetch", "-q", "origin"], root);
  git(["checkout", "-q", "-B", `work-${branch.replace(/\//g, "-")}`, "origin/main"], root);
  for (const [rel, body] of Object.entries(edits))
    put(root, rel, typeof body === "function" ? body(readFileSync(join(root, rel), "utf8")) : body);
  commitAll(root, msg);
  const p = git(["push", "origin", `HEAD:refs/heads/${branch}`], root);
  return { status: p.status, sha: out1(["rev-parse", "HEAD"], root) };
};
const train = (root) => {
  git(["fetch", "-q", "origin"], root);
  const r = spawnSync(process.execPath, [join(root, "tools/train.mjs"), "run"], { cwd: root, encoding: "utf8" });
  const text = `${r.stdout || ""}${r.stderr || ""}`;
  return { status: r.status, text, gates: (text.match(/^=== train · gate:/gm) || []).length,
           returned: [...text.matchAll(/^train: RETURNED (\S+)[^\n]*$/gm)].map((m) => m[0]) };
};
/* The landed tree, checked out fresh from the REMOTE's main, so every read is of what landed. */
const landed = (fx, name) => {
  const dir = join(SANDBOX, `${name}-landed`);
  git(["clone", "-q", fx.remote, dir], SANDBOX);
  return dir;
};
const blob = (remote, ref, rel) => git(["show", `${ref}:${rel}`], remote).stdout;

section("THE TRAIN — two land/* branches each adding a measurement land in ONE train with NO conflict");
{
  const F = fixture("fx");
  /* ADDED 2026-09-24 (M0-154). This suite drives the real train through the real gate, so its fixture has always
     had to carry the gate's whole import closure — and had no assertion that it did, which is why the hand list
     it carried could have fallen behind `gates.mjs` without this suite ever going red. The list is DERIVED and
     floored, since a totality assertion over an empty corpus passes (`kickoffs/WORKER.md`). */
  t("the fixture carries the REAL train.mjs, gates.mjs and everything they import, byte for byte (DERIVED)",
    [GATE_DEPS.length >= 6, ["tools/train.mjs", "tools/gates.mjs", "tools/pushguard.mjs"].every((p) => GATE_DEPS.includes(p)),
     missingFrom(F.C)],
    [true, true, []]);
  const baseM = blob(F.remote, "main", M.frozen), baseIC = blob(F.remote, "main", IC.frozen);
  const bodyA = "## M-20 · 2026-09-23 · lane alpha's measurement\n\nalpha measured this\n";
  const bodyB = "## M-21 · 2026-09-23 · lane beta's measurement\n\nbeta measured that\n";
  const bodyIC = "## IC-22 · I3: lane beta's interface change · PROPOSED\n\nbeta proposes\n";
  const a = lane(F.A, "land/alpha/m20", { [`${M.dir}/M-20.md`]: bodyA }, "alpha: M-20 in its own file");
  const b = lane(F.B, "land/beta/m21", { [`${M.dir}/M-21.md`]: bodyB, [`${IC.dir}/IC-22.md`]: bodyIC }, "beta: M-21 and IC-22 in their own files");
  t("both lanes' land/* pushes land on the remote", [a.status, onRemote(F.remote, "land/alpha/m20"), b.status, onRemote(F.remote, "land/beta/m21")], [0, a.sha, 0, b.sha]);
  const r = train(F.C);
  if (r.status !== 0) console.log(r.text.split("\n").slice(-25).join("\n"));
  t("TWO MEASUREMENTS LAND IN ONE TRAIN WITH NO CONFLICT — exit 0, nothing returned, both tips on the remote's main",
    [r.status, r.returned, isAncestor(F.remote, a.sha), isAncestor(F.remote, b.sha)], [0, [], true, true]);
  t("...under ONE gate", r.gates, 1);
  t("EACH ENTRY IS WHOLE IN ITS OWN FILE — the landed blobs are the lanes' own, byte for byte",
    [blob(F.remote, "main", `${M.dir}/M-20.md`), blob(F.remote, "main", `${M.dir}/M-21.md`), blob(F.remote, "main", `${IC.dir}/IC-22.md`)], [bodyA, bodyB, bodyIC]);
  t("...and the frozen files did not move", [blob(F.remote, "main", M.frozen) === baseM, blob(F.remote, "main", IC.frozen) === baseIC], [true, true]);
  const L = landed(F, "fx");
  t("the reader yields the landed entries in id order after the frozen ones", E.read("M", { repo: L }).entries.map((e) => e.id), ["M-1", "M-3", "M-20", "M-21"]);
  t("...and the landed tree passes the audit", fails(L), []);
}

/* ========================================================================== */
section("THE COLLISION THIS REMOVES, AND THE LIAR — two tail appends to the frozen file");
{
  const append = (id, who) => (text) => `${text}## ${id} · 2026-09-23 · ${who} appended the old way\n\n${who}\n`;
  const F = fixture("old");
  const a = lane(F.A, "land/alpha/old", { [M.frozen]: append("M-30", "alpha") }, "alpha: append M-30 to the tail");
  const b = lane(F.B, "land/beta/old", { [M.frozen]: append("M-31", "beta") }, "beta: append M-31 to the tail");
  const r = train(F.C);
  t("THE OLD WAY COLLIDES — one tail append lands and the other is RETURNED by name with the conflicted path",
    [isAncestor(F.remote, a.sha), isAncestor(F.remote, b.sha), r.returned.length, r.returned.some((l) => l.includes("land/beta/old") && l.includes(`CONFLICT in ${M.frozen}`))],
    [true, false, 1, true]);

  /* THE LIAR: `merge=union` on the frozen file. It lands both with no conflict — the property it fakes — and the
     entries are not whole in their own files, so the audit names both. */
  const X = fixture("liar", { ".gitattributes": `${M.frozen} merge=union\n` });
  const xa = lane(X.A, "land/alpha/union", { [M.frozen]: append("M-40", "alpha") }, "alpha: append M-40, union-merged");
  const xb = lane(X.B, "land/beta/union", { [M.frozen]: append("M-41", "beta") }, "beta: append M-41, union-merged");
  const xr = train(X.C);
  t("(the liar lands both with NO conflict — the property it fakes)", [xr.status, xr.returned, isAncestor(X.remote, xa.sha), isAncestor(X.remote, xb.sha)], [0, [], true, true]);
  const XL = landed(X, "liar");
  const own = (id) => E.read("M", { repo: XL }).entries.some((e) => e.id === id && e.source === "file");
  const f = fails(XL);
  t("THE LIAR IS CAUGHT — neither entry is whole in its own file, and the audit names both",
    [own("M-40"), own("M-41"), f.some((x) => x.includes("NEW ENTRY IN A FROZEN FILE — M-40, M-41"))], [false, false, true]);
}

/* ========================================================================== */
section("FOOT");
t(`FOOT — all ${SECTIONS} sections reached (a section that dies silently cannot leave a green count)`, reached, SECTIONS);
rmSync(SANDBOX, { recursive: true, force: true });
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
