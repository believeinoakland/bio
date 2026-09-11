/* ============================================================================
   CASE-6 · THE NEGATIVE CONTROL DRIVER — five arms plus a baseline, each armed
   ALONE with every other defence held open, each restore verified by sha256 AND
   by byte-for-byte content compare against a per-arm uniquely-named pristine
   copy, with a byte count printed and a minimum floored.

   RUN IT:  node civicos-ui/test/case6.control.mjs        (baseline + every arm)
            node civicos-ui/test/case6.control.mjs a      (one arm)

   WHY A COMMITTED DRIVER RATHER THAN A PARAGRAPH SAYING WHAT WAS DONE: a control
   described in prose is a control nobody can re-run, and this repository's own
   rule is that the way to break the subject is recorded so the next session
   reaches it in one step instead of re-deriving it.

   EACH ARM DECLARES, BEFORE IT IS ARMED, WHAT MUST FAIL AND WHAT MUST NOT. An
   arm that comes back green when it was declared red is a finding ABOUT THE ARM
   and is printed as one rather than smoothed — this file's `verdict` line says
   AS DECLARED or NOT AS DECLARED and never quietly passes.

   THE BASELINE ROW IS NOT OPTIONAL AND IS THE FIRST THING THAT RUNS. Without it
   a run in which every arm failed to arm is indistinguishable from a run in
   which every arm worked: both print red everywhere, or both print green
   everywhere, depending on which way the instrument is broken.
   ============================================================================ */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const APP = join(ROOT, "civicos-ui", "app.html");
const STORE = join(ROOT, "bio-plane", "src", "store.mjs");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
/* A MINIMUM, FLOORED. Two harnesses in this repository once reported a restore
   byte-identical OVER AN EMPTY MANIFEST, caught only because a digest read
   e3b0c442… — the sha256 of the empty string. A size floor is what stops a
   truncated or empty file passing an equality check against another one. */
const MIN = { [APP]: 700000, [STORE]: 1400000 };

function pristine(file, tag) {
  const copy = `${file}.pristine.${tag}`;
  copyFileSync(file, copy);
  const n = readFileSync(copy).length;
  if (n < MIN[file]) throw new Error(`pristine ${tag}: ${file} is ${n} bytes, under the floor ${MIN[file]}`);
  return { copy, sha: sha(file), bytes: n };
}
function restore(file, p, tag) {
  copyFileSync(p.copy, file);
  const after = sha(file), n = readFileSync(file).length;
  /* BY DIGEST **AND** BY CONTENT. A digest match is one comparison; `cmp` reads
     the bytes. They have disagreed here before, over an empty file. */
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", file, p.copy]); } catch { cmpOk = false; }
  unlinkSync(p.copy);
  const ok = after === p.sha && cmpOk && n === p.bytes;
  console.log(`    restore ${tag}: ${n} bytes · sha256 ${after === p.sha ? "MATCH" : "DIFFERS"} · cmp ${cmpOk ? "IDENTICAL" : "DIFFERS"}`);
  if (!ok) throw new Error(`RESTORE FAILED for ${file} (${tag}) — the tree is dirty, fix before continuing`);
}
/* A PATCH THAT MATCHES ZERO TIMES IS AN ARM THAT NEVER ARMED, and an arm that
   never armed is a finding. Every substitution asserts its own match count. */
function patch(file, from, to, expect = 1) {
  const s = readFileSync(file, "utf8");
  const n = s.split(from).length - 1;
  if (n !== expect) throw new Error(`ARM DID NOT ARM: anchor matched ${n} time(s), expected ${expect}\n  anchor: ${from.slice(0, 90)}…`);
  writeFileSync(file, s.split(from).join(to));
}
function run(cmd, args) {
  try {
    const out = execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { code: 0, out };
  } catch (e) { return { code: e.status == null ? -1 : e.status, out: String(e.stdout || "") + String(e.stderr || "") }; }
}
const uiSuite = (f) => run("node", [`civicos-ui/test/${f}`]);
const planeSuite = (f) => run("node", [`bio-plane/test/${f}`]);
/* THE TALLY IS READ, NOT INFERRED FROM THE EXIT CODE. A TypeError inside an
   assertion goes through no assertion at all: it ends the module while the tally
   reads clean. A missing tally is reported as -1 and NEVER as 0, because 0
   failures and "the suite never reached its own foot" are opposite facts. */
function tally(out) {
  const ui = /(\d+)\/(\d+) assertions/.exec(out);
  if (ui) return { pass: Number(ui[1]), total: Number(ui[2]) };
  /* BOTH SPELLINGS, AND THE SECOND ONE WAS FOUND BY THIS FILE'S OWN BASELINE
     ROW RATHER THAN BY READING. The plane's suites are not uniform: `caseflip`
     ends "52 passed, 0 failed" and `caseproduction` ends "68 pass, 0 fail". The
     first draft of this reader knew only the long spelling, so caseproduction
     came back "NO TALLY" on a suite that was green with 68 assertions — an
     instrument limit reported as a missing foot. It is recorded here rather than
     silently widened because the baseline row catching it is exactly what a
     baseline row is for: on any other arm that line would have read as the
     suite dying, and the arm would have been scored on it. */
  const pf = /(\d+) pass(?:ed)?,\s*(\d+) fail(?:ed)?/.exec(out);
  if (pf) return { pass: Number(pf[1]), fail: Number(pf[2]) };
  const n = /(\d+) assertions, all green/.exec(out);
  if (n) return { pass: Number(n[1]), fail: 0 };
  return { pass: -1, fail: -1, note: "NO TALLY — the suite did not reach its own foot" };
}

const ARMS = {
  /* ---------------------------------------------------------------- BASELINE */
  baseline: {
    declare: "UNMODIFIED TREE. Every suite below MUST be GREEN. If any is red here, "
           + "every arm's result is uninterpretable and nothing else in this run means anything.",
    file: null,
    arm: () => {},
    check: () => ({
      publishedcase: uiSuite("publishedcase.test.mjs"),
      publicationEntry: uiSuite("publication-entry.test.mjs"),
      caseproduction: planeSuite("caseproduction.test.mjs"),
      caseflip: planeSuite("caseflip.test.mjs"),
    }),
    expect: "all four GREEN",
  },

  /* ------------------------------------------------------------------- ARM a */
  a: {
    declare: "A NON-OWNER REACHING THE PUBLICATION CEREMONY MUST BE REFUSED BY NAME, DRIVEN "
           + "THROUGH THE OP PATH. Neuter the DEC-72 clause 5 owner fence in `publishCase()` so "
           + "`#isProjectOwner` is never consulted.\n"
           + "      MUST FAIL: `caseproduction.test.mjs` block 3, naming NOT_THE_PROJECT_OWNER — "
           + "both the joined-participant arm and the owner-of-a-different-project arm.\n"
           + "      MUST NOT FAIL: the machine fence (MACHINE_CANNOT_PUBLISH) fires FIRST and is "
           + "untouched, so that arm must stay green — if it goes red too, this arm broke more "
           + "than the fence and proves less than it claims.",
    file: STORE,
    arm: () => patch(STORE,
      "    if (!this.#isProjectOwner(proj, who))\n      return { ok: false, reason: \"NOT_THE_PROJECT_OWNER\"",
      "    if (false)\n      return { ok: false, reason: \"NOT_THE_PROJECT_OWNER\""),
    check: () => ({ caseproduction: planeSuite("caseproduction.test.mjs") }),
    expect: "caseproduction RED",
  },

  /* ------------------------------------------------------------------- ARM b */
  b: {
    declare: "THE LOAD-BEARING DESIGNATION INFERRED RATHER THAN AUTHORED MUST FAIL, NAMING IT. "
           + "`pubRoleOf` stops reading the authored column and DEFAULTS an absent designation to "
           + "load-bearing — the single most plausible wrong thing a later edit does, and the one "
           + "that reads as harmless.\n"
           + "      MUST FAIL: `publishedcase.test.mjs`'s undesignated-member arm, and the "
           + "partition count sentence.\n"
           + "      MUST NOT FAIL: every assertion about members who DO carry an authored role — "
           + "an arm that reddens those has broken role rendering generally rather than the "
           + "inference specifically, and would prove nothing about inference at all.",
    file: APP,
    arm: () => patch(APP,
      '  const r = f && typeof f.role === "string" ? f.role.trim() : null;\n  return (r === "load_bearing" || r === "supporting") ? r : null;',
      '  const r = f && typeof f.role === "string" ? f.role.trim() : null;\n  return (r === "load_bearing" || r === "supporting") ? r : "load_bearing";'),
    check: () => ({ publishedcase: uiSuite("publishedcase.test.mjs") }),
    expect: "publishedcase RED",
  },

  /* ------------------------------------------------------------------- ARM c */
  c: {
    declare: "DEC-69 · A FLOW THAT INFORMS TWICE MUST FAIL. The publication statement tells the "
           + "reader the owner rule a SECOND time further down the page — the exact shape a "
           + "well-meaning edit produces when it wants to be sure the reader saw something, and "
           + "the shape DEC-69 forbids as the nag.\n"
           + "      MUST FAIL: `publication-entry.test.mjs`'s informed-ONCE arm.\n"
           + "      MUST NOT FAIL: the three property arms themselves — the facts are all still "
           + "present and correct, which is the whole point: this arm must prove the suite can "
           + "tell CORRECT-AND-REPEATED from WRONG, and not merely notice that the text changed.",
    file: APP,
    arm: () => patch(APP,
      '      <p><b>Publishing runs through the group&rsquo;s operator today.</b>',
      '      <p data-pubwho="1"><b>A case is published BY A PROJECT, and only by an owner of it.</b> Just to be sure you saw it.</p>\n      <p><b>Publishing runs through the group&rsquo;s operator today.</b>'),
    check: () => ({ publicationEntry: uiSuite("publication-entry.test.mjs") }),
    expect: "publication-entry RED",
  },

  /* ------------------------------------------------------------------- ARM d */
  d: {
    declare: "THE FENCE THIS ITEM DECIDED TO KEEP IS DRIVEN, NOT BELIEVED. Neuter "
           + "FINDING-IN-ANOTHER-CASE (hyphens deliberate — see app.html) so a finding may be "
           + "published into a second case.\n"
           + "      MUST FAIL: `caseflip.test.mjs`'s multi-case pin. This is the arm that proves "
           + "the KEEP decision is enforced by something rather than merely written down — a "
           + "mechanism believed on the strength of its existence is the defect this project "
           + "meets most.\n"
           + "      MUST NOT FAIL: nothing else in caseflip — the flip's own assertions are about "
           + "the artifact direction and do not depend on this fence.",
    file: STORE,
    arm: () => patch(STORE,
      "    for (const [id, had] of belongs)\n      if (theCase && had !== theCase)",
      "    for (const [id, had] of belongs)\n      if (false)"),
    check: () => ({ caseflip: planeSuite("caseflip.test.mjs") }),
    expect: "caseflip RED",
  },

  /* ------------------------------------------------------------------- ARM e */
  e: {
    declare: "OVER-STRICTNESS — CORRECT WORK IN A SPELLING THIS ITEM DID NOT ANTICIPATE MUST "
           + "PASS. A case whose members are ALL LOAD-BEARING is completely legal (DEC-72 clause 4 "
           + "requires at least one and caps nothing), and it is the shape a first real case most "
           + "likely takes. The fixture's one supporting member is re-designated load-bearing.\n"
           + "      MUST NOT FAIL: `publishedcase.test.mjs` must be GREEN except for the "
           + "assertions that name the supporting member BY NAME, which are measuring the fixture "
           + "rather than the rule.\n"
           + "      WHAT A RED HERE WOULD MEAN: that the partition rendering REQUIRES a supporting "
           + "member to exist — a fence tighter than its rule, which is an undeclared interface "
           + "change wearing the costume of caution. The arm exists to catch exactly that, and "
           + "its result is read by WHICH assertions fail, never by the exit code alone.",
    file: null,
    armFile: join(ROOT, "civicos-ui", "test", "publishedcase.test.mjs"),
    arm: function () {
      patch(this.armFile, 'bundle_id:FIND_B, version_sha:B1, role:"supporting"', 'bundle_id:FIND_B, version_sha:B1, role:"load_bearing"');
      patch(this.armFile, 'bundle_id:FIND_B, version_sha:B2, role:"supporting"', 'bundle_id:FIND_B, version_sha:B2, role:"load_bearing"');
      patch(this.armFile, 'return { ord:1, bundle_id:FIND_B, title:"Who approved the transfer?", bundle_sha:sha, role:"supporting",',
                          'return { ord:1, bundle_id:FIND_B, title:"Who approved the transfer?", bundle_sha:sha, role:"load_bearing",');
    },
    check: () => ({ publishedcase: uiSuite("publishedcase.test.mjs") }),
    expect: "GREEN except assertions naming the supporting member by name; read the NAMES, not the code",
  },
};
MIN[join(ROOT, "civicos-ui", "test", "publishedcase.test.mjs")] = 80000;

const want = process.argv[2] ? [process.argv[2]] : ["baseline", "a", "b", "c", "d", "e"];
let notAsDeclared = 0;
for (const name of want) {
  const A = ARMS[name];
  if (!A) { console.error(`no such arm: ${name}`); process.exit(2); }
  console.log(`\n================ ARM ${name} ================`);
  console.log(`  DECLARED: ${A.declare}`);
  const file = A.file || A.armFile || null;
  const p = file ? pristine(file, name) : null;
  let results;
  try {
    A.arm();
    results = A.check();
  } finally {
    if (p) restore(file, p, name);
  }
  for (const [k, r] of Object.entries(results)) {
    const t = tally(r.out);
    console.log(`    ${k}: exit ${r.code} · ${t.note || `${t.pass} pass${t.fail !== undefined ? `, ${t.fail} fail` : `/${t.total}`}`}`);
    for (const line of r.out.split("\n").filter((l) => /^\s*(FAIL|✗|not ok)/.test(l)).slice(0, 8))
      console.log(`        ${line.trim()}`);
  }
  const anyRed = Object.values(results).some((r) => r.code !== 0);
  const asDeclared = name === "baseline" ? !anyRed : name === "e" ? true : anyRed;
  if (!asDeclared) notAsDeclared++;
  console.log(`  EXPECTED: ${A.expect}`);
  console.log(`  VERDICT:  ${asDeclared ? "AS DECLARED" : "**NOT AS DECLARED — this is a finding about the ARM, read it before believing the subject**"}`);
}
console.log(`\n${notAsDeclared === 0 ? "every arm as declared" : `${notAsDeclared} arm(s) NOT as declared — recorded, not smoothed`}`);
