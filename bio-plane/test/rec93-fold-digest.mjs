/* REC-93 — THE FOLD'S BYTE-IDENTITY INSTRUMENT. NOT A SUITE (no `.test.mjs`
 * suffix, so the battery does not collect it), because its whole job is to boot
 * a plane FROM A DIFFERENT CHECKOUT and that cannot be done from inside a suite
 * that must run on any tree.
 *
 * WHAT IT ANSWERS, AND WHY A SELF-CONSISTENT DIGEST WOULD NOT HAVE.
 * `OBSERVATION-LOG-DESIGN.md` §4.4 promises that `op=airunlog` *"reads through
 * the (authority_kind, authority, seq) index and answers in its existing
 * envelope, so I3 does not change shape"*, and REC-93's accepts-when demands
 * that it answer BYTE-IDENTICALLY to the pre-item answer. A digest this item
 * computed and then pinned against itself proves only that the answer stopped
 * moving AFTER the change — it cannot see a value the fold silently altered,
 * which is exactly the failure mode here: `seq` is store-wide in the new table
 * and was 1,2,3… per run in the old one, so an unchanged ENVELOPE could carry
 * changed NUMBERS and no schema check would notice.
 *
 * So this drives the IDENTICAL fixture through BOTH BUILDS and compares the raw
 * JSON text. Pass the pre-item checkout's root as argv[2]:
 *
 *     node test/rec93-fold-digest.mjs /path/to/pristine/worktree
 *
 * With no argument it runs the CURRENT build alone and prints its digest, which
 * is the form the suite's pin re-checks on every battery run.
 *
 * WHAT IT CANNOT SEE, stated rather than left to be discovered: it compares ONE
 * fixture's answer. A divergence that needs a shape this fixture does not write
 * — a truncated page, a run with no rows, a viewer-withheld run — is outside it,
 * and those are covered by assertions in `observation-log.test.mjs` rather than
 * here. It also cannot see a difference in how the two builds REFUSE, because a
 * refused append writes nothing for this read to return.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

const TOK = "mem-rec93";
const BUNDLE = "INQ-2026-0914-observation-fold";
const RUN = "RUN-2026-0914-fold";
const SHA_A = "a".repeat(64);
const T0 = "2026-09-14T09:00:00Z";
const at = (plus) => new Date(Date.parse(T0) + plus).toISOString().split(".")[0] + "Z";

/* THE FIXTURE IS A CONSTANT OF THIS FILE AND IS WRITTEN ONCE, so the two builds
   cannot be handed subtly different input — which is the way a before/after
   comparison most easily agrees for free. */
const LOG_ENTRIES = [
  { level: "meaning", subject: "observation:fold-finding", state: "NEVER_LOOKED",
    detail: "nothing has been derived here, which may only mean nothing was extracted" },
  { level: "document", subject: "observation:budget-2026", state: "PRESENT",
    detail: "the store holds the adopted 2026 budget" },
  { level: "internet", subject: "observation:controller-portal", state: "LOOKED_INDETERMINATE",
    governed: true, condition: "governor-holding-host",
    detail: "our own pacing held the controller portal" },
  { level: "document", subject: "observation:gone-page", state: "LOOKED_ABSENT",
    detail: "the page is positively gone, 404 from the origin" },
  { level: "content", subject: "observation:partial-read", state: "partial",
    detail: "tier 1 produced text over part of the document only" },
];

async function answerFrom(root) {
  const idx = join(root, "bio-plane/src/index.mjs");
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-rec93", MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
  });
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  try {
    await POST(`op=promote&token=${TOK}`, {
      bundleId: BUNDLE, base: null, snapKey: "20260914T090000Z_inbox", author: "ruth",
      meta: { object_type: "inquiry", group: "believe-in-oakland",
              title: "Does the fold read through?", current_state: "open",
              created: T0, last_updated: T0 },
      files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nDoes the fold read through?\n`,
                bytes: 90, sha256: SHA_A }],
      register: [],
    });
    const started = await POST(`op=airunopen&token=${TOK}`, {
      run: RUN, contextType: "inquiry", contextId: BUNDLE,
      label: "the fold's own fixture", mode: "check",
      principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }],
      leaseMs: 600000, at: T0,
    });
    if (started?.started !== true)
      throw new Error(`airunopen refused in ${root}: ${JSON.stringify(started)}`);
    const ticked = await POST(`op=airuntick&token=${TOK}`, {
      run: RUN, at: at(5000), leaseMs: 600000,
      consume: { fetches: 3 }, log: LOG_ENTRIES,
    });
    if (!ticked || ticked.appended !== LOG_ENTRIES.length)
      throw new Error(`the fixture did not append all ${LOG_ENTRIES.length} entries in ${root}: `
                    + JSON.stringify(ticked));
    const raw = await (await mf.dispatchFetch(
      `http://x/api/?op=airunlog&token=${TOK}&run=${RUN}`)).text();
    return raw;
  } finally { await mf.dispose(); }
}

const sha = (v) => createHash("sha256").update(v).digest("hex");
const here = fileURLToPath(new URL("../..", import.meta.url));
const other = process.argv[2] || null;

const mine = await answerFrom(here);
console.log(`CURRENT  ${here}`);
console.log(`  bytes  ${Buffer.byteLength(mine)}`);
console.log(`  sha256 ${sha(mine)}`);
/* A non-empty guard, because a digest over an empty or refused answer agrees
   with another empty one for free — e3b0c442… has been measured in this
   repository twice as a "byte-identical" result over nothing. */
const parsed = JSON.parse(mine);
const entries = (parsed.result || parsed).entries || [];
console.log(`  entries ${entries.length}  seqs ${JSON.stringify(entries.map((e) => e.seq))}`);
if (entries.length !== LOG_ENTRIES.length) {
  console.log(`\nFAIL: the answer carries ${entries.length} entries, not ${LOG_ENTRIES.length}. `
            + `A comparison over a short answer is not a comparison.`);
  process.exit(1);
}

if (!other) {
  console.log("\nNo comparison checkout given; current build measured alone.");
  process.exit(0);
}

const theirs = await answerFrom(other);
console.log(`\nCOMPARISON  ${other}`);
console.log(`  bytes  ${Buffer.byteLength(theirs)}`);
console.log(`  sha256 ${sha(theirs)}`);

if (mine === theirs) {
  console.log(`\nIDENTICAL — op=airunlog answers byte-for-byte the same before and after the fold.`);
  process.exit(0);
}
console.log(`\nDIFFERENT. The two answers are not byte-identical.`);
/* Print the FIRST divergence rather than two blobs: a diff nobody can read is a
   result nobody acts on. */
let i = 0;
while (i < mine.length && i < theirs.length && mine[i] === theirs[i]) i++;
console.log(`  first divergence at byte ${i}`);
console.log(`  current : ${JSON.stringify(mine.slice(Math.max(0, i - 60), i + 90))}`);
console.log(`  pre-item: ${JSON.stringify(theirs.slice(Math.max(0, i - 60), i + 90))}`);
process.exit(1);
