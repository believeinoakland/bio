/* d533partsaudit.control.mjs — the NEGATIVE CONTROL for `test/d533partsaudit.test.mjs` (D-533).
 * NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/d533partsaudit.control.mjs            every arm
 *   node test/d533partsaudit.control.mjs <arm>      one arm
 *
 * d179onehome.control.mjs's method exactly: each arm copies `src/`, `checks/` and `docprofile/` into a
 * uniquely-named temporary tree, patches the COPY (each anchor must occur EXACTLY ONCE — an arm that did not arm is a
 * finding), and runs the suite with D533_SRC pointed at it. The real `src/index.mjs` and `src/store.mjs` are hashed
 * before the first arm and after the last; the run fails loudly if either moved.
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
const SUITE = join(PLANE, "test", "d533partsaudit.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL (its accepts-when): head the WHOLE KEY ONLY. A parted row whose whole key misses goes straight
     to unbacked, as it did before this row, whatever the record names. */
  wholeonly: {
    patches: [["index.mjs", `if (named?.state !== "named") { unbacked.push(`, `if (true) { unbacked.push(`]],
    mustFail: ["THE ROW: a parted capture whose every named part", "and is NOT called unbacked",
               "and the record reads SOUND", "with nothing sampled",
               "counted OUTSIDE sound", "and never as unbacked", "and the held row beside it is still held in parts",
               "a part over the read bound", "naming the one part it could not verify", "and sound still speaks only",
               "with the checksum present both parts verify",
               "the row is MISMATCHED", "naming the part whose bytes disagree", "with the digest the bytes actually have",
               "the row is UNBACKED (the only one", "naming the missing part", "and saying how many of how many",
               "and the fully held rows are still held in parts"],
  },

  /* A PART'S DIGEST NOT VERIFIED: presence and size alone pass a part. §4's corrupted part is then "held". */
  nodigest: {
    patches: [["index.mjs", "else if (digest !== p.sha256) disagree.push(", "else if (false) disagree.push("]],
    mustFail: ["the row is MISMATCHED", "naming the part whose bytes disagree", "with the digest the bytes actually have",
               "and the record no longer reads sound", "the row is UNBACKED (the only one",
               "and the fully held rows are still held in parts"],
  },

  /* A MISSING PART IGNORED: an absent part is skipped rather than named. §5's row then reads held. */
  nopresence: {
    patches: [["index.mjs", "if (!h) { missing.push(name); continue; }", "if (!h) continue;"]],
    mustFail: ["the row is UNBACKED (the only one", "naming the missing part", "and saying how many of how many",
               "and the fully held rows are still held in parts"],
  },

  /* UNDETERMINED COUNTED INSIDE SOUND — what the ruling forbids. Only the two outside-sound pins may fail. */
  insidesound: {
    patches: [["index.mjs", "sound: unbacked.length === 0 && mismatched.length === 0, probed: canProbe,\n        detail: \"captured means",
               "sound: unbacked.length === 0 && mismatched.length === 0 && undetermined.length === 0, probed: canProbe,\n        detail: \"captured means"]],
    mustFail: ["counted OUTSIDE sound", "and sound still speaks only for the determined rows"],
  },

  /* OVER-STRICTNESS: the digest the record names read only in the one spelling acquire writes. §3's `sha256:`-prefixed,
     upper-case spelling of the same digest then reads as no digest, and the row is refused an answer it earns. */
  strictspelling: {
    patches: [["store.mjs", `const bare = (v) => typeof v === "string" ? v.trim().replace(/^sha256:/, "").toLowerCase() : null;\n    const doc =`,
               `const bare = (v) => typeof v === "string" ? v : null;\n    const doc =`]],
    mustFail: ["naming the one part it could not verify", "with the checksum present both parts verify",
               "and only §2's row is undetermined",
               /* DECLARATION CORRECTED after the first run (the arm was right, the declaration wrong): §3's row stays
                  undetermined to the end, so §5's count of fully held rows is 1, not 2, and that pin fails too. */
               "and the fully held rows are still held in parts"],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d533partsaudit-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D533_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d533partsaudit: (\d+) passed, (\d+) failed/.exec(out);
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
