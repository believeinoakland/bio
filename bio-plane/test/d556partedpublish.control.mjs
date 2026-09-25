/* d556partedpublish.control.mjs — the NEGATIVE CONTROL for `test/d556partedpublish.test.mjs` (D-556).
 * NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/d556partedpublish.control.mjs            every arm
 *   node test/d556partedpublish.control.mjs <arm>      one arm
 *
 * d533partsaudit.control.mjs's method exactly: each arm copies `src/`, `checks/` and `docprofile/` into a
 * uniquely-named temporary tree, patches the COPY (each anchor must occur EXACTLY ONCE — an arm that did not arm is a
 * finding), and runs the suite with D556_SRC pointed at it. The real `src/index.mjs`, `src/store.mjs` and
 * `src/gate.mjs` are hashed before the first arm and after the last; the run fails loudly if any moved.
 *
 * WHAT EACH ARM MUST FAIL (by label fragment) IS DECLARED BEFORE ARMING; every other assertion MUST stay green.
 * RESULTS: the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "d556partedpublish.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/gate.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const PUBLISHED_WHOLE = ["and publication reports its copy whole", "and publishes whole",
  "every part re-verified at the destination", "each part is served from the published store",
  "and the published parts reassemble to the WHOLE", "and they reassemble to the whole"];

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL (its accepts-when): DROP THE PART-COPY FROM PUBLICATION. The gate still admits both rows, and
     the store still commits them; the parts never reach the published bucket, and the re-verification must NAME
     them — the publish arm fails, never an ok copy. */
  nopartcopy: {
    patches: [["index.mjs", "else try { await env.PUBLISHED.put(key, obj.body, { sha256: s.sha256 }); } catch { continue; }",
               "else continue;"]],
    mustFail: PUBLISHED_WHOLE,
  },

  /* THE GATE AS D-530 LEFT IT: the parts the record names are never asked, so every whole-hash row held in parts is
     refused whatever the record says — PLANE_HELD_IN_PARTS on acquired bytes, PLANE_MISSING_BYTES on a caller's. */
  wholegate: {
    patches: [["index.mjs", `if (named?.state === "named") {`, `if (false) {`]],
    mustFail: ["the gate raises no plane finding", "THE ROW: the parted capture RATIFIES", ...PUBLISHED_WHOLE,
               "no plane finding, the digests' spelling", "the parted capture RATIFIES",
               "PLANE_PART_MISSING, and never PLANE_HELD_IN_PARTS", "naming the missing part", "and the sentence names it too",
               "the row is refused, on the plane finding ALONE", "the corrupt row is refused, on the plane finding ALONE",
               "PLANE_PART_UNVERIFIED", "naming the part whose digest failed"],
  },

  /* NO RE-VERIFICATION AT THE DESTINATION: the copy is reported on its own word. Only the verified-count pins fail;
     the bytes are there, which is exactly why a copy that is never re-read cannot be told from one that is. */
  nodestverify: {
    patches: [["index.mjs", `if (partShas.length && r2state !== "not configured") {`, `if (false) {`]],
    mustFail: ["every part re-verified at the destination"],
  },

  /* A MISSING PART NOT NAMED BY THE GATE: §3's row, whose remaining part is present and whose named sizes sum to the
     register's, is then ADMITTED — a row ratified over a part the record does not hold. */
  nomissingname: {
    patches: [["gate.mjs", "else if (missing.length)\n", "else if (false)\n"]],
    mustFail: ["the row is refused, on the plane finding ALONE", "PLANE_PART_MISSING, and never PLANE_HELD_IN_PARTS", "naming the missing part",
               "and the sentence names it too"],
  },

  /* OVER-STRICTNESS: the digest the record names read only in the one spelling acquire writes. §2's `sha256:`-prefixed,
     upper-case spelling of the same digests then reads as no digest, and a row that earns ratification is refused. */
  strictspelling: {
    patches: [["store.mjs", `const bare = (v) => typeof v === "string" ? v.trim().replace(/^sha256:/, "").toLowerCase() : null;\n    const doc =`,
               `const bare = (v) => typeof v === "string" ? v : null;\n    const doc =`]],
    mustFail: ["no plane finding, the digests' spelling", "the parted capture RATIFIES", "and publishes whole",
               "every part re-verified at the destination", "each part is served from the published store",
               "and they reassemble to the whole"],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d556partedpublish-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D556_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d556partedpublish: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", exit: r.status, missing, unexpected,
             firstFail: failed[0] ?? null, asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
const results = names.map(run);
for (const r of results) console.log(JSON.stringify(r));
const after = REAL.map(digest);
console.log(`real sources before: ${before.join(" · ")}`);
console.log(`real sources after:  ${after.join(" · ")}`);
const untouched = before.every((d, i) => d === after[i]);
console.log(`untouched: ${untouched ? "YES" : "NO — A REAL SOURCE MOVED"}`);
process.exit(untouched && results.every((r) => r.armed && r.asDeclared) ? 0 : 1);
