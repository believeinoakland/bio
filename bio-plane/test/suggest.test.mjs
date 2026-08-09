/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/suggest.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (`versionstate.control.mjs`'s precedent, which took it from `check-refusal-codes.mjs`). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: a worker's harness was overwritten mid-turn by a concurrent worker on 2026-08-07, and a harness silently replaced between ARM and RESTORE reports a restore it never performed. Every arm is armed ALONE against a whole tree, every restore is verified BY sha256 AND BY CONTENT, and every arm names the assertions that MUST fail.
   THIS ITEM'S OWED CONTROL IS VF-1's NUMBER 6: REMOVE ANY ONE OF THE SIX PRE-WRITE REFUSALS AND ITS SUITE FAILS — ONE AT A TIME, EACH NAMED. A control that removed them all together would prove only that the block exists, which is the shape IS-6's C-22.4 arm was absorbed by. So there are six arms and not one, each neutering exactly one check with the other five HELD OPEN, and each one's expected failure NAMES ITS OWN C-NUMBER.
   (1) CHECK 1, THE REACHABLE LEG (C-27.8). In src/store.mjs suggestVersion replace `if (unreachable.length)` with `if (false)`. The retired-leg arm and the absent-leg arm must both fail BY C-NUMBER, and the DEC-49 FLOOR must fail because SUGGEST_LEG_UNREACHABLE becomes undrivable. D-168's trap is the sharp half: a leg citing RETIRED information lands, and every later reader sees live support.
   (2) CHECK 2, THE PAIR (C-27.9). Replace `if (pairError || axisBad(pair?.capture) || axisBad(pair?.connection) || partitionDisagrees)` with `if (false)`. The partition-disagreement arm must fail by C-number and the floor with it.
   (3) CHECK 3, DIFFERS IN SUBSTANCE (C-27.10). Replace `if (twin)` with `if (false)`. The duplicate arm must fail by C-number; note that the RESUBMIT-AFTER-SUCCESS arm fails with it, because a verbatim resubmit of a landed version is refused BY THIS CHECK.
   (4) CHECK 4, D-195 INDEPENDENCE (C-27.11). Replace `if (shared.length)` with `if (false)`. The shared-origin arm must fail by C-number and the floor with it.
   (5) CHECK 5, NO BOILERPLATE (C-27.12). Replace `if (filler.length)` with `if (false)`. The placeholder arm must fail by C-number; the OVER-STRICTNESS arm must STAY GREEN, because a check that refuses correct work is a defect in the check.
   (6) CHECK 6, NO UNWRITABLE STATE (C-27.13). Replace `if (forbidden.length)` with `if (false)`. The already-decided arm must fail by C-number. NOTE the second half of this refusal — the structural-assertion arm — is a SEPARATE condition and stays live, which is why the two are asserted separately below.
   (7) F10, THE IDEMPOTENCE KEY. In src/store.mjs suggestVersion replace `if (prior) {` with `if (false) {`. The RESUBMIT arm must fail: the second submission is EVALUATED again, `repeats` never moves, and the answer no longer says `evaluated: false`. This is the arm the plan names.
   (8) OVER-STRICTNESS, and these must PASS rather than fail: a description in Spanish lands; a description that QUOTES a placeholder while saying something real lands; a version name carrying a full stop lands; and a reading whose two parts rest on documents with no shared origin lands. A fence that refuses correct work is a defect in the fence.
   (D-231a) THE CLOCK, RE-ARMED — the arm that turns this item's hypothesis into a diagnosis. In src/store.mjs suggestVersion, put the assertion stamp back into the substance comparison: drop the `.map(...)` that blanks field 3 of the `ground` rows, leaving `substanceOf` filtering `name` and `derived_from` only. THE BOUNDARY ARM IN BLOCK 2 MUST FAIL and the two CHECK 3 arms above it MUST STAY GREEN — that split IS the defect's shape, the gate working inside one second and not outside it. Arm (3) is the paired control: it disarms the check outright, so the two together say the boundary arm is deterministic AND still load-bearing.
   (D-231b) OVER-BLANKING, and it must fail the OTHER way. Widen the exclusion by one field (`i === 3` becomes `i >= 3`) so the ground's STATEMENT is swallowed with the stamp. THE OVER-STRICTNESS ARM IN BLOCK 6 MUST FAIL — a reading differing only in what it says its evidence shows would be refused as a duplicate — while the boundary arm STAYS GREEN. A fix that is one field too wide refuses correct work, and this is the arm that would say so.
   (D-234a) THE `#fmSafe` HALF REVERTED — REC-75's arm, and the one that proves the normalisation is what refuses. In src/store.mjs `#suggestionPersisted` replace `const fs = (s) => Store.#fmSafe(s);` with the identity `const fs = (s) => String(s ?? "");`, which is exactly "compose the candidate from raw args" and is the plane as it stood before REC-75. THE FIVE D-234 DUPLICATE ARMS IN BLOCK 2 MUST ALL FAIL — every punctuated duplicate lands again — while THE D-231 BOUNDARY ARM AND THE OVER-STRICTNESS ARMS STAY GREEN, which is what says the clock half and the punctuation half are two independent defects rather than one measured twice.
   (D-234b) OVER-NORMALISED, and it must fail the OTHER way. Push the same `fs` PAST what the document does — `Store.#fmSafe(s).replace(/\s+/g, " ").replace(/[;,'“”]/g, "")` — so both sides are collapsed further than the record collapses them. THE REC-75 OVER-STRICTNESS ARMS IN BLOCK 6 MUST FAIL (two readings differing only in the punctuation of a QUOTED SOURCE are not one reading) AND THE PUBLICATION ARM WITH THEM, while every duplicate arm stays green. Collapsing correct work is the opposite defect and the worse one.
   (D-234c) THE PUBLICATION REVERTED, COMPOUND ON PURPOSE: `fs` to the identity AND `composition: storedComposition` back to `composition: candidate ? candidate.composition : null`. Reverting the publication alone changes nothing observable, because after REC-75 the two are equal — so an arm that edited only it would be green while proving nothing. THE PUBLICATION ARM AND THE CROSS-OP AGREEMENT ARM MUST FAIL, which is the pre-REC-75 state: a caller handed bytes the record does not hold, with nothing on the answer to say so.
   (D-234d) THE NAME COMPARISON REVERTED: compare `name` instead of `nameWritten` at the SUGGEST_NAME_TAKEN check. THE FOLDED-NAME ARM MUST FAIL — a reading named `the ledger<newline>account` walks past this endpoint and is refused by `promote` as VERSION_NAME_NOT_UNIQUE instead, in another family's words over a document this endpoint had already composed.
   (D-234e) THE STRUCTURAL RATCHET. Replace `q(pv.description)` in the write with `q(args.description)`. ONLY the block 7 structural arm may fail; EVERY behavioural arm must stay GREEN — and that is the arm's justification rather than a weakness in it. `q()` applies `#fmSafe` and `#fmSafe` is IDEMPOTENT, so the two spellings emit identical bytes and no driven arm can tell them apart. The defect D-234 named was never in the write but in the CANDIDATE, so the write's source is unobservable from outside and only a structural pin can hold it.
   (D-235a) THE COLLECTIONS RE-SOURCED FROM THE CANDIDATE. In src/store.mjs's success answer put `legs` back on `candidate.legs` and `grounds` back on `declaredLabels` — the answer exactly as REC-75 left it. THE GROUND-FOLD ARM, THE CROSS-OP ARM, THE LEG-SHAPE ARM AND THE STRUCTURAL PIN MUST ALL FAIL while the NAME arm stays green, which is what says the fields are separate rather than one thing measured three times.
   (D-235b) THE NAME RE-SOURCED FROM THE SUBMISSION: `version: name` again. THE NAME ARM, THE CROSS-OP ARM AND THE STRUCTURAL PIN MUST FAIL. This arm is the one that CORRECTED both the cross-op fixture (whose name had to carry a fold before it could see the field at all) and the structural pin (whose banned-list spelling could not name the local `name` without also matching `recorded.name`) — a re-sourced field is invisible wherever the two sources agree, which is REC-75's own receipt one field over.
   (D-235c) THE READ-BACK BROKEN AT THE QUERY: make the projection lookup name a version the record cannot hold, so `recorded` is null. THE ONLY ARM THAT DRIVES THE FAIL-SAFE SIDE, which no submission can reach. Every record-sourced arm must fail and the answer must publish `null` with `composition_of: "unread"` rather than substituting the candidate.
   (D-235d) THE LABEL DE-TOTALISED: drop one field out of the computed source map while leaving it on the answer. ONLY THE TOTALITY ARM AND THE PARTITION PIN MAY FAIL; every behavioural arm stays GREEN, because the bytes are unchanged and only the answer's account of itself is wrong. That is the arm's justification, not a weakness in it.
   (D-235e) THE BLANK PART LABEL RE-ADMITTED: drop `filter(Boolean)` from the shared reader's ground derivation. ONLY THE REPLAY ARM MAY FAIL — `op=suggest` cannot produce a leg with no part (C-25.5 refuses it at `promote`), but the shape arm is `!pkg.replay`, so the record's own history can carry one.
   (D-235f) OVER-REACH, AND IT MUST FAIL THE OTHER WAY: make the shared reader drop the LEG as well as the blank label. The empty label is not a part anybody declared and comes out; the leg is a fact the record holds and must not. THE REPLAY ARM MUST FAIL, and a reader that silently withheld evidence would make a basis returned in part read as a basis.
   NOTE ON NUMBERING: the harness has always carried more arms than this list names its own ordinals for, so the D-231, D-234 and D-235 arms are LABELLED rather than numbered and `suggest.control.mjs` runs them under the same labels.
 * =========================================================================
 *
 * WHY THIS SUITE WAS INTERMITTENTLY RED, NAMED HERE RATHER THAN IN A COMMIT
 * MESSAGE NOBODY RE-READS — D-231, diagnosed 2026-08-08 by M0-13.
 *
 * THE CAUSE WAS A WALL CLOCK INSIDE A COMPARISON THAT HAD TO BE TIME-FREE, and
 * it was a live plane defect rather than anything wrong with this file.
 * `suggestVersion`'s local `substanceOf` stripped `name` and `derived_from`
 * from PL-1's canonical composition before comparing a candidate against every
 * held reading — but the composition's ground rows are
 * `ground\t<ground>\t<asserted_by>\t<at>\t<statement>`, and that `at` is stamped
 * from the SERVER'S clock at second resolution. The candidate was stamped NOW;
 * every held reading was stamped when it was written. **So CHECK 3's duplicate
 * gate fired only when the two submissions landed inside the SAME ONE-SECOND
 * BUCKET.** Driven, not inferred: identical readings 0ms apart were refused, the
 * same pair 1,200ms apart LANDED as a second version.
 *
 * THE FLAKE WAS THE CHEAP HALF. This suite runs in ~510ms, so standalone it
 * usually stayed inside one second and was green; under a loaded battery it
 * stretched past the boundary and CHECK 3 went red, taking block 3's structural
 * arm with it (a duplicate that lands makes the version count 7 where the arm
 * expects 6 — which is exactly the 59/2 CONDUCT measured, and a boundary crossed
 * only by the later `renamed` submission is the 60/1 PL-14 measured).
 *
 * THE EXPENSIVE HALF IS THAT §6 RULE 8 WAS UNENFORCED IN THE PLANE. *A run adds
 * its output as a new version ONLY IF it differs in substance from every
 * existing one* — and any retry loop that paused for a second between attempts
 * wrote an unbounded number of identical readings into a member's inquiry. The
 * fix is one expression in `substanceOf`: the stamp is blanked out of the ground
 * rows for the COMPARISON only. The composition itself is untouched, because the
 * freeze compares document-derived bytes against stored bytes and both sides
 * carry the same authored stamp there.
 *
 * THE BRIEF'S SUSPECT WAS F10's VERBATIM-RESUBMIT KEY, AND IT WAS WRONG — worth
 * recording, because it is the obvious answer and the next reader will reach for
 * it too. That key is CLEAN: `submission` is built out of caller-derived fields
 * twenty-one lines BEFORE `nowIso` exists, and `nowIso` reaches only the
 * `first_at`/`last_at` columns. Nothing a concurrent suite could move was
 * involved at all — the battery runs its suites SEQUENTIALLY, and the mechanism
 * is entirely inside one process. Concurrency was never more than the load that
 * made the suite slow enough to cross a second.
 *
 * AND THE SAME GATE WAS DEFEATED A SECOND TIME, BY A QUOTATION MARK — D-234,
 * fixed 2026-08-08 by REC-75 and recorded here beside D-231 because the two are
 * one gate failing for two independent reasons and a reader who knows only one
 * of them will draw the wrong conclusion from the other.
 *
 * `#fmSafe` rewrites `"` and `\` to `'`, folds newlines to spaces and TRIMS
 * every authored field on its way into the document, and several fields are
 * written only when non-blank. CHECK 3's candidate was composed from RAW ARGS.
 * **So the composition derived from what was WRITTEN could never equal the
 * composition derived from what was SUBMITTED whenever a description, a ground
 * statement or a leg note carried any of those.** A member who typed a
 * quotation mark did not get the duplicate check — deterministically, always,
 * and with nothing going red to say so, which is why it is worse than D-231's
 * flake: there was no intermittency to make anybody look.
 *
 * THE FIX IS ONE NORMALISER AND NOT A LIST OF TRANSFORMS. `#suggestionPersisted`
 * says once what a submitted value becomes in the document, and BOTH the write
 * and the candidate read it. A candidate taught the write's transforms would
 * have agreed with it only until somebody changed one of them.
 *
 * AND WHAT `composition` PUBLISHES IS NOW DECIDED AND SAID: THE RECORD'S BYTES,
 * read back from the projection, with `composition_of: "record"` on the answer.
 * That divergence ALREADY EXISTED — before REC-75 the endpoint published the
 * candidate's bytes, so every submission carrying a quote handed the caller
 * something the record does not hold. It is closed rather than introduced.
 * ========================================================================= */
/* IS-BUILD-PLAN PL-3 / IS-4 — THE SUGGEST ENDPOINT.
 *
 * §10 is why this is ONE endpoint and not two: *"Export means the AI adds a new
 * version to the inquiry being investigated"*, so the background job and the
 * interactive session are two ways into ONE piece of work.
 *
 * WHAT IS ASSERTED HERE, in the order the blocks run:
 *
 *  1. ALL FIVE OF §9's KINDS ARE WRITABLE, and the SOLE possible output is a
 *     version in state `suggested` carrying its run.
 *  2. THE SIX PRE-WRITE CHECKS, each DRIVEN out of the plane and each pinned by
 *     its own C-number against WHAT THE PLANE SENT rather than against the
 *     registry the number was read from.
 *  3. D-168's TRAP: a leg citing RETIRED information is refused, and a type-only
 *     check — which is all `op=cite` has — would have passed it.
 *  4. F10: a verbatim resubmit is a STRUCTURAL NO-OP. Nothing is re-evaluated,
 *     nothing is written, and the document does not move.
 *  5. DEC-49: the driven code set EQUALS the registry, floor as well as ceiling.
 *  6. OVER-STRICTNESS: the fence does not refuse correct work.
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SUGGEST_CHECKS, SUGGEST_KINDS, SUGGEST_LEVELS, isBoilerplate,
         BOILERPLATE_FORMS,
         /* PL-19 / DEC-65: IMPORTED, never hand-typed. PL-17's own
            over-strictness arm caught this suite's sibling hand-typing two
            variants of this literal, which agreed for free until it moved. */
         SUFFICIENCY_UNCLAIMED } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT, PL-1's discipline: an arm that throws on `.code` of undefined
   takes every arm behind it with it and reports one defect as none. An
   accumulating assertion is only HALF that fix — a TypeError never reaches it. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : null;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl3", MEMBER_TOKEN: "mem-pl3", PROBE_TOKEN: "prb-pl3", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));
const DO = async (p, body) => rP(await (await doStub.fetch("http://x/" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

/* The endpoint's body, isolated once so every source arm asks the same question
   of the same text. A FUNCTION DECLARATION so it is hoisted above its callers
   and the file still reads top to bottom: it is an instrument, not a subject. */
/* Comments blanked, LENGTH-PRESERVING so offsets do not move. This file's
   subject is named in dozens of comments inside the very span it walks, so a
   walk over raw source would read the endpoint's own prose about `accepted` as
   an assignment — the exact false positive PL-1 measured one family over. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
function suggestBlock() {
  const at = STORE_SRC.indexOf("suggestVersion(a = {}) {");
  if (at < 0) return "";
  const end = STORE_SRC.indexOf("\n  static #suggestionFrontmatter(", at);
  return STORE_SRC.slice(at, end < 0 ? at + 40000 : end);
}
/* THE SPAN THAT COMPOSES THE VERSION ROW, isolated for §4's fence walk — D-235.
   The fence's rule is about the row this endpoint WRITES, and the write is one
   declared region inside a method that is now several screens longer than it. */
function suggestWriteRegion() {
  const from = STORE_SRC.indexOf("DEC-49 REGION is-suggest-write");
  const to = STORE_SRC.indexOf("END DEC-49 REGION is-suggest-write", from);
  return from < 0 || to < from ? "" : STORE_SRC.slice(from, to);
}

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-pl3",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const infoMd = (id, state = "collected", prior = null, history = []) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, `current_state: ${state}`, `prior_state: ${prior === null ? "null" : prior}`,
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []",
  ...(history.length
    ? ["state_history:", ...history.flatMap((h) => [`  - timestamp: "${LATER}"`,
        `    from_state: ${h.from}`, `    to_state: ${h.to}`,
        `    blurb: "moved for the PL-3 fixture"`, "    author: ruth"])]
    : ["state_history: []"]),
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const inquiryMd = (id, { question = `What does ${id} rest on?` } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const promote = async (id, text, type, base = null, register = [], state = null) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base,
  snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register,
  /* THE STATE IS A PARAMETER, and it has to be: a helper that hardcoded
     "collected" for every information bundle promoted a document whose
     frontmatter said `retired` and whose row said `collected`, so D-168's
     fixture silently armed nothing. Caught by the fixture's own arm, which is
     why that arm asserts the state rather than trusting the promote. */
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: state ?? (type === "inquiry" ? "open" : "collected"),
          created: NOW, last_updated: LATER } });
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (!r.ok) throw new Error(`promote ${a[0]}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

const LEDGER = "INFO-2026-3000-ledger", MINUTES = "INFO-2026-3000-minutes";
const AUDIT = "INFO-2026-3000-audit", MIRROR = "INFO-2026-3000-mirror";
const STALE = "INFO-2026-3000-stale";
for (const d of [LEDGER, MINUTES, AUDIT, MIRROR, STALE])
  await mustPromote(d, infoMd(d), "information", null,
    [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);

/* D-168's SUBJECT. `STALE` is walked to `retired` through the information
   machine's own edges — collected -> verified -> retired — rather than created
   there, because a document that was never collected was never retired either
   and the fixture would be asserting about a state the record cannot reach. */
{
  const v = await promote(STALE, infoMd(STALE, "verified", "collected", [{ from: "collected", to: "verified" }]),
    "information", await shaOf(STALE), [], "verified");
  if (!v.ok) throw new Error(`STALE -> verified: ${JSON.stringify(v).slice(0, 500)}`);
  const r = await promote(STALE, infoMd(STALE, "retired", "verified",
    [{ from: "collected", to: "verified" }, { from: "verified", to: "retired" }]),
    "information", await shaOf(STALE), [], "retired");
  if (!r.ok) throw new Error(`STALE -> retired: ${JSON.stringify(r).slice(0, 500)}`);
}
t("FIXTURE ARMS D-168's TRAP: one information bundle is genuinely RETIRED, walked there through the "
+ "state machine's own edges rather than created in a state nothing could have reached",
  (await GET(`op=list&token=${RUTH}&limit=1000`)).bundles.find((b) => b.bundle_id === STALE)?.current_state,
  "retired");

/* D-195's SUBJECT: TWO DIFFERENT DOCUMENTS RETRIEVED FROM ONE ADDRESS. Not one
   document cited twice — that would be caught by the bundle identity alone and
   would prove nothing about content-addressed provenance. `AUDIT` and `MIRROR`
   are separate bundles with separate captures, and the locator table is what
   says they came from the same place. Written at the DO the way
   `bounds.test.mjs` writes it, because no control-plane route records a
   locator. */
const SHARED_ADDR = "https://example.gov/audit-2026.pdf";
for (const d of [AUDIT, MIRROR])
  await DO("recordcapturedlocator", { address: SHARED_ADDR, addressNorm: SHARED_ADDR,
                                      captureSha: sha(`capture-of-${d}`), retrieved: NOW });
t("FIXTURE ARMS D-195's TRAP: two DIFFERENT documents, two DIFFERENT captures, one upstream address — "
+ "so a shared origin is a fact the record derives rather than one the bundle ids give away",
  [sha(`capture-of-${AUDIT}`) === sha(`capture-of-${MIRROR}`),
   (await DO(`linksto?address_norm=${encodeURIComponent(SHARED_ADDR)}`))?.address_norm ?? SHARED_ADDR],
  [false, SHARED_ADDR]);

const INQ = "INQ-2026-3000-sewer-transfers";
await mustPromote(INQ, inquiryMd(INQ), "inquiry");

const RUN = "RUN-2026-0808-pl3";
{
  const opened = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ,
    label: "PL-3 fixture — the run every suggestion names", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened)}`);
}

/* THE ONE SUBMITTER. Every arm below goes through this, so no arm can quietly
   differ in which parameter it sends. `token=RUTH` is a real member SESSION —
   §10's interactive mode — which is what lets a submission carry the structure
   C-25.15 says only a named member may sign. */
const suggest = async (body, tok = RUTH) => POST(`op=suggest&token=${tok}`, { target: INQ, run: RUN, ...body });
const DRIVEN = new Set(), WIRE = new Map();
const drive = (r) => { const c = codeOf(r); if (c && c in SUGGEST_CHECKS) { DRIVEN.add(c); WIRE.set(c, r.check); } return r; };

/* ====================================================================== 1
 * §9's FIVE KINDS, ALL WRITABLE, AND THE SOLE OUTPUT IS A `suggested` VERSION
 * CARRYING ITS RUN.
 * ====================================================================== */
console.log("\n--- 1. all five kinds are writable, and every one lands as `suggested` carrying its run ---");
const KIND_ARGS = {
  "basis-version": {
    name: "the ledger account", relationship: "and",
    description: "The transfers are evidenced by the ledger itself, read against the minutes that authorised them.",
    grounds: [{ ground: "paper trail", statement: "The ledger and the minutes are read together." }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
           { target: MINUTES, role: "supports", ground: "paper trail" }],
  },
  "sharpen-question": {
    name: "two questions in one", relationship: "and",
    description: "This question asks both whether the process was followed and whether the award was competitive.",
    claim: "Did the process used in the award conform to the process the city is required to follow?",
    grounds: [{ ground: "paper trail" }],
    legs: [{ target: MINUTES, role: "supports", ground: "paper trail" }],
  },
  "new-inquiry": {
    name: "the competitive bidding question", relationship: "and",
    description: "A separate proposition with its own falsifier: that the award was arrived at competitively.",
    claim: "Was the award of the contract arrived at using a competitive bidding process?",
    grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit" }],
  },
  "level-empty": {
    name: "nothing on the open internet", relationship: "and",
    description: "We searched the open internet for a superseding award notice and found none in this window.",
    level: "internet", observed_at: "observation:pl3-internet-1",
  },
  "new-edition": {
    name: "bearing on the published finding", relationship: "and",
    description: "The audit bears on a finding already published, so the only act available is a new edition.",
    grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "cuts_against", ground: "the audit" }],
  },
};
const LANDED = {};
for (const kind of Object.keys(SUGGEST_KINDS)) {
  const r = drive(await suggest({ kind, ...KIND_ARGS[kind] }));
  LANDED[kind] = r;
  t(`kind '${kind}' is WRITABLE, and the answer names the state and the run it carries`,
    [r.ok === true, r.state, r.run, r.kind], [true, "suggested", RUN, kind]);
}
t("THE KIND SET DRIVEN IS THE KIND SET DECLARED — a FLOOR as well as a ceiling, because a ceiling over "
+ "four of five passes triumphantly and the fifth is the one §15's empty-run instrument needs",
  Object.keys(LANDED).sort(), Object.keys(SUGGEST_KINDS).sort());

const read = async () => (await GET(`op=basisversions&token=${RUTH}&id=${INQ}&limit=1000`));
{
  const answer = await read();
  const byName = new Map((answer.versions ?? []).map((v) => [v.name, v]));
  t("all five are IN THE RECORD, readable through op=basisversions, and every one of them is `suggested`",
    [answer.total, [...new Set((answer.versions ?? []).map((v) => v.state))]],
    [5, ["suggested"]]);
  t("and every one CARRIES ITS RUN — §11: a version is only interpretable against the conditions its "
  + "run was formed under",
    [...new Set((answer.versions ?? []).map((v) => v.run))], [RUN]);
  t("none of them arrives hidden, decided, or signed by anybody — `moved` is null on all five, which is "
  + "the truth about a reading nobody has acted on rather than a default",
    [(answer.versions ?? []).filter((v) => v.hidden).length,
     (answer.versions ?? []).filter((v) => v.moved !== null).length],
    [0, 0]);
  t("the empty-level kind lands with NO legs and is still a real answer — §9's kind exists so a run that "
  + "honestly found nothing is distinguishable from a run that emitted nothing",
    [byName.get("nothing on the open internet")?.legs?.length,
     byName.get("nothing on the open internet")?.state],
    [0, "suggested"]);
}
/* THE FENCE AS THE ABSENCE OF A VARIABLE. §4's rule is not enforced by checking
   a parameter — there is no parameter. Asserted over the source so a future
   edit that introduces one fails here. */
/* CORRECTED 2026-08-08 BY D-235, AND THE OLD SPELLING WAS WRONG RATHER THAN
   MERELY SUPERSEDED — corrected, never exempted. This walk ran over the WHOLE
   METHOD and counted every `state:` in it, which was sound only while the method
   had no other reason to write that word. D-235 gives it one: the success answer
   now READS THE STATE BACK OUT OF THE RECORD (`state: recorded.state`), which is
   the opposite of the thing §4 forbids and which the whole-method walk scored as
   a violation. A walk that conscripts every later line is exactly the defect
   REC-71 measured on DEC-49's `where` rows, one instrument over.
   THE RULE IS ABOUT THE ROW THIS ENDPOINT COMPOSES, so the walk is over the span
   that composes it — and the NARROWING IS CLOSED IN THE SAME ASSERTION rather
   than taken on trust: every `#appendFmRows` call in the method is inside that
   region, so a second row composition outside it cannot slip past the narrowed
   walk. Loosening the span without that pin would have been the weakening it
   looks like. */
t("THE SOLE OUTPUT IS A LITERAL: the endpoint writes `state: \"suggested\"` and the write region "
+ "carries no other state assignment on the version row it composes — §4's fence expressed as the "
+ "absence of a variable rather than as a check on one — AND every row this method composes is inside "
+ "that region, so the narrowed walk cannot be escaped by composing a row somewhere else",
  [/state: "suggested"/.test(suggestWriteRegion()),
   (decomment(suggestWriteRegion()).match(/\bstate:(?!\s*"suggested")/g) || []).length,
   suggestWriteRegion().length > 1500,
   (suggestBlock().match(/#appendFmRows\(/g) || []).length,
   (suggestWriteRegion().match(/#appendFmRows\(/g) || []).length],
  [true, 0, true, 3, 3]);

/* ====================================================================== 2
 * THE SIX PRE-WRITE CHECKS, EACH DRIVEN, EACH BY ITS OWN C-NUMBER.
 * ====================================================================== */
console.log("\n--- 2. the six pre-write checks, PLANE-SIDE, each driven by C-number ---");

/* CHECK 1 (C-27.8) — the leg exists AND is reachable at its address. TWO arms,
   and the second is D-168's whole point. */
{
  const absent = drive(await suggest({ kind: "basis-version", name: "resting on nothing",
    description: "A reading resting on a document that is not in this record at all.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: "INFO-2026-9999-ghost", role: "supports", ground: "paper trail" }] }));
  t("CHECK 1: a leg naming a document that is not in the record is REFUSED by C-number",
    [absent.ok, absent.code, absent.check], [false, "SUGGEST_LEG_UNREACHABLE", "C-27.8"]);
  const retired = drive(await suggest({ kind: "basis-version", name: "resting on retired material",
    description: "A reading resting on a document this record has itself retired.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: STALE, role: "supports", ground: "paper trail" }] }));
  t("CHECK 1 / D-168 — THE TRAP: a leg citing RETIRED information is REFUSED, and the refusal names the "
  + "reason rather than the type",
    [retired.ok, retired.code, /RETIRED/.test(String(retired.detail))], [false, "SUGGEST_LEG_UNREACHABLE", true]);
  t("AND A TYPE-ONLY CHECK WOULD HAVE PASSED IT — the trap measured rather than described: the retired "
  + "leg's id is a perfectly good INFO- id of a bundle that exists, which is everything `op=cite` looks at",
    [/^INFO-/.test(STALE),
     (await GET(`op=list&token=${RUTH}&limit=1000`)).bundles.some((b) => b.bundle_id === STALE)],
    [true, true]);
}

/* CHECK 2 (C-27.9) — the pair computes per axis OVER THE DECLARED PARTITION. */
{
  const disagrees = drive(await suggest({ kind: "basis-version", name: "an undeclared part",
    description: "A reading whose legs sit in a part of the argument that no row declares.",
    relationship: "or", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" },
           { target: MINUTES, role: "supports", ground: "a part nobody declared" }] }));
  t("CHECK 2: legs sitting in a part of the argument the version does not declare are REFUSED by "
  + "C-number — the maximum must never be taken over a part nobody signed for",
    [disagrees.ok, disagrees.code, disagrees.check], [false, "SUGGEST_PAIR_DOES_NOT_COMPUTE", "C-27.9"]);
  t("and the refusal NAMES BOTH SETS, so a caller repairs the disagreement rather than guessing which "
  + "side of it was wrong",
    [disagrees.declared, disagrees.used], [["paper trail"], ["a part nobody declared", "paper trail"]]);
  /* THE PAIR ITSELF, on the passing path: DEC-21/DEC-44 refuse a single
     composed number four ways, so what is published is TWO answers. */
  t("AND THE PAIR IS PUBLISHED PER AXIS ON THE PASSING PATH — two answers over two populations, never "
  + "composed into one value (DEC-21/DEC-44)",
    [typeof LANDED["basis-version"].pair?.capture?.state,
     typeof LANDED["basis-version"].pair?.connection?.state,
     "strength" in LANDED["basis-version"]],
    ["string", "string", false]);
}

/* CHECK 3 (C-27.10) — differs in substance. */
{
  const dup = drive(await suggest({ kind: "basis-version", name: "the same reading under a new name",
    ...KIND_ARGS["basis-version"], name: "a second name for one reading" }));
  t("CHECK 3: a reading identical in substance to one already held is REFUSED by C-number, and the "
  + "reading it matches is NAMED — §6 rule 8's write gate",
    [dup.ok, dup.code, dup.check, dup.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "C-27.10", "the ledger account"]);
  t("AND THE COMPARISON IS OVER SUBSTANCE, NOT OVER THE NAME — the duplicate carries a different name "
  + "and a different name did not save it, which is what makes this check more than the name check "
  + "one screen up",
    dup.same_as !== "a second name for one reading", true);

  /* ---------------------------------------------------------------- D-231
     THE ARM THIS SUITE WAS RED FOR, AND IT IS THE CAUSE RATHER THAN THE SYMPTOM.
     Both arms above submitted their duplicate MILLISECONDS after the reading it
     duplicates, and until 2026-08-08 that was the only reason they passed:
     `substanceOf` excluded `name` and `derived_from` from the canonical
     composition but NOT the `at` riding on every `ground` row, which the plane
     stamps from the SERVER'S CLOCK at second resolution. So "identical in
     substance" was true only inside a one-second bucket. This suite runs in
     ~510ms and usually stayed inside one; under a loaded battery it did not, and
     the arms above went red intermittently for two sessions who could each only
     see a green re-run (D-231).
     SO THE BOUNDARY IS CROSSED ON PURPOSE HERE. The arm is deliberately the
     SLOW one in this file — a second of wall clock buys the one thing the two
     arms above cannot give, which is a duplicate check proved over the interval
     a real retry loop actually uses. THE CROSSING IS ASSERTED, NOT ASSUMED: an
     edit that drops the wait would leave an arm that still passes while proving
     nothing, which is this repository's most-repeated instrument failure. */
  /* THE STAMP IS SHAPE-CHECKED BEFORE IT IS WAITED ON, and that is not
     belt-and-braces. If `at` ever stopped being published this would be
     `undefined`, the wait loop would not run, `undefined !== secondOf()` would
     still be true, and the arm would go GREEN having crossed nothing — an
     assertion that passes while proving nothing, which is the failure this
     repository has now measured in four separate instruments. So the shape is
     asserted as part of the arm rather than trusted. */
  const stamped = LANDED["basis-version"].at;
  const secondOf = () => new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const stampWellFormed = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(String(stamped));
  if (stampWellFormed) {
    while (secondOf() === stamped) await new Promise((r) => setTimeout(r, 60));
    await new Promise((r) => setTimeout(r, 120));
  }
  const late = drive(await suggest({ kind: "basis-version", ...KIND_ARGS["basis-version"],
    name: "the same reading a whole second later" }));
  t("D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER: the same reading submitted after the wall "
  + "clock has moved past the second the original was stamped in is the SAME reading, and the write gate "
  + "says so. §6 rule 8 is about what a reading SAYS, and when it was recorded is not part of that — a "
  + "gate that fired only inside one second was unenforced against every retry loop that paused",
    [stampWellFormed, stamped !== secondOf(), late.ok, late.code, late.check, late.same_as],
    [true, true, false, "SUGGEST_NOT_DIFFERENT", "C-27.10", "the ledger account"]);
}

/* ------------------------------------------------------------------ D-234
   CHECK 3's SECOND, INDEPENDENT DEFEAT — AND THERE IS NO CLOCK IN IT.
   `#fmSafe` rewrites `"` and `\` to `'`, folds newlines to spaces and TRIMS
   every authored field on its way into the document. Until REC-75 the candidate
   this check compares was composed from RAW ARGS, so the composition derived
   from what was WRITTEN could never equal the composition derived from what was
   SUBMITTED whenever any of those characters appeared. A member who typed a
   quotation mark did not get the duplicate check — always, and with nothing
   going red to say so, which is what makes this worse than D-231's flake.
   EVERY ARM BELOW SUBMITS ITS DUPLICATE MILLISECONDS AFTER THE BASE, so the
   clock cannot be what refuses them; the D-231 boundary arm above is what proves
   the clock half independently, and `suggest.control.mjs` arms each half with
   the other held open. */
{
  /* THE BASE CARRIES THE DOUBLE QUOTES, and it is that way round on purpose:
     the record can only hold `'`, so this reading is the one whose PUBLISHED
     bytes differ from the bytes that were sent. That difference is the subject
     of the publication arms below as well as the input to the duplicate arms. */
  const QUOTED = (over = {}) => ({
    kind: "basis-version", relationship: "and",
    description: `The contract names the counterparty as "to be named", and the unfilled blank is what this reading rests on.`,
    grounds: [{ ground: "the audit",
                statement: `The form's own words are "to be named".` }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit",
             note: `The blank sits on page 4 of the "award form".` }],
    ...over,
  });
  const base = drive(await suggest(QUOTED({ name: "the unfilled counterparty" })));
  t("D-234 FIXTURE: a reading whose description, ground statement and leg note all carry DOUBLE QUOTES "
  + "lands — the restricted frontmatter grammar has no escapes, so the plane sanitises rather than "
  + "refuses, and that sanitising is the whole mechanism this block is about",
    [base.ok, base.state], [true, "suggested"]);

  /* -------- WHAT `composition` PUBLISHES, REC-75's decision, ASSERTED ------
     It publishes THE RECORD'S BYTES and says so in `composition_of`. Before
     REC-75 it published the CANDIDATE's, built from raw args — so this very
     submission handed the caller bytes the record does not hold and nothing
     said so. The arm is written as an INEQUALITY as well as an equality: the
     published value must NOT be what was sent. */
  t("REC-75 — `composition` PUBLISHES THE RECORD'S BYTES, NOT THE CALLER'S, and the answer SAYS WHICH: "
  + "the submission carried `\"to be named\"` and the published composition carries `'to be named'`, "
  + "because that is what the document holds. M0-13's rider settled — the divergence existed already "
  + "and was invisible; publishing the record's side closes it by construction",
    [base.composition_of,
     typeof base.composition === "string" && base.composition.includes(`'to be named'`),
     typeof base.composition === "string" && base.composition.includes(`"to be named"`)],
    ["record", true, false]);
  {
    const answer = await read();
    const stored = (answer.versions ?? []).find((v) => v.name === "the unfilled counterparty");
    t("AND IT IS THE SAME STRING `op=basisversions` PUBLISHES FOR THAT VERSION — two readers of one row "
    + "agreeing about it, driven across two ops rather than asserted at the helper. A consumer can "
    + "compare them and get one answer, which is the property that makes `composition_of` checkable",
      [typeof stored?.composition === "string", stored?.composition === base.composition],
      [true, true]);
  }

  /* -------- THE LOSSY TRANSFORMS, ONE ARM EACH, ALL DRIVEN ---------------- */
  const dupOf = async (label, over) =>
    drive(await suggest(QUOTED({ name: label, ...over })));

  /* THE ARM THE ITEM EXISTS FOR, AND THE DIRECTION MATTERS — MEASURED, because
     the first spelling of this arm had NO TEETH. This duplicate is the base
     VERBATIM under a new name: same double quotes, same everything. Before
     REC-75 the candidate carried `"` while the held reading carried the `'` the
     write had already made of it, so the two could never match and this LANDED.
     A member typing a quotation mark did not get the duplicate check at all. */
  const q1 = await dupOf("the same quoted reading under a new name", {});
  t("D-234 (1) THE QUOTATION MARK: a VERBATIM duplicate of a reading whose fields carry `\"` is REFUSED "
  + "by C-number — before REC-75 it landed, because the gate compared what was WRITTEN against what was "
  + "SUBMITTED and `#fmSafe` sits between them. §6 rule 8 was unenforced for every member who typed a "
  + "quotation mark, deterministically and with nothing going red",
    [q1.ok, q1.code, q1.check, q1.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "C-27.10", "the unfilled counterparty"]);

  /* THE CROSS-SPELLING ARM, AND IT IS KEPT WITH ITS FINDING ATTACHED. Written
     first as the item's headline arm, it came back GREEN OVER THE BROKEN PLANE:
     a caller that sends `'` sends the value the record ALREADY holds, so the raw
     candidate and the stored bytes coincided by accident and the duplicate was
     refused even before REC-75. It is a true statement about the plane and a
     USELESS control, so it is labelled as such rather than left looking like
     evidence — a surprising green is a finding about the arm. */
  const q1b = await dupOf("the same reading in single quotes", {
    description: `The contract names the counterparty as 'to be named', and the unfilled blank is what this reading rests on.`,
    grounds: [{ ground: "the audit", statement: `The form's own words are 'to be named'.` }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit",
             note: `The blank sits on page 4 of the 'award form'.` }] });
  t("AND THE SAME READING SPELLED WITH `'` IS REFUSED TOO — the record cannot tell the two spellings "
  + "apart, so they are one reading. NOTE: this arm was ALREADY green before REC-75, because a caller "
  + "sending `'` sends what the record already holds; it proves the rule, not the fix, and is labelled "
  + "so nobody reads it as the fix's evidence",
    [q1b.ok, q1b.code, q1b.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "the unfilled counterparty"]);

  const q2 = await dupOf("the same reading with a backslash", {
    grounds: [{ ground: "the audit", statement: `The form's own words are \\to be named\\.` }] });
  t("D-234 (2) THE BACKSLASH: `#fmSafe` maps `\\` to `'` exactly as it maps `\"`, so a ground statement "
  + "differing only in that character is the same statement once stored, and is REFUSED",
    [q2.ok, q2.code, q2.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "the unfilled counterparty"]);

  const q3 = await dupOf("the same reading across two lines", {
    description: `The contract names the counterparty as "to be named",\nand the unfilled blank is what this reading rests on.` });
  t("D-234 (3) THE NEWLINE: the grammar is single-line, so `#fmSafe` folds a newline to a space and the "
  + "two descriptions are one description in the document. REFUSED",
    [q3.ok, q3.code, q3.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "the unfilled counterparty"]);

  const q4 = await dupOf("the same reading with padding", {
    description: `   The contract names the counterparty as "to be named", and the unfilled blank is what this reading rests on.  ` });
  t("D-234 (4) THE TRAILING AND LEADING SPACE: `#fmSafe` trims, so padding is not part of what the "
  + "record holds and cannot be what makes a reading new. REFUSED",
    [q4.ok, q4.code, q4.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "the unfilled counterparty"]);

  const q5 = await dupOf("the same reading with a requoted note", {
    legs: [{ target: AUDIT, role: "supports", ground: "the audit",
             note: `The blank sits on page 4 of the 'award form'.` }] });
  t("D-234 (5) AND IT IS NOT ONLY THE VERSION ROW — a LEG's note takes the same transform, so a "
  + "duplicate differing only in the punctuation of a note is REFUSED too. The fix is one normaliser "
  + "over every persisted field, not a patch on the description",
    [q5.ok, q5.code, q5.same_as],
    [false, "SUGGEST_NOT_DIFFERENT", "the unfilled counterparty"]);

  /* -------- D-234's NARROWER HALF: THE STATEMENT THAT IS NOT WRITTEN ------
     `gRows` emits `statement:` only when the value is non-blank while the
     candidate passed `g.statement ?? null` unconditionally. A BLANK-BUT-PRESENT
     statement therefore composed two ways. It needs its own base, because the
     base above carries a real statement. */
  const noStatement = drive(await suggest({ kind: "basis-version", name: "a part with nothing said about it",
    description: "The audit bears on the transfers, and this reading declines to say more about how.",
    relationship: "and", grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit" }] }));
  const blankDate = drive(await suggest({ kind: "basis-version",
    name: "a part with a blank date on its leg",
    description: "The audit bears on the transfers, and this reading declines to say more about how.",
    relationship: "and", grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit", date: "   " }] }));
  t("D-234 (6) A FIELD THE WRITE OMITS IS NOT A FIELD: a leg carrying a whitespace-only `date` composes "
  + "with NO date, because that is what the document will hold — so it is the same reading and is "
  + "REFUSED. This is the half of D-234 that is about a line NOT BEING WRITTEN rather than about a "
  + "character being rewritten, and before REC-75 the candidate carried the blank and it LANDED",
    [noStatement.ok, blankDate.ok, blankDate.code, blankDate.same_as],
    [true, false, "SUGGEST_NOT_DIFFERENT", "a part with nothing said about it"]);
  /* A FINDING FROM RUNNING THE ARM RATHER THAN FROM WRITING IT, recorded rather
     than smoothed. D-234's narrower half was first driven through a
     whitespace-only STATEMENT, which is the field the debt row names — and that
     input never reaches CHECK 3 at all: `isBoilerplate("   ")` is true, so
     CHECK 5 refuses it several screens earlier. The blank-field divergence is
     real, but the statement is not the field that exposes it; a leg's `date` is,
     because no check upstream looks at one. An arm that had asserted
     SUGGEST_NOT_DIFFERENT over the statement would have been asserting something
     the plane never had a chance to do. */
  const blankStatement = drive(await suggest({ kind: "basis-version",
    name: "a part with a blank said about it",
    description: "The audit bears on the transfers, and this reading declines to say more about how.",
    relationship: "and", grounds: [{ ground: "the audit", statement: "   " }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit" }] }));
  t("AND THE STATEMENT ROUTE IS CLOSED EARLIER, WHICH IS WHY THIS ARM ASSERTS THE OTHER CODE: a "
  + "whitespace-only statement is filler, and CHECK 5 refuses it before the substance comparison is "
  + "reached. Measured, not assumed — the debt row named this field and the plane answers on a "
  + "different one",
    [blankStatement.ok, blankStatement.code], [false, "SUGGEST_BOILERPLATE"]);
  /* MEASURED, AND IT CORRECTS THE DEBT ROW RATHER THAN REPEATING IT. D-234 says
     "an EMPTY-STRING statement composes two ways as well". IT DOES NOT, and the
     arm is kept as the receipt: `#canon` maps both `null` and `""` to the empty
     string, so an empty-string statement and an omitted one ALREADY composed
     identically. Only a BLANK-BUT-NON-EMPTY statement diverged. The row's claim
     was one case too wide, and an arm asserting the wider claim would have been
     asserting something that was never true. */
  const emptyStatement = drive(await suggest({ kind: "basis-version",
    name: "a part with an empty string said about it",
    description: "The audit bears on the transfers, and this reading declines to say more about how.",
    relationship: "and", grounds: [{ ground: "the audit", statement: "" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit" }] }));
  t("AND THE EMPTY-STRING CASE WAS NEVER BROKEN — measured, not assumed, because D-234's own row claims "
  + "it was. `#canon` maps null and \"\" to the same empty field, so this was already refused before "
  + "REC-75. The arm stays as the receipt that the row was one case too wide",
    [emptyStatement.ok, emptyStatement.code], [false, "SUGGEST_NOT_DIFFERENT"]);

  /* -------- THE NAME COMPARISON, THE SAME CLASS ONE FIELD OVER ------------
     `SUGGEST_NAME_TAKEN` compares a CALLER-DERIVED name against STORED names.
     `VERSION_NAME_RE` excludes every character `#fmSafe` rewrites, so most of
     the divergence is unreachable — but a NEWLINE folds to a SPACE, and spaces
     the grammar allows. Before REC-75 this got past the endpoint and was refused
     by `promote` in another family's words, over a document the endpoint had
     already built. */
  const foldedName = drive(await suggest({ kind: "basis-version",
    name: "the ledger\naccount",
    description: "A different reading entirely, submitted under a name that folds onto one already held.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: MINUTES, role: "cuts_against", ground: "paper trail" }] }));
  t("D-234 / THE CLASS SWEEP: a name that FOLDS onto one already held — `the ledger<newline>account` "
  + "becomes `the ledger account` in the document — is refused by THIS endpoint's own name check, by "
  + "name, rather than by `promote` as VERSION_NAME_NOT_UNIQUE over a document that had already been "
  + "composed. Same defect as D-234, one field over: caller bytes compared against stored bytes",
    [foldedName.ok, foldedName.code, foldedName.check],
    [false, "SUGGEST_NAME_TAKEN", SUGGEST_CHECKS.SUGGEST_NAME_TAKEN.check]);
}

/* CHECK 4 (C-27.11) — D-195, independence over the separately sufficient parts. */
{
  const notIndependent = drive(await suggest({ kind: "basis-version", name: "two routes one source",
    description: "A reading offering two routes to the answer, each resting on a copy of one document.",
    relationship: "or",
    grounds: [{ ground: "the audit" }, { ground: "the mirror" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit" },
           { target: MIRROR, role: "supports", ground: "the mirror" }] }));
  t("CHECK 4 / D-195: two parts of a reading that trace to ONE upstream address are REFUSED by C-number "
  + "— *the Judith Miller error with arithmetic behind it*, and the arithmetic is the maximum §12 takes",
    [notIndependent.ok, notIndependent.code, notIndependent.check],
    [false, "SUGGEST_BRANCHES_NOT_INDEPENDENT", "C-27.11"]);
  t("and the shared origin is NAMED rather than merely counted — a member repairing this has to be told "
  + "which material the two parts have in common",
    [notIndependent.shared?.length,
     (notIndependent.shared?.[0]?.through ?? []).some((o) => o === `address:${SHARED_ADDR}`)],
    [1, true]);
  t("DERIVED INFORMS: the derivation is published on the PASSING path too, so a member affirming "
  + "independence at the accept ceremony affirms it against what the record can see — and `[]` means "
  + "the plane LOOKED and found nothing, which is a different fact from nobody having looked",
    [Array.isArray(LANDED["basis-version"].shared_origins),
     LANDED["basis-version"].shared_origins.length,
     LANDED["basis-version"].origins_complete],
    [true, 0, true]);
}

/* CHECK 5 (C-27.12) — no boilerplate. */
{
  const filler = drive(await suggest({ kind: "basis-version", name: "filled in to get past the gate",
    description: "TBD", relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }));
  t("CHECK 5: a required field filled with a placeholder is REFUSED by C-number — the "
  + "`counterparty: to be named` defect at machine scale (§14b.5)",
    [filler.ok, filler.code, filler.check, filler.fields],
    [false, "SUGGEST_BOILERPLATE", "C-27.12", ["description"]]);
  const echo = drive(await suggest({ kind: "sharpen-question", name: "the claim echoes the description",
    description: "This question asks two things at once and they need different evidence entirely.",
    claim: "This question asks two things at once and they need different evidence entirely.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }));
  t("and a second required field REPEATING the first verbatim is the same defect wearing prose — a "
  + "field filled to be non-empty rather than to say anything",
    [echo.ok, echo.code, echo.fields], [false, "SUGGEST_BOILERPLATE", ["claim (repeats the description verbatim)"]]);
  /* THE PREDICATE DRIVEN IN BOTH DIRECTIONS, at the catalog. A matcher that
     says yes to everything is not a matcher, and REC-70 measured exactly that. */
  t("THE PREDICATE IS DRIVEN BOTH WAYS: every named form is boilerplate, and a real sentence is not — "
  + "a matcher that answered yes to everything would pass the arm above while refusing all correct work",
    [BOILERPLATE_FORMS.every((f) => isBoilerplate(f)),
     BOILERPLATE_FORMS.every((f) => isBoilerplate(f.toUpperCase())),
     isBoilerplate("The ledger records three transfers the minutes never authorised."),
     isBoilerplate("   "), isBoilerplate("<name>"), isBoilerplate("...")],
    [true, true, false, true, true, true]);
  t("and the roster is NON-TRIVIAL — a walk over an empty roster reports every field clean and "
  + "congratulates itself, which is the shape three instruments took this week",
    BOILERPLATE_FORMS.length >= 15, true);
}

/* CHECK 6 (C-27.13) — nothing in it is in a state the session may not write. */
{
  const decided = drive(await suggest({ kind: "basis-version", name: "arriving already accepted",
    description: "A reading that tries to arrive already adopted, which is a member act it cannot reach.",
    relationship: "and", state: "accepted", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }));
  t("CHECK 6: a submission arriving ALREADY DECIDED is REFUSED by C-number and the offending fields are "
  + "NAMED — §4: the AI holds no op that accepts",
    [decided.ok, decided.code, decided.check, decided.fields],
    [false, "SUGGEST_UNWRITABLE_STATE", "C-27.13", ["state"]]);
  const hidden = drive(await suggest({ kind: "basis-version", name: "arriving already hidden",
    description: "A reading that tries to arrive hidden, which is the prune flag and a member's act.",
    relationship: "and", hidden: true, grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }));
  t("and the same refusal covers hiding, signing and dating — every one of them a member act (§6 rule 4) "
  + "reachable only through PL-2's six ops",
    [hidden.ok, hidden.code, hidden.fields], [false, "SUGGEST_UNWRITABLE_STATE", ["hidden"]]);
  /* THE SECOND CONDITION UNDER THIS CODE, asserted separately because the
     control neuters them separately. */
  /* CORRECTED 2026-08-09 BY PL-19, WHICH LANDED DEC-65's SHAPE (b). NOT
     EXEMPTED, AND THE OLD ASSERTION WAS RIGHT WHEN IT WAS WRITTEN.
     PL-3 asserted that a machine credential submitting a reading that RESTS on
     documents is refused, full stop — and that WAS the rule: FL-3 measured this
     very guard refusing on `legsIn.length > 0`, any leg at all regardless of
     how many parts were declared. It also carried the wrong C-number (C-25.15
     is `VERSION_ORPHAN_ROW`; the rule is C-25.6), corrected at the guard in the
     same turn.
     WHAT CHANGED, AND IT IS A RULING RATHER THAN A RELAXATION: DEC-65 permits a
     machine to compose a reading declaring EXACTLY ONE part, because with one
     part there is no maximum to take and DEC-32's conservative weakest-leg
     answer is what the arithmetic gives either way. The refusal therefore moves
     from "any leg" to "more than one part", and BOTH SIDES ARE DRIVEN HERE —
     the old fixture is kept as the accepting arm rather than deleted, because a
     licence asserted only on the side that passes is a licence with no bound. */
  const machineOnePart = drive(await suggest({ kind: "basis-version", name: "a machine composing one part",
    description: "A reading resting on a document, submitted by a credential with no member behind it.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] }, "mem-pl3"));
  t("A MACHINE CREDENTIAL MAY NOW COMPOSE A SINGLE-PART READING (DEC-65 shape (b), landed by PL-19): with "
  + "exactly one part there is no maximum to take, so no member is credited with a structural claim they "
  + "did not make — and this guard is the site that FIRES FIRST, so nothing below it was reachable before",
    [machineOnePart.ok, machineOnePart.state, machineOnePart.kind],
    [true, "suggested", "basis-version"]);
  /* AND THE STAMP IS THE POINT OF THE EXEMPTION, read back out of THE RECORD's
     own bytes (`composition_of: "record"`) rather than off the candidate. The
     ground row must NOT carry the machine's identity: this field's published
     meaning is *a member said this part is enough on its own*. */
  t("AND THE ROW IS STAMPED WITH THE EXPLICIT NO-CLAIM VALUE, never the composer's machine identity — the "
  + "whole reason PL-17 minted a third state, checked in the bytes the record holds",
    [machineOnePart.composition_of,
     (machineOnePart.composition ?? "").split("\n").filter((l) => l.startsWith("ground\t"))
       .map((l) => l.split("\t")[2])],
    ["record", [SUFFICIENCY_UNCLAIMED]]);
  const machineTwoParts = drive(await suggest({ kind: "basis-version", name: "a machine cutting two parts",
    description: "A reading whose two halves are said to stand alone, submitted under a machine credential.",
    relationship: "or", grounds: [{ ground: "paper trail" }, { ground: "the audit" }],
    legs: [{ target: LEDGER, role: "supports", ground: "paper trail" },
           { target: AUDIT, role: "supports", ground: "the audit" }] }, "mem-pl3"));
  t("BUT TWO PARTS IS STILL REFUSED BY NAME: there the maximum is live, and choosing which legs are "
  + "separately sufficient is the authored act DEC-32 says only a member reaches. The licence has a "
  + "BOUND and this is it",
    [machineTwoParts.ok, machineTwoParts.code, machineTwoParts.branches ?? machineTwoParts.legs],
    [false, "SUGGEST_UNWRITABLE_STATE", 2]);
  const machineEmpty = await suggest({ kind: "level-empty", name: "a machine reporting an empty level",
    description: "We searched the meaning layer for a superseding reading and found none.",
    relationship: "and", level: "meaning", observed_at: "observation:pl3-meaning-1" }, "mem-pl3");
  t("BUT THE KIND THAT RESTS ON NOTHING IS EXACTLY WHAT A MACHINE MAY WRITE — and that is the point of "
  + "§9's empty-level kind existing, not a hole in the fence",
    [machineEmpty.ok, machineEmpty.state, machineEmpty.kind], [true, "suggested", "level-empty"]);
}

/* ====================================================================== 3
 * F10 — A VERBATIM RESUBMIT IS A STRUCTURAL NO-OP.
 * ====================================================================== */
console.log("\n--- 3. F10: a verbatim resubmit is a structural no-op, not something that churns ---");
{
  const body = { kind: "basis-version", name: "the retry loop's subject",
    description: "A reading resting on a document this record has itself retired, submitted twice.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: STALE, role: "supports", ground: "paper trail" }] };
  const shaBefore = await shaOf(INQ);
  const statsBefore = await GET(`op=stats&token=adm-pl3`);
  const first = await suggest(body);
  const second = await suggest(body);
  const third = await suggest(body);
  t("the first submission is EVALUATED and refused; the second and third return THE SAME refusal WITHOUT "
  + "a second evaluation — F10, and the budget is the backstop rather than the mechanism",
    [first.code, first.evaluated, second.code, second.evaluated, second.repeated, third.evaluated],
    ["SUGGEST_LEG_UNREACHABLE", true, "SUGGEST_LEG_UNREACHABLE", false, true, false]);
  t("the refusal comes back IDENTICAL — same code, same C-number, same canned translation, same detail "
  + "— because it IS the stored one rather than a second one composed to look like it",
    [second.check === first.check, second.translation === first.translation,
     second.detail === first.detail, second.first_refused_at === undefined],
    [true, true, true, false]);
  t("and the RETRY IS COUNTED, which is what makes a loop visible to something other than the budget — "
  + "§15 asks for instruments from the first run",
    [second.repeats, third.repeats], [1, 2]);
  const statsAfter = await GET(`op=stats&token=adm-pl3`);
  t("STRUCTURALLY NOTHING MOVED: the inquiry's bytes are unchanged, its version count is unchanged, and "
  + "ONE refusal row exists for three submissions",
  /* THE LITERAL COUNT IS LOAD-BEARING AND MUST BE RE-MEASURED, NEVER MADE
     RELATIVE — a finding from running the control rather than from writing it.
     REC-75 first replaced this `6` with a delta captured immediately above,
     which is better engineering and QUIETLY DISARMED ANOTHER ITEM'S CONTROL:
     `suggest.control.mjs`'s (D-231a) re-arms the clock, the duplicate two blocks
     up LANDS, and this ABSOLUTE count going 6 -> 7 is the second half of the
     exact 59/2 signature CONDUCT measured in the wild. A relative count is blind
     to a landing that happened before it was taken, so the harness reported the
     arm behaving other than declared — which is the harness working. The number
     moved 6 -> 8 because REC-75's own D-234 fixture lands two readings above;
     re-measure it when you add one, and do not make it relative.
     8 -> 9 on 2026-08-09 (PL-19, DEC-65 shape (b)). CORRECTED BY RE-MEASUREMENT
     AND NOT BY SUBTRACTION, and the reason it moved is the block above rather
     than anything in this one: the machine-credential submission in CHECK 6 used
     to be REFUSED and now LANDS, because it declares exactly one part and DEC-65
     licenses that. One more reading in the fixture, one more in this count. The
     comment above says do not make it relative, and it is still right. */
    [await shaOf(INQ) === shaBefore, (await read()).total,
     statsAfter.suggestRefusals - statsBefore.suggestRefusals],
    [true, 9, 1]);
  /* AND THE KEY DOES NOT GO STALE INTO A FALSE REFUSAL. */
  const landed = await suggest({ kind: "level-empty", name: "the document moves under the key",
    description: "A reading recorded so the inquiry's bytes change beneath the stored refusal.",
    relationship: "and", level: "content", observed_at: "observation:pl3-content-1" });
  const afterMove = await suggest(body);
  t("AND THE KEY CANNOT GO STALE INTO A FALSE REFUSAL: once the inquiry MOVES, the same submission is a "
  + "different question and is EVALUATED again — `base_sha` is part of the submission's identity for "
  + "exactly this reason",
    [landed.ok, afterMove.evaluated, afterMove.repeated], [true, true, false]);
  /* THE RESUBMIT OF A SUCCESS. */
  const again = drive(await suggest({ kind: "basis-version", ...KIND_ARGS["basis-version"] }));
  /* MEASURED, and the measurement corrected what this arm first claimed. A
     VERBATIM resubmit of a landed version carries the same NAME, so C-27.5 —
     the uniqueness rule — is what turns it away, one screen before the substance
     comparison ever runs. The substance check is what catches the RENAMED
     resubmit, which is CHECK 3 above and is driven there. Both are asserted
     because a retry loop can take either shape, and a loop that terminated only
     on one of them would still churn on the other. */
  const renamed = drive(await suggest({ kind: "basis-version", ...KIND_ARGS["basis-version"],
                                        name: "a third name for one reading" }));
  t("a resubmit of a version that LANDED converges too, and BOTH shapes terminate: the verbatim one on "
  + "the name it reuses, the renamed one on the substance it repeats — so a retry loop stops whichever "
  + "way it varies its request",
    [again.ok, again.code, renamed.ok, renamed.code],
    [false, "SUGGEST_NAME_TAKEN", false, "SUGGEST_NOT_DIFFERENT"]);
}

/* ====================================================================== 4
 * DEC-49 — THE DRIVEN CODES EQUAL THE REGISTRY, FLOOR AND CEILING.
 * ====================================================================== */
console.log("\n--- 4. DEC-49: driven codes EQUAL the registry, floor and ceiling ---");
{
  drive(await POST(`op=suggest&token=${RUTH}`, {}));
  drive(await POST(`op=suggest&token=${RUTH}`, { target: LEDGER }));
  drive(await suggest({ kind: "not-a-kind", name: "x" }));
  drive(await suggest({ kind: "basis-version", name: "no run at all", run: "",
    description: "A reading naming no run, which §11 requires of every version." }));
  drive(await suggest({ kind: "basis-version", name: "the ledger account",
    description: "A reading whose name is already taken by another reading of this question.",
    relationship: "and" }));
  drive(await suggest({ kind: "level-empty", name: "an empty level unstated",
    description: "A reading saying a level is empty without saying which level or where the log is." }));
  drive(await suggest({ kind: "basis-version", name: "over the leg bound",
    description: "A reading carrying more legs than one reading may carry.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: Array.from({ length: 200 }, () => ({ target: LEDGER, role: "supports", ground: "paper trail" })) }));
  /* THE FOUR NO CALLER CAN PROVOKE THROUGH A WELL-FORMED CORPUS, kept OUT of the
     wire pin and named here instead. They are added to the DRIVEN set so the
     floor below is a floor over the WHOLE registry rather than over the part a
     fixture happens to reach — but a number read from the registry and compared
     against the registry agrees at zero cost, so they are asserted separately
     and the wire pin stays a pin on what the plane SENT. */
  const UNPROVOKED = ["SUGGEST_UNWRITABLE_DOCUMENT", "SUGGEST_COMPARISON_INCOMPLETE",
                      "SUGGEST_NO_DOCUMENT", "VERSION_KIND_UNKNOWN"];
  for (const c of UNPROVOKED) DRIVEN.add(c);
  console.log(`  ${DRIVEN.size} codes DRIVEN out of the plane, ${Object.keys(SUGGEST_CHECKS).length} in the registry`);
  t("THE DRIVEN SET EQUALS THE REGISTRY — a FLOOR as well as a ceiling, because a ceiling over an empty "
  + "set passes triumphantly",
    [...DRIVEN].sort(), Object.keys(SUGGEST_CHECKS).sort());
  const registry = Object.keys(SUGGEST_CHECKS).sort();
  t("every row carries a C-number in ITS OWN FAMILY, a `where` naming a REGION rather than a whole "
  + "function, and a canned translation that is a sentence rather than a restatement of the code",
    [registry.every((k) => /^C-27\.\d+$/.test(SUGGEST_CHECKS[k].check)),
     registry.filter((k) => SUGGEST_CHECKS[k].where.startsWith("src/store.mjs"))
             .every((k) => / > [\w-]+$/.test(SUGGEST_CHECKS[k].where.split(",")[0])),
     registry.every((k) => SUGGEST_CHECKS[k].translation.split(/\s+/).length >= 12)],
    [true, true, true]);
  t("no two codes share a C-number and no two share a translation — one code, one home (DEC-49)",
    [new Set(registry.map((k) => SUGGEST_CHECKS[k].check)).size,
     new Set(registry.map((k) => SUGGEST_CHECKS[k].translation)).size],
    [registry.length, registry.length]);
  /* DEC-32's elicitation clause 1 and D-226, the bound PL-1's and PL-2's
     families already respect. Asserted of every translation directly. */
  const banned = /\bground\b|\bpartition\b|\bAND\b|\bOR\b/;
  t("and NO member-facing translation says \"ground\", \"partition\", \"AND\" or \"OR\" as a "
  + "member-facing word — DEC-32's elicitation clause 1, D-226",
    registry.filter((k) => banned.test(SUGGEST_CHECKS[k].translation)), []);
  t("AND EVERY C-NUMBER IS PINNED BY NAME AGAINST WHAT THE PLANE SENT — not against the registry the "
  + "numbers were read from, because a literal compared with itself agrees at zero cost",
    Object.fromEntries([...WIRE].sort()),
    { SUGGEST_BOILERPLATE: "C-27.12", SUGGEST_BRANCHES_NOT_INDEPENDENT: "C-27.11",
      SUGGEST_EMPTY_LEVEL_UNSTATED: "C-27.6",
      SUGGEST_LEG_UNREACHABLE: "C-27.8", SUGGEST_NAME_TAKEN: "C-27.5",
      SUGGEST_NOT_AN_INQUIRY: "C-27.2", SUGGEST_NOT_DIFFERENT: "C-27.10",
      SUGGEST_NO_RUN: "C-27.4", SUGGEST_NO_TARGET: "C-27.1",
      SUGGEST_PAIR_DOES_NOT_COMPUTE: "C-27.9", SUGGEST_TOO_MANY_LEGS: "C-27.7",
      SUGGEST_UNKNOWN_KIND: "C-27.3",
      SUGGEST_UNWRITABLE_STATE: "C-27.13" });
  t("and the FOUR no well-formed caller can provoke are NAMED rather than quietly absent — a floor that "
  + "counted only the reachable ones would shrink the moment a fixture stopped reaching one, and read "
  + "as progress",
    UNPROVOKED.map((c) => [c, SUGGEST_CHECKS[c].check]),
    [["SUGGEST_UNWRITABLE_DOCUMENT", "C-27.14"], ["SUGGEST_COMPARISON_INCOMPLETE", "C-27.16"],
     ["SUGGEST_NO_DOCUMENT", "C-27.17"], ["VERSION_KIND_UNKNOWN", "C-27.15"]]);
  /* THE FAMILY IS FREE, asserted rather than assumed — PL-12 paid 102 moved
     references for not asking this before allocating. */
  t("the C-27 family is THIS item's alone: no C-27 number appears in any other check family, and the "
  + "families this item builds on keep every number they had",
    [/C-27\.\d+/.test(readFileSync(join(DIR, "..", "checks", "bio-checks.mjs"), "utf8")
       .replace(/export const SUGGEST_CHECKS[\s\S]*?\n};/, "")
       .replace(/pushSuggest\([\s\S]*?\);/g, "")),
     true], [false, true]);
}

/* ====================================================================== 5
 * THE KIND AT THE DOCUMENT GATE, AND INSIDE THE FREEZE.
 * ====================================================================== */
console.log("\n--- 5. the kind is checked at BOTH gates, and it is inside the freeze ---");
{
  const answer = await read();
  const v = (answer.versions ?? []).find((x) => x.name === "the ledger account");
  t("the kind is IN the canonical composition, so a reading offered as one thing cannot become another "
  + "under a member who already read it",
    /\nkind\tbasis-version\n/.test(String(v?.composition)), true);
  /* AND IT IS EMITTED ONLY WHEN PRESENT — DRIVEN, not reasoned about. PL-1 froze
     every existing version against a composition with NO such line, so an
     unconditional line would change the composition of every version already in
     any record and the next promotion of any of them would fail the freeze. The
     subject is a version a MEMBER composed by hand through op=promote, which is
     the only shape that carries no kind and is exactly the shape at risk. */
  const OLDINQ = "INQ-2026-3000-authored-by-hand";
  {
    const md = inquiryMd(OLDINQ).replace("references: []", [
      "references: []",
      "basis_versions:", '  - name: "an authored reading"',
      '    description: "A reading a member composed by hand, carrying no kind at all."',
      '    relationship: "and"', '    state: "suggested"', "    derived_from: null",
      "    hidden: false",
      "basis_version_grounds:", '  - version: "an authored reading"',
      '    ground: "paper trail"', '    asserted_by: "ruth"', `    at: "${NOW}"`,
      "basis_version_legs:", '  - version: "an authored reading"',
      `    target: "${LEDGER}"`, '    role: "supports"', '    ground: "paper trail"',
    ].join("\n"));
    const r = await promote(OLDINQ, md, "inquiry");
    if (!r.ok) throw new Error(`authored fixture: ${JSON.stringify(r).slice(0, 600)}`);
  }
  const authored = (await GET(`op=basisversions&token=${RUTH}&id=${OLDINQ}&limit=10`)).versions?.[0];
  t("a version carrying NO kind composes with NO kind line — DRIVEN through the plane over a version a "
  + "member authored by hand, because an unconditional line would change the composition of every "
  + "version PL-1 already froze and the next promotion of any of them would fail the freeze",
    [/\bkind\t/.test(String(authored?.composition)), authored?.state,
     /\ndescription\t/.test(String(authored?.composition))],
    [false, "suggested", true]);
  t("AND THE FREEZE STILL HOLDS OVER IT: re-promoting that document unchanged does not fire the freeze, "
  + "which is the arm that says the conditional line is a NO-OP for every version already in a record "
  + "rather than a change nobody measured",
    (await promote(OLDINQ, (await GET(`op=basisversions&token=${RUTH}&id=${OLDINQ}&limit=10`)).ok
       ? inquiryMd(OLDINQ).replace("references: []", [
           "references: []",
           "basis_versions:", '  - name: "an authored reading"',
           '    description: "A reading a member composed by hand, carrying no kind at all."',
           '    relationship: "and"', '    state: "suggested"', "    derived_from: null",
           "    hidden: false",
           "basis_version_grounds:", '  - version: "an authored reading"',
           '    ground: "paper trail"', '    asserted_by: "ruth"', `    at: "${NOW}"`,
           "basis_version_legs:", '  - version: "an authored reading"',
           `    target: "${LEDGER}"`, '    role: "supports"', '    ground: "paper trail"',
         ].join("\n"))
       : "", "inquiry", await shaOf(OLDINQ))).ok, true);
  /* CORRECTED 2026-08-08 BY THIS ITEM'S OWN NEGATIVE CONTROL, and the
     correction is the finding. This arm first asserted the ROW — its C-number
     and its `where` — and control arm (8) neutered the catalog's kind check
     and the suite STAYED GREEN AT 59/59. A control that cannot fail proves
     nothing even when the rule is real: the arm was asserting that a registry
     entry exists, which is true whether or not anything enforces it. It DRIVES
     the refusal now, through op=promote, which is the only door a document with
     a hand-authored kind can come through. */
  const BADKIND = "INQ-2026-3000-a-kind-nobody-recognises";
  const badKindDoc = await promote(BADKIND, inquiryMd(BADKIND).replace("references: []", [
    "references: []",
    "basis_versions:", '  - name: "a reading of no known kind"',
    '    kind: "not-a-kind-anybody-declared"',
    '    description: "A reading whose kind is outside the closed set, authored straight into the file."',
    '    relationship: "and"', '    state: "suggested"', "    derived_from: null",
    "    hidden: false",
    "basis_version_grounds:", '  - version: "a reading of no known kind"',
    '    ground: "paper trail"', '    asserted_by: "ruth"', `    at: "${NOW}"`,
    "basis_version_legs:", '  - version: "a reading of no known kind"',
    `    target: "${LEDGER}"`, '    role: "supports"', '    ground: "paper trail"',
  ].join("\n")), "inquiry");
  t("and a DOCUMENT carrying a kind outside §9's five is REFUSED AT THE WRITE by C-number — DRIVEN "
  + "through op=promote, because a hand-authored file, a replayed revision and a future writer none of "
  + "them go through the endpoint, and asserting that the registry ROW exists proved nothing at all",
    [badKindDoc.ok, badKindDoc.reason,
     (badKindDoc.findings ?? []).map((f) => [f.code, f.check])
       .filter(([c]) => c === "VERSION_KIND_UNKNOWN")],
    [false, "BASIS_VERSION_REFUSED", [["VERSION_KIND_UNKNOWN", "C-27.15"]]]);
  t("AND THE CANNED TRANSLATION TRAVELS WITH IT — DEC-49: the refusal a surface receives carries the "
  + "sentence a member reads instead of the code, from the ONE place it lives",
    (badKindDoc.findings ?? []).find((f) => f.code === "VERSION_KIND_UNKNOWN")?.translation
      === SUGGEST_CHECKS.VERSION_KIND_UNKNOWN.translation, true);
  t("and a document carrying one of the five DOES land — the closed set is a boundary, not a ban on "
  + "hand-authoring, and this is the over-strictness arm for the catalog's half",
    (await promote("INQ-2026-3000-a-kind-that-is-known", inquiryMd("INQ-2026-3000-a-kind-that-is-known")
      .replace("references: []", [
        "references: []",
        "basis_versions:", '  - name: "a reading of a known kind"',
        '    kind: "level-empty"',
        '    description: "A reading whose kind is inside the closed set, authored straight into the file."',
        '    relationship: "and"', '    state: "suggested"', "    derived_from: null",
        "    hidden: false",
      ].join("\n")), "inquiry")).ok, true);
  t("the levels a run may report empty are the four CLAUDE.md names, read from the catalog rather than "
  + "typed here", SUGGEST_LEVELS, ["meaning", "content", "documents", "internet"]);
}

/* ====================================================================== 6
 * OVER-STRICTNESS — the fence must not refuse correct work.
 * ====================================================================== */
console.log("\n--- 6. over-strictness: correct work is not refused ---");
{
  const spanish = await suggest({ kind: "basis-version", name: "la cuenta del registro",
    description: "El libro mayor registra tres transferencias que las actas nunca autorizaron, y eso es lo que sostiene esta lectura.",
    relationship: "and", grounds: [{ ground: "rastro documental" }],
    legs: [{ target: MINUTES, role: "cuts_against", ground: "rastro documental" }] });
  t("a description in Spanish from a named member LANDS — the boilerplate check is a boundary over "
  + "machine filler, not a judge of language",
    [spanish.ok, spanish.state], [true, "suggested"]);
  const quoting = await suggest({ kind: "basis-version", name: "the placeholder is the finding",
    description: "The contract names the counterparty as 'to be named', which is the defect this reading rests on.",
    relationship: "and", grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit", note: "TBD is what the form says, verbatim." }] });
  t("AND A REAL SENTENCE THAT QUOTES A PLACEHOLDER LANDS — matched against the WHOLE field and never as "
  + "a substring, because refusing this would refuse the finding itself",
    [quoting.ok, quoting.state], [true, "suggested"]);
  const dotted = await suggest({ kind: "basis-version", name: "reading 2.1",
    description: "A reading whose name carries a full stop, which a member will use and the grammar allows.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: LEDGER, role: "cuts_against", ground: "paper trail" }] });
  t("a version name carrying a full stop LANDS — PL-1's name grammar allows one deliberately, and a "
  + "fence that refused it would be refusing correct work",
    [dotted.ok, dotted.version], [true, "reading 2.1"]);
  const independent = await suggest({ kind: "basis-version", name: "two genuinely separate routes",
    description: "Two routes to the answer, resting on documents the record can show came from different places.",
    relationship: "or",
    grounds: [{ ground: "the ledger route" }, { ground: "the minutes route" }],
    legs: [{ target: LEDGER, role: "supports", ground: "the ledger route" },
           { target: MINUTES, role: "supports", ground: "the minutes route" }] });
  t("AND TWO PARTS WITH NO SHARED ORIGIN LAND — D-195 refuses a derived overlap, not the practice of "
  + "offering alternatives, and this is the arm that says so",
    [independent.ok, independent.shared_origins?.length], [true, 0]);
  /* D-231's OVER-STRICTNESS ARM, and it is the half that keeps the fix honest.
     D-231 was fixed by blanking the assertion STAMP out of the composition's
     ground rows before the substance comparison. A row is
     `ground\t<ground>\t<asserted_by>\t<at>\t<statement>`, so blanking one field
     too many would swallow the STATEMENT — and two readings that rest on the
     same evidence for DIFFERENT STATED REASONS are two readings. This arm is
     what says the exclusion is exactly one field wide: it differs from 'the
     ledger account' in NOTHING but the statement on its ground, and it must
     LAND. A gate that refuses it is refusing correct work. */
  /* THE NAME CARRIES NO COMMA, AND THAT IS A MEASUREMENT RATHER THAN A STYLE
     CHOICE. This arm was first written as 'the ledger account, read the other
     way' and FAILED — C-25.2's grammar is letters, digits, spaces, '-', '_' and
     '.', so the comma made it an invalid name and the refusal that came back was
     VERSION_NAME_NOT_UNIQUE from `promote`, nothing to do with this arm's
     subject. An over-strictness arm that fails for a reason it did not intend is
     an arm asserting something else, so the finding is recorded here rather than
     quietly corrected. */
  const restated = await suggest({ kind: "basis-version", ...KIND_ARGS["basis-version"],
    name: "the ledger account read the other way",
    grounds: [{ ground: "paper trail",
      statement: "The minutes are read against the ledger, and it is the minutes that fall short." }] });
  t("AND A READING DIFFERING ONLY IN WHAT IT SAYS ITS EVIDENCE SHOWS LANDS — same kind, same "
  + "description, same legs, same declared part, a DIFFERENT statement on that part. The stamp comes out "
  + "of the substance comparison (D-231) and the statement does not, because when a reading was recorded "
  + "is not something it says and why the evidence bears is",
    [restated.ok, restated.state], [true, "suggested"]);

  /* REC-75 / D-234's OVER-STRICTNESS ARMS, AND THEY ARE THE HALF THAT KEEPS
     THIS FIX FROM BECOMING THE WORSE DEFECT.
     The remedy for D-234 is to compare the values the record WILL HOLD. The
     tempting over-reach is to keep going — collapse internal whitespace, strip
     punctuation, fold case — and every one of those would refuse readings that
     the record itself would show as different. `#fmSafe` folds `[\r\n]+` to a
     space and rewrites `"` and `\`; it does NOT touch an internal double space,
     a semicolon, or a curly quote. So the three arms below differ from the base
     in EXACTLY those, and every one of them must LAND. `suggest.control.mjs`'s
     D-234b arm normalises both sides one notch too far and requires these to
     fail — which is what makes them a control rather than decoration. */
  const QBASE = `The contract names the counterparty as "to be named", and the unfilled blank is what this reading rests on.`;
  const overStrict = async (name, description) => await suggest({
    kind: "basis-version", name, description, relationship: "and",
    grounds: [{ ground: "the audit", statement: `The form's own words are "to be named".` }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit",
             note: `The blank sits on page 4 of the "award form".` }] });
  const semi = await overStrict("the unfilled counterparty semicoloned",
    QBASE.replace(`",`, `";`));
  const spaced = await overStrict("the unfilled counterparty double spaced",
    QBASE.replace("blank is", "blank  is"));
  const curly = await overStrict("the unfilled counterparty in curly quotes",
    QBASE.replace(`"to be named"`, `“to be named”`));
  t("REC-75 OVER-STRICTNESS: three readings differing from a held one ONLY in punctuation the document "
  + "PRESERVES — a semicolon for a comma, an internal double space, and CURLY quotes where the base had "
  + "straight ones — all LAND. The comparison normalises exactly as far as the write does and no "
  + "further: two readings whose stored bytes differ ARE two readings, and collapsing them would be the "
  + "opposite defect and the worse one",
    [semi.ok, spaced.ok, curly.ok, semi.code ?? null, spaced.code ?? null, curly.code ?? null],
    [true, true, true, null, null, null]);
  t("AND THE CURLY-QUOTE ARM IS THE ONE IN A SPELLING NOBODY ANTICIPATED — `#fmSafe` rewrites the two "
  + "ASCII characters the grammar cannot carry and leaves every other quotation mark a member might "
  + "paste alone, so a reading that quotes its source with typographic quotes is genuinely different "
  + "from one that quotes it with straight ones, and is not refused as a duplicate",
    [curly.ok, curly.version], [true, "the unfilled counterparty in curly quotes"]);
}

/* ====================================================================== 7
 * THE INSTRUMENT'S OWN GUARDS.
 * ====================================================================== */
console.log("\n--- 7. instrument guards: the source walk is non-trivial and the reader is driven ---");
{
  const body = suggestBlock();
  t("WALK GUARD: the endpoint's body is a BODY and not a signature — this repository has been bitten "
  + "three times in one week by a source walk anchored on a name taking the wrong span, including "
  + "inside the guard built to prevent it",
    [body.length > 6000, body.split("\n").length > 150, /END DEC-49 REGION is-suggest-write/.test(body)],
    [true, true, true]);
  /* THE GUARD FOLLOWS THE WALK IT GUARDS — corrected with the walk above
     (D-235). Over the whole method this now reads 2, because the method's own
     answer legitimately carries `state: recorded.state`; over the WRITE REGION,
     which is what §4's fence is about, the planted line is the only one. */
  t("WALK GUARD: and the same reader over a subject that MUST trip it does trip — a walk that found "
  + "nothing would report a clean state literal count over an empty span",
    [(("x").match(/state: "suggested"/g) || []).length,
     ((decomment(suggestWriteRegion()) + '\n    state: "accepted"').match(/\bstate:(?!\s*"suggested")/g) || []).length,
     body.length > 6000],
    [0, 1, true]);
  t("THE THREE REGIONS THIS ITEM DECLARES ARE ALL CLAIMED BY A ROW — an unclaimed marker tells the next "
  + "reader a span is governed when nothing is governing it, and the DEC-49 guard fails on one",
    [...new Set(Object.values(SUGGEST_CHECKS)
      .map((r) => (r.where.match(/ > ([\w-]+)/) || [])[1]).filter(Boolean))].sort(),
    ["is-suggest-checks", "is-suggest-shape", "is-suggest-write"]);
  t("and every one of the three markers is OPENED and CLOSED in the source",
    ["is-suggest-shape", "is-suggest-checks", "is-suggest-write"].map((r) =>
      [(STORE_SRC.match(new RegExp(`DEC-49 REGION ${r}\\b`, "g")) || []).length,
       (STORE_SRC.match(new RegExp(`END DEC-49 REGION ${r}\\b`, "g")) || []).length]),
    [[2, 1], [2, 1], [2, 1]]);
  /* ONE WRITE PATH, PINNED. PL-1 pinned the version tables at one write site
     each inside `promote`; this item must not have added a second. */
  /* REC-75 / D-234's STRUCTURAL RATCHET, and it is the arm that survives this
     item. D-234 happened because the write derived its values from `args` while
     the comparison derived its own from `args` INDEPENDENTLY. The behavioural
     arms in block 2 catch that for the fields that exist today; this catches it
     for the field somebody adds tomorrow, which is the only kind of coverage
     that lasts. Every value the write quotes must come from `persisted` — `pv`,
     or the `g`/`l` bound over its grounds and legs — and `args` must not appear
     inside the write region at all. */
  {
    const from = STORE_SRC.indexOf("DEC-49 REGION is-suggest-write");
    const to = STORE_SRC.indexOf("END DEC-49 REGION is-suggest-write", from);
    const region = decomment(STORE_SRC.slice(from, to));
    const quoted = [...region.matchAll(/\bq\(([A-Za-z_$][\w$]*)\./g)].map((m) => m[1]);
    t("REC-75: EVERY VALUE THE WRITE QUOTES COMES FROM THE ONE NORMALISER — `args` does not appear in "
    + "the write region at all, so a field added to this endpoint tomorrow cannot be composed from raw "
    + "args on one side of the duplicate gate and from persisted values on the other, which is exactly "
    + "how D-234 arose. The corpus is PRINTED so a narrowing that read nothing cannot pass",
      [from > 0 && to > from, region.length > 1500, quoted.length >= 15,
       [...new Set(quoted)].sort(), (region.match(/\bargs\./g) || []).length],
      [true, true, true, ["g", "l", "pv"], 0]);
    /* THE GUARD RUNS OVER A SYNTHETIC CORPUS AND NEVER OVER THE LIVE REGION, and
       that is a correction made by RUNNING THE CONTROL rather than by writing
       it. Written first as "the live region plus one planted reference", it went
       RED under `suggest.control.mjs`'s (D-234e) arm — which plants exactly such
       a reference — so the guard was measuring the subject instead of the
       reader. A guard coupled to the thing it guards is not a guard. */
    const SYNTH = `const vRow = [\`  - name: \${q(pv.name)}\`, \`  - d: \${q(args.description)}\`];`;
    t("WALK GUARD for that arm: the same reader over a FIXED synthetic span that MUST trip it does trip "
    + "— a walk that took an empty span would report zero offending references and congratulate itself, "
    + "which is the shape three instruments in this repository took in one week",
      [(SYNTH.match(/\bargs\./g) || []).length,
       [...new Set([...SYNTH.matchAll(/\bq\(([A-Za-z_$][\w$]*)\./g)].map((m) => m[1]))].sort()],
      [1, ["args", "pv"]]);
  }
  const writes = (STORE_SRC.match(/(INSERT|REPLACE|UPDATE)\s+(OR\s+\w+\s+)?(INTO\s+)?inquiry_basis_versions?\b/g) || []).length;
  t("ONE WRITE SITE STILL: the suggest endpoint appends to `bundle.md` and re-promotes, and holds no "
  + "INSERT into either version table — PL-1's pin, re-asserted from the other side",
    [writes, /INSERT INTO inquiry_basis_versions/.test(suggestBlock())], [1, false]);
}

/* ====================================================================== 8
 * D-235 — ONE ANSWER, TWO SOURCES, AND IT NOW SAYS WHICH IS WHICH.
 *
 * REC-75 settled what `composition` publishes — THE RECORD'S BYTES, read back
 * from the projection and labelled `composition_of: "record"` — and raised
 * D-235 at its own landing because the SAME answer's `version`, `kind`, `run`,
 * `state`, `author`, `at`, `legs`, `count`, `grounds` and `ground_count` were
 * still caller- or candidate-derived and carried no label at all. **One answer
 * sourced from two places with only one of them named is REC-74's shape — two
 * readers of one row disagreeing about which of its facts exist — arriving
 * inside a single answer instead of across two ops.**
 *
 * THE DECISION, AND IT IS THE ONE REC-75's SHAPE ALREADY IMPLIED:
 *
 *   - a field that is a fact ABOUT THE VERSION is READ BACK out of the record
 *     after the write, through the SAME reader `op=basisversions` uses — one
 *     reader, two consumers, no second computation to drift. A candidate taught
 *     the projection's shape would agree with it only until somebody changed
 *     one of them, which is the hand-copy failure this repository has measured
 *     five times;
 *   - a field the record does NOT hold — the strength pair, the independence
 *     derivation, the bounds this call ran under — says so rather than being
 *     quietly mixed in with bytes that are the record's;
 *   - and the answer publishes `fields_of`, ONE SOURCE PER FIELD, **computed
 *     from the groups the answer is assembled out of rather than typed**, so a
 *     field added tomorrow cannot arrive without saying where its bytes came
 *     from. A hand-written list of field names is a list of spellings and goes
 *     stale the moment a fourth is written; the totality arm below is what
 *     makes the label unfalsifiable-proof rather than decorative.
 *
 * THE TWO DIVERGENCES THE BEHAVIOURAL ARMS DRIVE ARE LIVE AND WERE MEASURED BY
 * DRIVING THE PLANE BEFORE THE FIX, never read off the source. Both are the
 * `[\r\n]` -> SPACE fold, which is the one `#fmSafe` transform the version-name
 * and ground-label grammars ADMIT on the written side (`VERSION_NAME_RE` and
 * `GROUND_LABEL_RE` both allow a space and neither allows a quote), so it is
 * the transform that reaches the record and the caller's copy alike.
 * ====================================================================== */
console.log("\n--- 8. D-235: the answer names the source of every field it publishes ---");
{
  const inRecord = async (name) => ((await read()).versions ?? []).find((v) => v.name === name) ?? null;

  /* ---- (1) THE NAME THE RECORD ACTUALLY HOLDS -----------------------------
     A name that FOLDS onto nothing already held is not refused — REC-75's
     `SUGGEST_NAME_TAKEN` fix only catches a fold onto an EXISTING name — so it
     lands, and the record holds `the folded reading name`. Before D-235 the
     answer echoed the submitted spelling, so a caller that fed `version` back
     as `derived_from` addressed a reading that does not exist. */
  const folded = drive(await suggest({ kind: "basis-version",
    name: "the folded\nreading name",
    description: "A reading submitted under a name the restricted grammar will fold before it stores it.",
    relationship: "and", grounds: [{ ground: "paper trail" }],
    legs: [{ target: MINUTES, role: "supports", ground: "paper trail" }] }));
  const foldedHeld = await inRecord("the folded reading name");
  t("D-235 (1) `version` PUBLISHES THE NAME THE RECORD HOLDS: a submission named `the folded<newline>"
  + "reading name` is stored as `the folded reading name`, and the answer says so rather than echoing "
  + "what was sent. A caller feeding the old answer's `version` back as `derived_from` addressed a "
  + "reading that does not exist — the record's own address, published wrong",
    [folded.ok, folded.version, foldedHeld?.name ?? null, folded.version === (foldedHeld?.name ?? null)],
    [true, "the folded reading name", "the folded reading name", true]);

  /* ---- (2) THE PART LABELS THE RECORD ACTUALLY HOLDS ---------------------
     `grounds` was `declaredLabels`, taken from the RAW submission: CHECK 2
     compares the declared set against the used set and both sides are raw, so
     the two agree with each other and neither agrees with the document. */
  const foldedPart = drive(await suggest({ kind: "basis-version",
    name: "the reading whose part folds",
    description: "A reading declaring its separately sufficient part under a label the document will fold.",
    relationship: "and", grounds: [{ ground: "paper\ntrail" }],
    legs: [{ target: LEDGER, role: "cuts_against", ground: "paper\ntrail" }] }));
  const partHeld = await inRecord("the reading whose part folds");
  t("D-235 (2) `grounds` PUBLISHES THE PART LABELS THE RECORD HOLDS: a part declared as `paper<newline>"
  + "trail` is stored as `paper trail`, and the answer publishes the stored spelling. The old answer's "
  + "`grounds` came from the raw submission, and CHECK 2 could not see it — that check compares the "
  + "DECLARED set against the USED set and both of them are raw, so the two agreed with each other and "
  + "neither agreed with the document",
    [foldedPart.ok, foldedPart.grounds, foldedPart.ground_count, partHeld?.grounds ?? null],
    [true, ["paper trail"], 1, ["paper trail"]]);

  /* ---- (3) THE WHOLE ANSWER AGAINST THE OTHER READER OF THE SAME ROW -----
     TEN FACTS, DRIVEN ACROSS TWO OPS rather than asserted at the helper, which
     is what REC-75's single `composition` arm did for one of them. The corpus
     is PRINTED and FLOORED: a mapping that had gone empty would compare nothing
     and pass, which is the shape three instruments in this repository took in
     one week. */
  /* WHAT THIS ARM CANNOT SEE, AND IT IS A FINDING RATHER THAN AN OMISSION.
     `kind` IS ABSENT FROM THIS MAP BECAUSE `op=basisversions` DOES NOT PUBLISH
     IT AT ALL. Measured, not read: the first run of this arm came back
     `["kind!=kind", "legs!=legs"]`, and only one of those was the defect D-235
     names. The projection STORES `kind` — PL-3 put it in the composition and
     therefore inside the freeze, because what a run PROPOSED a reading as is
     part of what the version IS — and the read op's answer never carries it.
     That is a stored-and-never-published field, REC-74's own subject one op
     over, and it is DELEGATED rather than folded in here: adding a field to a
     read op is a different act with a different blast radius from labelling the
     source of a write op's answer. So `kind` is still LABELLED `record` on the
     answer below (it is read back from the projection row) and simply cannot be
     cross-checked against the other reader, because the other reader is silent
     about it. Saying so is the point — a thing the matcher cannot see must be
     NAMED, never silently scored zero. */
  const MAP = { version: "name", run: "run", state: "state", author: "author",
                at: "at", legs: "legs", count: "leg_count", grounds: "grounds",
                composition: "composition" };
  /* THE FIXTURE'S NAME FOLDS TOO, AND THAT IS A CORRECTION MADE BY RUNNING THE
     CONTROL RATHER THAN BY WRITING IT. This arm was first driven under a plain
     name, and `suggest.control.mjs`'s (D-235b) — which re-sources `version` from
     the submission — printed `WRONG: expected an assertion naming "D-235 (3)" to
     FAIL and none did`. The reason is exactly REC-75's own receipt one field
     over: **a re-sourced field is invisible wherever the two sources agree**,
     and under a name the document keeps verbatim they agree. So the fixture
     carries a fold, and this arm genuinely covers `version` instead of covering
     it in appearance only. */
  const quoted = drive(await suggest({ kind: "basis-version",
    name: "every field\nread back",
    description: `A reading whose fields carry the "" the document cannot hold, so the two sources cannot agree by accident.`,
    relationship: "and",
    grounds: [{ ground: "the audit", statement: `The form's own words are "unstated".` }],
    legs: [{ target: AUDIT, role: "supports", ground: "the audit", grade: "B",
             grade_axis: "capture", grade_source: "capture",
             note: `The blank sits on page 9 of the "award form".`, date: "2026-06-01" }] }));
  const heldQ = await inRecord("every field read back");
  const disagree = Object.entries(MAP)
    .filter(([a, b]) => JSON.stringify(quoted[a]) !== JSON.stringify(heldQ?.[b]))
    .map(([a, b]) => `${a}!=${b}`);
  console.log(`      corpus: ${Object.keys(MAP).length} field(s) compared across op=suggest and op=basisversions`);
  t("D-235 (3) EVERY CROSS-CHECKABLE RECORD-SOURCED FIELD IS THE SAME FACT `op=basisversions` PUBLISHES "
  + "FOR THAT VERSION — nine of them, driven across two ops rather than asserted at the helper, over a "
  + "submission carrying characters the document cannot hold so the two sources cannot coincide by "
  + "accident. REC-75 proved this for `composition` alone; the rest of the answer was the half D-235 "
  + "named. `kind` is NOT in the corpus and the comment above says why: the other reader is silent "
  + "about it",
    [quoted.ok, heldQ !== null, disagree, Object.keys(MAP).length >= 9],
    [true, true, [], true]);
  t("AND THE LEGS ARE THE PROJECTION'S OWN ROWS, ORDINAL AND ALL — the candidate's legs carried no "
  + "`ord`, so the two readers of this one row published leg objects of DIFFERENT SHAPE and a consumer "
  + "joining them had to know which op it had asked",
    [Array.isArray(quoted.legs), quoted.legs?.length, quoted.legs?.[0]?.ord,
     Object.keys(quoted.legs?.[0] ?? {}).sort().join(",")],
    [true, 1, 0, "at,grade,grade_axis,grade_source,ground,note,ord,role,target_id,target_type"]);

  /* ---- (4) THE LABEL, AND IT IS TOTAL --------------------------------------
     THE ARM THAT OUTLIVES THE ITEM. The behavioural arms above catch the fields
     that exist today; this catches the field somebody adds tomorrow. `fields_of`
     is COMPUTED from the three groups the answer is assembled out of, so a key
     that reaches the answer without belonging to a group is missing from the
     label and this arm fails naming it. */
  const keys = Object.keys(quoted).sort();
  const labelled = Object.keys(quoted.fields_of ?? {}).sort();
  const sources = [...new Set(Object.values(quoted.fields_of ?? {}))].sort();
  t("D-235 (4) THE LABEL IS TOTAL OVER THE ANSWER'S OWN KEYS — every field published carries a source "
  + "and no source names a field that is not published. This is the arm that lasts: a field added to "
  + "this endpoint tomorrow and returned without a source FAILS HERE, which a list of field names "
  + "written out by hand could never do because it goes stale the moment a fourth is added",
    [keys.length >= 20, JSON.stringify(keys) === JSON.stringify(labelled),
     keys.filter((k) => !labelled.includes(k)), labelled.filter((k) => !keys.includes(k)), sources],
    [true, true, [], [], ["call", "derived", "label", "record"]]);
  t("AND THE PARTITION IS THE DECISION, PINNED: the facts ABOUT THE VERSION are `record`, the "
  + "derivations the record does not hold are `derived`, and what is true of this CALL rather than of "
  + "the version is `call`. A field silently reclassified from `record` to anything else would be the "
  + "answer quietly withdrawing a claim, and this is what says so",
    [["version", "kind", "run", "state", "author", "at", "legs", "count", "grounds", "ground_count",
      "composition", "target", "bundleSha", "rowVersion"].map((k) => quoted.fields_of?.[k]),
     ["pair", "shared_origins", "origins_complete"].map((k) => quoted.fields_of?.[k]),
     ["ok", "weight", "limit", "truncated", "origin_limit", "evaluated", "repeated", "wrote",
      "read_back"].map((k) => quoted.fields_of?.[k])],
    [Array(14).fill("record"), Array(3).fill("derived"), Array(9).fill("call")]);
  t("AND `composition_of` STILL SAYS `record` — REC-75's field is kept rather than replaced, because a "
  + "consumer reading it today must keep reading it, and `fields_of` must agree with it rather than "
  + "become a second answer to one question",
    [quoted.composition_of, quoted.fields_of?.composition, quoted.read_back],
    ["record", "record", true]);

  /* ---- (5) OVER-STRICTNESS ------------------------------------------------
     The label must not change what LANDS, and the read-back must not turn an
     honestly empty collection into a missing one. §9's empty-level kind is the
     case that matters: it holds no legs and declares no parts, and `[]`/`0`
     there is a fact about the record rather than a failure to read it. */
  const empty = drive(await suggest({ kind: "level-empty", name: "nothing at the content level either",
    description: "We read every document this question rests on and none of them speaks to the transfer basis.",
    relationship: "and", level: "content", observed_at: "observation:d235-content-1" }));
  const emptyHeld = await inRecord("nothing at the content level either");
  t("D-235 OVER-STRICTNESS: §9's empty-level kind still LANDS, and its empty collections are the "
  + "RECORD'S empty collections — `[]` and `0` read back rather than defaulted. An answer that had to "
  + "invent them would be exactly the shape the read-back exists to remove, and a kind that rests on "
  + "nothing is the one a machine may write",
    [empty.ok, empty.legs, empty.count, empty.grounds, empty.ground_count, empty.truncated,
     emptyHeld?.legs?.length ?? null, emptyHeld?.grounds ?? null],
    [true, [], 0, [], 0, false, 0, []]);
  /* THE LEG THAT NAMES NO PART, and the arm exists to say WHICH of the two
     answers the plane gives — because `basisVersionsOf` writes `ground: ""` for
     such a leg and a `[""]` in a list of *the parts this reading declares* is a
     part nobody declared. Whether the record can hold one at all is a
     MEASUREMENT and not a reading: C-25.5 is quoted in this endpoint as
     requiring a version's partition to be TOTAL, and whether that refuses at
     `promote` or only at CHECK 2 decides whether the blank filter in
     `#versionCollections` is load-bearing or defensive. The assertion records
     the answer either way, so the next reader does not have to re-derive it. */
  const unlabelled = drive(await suggest({ kind: "basis-version", name: "a reading whose leg names no part",
    description: "A reading resting on one document and declaring no separately sufficient part at all.",
    relationship: "and",
    legs: [{ target: MINUTES, role: "supports" }] }));
  t("D-235 (5) A LEG THAT NAMES NO PART IS REFUSED AT `promote`, SO `op=suggest` CANNOT PRODUCE THE "
  + "BLANK LABEL — measured, not read. C-25.5 requires a version's partition to be TOTAL and the "
  + "document gate enforces it, which is what makes the blank filter in `#versionCollections` a REPLAY "
  + "concern rather than a live one on this path. Recorded so the next reader does not re-derive it",
    [unlabelled.ok, unlabelled.code], [false, "BASIS_VERSION_REFUSED"]);

  /* ---- AND THE PATH THAT IS EXEMPT FROM THAT GATE, DRIVEN ------------------
     THE SHAPE ARM IS `!pkg.replay`, and it says why in `promote`: *the record's
     own history must be holdable verbatim*. So a REPLAYED inquiry document may
     carry a version whose leg names no part, `basisVersionsOf` projects that leg
     with `ground: ""`, and before D-235 `op=basisversions` published `[""]` in
     `grounds` — a list of *the parts this reading declares* containing a part
     nobody declared. That is the record claiming something the document does not
     say, on the one path that exists precisely so the record can hold its past.
     DRIVEN ON ITS OWN INQUIRY so nothing above is disturbed. */
  {
    const RINQ = "INQ-2026-3000-replayed-partition";
    await mustPromote(RINQ, inquiryMd(RINQ), "inquiry");
    const withUnlabelledLeg = inquiryMd(RINQ).replace("visuals: []", [
      "visuals: []",
      "basis_versions:",
      `  - name: "held from before the rule"`,
      `    kind: "basis-version"`,
      `    description: "A reading the record already held, whose leg names no separately sufficient part."`,
      `    relationship: "and"`,
      `    state: "suggested"`,
      `    hidden: false`,
      `    derived_from: null`,
      `    run: "${RUN}"`,
      `    author: "ruth"`,
      `    at: "${LATER}"`,
      "basis_version_legs:",
      `  - version: "held from before the rule"`,
      `    target: "${MINUTES}"`,
      `    role: "supports"`].join("\n"));
    const replayed = await POST(`op=promote&token=${RUTH}`, {
      bundleId: RINQ, base: await shaOf(RINQ), replay: true,
      snapKey: `${RINQ}-replay`,
      files: [{ path: "bundle.md", text: withUnlabelledLeg,
                bytes: withUnlabelledLeg.length, sha256: sha(withUnlabelledLeg) }],
      meta: { object_type: "inquiry", group: "believe-in-oakland", title: `Bundle ${RINQ}`,
              current_state: "open", created: NOW, last_updated: LATER } });
    const held = ((await GET(`op=basisversions&token=${RUTH}&id=${RINQ}&limit=10`)).versions ?? [])[0];
    t("D-235 (5b) AND THE REPLAY PATH IS WHERE THE BLANK LABEL IS REACHABLE, DRIVEN END TO END: a "
    + "replayed document carrying a leg that names no part projects that leg with `ground: \"\"`, and "
    + "`op=basisversions` used to publish `[\"\"]` as a declared part. The leg is still published — the "
    + "filter drops the LABEL and never the leg, because the leg is a fact and the empty label is not a "
    + "part anybody declared",
      [replayed.ok, held?.name ?? null, held?.grounds ?? null,
       held?.legs?.length ?? null, held?.legs?.[0]?.ground ?? null, held?.leg_count ?? null],
      [true, "held from before the rule", [], 1, "", 1]);
  }
  const plain = drive(await suggest({ kind: "basis-version", name: "a reading with no punctuation at all",
    description: "A reading whose every field is spelled in characters the document keeps exactly as sent.",
    relationship: "and", grounds: [{ ground: "the audit" }],
    legs: [{ target: AUDIT, role: "cuts_against", ground: "the audit" }] }));
  t("AND A SUBMISSION THE DOCUMENT KEEPS VERBATIM IS UNCHANGED BY ANY OF THIS — the read-back is not a "
  + "transform, so correct work in a spelling the record preserves comes back exactly as it was sent",
    [plain.ok, plain.version, plain.grounds, plain.fields_of?.version],
    [true, "a reading with no punctuation at all", ["the audit"], "record"]);

  /* ---- (6) THE STRUCTURAL PIN --------------------------------------------
     REC-75's own receipt, applied to this half: reverting a read-back to the
     candidate is INVISIBLE to a behavioural arm whenever the two agree, and
     after REC-75 they agree for every field except the two the folds above
     expose. So the source is pinned over the SOURCE as well as over the wire —
     the answer's record group may name only the read-back and the promotion,
     and never the candidate, the submitted collections or the derivations. */
  {
    /* INVERTED, AND THE INVERSION IS A CORRECTION MADE BY RUNNING THE CONTROL.
       This arm was first written as a BANNED LIST — `candidate`, `legsIn`,
       `declaredLabels`, `args.` — and `suggest.control.mjs`'s (D-235b) walked
       straight past it, because re-sourcing the version name reintroduces the
       local `name`, which was not on the list and could not sensibly be added
       (`\bname` also matches `recorded.name`). **A list of spellings goes stale
       the moment a fourth is written, and this one was stale before it ran.**
       So the arm asks what makes a value recognisable IN PRINCIPLE: every root
       identifier in the group must come from the APPROVED set — the read-back,
       the promotion's receipt, and the gated bundle row — and anything else,
       whatever it is called, fails. The roots are PRINTED so a narrowing that
       matched nothing cannot pass as a clean result. */
    const rootsOf = (src) => [...new Set([...src
      .replace(/(^|,)\s*[\w$]+\s*:/gm, "$1")
      .matchAll(/(?:^|[^.\w$])([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))]
      .filter((n) => !["null", "true", "false", "const", "fromRecord"].includes(n)).sort();
    const at = STORE_SRC.indexOf("const fromRecord = {");
    const to = STORE_SRC.indexOf("};", at);
    const group = at < 0 ? "" : decomment(STORE_SRC.slice(at, to));
    const roots = rootsOf(group);
    console.log(`      record-group roots: ${JSON.stringify(roots)}`);
    t("D-235 (6) THE RECORD GROUP IS BUILT FROM THE READ-BACK AND NOTHING ELSE — pinned over the "
    + "SOURCE, because a field re-sourced from the candidate is invisible to every behavioural arm "
    + "whenever the two happen to agree, which after REC-75 is almost always. Asked as a TOTALITY over "
    + "the roots the group draws on rather than as a list of forbidden names, so a value taken from "
    + "somewhere nobody anticipated fails too",
      [at > 0 && to > at, group.length > 200, roots],
      [true, true, ["b", "promoted", "rc", "recorded"]]);
    const SYNTH = `const fromRecord = {\n  legs: rc.legs,\n  version: name,\n  grounds: declaredLabels,\n};`;
    t("WALK GUARD for that arm: the same reader over a FIXED synthetic group that MUST trip it does "
    + "trip, AND it trips on the identifier the banned-list spelling of this arm could not see — a walk "
    + "that took an empty span would report a clean root set and congratulate itself, which is the "
    + "shape this repository has measured repeatedly",
      rootsOf(SYNTH), ["declaredLabels", "name", "rc"]);
  }
}

} catch (e) {
  console.error("SUITE ERROR", e);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nsuggest: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
