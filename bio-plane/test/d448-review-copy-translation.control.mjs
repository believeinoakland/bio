/* D-448'S NEGATIVE CONTROL DRIVER — five arms plus a baseline, re-runnable in one step from `bio-plane/`.
 *
 *     node test/d448-review-copy-translation.control.mjs        # every arm, in order
 *     node test/d448-review-copy-translation.control.mjs a      # one arm
 *
 * Built on `d507-statement-ack-translation.control.mjs`, whose rules it keeps: DELIBERATELY NOT A
 * `.test.mjs`, because it EDITS A REAL SOURCE. Each arm is armed ALONE with every other defence held
 * open; each restore is verified by sha256, by content AND by `cmp`, with the byte count printed and
 * floored; each run's output goes to a FILE, never a pipe; a missing tally is -1, never 0.
 *
 * THE PEN IS OUTSIDE THE WORKTREE, and that is a CORRECTION to the file this driver is built on.
 * D-507's pen is `bio-plane/.nc-d507/`, inside the tree with its own `.gitignore` line. BOB #32 RULED
 * ON 2026-09-24 that every scratch file lives in the session scratchpad instead, superseding "inside
 * your own worktree", and the measurement is the argument: a file in the worktree is NOT inert —
 * repository-walking suites walk it, it trips `gates.mjs` §2e's under-inclusion check, and it makes the
 * tree DIRTY, so D-293 refuses to record a GREEN verdict. THREE ITEMS PAID FOR THAT IN ONE NIGHT
 * (REC-185's `.rec185/` moved the battery's assertion total 19513 -> 19512 with no source change;
 * D-487's in-tree gate log cost a 14-minute re-run of a green gate; D-486's scratch clone was walked by
 * `statepaths`). So the pen is taken from $NC_PEN, or from $TMPDIR, and never from this repository.
 *
 * EVERY ARM RUNS TWO INSTRUMENTS, because the row's own control is about the GUARD and the suite's pin
 * is about the ROUTING, and neither sees what the other sees:
 *   - `test/d448-review-copy-translation.test.mjs`, declared as label fragments that MUST and MUST NOT fail;
 *   - `civicos-ui/check-refusal-codes.mjs --strict`, the DEC-49 guard, declared as an exit status and,
 *     where it must fail, a NAMED fragment of its own failure text.
 *
 * THE ARMS (declared before the first run, 2026-09-24, by the D-448 worker):
 *  (baseline) NOTHING ARMED. The suite GREEN and the guard exit 0 — the row that tells five-arms-working
 *      from five-arms-broken, and the one nobody runs.
 *  (a) THE ROW'S OWN NAMED CONTROL, the one D-448's `accepts-when` declares: DROP ONE CODE'S REGION and
 *      the census arm names it. `is-review-recipient`'s marker pair is deleted, leaving C-87.8's `where`
 *      pointing at a region that is not there.
 *      MUST FAIL: the guard, naming `is-review-recipient`; and the suite's structural arm that says the
 *      region exists, opened and closed.
 *      MUST NOT FAIL: the WIRE arm for that same code. That is the arm's most important half and it is
 *      DECLARED rather than discovered — `index.mjs`'s `dec49Decorate` fills `code`, `check` and
 *      `translation` onto any `ok:false` answer whose `reason` matches a catalogue row, downstream of
 *      the store, so the sentence still reaches the member with the governance gone. A wire assertion
 *      is NOT evidence about routing. D-484 measured this and recorded it as a surprising green; D-507
 *      restated it; it is declared here for the third time rather than rediscovered a fourth.
 *  (b) A TRANSLATION BLANKED — C-87.10 `REVIEW_NO_GRANT`'s sentence emptied in the catalogue.
 *      MUST FAIL: the guard (a row with no canned translation is DEC-49's own failure); the suite's
 *      catalogue arm for that code (whose sentence is FLOORED at 60 characters as well as compared — a
 *      comparison ALONE would pass over two empty strings, which is exactly the costs-nothing equality
 *      this project has measured passing three times) and its wire arm.
 *      MUST NOT FAIL: every other code's arms.
 *  (c) A CODE RETURNED OUTSIDE THE HELPER — `REVIEW_NO_COMMENT_TEXT` restored to its pre-D-448 bare
 *      object literal, ABOVE its region, so the marker pair stands over a span that refuses nothing.
 *      MUST FAIL: the guard, naming `is-review-comment-text`; the suite's structural arms for that code
 *      (minted through the helper exactly once, inside its own region, and no bare `reason:` literal left).
 *      MUST NOT FAIL: that code's WIRE arm, for arm (a)'s reason.
 *  (d) OVER-STRICTNESS — correct work in a spelling nothing anticipated: `is-review-secret`'s two markers
 *      re-spelled. EVERYTHING MUST STAY GREEN. An arm that only ever breaks things cannot tell a guard
 *      that is strict from one that is merely brittle.
 *  (e) THE RESOLVER WIDENING REVERTED — `(?:static\s+)?` taken back out of `functionBody` in
 *      `civicos-ui/check-refusal-codes.mjs`. This arm exists because that widening is the one change
 *      D-448 makes to a SHARED instrument, and a change to a shared instrument that nothing would
 *      notice if it were reverted is a change nobody can justify.
 *      MUST FAIL: the guard, naming `#noReviewCopy` — the static method whose region it can no longer
 *      resolve. MUST NOT FAIL: the suite, which reads the sources directly and never through the guard.
 * RESULTS ARE RECORDED ON THE `NEGATIVE CONTROL:` LINE AT THE FOOT, from this driver's own print.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const REPO = join(ROOT, "..");
/* NEVER inside the repository — see the header. */
const PEN = process.env.NC_PEN ? process.env.NC_PEN : mkdtempSync(join(tmpdir(), "nc-d448-"));
const STORE = join(ROOT, "src", "store.mjs");
const CATALOG = join(ROOT, "checks", "bio-checks.mjs");
const GUARD = join(REPO, "civicos-ui", "check-refusal-codes.mjs");
const SUITE = join(DIR, "d448-review-copy-translation.test.mjs");
const LOG = join(PEN, "suite.out");
const GLOG = join(PEN, "guard.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

const edit = (file, needle, replacement) => {
  if (ANCHOR_DRY) return void anchorPatch(file, needle, replacement);   /* M0-197: read, never armed */
  /* BYTE-WISE: `store.mjs` carries a stray byte (CLAUDE.md §7), so the needle is matched on bytes. */
  const src = readFileSync(file);
  const nb = Buffer.from(needle, "utf8");
  const first = src.indexOf(nb);
  const n = first < 0 ? 0 : (src.indexOf(nb, first + 1) < 0 ? 1 : 2);
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, Buffer.concat([src.subarray(0, first), Buffer.from(replacement, "utf8"),
                                     src.subarray(first + nb.length)]));
};

/* ---- the needles, each quoted from the tree; an arm whose needle has gone stale THROWS rather than
   silently arming nothing, which this project calls a finding in its own right. ---- */
const RECIP_OPEN = `      /* DEC-49 REGION is-review-recipient */\n`;
const RECIP_END = `      /* END DEC-49 REGION is-review-recipient */\n`;

const COMMENT_BLOCK = `      /* DEC-49 REGION is-review-comment-text */
      return refusal("REVIEW_NO_COMMENT_TEXT",
               \`a comment says something: at least one character and at most \${Store.REVIEW_TEXT_MAX}.\`);
      /* END DEC-49 REGION is-review-comment-text */`;
/* The SAME refusal, built the way it was built before D-448 — a bare object literal, ABOVE the region,
   so the helper is not called and the marker pair stands over a span that refuses nothing. The span is
   left comfortably above the guard's non-trivial-span floor on purpose: an arm that tripped THAT floor
   would prove only that markers can collapse, not that a refusal left its region. */
const COMMENT_ARMED = `      return { ok: false, reason: "REVIEW_NO_COMMENT_TEXT",
               detail: \`a comment says something: at least one character and at most \${Store.REVIEW_TEXT_MAX}.\` };
      /* DEC-49 REGION is-review-comment-text */
      /* nc-d448 arm (c): this span is what C-87.11's \`where\` still claims, and the refusal that used to
         stand in it has been moved out, above the opening marker. Nothing here refuses anything. */
      const ncD448Body = body;
      void ncD448Body;
      /* END DEC-49 REGION is-review-comment-text */`;

const C8710 = `    translation: 'Say which grant to withdraw, by the id you were given when it was issued. Nothing was '
      + 'withdrawn. This answer says only that no grant was named; it says nothing about which grants exist.',`;

const SECRET_OPEN = `      /* DEC-49 REGION is-review-secret */`;
const SECRET_END = `      /* END DEC-49 REGION is-review-secret */`;

const STATIC_RE = `(?:^|\\\\n)\\\\s*(?:export\\\\s+)?(?:static\\\\s+)?(?:async\\\\s+)?(?:function\\\\s+)?\${esc}\\\\s*\\\\(`;
const PLAIN_RE = `(?:^|\\\\n)\\\\s*(?:export\\\\s+)?(?:async\\\\s+)?(?:function\\\\s+)?\${esc}\\\\s*\\\\(`;

/* A DECLARED ASSERTION CARRIES TWO SPELLINGS, and it needs both: `out` is what the suite PRINTS (the
   label after its template interpolations), `src` is a fragment of the suite's SOURCE. A declaration
   checked only against the printed output cannot notice that it names an assertion nobody wrote; one
   checked only against the source cannot match an interpolated label at all. */
const REGION_EXISTS = { out: "REVIEW_NO_RECIPIENT's region `is-review-recipient` exists in store.mjs",
                        src: "exists in store.mjs, opened and closed" };
const CAT_8710 = { out: "REVIEW_NO_GRANT carries a canned sentence that is prose",
                   src: "carries a canned sentence that is prose, not the code re-spelled" };
const WIRE_8710 = { out: "a withdrawal naming no grant — `translation` is the catalogue's own sentence",
                    /* The suite writes these labels in TEMPLATE literals with ESCAPED backticks, so a
                       `src` fragment carrying a bare backtick matches the PRINTED label and never the
                       SOURCE. Caught by this driver's own pre-arm check on its first run — an arm that
                       cannot arm is a finding, and the check is what turns it into one. */
                    src: "is the catalogue's own sentence, arriving at the member" };
const NO_SENTENCE_SHARE = { out: "no two of the eleven share a translation",
                            src: "no two of the eleven share a translation" };
const PIN_HELPER_ONCE = { out: "REVIEW_NO_COMMENT_TEXT is minted through the `refusal` helper EXACTLY ONCE",
                          src: "helper EXACTLY ONCE in store.mjs" };
const PIN_IN_REGION = { out: "REVIEW_NO_COMMENT_TEXT's one mint is INSIDE its own region",
                        src: "'s one mint is INSIDE its own region" };
const PIN_NO_LITERAL = { out: "REVIEW_NO_COMMENT_TEXT is no longer returned as a bare `reason:` object literal",
                         src: "is no longer returned as a bare" };

const ARMS = {
  baseline: {
    files: [], label: "nothing armed — what tells five-arms-working from five-arms-broken",
    apply: () => {}, mustFail: [], guardMustPass: true, expectGreen: true,
  },
  a: {
    files: [STORE],
    label: "(A) THE ROW'S OWN — is-review-recipient's REGION DROPPED, C-87.8's `where` left pointing at nothing",
    apply: () => { edit(STORE, RECIP_OPEN, ""); edit(STORE, RECIP_END, ""); },
    mustFail: [REGION_EXISTS],
    guardMustPass: false, guardMustName: "is-review-recipient",
  },
  b: {
    files: [CATALOG],
    label: "(B) A TRANSLATION BLANKED — C-87.10 REVIEW_NO_GRANT's sentence emptied in the catalogue",
    apply: () => edit(CATALOG, C8710, "    translation: '',"),
    /* A DECLARATION WITHDRAWN, with its reason, rather than quietly dropped. This arm first declared
       that blanking a sentence would also fail the no-two-share arm, by collapsing eleven distinct
       translations to ten. IT DID NOT, and the arm was wrong rather than the suite: emptying ONE
       sentence leaves ten distinct sentences plus one empty string, which is still eleven distinct
       values. Blanking TWO would collapse it; blanking one never could. `NO_SENTENCE_SHARE` is kept
       defined above because arm (b) is the arm a future reader will reach for to test it. */
    mustFail: [CAT_8710, WIRE_8710],
    guardMustPass: false, guardMustName: "REVIEW_NO_GRANT",
  },
  c: {
    files: [STORE],
    label: "(C) OUTSIDE THE HELPER — REVIEW_NO_COMMENT_TEXT back to its pre-D-448 bare object literal",
    apply: () => edit(STORE, COMMENT_BLOCK, COMMENT_ARMED),
    mustFail: [PIN_HELPER_ONCE, PIN_IN_REGION, PIN_NO_LITERAL],
    guardMustPass: false, guardMustName: "is-review-comment-text",
  },
  d: {
    files: [STORE],
    label: "(D) OVER-STRICTNESS — is-review-secret's markers re-spelled; everything must stay GREEN",
    apply: () => {
      edit(STORE, SECRET_OPEN, `      /**   DEC-49 REGION is-review-secret  (re-spelled by a control arm)  **/`);
      edit(STORE, SECRET_END, `      /**   END DEC-49 REGION is-review-secret  (re-spelled by a control arm)  **/`);
    },
    mustFail: [], guardMustPass: true, expectGreen: true,
  },
  e: {
    files: [GUARD],
    label: "(E) THE RESOLVER WIDENING REVERTED — `functionBody` can no longer see past `static`",
    apply: () => edit(GUARD, STATIC_RE, PLAIN_RE),
    mustFail: [], guardMustPass: false, guardMustName: "#noReviewCopy", expectGreen: true,
  },
};

anchorEach(ARMS, (a) => a.apply());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

/* A DECLARATION THAT NAMES A LABEL THE SUITE DOES NOT CARRY IS A DECLARATION ABOUT NOTHING. */
{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => a.mustFail))].filter((f) => !suiteSrc.includes(f.src));
  if (dead.length) {
    console.log(`\nDECLARATION REFERS TO ${dead.length} LABEL(S) THE SUITE DOES NOT CONTAIN — refusing to arm:`);
    for (const f of dead) console.log(`  - ${f.src}`);
    process.exit(4);
  }
}

mkdirSync(PEN, { recursive: true });
console.log(`pen: ${PEN}  (outside the worktree — BOB #32, 2026-09-24)`);
const results = [];

const run = (cmd, args, cwd, out) => {
  try {
    execFileSync("/bin/sh", ["-c",
      `${JSON.stringify(cmd)} ${args.map((a) => JSON.stringify(a)).join(" ")} > ${JSON.stringify(out)} 2>&1`],
      { cwd, stdio: "ignore" });
    return 0;
  } catch (e) { return typeof e.status === "number" ? e.status : 1; }
};

for (const name of order) {
  const arm = ARMS[name];
  const snaps = arm.files.map((f) => {
    const buf = readFileSync(f);
    if (buf.length < FLOOR) throw new Error(`refusing to snapshot a suspiciously small ${f}: ${buf.length} bytes`);
    const copy = join(PEN, `${name}--${f.split("/").pop()}.pristine`);
    writeFileSync(copy, buf);
    return { file: f, copy, bytes: buf.length, sha: sha(buf) };
  });
  console.log(`\n=== ARM ${name} ===\n${arm.label}`);
  for (const s of snaps) console.log(`  pristine ${s.file.split("/").pop()}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 16)}…`);

  let tally = "(not run)", counted = -1, verdict = "NOT RUN", guardExit = -1, guardNamed = null;
  try {
    arm.apply();
    run(process.execPath, [SUITE], ROOT, LOG);
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    const m = /d448-review-copy-translation: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);

    guardExit = run(process.execPath, [GUARD, "--strict"], join(REPO, "civicos-ui"), GLOG);
    const gout = existsSync(GLOG) ? readFileSync(GLOG, "utf8") : "";
    guardNamed = arm.guardMustName ? gout.includes(arm.guardMustName) : null;

    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    console.log(`  GUARD   exit ${guardExit}${arm.guardMustName ? `  names \`${arm.guardMustName}\`: ${guardNamed ? "YES" : "NO"}` : ""}`);
    if (guardExit !== 0)
      for (const l of [...gout.matchAll(/^FAIL: (.+)$/gm)].slice(0, 6)) console.log(`    GUARD FAIL  ${l[1].slice(0, 150)}`);

    const hits = (d) => failed.some((f) => f.includes(d.out));
    const missing = arm.mustFail.filter((d) => !hits(d));
    const wrongly = failed.filter((f) => !arm.mustFail.some((d) => f.includes(d.out)));
    const guardWrong = arm.guardMustPass ? guardExit !== 0 : (guardExit === 0 || guardNamed === false);
    if (!m) verdict = "NOT AS DECLARED (no tally)";
    else if (missing.length || wrongly.length || guardWrong) verdict = "NOT AS DECLARED";
    else if (!arm.expectGreen && counted === 0 && arm.mustFail.length) verdict = "NOT AS DECLARED (stayed green)";
    else verdict = "AS DECLARED";
    for (const f of missing) console.log(`    DECLARED TO FAIL, DID NOT: ${f.out}`);
    for (const f of wrongly) console.log(`    FAILED, AND NO DECLARATION NAMED IT: ${f.slice(0, 110)}`);
    if (guardWrong) console.log(`    THE GUARD DID NOT DO WHAT WAS DECLARED (wanted ${arm.guardMustPass ? "exit 0" : `a failure naming \`${arm.guardMustName}\``})`);
    console.log(`  ${verdict}  (declared to fail: ${arm.mustFail.length})`);
    results.push({ arm: name, tally, failed: counted, guardExit, verdict });
  } finally {
    for (const s of snaps) {
      writeFileSync(s.file, readFileSync(s.copy));
      const now = readFileSync(s.file);
      const okSha = sha(now) === s.sha;
      const okBytes = now.length === s.bytes && now.length >= FLOOR;
      const okContent = now.equals(readFileSync(s.copy));
      let okCmp = true;
      try { execFileSync("cmp", ["-s", s.file, s.copy]); } catch { okCmp = false; }
      console.log(`  restored ${s.file.split("/").pop()}  ${now.length} bytes  sha256 ${okSha ? "MATCH" : "MISMATCH"}  `
                + `content ${okContent ? "IDENTICAL" : "DIFFERS"}  cmp ${okCmp ? "SAME" : "DIFFERS"}  size ${okBytes ? "ok" : "WRONG"}`);
      if (!(okSha && okBytes && okContent && okCmp)) {
        console.error(`RESTORE FAILED for ${s.file}. The pristine copy is at ${s.copy} and is NOT being deleted.`);
        process.exit(3);
      }
    }
  }
}

console.log("\n=== SUMMARY ===");
for (const r of results)
  console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} failing)   guard exit ${r.guardExit}   ${r.verdict}`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
process.exit(results.every((r) => r.verdict === "AS DECLARED") ? 0 : 1);

/* NEGATIVE CONTROL: ALL SIX ARMS RUN 2026-09-24 by the D-448 worker (`node
   test/d448-review-copy-translation.control.mjs` from `bio-plane/`, branch `land/worker/D-448`, base
   origin/main 9f8b69e6), driver exit 0, EVERY ARM AS DECLARED. Every needle unique at its arm; every
   declared label present in the suite's source; every restore sha256 MATCH, content IDENTICAL, cmp SAME
   and size ok — store.mjs 3,324,199 B (9f8a835283ddcc89…), bio-checks.mjs 965,847 B (51e8f483b9bf6c28…),
   check-refusal-codes.mjs 658,603 B (4f5a42d751f8cfd3…). From the driver's own print:

     baseline  129 pass, 0 fail   guard exit 0   AS DECLARED
     a         125 pass, 1 fail   guard exit 1, names `is-review-recipient`      AS DECLARED
     b         127 pass, 2 fail   guard exit 1, names `REVIEW_NO_GRANT`          AS DECLARED
     c         126 pass, 3 fail   guard exit 1, names `is-review-comment-text`   AS DECLARED
     d         129 pass, 0 fail   guard exit 0                                   AS DECLARED
     e         129 pass, 0 fail   guard exit 1, names `#noReviewCopy`            AS DECLARED

   THE FIRST RUN WAS NOT THIS RUN, AND THE DIFFERENCE IS THE POINT — recorded rather than smoothed,
   because on the first run TWO arms came back NOT AS DECLARED and both were findings, one about an ARM
   and one about the SUITE:

     - ARM (b) FOUND A DEFECT IN THE SUITE. Its wire assertion for the blanked code STAYED GREEN. The
       cause is exactly the equality this repository keeps paying for: `dec49Decorate` copies whatever
       the row holds onto the wire, so with C-87.10's sentence emptied the assertion compared "" with ""
       and agreed for free. The suite now FLOORS the sentence's length beside the comparison, and the
       arm fails as declared. A wire arm that could not tell a sentence from its absence was worth more
       to find than the arm was to pass.
     - ARM (b) ALSO CARRIED A WRONG DECLARATION, and it is withdrawn at its site above with the reason:
       blanking ONE sentence cannot collapse eleven distinct translations to ten.
     - ARM (d), THE OVER-STRICTNESS ARM, FAILED — and it was the SUITE that was wrong, not the arm. The
       re-spelled markers are a spelling `check-refusal-codes.mjs` accepts (the guard stayed exit 0
       through that arm) and the suite's own matcher did not, so the suite was STRICTER THAN ITS RULE.
       Its matcher now uses the guard's own patterns. THIS IS THE ARM NOBODY WRITES, and it caught the
       one defect here that no amount of breaking things would have shown.

   Both corrections were made to the SUBJECT of the arms, never to the arms' declarations, except the
   one declaration that was factually wrong and is withdrawn with its reason. */
