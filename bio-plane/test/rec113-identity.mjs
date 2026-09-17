/* REC-113 / IC-116 — THE ADDITIVE-CHANGE INSTRUMENT. NOT A SUITE (no
 * `.test.mjs` suffix, so the battery does not collect it), for the same reason
 * `rec93-fold-digest.mjs` is not one: its job is to boot a plane FROM A
 * DIFFERENT CHECKOUT, and a suite must run on any tree.
 *
 * WHAT IT ANSWERS. `accepts-when` requires that *"a row that HAS a referent
 * reads back byte-identically to today"*, and the NEGATIVE CONTROL's
 * over-strictness arm requires that *"every existing `op=airunlog` answer is
 * byte-identical but for the new fields"*. Both are claims about a BUILD THAT NO
 * LONGER EXISTS in this tree, so neither can be settled from inside it. This
 * drives the identical fixture through the current build and through a
 * pre-change checkout, STRIPS exactly the keys this item added, and compares.
 *
 * WHY THE STRIP IS THE MEASUREMENT AND NOT A LOOPHOLE. Stripping three keys and
 * finding the remainder equal proves that nothing else moved — no value, no
 * key, AND NO ORDER. Order matters here rather than being pedantry: the entries
 * are built by spreading the SELECT's row, so a column inserted in the middle of
 * the projection would reorder the JSON while every value stayed correct, and a
 * consumer digesting the answer would break over a change that a key-set check
 * calls additive. The strip can only reproduce the old text if the new columns
 * were APPENDED, which is the property being claimed.
 *
 * THE NON-EMPTY GUARDS, because an equality that costs nothing to produce is not
 * evidence and this repository has twice recorded `e3b0c442…` — the sha256 of
 * the empty string — as a "byte-identical" result over nothing. This asserts the
 * fixture wrote every entry, that the answer carries them, that at least one row
 * CARRIES a referent and at least one does NOT, and that the two do not read the
 * same. A comparison over a short or empty answer exits 1 before comparing.
 *
 * WHAT IT CANNOT SEE, stated rather than left to be discovered. It compares ONE
 * fixture's answer through miniflare on this machine: no real account, no
 * deploy, no second instance, no truncated page, no viewer-withheld run. Those
 * are `observation-log.test.mjs`'s. It also cannot see a difference in how the
 * two builds REFUSE, because a refused append writes nothing for this read to
 * return. And when run WITHOUT a comparison checkout it falls back to a PIN
 * measured on the pre-change tree, which is weaker: a pin is a number somebody
 * typed, and this project's most-repeated finding is that those go stale.
 *
 *     node test/rec113-identity.mjs /path/to/pre-change/checkout
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

const TOK = "mem-rec113";
const BUNDLE = "INQ-2026-0917-rec113-identity";
const RUN = "RUN-2026-0917-rec113";
const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const T0 = "2026-09-17T09:00:00Z";
const at = (plus) => new Date(Date.parse(T0) + plus).toISOString().split(".")[0] + "Z";

/* THE KEYS THIS ITEM ADDED, NAMED ONCE. If a later item adds a fourth and
   forgets this list, the comparison goes RED rather than quietly widening its
   own exemption — which is the direction an instrument should fail in. */
const ADDED_ENTRY_KEYS = ["result_kind", "result_ref", "coverage"];
const ADDED_VOCAB_KEYS = ["coverage", "coverage_undetermined"];

/* THE FIXTURE IS A CONSTANT OF THIS FILE and is written once, so the two builds
   cannot be handed subtly different input — the way a before/after comparison
   most easily agrees for free.

   IT DELIBERATELY CARRIES BOTH SHAPES. Entry 2 is a `run` PRESENT that NAMES
   what it found; entry 3 is a `run` PRESENT that names nothing — the row
   C-22.10's carve-out admits and the one this whole item exists to let a reader
   see. A fixture with only one of them could not tell a read that states every
   row undetermined from one that states it correctly. */
const LOG_ENTRIES = [
  { level: "meaning", subject: "observation:rec113-finding", state: "NEVER_LOOKED",
    detail: "nothing derived here, which may only mean nothing was extracted" },
  { level: "document", subject: "observation:budget-2026", state: "PRESENT",
    result_kind: "capture", result_ref: SHA_B,
    detail: "a run PRESENT that DOES name what it found" },
  { level: "document", subject: "observation:budget-2025", state: "PRESENT",
    detail: "a run PRESENT that names NOTHING — the carve-out's shape (D-366)" },
  { level: "internet", subject: "observation:controller-portal", state: "LOOKED_INDETERMINATE",
    governed: true, condition: "governor-holding-host",
    detail: "our own pacing held the controller portal" },
  { level: "document", subject: "observation:gone-page", state: "LOOKED_ABSENT",
    detail: "the page is positively gone, 404 from the origin" },
];

async function answerFrom(root) {
  const idx = join(root, "bio-plane/src/index.mjs");
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-rec113", MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec113",
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
  });
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  try {
    await POST(`op=promote&token=${TOK}`, {
      bundleId: BUNDLE, base: null, snapKey: "20260917T090000Z_inbox", author: "ruth",
      meta: { object_type: "inquiry", group: "believe-in-oakland",
              title: "does the read say what it cannot tell?", current_state: "open",
              created: T0, last_updated: T0 },
      files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nDoes it say?\n`,
                bytes: 90, sha256: SHA_A }],
      register: [],
    });
    const started = await POST(`op=airunopen&token=${TOK}`, {
      run: RUN, contextType: "inquiry", contextId: BUNDLE, label: "REC-113's fixture",
      mode: "check", principalClaude: "project",
      principalClaudeRef: "believe-in-oakland/claude",
      skillVersion: "investigative-session@1", biasManifest: null,
      bounds: [{ bound: "fetches", allowed: 40, unit: "requests" }], leaseMs: 600000, at: T0,
    });
    if (!started || started.ok === false)
      throw new Error(`airunopen refused in ${root}: ${JSON.stringify(started)}`);
    const ticked = await POST(`op=airuntick&token=${TOK}`, {
      run: RUN, at: at(5000), leaseMs: 600000, consume: { fetches: 3 }, log: LOG_ENTRIES,
    });
    if (!ticked || ticked.appended !== LOG_ENTRIES.length)
      throw new Error(`the fixture did not append all ${LOG_ENTRIES.length} entries in ${root}: `
                    + JSON.stringify(ticked));
    return await (await mf.dispatchFetch(
      `http://x/api/?op=airunlog&token=${TOK}&run=${RUN}`)).text();
  } finally { await mf.dispose(); }
}

const sha = (v) => createHash("sha256").update(v).digest("hex");
const here = fileURLToPath(new URL("../..", import.meta.url));
const other = process.argv[2] || null;

/* THE PRE-CHANGE PIN, and its provenance is what makes it worth anything.
   MEASURED 2026-09-17 by this item's worker on THIS fixture through a checkout
   of `10574da9` — the commit this branch forked from, before a line of this
   item existed. It is the fallback for a run with no comparison checkout, and it
   is WEAKER than the comparison: a pin is a hand-carried number, which is this
   project's most-repeated stale-figure shape. Prefer the argument. */
const PRE_CHANGE_PIN = "75a9946f25120431c5009f2f7851fd0ab1d71c9c90ad17449a7c78b39ee19252";
/* 3,236 bytes. MEASURED, not chosen: it is the raw text a checkout of `10574da9`
   answered for this fixture, and the run that recorded it ALSO showed the
   current build's stripped answer reaching the same 3,236 bytes and the same
   digest. */

let bad = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`
            + (ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`));
  if (!ok) bad++;
};

const mine = await answerFrom(here);
const parsed = JSON.parse(mine);
const body = parsed.result || parsed;
const entries = body.entries || [];

console.log(`CURRENT  ${here}`);
console.log(`  bytes  ${Buffer.byteLength(mine)}`);
console.log(`  sha256 ${sha(mine)}`);
console.log(`  entries ${entries.length}  seqs ${JSON.stringify(entries.map((e) => e.seq))}`);

/* ---- the guards, BEFORE any comparison ---- */
check(`the fixture wrote all ${LOG_ENTRIES.length} entries — a comparison over a short `
    + `answer is not a comparison`, entries.length, LOG_ENTRIES.length);
check("the answer is not the empty-string artefact this repository has twice recorded as "
    + "'byte-identical'", sha(mine) === sha(""), false);
const backed = entries.filter((e) => e.coverage === "backed");
const undet  = entries.filter((e) => e.coverage === "undetermined");
const owed   = entries.filter((e) => e.coverage === "none_owed");
check("the fixture ARMED BOTH DIRECTIONS: at least one row reads `backed` and at least one "
    + "reads `undetermined`, so a read that stated every row the same could not pass",
  [backed.length >= 1, undet.length >= 1, owed.length >= 1], [true, true, true]);
check("THE ARM THAT MATTERS MOST — the row that HAS a referent does NOT read as undetermined, "
    + "because the failure that costs here is the record saying it does not know something it "
    + "does know",
  [backed[0]?.result_ref, backed[0]?.result_kind, backed[0]?.state, backed[0]?.coverage],
  [SHA_B, "capture", "PRESENT", "backed"]);
check("…and the bare `run` PRESENT — the carve-out's own shape — STATES undetermined rather "
    + "than answering a null nobody can interpret",
  [undet[0]?.state, undet[0]?.result_ref, undet[0]?.result_kind, undet[0]?.coverage],
  ["PRESENT", null, null, "undetermined"]);

/* ---- the strip ---- */
/* RE-SERIALISATION IS PROVEN LOSSLESS RATHER THAN ASSUMED, AND THE FIRST DRAFT
   OF THIS LINE WAS WRONG — RECORDED HERE BECAUSE THE WRONG VERSION WOULD STILL
   HAVE PRINTED A GREEN COMPARISON BELOW.
   The comparison further down is over re-serialised text, which is a comparison
   of BYTES only if the round trip is the identity on this endpoint's output.
   This item's first draft asserted it with COMPACT `JSON.stringify` and the arm
   went RED: the plane answers through `JSON.stringify(dec49Attach(o), null, 1)`,
   so the wire form is indented and the compact round trip drops 537 bytes of
   whitespace. Had this line not been here, the strip below would have compared
   two COMPACTED forms and reported "byte-identical" over a comparison that had
   quietly stopped being about bytes — a true statement about structure wearing
   a stronger claim's name. The serialiser is matched to the plane's, and the
   round trip is ASSERTED so that a future change to it fails here by name
   instead of silently weakening every comparison below. */
const WIRE = (v) => JSON.stringify(v, null, 1);
check("the JSON round trip is the identity on this endpoint at the plane's own indent, so a "
    + "comparison of re-serialised text IS a comparison of bytes", WIRE(parsed) === mine, true);

const stripped = JSON.parse(mine);
const sBody = stripped.result || stripped;
for (const e of sBody.entries || []) for (const k of ADDED_ENTRY_KEYS) delete e[k];
for (const k of ADDED_VOCAB_KEYS) delete (sBody.vocabulary || {})[k];
const strippedText = WIRE(stripped);
console.log(`\nSTRIPPED (${ADDED_ENTRY_KEYS.join(", ")} + vocabulary.${ADDED_VOCAB_KEYS.join("/")})`);
console.log(`  bytes  ${Buffer.byteLength(strippedText)}`);
console.log(`  sha256 ${sha(strippedText)}`);
check("the strip actually removed something — an arm that did not arm is a finding",
  strippedText.length < mine.length, true);

if (!other) {
  console.log("\nNo comparison checkout given; falling back to the PIN, which is weaker.");
  check("the stripped answer matches the pre-change PIN", sha(strippedText), PRE_CHANGE_PIN);
  console.log(bad ? `\n${bad} FAILED` : "\nALL PASS");
  process.exit(bad ? 1 : 0);
}

const theirs = await answerFrom(other);
const theirsText = WIRE(JSON.parse(theirs));
console.log(`\nPRE-CHANGE  ${other}`);
console.log(`  bytes  ${Buffer.byteLength(theirs)}`);
console.log(`  sha256 ${sha(theirs)}`);

/* THE POSITIVE CONTROL ON THE COMPARISON ITSELF, and it is the line that makes
   the equality below evidence. If the two checkouts were accidentally the same
   tree — a worktree pointed at the wrong commit, a stale build — then "identical"
   would be true for free and would prove nothing at all. The UNSTRIPPED answers
   MUST differ, because this item added fields. */
check("the two checkouts are genuinely different builds — the UNSTRIPPED answers DIFFER, so "
    + "the equality below is not two copies of one tree agreeing for free",
  mine === theirs, false);
check("…and the pre-change build does NOT project the fields, which is the defect this item "
    + "closes, confirmed at the source rather than inherited from a ledger",
  ["result_ref" in (JSON.parse(theirs).result || JSON.parse(theirs)).entries[0],
   "coverage"   in (JSON.parse(theirs).result || JSON.parse(theirs)).entries[0]], [false, false]);

check("BYTE-IDENTICAL once the added keys are stripped — every value, every key AND EVERY "
    + "POSITION that `op=airunlog` answered before this item is unchanged",
  strippedText === theirsText, true);

if (strippedText !== theirsText) {
  let i = 0;
  while (i < strippedText.length && i < theirsText.length
         && strippedText[i] === theirsText[i]) i++;
  console.log(`  first divergence at byte ${i}`);
  console.log(`  stripped   : ${JSON.stringify(strippedText.slice(Math.max(0, i - 60), i + 90))}`);
  console.log(`  pre-change : ${JSON.stringify(theirsText.slice(Math.max(0, i - 60), i + 90))}`);
}

console.log(bad ? `\n${bad} FAILED` : "\nALL PASS");
process.exit(bad ? 1 : 0);
