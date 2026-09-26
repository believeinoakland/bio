/* rec180-promote-rollback.control.mjs — REC-180's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/rec180-promote-rollback.test.mjs` against each (REC180_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/rec180-promote-rollback.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what it
 * MUST fail and MUST NOT fail is declared below, before it runs. Output is captured to a FILE (D-282: a pipe loses a
 * suite's tail at process.exit), and the tally is read from the suite's own foot line; a missing foot reads -1.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "rec180-promote-rollback.test.mjs");
const REAL = ["src/store.mjs", "src/index.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const GATE = "        if (out && out.ok === false) { refused = out; throw Store.#ROLLBACK; }";
const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ["NAME_TAKEN after the mint: minted_ids", "and it is listed"] },
  /* THE ROW'S CONTROL: the refusal is RETURNED from the callback instead of thrown, which is the pre-fix behaviour. */
  "return-not-throw": {
    patches: [[GATE, "        if (out && out.ok === false) { refused = out; return out; }"]],
    mustFail: ["NAME_TAKEN after the mint: minted_ids is BYTE-IDENTICAL", "NO_TITLE after the mint: minted_ids and seq"],
    mustPass: ["NAME_TAKEN after the mint: seq is BYTE-IDENTICAL", "is refused NAME_TAKEN through op=promote",
               "and the refusal's own words are unchanged", "is refused NO_TITLE through op=promote", "COMMITS", "and it is listed", "gained EXACTLY ONE row"] },
  /* OVER-STRICTNESS: every answer rolls back, ok or not — the refusal arms go green for free, so the landing arms must fail. */
  "rollback-all": {
    patches: [[GATE, "        if (out) { refused = out; throw Store.#ROLLBACK; }"]],
    mustFail: ["the ledger is NOT empty", "and it is listed", "gained EXACTLY ONE row"],
    mustPass: ["the Durable Object's SQLite file is where its id names it"] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec180-control-${name}-`));
  cpSync(join(PLANE, "src"), join(root, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
  cpSync(join(REPO, "jurisdictions"), join(root, "jurisdictions"), { recursive: true });
  const storePath = join(root, "bio-plane", "src", "store.mjs");
  let s = readFileSync(storePath, "utf8");
  const counts = arm.patches.map(([from]) => s.split(from).length - 1);
  for (const [from, to] of arm.patches) s = s.replace(from, () => to);
  writeFileSync(storePath, s);
  const log = join(root, "suite.log"), fd = openSync(log, "w");
  const r = spawnSync(process.execPath, [SUITE], { cwd: PLANE, stdio: ["ignore", fd, fd],
    env: { ...process.env, REC180_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/rec180-promote-rollback: (\d+) passed, (\d+) failed/);
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
