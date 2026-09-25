/* d707-promote-request-fields.control.mjs — D-707's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d707-promote-request-fields.test.mjs` against each (D707_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d707-promote-request-fields.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what
 * it MUST fail and MUST NOT fail is declared below, before it runs. Output goes to a FILE (D-282), the tally is read
 * from the suite's own foot line, and a missing foot reads -1. D-628's driver is the model, verbatim below `run`.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d707-promote-request-fields.test.mjs");
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const SNAP = 'if (!((typeof snapKey === "string" && snapKey.trim() !== "") || (typeof snapKey === "number" && Number.isFinite(snapKey)))) {';
const PATH = "    if (pathless.length) {";
const CONTENT = "    if (empty.length) {";
const BYTES = "!(Number.isInteger(f.bytes) && f.bytes >= 0)";

const SNAP_C = ["CREATION with no snapKey at all is REFUSED", "CREATION with a null snapKey is REFUSED",
                "CREATION with a blank snapKey is REFUSED", "CREATION with an object snapKey is REFUSED",
                "REVISION with no snapKey at all is REFUSED", "failing all three is answered by the snap key first"];
const PATH_C = ["CREATION with a file with no path is REFUSED", "CREATION with a file with a blank path is REFUSED",
                "CREATION with a file whose path is a number is REFUSED", "CREATION with a null files entry is REFUSED",
                "CREATION with a string files entry is REFUSED", "SEVERAL pathless entries names every one",
                "REVISION with a file with no path is REFUSED", "REVISION with a null files entry is REFUSED"];
const CONTENT_C = ["CREATION with a file with neither text nor a blobSha is REFUSED",
                   "CREATION with a file whose text is a number is REFUSED",
                   "REVISION with a file with neither text nor a blobSha is REFUSED", "bundle.md text is a NUMBER"];
const BYTES_C = ["CREATION with a blob file with no bytes is REFUSED", "CREATION with a blob file with negative bytes is REFUSED",
                 "CREATION with a blob file with fractional bytes is REFUSED",
                 "CREATION with a blob file whose bytes is a string is REFUSED", "REVISION with a blob file with no bytes is REFUSED"];
const OVER = ["a NUMBER snapKey still lands", "blobs of 0 bytes and of 1,048,577 bytes", "inline file of EMPTY text lands",
              "BOTH text and a blobSha is inline", "a well-formed one still lands on the unmoved head"];
const STACK = "carries a raw error with a stack";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [...SNAP_C, ...PATH_C, ...CONTENT_C, ...BYTES_C, ...OVER, STACK] },

  /* THE ROW'S CONTROLS, one per refusal, EACH ALONE: drop it, and its arms read the raw NOT NULL stack (or, for a
     non-object entry, a TypeError / the next fence's code), failing BY NAME; the other three refusals stay green. */
  "no-snap-refusal": { patches: [[SNAP, "if (false) {"]],
    mustFail: [...SNAP_C.slice(0, 5), STACK], mustPass: [...PATH_C, ...CONTENT_C, ...BYTES_C, ...OVER] },
  "no-path-refusal": { patches: [[PATH, "    if (false) {"]],
    mustFail: [...PATH_C, STACK], mustPass: [...SNAP_C, ...CONTENT_C, ...BYTES_C, ...OVER] },
  "no-content-refusal": { patches: [[CONTENT, "    if (false) {"]],
    mustFail: [...CONTENT_C, STACK], mustPass: [...SNAP_C, ...PATH_C.slice(0, 4), ...BYTES_C, ...OVER] },
  "no-bytes-refusal": { patches: [[BYTES, "f.bytes === undefined && false"]],
    mustFail: [...BYTES_C, STACK], mustPass: [...SNAP_C, ...PATH_C, ...CONTENT_C, ...OVER] },

  /* OVER-STRICT arms — the fence tighter than its rule must FAIL the over-strictness lines that guard it. */
  "strict-snap-no-number": { patches: [[SNAP, 'if (!(typeof snapKey === "string" && snapKey.trim() !== "")) {']],
    mustFail: ["a NUMBER snapKey still lands"], mustPass: [...SNAP_C, ...PATH_C, ...CONTENT_C, ...BYTES_C, STACK] },
  "strict-bytes-positive": { patches: [[BYTES, "!(Number.isInteger(f.bytes) && f.bytes > 0)"]],
    mustFail: ["blobs of 0 bytes and of 1,048,577 bytes"], mustPass: [...SNAP_C, ...PATH_C, ...CONTENT_C, ...BYTES_C, STACK] },

  /* OVER-STRICTNESS: the same rule in a spelling this item did not anticipate — everything stays green. */
  spelling: {
    patches: [[SNAP, 'if (!((typeof snapKey === "string" && /\\S/.test(snapKey)) || (typeof snapKey === "number" && isFinite(snapKey)))) {'],
              [BYTES, "!(Number.isSafeInteger(f.bytes) && !(f.bytes < 0))"]],
    mustFail: [], mustPass: [...SNAP_C, ...PATH_C, ...CONTENT_C, ...BYTES_C, ...OVER, STACK] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d707-control-${name}-`));
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  const storePath = join(root, "bio-plane", "src", "store.mjs");
  let s = readFileSync(storePath, "utf8");
  const counts = arm.patches.map(([from]) => s.split(from).length - 1);
  for (const [from, to] of arm.patches) s = s.replace(from, () => to);
  writeFileSync(storePath, s);
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, D707_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d707-promote-request-fields: (\d+) passed, (\d+) failed/);
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const passed = [...out.matchAll(/^  PASS  (.*)$/gm)].map((m) => m[1]);
  const armed = counts.every((c) => c === 1);
  const asDeclared = armed && !!foot
    && arm.mustFail.every((l) => failed.some((f) => f.includes(l)))
    && arm.mustPass.every((l) => passed.some((p) => p.includes(l)))
    && (name !== "baseline" || (r.status === 0 && failed.length === 0));
  console.log(`\n=== ${name}: anchors ${JSON.stringify(counts)}${armed ? "" : " — DID NOT ARM"} · exit ${r.status} · `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT (-1)"} · ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
  for (const f of failed) console.log(`    FAIL  ${f}`);
  return asDeclared;
};

const before = digest();
console.log("real sources before:\n  " + before.join("\n  "));
const names = process.argv[2] ? [process.argv[2]] : Object.keys(ARMS);
const results = names.map((n) => [n, run(n)]);
const after = digest();
const untouched = JSON.stringify(before) === JSON.stringify(after);
console.log(`\nreal sources after: ${untouched ? "UNCHANGED" : "CHANGED:\n  " + after.join("\n  ")}`);
const ok = untouched && results.every(([, v]) => v);
console.log(`${results.filter(([, v]) => v).length}/${results.length} arms AS DECLARED`);
process.exit(ok ? 0 : 1);
