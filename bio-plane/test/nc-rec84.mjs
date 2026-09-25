/* REC-84's NEGATIVE CONTROL HARNESS. Declared in
 * `test/content-extent-leg.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/nc-rec84.mjs            # every arm, in order, baseline first
 *     node test/nc-rec84.mjs vwriter    # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec82.mjs` is its immediate precedent and this file is
 * its shape, arm for arm, because a second harness idiom would be a second set
 * of rules about what a control proves.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing — the only row that distinguishes
 *     eight-arms-broken from eight-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED. A match count that is not exactly 1
 *     is a FINDING, never a retry — REC-82's `stale` arm read 0 matches and
 *     looked exactly like a subject that could not be broken.
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * ONE ARM IS THIS ITEM'S OWN ARM AND IS NAMED SO: `vwriter` disables the
 * version-leg writer, and the suite must FAIL NAMING THE NULL COLUMN. It is the
 * arm that decides whether `version_content[]` is evidence at all — built from
 * the variable the INSERT was handed it would stay green with the column
 * dropped, which is the blind-by-construction shape this repository has
 * measured repeatedly. It is READ BACK out of the table for exactly that reason.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec84");
mkdirSync(SAFE, { recursive: true });

const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // both files are hundreds of KB; a restore over a stub must fail loudly.

/* Captured to a FILE and not a pipe — D-282: a suite that calls process.exit()
   discards unflushed PIPE writes, and a control whose tally reads -1 because of
   it reports the wrong arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/content-extent-leg.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /content-extent-leg: (\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, and a THROWN helper ends it before
     the foot — so a MISSING tally is reported as -1 and never as 0. This suite
     THROWS on purpose in three places (a promote that must land and is refused,
     an empty read-back), so a -1 here means "the arm broke the fixture, not the
     assertion" and the thrown message is printed below. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           threw: /Error:/.test(out) ? (/Error:.*/.exec(out) || [""])[0].slice(0, 220) : null,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  if (ANCHOR_DRY) return (anchorPatch(file, find, replace), { armed: true, matches: 1 });   /* M0-197: read, never armed */
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes eight-arms-broken from eight-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  grammar: {
    files: [CHECKS],
    why: "THE CHECKER NEUTERED: `checkLegExtentGrammar` returns immediately, so no extent grammar runs at EITHER gate and a malformed extent lands",
    mustFail: ["a malformed extent kind is refused BY C-2.8",
               "a malformed extent is REFUSED at the write",
               "a malformed extent on a VERSION leg is refused at C-25.10"],
    mustPass: "the STORE's own arms — the page set, the chain, an unknown row, a part of an inquiry. They are a different gate and the split is the point",
    patch: () => arm(CHECKS,
      "export function checkLegExtentGrammar(leg, label, checkId, findings) {",
      "export function checkLegExtentGrammar(leg, label, checkId, findings) {\n  if (true) return;"),
  },
  /* RE-CUT 2026-09-14 BY REC-85, AND THE RE-CUT IS ITSELF THE FINDING. As REC-84
     wrote it this arm flipped `sheet-cell` to `landed: true` to prove the
     unlanded refusal could fail. REC-85 landed all three arms the same day, so
     the patch's anchor no longer exists and the arm would have reported
     `ARMED NO (patch matched 0x)` — which is the shape `nc-rec82.mjs`'s `stale`
     arm recorded when a set-based rewrite moved its anchor, and the reason this
     harness prints a match count rather than trusting the edit. An arm that did
     not arm is a finding, so it is re-cut rather than left to read green.

     THE SUBJECT IT NOW PROVES IS THE ONE THAT STILL EXISTS. `landed` did not
     become decorative: the column is KEPT with every arm true precisely because
     `dom` joins the map the day CONTENT-HTML produces one, and it will arrive
     unlanded for exactly one item's width. So the arm flips `sheet-cell` back to
     `landed: false` — the direction that now breaks correct work — and the
     assertions that MUST fail are the ones saying all five are landed and that a
     LANDED arm refuses an incomplete address for the right reason. That is the
     over-strictness direction for this particular fence, and it keeps the
     `landed` mechanism under a control instead of retiring one. */
  unlanded: {
    files: [CHECKS],
    why: "flip `sheet-cell` back to UNLANDED, so a built arm is refused as un-evaluable and mints nothing — the `landed` gate still exists for `dom` and must stay under a control",
    mustFail: ["the grammar names eight kinds and ALL EIGHT are now LANDED",  /* FW-19: label moved with the roster */
               "a LANDED arm still refuses an incomplete address at the pure catalogue",
               "AN INCOMPLETE ADDRESS IS REFUSED BY NAME AT THE OP AND NEVER MINTED"],
    mustPass: "every other refusal — the arm must withdraw exactly one kind and nothing else",
    patch: () => arm(CHECKS,
      "  'sheet-cell':  { landed: true,  human: 'a cell of a spreadsheet' },",
      "  'sheet-cell':  { landed: false, human: 'a cell of a spreadsheet' },"),
  },
  rowid: {
    files: [STORE],
    why: "neuter `#contentRowFor`'s unknown-row arm, so a content id naming nothing resolves",
    mustFail: ["A CONTENT ID WHOSE ROW DOES NOT EXIST IS REFUSED BY NAME",
               "A VERSION LEG WHOSE content_id NAMES NO ROW IS REFUSED BY NAME"],
    mustPass: "the cross-document arm, which is a different fact about the same named row",
    patch: () => arm(STORE, "    if (!row)\n      return { ok: false, check: CONTENT_EXTENT_CHECKS.CONTENT_ROW_UNKNOWN.check,",
      "    if (false)\n      return { ok: false, check: CONTENT_EXTENT_CHECKS.CONTENT_ROW_UNKNOWN.check,"),
  },
  crossdoc: {
    files: [STORE],
    why: "neuter `#contentRowFor`'s same-document arm, so a leg may name a part of ANOTHER document",
    mustFail: ["A ROW OF ANOTHER DOCUMENT IS REFUSED BY NAME"],
    mustPass: "the unknown-row arm, and every extent arm — this breaks one fact and no other",
    patch: () => arm(STORE, "    if (row.bundle_id !== targetId)", "    if (false)"),
  },
  inquirypart: {
    files: [STORE],
    why: "neuter the inquiry arm in `#contentLegRefusals`, so a leg may name a PART of a question",
    mustFail: ["a pdf-page extent on an INQUIRY leg is refused",
               "and naming a part of an inquiry BY ID meets the same refusal"],
    mustPass: "the whole-inquiry leg, which is legal and must stay legal — an inquiry leg is not a broken leg",
    patch: () => arm(STORE, '        if (e0.kind !== "document" || named)', "        if (false)"),
  },
  vwriter: {
    files: [STORE],
    why: "THE ARM'S OWN ARM — the version-leg writer disabled: the INSERT is handed null instead of the resolved row",
    mustFail: ["EVERY version leg carries a content_id, and NONE is null",
               "the page leg resolves to the SAME row a basis leg citing that passage got",
               "the extentless version leg resolves to the DOCUMENT row",
               "a version leg NAMING its row is taken at its word",
               "its information legs resolve to document rows and its inquiry leg to none"],
    mustPass: "every refusal — the refusals run BEFORE the projection and are a different mechanism from the writer",
    patch: () => arm(STORE,
      "              vContentId);\n          }",
      "              null);\n          }"),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION — treat an ABSENT extent as malformed, so every leg written before this field existed is refused. A fence tighter than its rule is not a safer fence",
    mustFail: ["OVER-STRICTNESS: a leg with no extent at all raises nothing",
               "OVER-STRICTNESS: a version leg with no extent raises nothing at all"],
    mustPass: "every refusal arm above — the arm must break CORRECT WORK and nothing else. It will also break the fixtures that promote extentless legs, and those throw rather than assert, so a -1 tally here is the arm working and is recorded as such",
    patch: () => arm(CHECKS,
      "export function checkLegExtentGrammar(leg, label, checkId, findings) {\n  const bad = checkContentExtent(legExtent(leg), CONTENT_EXTENT_DOCUMENT_ONLY);",
      "export function checkLegExtentGrammar(leg, label, checkId, findings) {\n"
      + "  if (!legHasAuthoredExtent(leg) && !legContentId(leg)) {\n"
      + "    findings.push(f(checkId, 'error', `${label} names an extent this record cannot evaluate: no extent was supplied`));\n"
      + "    return;\n  }\n"
      + "  const bad = checkContentExtent(legExtent(leg), CONTENT_EXTENT_DOCUMENT_ONLY);"),
  },
};

anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  if (r.threw) console.log(`  THREW      ${r.threw}`);
  for (const l of r.failing) console.log(`             ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    /* AN ARM THAT ENDS THE SUITE BEFORE ITS FOOT (-1) IS STILL A FAILURE AND IS
       GRADED AS ONE, but it is graded SEPARATELY and printed, because "the
       subject broke" and "the fixture could not be built" are different facts
       and the second cannot tell you WHICH assertion the arm reached. Declared
       up front for `overstrict`, which necessarily refuses the fixtures. */
    const ended = r.pass === -1;
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = ended ? true : (r.fail > 0 && hit.length === a.mustFail.length);
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — `
      + (ended ? "the suite did not reach its foot: the arm made a document this plane refuses, which IS the declared failure and is recorded as such rather than as a clean tally"
               : `${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`));
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
