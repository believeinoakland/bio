/* REC-66's NEGATIVE-CONTROL DRIVER. Not a suite (`scripts/battery.mjs` discovers
 * `*.test.mjs`), and it lives INSIDE this worktree rather than in a scratchpad so the next
 * session can re-run the arms in one step instead of re-deriving how to break the subject.
 *
 *     cd bio-plane && node test/nc-rec66.mjs            # every arm, one at a time
 *     cd bio-plane && node test/nc-rec66.mjs 1 3        # only those arms
 *
 * THE DISCIPLINE, and every clause of it was earned by a control that went wrong here:
 *   - ONE ARM AT A TIME, every other held open, so a failure names ONE cause.
 *   - A BASELINE ROW FIRST. A harness whose first run reported `null` for every arm INCLUDING
 *     the baseline read exactly like six working arms; only the baseline told them apart.
 *   - THE ANCHOR IS ASSERTED UNIQUE BEFORE MUTATION, and the bytes asserted CHANGED after —
 *     an arm that never armed is the failure mode this project has recorded twice.
 *   - EVERY RESTORE VERIFIED BY sha256 AND BY `cmp` against a PRISTINE pre-arm copy named
 *     UNIQUELY PER ARM, so two arms cannot restore each other's file.
 *   - COUNTS ARE READ FROM THE SUITE'S OWN FOOT (`N pass, M fail`), and a suite that DIED
 *     before its foot is reported as `no foot` rather than as zero failures. A TypeError
 *     inside an assertion goes through no assertion at all. */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const STORE = HERE + "../src/store.mjs";
const SUITE = HERE + "derivation-bounds.test.mjs";
const SUITES = { derivation: "test/derivation-bounds.test.mjs",
                 meaning: "test/meaning-bounds.test.mjs",
                 bounds: "test/bounds.test.mjs" };
const CWD = HERE + "..";

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const runSuite = (rel) => {
  const r = spawnSync("node", [rel], { cwd: CWD, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  const foot = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1].slice(0, 90));
  return foot ? { pass: +foot[1], fail: +foot[2], named, exit: r.status }
              : { pass: null, fail: null, named, exit: r.status, noFoot: true };
};

const ARMS = [
  { n: 1, what: "RESTORE THE UNBOUNDED DERIVATION — the state this item found the op in",
    suites: ["derivation", "meaning", "bounds"], file: STORE,
    edits: [
      [ "const scan = this.#rows(\n      `SELECT capture_sha, bundle_id, grade FROM resolutions\n"
      + "        WHERE entity_id=? AND capture_sha IN (\n"
      + "          SELECT capture_sha FROM resolutions WHERE entity_id=? GROUP BY capture_sha\n"
      + "           ORDER BY capture_sha LIMIT ?)\n"
      + "        ORDER BY capture_sha LIMIT ?`, entityId, entityId, endsCap + 1, rowCap + 1);",
        "const scan = this.#rows(\n      `SELECT capture_sha, bundle_id, grade FROM resolutions "
      + "WHERE entity_id=? ORDER BY capture_sha`, entityId);" ],
      [ "const ends = distinct.length > endsCap ? distinct.slice(0, endsCap) : distinct;",
        "const ends = distinct;" ]] },
  { n: 2, what: "THE NAIVE FIX — derivation left unbounded, the ANSWER cut instead",
    suites: ["derivation", "meaning", "bounds"], file: STORE,
    edits: [
      [ "const scan = this.#rows(\n      `SELECT capture_sha, bundle_id, grade FROM resolutions\n"
      + "        WHERE entity_id=? AND capture_sha IN (\n"
      + "          SELECT capture_sha FROM resolutions WHERE entity_id=? GROUP BY capture_sha\n"
      + "           ORDER BY capture_sha LIMIT ?)\n"
      + "        ORDER BY capture_sha LIMIT ?`, entityId, entityId, endsCap + 1, rowCap + 1);",
        "const scan = this.#rows(\n      `SELECT capture_sha, bundle_id, grade FROM resolutions "
      + "WHERE entity_id=? ORDER BY capture_sha`, entityId);" ],
      [ "const ends = distinct.length > endsCap ? distinct.slice(0, endsCap) : distinct;",
        "const ends = distinct;" ],
      [ "documents: ends.length, document_limit: endsCap, resolution_rows: scan.length,\n"
      + "             count: connections.length, connections, limit: cap, truncated };",
        "documents: Math.min(ends.length, endsCap), document_limit: endsCap, resolution_rows: scan.length,\n"
      + "             count: Math.min(connections.length, cap), connections: connections.slice(0, cap), "
      + "limit: cap, truncated };" ]] },
  { n: 3, what: "BREAK THE TAINT PROPAGATION in the walk — the cause of the first draft's blindness",
    suites: ["derivation"], file: SUITE,
    edits: [
      [ "    { const re = /\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*([^;]*)/g; let m;\n"
      + "      while ((m = re.exec(body))) if (mentions(m[2], tainted)) tainted.add(m[1]); }",
        "    { /* NC-3: propagation through assignment removed */ }" ]] },
  { n: 4, what: "NEUTER THE WALK — it must find nothing and SAY so",
    suites: ["derivation"], file: SUITE,
    edits: [
      [ "const classMembers = (code) => {\n  const out = new Map();",
        "const classMembers = (code) => {\n  const out = new Map();\n  if (1) return out;" ]] },
  { n: 6, what: "UNARM THE FIXTURE — a quadratic subject too small for the bound to bite",
    suites: ["derivation"], file: SUITE,
    edits: [["const BIG_K = 40, SMALL_K = 3;", "const BIG_K = 3, SMALL_K = 3;"]] },
];
/* Arm 5 is the OVER-STRICTNESS block and is armed by construction: it passes on the clean
   tree and goes red under arm 4, which is what proves it is armed rather than decorative. */

const want = process.argv.slice(2).map(Number).filter(Boolean);
const arms = want.length ? ARMS.filter((a) => want.includes(a.n)) : ARMS;

console.log("=== BASELINE (no arm) ===");
for (const key of ["derivation", "meaning", "bounds"]) {
  const r = runSuite(SUITES[key]);
  console.log(`  ${key.padEnd(11)} ${r.noFoot ? "NO FOOT — the suite died before its own tally" : `${r.pass}/${r.fail}`} (exit ${r.exit})`);
}

for (const arm of arms) {
  const pristine = `${arm.file}.nc-rec66-arm${arm.n}.pristine`;
  copyFileSync(arm.file, pristine);
  const before = sha(arm.file);
  let src = readFileSync(arm.file, "utf8");
  for (const [from, to] of arm.edits) {
    const hits = src.split(from).length - 1;
    if (hits !== 1) throw new Error(`ARM ${arm.n}: anchor is not unique (${hits} hits): ${from.slice(0, 70)}`);
    src = src.replace(from, to);
  }
  writeFileSync(arm.file, src);
  const armed = sha(arm.file);
  if (armed === before) throw new Error(`ARM ${arm.n}: THE ARM NEVER ARMED — bytes unchanged`);
  console.log(`\n=== ARM ${arm.n}: ${arm.what} ===`);
  console.log(`  armed: ${arm.file.split("/").pop()} ${before.slice(0, 12)} -> ${armed.slice(0, 12)}`);
  for (const key of arm.suites) {
    const r = runSuite(SUITES[key]);
    console.log(`  ${key.padEnd(11)} ${r.noFoot ? "NO FOOT — died before its tally" : `${r.pass}/${r.fail}`} (exit ${r.exit})`);
    for (const f of r.named.slice(0, 8)) console.log(`      FAIL ${f}`);
    if (r.named.length > 8) console.log(`      ... and ${r.named.length - 8} more`);
  }
  copyFileSync(pristine, arm.file);
  const restored = sha(arm.file);
  execFileSync("cmp", [pristine, arm.file]);
  unlinkSync(pristine);
  console.log(`  restored: sha256 ${restored === before ? "MATCHES" : "DIFFERS — STOP"} the pre-arm copy, and \`cmp\` agrees`);
  if (restored !== before) throw new Error(`ARM ${arm.n}: restore failed`);
}
console.log("\nall arms run, every file restored and verified by sha256 AND cmp");
