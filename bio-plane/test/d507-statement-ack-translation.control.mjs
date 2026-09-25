/* D-507'S NEGATIVE CONTROL DRIVER — three arms plus a baseline, re-runnable in one step from `bio-plane/`.
 *
 *     node test/d507-statement-ack-translation.control.mjs        # every arm, in order
 *     node test/d507-statement-ack-translation.control.mjs a      # one arm
 *
 * Built on `d470-catalog-census.control.mjs`, whose rules it keeps: DELIBERATELY NOT A `.test.mjs`, because
 * it EDITS A REAL SOURCE. Pristine copies live in `bio-plane/.nc-d507/`, given its OWN `.gitignore` line —
 * there is no blanket `.nc-*` rule in this repository, and checking rather than assuming one is what keeps a
 * failed restore's pristine copies out of a commit. They are uniquely named per arm; every restore is
 * verified by sha256, by content AND by `cmp`, with the byte count printed and floored; each run's output
 * goes to a FILE, never a pipe. Each arm is armed ALONE with the others held open. A missing tally is -1,
 * never 0.
 *
 * EVERY ARM RUNS TWO INSTRUMENTS, because the row's own control is about the GUARD and the suite's pin is
 * about the ROUTING, and neither sees what the other sees:
 *   - `test/d507-statement-ack-translation.test.mjs`, declared as label fragments that MUST and MUST NOT fail;
 *   - `civicos-ui/check-refusal-codes.mjs --strict`, the DEC-49 guard, declared as an exit status and, where
 *     it must fail, a NAMED fragment of its own failure text.
 *
 * THE ARMS (declared before the first run, 2026-09-24, by the D-507 worker):
 *  (baseline) NOTHING ARMED. The suite GREEN and the guard exit 0 — the row that tells three-arms-working
 *      from three-arms-broken, and the one nobody runs.
 *  (a) THE ROW'S OWN NAMED CONTROL — "return one code outside the helper and the DEC-49 guard names it".
 *      `STATEMENT_ACK_BY_ITS_AUTHOR` is returned as the pre-D-507 bare object literal, ABOVE its DEC-49
 *      region, leaving the marker pair standing over nothing.
 *      MUST FAIL: the guard, naming `is-statement-ack-by-its-author`; and the suite's structural arms for
 *      that code — the one that says the site is inside the region and goes through the helper, and the
 *      one that says no `reason: "STATEMENT_ACK_` literal is left in the file.
 *      MUST NOT FAIL, and this is the arm's most important half: the WIRE arm for that same code. The
 *      sentence still arrives, because `index.mjs`'s `dec49Decorate` fills `code`, `check` and
 *      `translation` onto any `ok:false` answer whose `reason` matches a row, downstream of the store. So
 *      a wire assertion is NOT evidence about the routing, and the structural pin is the only
 *      discriminator this suite has for it. D-484 measured the same thing and recorded it as a surprising
 *      green; it is DECLARED here rather than rediscovered.
 *  (b) A TRANSLATION BLANKED — C-82.4's `translation` emptied in the catalogue.
 *      MUST FAIL: the guard (a row with no canned translation is DEC-49's own failure); the suite's
 *      catalogue arm for C-82.4 and its wire arm for C-82.4 (whose sentence is FLOORED as well as
 *      compared — a comparison alone would pass over two empty strings, which is exactly the
 *      costs-nothing equality this project has measured passing three times).
 *      MUST NOT FAIL: every other code's arms, and the structural arms, which are about routing.
 *  (c) OVER-STRICTNESS — correct work in a spelling neither instrument anticipated: one region's opening
 *      and closing markers re-spelled with extra asterisks, whitespace and prose inside the marker
 *      comment, on the same lines. EVERY ARM MUST STAY GREEN and the guard MUST stay exit 0, INCLUDING
 *      its `regionLines` ratchet — a marker's own prose is not part of the span it opens.
 *
 * MEASURED figures are at the foot of this file.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const REPO = join(ROOT, "..");
const PEN = join(ROOT, ".nc-d507");
const STORE = join(ROOT, "src", "store.mjs");
const CATALOG = join(ROOT, "checks", "bio-checks.mjs");
const SUITE = join(DIR, "d507-statement-ack-translation.test.mjs");
const GUARD = join(REPO, "civicos-ui", "check-refusal-codes.mjs");
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
/* RE-QUOTED at c20-batch23 (CONDUCT #20): REC-212 widened this site's condition (the publisher's second
   exclusion) and its sentence inside the same region; the needle is the union's code, the arm unchanged. */
const AUTHOR_BLOCK = `    /* DEC-49 REGION is-statement-ack-by-its-author */
    if (kind === "participant" && ((statementAuthor && by === statementAuthor)
                                   || (blockAuthor && by === blockAuthor)))
      return refusal("STATEMENT_ACK_BY_ITS_AUTHOR",
               (statementAuthor && by === statementAuthor
                 ? \`you wrote this statement, and its acknowledgement is a SECOND person's reading of what \`
                 + \`the case leaves out (BIO_Publication §3 rule 11). \`
                 /* REC-212: the other name, and a different sentence because it is a different act. */
                 : \`you prepared and published this case and authored its completeness block at that act, so \`
                 + \`you are its FIRST reader; an acknowledgement is a SECOND person's reading of what the \`
                 + \`case leaves out (BIO_Publication §3 rule 11). Who WROTE the statement is a separate \`
                 + \`fact, stated separately in these bytes (§3 rule 13). \`)
                     + \`Ask a participant of this project, or \`
                     + \`hand the draft to a reader through a review grant. The case publishes without one and \`
                     + \`says so.\`,
               { author: statementAuthor && by === statementAuthor ? statementAuthor : blockAuthor });
    /* END DEC-49 REGION is-statement-ack-by-its-author */`;
/* The SAME refusal, built the way it was built before D-507 — a bare object literal, ABOVE the region,
   so the helper is not called and the marker pair stands over a span that refuses nothing. The region is
   left comfortably above the guard's 4-line / 120-character non-trivial-span floor on purpose: an arm
   that tripped THAT floor would prove only that markers can collapse, not that a refusal left its
   region, and the two are different facts. */
const AUTHOR_ARMED = `    if (kind === "participant" && statementAuthor && by === statementAuthor)
      return { ok: false, reason: "STATEMENT_ACK_BY_ITS_AUTHOR", author: statementAuthor,
               detail: \`you wrote this statement, and its acknowledgement is a SECOND person's reading of what \`
                     + \`the case leaves out (BIO_Publication §3 rule 11). Ask a participant of this project, or \`
                     + \`hand the draft to a reader through a review grant. The case publishes without one and \`
                     + \`says so.\` };
    /* DEC-49 REGION is-statement-ack-by-its-author */
    /* nc-d507 arm (a): this span is what the row's \`where\` still claims, and the refusal that used to
       stand in it has been moved out, above the opening marker. Nothing here refuses anything. */
    const ncD507Author = statementAuthor;
    const ncD507Kind = kind;
    void ncD507Author; void ncD507Kind;
    /* END DEC-49 REGION is-statement-ack-by-its-author */`;

const C824 = `    translation: 'Only someone who has joined the project that makes this case, or someone given a review '
      + 'copy of it, can acknowledge its statement. Being able to see a project is not the same as having '
      + 'joined it: an invited member who has not joined yet, and an administrator, cannot acknowledge it.',`;

const SUBJ_OPEN = `        /* DEC-49 REGION is-statement-ack-subject */`;
const SUBJ_END = `        /* END DEC-49 REGION is-statement-ack-subject */`;

/* A DECLARED ASSERTION CARRIES TWO SPELLINGS, and it needs both: `out` is what the suite PRINTS (the
   label after its template interpolations), `src` is a fragment of the suite's SOURCE. A declaration
   checked only against the printed output cannot notice that it names an assertion nobody wrote; one
   checked only against the source cannot match an interpolated label at all. The first draft of this
   file had only `out` and the pre-arm check refused all four — an arm that cannot arm is a finding,
   caught here by the check rather than by a green run. */
const PIN_IN_REGION = { out: "that one site is INSIDE is-statement-ack-by-its-author",
                        src: "that one site is INSIDE ${region}" };
const PIN_NO_LITERAL = { out: "object literal is left in the file",
                         src: "object literal is left in the file" };
const CAT_824 = { out: "STATEMENT_ACK_NOT_A_PARTICIPANT's translation is prose a member reads",
                  src: "'s translation is prose a member reads" };
const WIRE_824 = { out: "C-82.4 an invited member who has not joined: AND THE TRANSLATION ARRIVED",
                   src: "C-82.4 an invited member who has not joined" };

const ARMS = {
  baseline: {
    files: [], label: "nothing armed — what tells three-arms-working from three-arms-broken",
    apply: () => {}, mustFail: [], guardMustPass: true, expectGreen: true,
  },
  a: {
    files: [STORE],
    label: "(A) THE ROW'S OWN — STATEMENT_ACK_BY_ITS_AUTHOR returned OUTSIDE the helper and OUTSIDE its region",
    apply: () => edit(STORE, AUTHOR_BLOCK, AUTHOR_ARMED),
    mustFail: [PIN_IN_REGION, PIN_NO_LITERAL],
    guardMustPass: false, guardMustName: "is-statement-ack-by-its-author",
  },
  b: {
    files: [CATALOG],
    label: "(B) A TRANSLATION BLANKED — C-82.4's sentence emptied in the catalogue",
    apply: () => edit(CATALOG, C824, "    translation: '',"),
    mustFail: [CAT_824, WIRE_824],
    guardMustPass: false, guardMustName: "STATEMENT_ACK_NOT_A_PARTICIPANT",
  },
  c: {
    files: [STORE],
    label: "(C) OVER-STRICTNESS — is-statement-ack-subject's markers re-spelled; everything must stay GREEN",
    apply: () => {
      edit(STORE, SUBJ_OPEN, `        /**   DEC-49 REGION is-statement-ack-subject  (re-spelled by a control arm)  **/`);
      edit(STORE, SUBJ_END, `        /**   END DEC-49 REGION is-statement-ack-subject  (re-spelled by a control arm)  **/`);
    },
    mustFail: [], guardMustPass: true, expectGreen: true,
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
    const m = /d507-statement-ack-translation: (\d+) pass, (\d+) fail/.exec(out);
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

/* MEASURED 2026-09-24 by the D-507 worker (`node test/d507-statement-ack-translation.control.mjs` from
   `bio-plane/`, branch `land/worker/D-507`, base origin/main 68fecb8d). Every needle unique at its arm;
   every declared label present in the suite's source; every restore sha256 MATCH, content IDENTICAL and
   cmp SAME — store.mjs 3,223,995 B (3ceae6cd232ea4e2…), bio-checks.mjs 929,584 B (210f261a84bcf726…).

     baseline  63 pass, 0 fail   guard exit 0   AS DECLARED
     (a)       61 pass, 2 fail   guard exit 1   AS DECLARED  the row's own: the guard named the region —
                                                "arm C judged NO refusal inside the region
                                                `is-statement-ack-by-its-author`" — and three ratchets
                                                breached beneath it (regionLines 3795 < 3797, codesChecked
                                                434 < 435, refusalsJudged 431 < 432). The WIRE arm for that
                                                code STAYED GREEN as declared: `dec49Decorate` fills the
                                                sentence from the row alone.
     (b)       61 pass, 2 fail   guard exit 1   AS DECLARED  a blanked translation — the catalogue arm and
                                                the wire arm for C-82.4 ALONE, and the guard naming the row
     (c)       63 pass, 0 fail   guard exit 0   AS DECLARED  over-strictness: markers re-spelled, everything
                                                green and `regionLines` unmoved

   NOTHING CAME BACK OTHER THAN AS DECLARED. That is worth reading with suspicion rather than relief, so:
   the baseline row is above, arm (a) was written to make the PIN lie in the direction a wire assertion
   usually lies (a sentence that arrives from the row while the routing is gone), and the first draft of
   this driver was REFUSED by its own pre-arm check for naming four labels the suite's source did not
   carry — an arm that cannot arm, caught by the check instead of by a green run. */
