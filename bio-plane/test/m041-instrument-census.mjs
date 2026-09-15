/* m041-instrument-census.mjs — THE FOUR QUESTIONS, ASKED OF THE ESTATE'S OWN
 * INSTRUMENTS, AND ANSWERED FROM THE TOOLS RATHER THAN FROM THEIR DOCUMENTATION.
 *
 * M0-41, 2026-09-15. The row's authority is `docs/development/VERIFICATION.md`
 * (admitted for the M0 lane BY NAME by `tools/rowdesign.mjs`), read with
 * `docs/development/ORCHESTRATION.md` §"Why integration is a ROLE and not a
 * queue-flip", whose four-question table this generalises.
 *
 * NOT A `.test.mjs`, DELIBERATELY. The battery discovers `*.test.mjs` from the
 * directory and `scripts/coverage.mjs`'s register reads the same corpus, so a
 * suffix here would move four floors for a census that gates nothing. The
 * precedent is exact and in this directory: `m025-arm-census.mjs`, M0-25's own
 * census driver, and the `*.control.mjs` drivers beside it.
 *
 * ================================================================= THE QUESTION
 *
 * ORCHESTRATION.md put UNION FACTS to a four-part test — is an allocator
 * POSSIBLE, does it EXIST, is it USED at the moment of allocation, can the AUDIT
 * see a bypass — and the id row read yes / yes / NO / NO. The row that produced
 * this file generalises it: the same four questions asked of every instrument.
 *
 * **THE COMMON FAILURE IS NOT ABSENCE.** `mintid` ALLOCATES `M` correctly and
 * four workers of one wave still collided on `M-21`, because calling it is
 * OPTIONAL and `--audit` declares no allocation site for `M`. The tool is right,
 * the tool works, and nothing records who skipped it. So the shape to hunt is
 * EXISTS / OPTIONAL / UNAUDITABLE, and an all-green table is the one to distrust.
 *
 * ============================================ WHAT THIS DRIVER MEASURES, AND NOT
 *
 * Questions 1 and 2 (POSSIBLE, EXISTS) are a judgement and a file test; they are
 * in the published table with their evidence and are not this driver's subject.
 * Questions 3 and 4 are the ones that can be measured, and this driver measures
 * exactly three things:
 *
 *   (A) REACHABILITY. From each ENTRY LOOP — a command a session is actually told
 *       to run — which instruments are reached, and by which edge? An instrument
 *       reached from an entry loop is COMPOSED: running the loop runs it, and
 *       skipping it means skipping the loop. An instrument reached from no entry
 *       loop is CONVENTION-ONLY: something has to remember it.
 *
 *   (B) ID-BYPASS VISIBILITY, per namespace, read out of `mintid`'s own
 *       `NAMESPACES` export rather than out of any prose about it. A namespace
 *       with no `allocPattern` cannot be graded for duplicates, and the tool says
 *       so of itself — that is `M`, and it is the worked example.
 *
 *   (C) THE PLANTED BYPASS. Given a diff base, does `mintid --audit --base`
 *       classify an id the ledger never issued as NOT HELD? This is the arm the
 *       negative control drives, and it must come back with a NEGATIVE for `M`.
 *
 * **WHAT THIS MATCHER CAN SEE, STATED BECAUSE A MATCHER THAT HIDES ITS BLIND
 * SPOTS IS READ AS THOUGH IT HAD NONE.** It follows two edge kinds out of a
 * file's CODE (comments, strings and regex text are not code and are not
 * followed): a static or dynamic `import` of a relative `.mjs` path, and a
 * child-process spawn (`execSync` / `execFileSync` / `spawnSync`) whose argument
 * text names a repository `.mjs` path. It does NOT see: an edge built by
 * concatenation or held in a variable, a tool invoked from a `package.json`
 * script or from prose in a kickoff, a shell wrapper, an `eval`, or any loop that
 * is not in ENTRY_LOOPS below. **A CONVENTION-ONLY VERDICT IS THEREFORE A CLAIM
 * ABOUT THESE EDGES, NEVER A CLAIM THAT NOBODY RUNS THE TOOL** — the published
 * table carries the kickoff placement for each one, read by hand, beside this.
 *
 * **NO DIRECTORY WALK, ON PURPOSE.** Every corpus here is either an explicit list
 * or `git ls-files`, so this file is not a new member of `hygiene.test.mjs`'s
 * `readdirSync` census (21 files walk, 3 guarded, 18 named; a new one fails by
 * name). `git ls-files` is a shell walk that census cannot see either way — said
 * plainly rather than left as an accident of spelling. The index is also the
 * better corpus: it answers about what is IN THE COMMIT, which is the question
 * `scripts/provenance.mjs` exists to ask.
 *
 * NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/m041-instrument-census.control.mjs`
 * — deliberately not a `.test.mjs` for the reason above, and it EDITS REAL CORPUS
 * FILES while it runs. THE HARNESS AND ITS PRISTINE COPIES LIVE INSIDE THIS
 * WORKTREE, never in the shared scratchpad. Every arm is armed ALONE with the
 * others held open, every restore is verified by sha256 AND by `cmp`, and every
 * arm declares what MUST fail and what MUST NOT.
 *   (1) BASELINE -> the census reads clean against an unmodified tree, and the
 *       baseline row is what distinguishes all-arms-broken from all-arms-working.
 *   (2) PLANTED BYPASS, GRADED NAMESPACE — a hand-picked `M0-` id the ledger never
 *       issued, written into QUEUE.md as a real item heading -> the census MUST
 *       name it NOT HELD. `plancheck --local` MUST still pass, and that second
 *       half is the finding rather than the control.
 *   (3) PLANTED BYPASS, UNGRADED NAMESPACE — the worked example this project
 *       already owns: a hand-picked `M-` id written into MEASUREMENTS.md ->
 *       the census MUST report `M` as UNAUDITABLE and MUST NOT report the id as
 *       found. **A GREEN HERE IS THE DEFECT, NOT THE PASS**, which is why the
 *       control asserts the negative and names it.
 *   (4) OVER-STRICTNESS — correct work in a spelling the matcher did not
 *       anticipate must PASS. `civicos-ui/check-semantics.mjs` is reached by
 *       `civicos-ui/test/run.mjs` through a SPAWN and never through an import.
 *       Neuter the spawn half of the edge reader and `check-semantics` must flip
 *       to a FALSE GAP — proving the arm can bite and that the shipped reader
 *       does not score a spawn-composed instrument as convention-only.
 *   (5) ARM-NEVER-ARMED — every arm's anchor is validated before anything is
 *       edited, and an arm whose patch matched zero times is a FINDING reported
 *       by name rather than a silent pass.
 */

import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const read = (rel) => { try { return readFileSync(join(REPO, rel), "utf8"); } catch { return null; } };
const git = (args) => {
  try { return execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim(); }
  catch { return null; }
};

/* ------------------------------------------------------------------- the code
   A comment that names a module is not an edge. This repository has paid for that
   distinction twice in one estate — `hygiene.test.mjs`'s guarded/unguarded
   detector read `battery.mjs` as guarded because its HEADER names the module in
   prose, and `armdecay.mjs` refuses to spell its own subject whole for the same
   reason. So comments, string literals, regex literals and a template's text
   chunks are blanked before any edge is read; the code inside `${…}` is kept,
   because that is code. Spawn arguments are the ONE exception and are read from
   the unblanked source deliberately, because a spawn's target IS a string — the
   two readers are separate functions so neither can be mistaken for the other. */
export function stripToCode(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let prev = ""; /* last significant code char, to tell a regex from a divide */
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") { while (i < n && src[i] !== "\n") { out += " "; i++; } continue; }
    if (c === "/" && d === "*") {
      out += "  "; i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { out += src[i] === "\n" ? "\n" : " "; i++; }
      out += "  "; i += 2; continue;
    }
    if (c === '"' || c === "'") {
      out += " "; i++;
      while (i < n && src[i] !== c) { if (src[i] === "\\") { out += " "; i++; } out += src[i] === "\n" ? "\n" : " "; i++; }
      out += " "; i++; prev = "x"; continue;
    }
    if (c === "`") {
      out += " "; i++;
      while (i < n && src[i] !== "`") {
        if (src[i] === "\\") { out += "  "; i += 2; continue; }
        if (src[i] === "$" && src[i + 1] === "{") {
          out += "  "; i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (src[i] === "{") depth++;
            else if (src[i] === "}") { depth--; if (!depth) break; }
            out += src[i]; i++;
          }
          out += " "; i++; continue;
        }
        out += src[i] === "\n" ? "\n" : " "; i++;
      }
      out += " "; i++; prev = "x"; continue;
    }
    if (c === "/" && prev && !/[\w)\]]/.test(prev)) {
      /* a regex literal: its text is not code */
      out += " "; i++;
      while (i < n && src[i] !== "/") { if (src[i] === "\\") { out += " "; i++; } out += src[i] === "\n" ? "\n" : " "; i++; }
      out += " "; i++; prev = "x"; continue;
    }
    if (/\S/.test(c)) prev = c;
    out += c; i++;
  }
  return out;
}

/* ------------------------------------------------------------------ the edges */

/* An IMPORT edge: `import … from "./x.mjs"` or `await import("./x.mjs")`, read
   out of CODE only. Relative specifiers only — a bare specifier is a package. */
export function importEdges(src, fromRel) {
  const code = stripToCode(src);
  const out = new Set();
  const spec = /(?:\bfrom\s*|\bimport\s*\(\s*)(["'])([^"'\n]+)\1/g;
  /* `stripToCode` blanks string bodies, so the specifiers are read from the raw
     source and CONFIRMED against a code-side occurrence of the import keyword on
     the same line — which is what keeps a module named in prose out of the set. */
  const codeLines = new Set();
  code.split("\n").forEach((l, ix) => { if (/\b(?:import|require)\b/.test(l)) codeLines.add(ix); });
  const rawLines = src.split("\n");
  for (let ix = 0; ix < rawLines.length; ix++) {
    if (!codeLines.has(ix)) continue;
    spec.lastIndex = 0;
    let m;
    while ((m = spec.exec(rawLines[ix]))) {
      const p = m[2];
      if (!p.startsWith(".")) continue;
      out.add(normalise(fromRel, p));
    }
  }
  return out;
}

/* A SPAWN edge. `execFileSync("node", [<path>])`, `execSync("node <path>")` and
   `spawnSync` alike: what is looked for is a repository `.mjs` path appearing in
   the same statement as a spawn call. The path may be written relative to the
   caller, as a `new URL(...).pathname`, or joined from a root constant, so the
   match is on the PATH TEXT and the resolution is tried both ways. */
export function spawnEdges(src, fromRel) {
  const out = new Set();
  const call = /\b(?:execSync|execFileSync|spawnSync|spawn|exec)\s*\(/g;
  let m;
  while ((m = call.exec(src))) {
    /* the statement is taken as the balanced argument list, capped so an
       unbalanced source cannot run away */
    let i = m.index + m[0].length, depth = 1, end = i;
    while (i < src.length && depth > 0 && i - m.index < 4000) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") depth--;
      i++; end = i;
    }
    const arg = src.slice(m.index, end);
    for (const p of arg.matchAll(/["'`]([^"'`\n]*?[\w./-]+\.mjs)["'`]/g)) {
      out.add(normalise(fromRel, p[1]));
    }
  }
  return out;
}

/* A specifier resolved to a repo-relative path. Tried first as relative to the
   importing file, then as already-repo-relative — a spawn target is often
   written from the repo root. An unresolvable specifier is returned as written
   and reported, never dropped: a thing the matcher does not understand must be
   NAMED (WORKER.md). */
export function normalise(fromRel, spec) {
  const clean = spec.replace(/^\.\.\/\.\.\//, "").replace(/^\.\//, "");
  const asRel = relative(REPO, resolve(join(REPO, dirname(fromRel)), spec));
  if (!asRel.startsWith("..") && existsSync(join(REPO, asRel))) return asRel;
  if (existsSync(join(REPO, clean))) return clean;
  return asRel.startsWith("..") ? spec : asRel;
}

/* ------------------------------------------------------------- the entry loops
   A loop a session is TOLD TO RUN. Each is quoted with the file that tells them,
   because "the loop the reader actually runs" is the whole of CLAUDE.md's rule
   and a loop nobody is sent to is not one. Read by hand from CLAUDE.md's
   verification ladder and kickoffs/WORKER.md "Before you finish". */
export const ENTRY_LOOPS = [
  { id: "battery",   file: "bio-plane/scripts/battery.mjs",
    cmd: "cd bio-plane && npm run test:battery", told: "CLAUDE.md ladder 1 · WORKER.md 1" },
  { id: "coverage",  file: "bio-plane/scripts/coverage.mjs",
    cmd: "cd bio-plane && node scripts/coverage.mjs --strict", told: "CLAUDE.md ladder 2a · WORKER.md 2" },
  { id: "ui",        file: "civicos-ui/test/run.mjs",
    cmd: "node civicos-ui/test/run.mjs", told: "WORKER.md 3" },
  { id: "plancheck", file: "tools/plancheck.mjs",
    cmd: "node tools/plancheck.mjs", told: "CLAUDE.md 'not negotiable' · WORKER.md 4" },
  { id: "gates",     file: "tools/gates.mjs",
    cmd: "node tools/gates.mjs", told: "CLAUDE.md 'Verification discipline, in order'" },
];

/* The instruments the row names, plus the entry loops themselves — a loop is an
   instrument too, and the census that left them out would miss that NOTHING
   composes them: this repository has no git hook and no CI (measured; see the
   published table), so every entry loop is itself convention-only. */
export const INSTRUMENTS = [
  "tools/mintid.mjs",
  "tools/plancheck.mjs",
  "tools/corpuscheck.mjs",
  "tools/rowdesign.mjs",
  "tools/mergecarry.mjs",
  "tools/decided.mjs",
  "tools/waitquiet.mjs",
  "tools/bundle-docprofile.mjs",
  "tools/gates.mjs",
  "bio-plane/scripts/coverage.mjs",
  "bio-plane/scripts/battery.mjs",
  "bio-plane/scripts/provenance.mjs",
  "bio-plane/scripts/control-register.mjs",
  "bio-plane/scripts/armdecay.mjs",
  "bio-plane/scripts/residue.mjs",
  "bio-plane/scripts/build-plane.mjs",
  "bio-plane/scripts/fleet-bundle.mjs",
  "bio-plane/test/fleetbundles.test.mjs",
  "bio-plane/test/mergecarry.test.mjs",
  "bio-plane/test/hygiene.test.mjs",
  "civicos-ui/check-semantics.mjs",
  "civicos-ui/check-refusal-codes.mjs",
  "civicos-ui/test/run.mjs",
];

/* ------------------------------------------------------------------ (A) REACH
   A breadth-first walk of the edge graph from every entry loop. The battery and
   the UI runner DISCOVER their suites from a directory rather than importing
   them, so discovery is declared as an edge kind of its own: a `*.test.mjs` under
   `bio-plane/test/` is reached by the battery and one under `civicos-ui/test/` by
   the UI runner, BY DISCOVERY — which is stronger than an import, because a
   hand-kept list is what falls behind (D-93, D-113) and a directory cannot. */
export function reach({ instruments = INSTRUMENTS, loops = ENTRY_LOOPS } = {}) {
  const tracked = new Set((git(["ls-files"]) || "").split("\n").filter(Boolean));
  const edges = new Map();   /* file -> [{to, kind}] */
  const unresolved = [];

  const edgesOf = (rel) => {
    if (edges.has(rel)) return edges.get(rel);
    const src = read(rel);
    const out = [];
    if (src !== null) {
      for (const t of importEdges(src, rel)) out.push({ to: t, kind: "import" });
      for (const t of spawnEdges(src, rel)) out.push({ to: t, kind: "spawn" });
    }
    for (const e of out) if (!tracked.has(e.to)) unresolved.push({ from: rel, ...e });
    edges.set(rel, out);
    return out;
  };

  const reachedBy = new Map();  /* instrument -> [{loop, kind, via}] */
  const note = (inst, rec) => {
    if (!reachedBy.has(inst)) reachedBy.set(inst, []);
    reachedBy.get(inst).push(rec);
  };

  /* **USED AND TESTED ARE DIFFERENT ANSWERS AND COLLAPSING THEM IS AN OVERCLAIM.**
     `tools/waitquiet.mjs` is reached from the battery — through
     `test/waitquiet.test.mjs`, whose whole purpose is to TEST it. That means the
     battery proves the instrument WORKS; it says nothing about the instrument
     being INVOKED at the moment it matters, which is question 3. So reach is
     computed twice: once WITHOUT the discovery edge (the loop invoking the
     instrument to do its own job — USED) and once WITH it (the loop exercising
     the instrument's suite — TESTED). An instrument that is only TESTED is
     reported as such, because "the battery runs its suite" is exactly the
     mechanism-believed-on-its-existence answer WORKER.md names as this
     project's most-met defect. */
  const walk = (from, withDiscovery) => {
    const seen = new Set([from.file]);
    const queue = [from.file];
    if (withDiscovery) {
      for (const f of tracked) {
        if (from.id === "battery" && /^bio-plane\/test\/.*\.test\.mjs$/.test(f)) { seen.add(f); queue.push(f); }
        if (from.id === "ui" && /^civicos-ui\/test\/.*\.test\.mjs$/.test(f)) { seen.add(f); queue.push(f); }
      }
    }
    while (queue.length) {
      const cur = queue.shift();
      for (const { to } of edgesOf(cur)) {
        if (seen.has(to)) continue;
        seen.add(to); queue.push(to);
      }
    }
    return seen;
  };

  for (const loop of loops) {
    const seen = new Set([loop.file]);
    const queue = [loop.file];
    const discovered = new Set();
    /* DISCOVERY, declared as its own edge kind — see the comment above. **THE
       DISCOVERED SUITE IS ENQUEUED, NOT ONLY MARKED SEEN, AND THAT IS A
       CORRECTION OF THIS FILE'S OWN FIRST RUN.** Marking it seen without
       following its edges scored `scripts/armdecay.mjs`, `scripts/fleet-bundle.mjs`
       and `scripts/build-plane.mjs` CONVENTION-ONLY when each is imported by a
       suite the battery discovers — a FALSE GAP, and a census that invents gaps
       produces a list nobody can act on, which is this row's own over-strictness
       arm arriving inside the instrument. Recorded rather than smoothed. */
    if (loop.id === "battery")
      for (const f of tracked) if (/^bio-plane\/test\/.*\.test\.mjs$/.test(f)) discovered.add(f);
    if (loop.id === "ui")
      for (const f of tracked) if (/^civicos-ui\/test\/.*\.test\.mjs$/.test(f)) discovered.add(f);
    for (const f of discovered) { seen.add(f); queue.push(f); }

    while (queue.length) {
      const cur = queue.shift();
      for (const { to } of edgesOf(cur)) {
        if (seen.has(to)) continue;
        seen.add(to);
        queue.push(to);
      }
    }

    const used = walk(loop, false);

    for (const inst of instruments) {
      if (!seen.has(inst)) continue;
      const direct = edgesOf(loop.file).find((e) => e.to === inst);
      let kind = direct ? direct.kind : "transitive";
      if (loop.id === "battery" && /^bio-plane\/test\/.*\.test\.mjs$/.test(inst)) kind = "discovery";
      if (loop.id === "ui" && /^civicos-ui\/test\/.*\.test\.mjs$/.test(inst)) kind = "discovery";
      if (inst === loop.file) kind = "IS the loop";
      note(inst, { loop: loop.id, kind, used: used.has(inst) && inst !== loop.file });
    }
  }

  const rows = instruments.map((inst) => {
    const by = reachedBy.get(inst) || [];
    const isLoop = by.some((r) => r.kind === "IS the loop");
    const usedBy = by.filter((r) => r.used);
    /* a discovered suite IS the loop's own job — a suite is not "tested by" the
       battery, it IS what the battery runs, so discovery counts as USED. */
    const discoveredBy = by.filter((r) => r.kind === "discovery");
    return {
      instrument: inst,
      exists: existsSync(join(REPO, inst)),
      tracked: tracked.has(inst),
      by, isLoop,
      used: usedBy.length > 0 || discoveredBy.length > 0,
      testedOnly: usedBy.length === 0 && discoveredBy.length === 0 && by.some((r) => r.kind === "transitive"),
    };
  });
  return { rows, unresolved, corpus: tracked.size };
}

/* -------------------------------------------------- (B) ID-BYPASS VISIBILITY
   Read out of `mintid`'s own export. A namespace with no `allocPattern` cannot be
   graded for duplicates — the tool states this of `M` in its own audit, and this
   reads the property rather than the sentence about it. */
export async function idVisibility() {
  const { NAMESPACES } = await import("../../tools/mintid.mjs");
  return Object.entries(NAMESPACES).map(([ns, spec]) => ({
    ns,
    kind: spec.kind,
    allocSite: Boolean(spec.allocPattern),
    gradable: Boolean(spec.allocPattern) && spec.allocIsUnique !== false,
    why: spec.allocNotUnique || (spec.allocPattern ? null : "no allocation site is declared"),
  }));
}

/* ------------------------------------------------------- (C) THE PLANTED BYPASS
   `mintid --audit --base <ref>` classifies every id a diff introduces. This runs
   it and reads the classification, so the negative control can plant an id and
   require that the census NAME it — or, for `M`, require that the census come
   back UNABLE TO SEE IT and say so. */
export function introducedIds(base = "origin/main") {
  const out = execFileSync(process.execPath,
    [join(REPO, "tools/mintid.mjs"), "--audit", "--base", base],
    { cwd: REPO, encoding: "utf8" });
  const sec = out.split(/^3\. IDS INTRODUCED BY A DIFF/m)[1] || "";
  const body = sec.split(/^4\. THE REGISTER/m)[0] || "";
  const tally = body.match(/(\d+)\s+id\(s\)\s+introduced\s+·\s+HELD\s+(\d+)\s+·\s+NOT HELD\s+(\d+)\s+·\s+PRE-LEDGER\s+(\d+)/);
  const named = [...body.matchAll(/\b(NOT HELD|HELD|PRE-LEDGER)\s+([A-Z][A-Z0-9]*-\d+)/g)]
    .map((m) => ({ verdict: m[1], id: m[2] }));
  const alsoNamed = [...body.matchAll(/^\s{4,}([A-Z][A-Z0-9]*-\d+)\b/gm)].map((m) => m[1]);
  return {
    raw: body.trim(),
    introduced: tally ? Number(tally[1]) : -1,   /* -1, never 0: unreadable and none are different claims */
    held: tally ? Number(tally[2]) : -1,
    notHeld: tally ? Number(tally[3]) : -1,
    preLedger: tally ? Number(tally[4]) : -1,
    named, alsoNamed,
  };
}

/* ------------------------------------------------------------------- the print */
export async function census({ base = "origin/main" } = {}) {
  const r = reach();
  const ids = await idVisibility();
  let planted = null;
  try { planted = introducedIds(base); } catch (e) { planted = { error: String(e.message || e) }; }
  return { reach: r, ids, planted };
}

function main() {
  const base = (process.argv.find((a) => a.startsWith("--base=")) || "--base=origin/main").slice(7);
  return census({ base }).then(({ reach: r, ids, planted }) => {
    console.log(`M0-41 INSTRUMENT CENSUS — the four questions, answered from the tools`);
    console.log(`corpus: ${r.corpus} tracked file(s) · ${INSTRUMENTS.length} instrument(s) · ${ENTRY_LOOPS.length} entry loop(s)`);
    console.log(`\nA · REACH — which entry loop runs this instrument, and by which edge`);
    let conventionOnly = 0, missing = 0, testedOnly = 0, usedN = 0;
    for (const row of r.rows) {
      if (!row.exists) { missing++; console.log(`  MISSING       ${row.instrument}`); continue; }
      const by = row.by.map((b) => `${b.loop}:${b.kind}`).join(" ");
      /* An ENTRY LOOP is classified as a loop first, whatever else reaches it —
         `tools/plancheck.mjs` is also reached transitively by its own suite, and
         displaying that as TESTED ONLY buried the fact that it is one of the five
         things a session is told to run. The loop question is "what composes the
         loop", and the answer is measured below: nothing does. */
      if (row.isLoop) { conventionOnly++; console.log(`  LOOP          ${row.instrument}  ${by}  — a session is TOLD to run it; nothing composes it`); continue; }
      if (row.used) { usedN++; console.log(`  USED          ${row.instrument}  ${by}`); }
      else if (row.testedOnly) { testedOnly++; console.log(`  TESTED ONLY   ${row.instrument}  ${by}  — a loop runs its SUITE; nothing invokes it`); }
      else { conventionOnly++; console.log(`  CONVENTION    ${row.instrument}  ${by || "— reached by no entry loop"}`); }
    }
    console.log(`  ${usedN} used by a loop · ${testedOnly} TESTED ONLY · ${conventionOnly} convention-only · ${missing} missing`);
    console.log(`  CONVENTION-ONLY includes every ENTRY LOOP ITSELF: this repository has no git`);
    console.log(`  hook and no CI (measured — .git/hooks holds only samples, core.hooksPath unset,`);
    console.log(`  no .github/), so NOTHING composes the loops. Every gate here is a gate a`);
    console.log(`  session chooses to run, and skipping one leaves no trace anywhere.`);
    if (r.unresolved.length) {
      console.log(`  EDGES THIS READER COULD NOT RESOLVE TO A TRACKED FILE — named, never dropped:`);
      for (const u of r.unresolved.slice(0, 20)) console.log(`    ${u.from} -${u.kind}-> ${u.to}`);
      if (r.unresolved.length > 20) console.log(`    … and ${r.unresolved.length - 20} more`);
    }

    console.log(`\nB · ID-BYPASS VISIBILITY — per namespace, from mintid's own NAMESPACES export`);
    const blind = ids.filter((n) => !n.gradable);
    for (const n of blind) console.log(`  UNAUDITABLE   ${n.ns.padEnd(5)} ${n.why}`);
    console.log(`  ${ids.length - blind.length} of ${ids.length} namespace(s) gradable · ${blind.length} UNAUDITABLE (${blind.map((n) => n.ns).join(", ")})`);

    console.log(`\nC · IDS INTRODUCED AGAINST ${base} — the planted-bypass arm`);
    if (planted.error) console.log(`  UNVERIFIED — ${planted.error}`);
    else {
      console.log(`  introduced ${planted.introduced} · HELD ${planted.held} · NOT HELD ${planted.notHeld} · PRE-LEDGER ${planted.preLedger}`);
      for (const n of planted.named) console.log(`    ${n.verdict}  ${n.id}`);
      console.log(`  AND WHAT THIS ARM CANNOT SEE: an id in a namespace section B calls`);
      console.log(`  UNAUDITABLE is invisible here too — the diff arm reads the same`);
      console.log(`  allocation sites. A planted ${blind.map((n) => n.ns).join("/")} id returns a NEGATIVE, and`);
      console.log(`  the negative IS the finding.`);
    }
    return 0;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) main().then((c) => process.exit(c));
