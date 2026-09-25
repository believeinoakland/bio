/* d578-typeless-revision.control.mjs — D-578's NEGATIVE CONTROL, deliberately NOT a `.test.mjs`: it builds ARMED
 * COPIES of `src/` and runs `test/d578-typeless-revision.test.mjs` against each (D578_SRC), so the battery must not
 * discover it. The real sources are never edited; they are hashed before and after and must be unchanged.
 *
 *   node test/d578-typeless-revision.control.mjs [arm]      from bio-plane/
 *
 * Each arm's anchor must occur EXACTLY ONCE in the copy (an arm that did not arm is a finding, not a pass), and what
 * it MUST fail and MUST NOT fail is declared below, before it runs. Output goes to a FILE (D-282), the tally is read
 * from the suite's own foot line, and a missing foot reads -1. D-510's driver is the model.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, openSync, closeSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = dirname(PLANE.replace(/\/$/, ""));
const SUITE = join(PLANE, "test", "d578-typeless-revision.test.mjs");
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((p) => join(PLANE, p));
const digest = () => REAL.map((p) => { const b = readFileSync(p); return `${p.slice(PLANE.length)} ${b.length} B ${createHash("sha256").update(b).digest("hex")}`; });

const CARRY = "      if (cur && promotedType === undefined) {";
const REFUSE = "      if (!cur && promotedType === undefined) {";
const SAYS = "        ...(typeCarried ? { type_carried: { object_type: typeCarried, from: \"head\",";
const FALLBACK = "    let promotedType = documentType ?? envelopeType ?? undefined;";

const ROW = ["a TYPELESS REVISION LANDS", "SAYS the type was carried", "still typed `action`, at the NEW bytes",
             "typeless inquiry revision"];
const CREATE = ["typeless CREATION is REFUSED by name", "catalogue's check and its canned translation",
                "its detail says nothing was written", "envelope type is BLANK is refused"];
const OVER = ["DOCUMENT states `action` (envelope silent)", "stating `action` in both", "envelope stating `action` lands",
              "ENVELOPE alone states the type still lands"];

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [...ROW, ...CREATE, ...OVER, "carries a raw error with a stack"] },

  /* THE ROW'S CONTROL: drop the carry-forward. The typeless revision reaches the INSERT with no type and reads the raw
     NOT NULL error; the creation arms and every over-strictness arm must stay green. */
  "no-carry": {
    patches: [[CARRY, "      if (false && cur && promotedType === undefined) {"]],
    mustFail: [...ROW, "carries a raw error with a stack"],
    mustPass: [...CREATE, ...OVER, "NOTHING is held"] },

  /* The creation half: drop the named refusal, and a typeless creation reads the raw error again (and a blank-typed
     one still reaches the INSERT with no type, so it too throws). Nothing lands either way (REC-180's rollback). */
  "no-creation-refusal": {
    patches: [[REFUSE, "      if (false && !cur && promotedType === undefined) {"]],
    mustFail: [...CREATE, "carries a raw error with a stack"],
    mustPass: [...ROW, ...OVER, "NOTHING is held"] },

  /* SILENT CARRY: the type is carried and the answer does not say so. Only the arms that read `type_carried` fail. */
  "silent-carry": {
    patches: [[SAYS, "        ...(false ? { type_carried: { object_type: typeCarried, from: \"head\","]],
    mustFail: ["SAYS the type was carried", "typeless inquiry revision"],
    mustPass: ["a TYPELESS REVISION LANDS", "still typed `action`, at the NEW bytes", ...CREATE, ...OVER,
               "carries a raw error with a stack"] },

  /* D-526's OLD FALLBACK: `normalizeType(meta.object_type)` takes a blank envelope as a type. The blank-typed creation
     LANDS typed '  ' and the blank-typed inquiry revision meets C-86.2; the silent-envelope arms are unaffected. */
  "raw-fallback": {
    patches: [[FALLBACK, "    let promotedType = documentType ?? (meta && typeof meta === \"object\" ? normalizeType(meta.object_type) : undefined);"]],
    mustFail: ["typeless inquiry revision", "envelope type is BLANK is refused"],
    mustPass: ["a TYPELESS REVISION LANDS", "SAYS the type was carried", "typeless CREATION is REFUSED by name",
               ...OVER, "carries a raw error with a stack"] },

  /* OVER-STRICTNESS: the same rule in a spelling this item did not anticipate — everything stays green. */
  spelling: {
    patches: [[CARRY, "      if (cur != null && promotedType == null) {"],
              [REFUSE, "      if (cur == null && typeof promotedType !== \"string\") {"]],
    mustFail: [],
    mustPass: [...ROW, ...CREATE, ...OVER, "carries a raw error with a stack"] },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d578-control-${name}-`));
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
    env: { ...process.env, D578_SRC: join(root, "bio-plane", "src") } });
  closeSync(fd);
  const out = readFileSync(log, "utf8");
  rmSync(root, { recursive: true, force: true });
  const foot = out.match(/d578-typeless-revision: (\d+) passed, (\d+) failed/);
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
