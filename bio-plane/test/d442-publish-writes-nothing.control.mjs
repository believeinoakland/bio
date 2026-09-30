/* D-442's NEGATIVE CONTROL DRIVER — five arms plus a baseline, re-runnable in one step from `bio-plane/`.
 *
 *     node test/d442-publish-writes-nothing.control.mjs        # every arm, in order
 *     node test/d442-publish-writes-nothing.control.mjs a      # one arm
 *
 * Built on `current-shared-question.control.mjs` (REC-166's), whose rules it keeps: DELIBERATELY NOT A
 * `.test.mjs`, because it EDITS REAL SOURCES. Pristine copies live INSIDE THIS WORKTREE
 * (`bio-plane/.nc-d442/`, gitignored by the `.nc-*` rule), uniquely named per arm; every restore is
 * verified by sha256, by content AND by `cmp`, with the byte count printed and floored; the suite's
 * output goes to a FILE, never a pipe (D-282). Each arm is armed ALONE. A missing tally is -1, never 0.
 * Every arm DECLARES which assertions must fail and which must not, as fragments of the suite's own
 * labels, and the run is checked against the declaration as a TOTAL.
 *
 * THE ARMS (declared 2026-09-23 by the D-442 worker, before the first run; (f) and (a)'s S3_AGAIN, S4_PC,
 * S4_CONT and S4_EX1 were declared before the first run too, when the excludedby arms joined the suite):
 *  (a) RESTORE THE MEMBER PROMOTION — THE ROW'S OWN NAMED CONTROL. op=publish promotes each member again
 *      (a Session Log receipt and `last_updated` written into the finding, the pin taken off the new
 *      sha), everything else of rule 12 left in place. MUST FAIL, BY NAME: the unmoved-sha arms (A's own
 *      prepare; "THE PIN: B's prepare"; "THE PIN, SAME PROJECT"), the byte-identical arm, the no-flag arm,
 *      B's same-sha arm, the case document's pin row, and every arm downstream of a moved pin.
 *  (b) THE LIAR, READER 1 — op=publishedcase's `What This Excludes` read off the FINDING's bytes again
 *      (which carry none) while still labelled as the case document's. MUST FAIL: that arm alone.
 *  (c) THE LIAR, READER 2 — the ratify committer takes the member's pair from the finding's bytes only
 *      (none, under rule 12), so `published_bundles.strength` is null. MUST FAIL: the publishedmanifest arm
 *      alone — op=publishedcase and the container read the case document and stay green.
 *  (d) THE CHECK LEFT BEHIND — `checkCaseDocument` stops running `checkPublishedExtension` per member, so
 *      C-2.8 no longer follows its block. MUST FAIL: the three C-2.8 catalogue arms (capture row, edition,
 *      testimony row). MUST NOT FAIL: the C-3.1 arm, the format arms, and every plane arm.
 *  (e) OVER-STRICTNESS — the case document's receipt line re-worded. Correct work in a spelling the suite
 *      did not anticipate: the suite MUST stay GREEN.
 *  (f) THE LIAR, READER 3 — op=excludedby stops reading `case_exclusions` and answers from the members'
 *      own bytes alone (which carry no exclusion under rule 12). MUST FAIL: the two excludedby arms alone.
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
const PEN = join(ROOT, ".nc-d442");
/* RE-ANCHORED 2026-09-30 (LEGACY-TESTS #13, T15): the subjects left `src/store.mjs`, `src/index.mjs` and the
   catalogue with the extraction. Each arm now edits the module that holds its subject: publication's worker half
   (op=publishedcase's exclusions), publication's store half (the ratify committer's frozen pair, op=excludedby),
   case-authoring's document text (the receipt) and ratification's case-document catalogue, the LIVE gate
   (ratification R8; the catalogue's `checks/bio-checks.mjs` copy is no longer what op=caseratify runs). */
const PUB_WORKER = join(ROOT, "src", "publication", "worker.mjs");
const PUB = join(ROOT, "src", "publication", "index.mjs");
const CA_DOC = join(ROOT, "src", "case-authoring", "document.mjs");
const RAT_CHECKS = join(ROOT, "src", "ratification", "checks.mjs");
const SUITE = join(DIR, "d442-publish-writes-nothing.test.mjs");
const LOG = join(PEN, "run.out");

const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

let DRY = null;
const edit = (file, needle, replacement) => {
  if (DRY) { DRY.push({ file, needle }); return; }
  /* BYTE-WISE, because `store.mjs` carries a stray byte (CLAUDE.md §7) that a utf8 round trip would
     rewrite — which would make the restore's sha the only thing that noticed, after the arm ran. */
  const src = readFileSync(file);
  const nb = Buffer.from(needle, "utf8");
  const first = src.indexOf(nb);
  const n = first < 0 ? 0 : (src.indexOf(nb, first + 1) < 0 ? 1 : 2);
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, Buffer.concat([src.subarray(0, first), Buffer.from(replacement, "utf8"),
                                     src.subarray(first + nb.length)]));
};

/* (a) RETIRED 2026-09-30 (LEGACY-TESTS #13, T15; K457): its anchor restored `publishCase()`'s member promotion inside
   `src/store.mjs`'s member loop. publishCase is case-authoring's now (`src/case-authoring/index.mjs`), and that module
   holds no promotion service at all (its uses, case-authoring's requirements, name none), so the promotion is not a
   line that can be put back: arming it would mean wiring a dependency the module does not have, which measures the
   wiring rather than rule 12. The property is covered by case-authoring R13 and R23,
   `test/m/case-authoring/members.test.mjs` ("R13, R23: publishing writes nothing on any finding … project B's publish
   leaves project A's pin and raises no flag"). */

const EXCLUDES = "          excludes: fnd.frozen_from === \"case_document\"\n";
const FROZEN = "    const frozenStrength = memberCarriesBlocks ? strength : docFrozen ? docFrozen.strength : strength;";
const CHECK = "      checkPublishedExtension(memberFm, own);";
const RECEIPT = "    ...roster.map((m) => `Pinned: ${m} at ${pins.get(m) ?? \"(unpinned)\"}`";

const S1_OWN = "A's OWN prepare leaves Q's bundle_sha and bytes unmoved";
const S1_RAT = "(fixture) Q ratifies at X's pin";
const S1_PIN = "(fixture) case X is ratified and pins Q";
const S1_FLAG = "(fixture) before B acts";
const S2_NEW = "(fixture) B's publish succeeds as a NEW case";
const S2_PIN = "THE PIN: B's prepare leaves Q's bundle_sha at case X's pin";
const S2_BYTES = "and Q's bundle.md is byte-identical";
const S2_FLAG = "NO REVISION FLAG on A's case";
const S2_SAME = "B's case pins Q at the SAME sha";
const S2_READ = "(fixture) B's case document is readable";
const S2_BLOCKS = "THE CASE DOCUMENT CARRIES EVERY MOVED BLOCK";
const S2_PAIR = "… the frozen pair, capture and connection once each";
const S2_FIELDS = "… the grounds FIELD, the completeness block";
const S2_PROSE = "… `## What This Excludes` and the frozen pair in PROSE";
const S2_CRAT = "B's case document RATIFIES";
const S2_RAT = "B's RATIFICATION OF Q THEN SUCCEEDS";
const S2_AFTER = "and after B's whole ceremony Q is still at X's pin";
const S3_AGAIN = "(fixture) publishing into case X again";
const S3_NEW = "(fixture) A's SECOND case over Q is prepared";
const S3_PIN = "THE PIN, SAME PROJECT";
const S3_RAT = "and it ratifies, case document and finding";
const S4_BYTES = "Q's own bytes carry NONE of the blocks";
const S4_PC = "op=publishedcase serves B's member";
const S4_EXCL = "… and its `What This Excludes` from the CASE DOCUMENT's section";
const S4_CONT = "the CONTAINER built at B's ratification";
const S4_MAN = "op=publishedmanifest's finding row";
const S4_EX1 = "op=excludedby names B's case";
const S4_EX2 = "… and every case published over Q here answers";
const S5_GUARD = "the real /2 document passes the case gate";
const S5_PAIR = "a member's capture row removed -> C-2.8";
const S5_ED = "a member's edition removed -> C-2.8";
const S5_SECT = "the section removed from the body -> C-3.1";
const S5_TEST = "a testimony-graded leg at the pinned bytes";
const S5_LEG = "a LEGACY /1 document's format is still accepted";
const S5_FMT = "an unknown format is refused C-41.1";

const ALL = [S1_OWN, S1_RAT, S1_PIN, S1_FLAG, S2_NEW, S2_PIN, S2_BYTES, S2_FLAG, S2_SAME, S2_READ, S2_BLOCKS,
             S2_PAIR, S2_FIELDS, S2_PROSE, S2_CRAT, S2_RAT, S2_AFTER, S3_AGAIN, S3_NEW, S3_PIN, S3_RAT,
             S4_BYTES, S4_PC, S4_EXCL, S4_CONT, S4_EX1, S4_EX2, S4_MAN, S5_GUARD, S5_PAIR, S5_ED, S5_SECT, S5_TEST, S5_LEG, S5_FMT];
const except = (...xs) => ALL.filter((x) => !xs.includes(x));

const EXCLUDEDBY = "    rows.push(...this.#rows(\n      `SELECT x.bundle_id, x.ord, x.member_edition AS edition,";

const ARMS = {
  baseline: { files: [], label: "nothing armed — what distinguishes five-arms-working from five-arms-broken",
              apply: () => {}, mustFail: [], mustNotFail: ALL },
  b: { files: [PUB_WORKER],
       label: "(B) THE LIAR, reader 1 — op=publishedcase's exclusions read off the finding's bytes again",
       apply: () => edit(PUB_WORKER, EXCLUDES, "          excludes: false\n"),
       mustFail: [S4_EXCL], mustNotFail: except(S4_EXCL) },
  c: { files: [PUB],
       label: "(C) THE LIAR, reader 2 — the ratify committer's pair from the finding's bytes only",
       apply: () => edit(PUB, FROZEN, "    const frozenStrength = strength;"),
       mustFail: [S4_MAN], mustNotFail: except(S4_MAN) },
  d: { files: [RAT_CHECKS],
       label: "(D) THE CHECK LEFT BEHIND — checkPublishedExtension no longer run per member of a /2 document",
       apply: () => edit(RAT_CHECKS, CHECK, "      void own;"),
       mustFail: [S5_PAIR, S5_ED, S5_TEST], mustNotFail: except(S5_PAIR, S5_ED, S5_TEST) },
  e: { files: [CA_DOC],
       label: "(E) OVER-STRICTNESS — the case document's receipt line re-worded; the suite must stay GREEN",
       apply: () => edit(CA_DOC, RECEIPT,
         "    ...roster.map((m) => `Taken for this case: ${m}, frozen at ${pins.get(m) ?? \"(unpinned)\"}`"),
       mustFail: [], mustNotFail: ALL, expectGreen: true },
  f: { files: [PUB],
       label: "(F) THE LIAR, reader 3 — op=excludedby answers from the members' bytes alone",
       apply: () => edit(PUB, EXCLUDEDBY, "    rows.push(...[] || this.#rows(\n      `SELECT x.bundle_id, x.ord, x.member_edition AS edition,"),
       mustFail: [S4_EX1, S4_EX2], mustNotFail: except(S4_EX1, S4_EX2) },
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
preflight("d442-publish-writes-nothing.control.mjs", preflightArms.filter((a) => a.anchors.length), { fatalFor: order });

{
  const suiteSrc = readFileSync(SUITE, "utf8");
  const dead = [...new Set(Object.values(ARMS).flatMap((a) => [...a.mustFail, ...a.mustNotFail]))]
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
    const m = /d442-publish-writes-nothing\.test\.mjs: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    const hits = (frag) => failed.some((f) => f.startsWith(frag));
    const missing = arm.mustFail.filter((f) => !hits(f));
    const wrongly = arm.mustNotFail.filter((f) => hits(f));
    const undeclared = failed.filter((f) => !arm.mustFail.some((k) => f.startsWith(k)));
    if (!m) verdict = "NOT AS DECLARED (no tally)";
    else if (missing.length || wrongly.length || undeclared.length) verdict = "NOT AS DECLARED";
    else if (!arm.expectGreen && name !== "baseline" && counted === 0) verdict = "NOT AS DECLARED (stayed green)";
    else verdict = "AS DECLARED";
    for (const f of missing) console.log(`    DECLARED TO FAIL, DID NOT: ${f}`);
    for (const f of wrongly) console.log(`    DECLARED NOT TO FAIL, DID: ${f}`);
    for (const f of undeclared) console.log(`    FAILED, AND NO DECLARATION NAMED IT: ${f.slice(0, 110)}`);
    console.log(`  ${verdict}  (declared to fail: ${arm.mustFail.length})`);
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

/* MEASURED 2026-09-23 by the D-442 worker (`node test/d442-publish-writes-nothing.control.mjs` from `bio-plane/`,
   worktree `.claude/worktrees/agent-af1478b0c650efa08`, branch `worktree-agent-af1478b0c650efa08`). Every anchor LIVE
   at the preflight; every label fragment present in the suite; every restore sha256 MATCH, content IDENTICAL and cmp
   SAME — store.mjs 2,810,573 B (58f3972f…), index.mjs 710,297 B (822f7d90…), bio-checks.mjs 822,889 B (e000dde0…).

     baseline  35 pass, 0 fail    AS DECLARED
     (a)       16 pass, 19 fail   AS DECLARED after TWO corrections of its declaration, each recorded at A_FAIL: first
                                  the publishedcase excludes arm (B's member never ratifies at its moved pin), then —
                                  once the prepared-window rule was settled — A's second case and the three-case
                                  excludedby count (the re-publish into X leaves an unsigned preparation that refuses it)
     (b)       34 pass, 1 fail    AS DECLARED  publishedcase's exclusions off the finding's bytes: that arm alone
     (c)       34 pass, 1 fail    AS DECLARED  the committer's pair off the finding's bytes: the publishedmanifest arm
     (d)       32 pass, 3 fail    AS DECLARED  C-2.8 not run per member: the three catalogue arms
     (e)       35 pass, 0 fail    AS DECLARED  over-strictness: the receipt re-worded, green
     (f)       33 pass, 2 fail    AS DECLARED  excludedby off the members' bytes alone: the two excludedby arms

   Arm (a) is the row's named control and it fails at the unmoved-sha arm BY NAME, as rule 12's accepts-when asks. */
