/* REC-97's NEGATIVE CONTROL HARNESS. Declared in `test/cite-extent.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec97.mjs           # every arm, in order, baseline first
 *     node test/nc-rec97.mjs splice    # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it (the `nc-rec82.mjs` / `nc-rec85.mjs` precedent).
 *
 * It is `nc-rec85.mjs`'s harness with this item's arms, deliberately: a second
 * harness of one shape is the drift this repository keeps measuring. The rules
 * it obeys, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing — the only row that distinguishes
 *     seven-arms-broken from seven-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED. A match count that is not exactly 1
 *     is a FINDING, never a retry.
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
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
const SAFE = controlPen("rec97");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // both files are hundreds of KB; a restore over a stub must fail loudly.

const runOne = (suite) => {
  const r = spawnSync(process.execPath, [`test/${suite}`],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { suite, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, out,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};
const runSuite = () => runOne("cite-extent.test.mjs");

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
    files: [], why: "nothing armed — the row that distinguishes seven-arms-broken from seven-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },

  splice: {
    files: [STORE],
    why: "THE ITEM'S OWN CONTROL — the silent drop REPRODUCED. `#legExtentLines` returns [] "
       + "always, so the act accepts the extent, refuses nothing, and writes NOTHING into the "
       + "bytes: a member who named page 2 gets a leg resting on the whole document",
    mustFail: ["the leg is in the document's own bytes and carries the extent",
               "the catalogue reads the leg back as a TYPED extent",
               "and the document says a member AUTHORED an extent",
               "op=earnedbasis reads the leg back at content grain, with the member's own `ref`",
               "each arm landed in the bytes as the grammar's own typed extent",
               "the id is in the bytes as a QUOTED string"],
    mustPass: "every refusal arm in sections 3, 4 and 5 — they fire BEFORE the splice, which is "
            + "what says this arm broke the writer and not the gate; and the byte-identity pin in "
            + "section 8, because a cite that names no part has no extent lines to lose",
    patch: () => arm(STORE,
      "  static #legExtentLines(l) {\n    const keys",
      "  static #legExtentLines(l) {\n    if (true) return [];\n    const keys"),
  },

  bag: {
    files: [STORE],
    why: "the act is handed NOTHING — the `cite:` dispatch entry passes `{}` instead of the "
       + "parameters the caller sent. This is the pre-item plane exactly: a parameter nobody "
       + "reads is a parameter nobody can refuse",
    mustFail: ["the leg is in the document's own bytes and carries the extent",
               "a field the act does not carry is refused BY NAME",
               "an extent on a CASE's citation edge is refused BY NAME",
               "ONE extent across a selection that would write SEVERAL legs is refused"],
    mustPass: "the byte-identity pin in section 8 — the pre-item act is what it measures",
    patch: () => arm(STORE,
      "          extent: Object.fromEntries([...url.searchParams]\n"
      + "            .filter(([k]) => k === \"content_id\" || k.startsWith(\"extent_\"))),",
      "          extent: {},"),
  },

  unknown: {
    files: [STORE],
    why: "neuter the UNKNOWN_EXTENT_FIELD refusal, so a field the act does not carry is DROPPED "
       + "IN SILENCE — the defect in miniature, one field wide",
    mustFail: ["a field the act does not carry is refused BY NAME",
               "and it wrote nothing — a refused act leaves the question exactly as it was"],
    mustPass: "every other refusal arm; the typo must be the ONLY thing that changes",
    patch: () => arm(STORE,
      "    if (unknownFields.length)\n      return { ok: false, reason: \"UNKNOWN_EXTENT_FIELD\"",
      "    if (false && unknownFields.length)\n      return { ok: false, reason: \"UNKNOWN_EXTENT_FIELD\""),
  },

  many: {
    files: [STORE],
    why: "neuter the EXTENT_ON_MANY refusal, so ONE member's ONE page is written onto EVERY leg "
       + "the act composes — the record holding claims nobody made",
    mustFail: ["ONE extent across a selection that would write SEVERAL legs is refused",
               "every one of those refusals wrote NOTHING"],
    mustPass: "every other refusal arm, and every end-to-end arm (they cite one document each)",
    patch: () => arm(STORE,
      "    if (authored.length && add.length > 1)",
      "    if (false && authored.length && add.length > 1)"),
  },

  grammar: {
    files: [CHECKS],
    why: "neuter `checkLegExtentGrammar` — REC-84's ONE checker — at BOTH gates, so the act and "
       + "promote judge no extent grammar at all",
    /* WHAT THIS ARM MEASURES, AND IT IS NARROWER THAN ITS FIRST DECLARATION. The
       first cut declared all five section-4 arms. IT CAME BACK GREEN, and the
       reason is a fact about the plane worth more than the arm: with the
       catalogue neutered, `dom`, an unknown kind and an unparseable page are
       STILL refused — by the STORE's own `checkContentExtent` call inside
       `#contentLegRefusals`, with the SAME code. Two gates, one function, and
       the second one holds when the first is gone.
       What does NOT survive is what only the catalogue knows about a DOCUMENT:
       that an id is not shaped like one, and that a leg states its referent
       twice. Under this arm both fall through to the store, which answers the
       different and true sentence "this record holds no such row". So the
       suite's two assertions were STRENGTHENED to pin the catalogue's own
       sentence rather than the bare verdict, and the arm bites there.
       RECORDED RATHER THAN SMOOTHED: the surprising green was a finding about
       the ASSERTION, and the fix was to the assertion. */
    mustFail: ["a content id that is not one is refused BY THE CATALOGUE",
               "a leg naming BOTH an id and an extent is one fact written twice"],
    mustPass: "every STORE-gate arm in section 5, and `dom` / an unknown kind / an unparseable "
            + "page in section 4 — all three are refused by the store's own call to the same "
            + "function with the same code, which is the two-gate split this suite asserts",
    patch: () => arm(CHECKS,
      "export function checkLegExtentGrammar(leg, label, checkId, findings) {",
      "export function checkLegExtentGrammar(leg, label, checkId, findings) {\n  if (true) return;"),
  },

  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION — make the act REFUSE a cite that names no part at all. "
       + "An absent extent IS the whole document (Bob's 5.3, no `unstated`), so this is the "
       + "direction that would refuse every citation in the record and push a member toward "
       + "claiming MORE. A fence tighter than its rule is not a safer fence",
    mustFail: ["OVER-STRICTNESS: empty extent fields are NOT an authored extent and are not refused",
               "and the leg they wrote carries no extent at all",
               "a target already carrying a leg is a SUCCESS that writes nothing",
               "the document a no-extent cite writes is byte-identical to the pre-item measurement"],
    mustPass: "every arm that NAMES a part — sections 1, 2, 4, 5 and 6 — because this arm is "
            + "about the absent case and nothing else",
    /* AND IT IS RUN AGAINST THE SUITE THAT OWNS THE PRE-EXISTING INQUIRY ARM,
       not only against this item's own: an over-strictness arm that broke only
       the suite written to catch it would be measuring its author's
       imagination. `citeinquiry.test.mjs` is REC-37's, predates this item
       entirely, and every cite in it names no part — so under this arm it must
       go red.

       AND `cite.test.mjs` IS RUN AS A MUST-**PASS** CONTROL, which is a
       correction this harness's first run earned. It was declared alongside
       `citeinquiry` and came back GREEN at 73/0 — recorded as a finding and then
       understood: `cite.test.mjs` drives the CASE arm, where `ontoInquiry` is
       false and this arm's condition cannot fire. The arm is not weak there, it
       is PRECISE there, and a green is the correct outcome. Moving it from the
       must-fail list to a must-pass control keeps the evidence and stops the
       verdict lying about it. */
    alsoSuites: ["citeinquiry.test.mjs"],
    alsoMustPass: ["cite.test.mjs"],
    /* AND THE SUITE MAY DIE RATHER THAN TALLY. Under this arm the question in
       section 8 ends with NO legs at all; the suite is null-tolerant there now
       (the `citeinquiry.test.mjs` instrument lesson) and reaches its foot, but
       an arm this destructive is permitted to end the module instead, and the
       verdict below accepts a `-1` tally when the declared failures are present
       in the output. A tally of -1 with the declared lines missing is still a
       finding. */
    mayDie: true,
    patch: () => arm(STORE,
      "    const authored = Object.keys(bag).filter((k) => String(bag[k] ?? \"\").trim() !== \"\").sort();",
      "    const authored = Object.keys(bag).filter((k) => String(bag[k] ?? \"\").trim() !== \"\").sort();\n"
      + "    if (!authored.length && ontoInquiry)\n"
      + "      return { ok: false, reason: \"UNKNOWN_EXTENT_FIELD\", project, handle,\n"
      + "               detail: \"nc-rec97 overstrict arm: a cite naming no part is refused\" };"),
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
  if (a.alsoSuites) console.log(`  ALSO RUNS  ${a.alsoSuites.join(", ")} — and they MUST FAIL too`);
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
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
  for (const l of r.failing) console.log(`             ${l}`);
  const extra = (a.alsoSuites || []).map(runOne);
  for (const e of extra) console.log(`  ALSO       ${e.suite}: ${e.pass} pass, ${e.fail} fail, exit ${e.exit}  (MUST go red)`);
  const controls = (a.alsoMustPass || []).map(runOne);
  for (const e of controls) console.log(`  CONTROL    ${e.suite}: ${e.pass} pass, ${e.fail} fail, exit ${e.exit}  (MUST stay green)`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const alsoOk = extra.every((e) => e.fail > 0 || e.exit !== 0);
    const ctlOk = controls.every((e) => e.fail === 0 && e.exit === 0);
    const tallyOk = r.fail > 0 || (a.mayDie && r.exit !== 0);
    const ok = tallyOk && hit.length === a.mustFail.length && alsoOk && ctlOk;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} `
      + `declared failure(s) present, ${r.fail === -1 ? "the suite did not reach its own foot (permitted for this arm)" : `${r.fail} total failing`}`
      + (extra.length ? `, ${extra.filter((e) => e.fail > 0 || e.exit !== 0).length}/${extra.length} also-suite(s) red` : "")
      + (controls.length ? `, ${controls.filter((e) => e.fail === 0 && e.exit === 0).length}/${controls.length} control suite(s) still green` : ""));
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
