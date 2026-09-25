/* UI-103 — THE NEGATIVE CONTROL for `statement-writer.test.mjs`, driven and re-runnable in one step from
 * the repo root:
 *
 *     node civicos-ui/test/statement-writer.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it rewrites `civicos-ui/app.html` while it runs, and the UI runner must
 * not discover it. Each arm mutates the file ALONE (every anchored replacement asserted to match EXACTLY
 * once — an arm that did not arm is a finding, never a pass), runs the suites the arm can reach, then
 * restores from a per-arm pristine copy and verifies by sha256 AND by `cmp`, guarding a minimum byte count
 * so an empty copy cannot "match". Declared BEFORE arming, per arm: RED or GREEN; for a RED arm the text
 * its failing lines MUST name, and the ones that MUST NOT fail (the arm broke only the thing).
 *
 * THE PEN IS OUTSIDE THE WORKTREE (`mkdtemp` under the system temp root), AND THAT IS A CHOICE RATHER THAN
 * A RULE — stated, because the rule next to it is easy to get backwards and this file would otherwise say
 * so. BOB #33 RULED (2026-09-24 17:12Z, on M0-172) that **a control driver's PEN is not a session's
 * SCRATCH**: an in-worktree, gitignored, ITEM-NAMED pen STANDS, and `statement-ack.control.mjs`'s
 * `.ui89-harness/` and `several-cases-choice.control.mjs`'s `.ui81-harness/` are correct as written. What
 * BOB #32 forbids the same day is a session's own scratch in the worktree, which is a different thing.
 * This driver takes the OTHER shape M0-172's scope-add names — `mkdtempSync(join(tmpdir(), "<tag>-control-"))`
 * — because it needs no `.gitignore` entry to be safe, cannot be walked by a repository-walking suite or
 * trip `gates.mjs` §2e whatever happens to it, and `mkdtemp` gives it a name no concurrent session can
 * collide with (a shared, unqualified name is an identity nobody owns — `kickoffs/WORKER.md`). It is
 * removed on a clean run and KEPT, with its path printed, when a restore left the subject changed.
 *
 *   BASELINE                                                                            -> GREEN
 *   (A) THE ROW'S OWN CONTROL — the writer read off `completeness.author` again, which is the
 *       defect this item moves                                                          -> RED, naming
 *       "TWO ACTS, TWO NAMES", "THE MEASURED FAILURE IS GONE", "A NAME IS A NAME",
 *       "UNDETERMINED IS STATED", "AND IT IS NOT READ OFF THE PUBLISHER", "NULL IS NOT A NAME";
 *       MUST NOT fail section 2's one-member rows or "NOT A CASE, NO SENTENCE".
 *       RE-DECLARED from its first measured run — see the note at the arm.
 *   (B) THE TWO NULLS COLLAPSED — the plane's STATED undetermined rendered as the silent record
 *                                                                                       -> RED, naming
 *       "UNDETERMINED IS STATED", "THREE STATES, THREE PAGES"; MUST NOT fail "TWO ACTS, TWO NAMES"
 *   (C) THE BACK-FILL RULE 13 FORBIDS, IN THE HEADER'S LIST — the writer entry taken off the
 *       publisher when the record names no writer                                       -> RED, naming
 *       "THE LIST DOES NOT NAME ONE MEMBER TWICE", "AND IT IS NOT READ OFF THE PUBLISHER",
 *       "THE HEADER'S LIST FOLLOWS THE SAME RULE"; MUST NOT fail "TWO ACTS, TWO NAMES".
 *       ALSO RUN against `publishedcase.test.mjs`, whose corrected header row reads the same rule.
 *   (D) THE BLOCK WITH NO CALL SITE — `pubStatementWriterHtml` still defined and still correct, and
 *       page 2 never calls it (this area has shipped an act with no call site three times:
 *       CIVICOS_UI_STATE.md v50/v45/v76)                                                -> RED, naming
 *       the budgeted wait "the published case page is drawn"; the suite ENDS there by design (M0-107),
 *       so nothing later runs and nothing later is declared. ALSO RUN against `publishedcase.test.mjs`.
 *   (E) THE PLANE'S SENTENCE PARAPHRASED — a better-reading sentence this surface invented in place of
 *       `statement_by_stated` (DEC-8: the plane's words are not translated or blanked here)
 *                                                                                       -> RED, naming
 *       "UNDETERMINED IS STATED", "AND IT IS NOT READ OFF THE PUBLISHER", "NULL IS NOT A NAME";
 *       MUST NOT fail "TWO ACTS, TWO NAMES"
 *   (F) OVER-STRICTNESS — the heading and the lede re-worded in a spelling the suite did not
 *       anticipate, the facts unchanged                                                 -> GREEN
 *
 * RUN 2026-09-24 by the UI-103 worker, `civicos-ui/app.html` a18b03cd335e5e6c… (1,584,484 B), IDENTICAL by
 * sha256 AND `cmp` after every arm, driver exit 0: 7/7 AS DECLARED. BASELINE GREEN 25/0 (publishedcase
 * 245/245) · (A) RED 19/6 · (B) RED 21/4 · (C) RED 22/3 (publishedcase 244/245) · (D) RED 0/1 (publishedcase
 * 243/245) · (E) RED 22/3 · (F) GREEN 25/0 (publishedcase 245/245).
 * FIRST RUN: 6/7 — arm (A)'s declaration was wrong about WHICH rows bite, which is recorded at the arm and
 * was corrected in the SUITE (a row that could not see its own defect) rather than by adjusting the
 * declaration to whatever came back.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import path from "path";
import os from "os";
import { execFileSync, spawnSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(HERE, "..", "..");
const FILES = { app: path.join(REPO, "civicos-ui", "app.html") };
const SUITES = {
  writer: { path: path.join(HERE, "statement-writer.test.mjs"), foot: /statement-writer\.test\.mjs: (\d+ pass, \d+ fail)/ },
  published: { path: path.join(HERE, "publishedcase.test.mjs"), foot: /publishedcase: (\d+)\/(\d+) assertions/ },
};
const SCRATCH = fs.mkdtempSync(path.join(os.tmpdir(), "ui103-control-"));
const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const ARMS = [
  { name: "BASELINE", declared: "GREEN", also: ["published"] },
  /* (A) RE-DECLARED after its first run, and the re-declaration is the arm reporting a finding about the
     INSTRUMENT rather than about the subject (WORKER.md: controls here find the instrument wrong more often
     than the subject). It came back RED at the right count, but one declared line — "AND IT IS NOT READ OFF
     THE PUBLISHER" — was GREEN, and one undeclared line, "A NAME IS A NAME", fired in its place. The reason
     is a hole worth keeping: that row read the PLANE's sentence (which the named branch still renders
     verbatim, still saying the name is not read off her) and the HEADER's list (a different function this
     arm does not touch), and never asked what the page rendered as the WRITER. The suite's row is corrected
     — it now asserts the page's own render as well — and this arm was re-run ALONE against the corrected
     instrument before the declaration below was written. "A NAME IS A NAME" is declared because it is real:
     §4's named fixture says kai and the armed surface prints iris. */
  { name: "(A) the writer read off the publisher again", declared: "RED",
    names: ["TWO ACTS, TWO NAMES", "THE MEASURED FAILURE IS GONE", "A NAME IS A NAME",
            "UNDETERMINED IS STATED", "AND IT IS NOT READ OFF THE PUBLISHER", "NULL IS NOT A NAME"],
    mustNotFail: ["ONE MEMBER, AND THE PAGE SAYS SO", "NOT A CASE, NO SENTENCE"],
    edits: [["app", '  const by = (typeof cm.statement_by === "string" && cm.statement_by.trim()) ? cm.statement_by.trim() : null;',
                    '  const by = pub;']] },
  { name: "(B) the stated undetermined rendered as the silent record", declared: "RED",
    names: ["UNDETERMINED IS STATED", "THREE STATES, THREE PAGES"],
    mustNotFail: ["TWO ACTS, TWO NAMES"],
    edits: [["app", '  const state = !said ? "unstated" : (by ? "named" : "undetermined");',
                    '  const state = by ? "named" : "unstated";']] },
  { name: "(C) the header's writer entry back-filled from the publisher", declared: "RED", also: ["published"],
    names: ["THE LIST DOES NOT NAME ONE MEMBER TWICE", "AND IT IS NOT READ OFF THE PUBLISHER",
            "THE HEADER'S LIST FOLLOWS THE SAME RULE"],
    mustNotFail: ["TWO ACTS, TWO NAMES"],
    edits: [["app", '  if(by && by !== pub) names.push(by + " (wrote the statement of what this case leaves out)");',
                    '  names.push(String(by || pub) + " (wrote the statement of what this case leaves out)");']] },
  { name: "(D) the block with no call site", declared: "RED", also: ["published"],
    names: ["the published case page is drawn"],
    edits: [["app", "     ${pubStatementWriterHtml(c)}\n", "     ${\"\"}\n"]] },
  { name: "(E) the plane's sentence paraphrased", declared: "RED",
    names: ["UNDETERMINED IS STATED", "AND IT IS NOT READ OFF THE PUBLISHER", "NULL IS NOT A NAME"],
    mustNotFail: ["TWO ACTS, TWO NAMES"],
    edits: [["app", "    : state === \"undetermined\"\n      ? esc(said)\n",
                    "    : state === \"undetermined\"\n      ? \"The record does not say who wrote it.\"\n"]] },
  { name: "(F) over-strictness: the heading and the lede re-worded", declared: "GREEN", also: ["published"],
    edits: [["app", "  return '<h2>Who wrote this, and who published it</h2>'",
                    "  return '<h2>Who wrote it, and who published the case</h2>'"],
            ["app", "    + '<p class=\"subj-note\">Writing the sentence above and preparing and publishing this case are two '\n    + 'different acts. One member may have done both, and on this case that is a fact about this case '\n    + 'rather than the way it works &mdash; so each act is named for itself, and neither name is read off '\n    + 'the other.</p>'",
                    "    + '<p class=\"subj-note\">Two separate acts: writing the sentence printed above, and preparing this '\n    + 'case and publishing it. The same member may have done both, and where that happened it is a fact '\n    + 'about this case and not how the record works, so each act is named on its own and neither name is '\n    + 'taken from the other.</p>'"]] },
];

const orig = {};
for (const [k, p] of Object.entries(FILES)) {
  orig[k] = { sha: sha(p), bytes: fs.statSync(p).size };
  if (orig[k].bytes < 500000) throw new Error(`${k} is ${orig[k].bytes} bytes — too small to be the subject`);
  console.log(`${k} pristine sha256 ${orig[k].sha} (${orig[k].bytes} bytes)`);
}
console.log(`control pen: ${SCRATCH} (a mkdtemp pen outside the worktree — see the header; BOB #33 permits an in-worktree one)`);
const runSuite = (key) => spawnSync("node", [SUITES[key].path], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, cwd: REPO });
const rows = [];
let allAsDeclared = true;
try {
  for (const [i, arm] of ARMS.entries()) {
    const touched = [...new Set((arm.edits || []).map(([f]) => f))];
    const pristine = {};
    for (const f of touched) {
      pristine[f] = path.join(SCRATCH, `${f}.pristine.arm${i}`);
      fs.copyFileSync(FILES[f], pristine[f]);
      if (sha(pristine[f]) !== orig[f].sha) throw new Error(`arm ${arm.name}: pristine copy of ${f} differs`);
    }
    let armed = true;
    const src = {};
    for (const f of touched) src[f] = fs.readFileSync(FILES[f], "utf8");
    for (const [f, from, to] of arm.edits || []) {
      const hits = src[f].split(from).length - 1;
      if (hits !== 1) { armed = false; console.error(`  ARM DID NOT ARM: ${arm.name} — ${f} anchor matched ${hits} time(s): ${from.slice(0, 90)}`); }
      else src[f] = src[f].replace(from, () => to);
    }
    if (armed) for (const f of touched) fs.writeFileSync(FILES[f], src[f]);
    const r = runSuite("writer");
    const out = String(r.stdout || "") + String(r.stderr || "");
    const failLines = out.split("\n").filter((l) => /^\s*FAIL /.test(l));
    /* THE SUITE'S OWN FOOT LINE, never the wrapper's exit: a run that ends without it did not finish, and
       an absent tally reports "-1" and never "0" (WORKER.md — a TypeError inside an assertion goes through
       no assertion at all and ends the module while the tally reads clean). */
    const tally = (SUITES.writer.foot.exec(out) || [])[1] || "-1";
    const got = r.status === 0 ? "GREEN" : "RED";
    /* THE SECOND SUITE, for the arms that can reach it: `publishedcase.test.mjs` reads the same two sites
       over a PRE-RULE-13 fixture, and an arm that moves only one of the two suites is a finding about the
       reach of each. Its foot prints `N/N assertions` rather than a pass/fail pair. */
    let second = null;
    if (arm.also) {
      const r2 = runSuite("published");
      const o2 = String(r2.stdout || "") + String(r2.stderr || "");
      const m = SUITES.published.foot.exec(o2);
      second = { got: r2.status === 0 ? "GREEN" : "RED", tally: m ? `${m[1]}/${m[2]} assertions` : "-1",
                 fails: o2.split("\n").filter((l) => /^\s*FAIL /.test(l)) };
    }
    const named = arm.names ? arm.names.every((nm) => failLines.some((l) => l.includes(nm))) : null;
    const spared = arm.mustNotFail ? arm.mustNotFail.every((nm) => !failLines.some((l) => l.includes(nm))) : null;
    const asDeclared = armed && got === arm.declared && named !== false && spared !== false && tally !== "-1";
    if (!asDeclared) allAsDeclared = false;
    const restored = [];
    for (const f of touched) {
      fs.copyFileSync(pristine[f], FILES[f]);
      let cmpOk = false;
      try { execFileSync("cmp", ["-s", pristine[f], FILES[f]]); cmpOk = true; } catch (_) { cmpOk = false; }
      const s = sha(FILES[f]);
      if (s !== orig[f].sha || !cmpOk || fs.statSync(FILES[f]).size !== orig[f].bytes)
        throw new Error(`arm ${arm.name}: RESTORE FAILED for ${f} (sha ${s}, cmp ${cmpOk})`);
      restored.push(`${f} ${s.slice(0, 12)} cmp ok ${orig[f].bytes} B`);
    }
    rows.push({ arm: arm.name, declared: arm.declared, got, tally, second, asDeclared });
    console.log(`${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"} · ${arm.name} · declared ${arm.declared} · got ${got} `
      + `(exit ${r.status}, ${tally})${arm.names ? ` · names ${JSON.stringify(arm.names)}: ${named}` : ""}`
      + `${arm.mustNotFail ? ` · spares ${JSON.stringify(arm.mustNotFail)}: ${spared}` : ""}`
      + `${second ? ` · publishedcase ${second.got} (${second.tally})` : ""}`
      + `${restored.length ? ` · restored ${restored.join(", ")}` : ""}`);
    for (const l of failLines) console.log("      " + l.trim().split("\n")[0].slice(0, 220));
    if (second) for (const l of second.fails) console.log("      publishedcase: " + l.trim().split("\n")[0].slice(0, 220));
  }
} finally {
  let clean = true;
  for (const [k, p] of Object.entries(FILES)) {
    /* The pristine copies are NAMED from the arm table, never found by listing the pen — a directory walk
       is a class `hygiene.test.mjs` guards, and this needs none. */
    if (sha(p) !== orig[k].sha) {
      for (const i of ARMS.keys()) {
        const c = path.join(SCRATCH, `${k}.pristine.arm${i}`);
        if (fs.existsSync(c) && sha(c) === orig[k].sha) { fs.copyFileSync(c, p); break; }
      }
    }
    const s = sha(p);
    console.log(`${k} final sha256 ${s} — ${s === orig[k].sha ? "IDENTICAL to pristine" : "DIFFERS FROM PRISTINE"}`);
    if (s !== orig[k].sha) clean = false;
  }
  if (clean) fs.rmSync(SCRATCH, { recursive: true, force: true });
  else console.log(`PEN KEPT for inspection: ${SCRATCH}`);
}
console.log(`\nRESULTS: ${rows.map((r) => `${r.arm.split(" ")[0]} ${r.got} ${r.tally}${r.second ? ` / pc ${r.second.tally}` : ""}`).join(" · ")}`);
console.log(`statement-writer.control: ${rows.filter((r) => r.asDeclared).length}/${ARMS.length} arms AS DECLARED`);
process.exit(allAsDeclared && rows.length === ARMS.length ? 0 : 1);
