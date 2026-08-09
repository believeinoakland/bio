#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for FL-2 (the agent Worker) and VF-3 (coverage
 * gates the fleet). Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while
 * it runs, and neither `scripts/battery.mjs` nor the fleet walk must discover it
 * (PL-3/PL-4/PL-11's precedent).
 *
 *   node agent-worker/test/agent-worker.control.mjs           all arms
 *   node agent-worker/test/agent-worker.control.mjs A3 V2     named arms only
 *
 * THE RULES THIS HARNESS ENFORCES ON ITSELF, each of them paid for by a defect
 * this project has already met:
 *
 *  - **IT LIVES INSIDE THIS WORKTREE**, never in a shared scratchpad: a
 *    concurrent worker overwrote a harness between ARM and RESTORE once already.
 *  - **EVERY ARM IS ARMED ALONE**, with every other defence held OPEN. One
 *    defence down proves TEETH and says nothing about harm; naming a harm takes
 *    two down deliberately and saying so.
 *  - **EVERY ARM DECLARES WHAT MUST FAIL *AND* WHAT MUST NOT** before it runs,
 *    and both halves are checked. An arm that only asserts "something broke"
 *    cannot tell a real defence from a suite that crashed.
 *  - **AN ARM THAT DOES NOT ARM IS A FINDING, NOT A PASS.** The patch must match
 *    exactly once; zero matches means the arm never happened, and this harness
 *    says so loudly rather than reporting the green run underneath it. Several
 *    arms in this project have "passed" while asserting nothing.
 *  - **EVERY RESTORE IS VERIFIED BY sha256 AND BY CONTENT.** This project has met
 *    an NC harness that reported a byte-identical restore over a file it never
 *    restored, so the hash is checked AND `cmp` is run against a copy of the
 *    original taken before the edit. Two independent instruments, because one
 *    instrument agreeing with itself costs nothing.
 *  - **AN ARM THAT COMES BACK GREEN WHEN RED WAS PREDICTED IS RECORDED AS A
 *    FINDING ABOUT THE ARM**, not smoothed away.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync, renameSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");
const REPO = join(MEMBER, "..");
const PLANE = join(REPO, "bio-plane");

const SRC = join(MEMBER, "src", "index.mjs");
const MANIFEST = join(MEMBER, "fleet-member.json");
const COVERAGE = join(PLANE, "scripts", "coverage.mjs");

const WORK = mkdtempSync(join(tmpdir(), "fl2-control-"));
process.on("exit", () => { try { rmSync(WORK, { recursive: true, force: true }); } catch { /* */ } });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));

let armsRun = 0, armsAsDeclared = 0;
const findings = [];

/* ------------------------------------------------------------- the two runners */

/* The member's own suite. Returns { pass, fail, failed: [labels] }. */
function runSuite() {
  const r = spawnSync(process.execPath, [join(HERE, "agent-worker.test.mjs")],
    { cwd: MEMBER, encoding: "utf8", env: { ...process.env } });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/agent-worker:\s*(\d+) passed,\s*(\d+) failed/);
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  /* A suite that DIED mid-run reports no tail line at all, and reading that as
     "0 failures" is how a control once read a whole file as "stayed GREEN". */
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}

/* ANY of this member's suites, by name — D-276 needed the OTHER two. The member
   has three suites and this harness could run only one of them, so an arm that
   broke something `fanout.test.mjs` or `harness.test.mjs` holds would have been
   scored against a suite that never asserts it. Same tail-line discipline: a
   suite that DIED reports `-1`, never `0`. */
function runNamedSuite(name) {
  const r = spawnSync(process.execPath, [join(HERE, `${name}.test.mjs`)],
    { cwd: MEMBER, encoding: "utf8", env: { ...process.env } });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`^${name}:\\s*(\\d+) passed,\\s*(\\d+) failed`, "m"));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}

/* The instrument, run DIRECTLY with its exit status read unpiped. */
function runCoverageStrict() {
  const r = spawnSync(process.execPath, [join(PLANE, "scripts", "coverage.mjs"), "--strict"],
    { cwd: PLANE, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

/* --------------------------------------------------------- arm / restore ---- */

function takeOriginal(file) {
  const bytes = readFileSync(file);
  const copy = join(WORK, `${file.replace(/[^\w]/g, "_")}.orig`);
  writeFileSync(copy, bytes);
  return { file, bytes, copy, sha: sha(bytes) };
}

function restore(orig) {
  writeFileSync(orig.file, orig.bytes);
  const now = readFileSync(orig.file);
  const hashOk = sha(now) === orig.sha;
  /* The SECOND instrument. A harness that trusted its own hash reported a
     byte-identical restore over a file it had never written. */
  const cmp = spawnSync("cmp", ["-s", orig.file, orig.copy]);
  const contentOk = cmp.status === 0;
  if (!hashOk || !contentOk) {
    console.error(`\n  !!! RESTORE FAILED for ${orig.file} — sha256 ${hashOk ? "ok" : "MISMATCH"}, `
      + `cmp ${contentOk ? "ok" : "MISMATCH"}. STOPPING: the tree is not as it was found.`);
    process.exit(2);
  }
  return `restore verified (sha256 + cmp)`;
}

function patch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, hits: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, hits: 1 };
}

/* An arm: declare what MUST fail and what MUST NOT, arm it alone, measure, and
   restore before anything else runs. */
function arm({ id, subject, what, mustFail, mustNot, file, find, replace, patches, swapManifest, run }) {
  if (only.length && !only.includes(id)) return;
  armsRun++;
  console.log(`\n=== ARM ${id} · ${subject}`);
  console.log(`    WHAT IS BROKEN : ${what}`);
  console.log(`    MUST FAIL      : ${mustFail}`);
  console.log(`    MUST NOT FAIL  : ${mustNot}`);

  /* D-276 needed arms that take TWO OR THREE FILES DOWN DELIBERATELY — the
     member's argument, its fixture and its answer check are three separate
     defences and the interesting statement is what each ONE buys. `patches`
     is the multi-file form of `file`/`find`/`replace`; every file is snapshotted
     and every one is restored and VERIFIED, and a patch that matches other than
     exactly once still aborts the whole arm as never-armed. */
  const edits = patches ?? (file ? [{ file, find, replace }] : []);
  let origs = [], moved = null;
  {
    let failedAt = null;
    for (const e of edits) {
      const o = takeOriginal(e.file);
      origs.push(o);
      const p = patch(e.file, e.find, e.replace);
      if (!p.armed) { failedAt = { file: e.file, hits: p.hits }; break; }
    }
    if (failedAt) {
      console.log(`    >>> THE ARM DID NOT ARM: the patch for ${failedAt.file} matched ${failedAt.hits} time(s), not once.`);
      console.log(`        THIS IS A FINDING ABOUT THE ARM, not a green result. Nothing was measured.`);
      findings.push(`${id}: never armed (patch matched ${failedAt.hits} times in ${failedAt.file})`);
      for (const o of origs.reverse()) restore(o);
      return;
    }
  }
  if (swapManifest) {
    moved = `${MANIFEST}.hidden`;
    renameSync(MANIFEST, moved);
  }

  let result;
  try { result = run(); }
  finally {
    if (moved) renameSync(moved, MANIFEST);
    for (const o of [...origs].reverse()) console.log(`    ${restore(o)} — ${o.file.replace(REPO + "/", "")}`);
    if (swapManifest) console.log(`    manifest restored (present: ${existsSync(MANIFEST)})`);
  }

  console.log(`    OBSERVED       : ${result.observed}`);
  if (result.asDeclared) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else {
    console.log(`    VERDICT        : *** NOT AS DECLARED — recorded as a finding about the arm ***`);
    findings.push(`${id}: ${result.observed}`);
  }
}

/* ============================================================================
 * SECTION A — FL-2. THE WORKER'S OWN FENCES.
 * ========================================================================== */

/* FL-2's named control, half one. The row: "give the worker a direct store write
   ... -> the source-scan AND behavioural (bytes unchanged) assertions fail". */
arm({
  id: "A1", subject: "FL-2's named control, half one — A DIRECT WRITE",
  what: "the member calls the plane's MUTATING op=purge beside its read",
  mustFail: "the BEHAVIOURAL arm (the plane record's sha256 moves) AND the source-scan arm (the pinned op set is no longer exactly {whoami})",
  mustNot: "the refusal arms, the version endpoint, the bound arms",
  file: SRC,
  find: `  const asked = await askPlane(env, "whoami", credential, store);`,
  replace: `  await askPlane(env, "purge", credential, store);\n  const asked = await askPlane(env, "whoami", credential, store);`,
  run: () => {
    const r = runSuite();
    /* MATCHERS UPDATED BY FL-3 with the arms they read. The labels this arm
       watched (`record's sha256 is unchanged`, `none of them wrote anything`)
       were CORRECTED when `/run` gained the IS-9 table — a member that logs
       every step legitimately moves the record. The RULE this arm proves is
       unchanged and is now sharper: an op nobody decided to give this member
       must not move the record. A control whose matcher no longer names any
       real assertion is a control that reports green forever, which is the
       defect this whole file exists to prevent. */
    const behavioural = r.failed.some((l) => /record moved only through ops in the pinned set|wrote through an op outside the pinned set|credential scope can declare/.test(l));
    const sourceScan = r.failed.some((l) => /in the pinned set|agent-write declaration|AI_RUN_ACTIONS/.test(l));
    const refusalsHeld = !r.failed.some((l) => /-> 40[01] |-> 404 UNKNOWN|names its own build/.test(l));
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · behavioural ${behavioural ? "FAILED" : "held"} · source-scan ${sourceScan ? "FAILED" : "held"} · refusal arms ${refusalsHeld ? "held" : "ALSO FAILED"}`,
      asDeclared: r.ran && behavioural && sourceScan && refusalsHeld,
    };
  },
});

/* Half two, and it could NOT be inferred from half one: a member may write
   nothing and still act as somebody it was not handed. */
arm({
  id: "A2", subject: "FL-2's named control, half two — A SECOND CREDENTIAL",
  what: "the member calls the plane a second time under a credential of its own instead of the one it was handed",
  mustFail: "the 'exactly one distinct credential reached the plane' arm AND the 'no credential is compiled in' source arm",
  mustNot: "the behavioural write arm (nothing is written — that is the point of arming this separately)",
  file: SRC,
  find: `  const asked = await askPlane(env, "whoami", credential, store);`,
  replace: `  await askPlane(env, "whoami", "aik-" + "f".repeat(64), store);\n  const asked = await askPlane(env, "whoami", credential, store);`,
  run: () => {
    const r = runSuite();
    const oneCred = r.failed.some((l) => /exactly one distinct credential/.test(l));
    const compiledIn = r.failed.some((l) => /no credential is compiled in/.test(l));
    const writeHeld = !r.failed.some((l) => /record moved only through ops in the pinned set/.test(l));
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · one-credential ${oneCred ? "FAILED" : "held"} · compiled-in-credential ${compiledIn ? "FAILED" : "held"} · write arm ${writeHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: r.ran && oneCred && compiledIn && writeHeld,
    };
  },
});

/* FL-1's routing finding, demonstrated rather than restated. */
arm({
  id: "A3", subject: "THE BINDING IS THE ONLY ROUTE OUT",
  what: "env.PLANE.fetch(url) is replaced by a bare global fetch() at this account's own workers.dev name",
  mustFail: "the URL-literal source arm, the workers.dev arm, the bare-fetch arm, and the round trip itself",
  mustNot: "the config arms (wrangler.jsonc is untouched) and the manifest arms",
  file: SRC,
  /* PATCH STRING UPDATED BY FL-3, AND THE HARNESS CAUGHT ITS OWN STALENESS. FL-3
     gave `askPlane` a body and a query, so `env.PLANE.fetch(url)` became
     `env.PLANE.fetch(url, ...)` and this arm matched ZERO times — reported as a
     FINDING ("the arm did not arm") rather than as the green run underneath it,
     which is exactly what that rule is for. A control arm keyed to a source line
     is a control arm that goes stale when the line moves, and the only defence
     is a harness that refuses to score an arm it never armed. */
  find: `    res = await env.PLANE.fetch(url, body == null ? undefined : {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });`,
  replace: `    res = await fetch("https://bio-plane.20b533579290b9b93168345edd3b7f72.workers.dev/?op=whoami");`,
  run: () => {
    const r = runSuite();
    const urlArm = r.failed.some((l) => /only absolute URL|workers\.dev|bare global fetch/.test(l));
    const roundTrip = r.failed.some((l) => /the class comes from the PLANE|^200$|ok$/.test(l)) || r.fail > 3;
    const configHeld = !r.failed.some((l) => /account_id is PINNED|exactly one binding/.test(l));
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · url/fetch source arms ${urlArm ? "FAILED" : "held"} · round trip ${roundTrip ? "FAILED" : "held"} · config arms ${configHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && urlArm && roundTrip && configHeld,
    };
  },
});

/* D-199 (2): a scope compiled into a Worker is the settings row the
   determination refused. */
arm({
  id: "A4", subject: "THE SCOPE IS THE PLANE'S, NOT THIS MEMBER'S",
  what: "the member decides for itself which ops are allowed, by naming a second op it may call",
  mustFail: "the pinned-op-set arm (exact equality is floor AND ceiling, so a GAINED call fails it too)",
  mustNot: "the behavioural write arm — the added op is non-mutating, which is precisely why a write test alone would not catch this",
  file: SRC,
  find: `  const asked = await askPlane(env, "whoami", credential, store);`,
  replace: `  await askPlane(env, "instance", credential, store);\n  const asked = await askPlane(env, "whoami", credential, store);`,
  run: () => {
    const r = runSuite();
    const pinned = r.failed.some((l) => /in the pinned set|agent-write declaration/.test(l));
    const writeHeld = !r.failed.some((l) => /record moved only through ops in the pinned set/.test(l));
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · pinned-op-set ${pinned ? "FAILED" : "held"} · write arm ${writeHeld ? "held (as declared — the gained op is non-mutating)" : "also failed"}`,
      asDeclared: r.ran && pinned && writeHeld,
    };
  },
});

/* THE SIZING, MADE FALSIFIABLE. 1,100 is the figure FL-1's CPU curve
   extrapolates to; the memory curve says ~10x too long. */
arm({
  id: "A5", subject: "THE SEGMENT BOUND IS SIZED ON MEMORY, NOT CPU",
  what: "the default bound is set to 1100 — the number FL-1's CPU curve extrapolates to",
  mustFail: "the 'inside FL-1's measured 100-150 band' arm and the 'default bound is 120' arm",
  mustNot: "the over-bound refusal arm (it still refuses, just at the wrong number) and every source-scan arm",
  file: SRC,
  find: `const DEFAULT_MAX_TURNS_PER_SEGMENT = 120;`,
  replace: `const DEFAULT_MAX_TURNS_PER_SEGMENT = 1100;`,
  run: () => {
    const r = runSuite();
    const band = r.failed.some((l) => /measured 100-150 band/.test(l));
    const exact = r.failed.some((l) => /default bound is 120/.test(l));
    const scanHeld = !r.failed.some((l) => /no \.put\(|in the pinned set|account_id is PINNED/.test(l));
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · band arm ${band ? "FAILED" : "held"} · exact-value arm ${exact ? "FAILED" : "held"} · source scans ${scanHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && band && exact && scanHeld,
    };
  },
});

/* DEC-49's drift, one layer out: thirteen surfaces each inventing wording. */
arm({
  id: "A6", subject: "A PLANE REFUSAL IS PASSED THROUGH, NOT RE-WORDED",
  what: "the member replaces the plane's refusal body with a sentence of its own",
  mustFail: "the three verbatim-pass-through arms (the plane's code, its C-number and its canned translation)",
  mustNot: "the round trip, the write arm, or any source scan",
  file: SRC,
  find: `                  plane_status: asked.status, plane: asked.body }, 403);`,
  replace: `                  plane_status: asked.status, plane: { reason: "REFUSED", check: null, translation: "the agent could not do that" } }, 403);`,
  run: () => {
    const r = runSuite();
    const verbatim = r.failed.filter((l) => /plane's (code|C-number|canned translation) is UNCHANGED/.test(l)).length;
    const restHeld = !r.failed.some((l) => /record moved only through ops|in the pinned set|the class comes from the PLANE/.test(l));
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · ${verbatim} of 3 verbatim arms FAILED · everything else ${restHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && verbatim === 3 && restHeld,
    };
  },
});

/* ============================================================================
 * SECTION V — VF-3. THE INSTRUMENT'S OWN TEETH.
 * "hide the fleet manifest from the walk -> --strict must FAIL, not report the
 * old figure (wrong-in-the-generous-direction is the named failure mode)."
 * ========================================================================== */

arm({
  id: "V1", subject: "VF-3'S NAMED CONTROL — HIDE THE FLEET MANIFEST",
  what: "agent-worker/fleet-member.json is renamed away, so the discovery walk cannot see the member",
  mustFail: "`coverage.mjs --strict` must EXIT NON-ZERO, naming the undeclared Worker directory — it must NOT report the pre-FL-2 figure",
  mustNot: "the plane's own OPS/CHECKS/CONTROLS figures, which have nothing to do with the fleet",
  swapManifest: true,
  run: () => {
    const r = runCoverageStrict();
    const named = /UNACCOUNTED|agent-worker carr|wrangler\.jsonc and no fleet-member\.json/.test(r.out);
    const floorAlsoFired = /FLEET FLOOR/.test(r.out);
    const planeHeld = /OPS\s+\d+ declared · \d+ reached through the control plane \(100\.0%\)/.test(r.out)
      && /CHECKS\s+\d+ in the catalog · \d+ named by an assertion \(100\.0%\)/.test(r.out);
    return {
      observed: `exit ${r.code} · undeclared-Worker gate ${named ? "FIRED and NAMED the directory" : "did NOT fire"} · fleet floor ${floorAlsoFired ? "also fired" : "did not fire"} · plane figures ${planeHeld ? "held at 100%" : "MOVED (unexpected)"}`,
      asDeclared: r.code !== 0 && named && planeHeld,
    };
  },
});

arm({
  id: "V2", subject: "THE FLOOR — a whole member DIRECTORY vanishing",
  what: "FLEET_FLOOR.members is raised to 3, standing in for a member directory that is gone entirely (the case the undeclared-Worker gate structurally cannot see)",
  mustFail: "`--strict` must exit non-zero naming FLEET FLOOR — a count with no floor is not a ratchet",
  mustNot: "the undeclared-Worker gate, which has nothing to say about a directory that is not there",
  file: COVERAGE,
  /* RE-ANCHORED 2026-08-09 BY D-276, AND THE STALENESS IS THE FINDING RATHER
     THAN THE FIX. This arm anchored on `  members:    2,   // pdf-worker (I6,
     CPDF-6) + agent-worker (I8, FL-2).` — the spelling that line had when the
     arm was written. VF-5 rewrote `FLEET_FLOOR`'s comment block and the line is
     now `  members:     2,` with its trailing comment moved into the block
     above, so the patch matched ZERO times and V2 reported THE ARM DID NOT ARM
     on a clean `main`. It is the third time in this file that a control keyed to
     a source line has gone stale when the line moved, and the only reason it is
     visible at all is the harness's rule that an arm which did not arm is a
     FINDING and never a pass. Anchored on the shortest span that is still
     unambiguous. */
  find: `  members:     2,`,
  replace: `  members:     3,`,
  run: () => {
    const r = runCoverageStrict();
    const floor = /FLEET FLOOR: 2 fleet member\(s\) discovered, floor is 3/.test(r.out);
    const unaccountedQuiet = !/UNACCOUNTED/.test(r.out);
    return {
      observed: `exit ${r.code} · floor gate ${floor ? "FIRED" : "did NOT fire"} · undeclared-Worker gate ${unaccountedQuiet ? "silent (as declared)" : "also fired"}`,
      asDeclared: r.code !== 0 && floor && unaccountedQuiet,
    };
  },
});

arm({
  id: "V3", subject: "A MEMBER WHOSE SURFACE TABLE CANNOT BE READ",
  what: "the member's SURFACE table is renamed, so the walk finds the manifest but no surface",
  mustFail: "`--strict` must exit non-zero — this used to report `0/0 ops reached` and PASS, the emptiest possible green",
  mustNot: "the undeclared-Worker gate (the manifest is present) or the plane's figures",
  file: SRC,
  find: `export const SURFACE = {`,
  replace: `export const SURFACE_TABLE = {`,
  run: () => {
    const r = runCoverageStrict();
    const surfaceGate = /FLEET SURFACE: agent-worker/.test(r.out);
    const floorAlso = /FLEET FLOOR/.test(r.out);
    return {
      observed: `exit ${r.code} · surfaceless gate ${surfaceGate ? "FIRED" : "did NOT fire"} · floor ${floorAlso ? "also fired (the surface ops fell below it)" : "did not fire"}`,
      asDeclared: r.code !== 0 && surfaceGate,
    };
  },
});

arm({
  id: "V4", subject: "FLEET RULE 2 — a member that ASSERTS something",
  what: "the member declares its `run` surface op `mutating: true`",
  mustFail: "`--strict` must exit non-zero naming FLEET RULE 2 — a member returns derived output and writes nothing (PARALLELISM.md)",
  mustNot: "the floor, the undeclared-Worker gate, or the surfaceless gate",
  file: SRC,
  find: `  run:     { method: "POST", mutating: false },`,
  replace: `  run:     { method: "POST", mutating: true },`,
  run: () => {
    const r = runCoverageStrict();
    const rule2 = /FLEET RULE 2: agent-worker\.run/.test(r.out);
    const othersQuiet = !/FLEET FLOOR|UNACCOUNTED|FLEET SURFACE/.test(r.out);
    return {
      observed: `exit ${r.code} · rule-2 gate ${rule2 ? "FIRED" : "did NOT fire"} · other fleet gates ${othersQuiet ? "silent (as declared)" : "also fired"}`,
      asDeclared: r.code !== 0 && rule2 && othersQuiet,
    };
  },
});

arm({
  id: "V5", subject: "THE BATTERY ACTUALLY RUNS THE MEMBER'S SUITE",
  what: "the member's suite is made to fail one assertion, to prove the battery's fleet lane carries a failure rather than merely listing it",
  mustFail: "`battery.mjs agent-worker` must exit NON-ZERO and name the member's suite in FAILED",
  mustNot: "any plane suite — the fleet lane must not disturb the 118",
  file: join(HERE, "agent-worker.test.mjs"),
  find: `  t("the default bound is 120", bound, 120);`,
  replace: `  t("the default bound is 120", bound, 999);`,
  run: () => {
    const r = spawnSync(process.execPath, [join(PLANE, "scripts", "battery.mjs"), "agent-worker"],
      { cwd: PLANE, encoding: "utf8" });
    const out = (r.stdout || "") + (r.stderr || "");
    const named = /FAILED: .*agent-worker\/agent-worker\.test\.mjs/.test(out);
    const failedLine = (out.match(/^\s*FAILED: (.*)$/m) || [, ""])[1];
    const planeQuiet = failedLine.split(",").map((s) => s.trim()).filter(Boolean)
      .every((f) => f === "agent-worker/agent-worker.test.mjs");
    return {
      observed: `exit ${r.status} · the member's suite ${named ? "is NAMED in FAILED" : "was NOT named"} · plane suites ${planeQuiet ? "untouched" : "also failed"}`,
      asDeclared: r.status !== 0 && named && planeQuiet,
    };
  },
});

/* ============================================================================
 * SECTION D — D-276. THE MEANING ARM, THE ANSWER CHECK, AND THE FIXTURE.
 *
 * D-276 is TWO defects and the second is about this file's own trade. The member
 * asked `op=meaningrows` for the arm `"legs"`, which the plane does not hold, and
 * wrote the refusal into an AI run's observation entries as `0 meaning-grain
 * row(s) queried`. **And no suite could see it**, because all three plane mocks
 * answered that op `{ ok: true, rows: [] }` for ANY argument.
 *
 * So the arms below take THREE separate defences down — the member's ARGUMENT,
 * its ANSWER CHECK, and the FIXTURE's ability to refuse — one at a time and then
 * together, because what matters is not that something breaks but WHICH of the
 * three is load-bearing for which suite. D3 is the one worth reading: it
 * reproduces the world as it shipped, and shows that with a permissive fixture
 * the member's own suites go GREEN over a call that cannot succeed, and that the
 * ONLY thing that sees it is the section that drives the REAL plane.
 * ========================================================================== */

const HARNESS_SRC = join(MEMBER, "src", "harness.mjs");
const MEANING_MOCK = join(HERE, "plane-meaning.mjs");

/* The arm's exact spelling, as it stands in the source. */
const ARM_FIND = `export const MEANING_ARM = "leg";`;
const ARM_WRONG = `export const MEANING_ARM = "legs";`;
/* The permissive fixture, restored to what all three mocks used to say. */
const MOCK_FIND = `      const asked = String(url.searchParams.get("rows") || "").trim().toLowerCase();`;
const MOCK_PERMISSIVE = `      const asked = "leg"; url.searchParams.get("rows");`;
/* The nested half of the answer check — the half a member that "checks ok"
   would still not have. */
const NESTED_FIND = `  if (asked.status !== 200 || envelope.ok !== true || said.ok === false)`;
const NESTED_GONE = `  if (asked.status !== 200 || envelope.ok !== true)`;

const threeSuites = () => ({
  aw: runNamedSuite("agent-worker"), fo: runNamedSuite("fanout"), hs: runNamedSuite("harness"),
});
const tally = (s) => `agent-worker ${s.aw.pass}/${s.aw.fail} · fanout ${s.fo.pass}/${s.fo.fail} · harness ${s.hs.pass}/${s.hs.fail}`;

arm({
  id: "D1", subject: "D-276's DEFECT, REINTRODUCED — the arm the record does not hold",
  what: `MEANING_ARM goes back to "legs", the spelling that shipped; the fixture and the answer check are held OPEN`,
  mustFail: "ALL THREE of this member's suites — the arm-is-known arms, the observation-entry arms in agent-worker and harness, and fanout's citations_reread",
  mustNot: "the bound, the refusal-passthrough, the version endpoint or the write arms — none of them is about the meaning layer",
  patches: [{ file: HARNESS_SRC, find: ARM_FIND, replace: ARM_WRONG }],
  run: () => {
    const s = threeSuites();
    const allRed = s.aw.fail > 0 && s.fo.fail > 0 && s.hs.fail > 0;
    const allRan = s.aw.ran && s.fo.ran && s.hs.ran;
    /* The arm must fail for the RIGHT reason: the note must now say the layer
       went unread, not merely differ. */
    const named = s.aw.failed.some((l) => /arm this member sends is one the plane/.test(l))
               && s.hs.failed.some((l) => /COUNTS the rows the record answered with/.test(l))
               && s.fo.failed.some((l) => /three were re-read|ANSWERED, not merely attempted/.test(l));
    const unrelatedHeld = !s.aw.failed.some((l) => /default bound is 120|names its own build|-> 40[01] /.test(l));
    return {
      observed: `${tally(s)} · all three RED ${allRed} · the meaning arms are the ones NAMED ${named} · unrelated arms ${unrelatedHeld ? "held" : "ALSO FAILED"}`,
      asDeclared: allRan && allRed && named && unrelatedHeld,
    };
  },
});

arm({
  id: "D2", subject: "THE FIXTURE ALONE — a mock that says yes to everything",
  what: "plane-meaning.mjs stops reading the `rows` argument and accepts anything, exactly as all three mocks used to; the member's arm stays CORRECT",
  mustFail: "ONLY agent-worker's mock-agrees-with-the-plane arms — the mock can no longer refuse, and the suite says so",
  mustNot: "fanout or harness at all, and not one arm about the member itself — the member is not broken in this arm, its instrument is",
  patches: [{ file: MEANING_MOCK, find: MOCK_FIND, replace: MOCK_PERMISSIVE }],
  run: () => {
    const s = threeSuites();
    const mockArmsFailed = s.aw.failed.some((l) => /THE MOCK CAN REFUSE|refuses a MISSING arm/.test(l));
    const othersQuiet = s.fo.fail === 0 && s.hs.fail === 0;
    return {
      observed: `${tally(s)} · the mock-agreement arms ${mockArmsFailed ? "FAILED" : "held"} · fanout+harness ${othersQuiet ? "untouched" : "ALSO FAILED"}`,
      asDeclared: s.aw.ran && s.fo.ran && s.hs.ran && s.aw.fail > 0 && mockArmsFailed && othersQuiet,
    };
  },
});

arm({
  id: "D3", subject: "THE WORLD AS IT SHIPPED — wrong arm AND a fixture that cannot refuse",
  what: "both halves of D-276 at once: MEANING_ARM back to \"legs\" and the fixture accepting anything. TWO defences down deliberately, which is why it is stated",
  mustFail: "agent-worker's REAL-plane arms; AND in fanout and harness EXACTLY ONE arm each — the STRUCTURAL one that reads the plane's registry without going through the mock",
  mustNot: "every BEHAVIOURAL arm in fanout and harness — the observation entries, the notes, the counts. A permissive fixture makes the behaviour unmeasurable, and that is the finding",
  patches: [{ file: HARNESS_SRC, find: ARM_FIND, replace: ARM_WRONG },
            { file: MEANING_MOCK, find: MOCK_FIND, replace: MOCK_PERMISSIVE }],
  /* THIS ARM WAS DECLARED WRONG THE FIRST TIME AND THE DECLARATION WAS
     CORRECTED INTO SOMETHING STRONGER RATHER THAN SMOOTHED — WORKER.md's rule,
     and the first result was the more interesting one. It was declared as
     "fanout and harness go GREEN", on the reasoning that both drive the member
     only through a mock that now accepts anything. They came back 174/1 and
     198/1. The single failure in each is the arm this item ADDED that does not
     go through the mock at all: `MEANING_ARMS.includes(...)`, read live out of
     `bio-plane/src/query.mjs`. So the honest statement is sharper than the one
     declared: with a fixture that says yes to everything, EVERY behavioural
     assertion in those two suites passes over a call that cannot succeed —
     exactly D-276's condition — and the only things that can still see it are
     the assertions that ask the PLANE rather than the fixture. The arm now
     declares the exact label permitted to fail, so "RED" alone will not satisfy
     it and a second blind spot cannot hide behind this one. */
  run: () => {
    const s = threeSuites();
    const realPlaneSaw = s.aw.failed.some((l) => /arm this member sends is one the plane|THE REAL PLANE ANSWERS/.test(l));
    const STRUCTURAL = /arm it asked at is one the PLANE's compiler holds|arm this member sends is one the PLANE's registry holds/;
    const foOnlyStructural = s.fo.fail === 1 && s.fo.failed.every((l) => STRUCTURAL.test(l));
    const hsOnlyStructural = s.hs.fail === 1 && s.hs.failed.every((l) => STRUCTURAL.test(l));
    return {
      observed: `${tally(s)} · the REAL-plane arms ${realPlaneSaw ? "SAW it" : "did NOT see it"} · fanout ${foOnlyStructural ? "failed ONLY its structural arm" : "failed something else too"} · harness ${hsOnlyStructural ? "failed ONLY its structural arm" : "failed something else too"} · every BEHAVIOURAL arm in both went GREEN over a call that cannot succeed — D-276 reproduced`,
      asDeclared: s.aw.ran && s.fo.ran && s.hs.ran && realPlaneSaw && foOnlyStructural && hsOnlyStructural,
    };
  },
});

arm({
  id: "D4", subject: "THE ANSWER CHECK'S NESTED HALF — \"check ok\" is not enough",
  what: "the arm is wrong AND `planeAnswer` stops looking inside `result`, so it checks only the ENVELOPE's ok — which the plane sets to TRUE on a refused arm (measured: HTTP 200, ok:true, the refusal nested)",
  mustFail: "agent-worker and harness — the refusal reaches the note-writing code unrecognised, so the entry stops saying rows were queried",
  mustNot: "the FALSE ZERO. The entry must say UNDETERMINED and must NOT say `0 meaning-grain row(s) queried`, because the note has a second defence and this arm is what proves it",
  patches: [{ file: HARNESS_SRC, find: ARM_FIND, replace: ARM_WRONG },
            { file: SRC, find: NESTED_FIND, replace: NESTED_GONE }],
  /* DECLARED WRONG THE FIRST TIME AND CORRECTED INTO SOMETHING STRONGER RATHER
     THAN SMOOTHED, and the correction is a real property of the fix rather than
     a wording change. It was declared as "the FALSE ZERO comes back" — on the
     reasoning that removing the nested check makes the member blind to the
     refusal exactly as it was before. It does; but the entry still does NOT say
     zero. `0 meaning-grain row(s) queried` needed BOTH the missing check AND the
     old arithmetic, `Array.isArray(got.rows) ? got.rows.length : 0`, which
     converted "no rows collection" into "zero rows". The rewrite has three
     branches instead of that ternary, so with the check gone the third branch
     fires and the entry reads *"how many meaning-grain row(s) the record holds
     for this query is UNDETERMINED"*. **Two independent defences, and this arm
     is what measured that the second one exists** — it now asserts the false
     zero is ABSENT, which is a stronger statement than the one it started with
     and fails if either defence is removed. */
  run: () => {
    const s = threeSuites();
    /* THE SENTENCE ITSELF is the measurement here, not the tally — both suites
       PRINT the observation entry for exactly this reason. */
    const falseZero = /0 meaning-grain row\(s\) queried/.test(s.hs.out + s.aw.out);
    const undetermined = /is UNDETERMINED — the plane answered without a rows collection/.test(s.hs.out);
    const noteArmFailed = s.hs.failed.some((l) => /COUNTS the rows the record answered with/.test(l));
    const silentHeld = !s.aw.failed.some((l) => /PLANE_SILENT|silent plane/.test(l));
    return {
      observed: `${tally(s)} · the false zero ${falseZero ? "IS BACK" : "did NOT come back — the note's second defence held"} · the entry says UNDETERMINED ${undetermined} · the note arm ${noteArmFailed ? "FAILED" : "held"} · plane-silent arms ${silentHeld ? "held" : "ALSO FAILED"}`,
      asDeclared: s.aw.ran && s.hs.ran && noteArmFailed && !falseZero && undetermined && silentHeld,
    };
  },
});

if (!only.length || only.includes("D5")) {
  armsRun++;
  console.log(`\n=== ARM D5 · OVER-STRICTNESS FOR D-276 — correct work in a spelling nobody anticipated`);
  console.log(`    WHAT IS CHANGED: MEANING_ARM spelled "LEG" — upper case. The plane NORMALISES`);
  console.log(`                     \`rows\` (\`String(input.rows).trim().toLowerCase()\`), so this is`);
  console.log(`                     CORRECT WORK, and an arm that failed it would be a fence`);
  console.log(`                     tighter than its rule.`);
  console.log(`    MUST PASS      : all three suites, unchanged counts.`);
  const o = takeOriginal(HARNESS_SRC);
  const p = patch(HARNESS_SRC, ARM_FIND, `export const MEANING_ARM = "LEG";`);
  let s = null;
  if (!p.armed) {
    console.log(`    >>> THE ARM DID NOT ARM: patch matched ${p.hits} time(s).`);
    findings.push(`D5: never armed (patch matched ${p.hits} times)`);
  } else {
    try { s = threeSuites(); } finally { console.log(`    ${restore(o)}`); }
    const ok = s.aw.ran && s.fo.ran && s.hs.ran && s.aw.fail === 0 && s.fo.fail === 0 && s.hs.fail === 0;
    console.log(`    OBSERVED       : ${tally(s)}`);
    if (ok) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
    else { console.log(`    VERDICT        : *** NOT AS DECLARED — an over-strictness failure is a defect in the FENCE ***`);
           findings.push(`D5: ${tally(s)}`); }
  }
  if (p.armed === false) restore(o);
}

/* ============================================================================
 * SECTION O — OVER-STRICTNESS. Correct work in a spelling nobody anticipated
 * must PASS. Nothing is edited: the arms already in the suite are the subject,
 * and this section exists to state that they were RUN on a clean tree and were
 * green, because an over-strictness claim nobody measured is a claim.
 * ========================================================================== */
if (!only.length || only.includes("O1")) {
  armsRun++;
  console.log(`\n=== ARM O1 · OVER-STRICTNESS (nothing is broken)`);
  console.log(`    MUST PASS      : a request exactly at the bound; \`turns\` omitted; namespaces with`);
  console.log(`                     hyphens, underscores and capitals; a run id carrying punctuation;`);
  console.log(`                     a DIFFERENT well-formed credential used alone. And --strict exit 0.`);
  const r = runSuite();
  const cov = runCoverageStrict();
  const ok = r.ran && r.fail === 0 && cov.code === 0;
  console.log(`    OBSERVED       : suite ${r.pass} pass, ${r.fail} FAIL · coverage --strict exit ${cov.code}`);
  if (ok) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else { console.log(`    VERDICT        : *** NOT AS DECLARED ***`); findings.push(`O1: suite ${r.fail} FAIL, coverage exit ${cov.code}`); }
}

console.log(`\n${"=".repeat(78)}`);
console.log(`arms run: ${armsRun} · as declared: ${armsAsDeclared} · findings about the arms: ${findings.length}`);
for (const f of findings) console.log(`  FINDING: ${f}`);
console.log(`Every arm was armed ALONE with the other defences held open; every restore was`);
console.log(`verified by sha256 AND by cmp against a copy taken before the edit.`);
process.exit(findings.length ? 1 : 0);
