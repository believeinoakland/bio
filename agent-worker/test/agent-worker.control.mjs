#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for FL-2 (the agent Worker) and VF-3 (coverage
 * gates the fleet). Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES while
 * it runs, and no runner may discover it — the package's `npm test` and
 * `node --test` take only `*.test.mjs` (PL-3/PL-4/PL-11's precedent).
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
/* R65 (T35): `NAMESPACES` and `MEANING_ARM` are declared in `src/ops.mjs` (since T33-57); the arms that patched them
   through the deleted re-export `src/harness.mjs`, and so armed nothing, now patch them where they live. */
const OPS_SRC = join(MEMBER, "src", "ops.mjs");
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
  /* V1–V4 are the controls of `scripts/coverage.mjs` itself (VF-3), which legacy-index retires (K636 BOB-4): once it is
     gone they have no subject, and they say so rather than read the missing tool as a finding. */
  if (/^V[1-4]$/.test(id) && !existsSync(COVERAGE)) {
    console.log(`\n=== ARM ${id} · ${subject}\n    RETIRED        : scripts/coverage.mjs is gone (K636 BOB-4); this arm had it as its subject`);
    return;
  }
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
  mustFail: "the BEHAVIOURAL arm (the plane record's sha256 moves) AND the pinned-op-set arm (an op outside PLANE_OPS reached the binding; measured at the interface since N421)",
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
  mustFail: "the 'exactly one distinct credential reached the plane' arm AND section 6's interface arm that every plane call carried the credential its run was handed (N421; it was a source scan for an `aik-` literal)",
  mustNot: "the behavioural write arm (nothing is written — that is the point of arming this separately)",
  file: SRC,
  find: `  const asked = await askPlane(env, "whoami", credential, store);`,
  replace: `  await askPlane(env, "whoami", "aik-" + "f".repeat(64), store);\n  const asked = await askPlane(env, "whoami", credential, store);`,
  run: () => {
    const r = runSuite();
    const oneCred = r.failed.some((l) => /exactly one distinct credential/.test(l));
    const compiledIn = r.failed.some((l) => /no credential is compiled in|carried exactly the credential that run was handed/.test(l));
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
  mustFail: "section 6's route arms (every request through the binding; no workers.dev address; the one other egress the model API — measured at the interface since N421), and the round trip itself",
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
    const urlArm = r.failed.some((l) => /only absolute URL|workers\.dev|bare global fetch|went through the binding|one other egress/.test(l));
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
   extrapolates to — AT the CPU ceiling, no margin. (D-312, M-168: this said "the
   memory curve says ~10x too long"; there is no memory wall below it.) */
arm({
  id: "A5", subject: "THE SEGMENT BOUND IS PINNED INSIDE ITS CPU MARGIN",
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

/* D-462's named control: "widen the shape again, and that arm fails by name". The member's namespace test goes
   back to the token shape it held before D-462 (`/^[a-z0-9_-]+$/i`), and nothing else moves — the NAMESPACES
   declaration is left intact, so the arm pinning it to the plane's set is the one that MUST HOLD: it proves the
   shape and the set are separately visible, and that the by-name arm is watching the GATE, not the constant. */
arm({
  id: "N1", subject: "D-462 — THE NAMESPACE SHAPE WIDENED AGAIN",
  what: "the member's namespace test goes back to `/^[a-z0-9_-]+$/i`, so `biosmoke`, `biosmoke-fleet`, `Scratch` and `BIO` pass it",
  mustFail: "the `store=biosmoke -> 400 NAMESPACE_UNKNOWN` arm BY NAME, the hyphenated and both case-variant arms, and the record-still-empty arm (the widened member WORKS a run through the plane under a name no instance holds)",
  mustNot: "the exported-set pin (the constant is untouched), the BAD_STORE arms (absent / non-string), the empty-name and `a b` arms (the old shape refused both too), and section 7's over-strictness arms",
  file: SRC,
  find: `  if (!NAMESPACES.includes(store))`,
  replace: `  if (!/^[a-z0-9_-]+$/i.test(store))`,
  run: () => {
    const r = runSuite();
    const f = (re) => r.failed.some((l) => re.test(l));
    const byName = f(/^store=biosmoke -> 400 NAMESPACE_UNKNOWN/);
    const variants = f(/biosmoke-fleet\) -> 400/) && f(/\(Scratch\) -> 400/) && f(/\(BIO\) -> 400/);
    const wrote = f(/record is still empty after every refusal/);
    const held = !f(/exported namespace set is exactly/) && !f(/-> 400 BAD_STORE/)
      && !f(/named empty -> 400/) && !f(/not a token -> 400/) && !f(/-> accepted$/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · by-name arm ${byName ? "FAILED" : "held"} · variants ${variants ? "FAILED" : "held"} · record-empty ${wrote ? "FAILED" : "held"} · pin/BAD_STORE/old-shape/over-strictness ${held ? "held" : "ALSO FAILED"}`,
      asDeclared: r.ran && byName && variants && wrote && held,
    };
  },
});

/* The copy ages: this member's NAMESPACES is a copy of the plane's, EXPORTED from `ops.mjs` (N402) and pinned
   exactly in the suite; control-plane pins the export to its own gate (layer 11), which notices the day they part. */
arm({
  id: "N2", subject: "D-462 — THE MEMBER'S NAMESPACE SET PARTS FROM THE PLANE'S",
  what: "the member's exported NAMESPACES gains `biosmoke`, a name the plane's `namespaceGate` does not hold",
  mustFail: "the exported-set pin, the `store=biosmoke` refusal arms and the refusal-lists-the-export arm (the member now accepts it, so no refusal lists anything), and the record-still-empty arm (it worked a run under that name)",
  mustNot: "the BAD_STORE arms, the Scratch/BIO/hyphenated arms, and section 7's over-strictness arms",
  file: OPS_SRC,
  find: `export const NAMESPACES = Object.freeze(["bio", "scratch"]);`,
  replace: `export const NAMESPACES = Object.freeze(["bio", "scratch", "biosmoke"]);`,
  run: () => {
    const r = runSuite();
    const f = (re) => r.failed.some((l) => re.test(l));
    const pin = f(/exported namespace set is exactly/) && f(/^store=biosmoke -> 400 NAMESPACE_UNKNOWN/)
      && f(/refusal lists exactly the exported set/);
    const held = !f(/-> 400 BAD_STORE/) && !f(/\(Scratch\) -> 400/)
      && !f(/\(BIO\) -> 400/) && !f(/biosmoke-fleet\) -> 400/) && !f(/-> accepted$/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · pin ${pin ? "FAILED" : "held"} · BAD_STORE/variants/over-strictness ${held ? "held" : "ALSO FAILED"}`,
      asDeclared: r.ran && pin && held,
    };
  },
});

/* RE-ANCHORED 2026-09-29 BY AGENT-WORKER #4 (T12, N304), AGAINST THE PLANE'S TEXT AS IT STANDS. Three of this
   section's arms had been NOT AS DECLARED since before T11, each for a cause in `coverage.mjs` rather than in the
   member: (1) V1 asserted the plane's OPS and CHECKS lines read `(100.0%)`, and they have not since op reach and
   check naming became REPORTED figures (K153; the clean tree prints 87.7% and 91.0%); (2) V2 asserted `--strict`
   exits non-zero on the FLEET FLOOR, which N88 (K100 (1)) made reported and no longer gating; (3) V4 asserted no
   other fleet gate prints, and the clean tree already prints a FLEET FLOOR line of its own (the arm floor). So each
   arm is now measured against what `--strict` PRINTS ON THE CLEAN TREE, taken once before the first V arm: the
   plane's figures must be the clean run's, and a gate "fired" only when its line is not the clean run's line. */
const wantsCoverage = existsSync(COVERAGE) && (!only.length || only.some((a) => /^V[1-4]$/.test(a)));
const COVERAGE_CLEAN = wantsCoverage ? runCoverageStrict() : null;
const planeFigures = (out) => (out.match(/^(OPS|CHECKS) {2}.*$/gm) || []).join("\n");
const fleetGates = (out) => out.match(/^FLEET(?: FLOOR| SURFACE| RULE 2)?: .*$/gm) || [];
const newGates = (out) => {
  const clean = new Set(fleetGates(COVERAGE_CLEAN.out));
  return fleetGates(out).filter((g) => !clean.has(g));
};
const planeFiguresHeld = (out) => planeFigures(COVERAGE_CLEAN.out) !== "" && planeFigures(out) === planeFigures(COVERAGE_CLEAN.out);

arm({
  id: "V1", subject: "VF-3'S NAMED CONTROL — HIDE THE FLEET MANIFEST",
  what: "agent-worker/fleet-member.json is renamed away, so the discovery walk cannot see the member",
  mustFail: "`coverage.mjs --strict` must EXIT NON-ZERO, naming the undeclared Worker directory — it must NOT report the pre-FL-2 figure",
  mustNot: "the plane's own OPS and CHECKS figures, which have nothing to do with the fleet: they must read exactly as the clean tree's run prints them",
  swapManifest: true,
  run: () => {
    const r = runCoverageStrict();
    const named = /UNACCOUNTED|agent-worker carr|wrangler\.jsonc and no fleet-member\.json/.test(r.out);
    const floorAlsoFired = newGates(r.out).some((g) => /^FLEET FLOOR/.test(g));
    const planeHeld = planeFiguresHeld(r.out);
    return {
      observed: `exit ${r.code} · undeclared-Worker gate ${named ? "FIRED and NAMED the directory" : "did NOT fire"} · fleet floor ${floorAlsoFired ? "also fired" : "did not fire"} · plane figures ${planeHeld ? "held at the clean run's" : "MOVED (unexpected)"}`,
      asDeclared: r.code !== 0 && named && planeHeld,
    };
  },
});

arm({
  id: "V2", subject: "THE FLOOR — a whole member DIRECTORY vanishing",
  what: "FLEET_FLOOR.members is raised one above the discovered count (3 -> 4 as of CPDF-10's third member), standing in for a member directory that is gone entirely (the case the undeclared-Worker gate structurally cannot see)",
  /* N88 (K100 (1)): FLEET FLOOR is REPORTED and no longer gates `--strict`, so the arm's teeth are the report
     naming the lost member, and `--strict`'s exit must be the clean run's — a floor that gated again, or a report
     that went quiet, is each a change this arm names. */
  mustFail: "`--strict` must REPORT the FLEET FLOOR naming the member count below its floor — a count with no floor is not a ratchet — and exit as the clean tree does (reported, not gated: N88)",
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
  /* RE-ANCHORED AGAIN 2026-09-13 BY M0-25's ARM-LIVENESS CENSUS, AND THE FINDING
     IS WORSE THAN THE ONE ABOVE RATHER THAN A REPEAT OF IT: **D-276's OWN
     RE-ANCHORING NEVER ARMED EITHER.** The block above records the arm being
     re-anchored on `  members:     2,` — five spaces, aligned with the block's
     other keys. `git log -S` over this file's whole history answers NOTHING for
     the padded spelling (`members:     `, zero commits), and the line it replaced
     was `  members: 2,` with ONE space. So the 2026-08-09 re-anchor was written
     from a DESCRIPTION of the line rather than from the line, and the arm has
     reported `THE ARM DID NOT ARM` on every run since the moment it was supposedly
     repaired. **A re-anchoring that is not verified against the file is not a
     repair; it is the same defect with a fresh date on it** — and that is the one
     failure mode the pattern this estate uses could not see, because the repair
     and the proof lived in the same hand.
     The value has ALSO moved since: `7ab8d4c` (CPDF-10) raised `members` from 2
     to 3 when `ocr-worker` became the third fleet member, so even the un-padded
     anchor would now be stale. Two independent causes, both named.
     Anchored on the line as the file actually holds it, counted before it was
     written (`  members: 3,` occurs exactly once), and the arm's assertion moved
     with it: the floor gate now reads 3 discovered against a floor of 4. */
  find: `  members: 3,`,
  replace: `  members: 4,`,
  run: () => {
    const r = runCoverageStrict();
    const floor = newGates(r.out).some((g) => /^FLEET FLOOR: 3 fleet member\(s\) discovered, floor is 4/.test(g));
    const unaccountedQuiet = !/UNACCOUNTED/.test(r.out);
    const exitAsClean = r.code === COVERAGE_CLEAN.code;
    return {
      observed: `exit ${r.code} (clean ${COVERAGE_CLEAN.code}) · floor report ${floor ? "FIRED and named the members" : "did NOT fire"} · undeclared-Worker gate ${unaccountedQuiet ? "silent (as declared)" : "also fired"}`,
      asDeclared: exitAsClean && floor && unaccountedQuiet,
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
    const floorAlso = newGates(r.out).some((g) => /^FLEET FLOOR/.test(g));
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
  mustNot: "the floor, the undeclared-Worker gate, or the surfaceless gate: none may print a line the clean tree's run does not",
  file: SRC,
  find: `  run:     { method: "POST", mutating: false },`,
  replace: `  run:     { method: "POST", mutating: true },`,
  run: () => {
    const r = runCoverageStrict();
    const rule2 = /FLEET RULE 2: agent-worker\.run/.test(r.out);
    const othersQuiet = !/UNACCOUNTED/.test(r.out) && !newGates(r.out).some((g) => /^FLEET(?: FLOOR| SURFACE)?: /.test(g));
    return {
      observed: `exit ${r.code} · rule-2 gate ${rule2 ? "FIRED" : "did NOT fire"} · other fleet gates ${othersQuiet ? "silent (as declared)" : "also fired"}`,
      asDeclared: r.code !== 0 && rule2 && othersQuiet,
    };
  },
});

/* RE-POINTED BY AGENT-WORKER #8 (T21, N467). V5 spawned `bio-plane/scripts/battery.mjs agent-worker`, which T20
   deleted (LEGACY-TESTS #18). What runs this member's suites now is its own `npm test` (`node --test` over every
   `test/*.test.mjs`, the regression workflow's step for this package), so the property is re-pointed to it: a failed
   assertion in this suite makes `npm test` exit non-zero and name this file, and disturbs no other suite. "No other
   suite" is measured against a clean `npm test` taken first, since a suite may already be red for a reason of its own
   (a stale bundle, which `requirements.test.mjs` R45 reports until the bundle is regenerated). */
const runPackage = () => {
  const r = spawnSync("npm", ["test"], { cwd: MEMBER, encoding: "utf8", env: { ...process.env } });
  const out = (r.stdout || "") + (r.stderr || "");
  const failedFiles = [...new Set([...out.matchAll(/^✖ (test\/[\w.-]+\.test\.mjs) \(/gm)].map((m) => m[1]))].sort();
  const tally = out.match(/^ℹ fail (\d+)$/m);
  return { status: r.status, failedFiles, ran: !!tally, out };
};
const PACKAGE_CLEAN = (!only.length || only.includes("V5")) ? runPackage() : null;

arm({
  id: "V5", subject: "THE PACKAGE'S OWN RUNNER ACTUALLY RUNS THE MEMBER'S SUITE",
  what: "the member's suite is made to fail one assertion, to prove `npm test` carries a failure rather than merely listing the file",
  mustFail: "`npm test` in agent-worker/ must exit NON-ZERO and name test/agent-worker.test.mjs as a failing file",
  mustNot: "any other suite — the failing files must be the clean run's plus this one, and nothing else",
  file: join(HERE, "agent-worker.test.mjs"),
  find: `  t("the default bound is 120", bound, 120);`,
  replace: `  t("the default bound is 120", bound, 999);`,
  run: () => {
    const r = runPackage();
    const named = r.failedFiles.includes("test/agent-worker.test.mjs");
    const clean = PACKAGE_CLEAN.failedFiles.filter((f) => f !== "test/agent-worker.test.mjs");
    const othersQuiet = JSON.stringify(r.failedFiles.filter((f) => f !== "test/agent-worker.test.mjs")) === JSON.stringify(clean);
    return {
      observed: `exit ${r.status} (clean ${PACKAGE_CLEAN.status}, failing then: ${PACKAGE_CLEAN.failedFiles.join(", ") || "none"}) · `
        + `the member's suite ${named ? "is NAMED as failing" : "was NOT named"} · other suites ${othersQuiet ? "as on the clean run" : "ALSO moved"}`,
      asDeclared: r.ran && PACKAGE_CLEAN.ran && r.status !== 0 && named && othersQuiet
        && !PACKAGE_CLEAN.failedFiles.includes("test/agent-worker.test.mjs"),
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
  patches: [{ file: OPS_SRC, find: ARM_FIND, replace: ARM_WRONG }],
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
  patches: [{ file: OPS_SRC, find: ARM_FIND, replace: ARM_WRONG },
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
  patches: [{ file: OPS_SRC, find: ARM_FIND, replace: ARM_WRONG },
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
  const o = takeOriginal(OPS_SRC);
  const p = patch(OPS_SRC, ARM_FIND, `export const MEANING_ARM = "LEG";`);
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
  /* D-462: "namespaces with hyphens, underscores and capitals" were never correct work — no instance holds them —
     and the suite's rows asserting they were accepted are corrected in place; the correct spellings are the two. */
  console.log(`    MUST PASS      : a request exactly at the bound; \`turns\` omitted; each namespace named`);
  console.log(`                     explicitly (\`bio\`, \`scratch\`); a run id carrying punctuation;`);
  console.log(`                     a DIFFERENT well-formed credential used alone. And --strict exit 0.`);
  /* `scripts/coverage.mjs` is retired (legacy-index, K636 BOB-4): the suite alone is this arm's subject. */
  const r = runSuite();
  const ok = r.ran && r.fail === 0;
  console.log(`    OBSERVED       : suite ${r.pass} pass, ${r.fail} FAIL`);
  if (ok) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else { console.log(`    VERDICT        : *** NOT AS DECLARED ***`); findings.push(`O1: suite ${r.fail} FAIL`); }
}

console.log(`\n${"=".repeat(78)}`);
console.log(`arms run: ${armsRun} · as declared: ${armsAsDeclared} · findings about the arms: ${findings.length}`);
for (const f of findings) console.log(`  FINDING: ${f}`);
console.log(`Every arm was armed ALONE with the other defences held open; every restore was`);
console.log(`verified by sha256 AND by cmp against a copy taken before the edit.`);
process.exit(findings.length ? 1 : 0);
