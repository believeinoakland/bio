#!/usr/bin/env node
/* THE NEGATIVE CONTROL DRIVER for D-323 / D-324 (the empty-run instrument's own
 * object, and the mocks that could not see it refused). Deliberately NOT a
 * `.test.mjs`: it EDITS REAL SOURCES while it runs, and neither
 * `bio-plane/scripts/battery.mjs` nor the fleet walk must discover it —
 * `harness.control.mjs`'s precedent, unchanged.
 *
 *   node agent-worker/test/wire-vocabulary.control.mjs           all arms
 *   node agent-worker/test/wire-vocabulary.control.mjs W-B W-C   named arms only
 *
 * THE RULES, and every one of them was paid for by a defect this estate has met:
 * each arm ARMED ALONE with every other defence held open; each DECLARING what
 * must fail AND what must not BEFORE it runs; an arm that did not arm is a
 * FINDING and never a pass; a suite that died reports `fail: -1` and never 0;
 * every restore verified by sha256 AND by `cmp` against a UNIQUELY-NAMED per-arm
 * pristine copy with the byte count printed and floored; and an arm that comes
 * back green where red was declared is recorded as a finding ABOUT THE ARM.
 *
 * ===========================================================================
 * RESULTS — 2026-09-13, worktree agent-a92ada478a7a4e8f6, Opus 5. FIVE ARMS,
 * **ALL FIVE AS DECLARED**, and every figure below is what the run PRINTED
 * rather than what this header predicted. Figures read
 * `wire-vocabulary / harness / fanout`, each as `pass/fail`.
 *
 *   W-A  BASELINE — nothing armed. **83/0 · 214/0 · 182/0.** It is not
 *        decoration: it is what distinguishes five-arms-broken from
 *        five-arms-working, and every suite REACHED ITS OWN FOOT — `runNamed`
 *        matches on the tally line, so a killed module reads `fail: -1` rather
 *        than a comfortable zero.
 *
 *   W-B  THE ARM THIS ITEM EXISTS FOR — the colon restored in `harness.mjs`
 *        (`level-empty-${reported}` -> `level-empty:${reported}`), which is the
 *        EXACT pre-fix name. MUST FAIL naming the refusal the live plane gives;
 *        F10, dedup and the gate MUST NOT. Measured **65/18 · 211/3 · 180/2**,
 *        with **C-25.2 named in the wire suite's own output** — VF-4's live
 *        `BASIS_REFUSED` finding reproduced from the grammar itself rather than
 *        from a mock. F10 held, dedup held: a name defect is not a control-flow
 *        one and the suites can tell them apart.
 *
 *   W-C  THE KIND ARM — `kind: "level-empty"` swapped for one §9 does not hold
 *        (`new-version`, D-324's own fixture spelling). Measured
 *        **69/14 · 210/4 · 180/2**, **C-27.3 named**, and the NAME arms HELD —
 *        so the two defects this item closes are separably visible rather than
 *        collapsing into one red.
 *
 *   W-D  OVER-STRICTNESS, AND IT MUST STAY GREEN — nothing armed, W7 driven over
 *        the real validation: ten currently-legal names (including a
 *        64-character one, one bearing spaces and one starting with a digit),
 *        all five of §9's kinds, all four of `SUGGEST_LEVELS`, and a whole legal
 *        `basis-version` candidate. **83/0, every over-strictness assertion
 *        green.** Run as its OWN arm rather than inferred from W-A, because a
 *        fence tightened past its rule is the failure this direction catches.
 *
 *   W-E  THE MOCK CORRECTION PROVEN — the PERMISSIVE mock restored in
 *        `plane-suggest.mjs` (the vocabulary gate short-circuited so the branch
 *        writes whatever it is handed, exactly as both mocks did before
 *        2026-09-13). MUST FAIL: the wire-vocabulary assertions only a REFUSING
 *        mock can produce. Measured **83/0 · 202/12 · 177/5**, as declared.
 *
 *        **THIS ARM FOUND ITS OWN GAP FIRST, AND THE GAP IS WHY `fanout.test.mjs`
 *        GAINED ARM B6b.** On the first run of W-E `fanout.test.mjs` came back
 *        **176/0** — green with the mock fully widened — because every candidate
 *        that file submitted was already LEGAL, so a mock that accepts
 *        everything and one that accepts the legal thing are indistinguishable
 *        from inside it. **A suite that cannot fail when its double is widened
 *        is not pinning its double.** B6b submits one deliberately illegal
 *        candidate and asserts the catalogue's own refusal, and the same arm now
 *        reads 177/5. Recorded rather than smoothed, because the first reading
 *        is the measurement and the second is the fix.
 *
 *        `wire-vocabulary.test.mjs` holds at **83/0** under this arm, exactly as
 *        declared: it imports the plane's expressions and passes through no mock
 *        at all, which is the whole reason the item builds both halves.
 * ========================================================================== */

import { readFileSync, writeFileSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const MEMBER = join(HERE, "..");

const HARNESS = join(MEMBER, "src", "harness.mjs");
const MOCK = join(HERE, "plane-suggest.mjs");

/* INSIDE THIS WORKTREE'S OWN TMPDIR. A shared scratchpad is not isolated between
   sessions, and a concurrent worker overwrote a control harness between ARM and
   RESTORE once already. */
const WORK = mkdtempSync(join(tmpdir(), "d323-control-"));
process.on("exit", () => { try { rmSync(WORK, { recursive: true, force: true }); } catch { /* */ } });

const sha = (b) => createHash("sha256").update(b).digest("hex");
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));

let armsRun = 0, armsAsDeclared = 0;
const findings = [];

/* A suite that DIED mid-run prints no tail line at all, and reading that as
   "0 failures" is how a control once recorded a killed file as "stayed GREEN". */
function runNamed(file, label) {
  const r = spawnSync(process.execPath, [join(HERE, file)], { cwd: MEMBER, encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(new RegExp(`${label}:\\s*(\\d+) passed,\\s*(\\d+) failed`));
  const failed = [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1].trim());
  return m ? { ran: true, pass: +m[1], fail: +m[2], failed, out }
           : { ran: false, pass: 0, fail: -1, failed, out };
}
const runWire = () => runNamed("wire-vocabulary.test.mjs", "wire-vocabulary");
const runHarness = () => runNamed("harness.test.mjs", "harness");
const runFanout = () => runNamed("fanout.test.mjs", "fanout");

/* THE COPY'S NAME CARRIES A COUNTER — a name derived from the path alone is
   correct only while one snapshot of a file is live, and the second overwrote
   the first once, so a restore wrote the real original and then compared it
   against bytes that were no longer the original. */
let snapshots = 0;
const MIN_BYTES = 1000;
function takeOriginal(file) {
  const bytes = readFileSync(file);
  if (bytes.length < MIN_BYTES)
    throw new Error(`refusing to snapshot ${file}: ${bytes.length} bytes is under the ${MIN_BYTES}-byte `
      + `floor. Two harnesses have reported a restore byte-identical OVER AN EMPTY FILE.`);
  const copy = join(WORK, `${++snapshots}-${file.replace(/[^\w]/g, "_")}.orig`);
  writeFileSync(copy, bytes);
  console.log(`    snapshot       : ${bytes.length} B, sha256 ${sha(bytes).slice(0, 12)}… -> ${copy}`);
  return { file, bytes, copy, sha: sha(bytes) };
}

function restore(orig) {
  writeFileSync(orig.file, orig.bytes);
  const back = readFileSync(orig.file);
  const hashOk = sha(back) === orig.sha;
  /* THE SECOND INSTRUMENT, and it is not ceremony: a harness trusting its own
     hash reported a byte-identical restore over a file it had never written. */
  const contentOk = spawnSync("cmp", ["-s", orig.file, orig.copy]).status === 0;
  const sizeOk = statSync(orig.file).size === orig.bytes.length;
  if (!hashOk || !contentOk || !sizeOk) {
    console.error(`\n  !!! RESTORE FAILED for ${orig.file} — sha256 ${hashOk ? "ok" : "MISMATCH"}, `
      + `cmp ${contentOk ? "ok" : "MISMATCH"}, size ${sizeOk ? "ok" : "MISMATCH"}. `
      + `STOPPING: the tree is not as it was found.`);
    process.exit(2);
  }
  return `restore verified: ${back.length} B, sha256 + cmp + size all agree`;
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

  if (!file) {                       /* an unarmed arm — the baseline and W-D */
    const result = run();
    console.log(`    OBSERVED       : ${result.observed}`);
    if (result.asDeclared) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
    else { console.log(`    VERDICT        : *** NOT AS DECLARED ***`); findings.push(`${id}: ${result.observed}`); }
    return;
  }

  const orig = takeOriginal(file);
  const p = patch(file, find, replace);
  if (!p.armed) {
    console.log(`    >>> THE ARM DID NOT ARM: the patch matched ${p.hits} time(s), not once.`);
    console.log(`        THIS IS A FINDING ABOUT THE ARM, not a green result. Nothing was measured.`);
    findings.push(`${id}: never armed (patch matched ${p.hits} times)`);
    restore(orig);
    return;
  }

  let result;
  try { result = run(); }
  finally { console.log(`    ${restore(orig)}`); }

  console.log(`    OBSERVED       : ${result.observed}`);
  if (result.asDeclared) { armsAsDeclared++; console.log(`    VERDICT        : AS DECLARED`); }
  else {
    console.log(`    VERDICT        : *** NOT AS DECLARED — recorded as a finding about the arm ***`);
    findings.push(`${id}: ${result.observed}`);
  }
}

const anyFailed = (r, re) => r.failed.some((l) => re.test(l));

/* ========================================================================== */

arm({
  id: "W-A", subject: "BASELINE — nothing armed",
  what: "nothing. This row is what distinguishes four-arms-broken from four-arms-working",
  mustFail: "nothing",
  mustNot: "anything at all — and every suite must REACH ITS OWN FOOT, so a killed module reads -1",
  run: () => {
    const w = runWire(), h = runHarness(), f = runFanout();
    return {
      observed: `wire ${w.pass}/${w.fail} · harness ${h.pass}/${h.fail} · fanout ${f.pass}/${f.fail}`,
      asDeclared: w.ran && h.ran && f.ran && w.fail === 0 && h.fail === 0 && f.fail === 0 && w.pass > 0,
    };
  },
});

arm({
  id: "W-B", subject: "D-323 — THE COLON RESTORED, which is the arm this item exists for",
  what: "`emptyLevelCandidates` mints `level-empty:<level>` again — the exact pre-fix name",
  mustFail: "the wire-vocabulary arms, NAMING C-25.2, the refusal the deployed plane gives; and the "
    + "suites' own wire-spelling assertions",
  mustNot: "F10 (refusal -> adjust -> land), dedup, or the mode gate — a name defect is not a control-flow one",
  file: HARNESS,
  find: "      name: `level-empty-${reported}`,",
  replace: "      name: `level-empty:${reported}`,",
  run: () => {
    const w = runWire(), h = runHarness(), f = runFanout();
    const named = anyFailed(w, /refused by NOTHING the wire holds|passes VERSION_NAME_RE|carries no colon/);
    const namesTheCode = /C-25\.2/.test(w.out);
    const f10Held = !anyFailed(h, /routed to ADJUST|adjust routed BACK|repeats. counter stayed/);
    const dedupHeld = !anyFailed(h, /never submitted|compared against 2 on the record/);
    return {
      observed: `wire ${w.pass}/${w.fail} · harness ${h.pass}/${h.fail} · fanout ${f.pass}/${f.fail}`
        + ` · wire arms ${named ? "FAILED" : "did NOT fail"} · C-25.2 named in the output: ${namesTheCode}`
        + ` · F10 ${f10Held ? "held" : "also failed"} · dedup ${dedupHeld ? "held" : "also failed"}`,
      asDeclared: w.ran && h.ran && f.ran && named && namesTheCode && w.fail > 0 && h.fail > 0
                  && f10Held && dedupHeld,
    };
  },
});

arm({
  id: "W-C", subject: "D-324 — A KIND §9 DOES NOT HOLD",
  what: "the table mints `kind: \"new-version\"` — D-324's own fixture spelling — on the empty-level candidate",
  mustFail: "the wire-vocabulary arms, NAMING C-27.3; and the suites' kind assertions",
  mustNot: "the name arms — the two defects are separable and the suite must be able to tell them apart",
  file: HARNESS,
  find: `      kind: "level-empty",
      target: target ?? null,`,
  replace: `      kind: "new-version",
      target: target ?? null,`,
  run: () => {
    const w = runWire(), h = runHarness(), f = runFanout();
    const named = anyFailed(w, /refused by NOTHING the wire holds|names a kind the catalogue holds/);
    const namesTheCode = /C-27\.3/.test(w.out);
    const nameArmHeld = !anyFailed(w, /passes VERSION_NAME_RE|carries no colon/);
    return {
      observed: `wire ${w.pass}/${w.fail} · harness ${h.pass}/${h.fail} · fanout ${f.pass}/${f.fail}`
        + ` · kind arms ${named ? "FAILED" : "did NOT fail"} · C-27.3 named: ${namesTheCode}`
        + ` · name arms ${nameArmHeld ? "held" : "also failed"}`,
      asDeclared: w.ran && h.ran && f.ran && named && namesTheCode && nameArmHeld && w.fail > 0,
    };
  },
});

arm({
  id: "W-D", subject: "OVER-STRICTNESS — every currently-legal name, kind and level still passes",
  what: "nothing is armed. The fix must not narrow what the wire accepts",
  mustFail: "NOTHING. A fence tighter than its rule is not a safer fence",
  mustNot: "any of W7's legal names, §9's five kinds, the four levels, or a legal basis-version candidate",
  run: () => {
    const w = runWire();
    const strictHeld = !anyFailed(w, /still passes the grammar|is still accepted|refused by nothing/);
    return {
      observed: `wire ${w.pass}/${w.fail} · over-strictness arms ${strictHeld ? "ALL GREEN (as declared)" : "FAILED"}`,
      asDeclared: w.ran && w.fail === 0 && strictHeld,
    };
  },
});

arm({
  id: "W-E", subject: "THE MOCK CORRECTION PROVEN — the PERMISSIVE mock restored",
  what: "`plane-suggest.mjs`'s vocabulary gate is short-circuited, so the mock writes whatever it is "
    + "handed — exactly what both mocks did before 2026-09-13",
  mustFail: "the wire-vocabulary assertions in the two mock-backed suites, so the mock cannot silently widen again",
  mustNot: "`wire-vocabulary.test.mjs` — it imports the plane's own expressions and goes through NO mock, "
    + "which is precisely why the item builds both halves",
  file: MOCK,
  find: "      const nm = String((body && body.name) != null ? body.name : \"\").trim();",
  replace: "      if (true) { S.suggested.push({ name: (body && body.name) || null, kind: (body && body.kind) || null"
    + "${f10 ? \", canon: canon(body || {})\" : \"\"} });\n"
    + "        return Response.json({ ok: true, result: { wrote: true, version: (body && body.name) || null } }); }\n"
    + "      const nm = String((body && body.name) != null ? body.name : \"\").trim();",
  run: () => {
    const w = runWire(), h = runHarness(), f = runFanout();
    const mockBacked = h.fail > 0 || f.fail > 0;
    return {
      observed: `wire ${w.pass}/${w.fail} · harness ${h.pass}/${h.fail} · fanout ${f.pass}/${f.fail}`
        + ` · mock-backed suites ${mockBacked ? "FAILED (as declared)" : "did NOT fail — A FINDING ABOUT THE ARM"}`
        + ` · wire suite ${w.fail === 0 ? "held (as declared — it has no mock in it)" : "also failed"}`,
      asDeclared: w.ran && h.ran && f.ran && mockBacked && w.fail === 0,
    };
  },
});

console.log(`\n${armsRun} arm(s) run, ${armsAsDeclared} AS DECLARED.`);
if (findings.length) {
  console.log(`\nFINDINGS (recorded, not smoothed):`);
  for (const f of findings) console.log(`  - ${f}`);
}
console.log(`Every armed restore verified by sha256 AND by cmp AND by size, against a uniquely-named`);
console.log(`per-arm pristine copy with its byte count printed and floored at ${MIN_BYTES} B.`);
process.exit(armsRun === armsAsDeclared ? 0 : 1);
