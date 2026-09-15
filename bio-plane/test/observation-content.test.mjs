/* NEGATIVE CONTROL: (declared 2026-09-15, REC-94, worktree agent-aca2a5e9a42abc8fa) SIX arms,
   RUN in one step through `node test/nc-rec94.mjs [arm]` (the driver lives INSIDE this worktree),
   each armed ALONE with every other defence held open, each DECLARED must-fail or must-not-fail
   BEFORE it ran, each mutation passing an anchor-occurs-EXACTLY-ONCE guard and a
   bytes-really-changed guard, and every restore verified by sha256 AND by `cmp` against a PRISTINE
   copy named UNIQUELY PER ARM with a byte count printed and a minimum guarded. An opening AND a
   closing BASELINE row bracket the run, because a harness that reported the same answer for every
   arm INCLUDING the baseline is on record in this repository, and without a baseline row five reds
   read exactly like five arms working.
   (a) `baseline` — nothing armed. Declared: everything green. It is the row that distinguishes
       five-arms-broken from five-arms-working.
   (b) `writer` — OBSERVATION-LOG-DESIGN.md §9, this item's own row: REMOVE THE PROMOTE-TIME
       CONTENT-LEVEL WRITER. Declared MUST FAIL: a freshly promoted capture reads as
       NEVER-EXTRACTED and section C's arms fail BY NAME. Declared MUST NOT FAIL: section E's
       document-level arm, because REC-93's writers are untouched — that is this item's
       over-strictness pair in the ORTHOGONAL direction, and it is the queue row's own
       over-strictness clause.
   (c) `shortfall` — make a `tier3_candidate` reading read PRESENT rather than `partial`. Declared
       MUST FAIL: the false-coverage arm and the candidate-list arm. This is the DANGEROUS
       direction: a document we got half of reading as a document we got.
   (d) `pagecount` — make a SCOPED chain claim the whole document without a page count. Declared
       MUST FAIL: the undetermined-coverage arm. A coverage claim off a page set nobody counted.
   (e) `spelling` — write one content-axis state as a LITERAL somewhere other than the constant.
       Declared MUST FAIL: section A's mechanism arm, BY NAME. This is the arm that proves the
       shared vocabulary is a mechanism rather than three documents agreeing in prose.
   (f) `fence` — neuter the viewer gate on the per-capture read. Declared MUST FAIL: section D's
       withholding arm. Declared MUST NOT FAIL: everything else, so the arm takes the fence and
       nothing else.
   THE ACTUAL RESULTS OF EVERY ARM ARE IN `CLAIMS.md`'s release line for REC-94, including the
   ones that came back other than declared.
   WHAT THESE ARMS CANNOT SEE: they are all local to this plane's own source. Nothing here
   exercises a second instance, a real network fetch, a real OCR engine, or the per-unit text
   index — `capture_text` is REC-91's and does not exist, which is why every `indexed` answer
   below that is not at the two ends of the vocabulary reads UNDETERMINED, asserted rather than
   assumed. Nothing here drives D-319's read-time seam either: that seam is CPDF-19's and has no
   call site on this tree, so what is driven is the WRITER it will call, through the re-promotion
   path that moves a chain today. */

/* REC-94 / IC-95 — THE CONTENT-LEVEL WRITERS, THE PER-CAPTURE CONTENT-AXIS READ,
 * AND THE BOUNDED CONTENT-LEVEL FRONTIER.
 * =====================================================================
 *
 * `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2 and its §8 decomposition row
 * 2 — the TABLE is the scope's authority and the queue row is the pointer. It
 * sits on REC-93's landing: ONE table, ONE append site, ONE vocabulary. This
 * item is the second writer into it and adds no table, no column and no refusal.
 *
 * WHY IT MATTERS. CLAUDE.md's standing section: *a store full of captured PDFs,
 * none of them read, is a pile of noise with good provenance*, and *saying WHICH
 * absence is true is a first-class obligation*. Part II §17's OBSERVE row reads
 * ABSENT at content grain — so until this item, "we searched the content of
 * every document we hold and found nothing" and "we have never read a single one
 * of them" were the same answer. The arms below are weighted at the two places
 * that can lie: a document we got HALF of reading as one we got (the
 * false-coverage direction, which is the worse one), and a document nobody has
 * read reading as one that was read and held nothing.
 *
 * SIX SECTIONS:
 *   A. THE SHARED VOCABULARY AS A MECHANISM — one constant, and a divergent
 *      spelling is a BUILD ERROR rather than a review finding.
 *   B. THE PURE DERIVATION — tiers off the chain, §4.2's outcome table, and the
 *      content axis, held without workerd.
 *   C. THE WRITER AT PROMOTE, driven through `op=promote`.
 *   D. THE PER-CAPTURE READ, driven through `op=contentaxis`, and its fence.
 *   E. THE BOUNDED CONTENT FRONTIER and the re-extraction candidate list.
 *   F. RE-EXTRACTION — a moved chain appends and never rewrites.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED,
         contentAxisFor, contentObservationsFor,
         OBSERVATION_AUTHORITY_KINDS, OBSERVATION_SUBJECT_KINDS } from "../src/airun.mjs";
import { tiersEvidenced, STEP_KINDS } from "../src/textchain.mjs";
import { QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SRC = {
  airun:  readFileSync(new URL("../src/airun.mjs", import.meta.url), "utf8"),
  store:  readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8"),
  index:  readFileSync(new URL("../src/index.mjs", import.meta.url), "utf8"),
  chain:  readFileSync(new URL("../src/textchain.mjs", import.meta.url), "utf8"),
  query:  readFileSync(new URL("../src/query.mjs", import.meta.url), "utf8"),
  self:   readFileSync(new URL("./observation-content.test.mjs", import.meta.url), "utf8"),
};

const TOK = "mem-rec94";
const ADM = "adm-rec94";
const NOW = "2026-09-15T09:00:00Z";
const LATER = "2026-09-15T10:00:00Z";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec94",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const obj = ns.get(ns.idFromName("bio"));
/* THE DURABLE OBJECT TAKES ITS OP FROM THE PATH, not from an `op` parameter —
   that is the control plane's spelling. Driven directly only where an arm needs
   a VIEWER the control plane would never stamp (a named member rather than the
   shared instance credential); everything else goes through the op. */
const DO = async (op, q = "") => rP(await (await obj.fetch(`http://x/${op}?${q}`)).json());

/* ========================================================================= *
 *  A · THE SHARED VOCABULARY IS A MECHANISM, NOT A CONVENTION.
 *
 *  RULED 2026-09-14 by CONDUCT #11 at BOB #11's raising. REC-92, REC-94 and
 *  CPDF-19 all read or write ONE content-axis state, their designs say each may
 *  ship without the others, and three items spelling one vocabulary across three
 *  weeks is the id-collision shape one level up — for which the vigilance fix is
 *  already known to fail. So: ONE exported constant, imported by every reader and
 *  writer, and THE SUITES PIN THE CONSTANT AND NEVER A LITERAL.
 *
 *  THIS SECTION IS WHAT MAKES THAT A BUILD ERROR. Every arm below derives its
 *  corpus from `Object.keys(CONTENT_AXIS_STATES)` — this file contains no member
 *  spelling of its own, which A3 asserts about ITSELF, because a suite that
 *  hard-codes the words it is policing is the second copy it exists to prevent.
 * ========================================================================= */
console.log("\n--- A · the content axis is ONE constant, and a second spelling fails the build ---");

const MEMBERS = Object.keys(CONTENT_AXIS_STATES);

t("A1: the constant carries FOUR states and every one of them has a sentence a member could read "
+ "(CONTENT-SEARCH-DESIGN.md §4.4's set, and no fifth word smuggled in)",
  [MEMBERS.length, MEMBERS.every((k) => typeof CONTENT_AXIS_STATES[k] === "string"
                                     && CONTENT_AXIS_STATES[k].length > 30)],
  [4, true]);

/* THE MECHANISM ARM. A member of this vocabulary may be SPELLED in exactly one
   place — the constant's own definition in `airun.mjs` — and everywhere else it
   must arrive by import. The walk counts occurrences of each member's literal
   text in every source file that could plausibly hold one; `airun.mjs` is
   allowed its definition and nothing else is allowed anything. A fourth item
   spelling a member into `store.mjs` fails HERE, by name, with the file named —
   a build error and not a review finding, which is the whole of the ruling.
   THE ARM IS ABSOLUTE AND COUNTS COMMENTS TOO, which is why no comment in this
   file or in the plane names a member either. A walk that stripped comments
   first would be a walk with a second thing to get wrong, and the cost of the
   strict rule is prose rather than correctness. */
{
  const offenders = [];
  for (const [file, src] of Object.entries(SRC)) {
    if (file === "airun" || file === "self") continue;
    for (const m of MEMBERS) {
      const n = src.split(m).length - 1;
      if (n) offenders.push(`${file}:${m}x${n}`);
    }
  }
  t("A2: THE MECHANISM — no member of the content-axis vocabulary is spelled as a literal anywhere "
  + "but in its own constant. A second spelling is a BUILD ERROR here and not a review finding, "
  + "which is the ruling CONDUCT made on 2026-09-14 and the reason this arm exists",
    offenders, []);

  /* The corpus is NON-EMPTY and the walk can SEE a spelling — asserted in the
     other direction, because a matcher that finds nothing over a corpus it never
     read passes exactly as loudly. Three headline totality assertions in this
     repository passed over an empty corpus. */
  t("A2b: REACH — the same walk over `airun.mjs`, which IS allowed to spell them, finds all four. "
  + "Without this row A2 would pass identically over a walk that was reading nothing",
    MEMBERS.filter((m) => SRC.airun.includes(m)).length, 4);
}

t("A3: and THIS SUITE spells none of them either — every arm here derives its words from the "
+ "imported constant, because a suite holding its own copy of the vocabulary it polices is the "
+ "second copy the ruling exists to prevent",
  MEMBERS.filter((m) => SRC.self.split(m).length - 1 > 0), []);

t("A4: the UNDETERMINED answer is its OWN constant and is deliberately NOT a member of the four — "
+ "§4.4's states are a claim about an index, and an item that folded 'we cannot say' into them "
+ "would have made undetermined unsayable at exactly the level it is most often true",
  [typeof CONTENT_AXIS_UNDETERMINED, MEMBERS.includes(CONTENT_AXIS_UNDETERMINED)],
  ["string", false]);

t("A5: `extract` is the authority kind this level writes under and it was already in REC-93's "
+ "vocabulary — this item arrives as a WRITER into an existing vocabulary rather than as a second "
+ "one, which is the one-table decision doing its job",
  [Object.prototype.hasOwnProperty.call(OBSERVATION_AUTHORITY_KINDS, "extract"),
   Object.prototype.hasOwnProperty.call(OBSERVATION_SUBJECT_KINDS, "capture")],
  [true, true]);

/* ========================================================================= *
 *  B · THE PURE DERIVATION — §4.2's outcome table, held without workerd.
 * ========================================================================= */
console.log("\n--- B · the chain's tiers, §4.2's outcomes, and the content axis (pure) ---");

const whole1 = [{ step: "layer", tier: 1, container: "pdf" }];
const mixed = (t1pages, t3pages) => [
  { step: "layer", tier: 1, container: "pdf", extent: { kind: "pages", pages: t1pages } },
  { step: "pixels", cap: "C", extent: { kind: "pages", pages: t3pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
    confidence: { basis: "none" }, extent: { kind: "pages", pages: t3pages } },
];

t("B1: EVERY step kind DECLARES whether it is an extraction tier, so nothing is classified by "
+ "matching a step name and a sixth kind cannot slip through unclassified",
  Object.keys(STEP_KINDS).filter((k) => !Object.prototype.hasOwnProperty.call(STEP_KINDS[k], "tier")),
  []);

t("B2: a plain tier-1 layer chain evidences ONE tier, over the whole document, with nothing "
+ "unclassified",
  (() => { const e = tiersEvidenced(whole1);
           return [e.tiers.length, e.tiers[0].tier, e.tiers[0].covers, e.unclassified]; })(),
  [1, 1, "all", []]);

t("B3: D-252's MIXED document evidences TWO tiers, each over its own pages, IN THE ORDER THE "
+ "ATTEMPTS HAPPENED — the chain's order, because the writer walks them cumulatively and an order "
+ "that is not the order of events would make a row say the state after a tier that had not run",
  (() => { const e = tiersEvidenced(mixed([0, 1], [2]));
           return e.tiers.map((x) => [x.tier, x.covers]); })(),
  [[1, [0, 1]], [3, [2]]]);

t("B3b: and `pixels` + `ocr` collapse to ONE tier-3 row rather than two, because the tier is a "
+ "property of the kind and both kinds ARE tier 3 — there is no tier-3 route that is not an "
+ "engine over pixels",
  tiersEvidenced(mixed([0], [1])).tiers.filter((x) => x.tier === 3).length, 1);

t("B4: a malformed chain evidences NOTHING rather than throwing — a reader asking what a broken "
+ "chain rests on should get 'nothing this record can name', which is true (`derivationCap`'s "
+ "precedent)",
  [tiersEvidenced("ocr").tiers, tiersEvidenced(null).tiers], [[], []]);

const readingOf = (over) => ({ content_type: "meeting_calendar", reader_version: 1,
                               read_from_text: true, found: false, entities: [], facts: {},
                               at: NOW, text_container: "pdf", ...over });
const SHA1 = "1".repeat(64);

t("B5: §4.2 row 1 — text over the WHOLE document is PRESENT, and it carries the back-reference "
+ "C-22.10 requires: a PRESENT that names nothing it found is a coverage claim with no evidence",
  (() => { const o = contentObservationsFor(readingOf({ text_source: whole1, text_tier: 1 }),
                                            SHA1, tiersEvidenced);
           return [o.rows.length, o.rows[0].state, o.rows[0].resultKind, o.rows[0].resultRef]; })(),
  [1, "PRESENT", "reading", SHA1]);

t("B6: THE FALSE-COVERAGE DIRECTION, and it is the one that matters — a reading flagged "
+ "`tier3_candidate` has pages no engine bound here could read, so it is `partial` and NEVER "
+ "PRESENT. A document we got half of reading as one we got is the failure this level exists to "
+ "prevent",
  contentObservationsFor(readingOf({ text_source: whole1, text_tier: 1, tier3_candidate: true }),
                         SHA1, tiersEvidenced).rows.map((r) => r.state),
  ["partial"]);

t("B7: §4.2 row 3 — no text could be produced is LOOKED_INDETERMINATE with a condition, and the "
+ "condition is the record's EXISTING word rather than a new one",
  (() => { const o = contentObservationsFor(
             readingOf({ read_from_text: false, text_source: whole1, text_tier: 1 }),
             SHA1, tiersEvidenced);
           return [o.rows.length, o.rows[0].state,
                   Object.prototype.hasOwnProperty.call(QUEUE_CONDITION_KINDS, o.rows[0].condition),
                   o.rows[0].resultRef]; })(),
  [1, "LOOKED_INDETERMINATE", true, null]);

t("B8: `found: false` with text READ is PRESENT at the CONTENT level, not LOOKED_ABSENT. The "
+ "reader finding no entities in text it read perfectly well is a MEANING-level absence (REC-95); "
+ "reading it as a content-level one would file every document that mentions nobody as a document "
+ "with no text",
  contentObservationsFor(readingOf({ text_source: whole1, text_tier: 1, found: false }),
                         SHA1, tiersEvidenced).rows[0].state,
  "PRESENT");

t("B9: THE CUMULATIVE RULE — a mixed document whose two tiers together cover every page of a "
+ "KNOWN page set ends PRESENT, and the row before it says `partial`. Each row is the state AFTER "
+ "that attempt, so the log reads as a genuine history and the frontier's latest row is true of "
+ "the capture",
  contentObservationsFor(readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3, page_count: 3 }),
                         SHA1, tiersEvidenced).rows.map((r) => r.state),
  ["partial", "PRESENT"]);

t("B10: and the SAME chain against a LARGER page set stays `partial` at the end — three pages of "
+ "five is three pages of five",
  contentObservationsFor(readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3, page_count: 5 }),
                         SHA1, tiersEvidenced).rows.map((r) => r.state),
  ["partial", "partial"]);

t("B11: and with NO page count it stays `partial` and SAYS WHY — whether those pages are all of "
+ "the document is undetermined, and guessing YES would be a coverage claim off a page set nobody "
+ "counted (CAP-9 / D-345 is what persists the count)",
  (() => { const o = contentObservationsFor(
             readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3 }), SHA1, tiersEvidenced);
           return [o.rows.map((r) => r.state), /undetermined/.test(o.rows[1].detail)]; })(),
  [["partial", "partial"], true]);

t("B12: the content axis at its two ANSWERABLE ends — no observation at all is the not-extracted "
+ "member, and an observation saying no text could be produced is the none member, with the "
+ "reason carried",
  (() => { const none = contentAxisFor({ observed: null });
           const ind = contentAxisFor({ observed: "LOOKED_INDETERMINATE", reason: "a scan" });
           return [none.state, none.determined, ind.state, ind.determined,
                   /a scan/.test(ind.why)]; })(),
  [MEMBERS[3], true, MEMBERS[2], true, true]);

t("B13: and the MIDDLE of the vocabulary reads UNDETERMINED in this build, stated rather than "
+ "answered — the per-unit text index it would be read through is REC-91's `capture_text` and "
+ "does not exist, so answering the none member here would say 'we looked and nothing is indexed' "
+ "about a mechanism this record has no notion of",
  (() => { const a = contentAxisFor({ observed: "PRESENT", unitIndex: false });
           return [a.state, a.determined, /REC-91/.test(a.why)]; })(),
  [CONTENT_AXIS_UNDETERMINED, false, true]);

t("B14: THE CONTRACT REC-91 LANDS INTO, pinned now so that item has something to build against: "
+ "with the unit index present, a whole extraction whose units were all written is the full "
+ "member and anything else is the partial member",
  [contentAxisFor({ observed: "PRESENT", unitIndex: true, unitsComplete: true }).state,
   contentAxisFor({ observed: "PRESENT", unitIndex: true, unitsComplete: false }).state,
   contentAxisFor({ observed: "partial", unitIndex: true, unitsComplete: true }).state],
  [MEMBERS[0], MEMBERS[1], MEMBERS[1]]);

/* ========================================================================= *
 *  C · THE WRITER, DRIVEN THROUGH `op=promote`.
 *  A store-level test and a passing battery are not evidence that a caller can
 *  reach the feature — `op=invitelook` shipped with a ReferenceError while 1,276
 *  assertions passed.
 * ========================================================================= */
console.log("\n--- C · the content-level writer at promote, through the op ---");

const HEAD = new Map();
let snapSeq = 0;
const doc = (id, title) => `---\nobject_type: information\ngroup: believe-in-oakland\n`
  + `title: ${title}\ncurrent_state: collected\n---\n\n# ${title}\n`;
const promote = async (id, { type = "information", reading = null, captureSha = null,
                            register = [], author = undefined } = {}) => {
  const text = doc(id, `Bundle ${id}`);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [{ capture: { sha256: captureSha, encoding: "binary",
                                                           bytes: 10 }, reading }] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const body = {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260915T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register };
  if (author !== undefined) body.author = author;
  const r = await POST(`op=promote&token=${ADM}`, body);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const rowsFor = async (capture) => {
  const f = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  if (!f || !Array.isArray(f.looked))
    throw new Error(`the content frontier answered no rows array: ${JSON.stringify(f).slice(0, 400)}`);
  return f.looked.filter((r) => r.subject === capture);
};

const SHA_WHOLE   = "a".repeat(64);
const SHA_SHORT   = "b".repeat(64);
const SHA_NOTEXT  = "c".repeat(64);
const SHA_UNREAD  = "d".repeat(64);
const reg = (s) => [{ sha256: s, path: `data/${s.slice(0, 4)}.pdf`, encoding: "binary", bytes: 10 }];

await promote("INF-2026-0915-whole", { reading: readingOf({ text_source: whole1, text_tier: 1 }),
                                       captureSha: SHA_WHOLE, register: reg(SHA_WHOLE) });
await promote("INF-2026-0915-short", {
  reading: readingOf({ text_source: whole1, text_tier: 1, tier3_candidate: true }),
  captureSha: SHA_SHORT, register: reg(SHA_SHORT) });
await promote("INF-2026-0915-notext", {
  reading: readingOf({ read_from_text: false, text_source: whole1, text_tier: 1 }),
  captureSha: SHA_NOTEXT, register: reg(SHA_NOTEXT) });
/* A capture the record HOLDS and nothing has ever tried to extract — the
   never-extracted fixture, and the one the whole construct exists for. */
await promote("INF-2026-0915-unread", { register: reg(SHA_UNREAD) });

{
  const r = await rowsFor(SHA_WHOLE);
  t("C1: promoting a document with a reading writes a content-level observation, through the op, "
  + "at the vocabulary REC-93 built — one row, level content, subject the capture, authority the "
  + "BUNDLE (which is what makes 'what did this promotion extract' an indexed read distinct from "
  + "'what has this document been through')",
    [r.length, r[0]?.state, r[0]?.subject_kind, r[0]?.authority_kind,
     r[0]?.authority === "INF-2026-0915-whole"],
    [1, "PRESENT", "capture", "extract", true]);
  t("C1b: and it says this was the FIRST extraction rather than leaving the reader to infer it",
    /first extraction/.test(r[0]?.detail || ""), true);
}

t("C2: the `tier3_candidate` document is `partial` IN THE STORE and not only in the pure "
+ "function — the false-coverage direction, driven end to end",
  (await rowsFor(SHA_SHORT)).map((x) => x.state), ["partial"]);

t("C3: the unreadable document is LOOKED_INDETERMINATE with its condition",
  (await rowsFor(SHA_NOTEXT)).map((x) => [x.state, x.condition]),
  [["LOOKED_INDETERMINATE", "text-undetermined"]]);

t("C4: A PROMOTE WITH NO READING WRITES NO ROW — a look not taken is NEVER_LOOKED and "
+ "NEVER_LOOKED is the ABSENCE of a row (§3). This is the arm that keeps 'nobody read it' from "
+ "becoming 'we read it and it held nothing'",
  (await rowsFor(SHA_UNREAD)).length, 0);

/* CORRECTED FROM ITS FIRST DECLARATION, and the correction is the finding: this
   arm was written expecting `plane`, because the promotes above pass no author.
   THEY DO NOT HAVE TO — the control plane stamps one from the authenticated
   session, and these promote with the ADMIN token, which `isMachineIdentity`
   reads as a machine credential. So the answer is `machine` with the credential
   NAMED, and that is the derivation working rather than defaulting: it consumed
   `contentMintState`, the record's existing predicate, instead of holding a
   second opinion about what a machine identity looks like. The arm is corrected
   to what the plane does and asserts BOTH halves — the class and the named
   actor — because a class with a null actor would be the same lossy answer the
   original expectation would have accepted. */
t("C5: the actor is DERIVED THROUGH THE RECORD'S EXISTING PREDICATE and never guessed — this "
+ "promotion carries a machine credential, so the look is attributed to a machine and the "
+ "credential is NAMED. Attributing it to a member who did not make it would be a false "
+ "attribution in the one field that says who looked",
/* ASKED THROUGH `op=contentaxis` RATHER THAN THE FRONTIER, and the reason is
   worth the line: the frontier's rows carry `actor_class` and NOT `actor`, which
   is REC-93's shape at the document level and is kept — a list of subjects does
   not need to name a credential beside every one of them, and naming one there
   widens what a list discloses. The per-capture read is where the named actor
   belongs, so that is where this is asserted. */
/* NULL-SAFE, AND IT WAS NOT ON ITS FIRST RUN — fixed at the SUITE rather than
   tolerated in the control driver, which is WORKER.md's own receipt arriving in
   this item. Under the `writer` arm `extraction` is null, a bare `.actor_class`
   threw a TypeError, and a TypeError inside an assertion goes through NO
   assertion at all: it ended the module while the tally read clean, so the arm's
   verdict read `3/4 declared` when the true answer was that the suite never
   reached the row that would have answered the fourth. */
  await (async () => { const r = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_WHOLE}`);
           return [r.extraction?.actor_class ?? null,
                   typeof r.extraction?.actor === "string" && !!r.extraction.actor]; })(),
  ["machine", true]);

/* ========================================================================= *
 *  D · THE PER-CAPTURE READ, THROUGH `op=contentaxis`, AND ITS FENCE.
 * ========================================================================= */
console.log("\n--- D · op=contentaxis, and the withholding that is DRIVEN rather than declared ---");

{
  const a = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_WHOLE}`);
  t("D1: a capture whose text WAS extracted answers UNDETERMINED on the index axis, with the "
  + "reason naming what it is waiting on — and the EXTRACTION axis beside it, because what "
  + "extraction established and what the search index holds are two facts",
    [a.found, a.capture_held, a.indexed, a.determined, a.extraction?.state],
    [true, true, CONTENT_AXIS_UNDETERMINED, false, "PRESENT"]);
  t("D1b: and the answer PUBLISHES the vocabulary, so a surface renders the plane's own sentence "
  + "rather than matching a literal it learned separately (PL-17)",
    Object.keys(a.vocabulary || {}), MEMBERS);
}

{
  const a = await GET(`op=contentaxis&token=${TOK}&captureSha=${SHA_UNREAD}`);
  t("D2: a capture the record HOLDS that nothing has read is the not-extracted member — "
  + "DETERMINED rather than undetermined, because 'nobody looked' is an ANSWER and not a gap in "
  + "the answer",
    [a.found, a.capture_held, a.indexed, a.determined, a.extraction],
    [true, true, MEMBERS[3], true, null]);
}

{
  const a = await GET(`op=contentaxis&token=${TOK}&captureSha=${"9".repeat(64)}`);
  t("D3: a capture this record does not hold is NOT the not-extracted member, and the answer says "
  + "so in words — 'we hold it and never read it' and 'we do not hold it' are two different "
  + "absences, which is exactly the distinction this table exists to keep",
    [a.found, a.capture_held, a.indexed === undefined,
     /* The note must NAME the member it is distinguishing itself from, and the
        pattern is built FROM the constant so this arm cannot drift from it. */
     new RegExp(MEMBERS[3]).test(String(a.note))],
    [false, false, true, true]);
}

t("D4: an unnamed capture is refused with a sentence rather than answered over nothing",
  (await GET(`op=contentaxis&token=${TOK}`)).found, false);

/* THE FENCE, DRIVEN. A capture inside a PROJECT the viewer was never invited to
   must answer byte-identically to a capture this record does not hold — REC-25 /
   REC-30's rule, because a read that distinguishes "not yours" from "does not
   exist" has told the caller the thing it was refusing to tell them.
   IT IS ASKED THROUGH THE DURABLE OBJECT WITH A REAL MEMBER VIEWER, because the
   control plane stamps `class:member` for a shared instance token and
   `viewerPredicate` deliberately does not filter a machine credential — so an
   arm driven only through the token would be an arm that could not arm. */
const SHA_PROJ = "e".repeat(64);
await promote("PRJ-2026-0915-private", { type: "project", captureSha: SHA_PROJ,
                                         reading: readingOf({ text_source: whole1, text_tier: 1 }),
                                         register: reg(SHA_PROJ) });
{
  const mine    = await DO("contentaxis", `captureSha=${SHA_PROJ}&viewer=class:member`);
  const theirs  = await DO("contentaxis", `captureSha=${SHA_PROJ}&viewer=member:not-invited`);
  const absent  = await DO("contentaxis", `captureSha=${"8".repeat(64)}&viewer=member:not-invited`);
  t("D5: THE FENCE — a capture in a project this member was never invited to answers with "
  + "capture_held false, and the machine credential that IS allowed to see it answers true. Both "
  + "directions, because a fence that refuses everybody is not a fence",
    [mine.capture_held, theirs.capture_held], [true, false]);
  t("D5b: and it answers BYTE-IDENTICALLY to a capture this record does not hold, apart from the "
  + "fingerprint asked for — no count of what was withheld, because the count is the leak (REC-30)",
    JSON.stringify({ ...theirs, capture_sha: null }),
    JSON.stringify({ ...absent, capture_sha: null }));
  t("D5c: the gate FAILS CLOSED on an absent stamp, like every op in that list",
    (await DO("contentaxis", `captureSha=${SHA_PROJ}`)).capture_held, false);
}

/* ========================================================================= *
 *  E · THE BOUNDED CONTENT FRONTIER AND THE CANDIDATE LIST.
 * ========================================================================= */
console.log("\n--- E · op=frontier at the content level: bounded, and the re-extraction list ---");

{
  const f = await GET(`op=frontier&token=${TOK}&level=content`);
  t("E1: the content level is BUILT and says so, where yesterday it said NOT BUILT in words — "
  + "and the bound is PUBLISHED on the answer, so a reader that got a page never has to guess "
  + "which bound it was answered at",
    [f.built, f.found, typeof f.limit === "number" && f.limit > 0], [true, true, true]);

  t("E2: the tally counts the rows this item wrote, per state, and NEVER_LOOKED is reported APART "
  + "from it — it is the one state that is the absence of a row, so counting it in a GROUP BY "
  + "over rows would be counting something that by definition is not there",
    [f.tally.PRESENT >= 1, f.tally.partial >= 1, f.tally.LOOKED_INDETERMINATE >= 1,
     Object.prototype.hasOwnProperty.call(f.tally, "NEVER_LOOKED")],
    [true, true, true, false]);

  t("E3: the `never_looked` set is the captures this record HOLDS that nothing has ever tried to "
  + "extract — the content level's own NEVER_LOOKED, and the number that says WHICH absence is "
  + "true when a content search comes back empty",
    (f.never_looked || []).map((r) => r.subject).includes(SHA_UNREAD), true);

  t("E4: the candidate list names the document we got HALF of and does NOT name the one we got — "
  + "both directions, because a candidate list that names everything is not a list",
    [(f.recandidates || []).map((r) => r.subject).includes(SHA_SHORT),
     (f.recandidates || []).map((r) => r.subject).includes(SHA_WHOLE)],
    [true, false]);

  t("E4b: and it says WHY each one is a candidate rather than only that it is — the two reasons "
  + "have two different remedies (an engine bound to this instance; a re-run under a calibration "
  + "that already moved) and a member choosing from this list is choosing between them",
    (f.recandidates || []).filter((r) => r.subject === SHA_SHORT)
      .map((r) => [r.tier3_candidate, r.calibration_drifted]),
    [[true, false]]);

  t("E4c: the unreadable document is a candidate too — an instance that later binds an OCR member "
  + "can read it, so it is below what the fleet could do and not a closed question",
    (f.recandidates || []).map((r) => r.subject).includes(SHA_NOTEXT), true);
}

{
  const one = await GET(`op=frontier&token=${TOK}&level=content&limit=1`);
  t("E5: THE BOUND PROVABLY BITES at a cap of one — asserted rather than assumed, because "
  + "REC-93's own bound arm first read `truncated: false` at a cap of one over a store holding "
  + "fewer than two subjects, and an arm that cannot arm is a finding",
    [one.limit, one.looked.length, one.truncated], [1, 1, true]);
}

/* ========================================================================= *
 *  F · RE-EXTRACTION — THE LOG APPENDS AND NEVER REWRITES.
 * ========================================================================= */
console.log("\n--- F · a moved chain appends a row and rewrites none (§3: append-only) ---");

{
  const before = await rowsFor(SHA_SHORT);
  await promote("INF-2026-0915-short", {
    /* The chain MOVED: an engine read the pages tier 1 could not, and the
       shortfall is gone. This is what D-319's read-time seam will produce, and
       it is the path that exists TODAY — CPDF-19 builds the seam that calls it. */
    reading: readingOf({ text_source: mixed([0, 1], [2]), text_tier: 3, page_count: 3 }),
    captureSha: SHA_SHORT, register: reg(SHA_SHORT) });
  const after = await rowsFor(SHA_SHORT);
  t("F1: the re-extraction's LATEST row is PRESENT — the capture moved between content-axis "
  + "states, which is the movement CPDF-19's opt-in re-read exists to cause",
    [before[0]?.state, after[0]?.state], ["partial", "PRESENT"]);
  t("F1b: and it SAYS it was a re-extraction, derived from the store rather than declared by the "
  + "caller — so the second row says so whether or not the caller thought to mention it",
    /re-extraction/.test(after[0]?.detail || ""), true);

  const f = await GET(`op=frontier&token=${TOK}&level=content&limit=500`);
  t("F2: and the capture LEAVES the candidate list, which is what makes the list a worklist "
  + "rather than a census",
    (f.recandidates || []).map((r) => r.subject).includes(SHA_SHORT), false);

  const all = await DO("frontier", `level=content&viewer=class:member&limit=500`);
  t("F3: THE EARLIER ROW WAS NOT REWRITTEN — the tally still counts a `partial`, because the log "
  + "is append-only and a log that can be rewritten is not evidence of anything. The frontier "
  + "shows the latest state; the TABLE still holds the history",
    all.tally.partial >= 1, true);
}

reachedFoot = true;

} catch (e) {
  /* THE THROW IS PRINTED, because a suite that dies silently reports a clean
     tally and the foot-guard's `-1` says only THAT it died. */
  console.log(`  THREW: ${e && e.stack ? e.stack : e}`);
} finally {
  await mf.dispose();
  /* THE FOOT WAS REACHED — asserted rather than assumed. A TypeError inside an
     assertion goes through NO assertion at all: it ends the module while the
     tally reads clean, and a suite that stopped early reports a comfortable
     green. `-1` rather than `0` when the foot was missed, because 0 is a number
     a reader can mistake for a result. */
  console.log(`\nobservation-content: ${reachedFoot ? pass : -1} pass, ${fail} fail`);
}
/* EXPLICIT IN BOTH DIRECTIONS, which `hygiene.test.mjs` requires of every suite and
   which it caught this suite failing: `process.exit(1)` under a condition leaves the
   GREEN path to node's default, and a suite that merely declines to fail is not the
   same as one that says it passed. The foot guard is folded into the SAME expression
   rather than sitting in a second `exit` above it, so there is one place this suite
   decides its own verdict — a suite that died early exits 1 for the same reason a
   suite with a red assertion does, and neither can reach the 0. */
process.exit(fail || !reachedFoot ? 1 : 0);
