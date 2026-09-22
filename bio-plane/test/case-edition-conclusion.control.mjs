/* REC-157's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in one
 * step from `bio-plane/`.
 *
 *     node test/case-edition-conclusion.control.mjs        # every arm, in order
 *     node test/case-edition-conclusion.control.mjs a      # one arm
 *
 * Built on `case-project-conclusion.control.mjs` (REC-135's), whose rules it keeps:
 * DELIBERATELY NOT A `.test.mjs`, because it EDITS REAL SOURCES and a file the
 * battery discovers must never rewrite `src/` underneath the suites running beside
 * it. Pristine copies live INSIDE THIS WORKTREE, uniquely named per arm; every
 * restore is verified by sha256 AND by `cmp` against that arm's own copy, with the
 * byte count printed and floored; the suite's output goes to a FILE, never a pipe
 * (D-282). Each arm is armed ALONE, every other defence held open.
 *
 * A MISSING TALLY IS REPORTED AS -1 AND NEVER AS 0 — a suite that died before its
 * own foot reported nothing. The suite was hardened for that first: a fixture step
 * an arm breaks ends the run through a labelled FIXTURE assertion with its tally.
 *
 * EVERY ARM DECLARES, BEFORE IT ARMS, WHICH ASSERTIONS MUST FAIL AND WHICH MUST NOT,
 * as fragments of the suite's own labels, and the driver CHECKS the run against the
 * declaration and prints AS DECLARED or NOT AS DECLARED — a declaration a reader has
 * to compare by eye is one nobody compares. A declared-MUST-FAIL fragment that
 * matches no failing line, and a MUST-NOT fragment that matches one, are each a
 * finding about the ARM, recorded rather than smoothed.
 *
 * THE ARMS (declared 2026-09-21 by the REC-157 worker, before the first run):
 *  (a) PIN ON bundle_sha ALONE AGAIN — THE ROW'S OWN NAMED CONTROL. The refusal
 *      goes back to `rel.member`, so a moved conclusion over unmoved bytes is
 *      refused again. MUST FAIL: every second-edition arm (§4, §6, §7, §8) BY NAME,
 *      §5's two arms, and §6's discriminator (edition 2 never existed to pin).
 *      MUST NOT FAIL: §1, §2, §3, §4's DISCRIMINATOR and — the half worth having —
 *      §4's "surface now OFFERS" arm: the affordance still asks the comparison, so
 *      the surface offers what the act refuses, the DEC-8 disagreement this arm
 *      exposes rather than hides; §7's unchanged and discriminator arms; §9's pin arm.
 *      CORRECTED 2026-09-22 BY REC-166: §9's ROUTE arm moved from MUST NOT FAIL to
 *      MUST FAIL. It asserted the bytes route, which arm (a) could not touch; since
 *      REC-166 a make-current writes only the project, §9 is reached by the
 *      CONCLUSION comparison, and arm (a) closes exactly that comparison.
 *  (b) THE REFUSAL DROPPED — THE LIAR. MUST FAIL: every UNCHANGED arm (§2, §5, §6,
 *      §7, §8) and §2's names-the-edition arm. THE LIAR'S OWN ACT WRITES — each
 *      unchanged publication it lets through promotes the finding — so the
 *      discriminators behind §2, §5 and §7 and §4's says-why arm fall with it, and
 *      are declared as that cascade. MUST NOT FAIL: §1, §3, and the second-edition
 *      arms themselves (§4's edition-2 arm, §6's edition-3 arms, §7's moved arm, §8's
 *      provisional and disclosure arms) — a liar passes every one of them, which is
 *      exactly why the unchanged arms exist.
 *  (c) OVER-STRICTNESS — THE CLAIM COMPARED INSTEAD OF THE ACT. The entry fields
 *      shrink to project, reading, claim state and claim, so a conclusion re-taken
 *      after a withdrawal on the same claim reads as the one recorded. MUST FAIL:
 *      §6's three edition-3 arms, and nothing else. MUST NOT FAIL: every arm where
 *      the CLAIM moved (§4, §7) or the relationship did (§8), and every unchanged arm.
 *  (d) THE NO-PROJECT PIN IGNORED — a no-project conclusion always reads as moved,
 *      the liar's direction for every legacy case. MUST FAIL: §8's unchanged arm
 *      alone. MUST NOT FAIL: everything else, §8's provisional arms included.
 *  (e) THE PREPARED EDITION NOT ASKED — only ratified editions are compared. MUST
 *      FAIL: §7's unchanged-in-the-window arm, and — cascade, the unchanged
 *      publication promotes the finding — §7's discriminator and moved-names-the-
 *      preparation arms. MUST NOT FAIL: everything outside §7, and §7's fixture and
 *      records-claim-B arms.
 *  (f) THE AFFORDANCE BACK ON `!f.case_member` ALONE. MUST FAIL: §4's "surface now
 *      OFFERS" arm alone. MUST NOT FAIL: every act arm, the second edition included —
 *      the store still accepts it, which is the DEC-8 disagreement in the direction
 *      REC-142 recorded as a defect (a route reachable by the raw op and by no member).
 *
 * MEASURED figures are at the foot of this file.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { preflight } from "../scripts/armdecay.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const PEN = join(ROOT, ".nc-case-edition-conclusion");   /* inside this worktree */
const STORE = join(ROOT, "src", "store.mjs");
const AFF = join(ROOT, "src", "affordances.mjs");
const SUITE = join(DIR, "case-edition-conclusion.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

/* ONE UNIQUE STRING REPLACEMENT PER EDIT, THROWING on an absent or ambiguous
   needle — an arm that silently edited nothing reports the subject as
   unbreakable. With `DRY` set it records the anchor and writes nothing. */
let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  const src = readFileSync(file, "utf8");
  const n = src.split(needle).length - 1;
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, src.replace(needle, replacement));
};

const REFUSAL = "      if (recorded && recorded.same.length)\n"
              + "        return { ok: false, reason: \"ALREADY_A_CASE_MEMBER\",";

/* The label fragments below are the suite's OWN assertion labels, quoted as the
   invariant opening of each — never a count or a composed value. */
const S4_SECOND = "A publishes a SECOND EDITION of the SAME case";
const S4_WHY = "and the act SAYS why";
const S4_RECORDS = "edition 2 RECORDS THE NEW CLAIM";
const S4_ABSENT = "and the WITHDRAWN claim is nowhere in edition 2";
const S4_DISC = "THE DISCRIMINATOR: the finding's bytes are EXACTLY edition 1's pin";
const S4_OFFERS = "the surface now OFFERS `publish` on the case member";
const S5_SAME = "UNCHANGED AFTER EDITION 2";
const S5_STOPS = "and the surface stops offering it again";
const S6_DISC = "(discriminator) the finding's bytes are still exactly edition 2's pin";
const S6_WARRANTED = "a conclusion re-taken after a withdrawal is a NEW dated, authored act";
const S6_RECORDS = "and edition 3 records claim B with the NEW falsifier";
const S6_SAME = "UNCHANGED AFTER EDITION 3";
const S7_SAME = "UNCHANGED IN THE WINDOW";
const S7_DISC = "(discriminator) the finding's bytes are exactly the preparation's pin";
const S7_MOVED = "a MOVED conclusion in the window publishes";
const S7_RECORDS = "and the new preparation records claim B";
const S8_PROV = "PROVISIONAL (REC-135's no-project disjunct admits it";
const S8_DISCLOSES = "and it DISCLOSES that it rests on the NO-PROJECT relationship";
const S8_SAME = "UNCHANGED AFTER IT";
const S2_SAME = "UNCHANGED: publishing again with nothing moved is REFUSED";
const S2_NAMES = "and the refusal names the edition that ALREADY records this conclusion";
const S2_SURFACE = "the surface agrees: `publish` is NOT offered on the case member";
const S3_WD = "a project that WITHDREW is refused NOT_CONCLUDED";
const S1_ED1 = "A publishes edition 1 of a new case";
/* CORRECTED 2026-09-22 BY REC-166: section 9 asserted the BYTES route ("so the edition
   publishes by the BYTES route"), which was the defect INVESTIGATIVE-SESSION §7's BOB #25
   ruling removed. A make-current now writes only the project, so section 9 asserts the
   finding stays at its pin (S9_PIN) and the edition is reached by the CONCLUSION route. */
const S9_PIN = "the make-current AFTER publication WROTE NOTHING on the shared question";
const S9_ROUTE = "so the edition publishes by the CONCLUSION route";

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes six-arms-working from six-arms-broken",
              apply: () => {}, mustFail: [], mustNotFail: [S1_ED1, S2_SAME, S4_SECOND, S8_SAME, S9_PIN, S9_ROUTE] },

  a: { files: [STORE],
       label: "(A) PIN ON bundle_sha ALONE AGAIN — the refusal reverts to `rel.member`, the row's own named control",
       apply: () => edit(STORE, REFUSAL, REFUSAL.replace("if (recorded && recorded.same.length)", "if (rel.member)")),
       mustFail: [S4_SECOND, S4_WHY, S4_RECORDS, S4_ABSENT, S5_SAME, S5_STOPS,
                  S6_DISC, S6_WARRANTED, S6_RECORDS, S6_SAME, S7_MOVED, S7_RECORDS,
                  S8_PROV, S8_DISCLOSES, S8_SAME, S9_ROUTE],
       mustNotFail: [S1_ED1, S2_SAME, S2_NAMES, S2_SURFACE, S3_WD, S4_DISC, S4_OFFERS, S7_SAME, S7_DISC, S9_PIN] },

  b: { files: [STORE],
       label: "(B) THE REFUSAL DROPPED — the liar, who passes every second-edition arm",
       apply: () => edit(STORE, REFUSAL, REFUSAL.replace("if (recorded && recorded.same.length)",
                                                         "if (false && recorded && recorded.same.length)")),
       mustFail: [S2_SAME, S2_NAMES, S5_SAME, S6_SAME, S7_SAME, S8_SAME],
       cascade: [S4_DISC, S4_WHY, S6_DISC, S7_DISC],
       mustNotFail: [S1_ED1, S3_WD, S4_SECOND, S4_RECORDS, S4_ABSENT, S6_WARRANTED, S6_RECORDS,
                     S7_MOVED, S7_RECORDS, S8_PROV, S8_DISCLOSES, S9_PIN, S9_ROUTE] },

  c: { files: [STORE],
       label: "(C) OVER-STRICTNESS — the CLAIM compared instead of the ACT, so a re-taken conclusion reads as recorded",
       apply: () => edit(STORE,
         "  static #CONCLUSION_ENTRY_FIELDS = [\"project\", \"version\", \"claim_state\", \"claim\", \"falsifier\",\n"
       + "    \"falsifier_override_by\", \"falsifier_override_at\", \"concluded_by\", \"concluded_at\"];",
         "  static #CONCLUSION_ENTRY_FIELDS = [\"project\", \"version\", \"claim_state\", \"claim\"];"),
       mustFail: [S6_WARRANTED, S6_RECORDS, S6_SAME],
       mustNotFail: [S1_ED1, S2_SAME, S2_NAMES, S3_WD, S4_SECOND, S4_RECORDS, S4_OFFERS, S5_SAME, S6_DISC,
                     S7_SAME, S7_MOVED, S8_PROV, S8_SAME, S9_PIN, S9_ROUTE] },

  d: { files: [STORE],
       label: "(D) THE NO-PROJECT PIN IGNORED — a no-project conclusion always reads as moved (the legacy liar)",
       apply: () => edit(STORE,
         "    if (want.relationship === \"no_project\") return hadRel === \"no_project\" || hadRel === null;",
         "    if (want.relationship === \"no_project\") return false;"),
       mustFail: [S8_SAME],
       mustNotFail: [S1_ED1, S2_SAME, S4_SECOND, S5_SAME, S6_WARRANTED, S6_SAME, S7_SAME, S7_MOVED,
                     S8_PROV, S8_DISCLOSES, S9_PIN, S9_ROUTE] },

  e: { files: [STORE],
       label: "(E) THE PREPARED EDITION NOT ASKED — only ratified editions are compared",
       apply: () => edit(STORE,
         "        ? [{ case_id: rel.prepared.case_id, edition: Number(rel.prepared.edition), state: \"prepared\" }] : []),",
         "        ? [] : []),"),
       mustFail: [S7_SAME],
       cascade: [S7_DISC, S7_MOVED],
       mustNotFail: [S1_ED1, S2_SAME, S4_SECOND, S5_SAME, S6_WARRANTED, S6_SAME, S7_RECORDS,
                     S8_PROV, S8_SAME, S9_PIN, S9_ROUTE] },

  f: { files: [AFF],
       label: "(F) THE AFFORDANCE BACK ON `!f.case_member` ALONE — the surface hides an act the store accepts (DEC-8)",
       apply: () => edit(AFF,
         "                     && (!f.case_member || f.edition_warranted_for_project === true)",
         "                     && !f.case_member"),
       mustFail: [S4_OFFERS],
       mustNotFail: [S1_ED1, S2_SAME, S2_SURFACE, S4_SECOND, S4_RECORDS, S5_SAME, S5_STOPS, S6_WARRANTED,
                     S7_MOVED, S8_PROV, S8_SAME, S9_PIN, S9_ROUTE] },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

const preflightArms = [];
for (const name of Object.keys(ARMS)) {
  DRY = [];
  try { ARMS[name].apply(); } catch (e) { console.log(`  (arm ${name} could not be dry-run: ${e.message})`); }
  preflightArms.push({ id: name, anchors: DRY });
  DRY = null;
}
preflight("case-edition-conclusion.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

/* THE LABEL FRAGMENTS ARE CHECKED AGAINST THE SUITE BEFORE ANYTHING ARMS: a
   fragment the suite does not contain can neither fail nor pass, and would read as
   a declaration honoured over nothing. */
{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => [...a.mustFail, ...(a.cascade || []), ...a.mustNotFail]))]
    .filter((f) => !suiteSrc.includes(f));
  if (dead.length) {
    console.log(`\nDECLARATION REFERS TO ${dead.length} LABEL(S) THE SUITE DOES NOT CONTAIN — refusing to arm:`);
    for (const f of dead) console.log(`  - ${f}`);
    process.exit(4);
  }
}

mkdirSync(PEN, { recursive: true });
const results = [];

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

  let tally = "(not run)", counted = -1, verdict = "NOT RUN";
  try {
    arm.apply();
    try {
      execFileSync("/bin/sh",
        ["-c", `${JSON.stringify(process.execPath)} ${JSON.stringify(SUITE)} > ${JSON.stringify(LOG)} 2>&1`],
        { cwd: ROOT, stdio: "ignore" });
    } catch { /* exit 1 is the measurement */ }
    const out = existsSync(LOG) ? readFileSync(LOG, "utf8") : "";
    const m = /case-edition-conclusion\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    /* THE DECLARATION, CHECKED — AND IT IS TOTAL. Every failing line must be
       declared (a MUST-FAIL or a declared cascade), every declared line must fail,
       and every MUST-NOT line must pass. A failure nobody declared is as much a
       finding about the arm as a declared one that held. */
    const hits = (frag) => failed.some((f) => f.startsWith(frag));
    const declaredFail = [...arm.mustFail, ...(arm.cascade || [])];
    const missing = declaredFail.filter((f) => !hits(f));
    const wrongly = arm.mustNotFail.filter((f) => hits(f));
    const undeclared = failed.filter((f) => !declaredFail.some((k) => f.startsWith(k)));
    if (!m) verdict = "NOT AS DECLARED (no tally)";
    else if (missing.length || wrongly.length || undeclared.length) verdict = "NOT AS DECLARED";
    else verdict = "AS DECLARED";
    for (const f of missing) console.log(`    DECLARED TO FAIL${(arm.cascade || []).includes(f) ? " (cascade)" : ""}, DID NOT: ${f}`);
    for (const f of wrongly) console.log(`    DECLARED NOT TO FAIL, DID: ${f}`);
    for (const f of undeclared) console.log(`    FAILED, AND NO DECLARATION NAMED IT: ${f.slice(0, 110)}`);
    console.log(`  ${verdict}  (declared to fail: ${declaredFail.length}, of which cascade: ${(arm.cascade || []).length})`);
    results.push({ arm: name, tally, failed: counted, verdict });
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
for (const r of results) console.log(`  ${r.arm.padEnd(9)} ${r.tally}   (${r.failed} failing)   ${r.verdict}`);
rmSync(PEN, { recursive: true, force: true });
console.log(`\npen removed: ${PEN}`);
process.exit(results.every((r) => r.verdict === "AS DECLARED") ? 0 : 1);

/* MEASURED 2026-09-21 by the REC-157 worker (`node test/case-edition-conclusion.control.mjs`
   from `bio-plane/`, worktree `.claude/worktrees/agent-a976bfb0c6dec2bdb`, branch
   `worktree-agent-a976bfb0c6dec2bdb` at 1e56c1c8 + the docs-only merge fa37d5ec). All six
   anchors LIVE at the preflight; every label fragment present in the suite; EVERY RESTORE
   sha256 MATCH, content IDENTICAL and cmp SAME — `store.mjs` 2,786,423 bytes (sha256
   75e457ffe6e98e7f…), `affordances.mjs` 148,243 bytes (c06cc7ae2fa85841…), both far over the
   1,000-byte floor.

     baseline  36 pass, 0 fail    AS DECLARED
     (a)       21 pass, 15 fail   AS DECLARED  pin on bundle_sha alone again
     (b)       26 pass, 10 fail   AS DECLARED  the refusal dropped (6 declared + 4 declared cascade)
     (c)       33 pass, 3 fail    AS DECLARED  the claim compared instead of the act
     (d)       35 pass, 1 fail    AS DECLARED  the no-project pin ignored
     (e)       33 pass, 3 fail    AS DECLARED  the prepared edition not asked (1 + 2 cascade)
     (f)       35 pass, 1 fail    AS DECLARED  the affordance back on !case_member alone

   RE-RUN THE SAME DAY after the subject changed — the affordance walk's condition re-spelled
   so it no longer duplicated `caselifecycle.control.mjs` arm (c)'s anchor (`store.mjs` now
   2,786,693 bytes, sha256 51ba61e243d4dc00…): all seven rows AS DECLARED with IDENTICAL figures.
   The walk sits under arm (f)'s surface and under every "surface OFFERS / does NOT offer"
   assertion, so a re-spelling that changed its behaviour would have moved them.

   EVERY ARM AS DECLARED ON THE FIRST RUN, the declaration checked as a TOTAL. That is
   recorded as a fact and not as a comfort: the declarations were written AFTER measuring
   the suite against the UNTOUCHED plane (19/17), which is where this item's one surprise
   was found and paid for — `op=versioncurrent` writes into the SHARED question's bytes, so
   the first draft's second-edition arm passed on the untouched plane for the wrong reason
   (the make-current had unpinned the finding). Each second-edition arm now carries a
   DISCRIMINATOR asserting the bytes are exactly the pin, and arm (a) is what shows those
   discriminators doing their work: the second-edition arms fail BY NAME under it while
   every discriminator before them passes.

   WHAT NO ARM HERE CAN SEE, stated so the next reader does not have to test it: an edition
   that recorded NO conclusion (every edition before REC-135, every one before the case
   document) — the comparator's "compare by the pin" branch for it cannot be constructed
   through today's ops, since the writer always writes the row, so no arm breaks that half
   and `publish.test.mjs`'s "the store agrees" arm (a no-project, post-REC-135 edition) is
   the nearest behavioural cover; and no arm touches `op=reopen`, which this item does not
   change. */
