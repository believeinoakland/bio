/* D-280 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-3's `suggest.control.mjs` precedent, taken
 * up by PL-4, PL-13, PL-14, PL-15 and D-267.
 *
 * THE PEN LIVES INSIDE THIS WORKTREE and never in a shared scratchpad
 * (PL-10: two workers wrote a harness to the same scratchpad path and the
 * second replaced the first BETWEEN arming and restoring). `.d280-harness/` is
 * gitignored for the reason written at the ignore line.
 *
 * EVERY RESTORE IS VERIFIED THREE WAYS — by sha256, by CONTENT, and by `cmp`
 * against a per-arm pristine copy named with the ARM ID as well as the path,
 * plus a pristine-of-record taken before any arm ran.
 *
 * EVERY ARM IS ARMED **ALONE**, with every other defence HELD OPEN, and every
 * arm DECLARES BEFORE IT RUNS what must fail and what must NOT.
 *
 * TWO SUITES ARE DRIVEN. `d280-strengthbar.test.mjs` is this item's own;
 * `severedhomes.test.mjs` is D-267's, and it is driven because arms (C2) and
 * (E) reach the SHARED predicate this item consumes rather than reimplements.
 * An arm that widens `#refEdgeSevered` and only measures its own suite would be
 * reporting half of what it did.
 *
 * AND AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS A FINDING ABOUT
 * THE ARM, recorded rather than smoothed.
 *
 * ---- THREE DECLARATIONS CAME BACK WRONG ON THE FIRST RUN, AND THE ARMS WERE
 *      RIGHT. Recorded here rather than quietly rewritten (D-282's precedent).
 *
 * Arms (A), (B) and (D) each DELETE one of the three call sites D-280 added, and
 * every one of them declared that `severedhomes.test.mjs` must stay WHOLLY
 * green. That was impossible by construction and nobody noticed until it was
 * measured: D-267's structural pin counts the callers of `#refEdgeSevered`
 * EXACTLY, this item corrected it from three to six, and an arm that removes a
 * call site takes the count to five. **The pin firing on all three is the pin
 * doing its job** — it is the one instrument in this estate that can see a
 * reader of the severance rule appear or disappear, which is the event no
 * behavioural arm can detect. The declarations now say so, and each of the
 * three still requires severedhomes' BEHAVIOURAL arms to stay green, which is
 * what keeps them arms about their own site rather than about the count.
 *
 * The same first run also showed arm (A) failing this suite's OWN structural
 * arms for the same reason. Declared now, for the same reason.
 *
 * Run it:  node test/d280-strengthbar.control.mjs
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = { store: ROOT + "src/store.mjs" };
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

/* THE FLOOR ON THE PRISTINE COPIES. A harness in this estate has reported a
   restore byte-identical over an EMPTY manifest, caught only because a digest
   read `e3b0c442…` — the sha256 of the empty string. Sizes are printed and
   floored before anything is armed. */
for (const [k, v] of Object.entries(ORIGINAL)) {
  console.log(`  pristine ${k}: ${v.length} bytes · sha256 ${ORIGINAL_SHA[k].slice(0, 16)}…`);
  if (v.length < 2000) { console.log(`  ** ${k} is implausibly small; refusing to arm over it`); process.exit(1); }
}

const PEN = ROOT + "../.d280-harness";
rmSync(PEN, { recursive: true, force: true });
mkdirSync(PEN, { recursive: true });
for (const [k, p] of Object.entries(F)) copyFileSync(p, join(PEN, `record.${k}`));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 900000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* A suite that THREW has NO tally and is reported as `-1` rather than `0`: a
     thrown module and a module with zero failures are different claims, and a
     TypeError inside an assertion goes through no assertion at all while the
     tally reads clean. */
  const m = /(\d+) pass(?:ed)?, (\d+) (?:FAIL|fail(?:ed)?)/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 200));
  return m ? { pass: +m[1], fail: +m[2], named, out }
           : { pass: -1, fail: -1, named, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll(armId) {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k} (arm ${armId})`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k} (arm ${armId})`);
    execFileSync("cmp", ["-s", p, join(PEN, `arm${armId}.${k}`)]);
    execFileSync("cmp", ["-s", p, join(PEN, `record.${k}`)]);
    console.log(`    ${k}: ${now.length} bytes restored, verified by sha256, by content, and by cmp x2`);
  }
}

/* `suites` is [{name, mustFail[], mustNotFail[]}]. An arm names its expectation
   PER SUITE, because this item's defect lives in one method and the predicate
   it consumes is shared with another item's suite. */
function arm(id, title, edits, suites, expectGreen = false) {
  armsRun++;
  console.log(`\n=== (${id}) ${title}`);
  for (const [k] of edits) copyFileSync(F[k], join(PEN, `arm${id}.${k}`));
  for (const k of Object.keys(F)) {
    try { readFileSync(join(PEN, `arm${id}.${k}`)); }
    catch { copyFileSync(F[k], join(PEN, `arm${id}.${k}`)); }
  }
  let wrong = false;
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    let totalFail = 0;
    for (const s of suites) {
      const r = runSuite(s.name);
      console.log(`  MEASURED ${s.name}: ${r.pass} pass, ${r.fail} fail`
        + `${r.fail === -1 ? "  ** NO TALLY — the suite THREW rather than failing, reported as -1" : ""}`);
      for (const n of r.named) console.log(`    FAILED: ${n}`);
      totalFail += Math.max(0, r.fail);
      const hit = (frag) => r.named.some((n) => n.includes(frag));
      for (const frag of (s.mustFail || []))
        if (!hit(frag) && r.fail !== -1) { console.log(`  ** WRONG: in ${s.name}, expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
      for (const frag of (s.mustNotFail || []))
        if (hit(frag)) { console.log(`  ** WRONG: in ${s.name}, "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
      if (r.fail === -1) { console.log(`  ** WRONG: ${s.name} produced no tally at all`); wrong = true; }
    }
    if (expectGreen) {
      if (totalFail !== 0) { console.log("  ** WRONG: this arm was DECLARED green and something failed"); wrong = true; }
      else console.log("  as declared: GREEN — and the green is the RESULT, not a pass. See the arm's own note.");
    } else if (totalFail === 0) {
      console.log("  ** WRONG: every suite stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (wrong) armsWrong++; else console.log("  as declared.");
  } finally {
    restoreAll(id);
  }
}

console.log("\nD-280 — negative controls. THE BASELINE FIRST, so every arm is a DELTA and so a run in\n"
          + "which every arm is broken is distinguishable from one in which every arm works.");
for (const n of ["d280-strengthbar.test.mjs", "severedhomes.test.mjs"]) {
  const b = runSuite(n);
  console.log(`  BASELINE ${n}: ${b.pass} pass, ${b.fail} fail`);
  if (b.fail !== 0) {
    console.log("  ** the tree is not whole; every arm below would measure the wrong thing");
    process.exit(1);
  }
}

const OWN = "d280-strengthbar.test.mjs", D267 = "severedhomes.test.mjs";

/* ============ (A) THE DRIVEN SITE'S CONFIRMATION, REVERTED ================ */

arm("A", "THE DEFECT ITSELF, PUT BACK. `#requiredStrengthFor` stops confirming its candidates, which "
  + "is D-280 site (a) exactly: a project whose ONLY citing relation is `status: severed` sets the "
  + "publication bar on the document it left. "
  + "DECLARED: the headline bar arm and the strictest-per-axis arm MUST fail. Every OVER-STRICTNESS "
  + "arm MUST stay green, and so must routing and restson — which is what makes this arm measure the "
  + "bar read rather than the predicate, and what stops a fix at one site reading as a fix at three.",
  [["store", `      if (kinds.every((k) => this.#refEdgeSevered(citerId, bundleId, k || null))) continue;`,
              `      /* ARMED (D-280 control A): the confirmation removed. */`]],
  [{ name: OWN,
     mustFail: ["THE DEFECT, DRIVEN", "STRICTEST-PER-AXIS STILL COMPOSES",
                "the withdrawn project is not named ANYWHERE",
                /* Declared after the first run: this arm deletes the call site,
                   so this suite's own structural arms come down too. */
                "it is CONSUMED by six call sites",
                "the driven site really consults the predicate"],
     mustNotFail: ["LIVE, and the bar stands", "THE OBLIGATION GOES TO THE OWNER",
                   "each one now CARRIES ITS STATUS", "a project that STILL CITES sets the bar"] },
   /* CORRECTED AFTER THE FIRST RUN, and the arm was right while this line was
      wrong. It DELETES a call site, so D-267's EXACT caller pin must come down
      with it; declaring severedhomes wholly green was impossible by
      construction. Its BEHAVIOURAL arms must still hold, which is what keeps
      this an arm about the bar read rather than about the count. */
   { name: D267, mustFail: ["STRUCTURAL: the severance rule has ONE definition"],
     mustNotFail: ["THE DEFECT, CLOSED", "OVER-STRICTNESS", "NOT WALKED IS NOT DELETED"] }]);

/* ============ (B) THE ROUTING SITE'S CONFIRMATION, REVERTED =============== */

arm("B", "SITE (b) PUT BACK, ALONE. `#routeTask` takes the FIRST citing project by id without asking "
  + "whether it withdrew, so the obligation is addressed to the owner of a project that left. "
  + "DECLARED: the routing arm and its basis arm MUST fail. The bar arms and the restson arms MUST "
  + "stay green — armed apart from (A) on purpose, because one confirmation covering for another is "
  + "exactly how a half-fix reads as a whole one.",
  [["store", `    const cite = [...citeEdges].find(([pid, kinds]) =>
      !kinds.every((k) => this.#refEdgeSevered(pid, bundleId, k || null)));`,
              `    const cite = [...citeEdges][0];   /* ARMED (D-280 control B) */`]],
  [{ name: OWN,
     mustFail: ["THE OBLIGATION GOES TO THE OWNER", "the routing BASIS names the project"],
     mustNotFail: ["THE DEFECT, DRIVEN", "LIVE, and the bar stands",
                   "each one now CARRIES ITS STATUS"] },
   /* CORRECTED AFTER THE FIRST RUN, same reason as (A). */
   { name: D267, mustFail: ["STRUCTURAL: the severance rule has ONE definition"],
     mustNotFail: ["THE DEFECT, CLOSED", "OVER-STRICTNESS", "NOT WALKED IS NOT DELETED"] }]);

/* == (C) OVER-STRICTNESS AT THE SITE — ANY SEVERED EDGE INSTEAD OF ALL ===== */

arm("C", "**THE ARM THIS ITEM EXISTS FOR, HALF ONE.** ANY severed edge withdraws the citer instead of "
  + "ALL of them. This is the plausible, well-meant reading of the rule and it is the direction that "
  + "silently drops a bar somebody still means: a project whose `relates_to` is withdrawn while its "
  + "`cites` stands is not a project that withdrew. "
  + "DECLARED: the other-relation over-strictness arm MUST fail. The HEADLINE MUST STAY GREEN — a "
  + "fence tighter than its rule still refuses the case it was built for, which is precisely why "
  + "over-strictness needs its own arm and cannot be read off the headline.",
  [["store", `kinds.every((k) => this.#refEdgeSevered(citerId, bundleId, k || null))`,
              `kinds.some((k) => this.#refEdgeSevered(citerId, bundleId, k || null))`]],
  [{ name: OWN,
     mustFail: ["a severed `relates_to` beside a CONFIRMED `cites`"],
     mustNotFail: ["THE DEFECT, DRIVEN", "STRICTEST-PER-AXIS STILL COMPOSES",
                   "a reference with NO `status:` key"] },
   { name: D267, mustFail: [], mustNotFail: [""] }]);

/* == (C2) OVER-STRICTNESS AT THE PREDICATE — ABSENCE AND SPELLING ========== */

arm("C2", "**THE ARM THIS ITEM EXISTS FOR, HALF TWO**, and it reaches the SHARED predicate rather "
  + "than this item's own site. `#refEdgeSevered` starts defaulting an ABSENT status to `severed` "
  + "and normalising the value before it compares, so a reference with no `status:` key, a "
  + "capitalised `Severed` and the right word with trailing whitespace all become withdrawals. "
  + "Severance would then narrow on ABSENCE and on a shape we merely failed to parse. "
  + "DECLARED: three of this item's over-strictness arms MUST fail AND D-267's own over-strictness "
  + "arms MUST fail with them — the predicate is shared, and an arm that widened it while reporting "
  + "only its own suite would be reporting half of what it did. The HEADLINE MUST STAY GREEN.",
  [["store", `    return !!entry && entry.status === "severed";   // unrecorded is LIVE`,
              `    return !!entry && String(entry.status ?? "severed").trim().toLowerCase() === "severed";`]],
  [{ name: OWN,
     mustFail: ["a reference with NO `status:` key", "`status: Severed`, capitalised",
                "the RIGHT word with trailing whitespace"],
     mustNotFail: ["THE DEFECT, DRIVEN", "STRICTEST-PER-AXIS STILL COMPOSES"] },
   { name: D267, mustFail: ["OVER-STRICTNESS"], mustNotFail: [] }]);

/* ============ (D) THE PROJECTION READ, REVERTED =========================== */

arm("D", "SITE (d) PUT BACK. `restingOn` stops attaching the status, so the read is blind again and "
  + "a caller cannot tell a leg somebody still rests on from one they recorded the decision to "
  + "withdraw. "
  + "DECLARED: both restson arms MUST fail. Nothing else may — this site publishes rather than "
  + "filters, so nothing downstream of it changes.",
  [["store", `      .map((d) => ({ ...d,
        status: this.#refEdgeSevered(d.bundle_id, targetId) ? "severed" : "confirmed" }));`,
              `;   /* ARMED (D-280 control D): the status read removed */`]],
  [{ name: OWN,
     mustFail: ["each one now CARRIES ITS STATUS"],
     mustNotFail: ["THE DEFECT, DRIVEN", "LIVE, and the bar stands", "THE OBLIGATION GOES TO THE OWNER",
                   "BOTH dependents are still LISTED"] },
   /* CORRECTED AFTER THE FIRST RUN, same reason as (A). */
   { name: D267, mustFail: ["STRUCTURAL: the severance rule has ONE definition"],
     mustNotFail: ["THE DEFECT, CLOSED", "OVER-STRICTNESS", "NOT WALKED IS NOT DELETED"] }]);

/* ============ (E) THE SHARED PREDICATE IS SHARED ========================== */

arm("E", "A FAITHFUL COPY OF THE RULE, INLINE. `#requiredStrengthFor` stops calling `#refEdgeSevered` "
  + "and re-reads the citing document's `references[]` itself — byte-for-byte the same behaviour, so "
  + "the rule has two implementations again. "
  + "DECLARED: the STRUCTURAL arms in BOTH suites MUST fail — D-267's caller count is the tripwire "
  + "this item corrected from three to six, and an arm that removes a call site has to bring it down "
  + "or the correction was decoration — and NO BEHAVIOURAL ARM MAY FAIL, ANYWHERE. **That is the "
  + "whole point.** D-267 exists because a rule with four inline implementations grew a fifth reader "
  + "that did not know the rule existed, and no behavioural arm in this estate could have caught it.",
  [["store", `      if (kinds.every((k) => this.#refEdgeSevered(citerId, bundleId, k || null))) continue;`,
              `      if (kinds.every((k) => {   /* ARMED (D-280 control E): a faithful inline copy */
        const rel = k || null;
        const cmd = this.#one(\`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'\`, citerId);
        if (!cmd || cmd.content === null) return false;
        const crefs = parseFrontmatter(cmd.content).data?.references;
        const centry = (Array.isArray(crefs) ? crefs : [])
          .find((x) => x && x.target === bundleId && (rel === null || x.rel === rel));
        return !!centry && centry.status === "severed";
      })) continue;`]],
  [{ name: OWN,
     mustFail: ["it is CONSUMED by six call sites", "the driven site really consults the predicate"],
     mustNotFail: ["THE DEFECT, DRIVEN", "STRICTEST-PER-AXIS STILL COMPOSES",
                   "LIVE, and the bar stands", "THE OBLIGATION GOES TO THE OWNER",
                   "each one now CARRIES ITS STATUS"] },
   { name: D267, mustFail: ["STRUCTURAL: the severance rule has ONE definition"],
     mustNotFail: ["THE DEFECT, CLOSED", "OVER-STRICTNESS", "NOT WALKED IS NOT DELETED"] }]);

/* ============ (G) THE BASELINE, RE-TAKEN ================================= */

console.log("\n=== (G) BASELINE RE-TAKEN — the row that distinguishes six-arms-broken from six-arms-working");
let restoredGreen = true;
for (const n of [OWN, D267]) {
  const b = runSuite(n);
  console.log(`  RESTORED ${n}: ${b.pass} pass, ${b.fail} fail`);
  if (b.fail !== 0) restoredGreen = false;
}
console.log(restoredGreen ? "  as declared: the tree is whole again."
                          : "  ** WRONG: the tree did not come back whole.");
if (!restoredGreen) armsWrong++;

console.log(`\nD-280 controls: ${armsRun} arm(s) run, ${armsWrong} NOT as declared.`);
process.exit(armsWrong ? 1 : 0);
