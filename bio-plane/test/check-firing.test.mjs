/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 1/2 cover the class; this file's own measurement is in the report — its
   estate walk counted 129 files of which only 127 are in any commit.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* The catalog, judged in the direction that FAILS.
 *
 * conformance.test.mjs runs the whole check catalog over real bundles and
 * asserts ZERO findings: it proves every check passes clean input. That is only
 * half of what a check is for. A check that has never been seen to FIRE on a
 * violation is unproven in the one direction that matters — the S-7 defect
 * exactly, where C-20.1 skipped every mechanical entry and the audit reported
 * clean because it was not looking (VERIFICATION.md, "checks named by an
 * assertion").
 *
 * So this suite does the opposite of conformance: it builds a conformant bundle
 * per object type (the same field set setup.mjs's mdFor writes, proven clean by
 * conformance.test.mjs), TAMPERS exactly one thing, and requires the specific
 * check id to appear in the findings. Every check is asserted BOTH ways: it
 * FIRES on the tampered bundle, and it is ABSENT from the untouched conformant
 * base. The second assertion is the built-in negative control for the first: if
 * a tamper were removed, its bundle would equal the base, the check would not
 * fire, and the paired assertion would fail.
 *
 * M0-3 (QUEUE.md). Names the 33 checks no assertion named:
 *   C-1.3 C-2.1 C-2.2 C-2.3 C-2.4 C-2.6 C-2.9 C-2.10 C-3.1 C-6.3 C-7.1 C-8.1
 *   C-9.1 C-10.1 C-11.1 C-12.1 C-12.2 C-13.1 C-14.1 C-14.2 C-14.3 C-14.4 C-15.1
 *   C-16.1 C-16.2 C-16.3 C-16.4 C-16.5 C-17.1 C-18.3 C-18.4 C-18.7 C-18.8
 *
 * SUPERSEDED 2026-08-08 (FW-13), and CORRECTED here rather than exempted. C-8.1
 * is in that list of 33 and its `fires` proof has been REPLACED by a RETIREMENT
 * proof at the foot of this file. The old assertion was not wrong when it was
 * written — it proved the check fired on a tampered `data/citations.json`, which
 * it did. It became wrong the moment the claim layer landed as rows: C-8.1 gated
 * a per-bundle citation register that NOTHING in the estate has ever written,
 * and keeping it left the record carrying a second claim structure overlapping
 * `inquiry_basis`. Retiring a check without an assertion behind the retirement
 * would be a deletion nobody is enforcing, which is the same defect one altitude
 * down.
 *
 * SUPERSEDED AGAIN THE SAME DAY (FW-15), for C-7.1, and corrected the same way.
 * Its old assertion proved the check fired on a tampered `data/deletions.json`,
 * which it did. It became wrong because the plane already meets all three of
 * State Rules §2.5's gated-deletion requirements at the only write that can
 * remove anything — `promote`'s `drop[]` with the FILES_DROPPED refusal
 * (C-33.24) for the reason, the pre-write snapshot into `_history/` for the
 * preservation (C-12.1, C-12.2), and C-5.1 for the append-only surfaces — so the
 * ledger was a SECOND ACCOUNT OF AN ABSENCE beside a machine-kept one, and it
 * was the hand-authorable one. Worse than C-8.1's, because C-7.1 checked the
 * SHAPE of a deletion claim and nothing about its truth: it passed a ledger
 * naming a file that was still present, and a `preserved_to` pointing nowhere.
 * So 31 of the 33 are still proven to FIRE; two are now proven NOT to, and
 * proven to have no producer.
 *
 * (2026-08-09, D-277) THREE PROOFS ADDED, AND THE REASON THEY WERE MISSING IS THE ITEM.
 * `coverage.mjs` credited a check as "named by an assertion" when its id appeared anywhere in a
 * suite's RAW bytes, comments included, so three checks read as covered on the strength of a
 * SENTENCE — an identity-grammar check named only in `audit.test.mjs`'s prose, a capture-hash
 * check named only in `acquire.test.mjs`'s prose, and an append-only check named only in THIS
 * FILE'S OWN HEADER. A description of a check is not a proof of one. The credit rule now reads
 * code, the hole became visible, and each of the three now has a paired FIRES / absent-on-clean
 * proof above. Their built-in control is the same one this whole suite rests on, stated next.
 * NEGATIVE CONTROL: remove any tamper (bundle == the conformant base) -> that check's `fires` assertion fails. Spot-checked 2026-07-31 on C-2.1, C-13.1, C-16.4: deleting the tamper drops the finding and flips fires true->false; the paired `absent on clean base` assertion encodes this for all 31 that still fire.
 * (run 2026-08-08, FW-13) FOUR ARMS ON THE RETIREMENT ITSELF, each armed ALONE with the other three held open, each DECLARING BEFORE IT RAN what must fail and what must not, and every touched file restored from a UNIQUELY NAMED per-arm pristine copy verified by sha256 AND by a byte compare. Re-run in one step: `node test/retirement.control.mjs all` from bio-plane/. Baseline at the moment they ran: this suite 83 pass, 0 fail. ZERO arms behaved other than declared. (i) PUT THE RETIRED CHECK BACK — a MINIMAL restoration of `checkCitationRegister` (ONE of its four refusing branches) plus its call site in checks/bio-checks.mjs -> 81 pass, 2 FAIL: the behavioural arm for that branch ("no finding when the register is not {claims:[...]}") and the SOURCE arm, which names the file and the LINE ("C-8.1 at line 3235"). Exactly one behavioural arm bites BECAUSE the plant is minimal, and that is the arm's point: the source arm catches ANY branch of any reintroduction, which is why the retirement does not depend on guessing which branch somebody puts back. MUST NOT move, and did not: the 32 surviving `fires` arms, and the estate arm — restoring a CHECK grows no PRODUCER. (ii) GROW A PRODUCER — append `data/citations.json` to a real module under src/ -> 82 pass, 1 FAIL, the ESTATE arm naming `bio-plane/src/cdx.mjs`, while every behavioural arm stays GREEN, because a second claim structure appearing in the estate is invisible to any bundle-level assertion. (iii) NEUTER THE ESTATE WALK so its matcher can never match -> 82 pass, 1 FAIL, and it is the REACH arm alone ("the estate walk CATCHES a planted producer"), WHILE the corpus floor and the clean-estate arm BOTH STILL PASS — which is the whole reason the reach arm exists, since a detector that finds nothing passes everything. (iv) OVER-STRICTNESS — nothing planted, a LEGITIMATE bundle carrying a well-formed citation register -> 83 pass, 0 fail, NOTHING drawn, because retirement means the shape is ordinary data and not forbidden data.
 * (run 2026-08-08, FW-15) THE SAME HARNESS WIDENED, NOT A SECOND ONE: arms (i) and (ii) are now keyed by RETIRED ID and run once per id, each plant ALONE and each restored before the next, so the two per-check arms cover C-7.1 exactly as they cover C-8.1. Arm (i)'s call-site anchor moved to the surviving `checkAppendOnly` line because both retirement notes now share one comment block and a statement spliced into a block comment is a syntax error, not a plant; the arm's MEANING is unchanged and it was re-run. Baseline at the moment they ran: this suite 93 pass, 0 fail. SIX ARM-RUNS, ZERO behaved other than declared ON THE RECORDED RUN — but see arm (v), which came back WRONG the first time and is recorded here rather than smoothed. (i) RESTORE C-8.1 -> 91 pass, 2 FAIL (its behavioural arm + the source arm, "C-8.1 at line 3235"); RESTORE C-7.1 -> 91 pass, 2 FAIL (its behavioural arm + the source arm, "C-7.1 at line 3235"), and in each case the OTHER id's arms did not move. (ii) GROW A PRODUCER for data/citations.json -> 92 pass, 1 FAIL, the estate arm naming `bio-plane/src/cdx.mjs` BY FILE; for data/deletions.json -> 92 pass, 1 FAIL, the estate arm naming the same file BY FILE, the other id's estate arm green in both. (iii) NEUTER -> 92 pass, 1 FAIL, the REACH arm alone. (iv) OVER-STRICTNESS -> 93 pass, 0 fail. (v) NEW — UNCOVERED: rename one id's entry in RETIRED_SHAPES so a row in CHECK_RETIREMENTS has no behavioural arms -> 84 pass, 1 FAIL, the COMPLETENESS arm naming C-7.1, and the pass count falls by the arms that no longer run. **ARM (v) FIRST CAME BACK AS "THE SUITE NEVER REACHED ITS FOOT": the different-filename loop indexed RETIRED_SHAPES[id][1] unguarded and threw a TypeError, ending the module through no assertion at all — the exact failure this project recorded twice this week, found only because this harness READS THE FOOT LINE rather than trusting a tally. The guard and its receipt are at the site; the arm then behaved as declared.**
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { createHash, webcrypto } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
/* M0-18 — ONE mechanism, imported. The reason is at the estate walk's floor. */
import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";
import { join as joinPath } from "node:path";
import { checkBundle, CHECK_RETIREMENTS } from "../checks/bio-checks.mjs";

const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const NL = "\n";
const NOW = "2026-07-24T00:00:00Z";
const NOWMS = Date.parse("2026-07-24T12:00:00Z");
const H64 = "a".repeat(64);

/* The canonical conformant bundle.md, one per type — the exact field set
   setup.mjs's mdFor produces, which conformance.test.mjs proves draws zero
   findings. Kept here rather than imported so a tamper is a local string edit
   and this suite has no dependency on the served page's script sandbox. */
const HEADINGS = {
  information: ['## Summary', '## Provenance Notes', '## Session Log', '## Review Notes'],
  focus: ['## Statement', '## Why It Matters', '## Open Questions', '## Session Log', '## Review Notes'],
  project: ['## Thesis Summary', '## Open Questions', '## Ruled Out', '## Session Log', '## Review Notes'],
  action: ['## Plan', '## Status', '## Correspondence', '## Session Log', '## Review Notes'],
};
const SCHEMA_OF = { information: "information@1", focus: "focus@1", project: "project@1", action: "action@1" };
const PREFIX = { information: "INFO", focus: "FOCUS", project: "PROJ", action: "ACTN" };
const FIRST_STATE = { information: "collected", focus: "surfaced", project: "forming", action: "planned" };

function mdFor(id, type, state, title, body, now) {
  const fm = ["---", "id: " + id, "object_type: " + type, "schema: " + SCHEMA_OF[type],
    "title: " + JSON.stringify(title), "current_state: " + state, "prior_state: null",
    "created: " + now, "last_updated: " + now,
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []"];
  if (type === "information") fm.push(
    "criticality: supporting", "source_status: unchanged",
    "source:", "  locator: in hand", "  authority: member-entered", "  retrieved: " + now,
    "monitoring:", "  enabled: false", "  frequency: none");
  if (type === "focus") fm.push(
    "surfaced_by: human", "recheck_triggers:", "  - text: Revisit this",
    "    description: A member set no specific trigger at creation; replace this with a real one.");
  if (type === "project") fm.push("objective: " + JSON.stringify(title));
  if (type === "action") fm.push(
    /* Superseded 2026-08-04 (REC-23/D-130): this fixture carried
       `counterparty: to be named`, which is the exact string the check now
       refuses — the base was conformant only because C-2.10 accepted any
       non-empty string. Corrected, never exempted: the conformant action is now
       an honest `undetermined` with an authored basis, which is the shape the
       item's accepts-when requires to PASS. counterparty.test.mjs owns the
       refusing direction; this base only has to be clean. */
    "action_kind: other", "risk_tier: 1",
    "counterparty:", "  state: undetermined",
    "  basis: The department that holds these records has not been identified; the clerk's index is the next place to look.");
  fm.push("---", "");
  const out = fm.slice();
  HEADINGS[type].forEach((h, i) => { out.push(h, ""); if (i === 0) out.push(body, ""); });
  return out.join(NL);
}
const idFor = (type) => `${PREFIX[type]}-2026-0001-conformance-base`;
const baseMd = (type) => mdFor(idFor(type), type, FIRST_STATE[type], "Base " + type, "What the member wrote.", NOW);
const baseFiles = (type) => new Map([["bundle.md", baseMd(type)]]);

/* Insert lines at the end of the frontmatter (just before the closing fence). */
const fmInsert = (md, ...lines) => {
  const a = md.split(NL); let c = 0, at = -1;
  for (let i = 0; i < a.length; i++) if (a[i] === "---") { if (++c === 2) { at = i; break; } }
  a.splice(at, 0, ...lines); return a.join(NL);
};

async function findingsFor(type, files, extra = {}) {
  const { findings } = await checkBundle({
    folderName: idFor(type), files, sha256: shaHex, sha512: sha512Hex,
    resolveTarget: (x) => x === idFor(type), nowMs: NOWMS, ...extra,
  });
  return findings;
}
const has = (fs, id) => fs.some((f) => f.check === id);

/* The paired assertion: the check FIRES on the tamper, and is ABSENT from the
   untouched conformant base of the same type (the negative control). */
async function proves(id, label, type, tamperedFiles, extra = {}) {
  const tampered = await findingsFor(type, tamperedFiles, extra);
  const clean = await findingsFor(type, baseFiles(type), extra);
  t(`${id} FIRES when ${label}`, has(tampered, id), true);
  t(`${id} absent on the clean ${type} base`, has(clean, id), false);
}

/* ---- the four conformant bases draw nothing: the anchor for every control ---- */
console.log("\n--- the conformant bases are clean ---");
for (const type of ["information", "focus", "project", "action"]) {
  const f = await findingsFor(type, baseFiles(type));
  t(`a conformant ${type} bundle has zero errors`, f.filter((x) => x.severity === "error").length, 0);
}

/* ---- annotation records (C-1.3) ---- */
console.log("\n--- identity and annotations ---");
await proves("C-1.3", "an annotations/ file is not a .json record", "information",
  new Map([["bundle.md", baseMd("information")], ["annotations/note.txt", "not json"]]));
/* D-277, 2026-08-09. THIS CHECK HAD NO ASSERTION AND READ AS COVERED FOR MONTHS,
   and the way it did is the item: `coverage.mjs` credited a check as "named by an
   assertion" if the id appeared ANYWHERE in a suite's raw bytes — comments
   included — and the only occurrence in this battery was a SENTENCE in
   `audit.test.mjs`'s prose. The credit rule now reads code, so the hole became
   visible; this is the proof that closes it. The tamper keeps the id's SHAPE
   (prefix, year, ordinal) and violates only the slug grammar, so it is the
   grammar being proven and not the prefix. */
await proves("C-1.2", "the frontmatter id violates the canonical ID grammar", "information",
  new Map([["bundle.md", baseMd("information")
    .replace("id: " + idFor("information"), "id: INFO-2026-0001-Bad_Slug")]]));

/* ---- frontmatter grammar and contract (C-2.x, C-3.1) ---- */
console.log("\n--- frontmatter grammar and contract ---");
await proves("C-2.1", "bundle.md does not open with a frontmatter fence", "information",
  new Map([["bundle.md", "junk\n" + baseMd("information")]]));
await proves("C-2.2", "a required core field is removed", "information",
  new Map([["bundle.md", baseMd("information").replace("\ngroup: believe-in-oakland", "")]]));
await proves("C-2.3", "a forbidden alias is present", "information",
  new Map([["bundle.md", baseMd("information").replace("id: " + idFor("information"),
    "id: " + idFor("information") + "\nstatus: collected")]]));
await proves("C-2.4", "a core key is buried by stray indentation", "information",
  new Map([["bundle.md", baseMd("information").replace("\nannotations_open: 0", "\n  annotations_open: 0")]]));
await proves("C-2.6", "a timestamp is not ISO 8601 UTC", "information",
  new Map([["bundle.md", baseMd("information")
    .replace("created: " + NOW, "created: 2026-07-24").replace("last_updated: " + NOW, "last_updated: 2026-07-24")]]));
await proves("C-3.1", "a canonical heading is renamed away", "information",
  new Map([["bundle.md", baseMd("information").replace("## Review Notes", "## Nonsense")]]));

/* ---- per-type extension fields (C-2.9 project, C-2.10 action) ---- */
console.log("\n--- per-type extensions ---");
await proves("C-2.9", "a project workproduct_state is out of enum", "project",
  new Map([["bundle.md", fmInsert(baseMd("project"), "workproduct_state: bogus")]]));
await proves("C-2.10", "an action risk_tier is out of range", "action",
  new Map([["bundle.md", baseMd("action").replace("risk_tier: 1", "risk_tier: 9")]]));

/* ---- references (C-6.3): a basis leg must appear in references[] ----
   Superseded 2026-08-03 (REC-11): the old proof required an elevated Focus to
   carry an elevated_into edge. It was wrong to keep because elevation is not a
   state in the inquiry machine at all (the REC-10 collapse removed it; only
   legacy history carries it, judged by its own contract). C-6.3's replacing
   rule is the basis arm: an inquiry carrying a basis leg must carry the same
   target in references[], so refs and inquiry_basis — two projections of one
   document — cannot disagree. The focus base normalizes to inquiry, so it
   exercises the arm; grade absent = undetermined, stated, and legal. */
console.log("\n--- references ---");
await proves("C-6.3", "a basis leg's target is absent from references[]", "focus",
  new Map([["bundle.md", fmInsert(baseMd("focus"),
    "basis:", "  - target: INFO-2026-0001-somedoc", "    role: supports")]]));

/* ---- deletion and citation registers (C-7.1, C-8.1) ----
   BOTH proofs stood here and BOTH have MOVED, to the RETIREMENT block at the
   foot of this file, where the same tampers are now required to draw NOTHING.
   C-8.1's went when FW-13 retired it (2026-08-08); C-7.1's went the same day
   when FW-15 retired that one too. Neither is deleted and neither is exempted.
   The section is left standing as the pointer, because a heading that simply
   disappeared would leave the next reader unable to tell a retirement from a
   suite that never covered these checks at all. */

/* ---- project readiness ladder (C-9.1) ---- */
console.log("\n--- project readiness ladder ---");
await proves("C-9.1", "workproduct_state advances with no passing evaluation", "project",
  new Map([["bundle.md", fmInsert(baseMd("project"), "workproduct_state: internally_checked")]]));

/* ---- cascade hygiene and action clock (C-10.1, C-11.1) ---- */
console.log("\n--- cascade and clock ---");
await proves("C-10.1", "reeval_pending.flag is true with no valid since", "information",
  new Map([["bundle.md", baseMd("information").replace("  flag: false", "  flag: true")]]));
await proves("C-11.1", "a clock entry carries no basis", "action",
  new Map([["bundle.md", fmInsert(baseMd("action"),
    "clock:", "  - text: File the CPRA", "    description: The statutory deadline.",
    "    date: 2026-08-01", "    status: pending")]]));

/* ---- write completeness (C-13.1) ---- */
console.log("\n--- write completeness ---");
await proves("C-13.1", "last_updated precedes created", "information",
  new Map([["bundle.md", baseMd("information").replace("last_updated: " + NOW, "last_updated: 2020-01-01T00:00:00Z")]]));

/* ---- format hygiene (C-14.x) ---- */
console.log("\n--- format hygiene ---");
await proves("C-14.1", "an escaped markdown character is present", "information",
  new Map([["bundle.md", baseMd("information").replace("What the member wrote.", "Wrote \\# here.")]]));
await proves("C-14.2", "a filename violates the naming rule", "information",
  new Map([["bundle.md", baseMd("information")], ["data/bad name.json", "{}"]]));
await proves("C-14.3", "a .json file does not parse", "information",
  new Map([["bundle.md", baseMd("information")], ["data/broken.json", "{oops"]]));
await proves("C-14.4", "an on-disk svg is absent from the visuals array", "information",
  new Map([["bundle.md", baseMd("information")], ["diagram.svg", "<svg/>"]]));

/* ---- recheck coverage (C-15.1): every Focus carries a recheck trigger ---- */
console.log("\n--- recheck coverage ---");
await proves("C-15.1", "a Focus carries no recheck trigger", "focus",
  new Map([["bundle.md", baseMd("focus").replace(
    /surfaced_by: human\nrecheck_triggers:\n  - text: Revisit this\n    description: [^\n]*/,
    "surfaced_by: human")]]));

/* ---- history coherence (C-12.x) ---- */
console.log("\n--- history coherence ---");
await proves("C-12.1", "_history holds files but no manifest", "information",
  new Map([["bundle.md", baseMd("information")], ["_history/orphan.json", "{}"]]));
await proves("C-12.2", "a manifest promotion entry has no promotion record", "information",
  new Map([["bundle.md", baseMd("information")],
    ["_history/manifest.json", JSON.stringify({ entries: [{ key: "20260724T010000Z_aaaa1111", kind: "promotion", created: NOW, files: [] }] })]]));

/* ---- pending-promotion queue and base coherence (C-16.x, C-17.1) ---- */
console.log("\n--- pending-promotion queue and base ---");
const goodManifest = (over = {}) => JSON.stringify({
  target: idFor("information"), base: "deadbeef", files: [], created: NOW, author: "ruth", skill_version: "1", ...over });
await proves("C-16.1", "the promotion manifest does not parse into the required keys", "information",
  new Map([["bundle.md", baseMd("information")], ["PENDING_PROMOTION.json", "{}"]]));
await proves("C-16.2", "a manifest-listed package file is missing", "information",
  new Map([["bundle.md", baseMd("information")], ["PENDING_PROMOTION.json", goodManifest({ files: [{ name: "foo", sha256: H64 }] })]]));
await proves("C-16.3", "a pending package is past the age policy", "information",
  new Map([["bundle.md", baseMd("information")], ["PENDING_PROMOTION.json", goodManifest({ created: "2026-06-01T00:00:00Z" })]]));
await proves("C-16.4", "a .pending file has no manifest", "information",
  new Map([["bundle.md", baseMd("information")], ["foo.pending", "x"]]));
await proves("C-16.5", "a stale advisory artifact is left behind", "information",
  new Map([["bundle.md", baseMd("information")], ["PROMOTING-abc.json", "{}"]]));
await proves("C-17.1", "a pending package base diverges from live bundle.md", "information",
  new Map([["bundle.md", baseMd("information")], ["PENDING_PROMOTION.json", goodManifest()]]));

/* ---- release-authority family (C-18.x) ---- */
console.log("\n--- release authority ---");
await proves("C-18.3", "one capture hash appears in two register documents", "information",
  new Map([["bundle.md", baseMd("information")],
    ["data/provenance.json", JSON.stringify({ documents: [{ capture: { sha256: H64 } }, { capture: { sha256: H64 } }] })]]));
/* The NORMALISED arm (FW-4): DIFFERENT raw shas, but the same DETERMINED
   evidentiary digest — a duplicate whose viewstate/boilerplate differs. The raw
   arm cannot see it (the shas differ); the normalised arm folds it. */
await proves("C-18.3", "two register documents share a determined evidentiary digest but differ in raw bytes", "information",
  new Map([["bundle.md", baseMd("information")],
    ["data/provenance.json", JSON.stringify({ documents: [
      { capture: { sha256: "a".repeat(64) }, profile: { digests: { determined: true, evidentiary: "e".repeat(64) } } },
      { capture: { sha256: "b".repeat(64) }, profile: { digests: { determined: true, evidentiary: "e".repeat(64) } } },
    ] })]]));
/* The negative control the honesty rule demands: two UNDETERMINED digests (null,
   the PDF/uncertain case) must NOT fold. Different raw shas, so the raw arm is
   silent too — the whole bundle is clean, proving an absent digest is never
   treated as an equality. */
{
  const undetermined = new Map([["bundle.md", baseMd("information")],
    ["data/provenance.json", JSON.stringify({ documents: [
      { capture: { sha256: "c".repeat(64) }, profile: { digests: { determined: false, evidentiary: null } } },
      { capture: { sha256: "d".repeat(64) }, profile: { digests: { determined: false, evidentiary: null } } },
    ] })]]);
  t("C-18.3 does NOT fold two undetermined (null) evidentiary digests", has(await findingsFor("information", undetermined), "C-18.3"), false);
}
await proves("C-18.4", "a crucial document names neither co_archive nor timestamp", "information",
  new Map([["bundle.md", baseMd("information").replace("criticality: supporting", "criticality: crucial")],
    ["data/provenance.json", JSON.stringify({ documents: [{ file: "snapshots/doc.pdf" }] })]]));

/* A verified information bundle carrying a collected->verified transition. */
const releaseHistory = (ts) => ["state_history:",
  "  - timestamp: " + ts, "    from_state: collected", "    to_state: verified",
  "    blurb: Ratified.", "    author: ruth"];
const verifiedInfoMd = (schema, ts) => baseMd("information")
  .replace("schema: information@1", "schema: " + schema)
  .replace("current_state: collected", "current_state: verified")
  .replace("prior_state: null", "prior_state: collected")
  .replace("created: " + NOW, "created: " + ts)
  .replace("last_updated: " + NOW, "last_updated: " + ts)
  .replace("state_history: []", releaseHistory(ts).join(NL));

await proves("C-18.7", "an @2 collected->verified transition is unsigned", "information",
  new Map([["bundle.md", verifiedInfoMd("information@2", "2026-07-01T00:00:00Z")],
    ["data/provenance.json", JSON.stringify({ documents: [{ file: "snapshots/doc.pdf", capture: { sha256: H64, encoding: "utf8" } }] })]]));
await proves("C-18.8", "a release at/after the migration instant carries no checkable signature", "information",
  new Map([["bundle.md", verifiedInfoMd("information@1", "2026-07-01T00:00:00Z")]]),
  { releaseRegistry: { migrationInstant: "2026-01-01T00:00:00Z" } });
/* D-277, 2026-08-09: the register's REGISTERED HASH against the STORED BYTES.
   Same story as the identity-grammar proof above — the only occurrence of this id
   in the whole battery was a sentence in `acquire.test.mjs`'s prose describing how
   the check streams parts, and a description of a check is not a proof of one. The
   register names a stored file and records a hash the bytes do not have, which is
   the silent-content-mutation case the check exists for. `information@2`, because
   that contract is where the register becomes mandatory. */
await proves("C-18.6", "the registered capture hash disagrees with the stored bytes", "information",
  new Map([["bundle.md", verifiedInfoMd("information@2", "2026-07-01T00:00:00Z")],
    ["data/provenance.json", JSON.stringify({ documents: [
      { file: "snapshots/doc.pdf", capture: { sha256: H64, encoding: "utf8" } }] })],
    ["snapshots/doc.pdf", "these are not the bytes the register recorded"]]));

/* ---- append-only surfaces against the latest history snapshot (C-5.1) ----
   D-277, 2026-08-09, and the third of the three this item's credit-rule change
   exposed. This id appeared in the battery only inside `check-firing.test.mjs`'s
   OWN header — a sentence explaining what replaced a retired check — and in a
   comment in `conformance.test.mjs`. Both are prose. The check has five refusing
   branches; the tamper drives the FIRST, a state_history that SHRANK against the
   snapshot, which is the one a rewrite of history actually looks like. */
console.log("\n--- append-only surfaces ---");
await proves("C-5.1", "state_history shrank against the latest _history snapshot", "information",
  new Map([["bundle.md", baseMd("information")],
    ["_history/bundle_20260724T000000Z_aaaa1111.md",
      baseMd("information").replace("state_history: []", releaseHistory(NOW).join(NL))],
    ["_history/manifest.json", JSON.stringify({ entries: [] })]]));

/* ================= RETIRED CHECKS (FW-13, widened by FW-15) ================
 *
 * The other half of this suite's job. Above, a check is judged in the direction
 * that FAILS. Here a RETIRED check is judged in the only direction left: it must
 * not fire, nothing must push a finding under its id, the same tamper under
 * another filename must draw nothing (so the retirement is a no-producer
 * deletion and not a redundancy), and — the assertion the retirement actually
 * rests on — the shape it gated must still have no producer, so a second
 * structure claiming what the record already holds cannot creep back in while
 * everything stays green.
 *
 * WHY A RETIREMENT NEEDS AN ASSERTION AT ALL: an item that vanishes is
 * indistinguishable from one nobody did. A check deleted with nothing behind it
 * is a rule nobody is enforcing and nobody remembers dropping — the exempted
 * test, one altitude up.
 *
 * The table is READ OUT OF THE CATALOGUE, never hand-listed here, for the same
 * reason coverage.mjs reads the OPS table out of index.mjs: a row added there
 * and not here would be a retirement nothing checks. */
console.log("\n--- retired checks: they no longer fire, and nothing grew a producer ---");

const RETIRED_CHECK_IDS = Object.keys(CHECK_RETIREMENTS);
t("the retired-check table is non-empty (a walk over nothing passes everything)",
  RETIRED_CHECK_IDS.length > 0, true);

/* (1) BEHAVIOURAL. Every shape the retired check used to refuse, replayed. Each
   must now draw NO finding under the retired id. The last arm of each set is the
   OVER-STRICTNESS arm and it is the point of the retirement rather than a
   formality: a legitimate register is ORDINARY DATA now, not forbidden data.

   KEYED BY RETIRED ID (FW-15), where FW-13 wrote one flat list for the one row
   the table then held. This is the same mechanism widened, not a second one:
   the ids still come from the catalogue, and the COMPLETENESS assertion below
   is what makes the widening load-bearing — a row added to CHECK_RETIREMENTS
   with no behavioural arms here now FAILS, where under the flat list it would
   have been silently covered by another check's arms. */
const regFor = (path) => (o) => new Map([["bundle.md", baseMd("information")],
  [path, typeof o === "string" ? o : JSON.stringify(o)]]);
const citeReg = regFor("data/citations.json");
const delReg = regFor("data/deletions.json");
const RETIRED_SHAPES = {
  "C-8.1": [
    ["the register is not {claims:[...]}", citeReg({ nope: 1 })],
    ["a claim lacks claim_id/claim/cites[]/snapshot/as_of", citeReg({ claims: [{}] })],
    ["a claim's hash is not sha256:<64 hex>", citeReg({ claims: [{ claim_id: "C-014", claim: "x",
      cites: [idFor("information")], snapshot: "s.json", as_of: "2026-07-01", hash: "nonsense" }] })],
    ["a claim cites an id that does not resolve in the store", citeReg({ claims: [{ claim_id: "C-014",
      claim: "x", cites: ["INFO-2026-0002-not-in-this-store"], snapshot: "s.json",
      as_of: "2026-07-01", hash: "sha256:" + H64 }] })],
    ["a WELL-FORMED register is carried (the over-strictness arm)", citeReg({ claims: [{ claim_id: "C-014",
      claim: "Transfers continued under cost-allocation labels.", cites: [idFor("information")],
      snapshot: "INFO-2026-0002/snapshots/opengov-fy24.json", as_of: "2026-07-01",
      hash: "sha256:" + H64 }] })],
  ],
  /* FW-15. Every branch C-7.1 refused, and the well-formed ledger it passed. */
  "C-7.1": [
    ["the ledger is not {records:[...]}", delReg({ nope: 1 })],
    ["a record lacks timestamp/reason/items[]/preserved_to", delReg({ records: [{}] })],
    ["a record states no reason", delReg({ records: [{ timestamp: NOW, items: ["captures/9f2a.pdf"],
      preserved_to: "_history/data/deleted_2026-07-01.json" }] })],
    ["a record names no preservation", delReg({ records: [{ timestamp: NOW, reason: "misfiled",
      items: ["captures/9f2a.pdf"] }] })],
    ["a record's timestamp is not ISO-8601 UTC", delReg({ records: [{ timestamp: "2026-07-01",
      reason: "misfiled", items: ["captures/9f2a.pdf"], preserved_to: "_history/x.json" }] })],
    ["a record removes nothing (empty items[])", delReg({ records: [{ timestamp: NOW,
      reason: "misfiled", items: [], preserved_to: "_history/x.json" }] })],
    ["a WELL-FORMED ledger is carried (the over-strictness arm)", delReg({ records: [{ timestamp: NOW,
      reason: "A member uploaded a scan of a neighbour's personal correspondence by mistake.",
      items: ["captures/9f2a.pdf"], preserved_to: "_history/data/deleted_2026-07-01.json" }] })],
  ],
};
/* COMPLETENESS, and it is the arm that keeps this block honest as the table
   grows: a retirement recorded in the catalogue with no behavioural proof here
   is a retirement nothing checks — the exempted test one altitude up, which is
   the whole reason this block exists. */
t("every row in CHECK_RETIREMENTS has behavioural arms declared here",
  RETIRED_CHECK_IDS.filter((id) => !Array.isArray(RETIRED_SHAPES[id]) || RETIRED_SHAPES[id].length === 0), []);
for (const id of RETIRED_CHECK_IDS) {
  for (const [label, files] of RETIRED_SHAPES[id] || []) {
    const fs = await findingsFor("information", files);
    t(`${id} is RETIRED: no finding when ${label}`, has(fs, id), false);
  }
}
/* And the retirement removed the register rule and nothing else: the generic
   file hygiene every other data file gets still applies to these paths. Without
   this arm, deleting the whole format-hygiene family would leave the arms above
   green — they would be passing over a catalogue that judges nothing. */
for (const id of RETIRED_CHECK_IDS) {
  const path = CHECK_RETIREMENTS[id].gated_path;
  const fs = await findingsFor("information", regFor(path)("{oops"));
  t(`a retired path is still ORDINARY data: an unparsable ${path} draws C-14.3`,
    [has(fs, "C-14.3"), has(fs, id)], [true, false]);
}
/* THE CHECK WAS DOING THE WORK ITSELF, and this is the arm that says so rather
   than assuming it. FW-13 established the finding by driving the identical
   tamper under a DIFFERENT FILENAME: if something else had been drawing on the
   malformed content, the retirement would have been redundant rather than a
   no-producer deletion, and this block would be proving nothing. Kept as a
   standing assertion, not a one-time measurement, because it is also what would
   catch a future check quietly widening to cover a retired shape by content. */
for (const id of RETIRED_CHECK_IDS) {
  const shapes = RETIRED_SHAPES[id];
  /* GUARDED, AND THE GUARD IS A RECEIPT. Written unguarded, this line read
     `RETIRED_SHAPES[id][1]` and threw a TypeError for an id with no shapes —
     which ends the MODULE through no assertion at all, so the suite dies instead
     of reporting, and the one arm that should have spoken (COMPLETENESS, above)
     never runs. Control arm (v) armed exactly that case and came back
     UNREACHED-FOOT rather than the declared single failure, which is how it was
     found. The gap is reported ONCE, by COMPLETENESS, and every arm that would
     otherwise crash on it steps aside. */
  if (!Array.isArray(shapes) || shapes.length < 2) continue;
  const gated = CHECK_RETIREMENTS[id].gated_path;
  const other = gated.replace(/\/([^/]*)\.json$/, "/$1-under-another-name.json");
  const [tamperLabel, tamperFiles] = shapes[1];
  const content = [...tamperFiles.entries()].find(([k]) => k === gated)[1];
  const fs = await findingsFor("information",
    new Map([["bundle.md", baseMd("information")], [other, content]]));
  t(`${id}: the same tamper (${tamperLabel}) under ${other} draws no error at all`,
    fs.filter((x) => x.severity === "error").map((x) => x.check), []);
}

/* (2) SOURCE. Nothing in the catalogue pushes a finding under a retired id.
   This is the arm that fails the moment somebody restores the check. */
const CHECKS_SRC_PATH = new URL("../checks/bio-checks.mjs", import.meta.url);
const checksSrc = readFileSync(CHECKS_SRC_PATH, "utf8");
const pushesRetired = (src) => {
  const out = [];
  const lines = src.split(NL);
  for (let i = 0; i < lines.length; i++) {
    for (const id of RETIRED_CHECK_IDS) {
      if (lines[i].includes(`f('${id}'`) || lines[i].includes(`f("${id}"`)) out.push(`${id} at line ${i + 1}`);
    }
  }
  return out;
};
t("no retired check id is pushed as a finding anywhere in the catalogue",
  pushesRetired(checksSrc), []);
/* REACH, because a detector that matches nothing passes everything. */
t("the push detector CATCHES a planted restoration",
  pushesRetired(`  findings.push(f('${RETIRED_CHECK_IDS[0]}', 'error', 'planted'));`).length, 1);

/* (3) ESTATE — the assertion the accepts-when names: the record carries ONE
   claim structure. A retired shape with a producer is not retired, and the
   producer is the half no bundle-level assertion can see.
   WHAT THIS WALK CANNOT SEE, stated rather than smoothed over: a path assembled
   at runtime; a file a MEMBER hand-authors into a bundle (every bundle path is
   member-authorable, so this means no MACHINE producer, never "cannot exist");
   and a producer living in a document rather than in code. */
const ESTATE_ROOTS = ["bio-plane/src", "civicos-ui", "docprofile", "tools",
                      "agent-worker", "pdf-worker", "newgroup/src"];
/* EXCLUSIONS, each with why. dist/ and release/ are BUILD OUTPUTS of the
   catalogue, and `newgroup/src/release.mjs` is one `RELEASE_SOURCE` string
   holding the same bundle — all three contain every gated path because they are
   COPIES of the checks, not producers of the file. On this sweep's first run
   `release.mjs` alone made the orphan count read zero. */
const ESTATE_SKIP = /(^|\/)(node_modules|dist|\.git|coverage)(\/|$)|newgroup\/src\/release\.mjs$/;
const ESTATE_EXT = /\.(mjs|js|html|md|json|jsonc)$/;
const REPO = new URL("../../", import.meta.url);
const estate = [];
const walkEstate = (dir) => {
  let ents; try { ents = readdirSync(dir); } catch { return; }
  for (const e of ents) {
    const p = joinPath(dir, e);
    if (ESTATE_SKIP.test(p)) continue;
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walkEstate(p);
    else if (ESTATE_EXT.test(e)) estate.push({ p, text: readFileSync(p, "utf8") });
  }
};
for (const r of ESTATE_ROOTS) walkEstate(joinPath(REPO.pathname, r));
console.log(`  estate corpus: ${estate.length} file(s) across ${ESTATE_ROOTS.length} roots`
  + ` — ${ESTATE_ROOTS.join(", ")}`);

/* ---- M0-18 · THE FLOOR IS THE REPRODUCIBLE FIGURE, THE PRODUCER SWEEP IS NOT
 *
 * WHY THIS WAS GUARDED AFTER BEING NAMED, AND THE NAMING'S REASON WAS RIGHT
 * ABOUT THE ARM AND SILENT ABOUT THE FLOOR. `hygiene.test.mjs`'s class census
 * named this walk (FW-13, 2026-08-08) on the ground that its `producersOf` arms
 * fail in the SAFE direction — an untracked file naming a retired path makes the
 * estate arm go RED rather than quietly green, which is true and is why those
 * arms are left reading the whole working tree here. But the entry said nothing
 * about the line below it, and the line below it is a FLOOR over the same walk:
 * a phantom raises `estate.length`, so a corpus that genuinely SHRANK past 50
 * could be held above the floor by files no other checkout has. That is M0-15's
 * class exactly, in the assertion whose stated purpose is to stop a verdict being
 * reported over nothing.
 *
 * MEASURED, NOT ARGUED: the floor sits at 50 over a real corpus in the hundreds,
 * so this is a reach guard with slack rather than a live ratchet — and a floor
 * with slack is not a ratchet either (REC-71). It is guarded because the fix is
 * the same two lines as its six siblings and because the reason it was left
 * unguarded does not cover it, not because the exposure is large. */
const PROV = readGitProvenance(REPO.pathname);
const inCommit = (abs) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO.pathname, abs));
const estateRepro = estate.filter((f) => inCommit(f.p));
/* SAY UNVERIFIED, NEVER CLEAN (D-233). */
const ESTATE_HEAD_SAYS = PROV.inHead === null
  ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk and is NOT a claim about any commit"
  : `in the commit at HEAD (${PROV.headSha})`;
console.log(`  estate corpus, REPRODUCIBLE: ${estateRepro.length} of ${estate.length} file(s) are `
  + `${ESTATE_HEAD_SAYS} — the floor of 50 applies to THESE`);
reportProvenance({
  prov: PROV,
  items: estate.map((f) => ({ path: repoPath(REPO.pathname, f.p), what: f.p.slice(REPO.pathname.length),
    counted: "read for a producer of a retired gated path" })),
  instrument: "the estate walk",
  corpus: `${estate.length} file(s) across ${ESTATE_ROOTS.length} roots`,
  totals: PROV.inHead === null ? [] : [
    { label: "estate files", contaminated: estate.length, reproducible: estateRepro.length, source: "files" },
  ],
});
/* THE CORPUS FLOOR. M0-15 and M0-16 both recorded a restore check that passed
   over an EMPTY manifest and a digest reading e3b0c442… — print the size and
   floor it, or the walk below is an equality that costs nothing to produce.
   CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED: floored on the reproducible
   count for the reason in the block above. */
t(`the estate walk READ a plausible corpus (floor 50), counted over the files another checkout REPRODUCES `
+ `(${estateRepro.length} of ${estate.length}, ${ESTATE_HEAD_SAYS})`, estateRepro.length >= 50, true);
t("the provenance check either verified against `git ls-tree HEAD` or reported UNVERIFIED — never a silent "
+ "third state, and under UNVERIFIED the two figures COLLAPSE rather than the reproducible one reading zero",
  [PROV.inHead instanceof Set || PROV.inHead === null,
   estateRepro.length <= estate.length,
   PROV.inHead === null ? estateRepro.length === estate.length : true],
  [true, true, true]);

const producersOf = (path, corpus) => corpus.filter((f) => f.text.includes(path))
  .map((f) => f.p.slice(REPO.pathname.length));
for (const id of RETIRED_CHECK_IDS) {
  const gated = CHECK_RETIREMENTS[id].gated_path;
  t(`${id} is retired and the estate grew NO producer for ${gated} — the record keeps ONE claim structure`,
    producersOf(gated, estate), []);
}
/* REACH on the estate walk, for the reason above: neuter the matcher and this
   is the arm that bites while the clean-estate arm stays green. */
t("the estate walk CATCHES a planted producer",
  producersOf(CHECK_RETIREMENTS[RETIRED_CHECK_IDS[0]].gated_path,
    [{ p: REPO.pathname + "planted/probe.mjs", text: `writeFile("${CHECK_RETIREMENTS[RETIRED_CHECK_IDS[0]].gated_path}", x)` }]),
  ["planted/probe.mjs"]);

console.log(`\ncheck-firing: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
