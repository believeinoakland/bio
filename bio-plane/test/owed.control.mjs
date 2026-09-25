#!/usr/bin/env node
/* D-409's NEGATIVE CONTROL DRIVER — ten arms plus an opening and closing baseline — over
 * `tools/owed.mjs` and `bio-plane/test/owed.test.mjs`.
 *
 *   node bio-plane/test/owed.control.mjs        (from the repo root)
 *
 * **THIS DRIVER EXISTS BECAUSE ITS SUBJECT SHIPPED WITH A HEADER CITING IT BEFORE IT WAS
 * WRITTEN.** `tools/owed.mjs` declared `NEGATIVE CONTROL: node bio-plane/test/owed.control.mjs`
 * in its first commit and the file did not exist — a citation to a control nobody could run,
 * which is the false-absence class the whole D-404/D-408/D-409 family exists to catch, committed
 * by a file in that family. **A declared control is a CLAIM; the artifact is the only witness.**
 *
 * TWO ARMS ARE THE MEASURED DEFECTS RATHER THAN HYPOTHETICALS. The predicate was narrowed twice
 * against the live ledger — 58 items, then 28, then 14 — and both narrowings are one edit from
 * reverting:
 *   A1 matching the row BODY, which caught every row that merely QUOTES Bob.
 *   A2 a bare `RESIDUE`, which caught the word in narration rather than in declaration.
 *
 * AND ONE ARM TESTS PRECISION RATHER THAN SENSITIVITY (A6), the distinction this estate learned
 * on 2026-09-17 when `rowsubstrate`'s withdrawn arm passed a sensitivity control easily while
 * every one of its findings on a healthy corpus was false. **A worklist that returns everything
 * is as dead as one that returns nothing, and only a precision arm can tell them apart.**
 *
 * No arm touches the estate's ledgers: the suite reads fixtures through an injected reader, and
 * its one live walk is read-only. The single thing an arm perturbs is a source file, restored and
 * verified by sha256 AND `cmp` AND a floored byte count.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".d409-harness");
const PRED = join(REPO, "tools/owed.mjs");
const SUITE = join(REPO, "bio-plane/test/owed.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

if (!ANCHOR_DRY) mkdirSync(PEN, { recursive: true });   /* M0-197: no pen, no baseline, under the dry read */
const copy = join(PEN, "pristine.owed");
if (!ANCHOR_DRY) writeFileSync(copy, readFileSync(PRED));
const PRISTINE = { sha: sha(PRED), bytes: statSync(PRED).size };
const MIN_BYTES = 4000;
console.log(`  pristine predicate: ${PRISTINE.bytes} bytes, sha256 ${PRISTINE.sha.slice(0, 8)}…`);

function restore() {
  writeFileSync(PRED, readFileSync(copy));
  const got = sha(PRED), size = statSync(PRED).size;
  const cmp = spawnSync("cmp", ["-s", PRED, copy]).status === 0;
  const ok = got === PRISTINE.sha && cmp && size === PRISTINE.bytes && size >= MIN_BYTES;
  console.log(`  restored tools/owed.mjs: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
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
  const tally = out.match(/owed: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed, passed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* HELD IS A PASS LINE THAT NAMES IT, NEVER A MISSING FAIL LINE (D-435, 2026-09-21): a fragment that
   names no assertion at all is absent from the FAIL lines too, so "did not fail" costs nothing. */
const held = (s, frag) => s.passed.some((l) => l.includes(frag));
/* Downstream of nothing — an arm that takes this down moved a second variable. */
const collateral = (s) => broke(s, "the owner and residue patterns are declared once");

console.log("\n--- ARM BASELINE · nothing armed ---");
if (!ANCHOR_DRY) {
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 20, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

const ARMS = [
  { id: "A1", title: "the owner test matches the row BODY again — the measured 58-item defect, "
                   + "where every row QUOTING Bob was read as assigning work to him",
    /* RE-AIMED 2026-09-21 (D-435, BOB #22): the line it patched gained the discharge test.
       RE-AIMED AGAIN 2026-09-24 (M0-140): that line was the DEBT walk's and the DEBT walk is retired. The defect
       is not about DEBT — it is that a predicate reading the row's BODY cannot tell a NARRATED assignment from a
       live one — and its subject is now a blocked plan row, whose HEADING assigns and whose body narrates. The arm
       adds the body to the owner test at the walk that survives, discharge left in place: one variable, as before. */
    from: "    if (owner.test(rest) && !discharge.test(rest))",
    to:   "    if ((owner.test(rest) || owner.test(r.body)) && !discharge.test(rest))",
    mustBreak: "A ROW THAT ONLY QUOTES BOB BELOW ITS HEADING IS NOT OWED" },

  /* ARMS A2, A3 and A4 WERE HERE, and are RETIRED by M0-140 (2026-09-24) with the DEBT walk they patched.
       A2 — a bare `RESIDUE` marker again (the measured 28-item defect, where prose ABOUT a residue counted as a
            declaration of one). Its subject was `owedFor`'s residue population, which no longer exists: a residue
            was a DEBT disposition declaring an unfinished half. `RESIDUE_RE` itself is NOT unguarded — it is
            `isClosedDebtRow`'s residue test, and C3 of `ledger.control.mjs` drives that definition by reverting
            it to the August form and watching `ledger.test.mjs` §3's open-spelling assertion fail.
       A3 — the CLOSED-row filter removed, so a resolved row goes on being owed for ever. Same subject, same
            reason; its call site `if (isClosedDebtRow(r.disposition)) continue;` is gone with the walk.
       A4 — the residue EXEMPTION on a closed row removed. Same.
     All three patched lines that no longer exist, so leaving them would be arms that cannot arm — and this driver
     asserts `hits === 1` per arm, which is what would have caught it. They are deleted rather than re-aimed
     because the behaviour they protected is retired, not moved. */

  { id: "A5", title: "an UNREADABLE ledger reported as an empty one — the rule this whole family "
                   + "of instruments turns on, and the one that would silently STOP the lane",
    from: "  if (o.unreadable.length)\n    return `OWED BY ${o.lane} — UNKNOWN: could not read ${o.unreadable.join(\", \")}. `\n         + `An unreadable ledger is not an empty one.`;",
    to:   "  if (false)\n    return `OWED BY ${o.lane} — UNKNOWN: could not read ${o.unreadable.join(\", \")}. `\n         + `An unreadable ledger is not an empty one.`;",
    mustBreak: "the message says UNKNOWN rather than reporting an empty list" },

  { id: "A6", title: "THE PRECISION ARM — every blocked row returned as owed, so the list is "
                   + "complete and useless. A sensitivity control would not notice.",
    /* RE-AIMED 2026-09-24 (M0-140): the DEBT walk's `if (owned || residue)` is gone; the surviving walk's own
       gate is the owner test, forced open here. The arm that matters is the DISCRIMINATION one — a filter that
       returns everything passes every assertion about a row it SHOULD return. */
    from: "    if (owner.test(rest) && !discharge.test(rest))",
    to:   "    if (true)",
    mustBreak: "A NONEXISTENT LANE IS ATTRIBUTED NOTHING" },

  { id: "A7", title: "the whole owner pattern case-INSENSITIVE again — Bob the PERSON read as the "
                   + "BOB lane, the measured defect behind all four of BOB #13's attributed rows",
    /* Re-aimed 2026-09-18: the line it patched was rewritten by the POSSESSIVE_ENDS fix, and the arm
       stopped arming — the control reading the source's TEXT, exactly as it should fail loudly. */
    from: "  + String.raw`|(?i:is )${lane}(?i:'s)` + POSSESSIVE_ENDS);",
    to:   "  + String.raw`|(?i:is )${lane}(?i:'s)` + POSSESSIVE_ENDS, \"i\");",
    mustBreak: "BOB THE PERSON IS NOT THE BOB LANE" },

  { id: "A8", title: "a blocked queue row read only to its first 220 characters again — REC-100's "
                   + "routing to BOB sat past that point and the lane was told it owed nothing",
    /* REPOINTED 2026-09-19 (M0-73): the blocked rows now come from `ledger.mjs`' `pipelineRows`, and the
       heading's remainder after its state is `rest` — the arm truncates THAT, the property it tests. */
    /* RE-AIMED 2026-09-24 (M0-140): the line gained the discharge test (D-435, re-pointed onto this walk). */
    from: "    if (owner.test(rest) && !discharge.test(rest))",
    to:   "    if (owner.test(rest.slice(0, 220)) && !discharge.test(rest))",
    mustBreak: "A ROUTING DEEP IN A LONG BLOCKED HEADING IS STILL OWED" },

  { id: "A9", title: "a possessive allowed to be followed by a NOUN — Bob the person's framing read as the BOB lane (D-127)",
    from: "  + String.raw`|(?i:is )${lane}(?i:'s)` + POSSESSIVE_ENDS);",
    to:   "  + String.raw`|(?i:is )${lane}(?i:'s)\\b`);",
    mustBreak: "A POSSESSIVE FOLLOWED BY A NOUN IS NOT AN ASSIGNMENT" },

  { id: "A10", title: "the discharge ignored again — the pre-D-435 line, where an OPEN row that once said "
                    + "ROUTED TO BOB owed BOB forever, whatever a later sentence in its cell said (D-134)",
    /* RE-AIMED 2026-09-24 (M0-140): D-435's rule moved with its subject from a DEBT disposition to a blocked
       plan row's heading (`tools/owed.mjs`). The arm drops the discharge at its one surviving site. */
    from: "    if (owner.test(rest) && !discharge.test(rest))",
    to:   "    if (owner.test(rest))",
    mustBreak: "A ROW CARRYING AN OWNER PHRASE AND A DISCHARGE FOR THE LANE IS NOT ATTRIBUTED",
    /* The per-lane arm's CONDUCT half fails WITH it by construction — it asserts CONDUCT's discharge
       works, which no row can show with the discharge gone — so it is declared here, not discovered.
       Every OTHER D-435 assertion must HOLD, and says so as a PASS line. */
    alsoBreak: "...and it IS discharged for CONDUCT",
    holds: ["OVER-STRICTNESS: the same disposition WITHOUT the discharge",
            "A DISCHARGE IS PER-LANE — a row discharged for CONDUCT",
            "BOB THE PERSON DISCHARGES NOTHING"] },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => ({ arm: a.id, file: PRED, find: a.from, put: a.to })));

for (const a of ARMS) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatch(a.from, a.to);
  t(`${a.id} · the arm ARMED (patch matched exactly once)`, hits, 1);
  const s = suiteRun();
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 48)}…"`, broke(s, a.mustBreak), true);
  if (a.alsoBreak) t(`${a.id} · ...and "${a.alsoBreak.slice(0, 36)}…" fails with it`, broke(s, a.alsoBreak), true);
  for (const h of a.holds || []) t(`${a.id} · ...while "${h.slice(0, 40)}…" HOLDS`, held(s, h), true);
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

console.log(`\nowed.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
