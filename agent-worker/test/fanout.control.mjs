#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for FL-5 (sub-session fan-out with REPORT
 * contracts, IS-9(a)). Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCES
 * while it runs, and neither `scripts/battery.mjs` nor the fleet walk must
 * discover it (FL-2/FL-3/PL-3/PL-4's precedent).
 *
 *   node agent-worker/test/fanout.control.mjs            all arms
 *   node agent-worker/test/fanout.control.mjs F1 F4b     named arms only
 *
 * THE RULES THIS HARNESS ENFORCES ON ITSELF are FL-2's and FL-3's, unchanged,
 * and every one was paid for by a defect this project has already met: it lives
 * INSIDE this worktree; every arm is armed ALONE with the other defences held
 * OPEN; every arm declares what MUST fail AND what MUST NOT before it runs; an
 * arm that does not arm is a FINDING, not a pass; a suite that DIED reports
 * `fail: -1`, never 0; every restore is verified by sha256 AND by `cmp` against a
 * uniquely-named per-arm copy; and an arm that comes back green when red was
 * predicted is recorded as a finding about the ARM.
 *
 * ===========================================================================
 * RESULTS — 2026-08-09, worktree agent-a0b07bfdf348ecea8. Baseline before every
 * arm: `fanout.test.mjs` **172 pass / 0 fail**, `harness.test.mjs` **194 pass /
 * 0 fail**, `agent-worker.test.mjs` **98 pass / 0 fail**, `coverage.mjs
 * --strict` exit 0. Every figure below is MEASURED.
 *
 *   F1  `checkReport` returns null for everything (the item's DECLARED control,
 *       IS-9(a)) -> **117 pass, 55 FAIL**: every document-returning arm fails,
 *       pure and through the op; the spawn-fence arms HELD.
 *   F2  the exact key set alone is let through -> **143 pass, 29 FAIL**: the
 *       fourteen document spellings fail together; the citation and prose-bound
 *       arms held, which is what shows they are separate defences.
 *   F3  the summary ceiling removed -> **170 pass, 2 FAIL**: the summary bound
 *       arms fail. **AND THE ARM RECORDED SOMETHING THE DECLARATION DID NOT
 *       PREDICT: the 50,000-character summary was still REFUSED**, by the
 *       whole-report belt computed from the contract's own parts — so the
 *       document-in-a-summary case has two independent defences and only the
 *       501-character case has one. Recorded rather than smoothed.
 *   F4  a `bias` field added to the spawn contract literal -> **165 pass, 7
 *       FAIL**: the exact-key-set and key-tree arms fail, pure AND on the wire.
 *       The behavioural `statements_sha` arm HELD, as declared — a FIELD
 *       existing and the LENS ARRIVING are different defects and the suite can
 *       tell them apart.
 *   F4b BOTH HALVES DOWN (the field added, the refusal removed, and the driver
 *       made to fetch the COMPOSING half) -> **151 pass, 21 FAIL** including the
 *       value-level arm: the manifest's own bytes reached a sub-session's
 *       contract. **This is the arm that proves the strongest assertion in the
 *       suite CAN fail** — without it, "the lens appears in zero contracts"
 *       would be believed on the strength of its existence.
 *   F5  the second witness removed (a leaked payload is ignored, not refused)
 *       -> **162 pass, 10 FAIL**: the refusal arms fail while the
 *       by-construction arm HOLDS — defence in depth, measured rather than
 *       claimed.
 *   F6  a mutating op added to SUBSESSION_OPS -> **167 pass, 5 FAIL**: the
 *       no-write-scope arms fail against the PLANE's own OPS table.
 *   F7  a refused return is let into the working set -> **164 pass, 8 FAIL**:
 *       the undetermined-is-not-an-absence arms fail — a contract violation
 *       manufacturing §9's empty-level claim is exactly the harm.
 *   F8  every level handed the same contract object -> **167 pass, 5 FAIL**:
 *       the per-level and no-shared-identity arms fail; the return contract
 *       held.
 *   F9  OVER-STRICTNESS, nothing broken -> fanout **172/0**, harness **194/0**,
 *       member **98/0**, `coverage.mjs --strict` exit 0.
 * ===========================================================================
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");
const REPO = join(MEMBER, "..");
const PLANE = join(REPO, "bio-plane");

const SUB = join(MEMBER, "src", "subsession.mjs");
const DRIVER = join(MEMBER, "src", "index.mjs");

const WORK = mkdtempSync(join(tmpdir(), "fl5-control-"));
process.on("exit", () => { try { rmSync(WORK, { recursive: true, force: true }); } catch { /* */ } });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));

let armsRun = 0, armsAsDeclared = 0;
const findings = [];

/* ------------------------------------------------------------- the runners */

/* A suite that DIED mid-run prints no tail line, and reading that as "0
   failures" is how a control once recorded a killed suite as "stayed GREEN". */
function runNamed(file, label) {
  const r = spawnSync(process.execPath, [join(HERE, file)], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`${label}:\\s*(\\d+) passed,\\s*(\\d+) failed`));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}
const runFanout  = () => runNamed("fanout.test.mjs", "fanout");
const runHarness = () => runNamed("harness.test.mjs", "harness");
const runMember  = () => runNamed("agent-worker.test.mjs", "agent-worker");

function runCoverageStrict() {
  const r = spawnSync(process.execPath, [join(PLANE, "scripts", "coverage.mjs"), "--strict"],
    { cwd: PLANE, encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

/* --------------------------------------------------------- arm / restore ---- */

/* The copy's name carries a COUNTER, and it is FL-3's correction rather than a
   precaution: an arm taking a second snapshot of one file overwrote its own
   pristine copy, and `cmp` caught what the sha256 could not. */
let snapshots = 0;
function takeOriginal(file) {
  const bytes = readFileSync(file);
  const copy = join(WORK, `${++snapshots}-${file.replace(/[^\w]/g, "_")}.orig`);
  writeFileSync(copy, bytes);
  /* GUARD THE BYTE COUNT. A restore verified against an EMPTY pristine copy is
     byte-identical for free — two harnesses have reported exactly that, caught
     only because a digest read `e3b0c442…`, the sha256 of the empty string. */
  if (bytes.length < 500) {
    console.error(`\n  !!! PRISTINE COPY OF ${file} IS ${bytes.length} BYTES. Refusing to arm.`);
    process.exit(2);
  }
  return { file, bytes, copy, sha: sha(bytes) };
}

function restore(orig) {
  writeFileSync(orig.file, orig.bytes);
  const hashOk = sha(readFileSync(orig.file)) === orig.sha;
  const contentOk = spawnSync("cmp", ["-s", orig.file, orig.copy]).status === 0;
  if (!hashOk || !contentOk) {
    console.error(`\n  !!! RESTORE FAILED for ${orig.file} — sha256 ${hashOk ? "ok" : "MISMATCH"}, `
      + `cmp ${contentOk ? "ok" : "MISMATCH"}. STOPPING: the tree is not as it was found.`);
    process.exit(2);
  }
  return `restore verified (sha256 + cmp, ${orig.bytes.length} bytes)`;
}

function patch(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, hits: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, hits: 1 };
}

function arm({ id, subject, what, mustFail, mustNot, file, find, replace, run }) {
  if (only.length && !only.includes(id)) return;
  armsRun++;
  console.log(`\n=== ARM ${id} · ${subject}`);
  console.log(`    WHAT IS BROKEN : ${what}`);
  console.log(`    MUST FAIL      : ${mustFail}`);
  console.log(`    MUST NOT FAIL  : ${mustNot}`);

  const orig = file ? takeOriginal(file) : null;
  if (file) {
    const p = patch(file, find, replace);
    if (!p.armed) {
      console.log(`    >>> THE ARM DID NOT ARM: the patch matched ${p.hits} time(s), not once.`);
      console.log(`        THIS IS A FINDING ABOUT THE ARM, not a green result. Nothing was measured.`);
      findings.push(`${id}: never armed (patch matched ${p.hits} times)`);
      restore(orig);
      return;
    }
  }

  let result;
  try { result = run(); }
  finally { if (orig) console.log(`    ${restore(orig)}`); }

  console.log(`    OBSERVED       : ${result.observed}`);
  if (result.asDeclared) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else {
    console.log(`    VERDICT        : *** NOT AS DECLARED — recorded as a finding about the arm ***`);
    findings.push(`${id}: ${result.observed}`);
  }
}

const anyFailed = (r, re) => r.failed.some((l) => re.test(l));

/* THE FAMILIES, named once so every arm's MUST/MUST-NOT is stated against the
   same partition rather than against ad-hoc regexes that drift apart. */
const DOC_ARMS   = /is REFUSED and the field is NAMED|key set rather than a list|was REFUSED and its level is named|with the code and the offending field|three REPORT\(s\) were taken|three REPORTS were taken/;
const BOUND_ARMS = /one character over is REFUSED|whole document in the summary|names the bound it broke|content wearing an address's field|reading arriving as a list of addresses/;
const CITE_ARMS  = /citation carrying the document|carrying the extracted text|carrying an extent|bare string is not a citation|empty address is not one either|with no citation is REFUSED/;
const LENS_BUILD = /complete key tree is pinned|there is no field to read|no key in any contract is `bias`|built by spreading/;
const LENS_VALUE = /manifest's own bytes appear in ZERO|nowhere in the whole answer|no request it sent carried the manifest/;
const LENS_WITNESS = /refused$|by name|no contract came back|cites §14's rule|whole fan-out refuses|null field is still a field|SPAWN_PAYLOAD_CARRIES_LENS|stopped at the FIRST level/;
const SCOPE_ARMS = /declares every one of them non-mutating|scope is pinned, floor and ceiling|publishes that scope and nothing wider|mutating op this member holds|every mutating op is one no sub-session may name/;
const ABSENCE_ARMS = /NOT in the working set|produces NO empty-level claim|NOT for the refused level|broken contract cannot manufacture/;
const SHARE_ARMS = /one contract per level|four distinct objects|no two share/;

/* ============================================================================
 * SECTION F — FL-5. THE TWO CONTRACTS.
 * ========================================================================== */

arm({
  id: "F1", subject: "THE ITEM'S DECLARED CONTROL (IS-9(a)) — THE RETURN CONTRACT",
  what: "`checkReport` returns null for everything: a document-returning sub-session is accepted",
  mustFail: "every document-returning arm, pure AND through the op — §14b.1's rule is that such a sub-session has DEFEATED THE ARCHITECTURE, so a suite that stays green here is testing something else",
  mustNot: "the spawn-side arms: the exact key set, the second witness, the read-only scope. They share no state with the return path and this is what shows the two contracts are two mechanisms",
  file: SUB,
  find: `export function checkReport(report) {
  if (report == null`,
  replace: `export function checkReport(report) {
  if (true) return null;
  if (report == null`,
  run: () => {
    const r = runFanout();
    const docs = anyFailed(r, DOC_ARMS);
    const lensHeld = !anyFailed(r, LENS_BUILD) && !anyFailed(r, LENS_VALUE);
    const scopeHeld = !anyFailed(r, SCOPE_ARMS);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · document-returning arms ${docs ? "FAILED" : "did NOT fail"} · lens arms ${lensHeld ? "held" : "also failed"} · scope ${scopeHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && docs && lensHeld && scopeHeld,
    };
  },
});

arm({
  id: "F2", subject: "THE EXACT KEY SET IS THE RULE, NOT A DENYLIST",
  what: "an unrecognised key is let through, so a return may carry any field it likes",
  mustFail: "all fourteen document spellings together — including the four no denylist would have named",
  mustNot: "the citation arms or the prose-bound arms, which are separate defences over the same return",
  file: SUB,
  find: `  const unknown = Object.keys(report).filter((k) => !(k in REPORT_KEYS));
  if (unknown.length)`,
  replace: `  const unknown = Object.keys(report).filter((k) => !(k in REPORT_KEYS));
  if (false && unknown.length)`,
  run: () => {
    const r = runFanout();
    const docs = anyFailed(r, DOC_ARMS);
    const citeHeld = !anyFailed(r, CITE_ARMS);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · key-set arms ${docs ? "FAILED" : "did NOT fail"} · citation arms ${citeHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && docs && citeHeld,
    };
  },
});

arm({
  id: "F3", subject: "THE PROSE BOUND — a document fits inside a field called `summary`",
  what: "the summary ceiling is removed, so the one free-text field has no limit",
  mustFail: "the summary-bound arms: a key set alone does not close 'never documents'",
  mustNot: "the key-set arms or the citation arms",
  file: SUB,
  find: `  if (typeof report.summary === "string" && report.summary.length > SUMMARY_MAX)`,
  replace: `  if (false && typeof report.summary === "string" && report.summary.length > SUMMARY_MAX)`,
  run: () => {
    const r = runFanout();
    const bounds = anyFailed(r, /one character over is REFUSED|names the bound it broke/);
    const keysHeld = !anyFailed(r, /is REFUSED and the field is NAMED/);
    /* DECLARED AND OBSERVED SEPARATELY, because the 50,000-character case has a
       SECOND defence: the whole-report belt computed from the contract's parts.
       An arm that lumped them together would have reported "as declared" while
       hiding that one of the two cases is doubly defended and the other is not. */
    const beltCaught = !anyFailed(r, /whole document in the summary/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · summary-bound arms ${bounds ? "FAILED" : "did NOT fail"} · key-set arms ${keysHeld ? "held" : "also failed"} · the 50,000-char case was ${beltCaught ? "STILL refused by the computed whole-report belt (defence in depth, recorded)" : "let through"}`,
      asDeclared: r.ran && bounds && keysHeld,
    };
  },
});

arm({
  id: "F4", subject: "NO MANIFEST FIELD BY CONSTRUCTION",
  what: "the spawn contract's literal gains a `bias` field — a field for the lens to arrive in",
  mustFail: "the exact-key-set and key-tree arms, pure AND on the wire. 'By construction' means there is no FIELD to read, not that a field is ignored",
  mustNot: "the value-level `statements_sha` arm — a FIELD EXISTING and the LENS ARRIVING are different defects, and a suite that cannot tell them apart has one arm where it thinks it has two",
  file: SUB,
  find: `    level: String(level),
    run: payload.run ?? null,`,
  replace: `    bias: payload.bias ?? null,
    level: String(level),
    run: payload.run ?? null,`,
  run: () => {
    const r = runFanout();
    const build = anyFailed(r, LENS_BUILD);
    const valueHeld = !anyFailed(r, LENS_VALUE);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · by-construction arms ${build ? "FAILED" : "did NOT fail"} · value-level sha arm ${valueHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: r.ran && build && valueHeld,
    };
  },
});

arm({
  id: "F4b", subject: "BOTH HALVES DOWN — and this is the arm that proves the strongest assertion CAN fail",
  what: "the contract gains a `bias` field, the second witness is removed, AND the driver fetches the COMPOSING half: the lens genuinely reaches a sub-session",
  mustFail: "the VALUE-LEVEL arms — the manifest's own `statements_sha` in what a sub-session was handed. Without this arm, 'the lens appears in zero contracts' is a mechanism believed on the strength of its existence",
  mustNot: "nothing is claimed to hold: this is ONE defence taken down in the three places it lives, and the point is the harm arriving rather than an isolation result",
  file: SUB,
  find: `    level: String(level),
    run: payload.run ?? null,`,
  replace: `    bias: payload.bias ?? null,
    level: String(level),
    run: payload.run ?? null,`,
  run: () => {
    const o2 = takeOriginal(SUB);
    const p2 = patch(SUB, `  if (Object.prototype.hasOwnProperty.call(payload, "bias"))`,
                          `  if (false && Object.prototype.hasOwnProperty.call(payload, "bias"))`);
    const o3 = takeOriginal(DRIVER);
    const p3 = patch(DRIVER,
      `        const p = await call("airunspawn", { run: runId, half: "search" });
        if (!p.reached) return { silent: p };
        const payload = (p.body?.result ?? p.body ?? {}).payload ?? null;`,
      `        const p = await call("airunspawn", { run: runId, half: "compose" });
        if (!p.reached) return { silent: p };
        const _leaked = (p.body?.result ?? p.body ?? {});
        const payload = _leaked.payload ? { ..._leaked.payload, bias: _leaked.bias } : null;`);
    const r = (p2.armed && p3.armed) ? runFanout() : { ran: false, pass: 0, fail: -1, failed: [], out: "" };
    restore(o3);
    restore(o2);
    if (!p2.armed || !p3.armed)
      return { observed: `THE ARM DID NOT FULLY ARM (refusal patch ${p2.hits} hit(s), driver patch ${p3.hits} hit(s)) — a finding about the arm, not a result`,
               asDeclared: false };
    const value = anyFailed(r, LENS_VALUE);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · value-level sha arms ${value ? "FAILED — the lens reached a sub-session and the suite saw it" : "did NOT fail, which would mean the arm cannot detect the harm"}`,
      asDeclared: r.ran && value,
    };
  },
});

arm({
  id: "F5", subject: "THE SECOND WITNESS — a search payload carrying the lens is REFUSED, not ignored",
  what: "`spawnContract` no longer refuses a payload that arrives with the manifest; it simply does not read it",
  mustFail: "the refusal arms, pure AND through the op (a leaked payload must stop the run at the FIRST level)",
  mustNot: "the by-construction arms — the contract still has no field, so the lens still does not reach a sub-session. That is defence in depth MEASURED rather than claimed",
  file: SUB,
  find: `  if (Object.prototype.hasOwnProperty.call(payload, "bias"))`,
  replace: `  if (false && Object.prototype.hasOwnProperty.call(payload, "bias"))`,
  run: () => {
    const r = runFanout();
    const witness = anyFailed(r, LENS_WITNESS);
    const buildHeld = !anyFailed(r, LENS_BUILD) && !anyFailed(r, LENS_VALUE);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · second-witness arms ${witness ? "FAILED" : "did NOT fail"} · by-construction arms ${buildHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: r.ran && witness && buildHeld,
    };
  },
});

arm({
  id: "F6", subject: "NO WRITE SCOPE — the parent holds the only write",
  what: "a MUTATING op is added to the sub-session's declared scope",
  mustFail: "the read-only-scope arms, which are computed against the PLANE's own OPS table rather than against a comment",
  mustNot: "the manifest arms or the return contract",
  file: SUB,
  find: `export const SUBSESSION_OPS = ["meaningrows"];`,
  replace: `export const SUBSESSION_OPS = ["meaningrows", "suggest"];`,
  run: () => {
    const r = runFanout();
    const scope = anyFailed(r, SCOPE_ARMS);
    const lensHeld = !anyFailed(r, LENS_BUILD) && !anyFailed(r, LENS_VALUE);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · scope arms ${scope ? "FAILED" : "did NOT fail"} · lens arms ${lensHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && scope && lensHeld,
    };
  },
});

arm({
  id: "F7", subject: "A REFUSED RETURN MUST NOT BECOME AN ABSENCE",
  what: "a return that broke the contract is refused AND still let into the working set",
  mustFail: "the undetermined-is-not-an-absence arms — a contract violation would otherwise MANUFACTURE §9's empty-level claim off a report the parent never accepted",
  mustNot: "the key-set arms: `checkReport` still refuses. This arm is about what the parent DOES with a refusal, which is a different mechanism",
  file: SUB,
  find: `    else taken.push(r);`,
  replace: `    taken.push(r);`,
  run: () => {
    const r = runFanout();
    const absence = anyFailed(r, ABSENCE_ARMS);
    const keysHeld = !anyFailed(r, /is REFUSED and the field is NAMED/);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · absence arms ${absence ? "FAILED" : "did NOT fail"} · key-set arms ${keysHeld ? "held (as declared)" : "also failed"}`,
      asDeclared: r.ran && absence && keysHeld,
    };
  },
});

arm({
  id: "F8", subject: "SUB-SESSIONS SHARE NO STATE",
  what: "every level is handed the SAME contract object — one brief, four sub-sessions, shared identity",
  mustFail: "the per-level arms and the no-shared-identity arms",
  mustNot: "the return contract, which never touches the spawn side",
  file: SUB,
  find: `    contracts.push(made.contract);`,
  replace: `    contracts.push(contracts[0] || made.contract);`,
  run: () => {
    const r = runFanout();
    const shared = anyFailed(r, SHARE_ARMS);
    const returnHeld = !anyFailed(r, DOC_ARMS);
    return {
      observed: `${r.pass} pass, ${r.fail} FAIL · shared-state arms ${shared ? "FAILED" : "did NOT fail"} · return contract ${returnHeld ? "held" : "also failed"}`,
      asDeclared: r.ran && shared && returnHeld,
    };
  },
});

/* ============================================================================
 * SECTION O — OVER-STRICTNESS. Correct work in a spelling nobody anticipated
 * must PASS, and the claim is measured on a clean tree rather than asserted.
 * ========================================================================== */
if (!only.length || only.includes("F9")) {
  armsRun++;
  console.log(`\n=== ARM F9 · OVER-STRICTNESS (nothing is broken)`);
  console.log(`    MUST PASS      : a fan-out with no returns at all; one level reporting and three`);
  console.log(`                     silent; every level NEVER_LOOKED; four citing one address; a`);
  console.log(`                     report with every optional field; a level reported twice; a thin`);
  console.log(`                     payload; a payload carrying plane-side fields nobody named here.`);
  console.log(`                     All three member suites green and coverage --strict exit 0.`);
  const rf = runFanout();
  const rh = runHarness();
  const rm = runMember();
  const cov = runCoverageStrict();
  const ok = rf.ran && rf.fail === 0 && rh.ran && rh.fail === 0 && rm.ran && rm.fail === 0 && cov.code === 0;
  console.log(`    OBSERVED       : fanout ${rf.pass}/${rf.fail} · harness ${rh.pass}/${rh.fail} · member ${rm.pass}/${rm.fail} · coverage --strict exit ${cov.code}`);
  if (ok) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else { console.log(`    VERDICT        : *** NOT AS DECLARED ***`); findings.push(`F9: fanout ${rf.fail} FAIL, harness ${rh.fail} FAIL, member ${rm.fail} FAIL, coverage exit ${cov.code}`); }
}

console.log(`\n${"=".repeat(78)}`);
console.log(`arms run: ${armsRun} · as declared: ${armsAsDeclared} · findings about the arms: ${findings.length}`);
for (const f of findings) console.log(`  FINDING: ${f}`);
console.log(`Every arm was armed ALONE with the other defences held open; every restore was`);
console.log(`verified by sha256 AND by cmp against a uniquely-named per-arm pristine copy.`);
process.exit(findings.length ? 1 : 0);
