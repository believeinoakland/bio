/* REC-90's NEGATIVE CONTROL HARNESS. Declared in `test/content-arm.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec90.mjs             # every arm, in order, baseline first
 *     node test/nc-rec90.mjs pred        # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec83.mjs`'s shape exactly, and this file is a
 * deliberate COPY of that harness rather than an import — a control harness that
 * shares machinery with another item's harness shares that harness's defects,
 * and REC-82's own run found two of its arms wrong on the first pass.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     six-arms-broken from six-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count, and a count
 *     that is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum guarded.
 *     `git checkout --` is never used: it restores to HEAD, not to what was
 *     there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory so neither
   the battery's discovery nor the fleet walk can enrol what it holds — and never
   in the shared scratchpad, which is NOT isolated between sessions. */
const SAFE = join(REPO, ".rec90-control-pristine");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const QUERY = join(PLANE, "src/query.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
/* `query.mjs` is ~1,500 lines and `store.mjs` is over a megabyte; a restore over
   a stub must fail loudly rather than quietly measure the next arm on rubble. */
const MIN_BYTES = 20000;

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE writes,
   and a control whose tally reads -1 because of it reports the wrong arm as
   wrong. */
const runSuite = (file = "test/content-arm.test.mjs") => {
  const r = spawnSync(process.execPath, [file],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as -1
     and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes six-arms-broken from six-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  pred: {
    files: [QUERY],
    why: "ignore every sub-field's OWN predicate, so the four questions that are not "
       + "`column <cmp> ?` degrade to equality against a bound string. This is the arm that "
       + "distinguishes a registry carrying four new PREDICATES from one carrying four new NAMES — "
       + "without it the whole `content:` arm could be a set of columns nobody can actually ask "
       + "about, and every assertion that merely names a sub-field would still pass",
    mustFail: ["`content:machine` names the DOCUMENT holding a machine-marked passage",
               "`content:member` names the document a MEMBER marked",
               "`content:cap=undetermined` names the documents holding a row whose cap the record does not know",
               /* CORRECTED BY REC-104: this line named `content:layer`, which
                  failed here only because the chain filter was a predicate of its
                  own (the JSON parse). It is now `chain_kind = ?` through the
                  ORDINARY path, which this arm leaves alone, so it passes under
                  the arm by design. `chain=undetermined` still owns a predicate
                  (`chain IS NULL`) and is the chain assertion that must fail. */
               "`content:chain=undetermined` is a DIFFERENT fact from a cap it cannot determine",
               "`content:uncited` names the documents holding a passage no finding rests on"],
    mustPass: "the ORDINARY sub-field — `content:pdf-page` reads `extent_kind = ?` through the "
            + "untouched path and must stay green, which is what shows the arm broke the new "
            + "machinery and not the compiler",
    patch: () => arm(QUERY,
      `  if (sub && typeof sub.pred === "function") {`,
      `  if (false && sub && typeof sub.pred === "function") {`),
  },
  citeddrift: {
    files: [QUERY],
    why: "make the `cited` COLUMN ask only the live leg table while the FILTER keeps asking both, "
       + "which is exactly the drift `citedExists` is one function to prevent. A version leg cites "
       + "content as a live leg does, so a row a recorded basis rests on would read UNCITED — the "
       + "answer overclaiming what is unused, the direction that makes a member delete something a "
       + "finding needs",
    mustFail: ["the `cited` COLUMN agrees with the legs that actually exist"],
    mustPass: "every filter arm and the whole-set arm — this breaks the COLUMN, not the predicate, "
            + "and an arm that broke both would not be measuring the one-definition property",
    patch: () => arm(QUERY,
      `      cited: citedExists("m"),`,
      `      cited: \`EXISTS (SELECT 1 FROM inquiry_basis ib WHERE ib.content_id = m.content_id)\`,`),
  },
  nojoin: {
    files: [QUERY],
    why: "delete `rows=leg`'s reach into the content table, so `extent_kind` and `ref` leave the leg "
       + "rows. Those two columns are what turns *this leg rests on that DOCUMENT* into *this leg "
       + "rests on PAGE 2 of that document* — §1's own unanswerable question",
    mustFail: ["the three columns are on every leg row",
               "a PAGE leg carries its extent kind and IC-1's human ref",
               "a WHOLE-DOCUMENT leg says so rather than saying nothing"],
    mustPass: "every `rows=content` arm — the two row shapes are independent, and an arm that took "
            + "both down would not show that",
    patch: () => arm(QUERY,
      `    rowJoin: { table: "content", alias: "xc", on: "xc.content_id = m.content_id",\n               cols: ["extent_kind", "ref"] },`,
      ``),
  },
  levelsblind: {
    files: [STORE],
    why: "answer the level this read CANNOT see as a COUNTED zero instead of UNDETERMINED. A level "
       + "omitted or zeroed reads as a level with nothing in it, and 'we looked and found nothing' "
       + "becomes indistinguishable from 'nobody has looked yet' — CLAUDE.md's sparse rule, and the "
       + "statement IS the assertion, so an arm that left this green would mean the suite is testing "
       + "something else",
    mustFail: ["the level this read CANNOT reach is named as UNDETERMINED and says what does reach it"],
    mustPass: "the other three levels and both empty-answer sentences — the arm must break the "
            + "UNDETERMINED statement and not the tally",
    patch: () => arm(STORE,
      `    const NOBODY_LOOKED = {\n      state: "UNDETERMINED",`,
      `    const NOBODY_LOOKED = {\n      state: "COUNTED", documents: 0,`),
  },
  gateloss: {
    files: [QUERY],
    why: "THE LEAK THIS ITEM IS MOST ABLE TO PRODUCE. The four-level tally is a THIRD statement on "
       + "the meaning shape, and a tally that ran without the viewer predicate would report how many "
       + "documents exist rather than how many this viewer may see — an oracle wearing an "
       + "instrument's costume, which is the exact defect `store.mjs`'s own mint ratio shipped with. "
       + "D-15's throw in `Store#runQuery` must fire and the op must answer ok:false",
    mustFail: ["the op answers at content grain and SAYS so in words",
               "a document in scope holding NO content row answers ZERO rows"],
    mustPass: "the compile-time arms of sections 1, 2 and 3 — they never reach the store, so an arm "
            + "that took them down would be breaking the compiler rather than the gate",
    patch: () => arm(QUERY,
      `                  + \`\\nFROM scope s JOIN bundles b ON b.fts_id = s.fid\\nWHERE \${gate.sql}\`,`,
      `                  + \`\\nFROM scope s JOIN bundles b ON b.fts_id = s.fid\\nWHERE 1=1\`,`),
  },
  qualified: {
    files: [QUERY],
    why: "PUT THE PRE-EXISTING DEFECT BACK. Before this item `leg:grade>=B` compiled to "
       + "`grade = 'GRADE>=B'` — an equality no row satisfies, silently, since PL-8 — because the "
       + "sub-field split was indexOf('=') and `>=` contains one. Section 4.2's worked example "
       + "(`content:cap<C`) cannot compile without the fix, so this arm restores the world the fix "
       + "was made against and the suite must notice",
    mustFail: ["`content:cap<C` compiles to a COMPARISON on the cap column, which it did not before",
               "`content:cap<=B` likewise",
               "AND THE FIX REACHES THE ARMS THAT SHIPPED WITH THE DEFECT: `leg:grade>=B`",
               "and `resolves:grade<=B`"],
    mustPass: "THE OVER-STRICTNESS ARMS — `concerns:ENT<1` is still a bare entity value, "
            + "`resolves:>=B` on the bare field is untouched, and `leg:ground=*` still means "
            + "presence. They passed BEFORE the fix and must pass after it and under this arm; an "
            + "arm that took them down would mean the fix was a new refusal rather than a fix",
    patch: () => arm(QUERY,
      `  if (qual && Object.prototype.hasOwnProperty.call(m.sub, qual[1].toLowerCase())) {`,
      `  if (false && qual && Object.prototype.hasOwnProperty.call(m.sub, qual[1].toLowerCase())) {`),
  },
};

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
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) {
      finding++;
      for (const m of a.mustFail.filter((x) => !r.failing.some((l) => l.includes(x))))
        console.log(`  MISSING    declared failure did NOT occur: ${m}`);
    }
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
