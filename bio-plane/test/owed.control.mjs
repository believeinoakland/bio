#!/usr/bin/env node
/* D-409's NEGATIVE CONTROL DRIVER — seven arms plus an opening and closing baseline — over
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

mkdirSync(PEN, { recursive: true });
const copy = join(PEN, "pristine.owed");
writeFileSync(copy, readFileSync(PRED));
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
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* Downstream of nothing — an arm that takes this down moved a second variable. */
const collateral = (s) => broke(s, "the owner and residue patterns are declared once");

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 20, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

const ARMS = [
  { id: "A1", title: "the owner test matches the row BODY again — the measured 58-item defect, "
                   + "where every row QUOTING Bob was read as assigning work to him",
    from: "    const owned = owner.test(r.disposition);",
    to:   "    const owned = owner.test(r.disposition) || owner.test(r.body);",
    mustBreak: "A ROW THAT ONLY QUOTES BOB IN ITS BODY IS NOT OWED" },

  { id: "A2", title: "a bare `RESIDUE` marker again — the measured 28-item defect, where prose "
                   + "ABOUT a residue counted as a declaration of one",
    from: String.raw`|\bRESIDUE[,:]? (?:NAMED|STATED|AND NOT)\b|\bOUTSTANDING\b/i;`,
    to:   String.raw`|\bRESIDUE\b|\bOUTSTANDING\b/i;`,
    mustBreak: "PROSE ABOUT a residue is NOT a declaration of one" },

  { id: "A3", title: "the CLOSED-row filter removed — a resolved row goes on being owed forever, "
                   + "which is how a worklist stops being read",
    from: `    if (/\\bCLOSED\\b|\\bFIXED AND CONFIRMED\\b/i.test(r.disposition) && !RESIDUE_RE.test(r.disposition)) continue;`,
    to:   `    if (false) continue;`,
    mustBreak: "a CLOSED row is not owed" },

  { id: "A4", title: "the residue EXEMPTION on a closed row removed — closing a row would erase "
                   + "its own honest remainder",
    from: "    const residue = RESIDUE_RE.test(r.disposition);",
    to:   "    const residue = false;",
    mustBreak: "BUT a closed row DECLARING a residue still is" },

  { id: "A5", title: "an UNREADABLE ledger reported as an empty one — the rule this whole family "
                   + "of instruments turns on, and the one that would silently STOP the lane",
    from: "  if (o.unreadable.length)\n    return `OWED BY ${o.lane} — UNKNOWN: could not read ${o.unreadable.join(\", \")}. `\n         + `An unreadable ledger is not an empty one.`;",
    to:   "  if (false)\n    return `OWED BY ${o.lane} — UNKNOWN: could not read ${o.unreadable.join(\", \")}. `\n         + `An unreadable ledger is not an empty one.`;",
    mustBreak: "the message says UNKNOWN rather than reporting an empty list" },

  { id: "A6", title: "THE PRECISION ARM — every judged row returned as owed, so the list is "
                   + "complete and useless. A sensitivity control would not notice.",
    from: "    if (owned || residue)",
    to:   "    if (true)",
    /* No alsoBreak: the CLOSED filter `continue`s before this line is reached, so closed rows
       stay excluded even with the gate forced open. Measured — the first version expected it
       and was wrong, which is the arm-that-fired-at-the-wrong-thing class one more time. */
    mustBreak: "A ROW THAT ONLY QUOTES BOB IN ITS BODY IS NOT OWED" },

  { id: "A7", title: "the whole owner pattern case-INSENSITIVE again — Bob the PERSON read as the "
                   + "BOB lane, the measured defect behind all four of BOB #13's attributed rows",
    from: "  + String.raw`|(?i:is )${lane}(?i:'s)\\b`);",
    to:   "  + String.raw`|(?i:is )${lane}(?i:'s)\\b`, \"i\");",
    mustBreak: "BOB THE PERSON IS NOT THE BOB LANE" },
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

console.log(`\nowed.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
