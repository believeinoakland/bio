/* D-513 — THE NEGATIVE CONTROL FOR `op=knock`'s THREE PRE-STORE DEC-49 CODES.
 *
 * NOT a `.test.mjs`: it patches `src/` while it runs and the battery must not
 * discover it. Re-run in one step from `bio-plane/`: `node test/nc-d513.mjs [arm]`.
 *
 * ------------------------------------------------ THE ROW'S OWN NAMED CONTROL
 *
 * D-513's row declares it: *"return one code outside the helper and arm F names
 * it multi-site (a behavioural arm cannot see it: `dec49Decorate` translates
 * from the catalogue alone)."* HALF OF THAT IS RIGHT AND HALF OF IT CANNOT
 * HAPPEN, and the difference is declared here BEFORE the arms rather than read
 * off a surprising green.
 *
 *   THE HALF THAT IS RIGHT, and it is the important half: a behavioural arm
 *   cannot see the routing. `index.mjs` carries a generic decorator,
 *   `dec49Decorate`, which fills `code`, `check` and `translation` on any
 *   `ok:false` answer whose reason names a catalogued row — so the moment these
 *   three rows exist, the sentence reaches the wire whether or not a governed
 *   helper minted it. D-508's worker measured exactly this against its own arms.
 *   ARM (1) and ARM (2) both establish it, from opposite directions.
 *
 *   THE HALF THAT CANNOT HAPPEN: arm F of `check-refusal-codes.mjs` partitions
 *   `untranslated` — `[...census.union].filter(c => !translated.has(c))` — and a
 *   code that HAS a family row is in `translated` by construction. All three of
 *   D-513's codes arrive translated, so NONE of them can ever enter arm F's
 *   subject, and arm F cannot name any of them multi-site however many sites
 *   they are minted at. That is not this item failing its control; it is the
 *   ROW naming the wrong instrument, and the right one is named below. It is
 *   also why D-513 moves NEITHER `untranslated` (292) NOR F4 (100): the old
 *   tokens stay in that partition for the seven sites elsewhere in the plane
 *   that still mint them, and those are not this door's.
 *
 * THREE INSTRUMENTS, RUN PER ARM, because the three claims fail in three places:
 *   GUARD — `civicos-ui/check-refusal-codes.mjs --strict`. It judges the SHAPE:
 *           is a refusal inside a governed region carrying a code with a row.
 *           Arm C is the teeth; a region that judges NO refusal is a FAIL by
 *           name, and that is what catches a mint that has left its helper.
 *   SWEEP — `bio-plane/test/dec49-onecode-twoconditions.sweep.mjs`. It counts a
 *           CATALOGUED code's literal return sites over comment-stripped source
 *           and prints every code with two or more. THIS is the instrument that
 *           answers "single-site", for translated and untranslated codes alike.
 *   SUITE — `bio-plane/test/doorbell.test.mjs`, which drives `op=knock` end to
 *           end. It judges what a CALLER receives. A store-level equality would
 *           not be evidence a caller can reach the feature (CLAUDE.md §5).
 *
 * ------------------------------- DECLARED BEFORE ARMING. Each arm ALONE.
 *
 * (0) BASELINE, first and last — nothing armed. GUARD exit 0 with no fails,
 *     SWEEP naming NONE of the three codes, SUITE fully green. A driver whose
 *     every arm reports "failed" cannot be told from one whose every arm is
 *     broken, so this row exists (kickoffs/WORKER.md).
 *
 * (1) SECOND-SITE — THE ROW'S ARM, spelled as the row spells it: the empty-knock
 *     call site mints `KNOCK_EMPTY` itself instead of calling `knockEmpty()`, so
 *     the code is returned from a site OUTSIDE the helper while the helper and
 *     its region stay intact and still judge a refusal.
 *       GUARD MUST STAY GREEN — for the reason declared above. Arm F cannot see
 *         it; arm C is satisfied because the region still mints; no floor moves
 *         because the added return is not inside a governed span.
 *       SWEEP MUST NAME `KNOCK_CHECKS.KNOCK_EMPTY` with 2 literal return sites.
 *       SUITE MUST STAY FULLY GREEN — the decorator carries the paper.
 *     Read together: the site count is visible, and it is visible ONLY to the
 *     sweep.
 *
 * (2) MINT-OUTSIDE-HELPER — the same call-site mint, AND `knockEmpty()`'s own
 *     return replaced by a success-shaped outcome, so the code is minted at
 *     exactly ONE site and that site is not the governed one.
 *       GUARD MUST FAIL, NAMING THE REGION `is-knock-empty` — arm C's "judged NO
 *         refusal inside the region". This is the arm that makes the region
 *         load-bearing rather than decorative.
 *       SWEEP MUST NOT name KNOCK_EMPTY: it is still at ONE site. **A SITE COUNT
 *         CANNOT TELL A GOVERNED SITE FROM AN UNGOVERNED ONE**, which is the
 *         second half of the finding about the row's declared arm.
 *       SUITE MUST STAY FULLY GREEN — the decorator again.
 *
 * (3) BLANK-TRANSLATION — `KNOCK_EMPTY`'s canned sentence emptied in the
 *     catalogue. The row still exists and still carries its check.
 *       GUARD MUST FAIL (a code inside DEC-49's enacted perimeter with no
 *         translation; gated at zero, never ratcheted).
 *       SUITE — **THE DECLARATION WAS WRONG AND IS CORRECTED HERE FROM THE FIRST
 *         RUN, NOT SMOOTHED.** It said the five empty-knock arms MUST FAIL BY
 *         NAME. They do not, and cannot: `knockEmpty()` THROWS rather than let a
 *         code reach a stranger with no sentence behind it, the throw reaches
 *         the suite through `.json()` on a 500 that is not JSON, and the module
 *         DIES BEFORE ITS FIRST EMPTY-KNOCK ASSERTION. A run that goes through
 *         no assertion at all emits no FAIL line, so "the arms failed by name"
 *         was never an outcome this arm could produce. MEASURED, first run:
 *         exit 1, NO tally (reported as -1 pass / -1 fail), zero FAIL lines,
 *         4.9s instead of 33s. The declaration is now DIES-BEFORE-ITS-FOOT and
 *         is checked as such — which is the louder outcome the throw was written
 *         for, and exactly the receipt `kickoffs/WORKER.md` records: report a
 *         missing tally as -1, never 0.
 *
 * (4) OVERSTRICT-SPELLING — OVER-STRICTNESS: correct work in a spelling nothing
 *     anticipated. The same mint with the properties in a different order and
 *     extra whitespace, on the same number of lines so no region line count
 *     moves. GUARD, SWEEP and SUITE MUST ALL BE AS AT BASELINE. A guard that
 *     fails here would be tighter than DEC-49's rule.
 *
 * WHAT THIS DRIVER CANNOT SEE, stated rather than left to be inferred: whether
 * any of the three canned sentences is a GOOD sentence (no suite judges prose),
 * and whether a surface renders them — measured, `knock` occurs 0 times in
 * `civicos-ui/app.html`, so the caller these are written for is a stranger's own
 * client and is outside this repository entirely.
 *
 * THE PEN IS OUTSIDE THE WORKTREE (BOB #32, 2026-09-24, superseding "inside your
 * own worktree"): a file in the tree is walked by repository-walking suites,
 * trips `gates.mjs`'s under-inclusion check and makes the tree DIRTY. Set
 * `NC_D513_PEN` to choose it; the default is under the OS temp root, named for
 * THIS item and this process because a shared temp root spans every session.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("../", import.meta.url));
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const SUITE = fileURLToPath(new URL("./doorbell.test.mjs", import.meta.url));
const SWEEP = fileURLToPath(new URL("./dec49-onecode-twoconditions.sweep.mjs", import.meta.url));
const INDEX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const CATALOG = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));
const GUARD = fileURLToPath(new URL("../../civicos-ui/check-refusal-codes.mjs", import.meta.url));

const DIR = process.env.NC_D513_PEN || join(tmpdir(), `nc-d513-${process.pid}`);
mkdirSync(DIR, { recursive: true });

const MIN_BYTES = 6000;
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
/* latin1, byte-exact: the plane's sources carry a stray byte (CLAUDE.md §7) and
   a utf8 round trip replaces it with U+FFFD. A control that corrupts its own
   subject on the way in refutes nothing. */
const readBytes = (f) => readFileSync(f).toString("latin1");
const writeBytes = (f, s) => writeFileSync(f, Buffer.from(s, "latin1"));
/* An anchor holding a NON-ASCII character must be written in the SAME encoding
   or it matches zero times and the arm silently does not arm (measured by
   nc-d508 on RATE_GLOBAL's em dashes). */
const lat1 = (x) => Buffer.from(x, "utf8").toString("latin1");

/* The assertions D-513 added, declared here so an arm that silently RENAMES one
   is caught rather than scored as "did not fail". */
const D513_ARMS = [
  "empty knock: the refusal carries its DEC-49 code",
  "empty knock: it names the check the code belongs to",
  "empty knock: the canned translation is a real sentence, not an empty string",
  "empty knock: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "oversize payload: the refusal carries its DEC-49 code",
  "oversize payload: it names the check the code belongs to",
  "oversize payload: the canned translation is a real sentence, not an empty string",
  "oversize payload: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "oversize envelope: the refusal carries its DEC-49 code",
  "oversize envelope: it names the check the code belongs to",
  "oversize envelope: the canned translation is a real sentence, not an empty string",
  "oversize envelope: and it is the CATALOGUE's sentence, not an inline copy in the plane",
  "empty knock refused",
  "inline instance refuses it",
  "and it is the ENVELOPE refusal, not the payload one",
];
const EMPTY_ARMS = D513_ARMS.slice(0, 4).concat(["empty knock refused"]);

const CALL_SITE = "        if (bytes.length === 0) return json(knockEmpty(), 400);";
const CALL_BARE = '        if (bytes.length === 0) return json({ ok: false, reason: "KNOCK_EMPTY" }, 400);';
const HELPER_MINT =
  '  return { ok: false, reason: "KNOCK_EMPTY", code: "KNOCK_EMPTY",\n'
+ "           check: row.check, translation: row.translation };";
const HELPER_SUCCESS =
  "  if (row) return { ok: true };\n"
+ "  return { ok: true };";
const HELPER_RESPELT =
  '  return {   ok: false,  translation: row.translation,  check: row.check,\n'
+ '           code: "KNOCK_EMPTY",   reason: "KNOCK_EMPTY"   };';
const EMPTY_TEXT = lat1(
  "    translation: 'This group\\'s inbox has nothing to keep, because what you sent decoded to no bytes at '\n"
+ "      + 'all. The request itself was well formed and named its content, so this is most likely an '\n"
+ "      + 'empty file or an empty box rather than anything wrong with how you sent it. Nothing was '\n"
+ "      + 'stored. Check what you attached and knock again.',");

const ARMS = {
  "second-site": {
    why: "THE ROW'S ARM: mint KNOCK_EMPTY at the call site, OUTSIDE the helper, with the helper and its region left intact.",
    edits: [{ file: INDEX, anchor: CALL_SITE, patch: CALL_BARE }],
    guardMustFail: false, sweepMustName: 2, suiteMustFail: [],
  },
  "mint-outside-helper": {
    why: "The same call-site mint AND the helper's own refusal replaced by a success, so the ONE site the code is minted at is not the governed one.",
    edits: [{ file: INDEX, anchor: CALL_SITE, patch: CALL_BARE },
            { file: INDEX, anchor: HELPER_MINT, patch: HELPER_SUCCESS }],
    guardMustFail: true, sweepMustName: 0, suiteMustFail: [],
  },
  "blank-translation": {
    why: "Empty KNOCK_EMPTY's canned sentence in the catalogue: the row and its check survive, the sentence behind it is gone.",
    edits: [{ file: CATALOG, anchor: EMPTY_TEXT, patch: "    translation: ''," }],
    /* CORRECTED FROM THE FIRST RUN: the suite DIES rather than failing by name —
       see (3) in the header. EMPTY_ARMS is still declared, as the set that must
       be ABSENT from the passing arms, so an arm that silently stopped driving
       the door is not read as this throw. */
    guardMustFail: true, sweepMustName: 0, suiteMustFail: [], suiteMustDie: EMPTY_ARMS,
  },
  "overstrict-spelling": {
    why: "OVER-STRICTNESS: the same mint with the properties reordered and extra whitespace, on the same number of lines.",
    edits: [{ file: INDEX, anchor: HELPER_MINT, patch: HELPER_RESPELT }],
    guardMustFail: false, sweepMustName: 0, suiteMustFail: [],
  },
};

function runGuard(tag) {
  const r = spawnSync(process.execPath, [GUARD, "--strict"], { cwd: REPO, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const fails = [...out.matchAll(/^FAIL: (.+)$/gm)].map((m) => m[1].trim());
  return { tag, exit: r.status, fails, foot: /^check-refusal-codes: /m.test(out),
           namesRegion: fails.some((f) => f.includes("is-knock-empty")),
           namesPerimeter: fails.some((f) => /NO CANNED TRANSLATION/.test(f)),
           f4: (/F4=(\d+)/.exec(out) || [])[1] ?? "?",
           untranslated: (/THE PARTITION of (\d+) untranslated/.exec(out) || [])[1] ?? "?" };
}

/* The sweep prints a CANDIDATE block per code with two or more literal sites and
   prints NOTHING for a single-site code, so "how many sites" is read off the
   block's own heading and absence means one or none. Its own FATAL lines guard
   its stripper both ways; a run that does not reach its corpus line is reported
   rather than scored. */
function runSweep(code) {
  const r = spawnSync(process.execPath, [SWEEP], { cwd: PLANE, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = new RegExp(`^CANDIDATE\\s+KNOCK_CHECKS\\.${code}\\s+— (\\d+) literal return sites`, "m").exec(out);
  const total = (/^MULTI-SITE CANDIDATES: (\d+)$/m.exec(out) || [])[1] ?? "?";
  return { exit: r.status, sites: m ? Number(m[1]) : 0, total,
           reachedFoot: /^MULTI-SITE CANDIDATES: /m.test(out), fatal: /^FATAL/m.test(out) };
}

function runSuite() {
  const started = Date.now();
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].trim());
  const passed = [...out.matchAll(/^ {2}PASS {2}(.+)$/gm)].map((m) => m[1].trim());
  const tally = /^doorbell: (\d+) pass, (\d+) fail$/m.exec(out);
  /* No tally means the module ended before its own foot — a throw inside an
     assertion goes through no assertion at all. Report -1, never 0. */
  return { exit: r.status, ms: Date.now() - started,
           pass: tally ? Number(tally[1]) : -1, fail: tally ? Number(tally[2]) : -1,
           failed, passed, reachedFoot: Boolean(tally) };
}

function baseline(when) {
  const g = runGuard(`baseline-${when}`);
  const w = runSweep("KNOCK_EMPTY");
  const s = runSuite();
  console.log(`\nBASELINE (${when})`);
  console.log(`  GUARD exit=${g.exit} fails=${g.fails.length} foot=${g.foot} · F4=${g.f4} untranslated=${g.untranslated}`);
  console.log(`  SWEEP KNOCK_EMPTY sites=${w.sites} (0 = single-site or none) · multi-site candidates=${w.total} · foot=${w.reachedFoot} fatal=${w.fatal}`);
  console.log(`  SUITE exit=${s.exit} ${s.pass} pass, ${s.fail} fail, foot=${s.reachedFoot}, ${s.ms}ms`);
  if (g.exit !== 0 || g.fails.length || !g.foot || s.exit !== 0 || s.fail !== 0 || !s.reachedFoot || w.sites !== 0)
    console.log("  !! BASELINE IS NOT AS DECLARED — every arm below is uninterpretable until this is.");
  const missing = D513_ARMS.filter((a) => !s.passed.includes(a));
  if (missing.length) console.log(`  !! D-513 arms absent from the run: ${JSON.stringify(missing)}`);
}

function arm(name) {
  const a = ARMS[name];
  const files = [...new Set(a.edits.map((e) => e.file))];
  const pens = new Map();
  for (const f of files) {
    const pristine = join(DIR, `nc-d513-pristine-${name}-${f.split("/").pop()}`);
    copyFileSync(f, pristine);
    pens.set(f, { pristine, before: sha(f), bytes: statSync(f).size });
  }
  console.log(`\nARM ${name}: ${a.why}`);
  for (const f of files) console.log(`  subject ${f.split("/").slice(-2).join("/")} (${pens.get(f).bytes} bytes)`);
  const undo = () => {
    for (const f of files) {
      const pen = pens.get(f);
      copyFileSync(pen.pristine, f);
      const after = sha(f), size = statSync(f).size;
      const same = readFileSync(pen.pristine).equals(readFileSync(f));
      console.log(`  restore ${f.split("/").pop()}: sha256 ${after === pen.before ? "MATCHES" : "DIFFERS"}`
                + ` · byte-for-byte ${same ? "identical" : "DIFFERENT"} · ${size} bytes (floor ${MIN_BYTES})`);
      if (after !== pen.before || !same || size < MIN_BYTES)
        console.log("  !! RESTORE FAILED — STOP AND FIX BY HAND BEFORE ANYTHING ELSE.");
      unlinkSync(pen.pristine);
    }
  };
  if (files.some((f) => pens.get(f).bytes < MIN_BYTES)) {
    console.log(`  !! a subject is under the ${MIN_BYTES}-byte floor — refusing to arm`); undo(); return;
  }
  /* EVERY edit must arm, and an arm that did not arm is a finding, never a pass. */
  const texts = new Map(files.map((f) => [f, readBytes(f)]));
  for (const e of a.edits) {
    const src = texts.get(e.file);
    const n = src.split(e.anchor).length - 1;
    if (n !== 1) {
      console.log(`  !! ANCHOR OCCURS ${n} TIMES, NOT 1 in ${e.file.split("/").pop()} — ARM DID NOT ARM, `
                + "and an arm that did not arm is a finding.");
      undo(); return;
    }
    const next = src.replace(e.anchor, e.patch);
    if (next === src) { console.log("  !! PATCH CHANGED NOTHING — ARM DID NOT ARM."); undo(); return; }
    texts.set(e.file, next);
  }
  for (const f of files) writeBytes(f, texts.get(f));
  let g, w, s2;
  try { g = runGuard(name); w = runSweep("KNOCK_EMPTY"); s2 = runSuite(); }
  finally { undo(); }
  const guardOk = a.guardMustFail ? (g.exit !== 0 && g.fails.length > 0) : (g.exit === 0 && g.fails.length === 0);
  console.log(`  GUARD  declared ${a.guardMustFail ? "MUST FAIL" : "MUST STAY GREEN"} · exit=${g.exit} `
            + `fails=${g.fails.length} foot=${g.foot} · names the region: ${g.namesRegion} `
            + `· names a perimeter gap: ${g.namesPerimeter} · F4=${g.f4} untranslated=${g.untranslated}`);
  for (const f of g.fails) console.log(`         ${JSON.stringify(f.slice(0, 180))}`);
  console.log(`  GUARD  ${guardOk ? "AS DECLARED" : "!! NOT AS DECLARED"}`);
  console.log(`  SWEEP  declared KNOCK_EMPTY at ${a.sweepMustName} site(s) · actually ${w.sites} `
            + `· candidates=${w.total} foot=${w.reachedFoot} fatal=${w.fatal}`);
  console.log(`  SWEEP  ${w.sites === a.sweepMustName && w.reachedFoot && !w.fatal ? "AS DECLARED" : "!! NOT AS DECLARED"}`);
  const want = a.suiteMustFail.slice().sort(), got = s2.failed.slice().sort();
  console.log(`  SUITE  exit=${s2.exit} ${s2.pass} pass, ${s2.fail} fail, foot=${s2.reachedFoot}, ${s2.ms}ms`);
  let suiteOk;
  if (a.suiteMustDie) {
    /* A DEATH IS A DIFFERENT CLAIM FROM A FAILURE and is checked as one: the
       module must NOT reach its foot, must exit non-zero, must emit no FAIL
       line (there is no assertion to fail), and must not have PASSED any of the
       arms the death is supposed to sit in front of. That last clause is what
       stops "the suite died somewhere" being read as "the suite died here". */
    const stillPassed = a.suiteMustDie.filter((x) => s2.passed.includes(x));
    suiteOk = !s2.reachedFoot && s2.exit !== 0 && got.length === 0 && stillPassed.length === 0;
    console.log(`  SUITE  MUST DIE BEFORE ITS FOOT, with none of ${JSON.stringify(a.suiteMustDie)} passed`);
    console.log(`  SUITE  ACTUALLY   foot=${s2.reachedFoot} exit=${s2.exit} fails=${JSON.stringify(got)} `
              + `still-passed=${JSON.stringify(stillPassed)}`);
  } else {
    suiteOk = JSON.stringify(want) === JSON.stringify(got);
    console.log(`  SUITE  MUST FAIL  ${JSON.stringify(want)}`);
    console.log(`  SUITE  ACTUALLY   ${JSON.stringify(got)}`);
  }
  console.log(`  SUITE  ${suiteOk ? "AS DECLARED" : "!! NOT AS DECLARED — read this before believing the suite"}`);
  const standing = a.suiteMustDie ? [] : D513_ARMS.filter((x) => !a.suiteMustFail.includes(x));
  const knocked = standing.filter((x) => s2.failed.includes(x));
  console.log(`  MUST STAND  ${standing.length} D-513 arms · ${knocked.length ? `!! ALSO DOWN: ${JSON.stringify(knocked)}` : "all standing"}`);
}

console.log(`nc-d513: pen ${DIR} (OUTSIDE the worktree — BOB #32, 2026-09-24)`);
const which = process.argv[2] || "all";
baseline("open");
for (const name of Object.keys(ARMS)) if (which === "all" || which === name) arm(name);
baseline("close");
