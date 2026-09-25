/* D-374's NEGATIVE CONTROL HARNESS. Declared in `test/d374-page-box.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-d374.mjs             # every arm, in order, baseline first
 *     node test/nc-d374.mjs nobound     # one arm
 *
 * NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs (the `nc-cap9.mjs`
 * precedent, copied rather than reinvented, and obeying its rules: one arm at a
 * time, a baseline row, declarations before arming, an arm that does not arm is
 * a finding, every restore verified by sha256 AND content with a byte floor).
 *
 * THE DIRECTIONS: `nobound` is the accepts-when (drop the bound and the oversize
 * rect mints); `drop` breaks the WRITER (no boxes reach the reading) where
 * `nobound` breaks the CHECKER; `origin` and `inherit` break the two ways a box
 * is easy to read wrong (compared from 0,0; read off the leaf alone);
 * `overstrict` arms the direction that refuses CORRECT work.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("d374");
mkdirSync(SAFE, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const PDFS = join(PLANE, "src/pdfstructure.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // all three files are tens to hundreds of KB; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE
   writes, and a control whose tally reads -1 because of it reports the wrong
   arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/d374-page-box.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
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
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  nobound: {
    files: [CHECKS],
    why: "THE ACCEPTS-WHEN ARM — drop the bound: `rectOffPage` answers null, so a rect is again only four finite numbers",
    mustFail: ["the oversize rect is REFUSED BY NAME",
               "and the refusal names the box it was checked against",
               "a rect that OVERLAPS the edge is refused too",
               "past the offset box's right edge (621) is refused by name",
               "while the page of the SAME document that states a box is bounded by it"],
    mustPass: "the acquire/persist arms, every in-page mint and both undetermined statements — the checker is broken, not the wire",
    patch: () => arm(CHECKS,
      "function rectOffPage(e, pageBoxes) {\n  if (!(Array.isArray",
      "function rectOffPage(e, pageBoxes) {\n  return null;\n  if (!(Array.isArray"),
  },
  drop: {
    files: [INDEX],
    why: "break the WRITER — the acquire wire persists `page_boxes: null`, which is what the record held before this item",
    mustFail: ["the reading carries ONE distinct box, used by both pages",
               "the persisted reading carries the boxes THROUGH THE OP",
               "the oversize rect is REFUSED BY NAME",
               "naming WHICH absence — this page's MediaBox, not the reading's"],
    mustPass: "the legacy arm and the document-only arm — no reading-held box is involved in either",
    patch: () => arm(INDEX, "reading.page_boxes = pageBoxes;", "reading.page_boxes = null;"),
  },
  origin: {
    files: [CHECKS],
    why: "compare against `[0, 0, w, h]` instead of the MediaBox's own corners — the reading of a box that forgets its origin",
    mustFail: ["a rect at negative coordinates inside an offset MediaBox MINTS",
               "past the offset box's right edge (621) is refused by name"],
    mustPass: "every arm on a 0,0-origin page, where the two readings agree",
    patch: () => arm(CHECKS,
      "const b = held.boxes[i], m = b.media_box, TOL",
      "const b = held.boxes[i], m = [0, 0, b.w, b.h], TOL"),
  },
  inherit: {
    files: [PDFS],
    why: "read /MediaBox and /Rotate from the LEAF page only — they are inheritable, and the offset fixture states both on its /Pages node",
    mustFail: ["an INHERITED, offset MediaBox is read up the page tree",
               "past the offset box's right edge (621) is refused by name"],
    mustPass: "every arm on the letter fixture, whose pages state their own box",
    patch: () => arm(PDFS,
      "if (map[key] !== undefined) return doc.resolve(map[key]);",
      "if (map[key] !== undefined) return doc.resolve(map[key]); if (seen === 0) return null;"),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION — refuse a rect whenever its page's box is not held. A fence tighter than its rule pushes a member toward citing the whole document, which claims MORE",
    mustFail: ["a rect on the page whose box the FILE does not state is admitted and STATED",
               "a capture acquired before D-374 (no boxes on its reading) admits the rect and STATES it"],
    mustPass: "every refusal and every bounded mint above — the arm must break correct work and nothing else",
    patch: () => arm(CHECKS,
      "if (i === null || i === undefined) return null;\n  const b = held.boxes[i]",
      "if (i === null || i === undefined) return 'no box is held for this page';\n  const b = held.boxes[i]"),
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
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
