/* D-670's NEGATIVE CONTROL HARNESS. Declared in `test/d670-rect-space.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-d670.mjs             # every arm, in order, baseline first
 *     node test/nc-d670.mjs posfields   # one arm
 *
 * NOT a `.test.mjs`: it EDITS REAL SOURCES while it runs (the `nc-cap9.mjs`
 * precedent, copied rather than reinvented, and obeying its rules: one arm at a
 * time, a baseline row, declarations before arming, an arm that does not arm is
 * a finding, every restore verified by sha256 AND content with a byte floor).
 *
 * THE DIRECTIONS: `posfields` is the row's declared control (drop `space` where
 * a position becomes an extent); `source` drops it one seam earlier, where the
 * op actually lost it before D-670; `checker` removes the refusal; `covers`
 * breaks the attestation comparison; `overstrict` arms the direction that
 * refuses CORRECT work (an explicitly user-space rect).
 *
 * THE FILES ARE READ AND WRITTEN AS latin1, not utf8: `store.mjs` carries a
 * stray byte (CLAUDE.md §7), and a utf8 round trip would move a second
 * variable in the armed file. Restores are from the pristine copy either way.
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
const SAFE = controlPen("d670");
mkdirSync(SAFE, { recursive: true });

const STORE = join(PLANE, "src/store.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const TEXTCHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // all three files are tens to hundreds of KB; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE
   writes, and a control whose tally reads -1 because of it reports the wrong
   arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/d670-rect-space.test.mjs"],
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
  const src = readFileSync(file, "latin1");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace), "latin1");
  return { armed: true, matches: n };
}

const FITS = "the OCR pixel rect that FITS the page is refused BY NAME";
const OFF = "the OCR pixel rect OFF the page is refused for its SPACE";
const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  posfields: {
    files: [STORE],
    why: "THE ROW'S DECLARED CONTROL — `#posFields` drops `space`, so the extent reaches the checker as a user-space rect",
    mustFail: [FITS, OFF],
    mustPass: "the user-space mints, the page-only mint, the leg arms and every pure-function arm",
    patch: () => arm(STORE,
      "const { kind, ref, ...rest } = pos;\n    return rest;",
      "const { kind, ref, space, ...rest } = pos;\n    return rest;"),
  },
  source: {
    files: [TEXTCHAIN],
    why: "`readingSource` stops carrying `space` — the seam op=extractpropose crossed, and lost it at, before D-670",
    mustFail: [FITS, OFF, "the position the record keeps CARRIES its space",
               "readingSource keeps a non-user space beside a rect",
               /* it reads the position THROUGH readingSource, so the arm reaches it too */
               "readingPositionInExtent: a pixel reading is not inside a user-space extent"],
    mustPass: "the leg arms, the checker's own arms and the covers arms",
    patch: () => arm(TEXTCHAIN,
      "return space ? { kind, ref, page: source.page, rect, space }",
      "return false ? { kind, ref, page: source.page, rect, space }"),
  },
  checker: {
    files: [CHECKS],
    why: "remove the refusal — `checkContentExtent` again ignores the space",
    mustFail: [FITS, OFF, "a leg with extent_space: image-px is REFUSED BY NAME at promote",
               "the checker refuses an image arm's pixel rect too"],
    mustPass: "the user-space arms, the stored positions and the covers arms",
    patch: () => arm(CHECKS,
      "if ((e.kind === 'pdf-page' || e.kind === 'image') && extentSpace(e) !== EXTENT_USER_SPACE)",
      "if (false && (e.kind === 'pdf-page' || e.kind === 'image') && extentSpace(e) !== EXTENT_USER_SPACE)"),
  },
  covers: {
    files: [TEXTCHAIN],
    why: "`extentCovers` stops comparing spaces — an attestation over a pixel region covers a user-space leg by numeric accident",
    mustFail: ["an attestation over an OCR PIXEL region does NOT cover a user-space target",
               "so gradeCeiling does not hand the leg the attestation's ceiling across spaces"],
    mustPass: "every op arm — the attestation reader is broken, not the writer",
    patch: () => arm(TEXTCHAIN,
      "if (extentSpace(src) !== extentSpace(target)) return false;",
      ""),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION — refuse ANY stated space, `user` included. A member writing `extent_space: user` has stated the grammar's own space",
    mustFail: ["the same leg with extent_space: user MINTS"],
    mustPass: "every unstated-space arm and every pixel refusal",
    patch: () => arm(CHECKS,
      "if ((e.kind === 'pdf-page' || e.kind === 'image') && extentSpace(e) !== EXTENT_USER_SPACE)",
      "if ((e.kind === 'pdf-page' || e.kind === 'image') && e.space !== undefined && e.space !== null)"),
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
