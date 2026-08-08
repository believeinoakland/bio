#!/usr/bin/env node
/* THE NEGATIVE CONTROL FOR M0-12, RUN RATHER THAN DESCRIBED.
 *
 *     node test/op-claims.control.mjs
 *
 * Deliberately NOT a `.test.mjs`: it EDITS REAL SOURCE FILES, so it must not run
 * inside the battery. `register.control.mjs` and `suggest.control.mjs` are the
 * precedent.
 *
 * THE RULES THIS HARNESS OBEYS, each one bought with a real failure in this
 * repository:
 *
 *  1. EACH ARM ALONE, the others held open. An arm that runs beside another cannot
 *     say which one moved the count.
 *  2. EVERY SNAPSHOT IS NAMED BY ARM AS WELL AS BY PATH. A harness hours before
 *     this one took two snapshots of one file and keyed both on the PATH ALONE, so
 *     the second overwrote the first and its outer check compared a correctly
 *     restored original against patched bytes.
 *  3. EVERY RESTORE IS VERIFIED BY sha256 **AND** BY CONTENT (`cmp`-equivalent, a
 *     byte compare of the buffers). `cmp` has caught what sha256 could not.
 *  4. IT LIVES IN THE WORKTREE, never in a shared scratchpad. PL-10: two concurrent
 *     workers wrote a harness to the same scratchpad path and the second replaced
 *     the first BETWEEN ARM AND RESTORE.
 *  5. A DECLARED must-fail AND a declared must-not-fail per arm, and a SURPRISING
 *     GREEN is recorded as a finding about the arm rather than smoothed away.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SUITE = join(DIR, "op-claims.test.mjs");

const sha = (b) => createHash("sha256").update(b).digest("hex");

/* Snapshots keyed by ARM + PATH, never by path alone. See rule 2 above. */
const snaps = new Map();
function snapshot(arm, path) {
  const key = `${arm}::${path}`;
  if (snaps.has(key)) throw new Error(`snapshot collision for ${key} — refusing to overwrite`);
  const buf = readFileSync(path);
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
  return { hashOk, contentOk, sha: sha(got) };
}

/* Run the suite and read its OWN tally line, never a subtraction. A suite whose
   count cannot be read is reported as -1 and not 0 — a missing tally reported as
   zero is how "0 pass, 0 fail" hides a suite that was KILLED rather than failed. */
function runSuite() {
  let out = "", code = 0;
  try {
    out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    out = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    code = e.status ?? 1;
  }
  const m = /op-claims: (\d+) pass, (\d+) fail/.exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, code, out };
}

const BASE = runSuite();
console.log(`BASELINE  ${BASE.pass} pass, ${BASE.fail} fail, exit ${BASE.code}`);
if (BASE.fail !== 0 || BASE.pass < 20) {
  console.log("the tree is not green before the controls — refusing to run arms");
  process.exit(1);
}

const results = [];
function arm({ id, what, mustFail, mustNotFail, files }) {
  for (const f of files) snapshot(id, f.path);
  for (const f of files) writeFileSync(f.path, f.patch(readFileSync(f.path, "utf8")));
  /* AN ARM THAT NEVER ARMED IS THE WORST OUTCOME: it reports a clean green over a
     patch that matched zero times. Every patch must have CHANGED the bytes. */
  const armed = files.every((f) =>
    Buffer.compare(readFileSync(f.path), snaps.get(`${id}::${f.path}`)) !== 0);
  const r = armed ? runSuite() : { pass: -1, fail: -1, code: -1, out: "PATCH MATCHED NOTHING" };
  const restores = files.map((f) => ({ path: f.path, ...restore(id, f.path) }));
  const verdict = !armed ? "NEVER ARMED"
    : r.fail === -1 ? "KILLED (no tally) — the arm took the suite down rather than failing it"
    : mustFail(r) ? "as declared"
    : "SURPRISING — record this, do not smooth it";
  results.push({ id, what, pass: r.pass, fail: r.fail, verdict, armed });
  console.log(`\nARM ${id} — ${what}`);
  console.log(`  declared: ${mustFail.toString().replace(/\s+/g, " ").slice(0, 120)}`);
  console.log(`  measured: ${r.pass} pass, ${r.fail} fail, exit ${r.code}  ->  ${verdict}`);
  if (mustNotFail) {
    const held = mustNotFail(r);
    console.log(`  must-not-fail (held open): ${held ? "HELD" : "*** DID NOT HOLD ***"}`);
  }
  for (const x of restores)
    console.log(`  restored ${x.path.slice(REPO.length + 1)} — sha256 ok, content (cmp) ok`);
  const named = (r.out.match(/^ +FAIL {2}.*$/gm) ?? []).slice(0, 4);
  for (const n of named) console.log(`    names: ${n.trim().slice(0, 150)}`);
}

const STORE = join(PLANE, "src/store.mjs");
const VERIF = join(REPO, "docs/development/VERIFICATION.md");
const MODULE = join(PLANE, "scripts/op-claims.mjs");
const T = (n) => "op" + "=" + n;

/* ------------------------------------------------------------------- the arms */

/* (a) THE ARM THIS ITEM EXISTS FOR: a comment naming an op that does not exist. */
arm({
  id: "a",
  what: "plant a comment in bio-plane/src/store.mjs naming an op that does not exist",
  files: [{ path: STORE, patch: (s) => s.replace("  async fetch(req) {",
    `  /* M0-12 CONTROL ARM (a): ${T("thisopdoesnotexist")} answers the caller. */\n  async fetch(req) {`) }],
  mustFail: (r) => r.fail >= 1 && /thisopdoesnotexist/.test(r.out) && /store\.mjs:\d+/.test(r.out),
  mustNotFail: (r) => r.pass >= BASE.pass - 2,
});

/* (b) IC-22's ACTUAL SENTENCE, in a planning document, where the real one lived. */
arm({
  id: "b",
  what: "plant IC-22's actual false sentence — the DO path written as an op — into a planning document",
  files: [{ path: VERIF, patch: (s) => s +
    `\n<!-- M0-12 CONTROL ARM (b) -->\n${T("publishcase")} returns \`opened\` to the member who just published.\n` }],
  mustFail: (r) => r.fail >= 1 && /WRONG-LEVEL/.test(r.out)
    && /VERIFICATION\.md:\d+/.test(r.out) && /op=publish\./.test(r.out),
  mustNotFail: (r) => r.pass >= BASE.pass - 2,
});

/* (c) NEUTER THE WALK. The headline assertion must NOT be what catches this. */
arm({
  id: "c",
  what: "neuter corpus() so the walk reads NOTHING — the reach must fail as a DELTA with the corpus PRINTED",
  files: [{ path: MODULE, patch: (s) => s.replace(
    "  files.sort();",
    "  files.sort();\n  files.length = 0;   /* M0-12 CONTROL ARM (c) */") }],
  mustFail: (r) => r.fail >= 3 && /CORPUS: 0 files/.test(r.out),
  mustNotFail: (r) => r.pass >= 10,
});

/* (d) NEUTER THE MATCHER. */
arm({
  id: "d",
  what: "neuter mentionsIn() so nothing is ever a mention — the reach fixtures must fail",
  files: [{ path: MODULE, patch: (s) => s.replace(
    "export function mentionsIn(body) {\n  const out = [];",
    "export function mentionsIn(body) {\n  const out = [];\n  if (1) return out;   /* M0-12 CONTROL ARM (d) */") }],
  mustFail: (r) => r.fail >= 4,
  mustNotFail: (r) => r.pass >= 10,
});

/* (e) OVER-STRICTNESS. Legitimate prose, in spellings the suite did not author,
       planted into a REAL file. It must NOT fire. This arm PASSES BY NOT FIRING,
       which is the arm that decides whether the check survives the estate. */
arm({
  id: "e",
  what: "plant LEGITIMATE prose in unanticipated spellings — a correct op in a heading, a URL, "
      + "a bare word, an assignment, a template — none of it may be flagged",
  files: [{ path: VERIF, patch: (s) => s +
    `\n<!-- M0-12 CONTROL ARM (e): every line below is CORRECT and must not fire -->\n`
    + `### ${T("ratify")}, and what it refuses\n`
    + `Run \`${T("audit")}\` first; then \`${T("promote")}\`, \`${T("acquire")}\` and \`${T("attest")}\`.\n`
    + `The surface calls \`${T("image")}&token=x&id=y\` and reads the bytes.\n`
    + "In the harness: `const q = new URL(u).searchParams, op=q.get(\"op\");`\n"
    + "A built name: `` `" + T("version") + "${act} moves the record` ``\n"
    + "And the request carried stop=1 and noop=true and crop=full.\n" }],
  mustFail: (r) => r.fail === 0 && r.pass === BASE.pass,
  mustNotFail: (r) => r.fail === 0,
});

/* (f) BREAK THE ALIAS HALF. Existence alone was never the check — this is the half
       that catches IC-22, and it must be the half that fails when it is removed. */
arm({
  id: "f",
  what: "empty DO_PATH so the alias is invisible — the routing assertions must fail, "
      + "because a name-existence check would have passed IC-22's sentence",
  files: [{ path: MODULE, patch: (s) => s.replace(
    "  const doPath = new Map();",
    "  const doPath = new Map();\n  if (1) return { ops, doPath, routes: readRoutesForArmF(storeSrc) };   /* M0-12 CONTROL ARM (f) */")
    .replace("export function routeOf(op, table) {",
      `function readRoutesForArmF(storeSrc) {
  const i = storeSrc.indexOf(STORE_DISPATCH_ANCHOR);
  const open = storeSrc.indexOf("{", i); let d = 0, end = -1;
  for (let p = open; p < storeSrc.length; p++) {
    if (storeSrc[p] === "{") d++;
    else if (storeSrc[p] === "}") { d--; if (d === 0) { end = p; break; } } }
  const routes = new Map();
  for (const m of storeSrc.slice(open + 1, end).matchAll(/^\\s{8}([a-z][a-z0-9]*)\\s*:\\s*\\(\\)\\s*=>\\s*(?:this\\.)?(#?[A-Za-z0-9_]+)/gm))
    routes.set(m[1], m[2]);
  return routes;
}
export function routeOf(op, table) {`) }],
  mustFail: (r) => r.fail >= 2,
  mustNotFail: (r) => r.pass >= 10,
});

/* ------------------------------------------------------------------ the verdict */
const after = runSuite();
console.log(`\nAFTER ALL ARMS, the tree restored: ${after.pass} pass, ${after.fail} fail, exit ${after.code}`);
console.log(after.pass === BASE.pass && after.fail === 0
  ? "  identical to baseline — every file restored"
  : "  *** NOT identical to baseline — a restore did not take ***");
console.log("\nSUMMARY");
for (const r of results)
  console.log(`  (${r.id}) ${r.pass} pass / ${r.fail} fail — ${r.verdict}`);
process.exit(results.every((r) => r.verdict === "as declared")
  && after.pass === BASE.pass && after.fail === 0 ? 0 : 1);
