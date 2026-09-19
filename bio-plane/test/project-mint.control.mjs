/* project-mint.control.mjs — the NEGATIVE CONTROL for `test/project-mint.test.mjs` (REC-141 / D-428's
 * creation half / IC-158). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/project-mint.control.mjs            every arm
 *   node test/project-mint.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source: `project-disclosure.control.mjs`'s method. Each arm
 * copies `src/` into a uniquely-named temporary tree, applies its patch there (asserting each anchor
 * occurs EXACTLY ONCE — an arm that did not arm is a finding, not a pass), and runs the suite with
 * PROJECT_MINT_SRC pointed at the copy. The real `src/index.mjs` and `src/store.mjs` are hashed (sha256
 * and byte length) before the first arm and after the last; the run fails if either moved.
 *
 * EACH ARM BREAKS ONE THING, and what it MUST fail (by label fragment) is DECLARED BEFORE ARMING; every
 * other assertion MUST stay green. The row's two controls are `accept-supplied-id` and `hash-before-id`.
 *
 * RESULTS: see the header of `test/project-mint.test.mjs` and IC-158.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "project-mint.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL 1: accept a supplied id again — the refusal removed and the caller's id USED when
     given. A hidden project's id then answers EXISTS and a free one is created: the refusal and
     byte-identity arms of §1 go red, and the never-minted id is left holding a bundle. */
  "accept-supplied-id": {
    patches: [["store.mjs", "      if (idSupplied)\n", "      if (false)\n"],
              ["store.mjs", "        bundleId = this.#mintProjectId(meta.title);", "        bundleId = bundleId || this.#mintProjectId(meta.title);"]],
    mustFail: ["vera naming the HIDDEN project's id", "vera naming a NEVER-MINTED id", "BYTE-IDENTICAL: the hidden id",
               "nothing was created at the never-minted id", "a creation of ANOTHER type", "BYTE-IDENTICAL for the other type",
               "the project's owner is refused", "the refusal carries the check"],
  },

  /* THE ROW'S CONTROL 2: hash BEFORE writing `id:` — the caller's own sha (of the id-less text) and byte
     count are registered over the id-bearing text. The returned sha is then not the sha of the bytes. */
  "hash-before-id": {
    patches: [["store.mjs", "        const written = { ...projectMd, text, bytes: bytes.length, sha256: createSha256().update(bytes).hex() };",
               "        const written = { ...projectMd, text };"]],
    mustFail: ["THE SHA RETURNED IS THE SHA", "and it is not the caller's own", "the fork's returned sha"],
  },

  /* The fork's refusal removed: a named newId is then IGNORED (the plane still mints), which is the
     "silently ignored" the ruling forbids. The fork's refusal arms must go red. */
  "fork-ignores-newid": {
    patches: [["store.mjs", "    if (newId !== undefined && newId !== null && newId !== \"\") {", "    if (false) {"]],
    mustFail: ["a fork naming a TAKEN newId", "a fork naming a NEVER-MINTED newId", "BYTE-IDENTICAL: the two",
               "the fork refusal's check is C-59.3"],
  },

  /* BOB #16's CONTROL (CONDUCT #6, 2026-09-19): the COUNTER RESTORED — the suffix taken from allocId's PROJ
     sequence again, as REC-141 first built it. §6's count arms must fail by name, and nothing else. */
  /* CORRECTED 2026-09-19 (REC-151): the draw moved into the one opaque minter `#mintOpaqueId`, so the arm now
     replaces `#mintProjectId`'s call of it with the counter; §6's first arm (op=allocid refuses PROJ) is a
     different defence and MUST stay green. */
  "counter-restored": {
    patches: [["store.mjs", "    return this.#mintOpaqueId(\"PROJ\", year, `-${slug}`,",
               "    return (() => `${this.#nextSeq(\"PROJ\", year).id}-${slug}`)("]],
    mustFail: ["NO COUNT: and the PROJ mint takes its suffix from the one opaque minter",
               "NO COUNT: five consecutive mints do NOT differ by one"],
  },

  /* AN OVER-STRICT FENCE: refuse any document whose TEXT has a line reading `id:` anywhere (a body line,
     a nested key) instead of the frontmatter's own top-level key. The over-strictness arms must catch it. */
  "id-anywhere": {
    patches: [["store.mjs", "      if (Object.prototype.hasOwnProperty.call(fmNew, \"id\"))",
               "      if (/(^|\\n)\\s*id:/.test(projectMd.text))"]],
    mustFail: ["OVER-STRICTNESS", "and the minted id is written beside them"],
  },

  /* THE SUITE'S OWN OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate (the parsed
     key read as `!== undefined`). Correct work — nothing may fail. */
  "id-key-other-spelling": {
    patches: [["store.mjs", "      if (Object.prototype.hasOwnProperty.call(fmNew, \"id\"))",
               "      if (fmNew.id !== undefined)"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-mint-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, PROJECT_MINT_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /project-mint: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
