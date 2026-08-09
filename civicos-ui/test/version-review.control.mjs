#!/usr/bin/env node
/* version-review.control.mjs — UI-42'S NEGATIVE CONTROL DRIVER.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, and
 * `civicos-ui/test/run.mjs` discovers `*.test.mjs`; a driver the harness picked
 * up would mutate `app.html` underneath every other suite. UI-50's
 * `version-predecessor.control.mjs` sets the shape and this follows it.
 *
 *     node civicos-ui/test/version-review.control.mjs
 *
 * THE PRACTICES, each of which this estate has paid for:
 *   - EACH ARM IS ARMED ALONE, every other defence held open.
 *   - THERE IS A BASELINE ARM that patches NOTHING and must come back GREEN.
 *     Without it, "every arm failed" cannot be told from "the harness is broken"
 *     — a driver here once reported `null` for every arm INCLUDING the baseline.
 *   - EVERY ARM DECLARES ITS EXPECTATION BEFORE IT RUNS: RED or GREEN, and for a
 *     RED arm the text the failure must contain. An arm coming back GREEN when
 *     RED was declared is a FINDING ABOUT THE ARM and is printed as one.
 *   - EVERY PATCH IS ASSERTED TO HAVE ARMED: the anchor must occur EXACTLY ONCE
 *     and the bytes must differ afterwards. A patch that matched zero times
 *     FAILS the driver rather than quietly testing nothing.
 *   - EVERY RESTORE IS VERIFIED BY sha256 AND BY `cmp`, against a PER-ARM
 *     pristine copy whose filename carries the ARM ID as well as the path, AND
 *     against a pristine-of-record taken before any arm ran.
 *   - THE HARNESS DIRECTORY IS INSIDE THIS WORKTREE (`.ui42-harness/`), never a
 *     shared scratchpad two sessions can collide in.
 *
 * ------------------------------------------------------------ RESULTS, RUN
 *
 * RUN 2026-08-09 in worktree `agent-a8c8ed9c32eb56980`. Nine arms, each armed
 * alone; every restore verified by sha256 AND `cmp` against two independent
 * pristine copies. FINAL: 9 arms, 9 as declared, 0 not — but ONE of them was NOT
 * as declared on its first run, and that arm found THIS ITEM'S OWN SUITE wrong
 * rather than the surface. It is recorded below instead of being smoothed away.
 *
 *   (1) MAKE HIDE DELETE — the surface drops hidden readings at the load, which
 *       is what "delete" means at THIS altitude even though the plane still
 *       holds them. DECLARED: RED, naming the acts-persist arms. ACTUAL: RED —
 *       10 of 85 failed, and the five that matter name themselves: "ACTS
 *       PERSIST: the member who turned it down is still named", "…when they did
 *       it…", "…their authored reason is still readable", "…what it rests on…",
 *       "…where it came from…". The address `#versions/<INQ>/<name>` stops
 *       resolving to the reading at all, and the display stops saying it shrank
 *       — the whole of D-214 failing in one edit.
 *   (2) LEAK A BANNED WORD — the record's own set labels rendered beside the
 *       reasons. DECLARED: RED, the sweep firing and NAMING the phase and the
 *       word. ACTUAL: RED — 2 of 85, the sweep listing every phase with "the
 *       analyst's noun for a set of reasons — ground", plus the direct label
 *       arm. That is DEC-32 clause 1 measured rather than promised, and the
 *       fixture's deliberately poisoned label is what made it visible.
 *   (3) DROP THE OFFER'S DISCLOSURE — the hide offer cut to "Hiding removes this
 *       reading from the display."
 *       **FIRST RUN: RED, BUT NOT AS DECLARED — AND THE SUITE WAS THE THING
 *       THAT WAS WRONG.** Four clause arms fired and the VERBATIM arm stayed
 *       GREEN, because it read `content().includes(<the runtime's own
 *       constant>)`: a page rendering whatever the constant happens to say
 *       agrees with that constant at ZERO COST, so the one arm the acceptance
 *       actually names ("the prune offer's wording asserted verbatim") could
 *       never have failed. DEC-29(b) is a ruling about a SENTENCE and a ruling
 *       is not satisfied by a variable. The sentence is now typed out in the
 *       suite and the runtime is compared to it. SECOND RUN: RED AS DECLARED —
 *       6 of 85, the verbatim arm first.
 *   (4) ROTATION FORGETS WHERE YOU CAME FROM — `against` set to null. DECLARED:
 *       RED, the comparison arms. ACTUAL: RED — 7 of 85, including "the reading
 *       they were on becomes the one it is compared against" and every
 *       leg-delta arm. Without the memory there is no diff, which is the item's
 *       whole mechanism.
 *   (5) GUESS THE UNSTATED COMPOSITION — a reading with no relationship gets the
 *       ANY sentence anyway. DECLARED: RED. ACTUAL: RED — 2 of 85, naming the
 *       component's own refusal and the page-level scan. Worth knowing: this is
 *       the arm easiest to write off as harmless, and it is the one where the
 *       record would start claiming a structure nobody authored.
 *   (6) OVER-STRICTNESS, THE DIFF'S SHAPE — the comparison rows reordered and
 *       one relabelled, which is correct work in a spelling this suite's author
 *       did not choose. DECLARED: GREEN. ACTUAL: GREEN, 85/85 — the suite
 *       asserts the SUBSTANCE of the comparison and not its layout.
 *   (6b) OVER-STRICTNESS, A DIFFERENT SPELLING OF THE LEG NAME — the fallback
 *       rewritten as explicit null tests. DECLARED: GREEN. ACTUAL: GREEN, 85/85.
 *   (7) THE SWEEP GOES BLIND — `keep()` stops collecting phases, so the ban
 *       runs over an empty corpus. DECLARED: RED, and it must fail on the FLOOR
 *       rather than reporting "clean". ACTUAL: RED — 2 of 85, "and the sweep saw
 *       the WHOLE flow rather than one phase of it — 0 phases" and the corpus
 *       arm. A sweep that covers nothing passes everything, and this is the arm
 *       that says so.
 *   (8) BASELINE — no patch. DECLARED: GREEN. ACTUAL: GREEN, 85/85.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const UI = path.join(HERE, "..");
const APP = path.join(UI, "app.html");
const SUITE = path.join(HERE, "version-review.test.mjs");
const PEN = path.join(UI, ".ui42-harness");
fs.mkdirSync(PEN, { recursive: true });

const sha = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const same = (a, b) => { try { execFileSync("cmp", ["-s", a, b]); return true; } catch (_) { return false; } };

/* THE PRISTINE-OF-RECORD, taken ONCE before any arm and never overwritten. */
const RECORD = {};
for (const [k, p] of Object.entries({ app: APP, suite: SUITE })) {
  RECORD[k] = path.join(PEN, `record.${path.basename(p)}`);
  fs.copyFileSync(p, RECORD[k]);
  const bytes = fs.statSync(RECORD[k]).size;
  if (bytes < 2000) { console.error(`PRISTINE-OF-RECORD ${k} is ${bytes} bytes — refusing to run over an empty manifest`); process.exit(1); }
  console.log(`pristine-of-record ${k}: ${bytes} bytes, sha256 ${sha(RECORD[k]).slice(0, 16)}…`);
}

const ARMS = [
  { id: "1-hide-deletes", file: APP, mustFail: true, says: "ACTS PERSIST",
    what: "MAKE HIDE DELETE — the surface drops hidden readings at the load, so the display shrinking becomes the record shrinking",
    patch: (t) => {
      const a = 'VREV.versions = Array.isArray(answer.versions) ? answer.versions.filter(v => v && typeof v === "object") : [];';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, 'VREV.versions = Array.isArray(answer.versions) ? answer.versions.filter(v => v && typeof v === "object" && v.hidden !== true) : [];');
    } },

  { id: "2-leak-a-banned-word", file: APP, mustFail: true, says: "not one analyst word",
    what: "LEAK A BANNED WORD — the record's own set labels rendered beside the reasons (DEC-32 clause 1, D-226)",
    patch: (t) => {
      const a = "    + '<div class=\"subj-how\">Rests on: ' + esc(vrevLegList(v)) + '</div>'";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, a + "\n    + '<div class=\"subj-how\">Filed under: ' + esc((v.grounds||[]).join(\", \")) + '</div>'");
    } },

  { id: "3-offer-drops-disclosure", file: APP, mustFail: true, says: "THE OFFER'S WORDING, VERBATIM",
    what: "DROP THE OFFER'S DISCLOSURE — the hide offer cut to a bare description of the control (DEC-29(b)'s wording clause)",
    patch: (t) => {
      const a = '  "Hiding takes this reading out of this display and does nothing else. It stays in the record, "\n+ "it can still be opened and asked for by name, every act already recorded on it stays recorded, "\n+ "and this act is recorded too. Nothing is deleted, and hiding can be undone.";';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  "Hiding removes this reading from the display.";');
    } },

  { id: "4-rotation-forgets", file: APP, mustFail: true, says: "compared against",
    what: "ROTATION FORGETS WHERE YOU CAME FROM — `against` never set, so there is nothing for the comparison to be a comparison WITH",
    patch: (t) => {
      const a = "  VREV.against = VREV.focus || null;";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "  VREV.against = null;");
    } },

  { id: "5-guess-the-unstated", file: APP, mustFail: true, says: "no shape is guessed for it",
    what: "GUESS THE UNSTATED COMPOSITION — a reading the record states no relationship for gets a sentence anyway",
    patch: (t) => {
      const a = '  if(rel !== "and" && rel !== "or") return VREV_COMPOSITION_UNSTATED;';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  if(rel !== "and" && rel !== "or") return VREV_FAILS_ANY + legs.map(vrevLegName).join(", ") + ".";');
    } },

  { id: "6-over-strictness-diff", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — the comparison's rows reordered and one relabelled: correct work in a spelling this suite's author did not choose, which must PASS",
    patch: (t) => {
      const a = '  add("Where it came from", vrevOrigin(a), vrevOrigin(b));\n  add("In this display", vrevShown(a), vrevShown(b));';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  add("Where this reading is shown", vrevShown(a), vrevShown(b));\n  add("Where it came from", vrevOrigin(a), vrevOrigin(b));');
    } },

  { id: "6b-over-strictness-legname", file: APP, mustFail: false,
    what: "OVER-STRICTNESS — a different spelling of how a reason is named, which must PASS",
    patch: (t) => {
      const a = '  return String((l && (l.target_id || l.target)) || "an unnamed reason");';
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, '  if(!l) return "an unnamed reason";\n  return String(l.target_id != null ? l.target_id : (l.target != null ? l.target : "an unnamed reason"));');
    } },

  { id: "7-sweep-goes-blind", file: SUITE, mustFail: true, says: "the sweep saw the WHOLE flow",
    what: "THE SWEEP GOES BLIND — `keep()` stops collecting phases, so the ban runs over an empty corpus and must FAIL on its floor rather than report clean",
    patch: (t) => {
      const a = "const keep = (where) => { const h = content(); PHASES.push([where, h]); return h; };";
      if (t.split(a).length - 1 !== 1) return null;
      return t.replace(a, "const keep = (where) => { const h = content(); return h; };");
    } },

  { id: "8-baseline", file: APP, mustFail: false,
    what: "BASELINE — no patch at all. Without this row, seven arms failing for the wrong reason looks like seven arms working",
    patch: (t) => t },
];

const run = () => {
  try { return { code: 0, out: execFileSync("node", [SUITE], { encoding: "utf8", stdio: "pipe" }) }; }
  catch (e) { return { code: e.status === undefined ? -1 : e.status,
                       out: String(e.stdout || "") + String(e.stderr || "") }; }
};

const results = [];
let broken = 0;
for (const arm of ARMS) {
  const key = path.basename(arm.file);
  const pristine = path.join(PEN, `${arm.id}.${key}.pristine`);   // UNIQUE per arm, never path alone
  fs.copyFileSync(arm.file, pristine);
  const before = fs.readFileSync(arm.file, "utf8");
  const after = arm.patch(before);
  const armed = after !== null && (arm.id === "8-baseline" || after !== before);
  if (after === null || !armed) {
    console.error(`ARM ${arm.id}: THE PATCH NEVER ARMED — its anchor did not appear exactly once. This is a FINDING about the arm, not about the subject.`);
    broken++;
    fs.copyFileSync(pristine, arm.file);
    results.push({ arm, armed: false, asDeclared: false });
    continue;
  }
  fs.writeFileSync(arm.file, after);
  const r = run();
  /* RESTORE, THEN VERIFY TWICE AND AGAINST TWO COPIES. */
  fs.copyFileSync(pristine, arm.file);
  const rec = RECORD[arm.file === APP ? "app" : "suite"];
  const okSha = sha(arm.file) === sha(pristine) && sha(arm.file) === sha(rec);
  const okCmp = same(arm.file, pristine) && same(arm.file, rec);
  if (!okSha || !okCmp) {
    console.error(`ARM ${arm.id}: RESTORE FAILED (sha256 ${okSha}, cmp ${okCmp}) — STOPPING`);
    process.exit(1);
  }
  const failed = r.code !== 0;
  const asDeclared = failed === arm.mustFail
    && (!arm.says || !arm.mustFail || r.out.includes(arm.says));
  if (!asDeclared) broken++;
  results.push({ arm, armed, r, failed, asDeclared });
  const tally = (r.out.split("\n").find(l => /^version-review: \d+ FAILED/.test(l))
              || r.out.split("\n").find(l => /^version-review: /.test(l)) || "").trim();
  console.log(`ARM ${arm.id.padEnd(26)} armed=${armed} declared=${arm.mustFail ? "RED" : "GREEN"} `
    + `actual=${failed ? "RED" : "GREEN"} ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
  console.log(`    ${tally}`);
  for (const l of r.out.split("\n").filter(l => /^\s+FAIL /.test(l)).slice(0, 5))
    console.log(`    ${l.trim().slice(0, 170)}`);
}

console.log(`\n${results.length} arms run, ${results.filter(x => x.asDeclared).length} as declared, `
  + `${broken} NOT as declared. Every restore verified by sha256 AND cmp against a per-arm pristine copy `
  + `AND against a pristine-of-record taken before any arm ran.`);

/* THE PEN IS REMOVED ONLY AFTER EVERY RESTORE HAS BEEN VERIFIED, and it is
   removed at all because an untracked scratch file left in a worktree has
   already been swept into another item's walk and counted into its baseline
   (WORKER.md, and UI-38's delegation to M0 about `op-claims.test.mjs`). On a
   run that ends early the pen SURVIVES on purpose — that is the state where a
   restore may not have happened and the pristine copies are the evidence. */
if (!broken) { fs.rmSync(PEN, { recursive: true, force: true });
  console.log(`pen ${path.relative(process.cwd(), PEN)} removed — every restore was verified first.`); }
else console.log(`pen ${path.relative(process.cwd(), PEN)} KEPT: an arm was not as declared, so the pristine copies stay as evidence.`);
process.exit(broken ? 1 : 0);
