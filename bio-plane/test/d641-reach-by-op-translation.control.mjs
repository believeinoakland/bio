/* D-641'S NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in one step from `bio-plane/`.
 *
 *     node test/d641-reach-by-op-translation.control.mjs        # every arm, in order
 *     node test/d641-reach-by-op-translation.control.mjs a      # one arm
 *
 * Built on D-448's driver and keeping its rules: DELIBERATELY NOT A `.test.mjs`, because it EDITS A REAL SOURCE.
 * Each arm is armed ALONE; each restore is verified by sha256, by content AND by `cmp`, with the byte count printed
 * and floored; each run's output goes to a FILE, never a pipe; a missing tally is -1, never 0. The pen is taken from
 * $NC_PEN or $TMPDIR and never from this repository (BOB #32, 2026-09-24).
 *
 * EVERY ARM RUNS TWO INSTRUMENTS: `test/d641-reach-by-op-translation.test.mjs`, declared as label fragments that
 * MUST and MUST NOT fail, and `civicos-ui/check-refusal-codes.mjs --strict`, declared as an exit status and, where it
 * must fail, a NAMED fragment of its own failure text.
 *
 * THE ARMS (declared before the first run, 2026-09-25, by the D-641 worker):
 *  (baseline) NOTHING ARMED: the suite GREEN and the guard exit 0.
 *  (a) THE ROW'S OWN NAMED CONTROL (D-641's `accepts-when`): STRIP ONE NEW TRANSLATION — C-100.2 NO_ENDS's sentence
 *      emptied. MUST FAIL: the guard, naming NO_ENDS; the suite's prose arm for NO_ENDS (the sentence is FLOORED,
 *      so "" never equals "" for free) and its wire arm. MUST NOT FAIL: any other code's arms.
 *  (b) A CONSOLIDATED CODE GIVEN A SECOND MINT — one of NO_KEY's former sites (readProgression) restored to its
 *      bare pre-D-641 literal. MUST FAIL: the guard, naming NO_KEY (arm G: a catalogued code at two literal
 *      sites), and the suite's one-mint arm for NO_KEY. MUST NOT FAIL: the WIRE arm for that very site, because
 *      `dec49Decorate` puts the row's sentence on ANY `ok:false` with a matching reason — declared, not discovered
 *      (D-484, D-507, D-448 each measured it): a wire assertion is not evidence about routing.
 *  (c) ONE NOT-ON-THE-WIRE DECLARATION WITHDRAWN — NO_CONTENT at connections. MUST FAIL: the guard, naming
 *      NO_CONTENT (back in reach with no translation, reachGap 40 over its ceiling of 39). MUST NOT FAIL: the suite,
 *      which never reads the guard.
 *  (d) OVER-STRICTNESS — `is-relation-ends`'s two markers re-spelled in a way the guard accepts. EVERYTHING MUST
 *      STAY GREEN.
 *  (e) THE WALK'S NESTED-CALL SIGHT REVERTED — `reach-by-op.mjs`'s BARE_CALL back to a consumed character, the one
 *      change D-641 makes to a SHARED instrument. MUST FAIL: the guard, naming `R6 PUBLIC OP` (the three knock codes
 *      and casedocument's MALFORMED drop out of the walk). MUST NOT FAIL: the suite.
 *  (f) A STALE NARROWING — a declaration for a code the walk never attributes to attest added to NOT_ON_THE_WIRE.
 *      MUST FAIL: the guard, naming the stale declaration. MUST NOT FAIL: the suite.
 * RESULTS ARE RECORDED ON THE `NEGATIVE CONTROL:` LINE AT THE FOOT, from this driver's own print.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const REPO = join(ROOT, "..");
const PEN = process.env.NC_PEN ? process.env.NC_PEN : mkdtempSync(join(tmpdir(), "nc-d641-"));
const STORE = join(ROOT, "src", "store.mjs");
const CATALOG = join(ROOT, "checks", "bio-checks.mjs");
const GUARD = join(REPO, "civicos-ui", "check-refusal-codes.mjs");
const WALK = join(REPO, "civicos-ui", "reach-by-op.mjs");
const SUITE = join(DIR, "d641-reach-by-op-translation.test.mjs");
const LOG = join(PEN, "suite.out");
const GLOG = join(PEN, "guard.out");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const FLOOR = 1000;

const edit = (file, needle, replacement) => {
  /* BYTE-WISE: `store.mjs` carries a stray byte (CLAUDE.md §7), so the needle is matched on bytes. */
  const src = readFileSync(file);
  const nb = Buffer.from(needle, "utf8");
  const first = src.indexOf(nb);
  const n = first < 0 ? 0 : (src.indexOf(nb, first + 1) < 0 ? 1 : 2);
  if (n !== 1) throw new Error(`ARM NEEDLE not unique in ${file}: found ${n} occurrence(s)\n  ${needle.slice(0, 90)}`);
  writeFileSync(file, Buffer.concat([src.subarray(0, first), Buffer.from(replacement, "utf8"),
                                     src.subarray(first + nb.length)]));
};

/* ---- the needles, each quoted from the tree; a stale needle THROWS rather than arming nothing. ---- */
const NO_ENDS_SENTENCE = `    translation: 'A relation joins two entries in the subject registry, and this one did not name both of them. Name the '
      + 'entry it runs from and the entry it runs to. Nothing was recorded.',`;
const NO_KEY_SITE = `      return refuseNoKey({ detail: "read a progression definition by its key (op=progression&key=meeting)" });`;
const NO_KEY_BARE = `      return { ok: false, reason: "NO_KEY", detail: "read a progression definition by its key (op=progression&key=meeting)" };`;
const NO_CONTENT_DECL = `  ["connections", new Map([
    ["NO_CONTENT", "store.mjs connectionGradeForContent refuses only an id empty after trimming, and its one caller, "
      + "connectionsFor, delegates to it only on a non-empty trimmed id, so op=connections cannot reach it (the "
      + "method's own comment says so)"],
  ])],
`;
const ENDS_OPEN = `/* DEC-49 REGION is-relation-ends — D-641`;
const ENDS_END = `/* END DEC-49 REGION is-relation-ends */`;
const BARE_CALL_NOW = `const BARE_CALL = /(^|(?<=[^.\\w$#]))([A-Za-z_$][\\w$]*)\\s*\\(/g;`;
const BARE_CALL_OLD = `const BARE_CALL = /(^|[^.\\w$#])([A-Za-z_$][\\w$]*)\\s*\\(/g;`;
const ATTEST_LAST = '    ["REJECTED", "the same parser, the same attempt `note`"],\n';

/* ---- the declarations, as label fragments of the suite's own print (`out`) and of its source (`src`). ---- */
const CAT_NO_ENDS = { out: "NO_ENDS carries a canned sentence that is prose", src: "carries a canned sentence that is prose" };
const WIRE_NO_ENDS = { out: "relationdeclare with one end missing -> NO_ENDS", src: "relationdeclare with one end missing" };
const ONE_MINT_NO_KEY = { out: "NO_KEY is minted on exactly ONE line", src: "is minted on exactly ONE line" };

const ARMS = {
  baseline: { files: [], label: "nothing armed", apply: () => {}, mustFail: [], guardMustPass: true, expectGreen: true },
  a: {
    files: [CATALOG], label: "(A) THE ROW'S OWN — C-100.2 NO_ENDS's canned sentence emptied",
    apply: () => edit(CATALOG, NO_ENDS_SENTENCE, "    translation: '',"),
    mustFail: [CAT_NO_ENDS, WIRE_NO_ENDS], guardMustPass: false, guardMustName: "NO_ENDS",
  },
  b: {
    files: [STORE], label: "(B) A SECOND MINT — readProgression's NO_KEY back to its bare pre-D-641 literal",
    apply: () => edit(STORE, NO_KEY_SITE, NO_KEY_BARE),
    mustFail: [ONE_MINT_NO_KEY], guardMustPass: false, guardMustName: "NO_KEY",
  },
  c: {
    files: [GUARD], label: "(C) NO_CONTENT's not-on-the-wire declaration withdrawn",
    apply: () => edit(GUARD, NO_CONTENT_DECL, ""),
    mustFail: [], guardMustPass: false, guardMustName: "NO_CONTENT", expectGreen: true,
  },
  d: {
    files: [STORE], label: "(D) OVER-STRICTNESS — is-relation-ends's markers re-spelled; everything must stay GREEN",
    apply: () => {
      edit(STORE, ENDS_OPEN, `/**   DEC-49 REGION is-relation-ends  (re-spelled by a control arm) — D-641`);
      edit(STORE, ENDS_END, `/**   END DEC-49 REGION is-relation-ends  (re-spelled by a control arm)  **/`);
    },
    mustFail: [], guardMustPass: true, expectGreen: true,
  },
  e: {
    files: [WALK], label: "(E) THE WALK'S NESTED-CALL SIGHT REVERTED — BARE_CALL consumes its guard character again",
    apply: () => edit(WALK, BARE_CALL_NOW, BARE_CALL_OLD),
    mustFail: [], guardMustPass: false, guardMustName: "R6 PUBLIC OP", expectGreen: true,
  },
  f: {
    files: [GUARD], label: "(F) A STALE NARROWING — a declaration for a code the walk never attributes to attest",
    apply: () => edit(GUARD, ATTEST_LAST, ATTEST_LAST + '    ["NO_SUCH_CODE_D641_ARM_F", "declared by control arm (f)"],\n'),
    mustFail: [], guardMustPass: false, guardMustName: "NOT_ON_THE_WIRE declares NO_SUCH_CODE_D641_ARM_F", expectGreen: true,
  },
};

const want = process.argv[2];
const order = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`no such arm: ${want}. Arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
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
    const m = /d641-reach-by-op-translation: (\d+) pass, (\d+) fail/.exec(out);
    counted = m ? Number(m[2]) : -1;
    tally = m ? m[0] : "(NO TALLY — the suite died before its own summary; counted as -1)";
    const failed = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((f) => f[1]);
    guardExit = run(process.execPath, [GUARD, "--strict"], join(REPO, "civicos-ui"), GLOG);
    const gout = existsSync(GLOG) ? readFileSync(GLOG, "utf8") : "";
    const gFails = [...gout.matchAll(/^FAIL: (.+)$/gm)].map((l) => l[1]);
    guardNamed = arm.guardMustName ? gFails.some((l) => l.includes(arm.guardMustName)) : null;
    console.log(`  RESULT  ${tally}`);
    for (const f of failed) console.log(`    FAILING  ${f.slice(0, 130)}`);
    console.log(`  GUARD   exit ${guardExit}${arm.guardMustName ? `  a FAIL line names \`${arm.guardMustName}\`: ${guardNamed ? "YES" : "NO"}` : ""}`);
    for (const l of gFails.slice(0, 6)) console.log(`    GUARD FAIL  ${l.slice(0, 150)}`);
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
    if (guardWrong) console.log(`    THE GUARD DID NOT DO WHAT WAS DECLARED (wanted ${arm.guardMustPass ? "exit 0" : `a FAIL line naming \`${arm.guardMustName}\``})`);
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

/* NEGATIVE CONTROL: ALL SEVEN ROWS RUN 2026-09-25 by the D-641 worker (`node test/d641-reach-by-op-translation.control.mjs`
   from bio-plane/, branch land/worker/D-641 stacked on land/worker/D-542 @ fac514e0, before the first commit), driver
   exit 0, EVERY ARM AS DECLARED ON ITS FIRST RUN. Every needle unique at its arm; every declared label present in the
   suite's source; every restore sha256 MATCH, content IDENTICAL, cmp SAME, size ok. From the driver's own print:

     baseline  699 pass, 0 fail   guard exit 0
     a         697 pass, 2 fail   guard exit 1, names NO_ENDS (no canned translation)
     b         698 pass, 1 fail   guard exit 1, names NO_KEY (arm G, two literal sites); its wire arm stayed green
     c         699 pass, 0 fail   guard exit 1, names NO_CONTENT (reachGap 40 > 39)
     d         699 pass, 0 fail   guard exit 0
     e         699 pass, 0 fail   guard exit 1, R6 PUBLIC OP 32 < 36 and R5 BY OP 325 < 332
     f         699 pass, 0 fail   guard exit 1, names the stale declaration

   A GREEN FIRST RUN IS RECORDED AS SUCH, NOT AS PROOF: the declarations were checked against the arm output line by
   line (which FAIL each guard line named, not only its exit), and arm (e)'s R5 drop was not declared — it is a
   finding about the arm's reach (with the nested-call blind spot restored, seven codes leave R5 as well as four
   leave R6; which seven was not itemised), recorded here rather than folded into "as declared". */
