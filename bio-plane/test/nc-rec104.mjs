/* REC-104's NEGATIVE CONTROL HARNESS. Declared in `test/content-chain-kind.test.mjs`
 * and `test/content-arm.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/nc-rec104.mjs             # every arm, in order, baseline first
 *     node test/nc-rec104.mjs firststep   # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec90.mjs`'s shape, and a deliberate COPY rather than an
 * import — a control harness that shares machinery with another item's harness
 * shares that harness's defects.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing, and it is RUN TWICE: the second run is
 *     the A/A arm for the answer digest (below), without which a digest that
 *     moved between two arms could be a digest that moves between any two runs.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count; a count that
 *     is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy by
 *     sha256 AND by CONTENT, with a byte count printed and a minimum guarded.
 *     `git checkout --` is never used.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * THE OVER-STRICTNESS ARM IS `preitem`, and it is the one this item's row asks for
 * by name: "every `content:` query answers byte-identically to its pre-item answer
 * on the committed fixture". `content-arm.test.mjs` §11 prints a sha256 over the
 * answers of every `content:` query it asks. `preitem` swaps in the three plane
 * sources exactly as they stood at the commit this item was built on (read with
 * `git show`, never typed) and runs the SAME suite: its section-11 digest must
 * EQUAL the baseline's, while the sections that assert the column exists must
 * FAIL — the pre-item tree has no column, and a `preitem` run that stayed green
 * would mean the suite cannot tell the two trees apart.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory, never in the
   shared scratchpad, which is NOT isolated between sessions. */
const SAFE = join(REPO, ".rec104-control-pristine");
mkdirSync(SAFE, { recursive: true });

/* THE COMMIT THIS ITEM WAS BUILT ON. Pinned, never `origin/main`: a moving ref
   would make `preitem` measure whatever landed since, and the digest comparison
   would stop being about this item. */
const PRE_ITEM = "92f4c64e009aef1ce5e466eee5332a47fa06b8a1";

const STORE = join(PLANE, "src/store.mjs");
const QUERY = join(PLANE, "src/query.mjs");
const SCHEMA = join(PLANE, "src/schema.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

/* Each suite captured to a FILE-equivalent buffer, not a pipe — D-282. A MISSING
   tally is reported as -1 and never as 0: the suite did not reach its own FOOT. */
const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const d = /REPORT content-answers sha256 ([0-9a-f]{64}) over (\d+) queries/.exec(out);
  return { file, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           digest: d ? d[1] : null, queries: d ? +d[2] : 0,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};
const SUITES = ["test/content-arm.test.mjs", "test/content-chain-kind.test.mjs"];

function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes arms-broken from arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  baseline2: {
    files: [], why: "nothing armed, AGAIN — the A/A arm: the answer digest must be identical across "
       + "two untouched runs, or a digest that differs under `preitem` proves nothing",
    mustFail: [], mustPass: "everything, and the SAME digest as `baseline`",
    patch: () => ({ armed: true, matches: 0 }),
  },
  firststep: {
    files: [SCHEMA],
    why: "THE COLUMN MADE UNTRUE OF THE CHAIN IT DESCRIBES — the row's own arm. It is a generated "
       + "column, so it cannot be left behind by a writer; the only way to make it disagree with "
       + "`chain` is to make it describe something else. Here it reads the chain's FIRST step. "
       + "A query must then return a row whose chain no longer matches, and the suite must say so "
       + "BY NAME — the arm that proves the column is not merely faster but still TRUE",
    mustFail: ["`content:ocr` names the OCR'd document and not the text-layer one",
               "`chain_last` agrees with the LAST STEP of the chain `op=content` reads, row for row",
               "the rows the store ALREADY HELD carry their last step"],
    mustPass: "`content:layer` on the fixture — a one-step chain's first step IS its last, so an arm "
            + "that took that down too would be breaking something other than the column's meaning",
    patch: () => arm(SCHEMA, `json_extract(chain, '$[#-1].step')) VIRTUAL`, `json_extract(chain, '$[0].step')) VIRTUAL`),
  },
  nowriter: {
    files: [SCHEMA],
    why: "A PLAIN COLUMN WITH NO WRITER — the implementation this item did NOT choose, and the stale "
       + "state it would reach the day a mint path forgot it. Every row reads NULL; the fixture's "
       + "chain filters must fail by name and the engine-guarantee section must fail, because a "
       + "plain column ACCEPTS the write a generated one refuses",
    mustFail: ["`content:ocr` names the OCR'd document and not the text-layer one",
               "`content:layer` filters on the chain's LAST STEP",
               "an INSERT that NAMES chain_kind is refused by the engine itself"],
    mustPass: "`content:chain=undetermined` — it reads `chain IS NULL`, not the column, and must stay "
            + "green; that is what shows undetermined was kept on the question it always asked",
    patch: () => arm(SCHEMA, `chain_kind     TEXT GENERATED ALWAYS AS (json_extract(chain, '$[#-1].step')) VIRTUAL`,
                             `chain_kind     TEXT`),
  },
  parseback: {
    files: [QUERY],
    why: "THE PARSE KEPT BESIDE THE COLUMN. `chain_last` goes back to parsing the blob while the filter "
       + "reads the column — two answers to one question, the mirror-and-drift class the row forbids. "
       + "Behaviourally INVISIBLE on a correct tree (both agree), so only the structural pin can see it",
    mustFail: ["query.mjs holds NO json_extract over the chain column anywhere in its code",
               "the rows=content projection reads `chain_last` off the column too"],
    mustPass: "every behavioural assertion in both suites — they agree for free when both answers are "
            + "right, which is exactly why the structural pin exists",
    patch: () => arm(QUERY, "chain_last: `m.chain_kind`,", "chain_last: `json_extract(m.chain, '$[#-1].step')`,"),
  },
  nomigrate: {
    files: [STORE],
    why: "THE MIGRATION DISABLED. A store created before this item keeps its old table; the schema's "
       + "CREATE INDEX on the column then fails inside blockConcurrencyWhile, which does not fail a "
       + "request politely — it bricks the Durable Object. The migration section must fail by name",
    mustFail: ["the reboot ADDS the column to the existing table",
               "THROUGH THE OP: `content:ocr` names the legacy OCR'd document"],
    mustPass: "`content-arm.test.mjs` entire — a fresh store gets the column from CREATE TABLE and never "
            + "needs the migration, so an arm that took that suite down would be breaking the schema",
    patch: () => arm(STORE, `if (have.length && !have.includes("chain_kind"))`, `if (false && have.length && !have.includes("chain_kind"))`),
  },
  xinfo: {
    files: [STORE],
    why: "THE MIGRATION READS table_info INSTEAD OF table_xinfo — the spelling every other additive "
       + "migration in #migrate uses, and the wrong one here: a generated column is HIDDEN from "
       + "table_info, so the guard never sees the column it added and re-ALTERs on EVERY boot",
    mustFail: ["a SECOND boot does not re-add it"],
    mustPass: "the FIRST boot's assertions — the first migration succeeds either way, which is why this "
            + "defect would ship green from any suite that booted once",
    patch: () => arm(STORE, "PRAGMA table_xinfo(content)", "PRAGMA table_info(content)"),
  },
  preitem: {
    files: [QUERY, SCHEMA, STORE],
    why: "OVER-STRICTNESS: the three plane sources exactly as they stood at the commit this item was "
       + "built on. The `content-arm.test.mjs` §11 digest must EQUAL the baseline's — the column "
       + "changes how the question is answered and never which rows answer it",
    mustFail: ["the `chain` sub-field reads the COLUMN"],
    mustPass: "the section-11 answer digest, byte-identical to `baseline`'s",
    digestMustMatch: true,
    patch: () => {
      for (const f of [QUERY, SCHEMA, STORE])
        writeFileSync(f, execFileSync("git", ["show", `${PRE_ITEM}:bio-plane/src/${f.split("/").pop()}`],
          { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }));
      return { armed: true, matches: 3 };
    },
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0, baseDigest = null;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed) { console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`); finding++; }
  const results = SUITES.map(runSuite);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && same ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && same)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  let fails = 0;
  const failing = [];
  for (const r of results) {
    console.log(`  RESULT     ${r.file}: ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`
              + (r.digest ? `  digest ${r.digest.slice(0, 16)}… over ${r.queries} queries` : ""));
    for (const l of r.failing) console.log(`             ${l}`);
    fails += Math.max(r.fail, 0) + (r.pass < 0 ? 1 : 0);
    failing.push(...r.failing);
  }
  const digest = results[0].digest;
  if (name === "baseline") baseDigest = digest;
  let ok;
  if (name === "baseline" || name === "baseline2") {
    ok = fails === 0 && results.every((r) => r.pass > 0) && !!digest
      && (name === "baseline" || !baseDigest || digest === baseDigest);
    if (name === "baseline2" && baseDigest) console.log(`  A/A        digest ${digest === baseDigest ? "IDENTICAL" : "DIFFERENT"} across two untouched runs`);
  } else {
    const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
    ok = fails > 0 && hit.length === a.mustFail.length;
    for (const m of a.mustFail.filter((x) => !failing.some((l) => l.includes(x))))
      console.log(`  MISSING    declared failure did NOT occur: ${m}`);
    if (a.digestMustMatch) {
      const same = !!digest && digest === baseDigest;
      console.log(`  DIGEST     pre-item ${digest ? digest.slice(0, 16) + "…" : "(none printed)"} vs baseline ${baseDigest ? baseDigest.slice(0, 16) + "…" : "(not run — run the harness whole)"}: ${same ? "IDENTICAL" : "DIFFERENT"}`);
      ok = ok && same;
    }
  }
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  if (!ok) finding++;
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
