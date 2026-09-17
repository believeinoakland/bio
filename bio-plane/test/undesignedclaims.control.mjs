#!/usr/bin/env node
/* D-408's NEGATIVE CONTROL DRIVER — five arms plus an opening and closing baseline — over
 * `tools/undesignedclaims.mjs` and `bio-plane/test/undesignedclaims.test.mjs`.
 *
 *   node bio-plane/test/undesignedclaims.control.mjs        (from the repo root)
 *
 * **A1 AND A2 ARE THE INSTRUMENT'S OWN MEASURED DEFECTS, not hypotheticals.** It shipped with a
 * RAW COUNT and the count did not move after eight claims were resolved, because correcting a
 * claim in place — which is right, the sentence is the receipt — leaves the phrase in the file.
 * And its author's first annotation in `RECONCILED.md` sat on a DIFFERENT LINE from its claim,
 * which the instrument correctly refused to count.
 *
 * **A5 IS A PRECISION ARM.** A sweep that reports every line is as dead as one that reports
 * none, and a sensitivity control cannot tell them apart — the distinction this estate learned
 * when `rowsubstrate`'s withdrawn arm passed sensitivity while every finding on a healthy corpus
 * was false.
 *
 * No arm touches the corpus: the suite reads fixtures through an injected reader and its one live
 * sweep is read-only. The single thing an arm perturbs is a source file, restored and verified by
 * sha256 AND `cmp` AND a floored byte count.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".d408-harness");
const PRED = join(REPO, "tools/undesignedclaims.mjs");
const SUITE = join(REPO, "bio-plane/test/undesignedclaims.test.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

mkdirSync(PEN, { recursive: true });
const copy = join(PEN, "pristine.undesignedclaims");
writeFileSync(copy, readFileSync(PRED));
const PRISTINE = { sha: sha(PRED), bytes: statSync(PRED).size };
const MIN_BYTES = 4000;
console.log(`  pristine predicate: ${PRISTINE.bytes} bytes, sha256 ${PRISTINE.sha.slice(0, 8)}…`);

function restore() {
  writeFileSync(PRED, readFileSync(copy));
  const got = sha(PRED), size = statSync(PRED).size;
  const cmp = spawnSync("cmp", ["-s", PRED, copy]).status === 0;
  const ok = got === PRISTINE.sha && cmp && size === PRISTINE.bytes && size >= MIN_BYTES;
  console.log(`  restored tools/undesignedclaims.mjs: ${size} bytes, sha256 ${got.slice(0, 8)}…, `
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
  const tally = out.match(/undesignedclaims: (\d+) pass, (\d+) fail/);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]);
  return { out, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1,
           reachedFoot: !!tally, status: r.status, failed };
};
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
/* Downstream of nothing — an arm that takes this down moved a second variable. */
const collateral = (s) => broke(s, "the patterns are declared once");

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = suiteRun();
  t("baseline · the suite reached its own FOOT", s.reachedFoot, true);
  t("baseline · the suite is GREEN", [s.pass > 20, s.fail, s.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
}

const ARMS = [
  { id: "A1", title: "the AUDITED test made to ignore a date — the instrument's OWN measured "
                   + "defect, where the raw count could not go down after eight resolutions",
    from: "    const audited = AUDITED_RE.test(lines[i]);",
    to:   "    const audited = false;",
    mustBreak: "exactly one is UNAUDITED" },

  { id: "A2", title: "the audited test widened from the LINE to the WHOLE DOCUMENT — a verdict "
                   + "anywhere silences a claim everywhere, which is how the propagation happens",
    /* One line: `text` is already in scope, so document-wide is a single substitution. The
       first version was a two-part patch and the second half left the file inconsistent. */
    from: "    const audited = AUDITED_RE.test(lines[i]);",
    to:   "    const audited = AUDITED_RE.test(text);",
    mustBreak: "a verdict on ANOTHER line does NOT audit the claim" },

  { id: "A3", title: "an unreadable document scored as CLEAN — the unearned-absence rule, inside "
                   + "the instrument whose entire subject is unearned absence",
    from: "    if (t === null) { unreadable++; byDoc.push({ path: p, unreadable: true, claims: [] }); continue; }",
    to:   "    if (t === null) { continue; }",
    mustBreak: "the unreadable document is COUNTED" },

  { id: "A4", title: "one claim shape dropped from the pattern — the shapes were derived by "
                   + "reading the 21 that existed, so losing one loses a class silently",
    from: String.raw`  String.raw`+"`"+String.raw`\bhas no (?:governed )?(?:home|design)\b`+"`"+`,`,
    to:   `  String.raw`+"`"+String.raw`\bTHIS_SHAPE_NEVER_OCCURS\b`+"`"+`,`,
    mustBreak: "the 'has no home' shape is matched" },

  { id: "A5", title: "THE PRECISION ARM — every line reported as a claim, so the sweep is "
                   + "complete and useless. A sensitivity control does not notice.",
    from: "    for (const m of lines[i].matchAll(CLAIM_RE)) {",
    to:   "    for (const m of [{ index: 0, 0: lines[i] }]) {",
    mustBreak: "the innocent line is not one of them" },
];

for (const a of ARMS) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const hits = armPatch(a.from, a.to);
  t(`${a.id} · the arm ARMED (patch matched exactly once)`, hits, 1);
  const s = suiteRun();
  t(`${a.id} · the suite FAILS at "${a.mustBreak.slice(0, 46)}…"`, broke(s, a.mustBreak), true);
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

console.log(`\nundesignedclaims.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
