#!/usr/bin/env node
/* The NEGATIVE CONTROL DRIVER for `tools/status.mjs` and `bio-plane/test/status.test.mjs` —
 * sixteen arms plus an opening and closing baseline.
 *
 *   node bio-plane/test/status.control.mjs        (from the repo root)
 *
 * Each arm breaks ONE property of the single source of truth and must turn ONE NAMED assertion
 * red, the file restored by sha256 AND `cmp` AND a floored byte count after every arm. Built on
 * `owed.control.mjs`'s harness, reused rather than reinvented.
 *
 * NEGATIVE CONTROL (M0-172, RUN 2026-09-25 by the M0-172 worker, in a scratch worktree): the clean-run
 * `rmSync(PEN, …)` removed -> exactly "clean run · the pen `.status-harness/` is GONE (M0-172)" FAILS
 * (89 pass, 1 fail), `.status-harness/pristine.status` (33,690 B) left behind; with it, 90 pass 0 fail
 * and no `.status-harness/` after the run.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync, rmSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".status-harness");
const PRED = join(REPO, "tools/status.mjs");
const SUITE = join(REPO, "bio-plane/test/status.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

mkdirSync(PEN, { recursive: true });
const copy = join(PEN, "pristine.status");
writeFileSync(copy, readFileSync(PRED));
const PRISTINE = { sha: sha(PRED), bytes: statSync(PRED).size };
const MIN_BYTES = 4000;
console.log(`  pristine predicate: ${PRISTINE.bytes} bytes, sha256 ${PRISTINE.sha.slice(0, 8)}…`);

function restore() {
  writeFileSync(PRED, readFileSync(copy));
  const got = sha(PRED), size = statSync(PRED).size;
  const cmp = spawnSync("cmp", ["-s", PRED, copy]).status === 0;
  const ok = got === PRISTINE.sha && cmp && size === PRISTINE.bytes && size >= MIN_BYTES;
  console.log(`  restored tools/status.mjs: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
    + `cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}
function armPatch(from, to) {
  const before = readFileSync(PRED, "utf8");
  const hits = before.split(from).length - 1;
  if (hits === 1) writeFileSync(PRED, before.replace(from, to));
  return hits;
}
const suiteRun = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const tally = out.match(/status: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* Downstream of nothing — an arm that takes this down moved a second variable. */
const collateral = (s) => broke(s, "the legal states are declared once");

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 20, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

const ARMS = [
  { id: "A1", title: "an absence over an UNREADABLE file reported as an absence — the false-absence class",
    from: "    if (missing.length) return { ok: false, evidence: `UNREADABLE:",
    to:   "    if (false) return { ok: false, evidence: `UNREADABLE:",
    mustBreak: "`none` over a file that is not there is NOT ok" },
  { id: "A2", title: "an op probe that always finds its op — a BUILT claim survives the op's deletion",
    /* Re-aimed after its first run: forcing the CONDITION true also dereferenced a null match,
       so the suite CRASHED rather than failing the named assertion — a second variable moved.
       This arm now changes only the not-found ANSWER. */
    from: "             : { ok: false, evidence: `op=${p.op} is NOT in index.mjs's OPS table` };",
    to:   "             : { ok: true, evidence: `op=${p.op} is NOT in index.mjs's OPS table` };",
    mustBreak: "an op NOT in the OPS table is not" },
  { id: "A3", title: "a claim with NO probe accepted — prose, which is what drifted",
    from: "    else if (!cl.probes || !cl.probes.length) problems.push(",
    to:   "    else if (false) problems.push(",
    mustBreak: "A BUILT CLAIM WITH NO PROBE DRIFTS" },
  { id: "A4", title: "a pipe left in a rendered cell — a claim breaks §3's table",
    from: '.replace(/\\|/g, "/")',
    to:   '.replace(/QQQ/g, "/")',
    mustBreak: "A RENDERED CELL CARRIES NO PIPE" },
  { id: "A5", title: "a UI call helper dropped from the list — every `uinone` claim through it goes blind",
    from: 'export const UI_HELPERS = ["recR", "recPostR", "actAsk",',
    to:   'export const UI_HELPERS = ["recR", "recPostR", "zzzNotAHelper",',
    mustBreak: "NO UI helper that calls an op is missing from UI_HELPERS" },
  { id: "A6", title: "an absence that ignores what it finds — an ABSENT claim survives the thing being built",
    from: "        if (m) return { ok: false, evidence: `/${pat}/ FOUND",
    to:   "        if (false) return { ok: false, evidence: `/${pat}/ FOUND",
    mustBreak: "AN ABSENT CLAIM WHOSE THING WAS BUILT DRIFTS" },
  { id: "A7", title: "an ABSENT claim allowed to rest on a comment — the probe that passed on a fixed defect",
    from: "    if (cl.state === \"ABSENT\" && !(cl.probes || []).some((p) => p.none || p.uinone))",
    to:   "    if (false && !(cl.probes || []).some((p) => p.none || p.uinone))",
    mustBreak: "AN ABSENT CLAIM RESTING ONLY ON A `hit` DRIFTS" },
  { id: "A8", title: "a rendering that leaves the Status date behind — main red on bare plancheck",
    from: "  return head.replace(re, `as of ${today}`) + (end < 0 ? \"\" : text.slice(end));",
    to:   "  return head + (end < 0 ? \"\" : text.slice(end));",
    mustBreak: "A RENDERING MOVES THE STATUS DATE" },
  { id: "A9", title: "a key set that ignores ADDITIONS — the census goes blind to a renamed construct again",
    from: "    const extra = got.filter((k) => !want.includes(k)), gone",
    to:   "    const extra = [], gone",
    mustBreak: "AN EXACT KEY SET TRIPS ON A KEY ADDED UNDER A NAME NOBODY SEARCHED FOR" },
  { id: "A10", title: "whole claim texts rendered into §3 again — the map over its reading budget, the trims come back (M0-138)",
    from: "(by[cl.state] = by[cl.state] || []).push(firstSentence(cl.text));",
    to:   "(by[cl.state] = by[cl.state] || []).push(cl.text);",
    mustBreak: "THE RENDERED MAP FITS ITS READING BUDGET — docs/architecture/BIO_System_Design.md",
    alsoBreak: "renderCell renders the first sentence, never the whole text" },
  { id: "A11", title: "the cell cap lifted — a 700 B first sentence renders whole again (BOB #32, 2026-09-24)",
    from: "export const CELL_CAP = 240;",
    to:   "export const CELL_CAP = 1e9;",
    mustBreak: "a first sentence past CELL_CAP is cut, marked, and no longer than the cap plus its mark" },
  /* M0-155, 2026-09-24. THE ARM THAT MATTERS MOST HERE, because the property it breaks is the one
     that had never been asserted at all: this tool spent its whole life matching comments, and
     sixteen claims' probes were resting on one when the arm was written. Armed, `readCode` hands
     every probe the RAW source again, so a comment satisfies a `hit` and falsifies a `none` exactly
     as before. Note what it must ALSO break, on the real tree rather than in a fixture — a DEC-49
     region marker is a comment, and eleven claims used to read BUILT on one. */
  { id: "A12", title: "comments read as code again — a claim stands on a sentence nothing enforces (M0-155)",
    from: "? t : stripComments(t));",
    to:   "? t : t);",
    mustBreak: "A `hit` WHOSE ONLY MATCH IS A COMMENT IS NOT BUILT",
    alsoBreak: "ON THE REAL TREE a DEC-49 REGION MARKER" },
  /* M0-155, the SECOND defect and a separate arm because it has a separate cause: A12's blanking
     cannot reach an SQL comment inside a template literal, so the DECLARATION SHAPE closes that one.
     Loosen the shape back and a sentence about a table is counted as a table again — which is how
     `would` sat in the census, and how `does` sat there before the blanking took it. */
  { id: "A13", title: "a sentence about a table counted as a table again — the census's two phantoms (M0-155)",
    /* The anchor is written with DOUBLED backslashes on purpose: the LINE in `status.mjs` contains
       `"\\s*…"` (a regex source inside a JS string), so a JS literal that reproduces it needs four.
       Spelled with two, this patch matched ZERO times and the driver's own "the arm ARMED" assertion
       said so — an arm that did not arm is a finding, and that is the assertion that made it one. */
    from: 'const DECL_TAIL = "\\\\s*(?:\\\\(|USING\\\\s)";',
    to:   'const DECL_TAIL = "";',
    mustBreak: "A `CREATE TABLE` IN A PROSE SENTENCE IS NOT A TABLE",
    alsoBreak: "...so the census does not count it either" },
  /* M0-160, 2026-09-24. The property is new, and it is the one a probe's whole worth rests on: a
     `hit` names ONE site or it names nothing. Armed, the tool takes the FIRST match again and
     reports that line as evidence — which is exactly how D-498's probe matched 24 sites in
     `store.mjs` and stayed green over an op its subject never touched. The arm must NOT touch the
     miss ("matches nowhere") or the unique pin, because a guard that failed every `hit` would pass
     the ambiguity arms while blinding the corpus. */
  { id: "A14", title: "a `hit` satisfied by its FIRST of many matches again — a probe that pins nothing reads as one that pins the right site (M0-160)",
    /* CORRECTED BY M0-181, NEVER EXEMPTED: this anchor was the PREFIX
       `if (sites.length === 1) return { ok: true, evidence:`, which was unique until the `table`
       probe grew a line of the same shape — two matches, so `armPatch` would have written nothing
       and the arm would have reported ARMED=2 rather than breaking anything. Spelled whole, it
       names the `hit` branch alone. An arm that did not arm is a finding, and the driver's own
       "matched exactly once" assertion is what would have made it one. */
    from: "    if (sites.length === 1) return { ok: true, evidence: `/${p.hit}/ at ${sites[0]}` };",
    to:   "    if (sites.length >= 1) return { ok: true, evidence: `/${p.hit}/ at ${sites[0]}` };",
    mustBreak: "A `hit` MATCHING TWICE IN ITS FILE IS NOT ok",
    alsoBreak: "TWO FILES MATCHING ONCE EACH IS AMBIGUOUS TOO" },
  /* M0-181, 2026-09-24. THE ANCHOR: a `table` used to be satisfied anywhere in a line, so `content`
     was satisfied by the STRING ARGUMENT in store.mjs that names it as well as by its declaration in
     schema.mjs — delete the declaration and a table nothing creates keeps reading BUILT. Armed, the
     shape floats again and the fixture's string alone declares the table. It must NOT break the
     over-strictness arms (a declaration beside that string, and the nine written as an indented
     backtick), because an anchor that lost real declarations would be a worse defect than the one it
     closes — a bare `^` was measured doing exactly that, losing nine. */
  { id: "A15", title: "a table declaration recognised mid-line again — a STRING naming a table declares it (M0-181)",
    from: 'const DECL_ANCHOR = "(?:^|`)[ \\\\t]*";',
    to:   'const DECL_ANCHOR = "";',
    mustBreak: "A TABLE NAMED ONLY BY A STRING IS NOT DECLARED",
    alsoBreak: "ON THE REAL TREE EVERY DECLARATION IS THE ONLY ONE OF ITS NAME" },
  /* M0-181, the SECOND property and a separate arm because it has a separate cause: the anchor says
     WHAT a declaration is, the count says a name may have only ONE. Armed, the probe takes the first
     declaration again, so a table declared in both files reads BUILT and deleting either leaves it
     green. It must NOT break the miss ("A TABLE DECLARED NOWHERE still says so") or the string arm —
     a guard that failed every `table` probe would satisfy this arm while blinding 58 claims. */
  { id: "A16", title: "a `table` satisfied by the FIRST of two declarations again — deleting the claim's own table leaves it green (M0-181)",
    from: "    if (sites.length === 1) return { ok: true, evidence: `table ${p.table} (${sites[0]})` };",
    to:   "    if (sites.length >= 1) return { ok: true, evidence: `table ${p.table} (${sites[0]})` };",
    mustBreak: "A TABLE DECLARED TWICE IS NOT ok",
    alsoBreak: "A CLAIM WHOSE `table` PROBE IS AMBIGUOUS DRIFTS" },
];

for (const a of ARMS) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatch(a.from, a.to);
  t(`${a.id} · the arm ARMED (patch matched exactly once)`, hits, 1);
  const s = suiteRun();
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 48)}…"`, broke(s, a.mustBreak), true);
  if (a.alsoBreak) t(`${a.id} · ...and "${a.alsoBreak.slice(0, 36)}…" fails with it`, broke(s, a.alsoBreak), true);
  t(`${a.id} · ...and the suite survived to report it`, s.reachedFoot, true);
  t(`${a.id} · ...and the failure is not collateral`, collateral(s), false);
  t(`${a.id} · RESTORED byte-identically`, restore(), true);
}

console.log("\n--- ARM BASELINE (closing) · every arm restored ---");
{
  const s = suiteRun();
  t("closing · the suite is GREEN again, so no arm leaked", [s.fail, s.status], [0, 0]);
  console.log(`  closing suite: ${s.pass} pass, ${s.fail} fail`);
}

/* M0-172 (BOB #33, 2026-09-24 17:12Z): the pen is this driver's own DECLARED mechanism (`.gitignore`
   names `.status-harness/`), and a declared pen is emptied by the run that made it. A CLEAN run removes
   it — the pristine copy has done its work and every arm is restored. A FAILED run KEEPS it and says where:
   the copy may be the only way back to `tools/status.mjs`. Before M0-172 every clean run left the 25 KB
   `pristine.status` behind in the worktree. */
if (!fail) {
  rmSync(PEN, { recursive: true, force: true });
  t("clean run · the pen `.status-harness/` is GONE (M0-172)", existsSync(PEN), false);
} else {
  console.log(`  PEN KEPT at ${PEN} — the run failed, so the pristine copy stays as the way back`);
}

console.log(`\nstatus.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
