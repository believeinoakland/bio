#!/usr/bin/env node
/* THE NEGATIVE CONTROL FOR FW-14, RUN RATHER THAN DESCRIBED.
 *
 *     node test/rung-ladder.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCE FILES, so it must not run
 * inside the battery (`scripts/battery.mjs` discovers `.endsWith(".test.mjs")`
 * and nothing else). `op-claims.control.mjs` is the precedent and this file
 * copies its discipline rather than re-deriving it.
 *
 * THE RULES THIS HARNESS OBEYS, each one bought with a real failure here:
 *
 *  1. EACH ARM ALONE, the others held open.
 *  2. EVERY SNAPSHOT IS NAMED BY ARM AS WELL AS BY PATH.
 *  3. EVERY RESTORE IS VERIFIED BY sha256 **AND** BY CONTENT (a byte compare of
 *     the buffers — the `cmp` half). A restore check that reported two EMPTY
 *     files byte-identical, printing the sha256 of the empty string, is why both
 *     halves run and why the digest is printed.
 *  4. IT LIVES IN THE WORKTREE, never in a shared scratchpad — two workers have
 *     now independently reported the scratchpad is not isolated between sessions.
 *  5. A DECLARED must-fail AND a declared must-not-fail per arm, and a
 *     SURPRISING result is recorded as a finding about the ARM rather than
 *     smoothed away.
 *  6. AN ARM THAT NEVER ARMED is called out by name: a patch matching zero times
 *     reports a beautiful green over an unmodified tree. *
 * RUN 2026-09-29 BY legacy-tests T12 (arms 1 and 3 re-anchored onto src/control-plane/ops.mjs, K413) in a scratch
 * worktree at 58ea5a554f: BASELINE 52 pass / 0 fail (the carried `profilesset` reds were gone on that tree — the op is
 * classified there, so the carried-baseline branch did not have to fire) · arm 1 49/3 as declared, `frobnicate` named
 * in FORWARD · arm 2 42/10 as declared, corpus printing 0 declared mutating · arm 3 52/0 as declared · after all
 * restores 52/0; ops.mjs and dispatch-reader.mjs byte-identical by sha256 and cmp.
 * RE-RUN 2026-09-30 BY LEGACY-TESTS #13 (T15; N345): BASELINE 52 pass / 0 fail, corpus 327 ops · 178 declared mutating
 * (56 rungs + 122 stated absences; N345's contradiction and entities ops moved it from 170) · arm 1 49/3 as declared ·
 * arm 2 42/10 as declared · arm 3 52/0 as declared · after all restores 52/0. The carried-baseline rule below (its
 * `want 170 got 169` count) describes the `profilesset` reds, which are gone; over a green baseline it never fires, and
 * the suite's own EXACT line is computed (RUNGS + RUNG_ABSENT against the read mutating set), so no count is pinned.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SUITE = join(DIR, "rung-ladder.test.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");

const snaps = new Map();
function snapshot(arm, path) {
  const key = `${arm}::${path}`;
  if (snaps.has(key)) throw new Error(`snapshot collision for ${key} — refusing to overwrite`);
  const buf = readFileSync(path);
  /* PRINTED, and guarded: a pristine copy of zero bytes hashes to
     e3b0c442…, and every later comparison against it succeeds. */
  if (buf.length < 1000) throw new Error(`pristine ${path} is ${buf.length} bytes — refusing to trust it`);
  snaps.set(key, buf);
  return buf;
}
function restore(arm, path) {
  const key = `${arm}::${path}`;
  const want = snaps.get(key);
  if (!want) throw new Error(`no snapshot for ${key}`);
  writeFileSync(path, want);
  const got = readFileSync(path);
  const hashOk = sha(got) === sha(want);
  const contentOk = Buffer.compare(got, want) === 0;   // the `cmp` half
  if (!hashOk || !contentOk)
    throw new Error(`RESTORE FAILED for ${key}: sha=${hashOk} content=${contentOk}`);
  return { hashOk, contentOk, sha: sha(got), bytes: got.length };
}

/* Run the suite and read its OWN tally line, never a subtraction. A suite whose
   count cannot be read is reported as -1 and not 0. The FOOT marker is read
   separately: a TypeError inside an assertion ends the module while the tally
   line never prints at all, and "no tally" and "clean tally, no foot" are
   different failures. */
function runSuite() {
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    code = e.status ?? 1;
  }
  const m = /rung-ladder: (\d+) pass, (\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1,
           foot: /\[FOOT REACHED\]/.test(out), code, out };
}

const BASE = runSuite();
console.log(`BASELINE  ${BASE.pass} pass, ${BASE.fail} fail, exit ${BASE.code}, foot ${BASE.foot}`);
/* RE-ANCHORED 2026-09-29 (legacy-tests T12; K414, AFFORDANCES' open item): the baseline CARRIES three reds, all one
   defect in another module — `profilesset` (instance-setup's op, control-plane `ops.mjs`) is mutating and classified
   in neither RUNGS nor RUNG_ABSENT, so FORWARD, the EXACT-account line and affordances' `unaccounted` agreement fail.
   The harness runs over that baseline only when EVERY baseline failure is that carried one (each FAIL's `got` names
   `profilesset` or is the 170-vs-169 count), and every arm below is judged RELATIVE to the baseline, never to zero.
   The day affordances classifies the op, the baseline reads 0 fail and nothing here needs moving. */
const BASE_FAILS = [...BASE.out.matchAll(/^ +FAIL {2}.*\n(?: +want .*\n)?(?: +got .*)?/gm)].map((m) => m[0]);
const CARRIED = BASE_FAILS.every((f) => /got .*profilesset/.test(f) || /want 170\s+got\s+169/.test(f.replace(/\n\s+/g, " ")));
if (BASE.pass < 30 || !BASE.foot || BASE.fail > 3 || !CARRIED) {
  console.log("the tree is not green before the controls (beyond the carried `profilesset` reds) — refusing to run arms");
  process.exit(1);
}
if (BASE.fail) console.log(`  baseline carries ${BASE.fail} red(s), all the unclassified \`profilesset\` — arms are judged against this baseline`);

const results = [];
function arm({ id, what, mustFail, mustNotFail, files }) {
  for (const f of files) snapshot(id, f.path);
  for (const f of files) writeFileSync(f.path, f.patch(readFileSync(f.path, "utf8")));
  const armed = files.every((f) =>
    Buffer.compare(readFileSync(f.path), snaps.get(`${id}::${f.path}`)) !== 0);
  const r = armed ? runSuite() : { pass: -1, fail: -1, code: -1, foot: false, out: "PATCH MATCHED NOTHING" };
  const restores = files.map((f) => ({ path: f.path, ...restore(id, f.path) }));
  const verdict = !armed ? "*** NEVER ARMED ***"
    : r.pass === -1 ? "KILLED (no tally) — the arm took the suite down rather than failing it"
    : mustFail(r) ? "as declared"
    : "SURPRISING — record this, do not smooth it";
  results.push({ id, what, pass: r.pass, fail: r.fail, verdict, armed });
  console.log(`\nARM ${id} — ${what}`);
  console.log(`  measured: ${r.pass} pass, ${r.fail} fail, exit ${r.code}, foot ${r.foot}  ->  ${verdict}`);
  if (mustNotFail) console.log(`  must-not-fail (held open): ${mustNotFail(r) ? "HELD" : "*** DID NOT HOLD ***"}`);
  for (const x of restores)
    console.log(`  restored ${x.path.slice(REPO.length + 1)} — ${x.bytes} bytes, sha256 ${x.sha.slice(0, 16)}… ok, content (cmp) ok`);
  for (const n of (r.out.match(/^ +FAIL {2}.*$/gm) ?? []).slice(0, 3))
    console.log(`    names: ${n.trim().slice(0, 160)}`);
  for (const n of (r.out.match(/^ +FW-14 CORPUS: .*$/gm) ?? []))
    console.log(`    corpus: ${n.trim()}`);
}

/* RE-ANCHORED 2026-09-29 (legacy-tests T12; K413, CONTROL-PLANE #2): the OPS table left `src/index.mjs` for
   `src/control-plane/ops.mjs`; arms (1) and (3) plant into it there, with the same edits. */
const INDEX = join(PLANE, "src/control-plane/ops.mjs");
/* RE-ANCHORED 2026-09-27 (T4, legacy-tests; legacy-index N12): the dispatch reader left `scripts/op-claims.mjs` (removed)
   for `test/dispatch-reader.mjs`, verbatim; arm (2) neuters the same line there. */
const OPCLAIMS = join(DIR, "dispatch-reader.mjs");

/* -------------------------------------------------------------- the arms */

/* (1) THE ARM THIS ITEM EXISTS FOR. A mutating op arrives in the dispatch table
   and is classified NOWHERE — no rung, no stated absence. The forward totality
   assertion must FAIL and must NAME it. If this arm ever comes back green, the
   whole item is decorative. */
arm({
  id: "1",
  what: "add a MUTATING op to the OPS dispatch table with no rung and no stated absence",
  files: [{ path: INDEX, patch: (s) => s.replace(
    '  knock:      { classes: null,                                   mutating: true  },',
    '  frobnicate: { classes: null,                                   mutating: true  },\n'
    + '  knock:      { classes: null,                                   mutating: true  },') }],
  /* Judged against the baseline (above): FORWARD and the EXACT line already fail over `profilesset`, so the COUNT
     cannot rise for them; the arm is read off the NAME — `frobnicate` must appear in a failing assertion's `got`. */
  mustFail: (r) => r.fail >= Math.max(1, BASE.fail) && /got .*frobnicate/.test(r.out) && /FORWARD/.test(r.out),
  /* The BACKWARD direction must stay green: this arm adds an op, it does not
     invent a classification, so a failure there would mean the two directions
     are not independent. */
  mustNotFail: (r) => r.pass >= BASE.pass - 3 && !/FAIL.*BACKWARD/.test(r.out),
});

/* (2) NEUTER THE WALK that derives the op set. A classification swept over an
   EMPTY op set is vacuously total: `unclassified === []` and
   `phantom === []` are both true of nothing, so the headline assertions of
   section 2 would report a beautiful clean verdict. The REACH FLOOR in section 1
   is what must catch it, and the corpus must be PRINTED so the collapse is
   visible rather than silent. */
arm({
  id: "2",
  what: "neuter readDispatch()'s mutating walk so the derived op set is EMPTY",
  files: [{ path: OPCLAIMS, patch: (s) => s.replace(
    "  const mutating = new Set(opRows.filter((m) => /mutating:\\s*true/.test(m[2])).map((m) => m[1]));",
    "  const mutating = new Set();   /* FW-14 CONTROL ARM (2) */") }],
  mustFail: (r) => r.fail >= 2 && /FW-14 CORPUS: \d+ ops in the dispatch table · 0 declared mutating/.test(r.out),
  mustNotFail: (r) => r.pass >= 10,
});

/* (3) OVER-STRICTNESS. A CORRECTLY classified op, re-spelled in a shape this
   suite did not author: no spaces around the colon, the whole row on one line,
   different internal spacing. It MUST PASS — the arm passes only by NOT FIRING,
   and it is the arm that decides whether the reader survives contact with a
   table nobody formatted for it. `op=cite` is chosen because it carries a rung
   (`reversible`, C-7's answer) rather than a stated absence, so a reader that
   lost the row would fail LOUDLY in both directions at once. */
arm({
  id: "3",
  what: "re-spell a CORRECTLY classified op's row in a shape this suite did not anticipate",
  files: [{ path: INDEX, patch: (s) => s.replace(
    /^ {2}cite:\s*\{[^}]*\},$/m,
    '  cite:{classes:["admin","member","probe"],mutating:true},') }],
  mustFail: (r) => r.fail === BASE.fail && r.pass === BASE.pass && r.foot,
  mustNotFail: (r) => r.fail === BASE.fail,
});

/* ------------------------------------------------------------------ summary */
console.log("\n================ FW-14 NEGATIVE CONTROL SUMMARY ================");
for (const r of results)
  console.log(`  arm ${r.id}  ${String(r.pass).padStart(3)} pass / ${String(r.fail).padStart(2)} fail  ${r.verdict}  — ${r.what}`);
const surprising = results.filter((r) => r.verdict !== "as declared");
console.log(surprising.length === 0
  ? "\nALL ARMS AS DECLARED."
  : `\n${surprising.length} ARM(S) OTHER THAN DECLARED — these are findings about the instrument: `
    + surprising.map((r) => r.id).join(", "));
const FINAL = runSuite();
console.log(`\nAFTER ALL RESTORES  ${FINAL.pass} pass, ${FINAL.fail} fail, exit ${FINAL.code}, foot ${FINAL.foot}`
  + `  ->  ${FINAL.pass === BASE.pass && FINAL.fail === BASE.fail ? "tree is back to baseline" : "*** TREE NOT RESTORED ***"}`);
