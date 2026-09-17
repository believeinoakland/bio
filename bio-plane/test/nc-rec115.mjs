/* REC-115 NEGATIVE CONTROL DRIVER — `node test/nc-rec115.mjs [arm|all]` from `bio-plane/`.
 *
 * Built on `nc-rec92.mjs`'s harness and keeping every guard it earned: each arm
 * EDITS A REAL SOURCE, is armed ALONE, is DECLARED must-fail or must-not-fail
 * BEFORE it runs, passes an anchor-occurs-EXACTLY-ONCE guard and a
 * bytes-really-changed guard, and every restore is verified by sha256 AND by
 * `cmp` against a PRISTINE copy named UNIQUELY PER ARM with a byte count printed
 * and a minimum guarded — never `git checkout --`, which restores to HEAD and has
 * twice discarded a session's own uncommitted work in this repository. An opening
 * AND a closing BASELINE bracket the run, because a harness that reported the same
 * answer for every arm INCLUDING the baseline is on record here, and without a
 * baseline row two reds read exactly like two arms working.
 *
 * ONE THING THIS DRIVER DOES THAT `nc-rec92.mjs` DOES NOT, and it is the point of
 * the second arm: an arm may carry MORE THAN ONE EDIT. `CLAUDE.md` says to break
 * only the thing, because a control whose method perturbs a second variable
 * produces a refutation that looks more confident than the finding it refutes —
 * and arm (b) deliberately perturbs two, because it is not testing this
 * implementation at all. It stages the CHEAPEST GREEN, the alternative
 * implementation a liar would ship, and asks whether this section can tell the
 * difference. That is a different question from "does the subject work", it is
 * DECLARED as such, and arm (a) — which moves exactly one variable — is what
 * answers the first question.
 *
 * IT DRIVES TWO SUITES, not one. The plane's `passage-arm.test.mjs` is where the
 * correction lives; `civicos-ui/test/passage-surface.test.mjs` is where a member
 * actually reads the sentence, and REC-115 turned UI-62's REPORT there into an
 * ASSERTION. An arm that reddens the plane's suite and leaves the surface's green
 * would mean the surface is once again only printing.
 *
 * ARMS, DECLARED BEFORE THEY RAN, with ACTUAL recorded beside each in `ARMS`
 * below and in `passage-arm.test.mjs`'s own NEGATIVE CONTROL line.
 *
 *   (a) `levelsunstripped` — THE FIX REVERTED, one variable, one edit: the
 *       `levels` statement builds its scope from the FULL query again instead of
 *       `armSet(rowArm)`. This is the defect exactly as it shipped.
 *   (b) `liar` — the fix reverted AND `says` blinded to `documents`, which is the
 *       cheapest way to make every SENTENCE assertion pass while leaving the scope
 *       FIGURE wrong for every other reader of the envelope.
 *
 * OVER-STRICTNESS is S108 — *the TRUE zero survives* — and it is HELD OPEN under
 * both arms rather than armed on its own. This item narrows a FALSE zero and must
 * not remove the TRUE one, so an arm that took S108 down with it would mean the
 * section had been written to the fix instead of to the rule.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const QUERY = fileURLToPath(new URL("../src/query.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./passage-arm.test.mjs", import.meta.url));
const UISUITE = fileURLToPath(new URL("../../civicos-ui/test/passage-surface.test.mjs", import.meta.url));
const MIN_BYTES = { [QUERY]: 60000, [STORE]: 500000 };
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* THE REVERT, and it is the ONE variable this item moved. */
const UNSTRIP = [QUERY,
  "      const lc = cte(false, armSet(rowArm));",
  "      const lc = cte(false);"];

/* THE BLINDING. `axisSays`'s first branch is what made the two honest branches
   below it unreachable; removing the TEST rather than correcting the FIGURE is
   the cheapest green, and it is what this arm stages. The anchor is taken from
   the AXIS sentence specifically — the non-axis ternary carries nearly the same
   words and the exactly-once guard is what holds the two apart. */
const BLIND = [STORE,
  `      if (documents === 0)\n        return "nothing matched, and no document was in scope to match in — this is an empty DOCUMENT "`,
  `      if (false)\n        return "nothing matched, and no document was in scope to match in — this is an empty DOCUMENT "`];

/* Each arm: [[edit, …], declared]. */
const ARMS = {
  levelsunstripped: [[UNSTRIP],
    "MUST FAIL, and NAMING BOTH HALVES — a failure naming only one is one a reader cannot act "
    + "on. THE COLLAPSED FIGURE: S102 (`scope.documents` reads 0 over a two-document scope) and "
    + "S103 (the two halves of one envelope disagree about *in scope*). THE BRANCHES THAT BECOME "
    + "UNREACHABLE: S104 and S105 (the honest final branch), S106 (NOTHING IN SCOPE WAS "
    + "SEARCHABLE), S107 and S109 (the empties collapse to one sentence). Also S1010 (the "
    + "tautology returns: `documents_with_rows === documents` by construction), S1012 and S1013 "
    + "(the plan-level tripwires). AND THE SURFACE MUST GO RED TOO — `passage-surface.test.mjs`'s "
    + "newly-asserted no-longer-collapse, which was a REPORT until this item. MUST NOT FAIL: "
    + "S108 (THE TRUE ZERO SURVIVES — held open), S101, S1011, and every assertion of S1-S9, "
    + "because the `axis`, `rows` and `count` statements are untouched by this item."],
  liar: [[UNSTRIP, BLIND],
    "TWO EDITS ON PURPOSE, AND IT IS NOT A TEST OF THIS IMPLEMENTATION — it stages the cheapest "
    + "green (`says` stops testing `documents` at all), which reaches both branches and silences "
    + "every sentence assertion while leaving the scope figure wrong for every other reader of "
    + "the envelope. THE DECLARATION THAT MATTERS: the SENTENCE assertions S104, S106, S107 and "
    + "S109 are EXPECTED TO PASS under this arm — that is the liar succeeding — while S102, S103, "
    + "S1010, S1012 and S1013 MUST STILL FAIL, because they assert the NUMBER against an "
    + "independently-derived count and against `captures_counted`, which this arm cannot move. "
    + "If S102/S103 went green here the section would be satisfiable by silencing, and the item "
    + "would be closed by prose. S108 held open."],
};

const runOne = (suite, foot) => {
  let r;
  try {
    const out = execFileSync(process.execPath, [suite],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
    r = { text: out, code: 0 };
  } catch (e) { r = { text: `${e.stdout || ""}${e.stderr || ""}`, code: e.status ?? -1 }; }
  const m = new RegExp(`${foot}: (-?\\d+) pass, (\\d+) fail`).exec(r.text);
  return { code: r.code, foot: m, text: r.text };
};
const report = (label) => {
  const plane = runOne(SUITE, "passage-arm");
  const ui = runOne(UISUITE, "passage-surface");
  const failed = [...plane.text.matchAll(/^ {2}FAIL {2}(S\d+):/gm)].map((m) => m[1]);
  const uiFailed = (ui.text.match(/^ {2}FAIL/gm) || []).length;
  console.log(`  ${label.padEnd(17)} plane exit=${String(plane.code).padEnd(3)} `
    + `${plane.foot ? `${plane.foot[1]} pass / ${plane.foot[2]} fail`
        : "NO FOOT — the suite did not reach its own tally (report -1, never 0)"}`);
  console.log(`  ${" ".repeat(17)} plane failing: ${failed.length ? failed.join(" ") : "(none)"}`);
  console.log(`  ${" ".repeat(17)} surface exit=${String(ui.code).padEnd(3)} `
    + `${ui.foot ? `${ui.foot[1]} pass / ${ui.foot[2]} fail` : "NO FOOT"} · ${uiFailed} FAIL line(s)`);
  return failed;
};

const want = process.argv[2] || "all";
console.log(`REC-115 negative control · ${new Date().toISOString()}`);
console.log(`query.mjs ${statSync(QUERY).size} bytes · sha ${sha(QUERY).slice(0, 16)}`);
console.log(`store.mjs ${statSync(STORE).size} bytes · sha ${sha(STORE).slice(0, 16)}`);

console.log("\n  --- opening baseline ---");
report("BASELINE");

for (const [name, [edits, declared]] of Object.entries(ARMS)) {
  if (want !== "all" && want !== name) continue;
  const staged = [];
  for (const [file, anchor, repl] of edits) {
    const pristine = `${file}.pristine-rec115-${name}`;
    copyFileSync(file, pristine);
    const before = readFileSync(file, "utf8");
    const beforeSha = sha(file);
    if (statSync(pristine).size < MIN_BYTES[file])
      throw new Error(`REFUSED: pristine copy for ${name}/${file} is ${statSync(pristine).size} bytes, under the floor`);
    const n = before.split(anchor).length - 1;
    if (n !== 1) throw new Error(`REFUSED: arm ${name}'s anchor in ${file} occurs ${n} times, not once — an `
      + `arm that patches zero sites or two is a finding about the arm, not about the subject`);
    writeFileSync(file, before.replace(anchor, repl));
    if (sha(file) === beforeSha) throw new Error(`REFUSED: arm ${name} changed no bytes in ${file}`);
    staged.push([file, pristine, beforeSha]);
  }
  console.log(`\n  ARM ${name}  (${edits.length} edit(s): ${edits.map((e) => e[0].split("/").pop()).join(", ")})`);
  console.log(`  DECLARED: ${declared}`);
  report(name);
  for (const [file, pristine, beforeSha] of staged) {
    copyFileSync(pristine, file);
    const ok = sha(file) === beforeSha;
    let cmpOk = false;
    try { execFileSync("cmp", ["-s", file, pristine]); cmpOk = true; } catch { cmpOk = false; }
    console.log(`  restored byte-identically: ${ok && cmpOk ? "YES" : "NO"} `
      + `(${file.split("/").pop()}, sha ${ok ? "match" : "MISMATCH"}, cmp ${cmpOk ? "match" : "MISMATCH"}, `
      + `${statSync(file).size} bytes)`);
    if (!ok || !cmpOk) throw new Error(`REFUSED: arm ${name} did not restore ${file} — STOP, the tree is dirty`);
    unlinkSync(pristine);
  }
}

console.log("\n  --- closing baseline ---");
report("BASELINE");
