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
 * `inquiry_basis`. So 32 of the 33 are still proven to FIRE; the 33rd is now
 * proven NOT to, and proven to have no producer. Retiring a check without an
 * assertion behind the retirement would be a deletion nobody is enforcing, which
 * is the same defect one altitude down.
 *
 * NEGATIVE CONTROL: remove any tamper (bundle == the conformant base) -> that check's `fires` assertion fails. Spot-checked 2026-07-31 on C-2.1, C-13.1, C-16.4: deleting the tamper drops the finding and flips fires true->false; the paired `absent on clean base` assertion encodes this for all 32 that still fire.
 * (run 2026-08-08, FW-13) FOUR ARMS ON THE RETIREMENT ITSELF, each armed ALONE with the other three held open, each DECLARING BEFORE IT RAN what must fail and what must not, and every touched file restored from a UNIQUELY NAMED per-arm pristine copy verified by sha256 AND by a byte compare. Re-run in one step: `node test/retirement.control.mjs all` from bio-plane/. Baseline at the moment they ran: this suite 83 pass, 0 fail. ZERO arms behaved other than declared. (i) PUT THE RETIRED CHECK BACK — a MINIMAL restoration of `checkCitationRegister` (ONE of its four refusing branches) plus its call site in checks/bio-checks.mjs -> 81 pass, 2 FAIL: the behavioural arm for that branch ("no finding when the register is not {claims:[...]}") and the SOURCE arm, which names the file and the LINE ("C-8.1 at line 3235"). Exactly one behavioural arm bites BECAUSE the plant is minimal, and that is the arm's point: the source arm catches ANY branch of any reintroduction, which is why the retirement does not depend on guessing which branch somebody puts back. MUST NOT move, and did not: the 32 surviving `fires` arms, and the estate arm — restoring a CHECK grows no PRODUCER. (ii) GROW A PRODUCER — append `data/citations.json` to a real module under src/ -> 82 pass, 1 FAIL, the ESTATE arm naming `bio-plane/src/cdx.mjs`, while every behavioural arm stays GREEN, because a second claim structure appearing in the estate is invisible to any bundle-level assertion. (iii) NEUTER THE ESTATE WALK so its matcher can never match -> 82 pass, 1 FAIL, and it is the REACH arm alone ("the estate walk CATCHES a planted producer"), WHILE the corpus floor and the clean-estate arm BOTH STILL PASS — which is the whole reason the reach arm exists, since a detector that finds nothing passes everything. (iv) OVER-STRICTNESS — nothing planted, a LEGITIMATE bundle carrying a well-formed citation register -> 83 pass, 0 fail, NOTHING drawn, because retirement means the shape is ordinary data and not forbidden data.
 */
import { createHash, webcrypto } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
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

/* ---- deletion register (C-7.1) ----
   C-8.1's citation-register proof stood here until FW-13 retired the check
   (2026-08-08). It is not deleted and it is not exempted: it MOVED, to the
   RETIREMENT block at the foot of this file, where the same tamper is now
   required to draw NOTHING. */
console.log("\n--- deletion register ---");
await proves("C-7.1", "a deletions record lacks its required fields", "information",
  new Map([["bundle.md", baseMd("information")], ["data/deletions.json", JSON.stringify({ records: [{}] })]]));

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

/* ================= RETIRED CHECKS (FW-13) =================================
 *
 * The other half of this suite's job. Above, a check is judged in the direction
 * that FAILS. Here a RETIRED check is judged in the only direction left: it must
 * not fire, nothing must push a finding under its id, and — the assertion the
 * retirement actually rests on — the shape it gated must still have no producer,
 * so a second claim structure cannot creep back in while everything stays green.
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

/* (1) BEHAVIOURAL. Every shape C-8.1 used to refuse, replayed. Each must now
   draw NO finding under the retired id. The last one is the OVER-STRICTNESS
   arm and it is the point of the retirement rather than a formality: a
   legitimate register is ORDINARY DATA now, not forbidden data. */
const citeReg = (o) => new Map([["bundle.md", baseMd("information")],
  ["data/citations.json", typeof o === "string" ? o : JSON.stringify(o)]]);
const RETIRED_SHAPES = [
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
];
for (const [label, files] of RETIRED_SHAPES) {
  const fs = await findingsFor("information", files);
  t(`C-8.1 is RETIRED: no finding when ${label}`, has(fs, "C-8.1"), false);
}
/* And the retirement removed the CLAIM rule and nothing else: the generic file
   hygiene every other data file gets still applies to this one. Without this
   arm, deleting the whole format-hygiene family would leave the arms above
   green — they would be passing over a catalogue that judges nothing. */
{
  const fs = await findingsFor("information", citeReg("{oops"));
  t("a retired path is still ORDINARY data: an unparsable data/citations.json draws C-14.3",
    [has(fs, "C-14.3"), has(fs, "C-8.1")], [true, false]);
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
/* THE CORPUS FLOOR. M0-15 and M0-16 both recorded a restore check that passed
   over an EMPTY manifest and a digest reading e3b0c442… — print the size and
   floor it, or the walk below is an equality that costs nothing to produce. */
t("the estate walk READ a plausible corpus (floor 50)", estate.length >= 50, true);

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
