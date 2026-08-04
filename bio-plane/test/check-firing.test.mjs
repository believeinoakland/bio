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
 * NEGATIVE CONTROL: remove any tamper (bundle == the conformant base) -> that check's `fires` assertion fails. Spot-checked 2026-07-31 on C-2.1, C-13.1, C-16.4: deleting the tamper drops the finding and flips fires true->false; the paired `absent on clean base` assertion encodes this for all 33.
 */
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

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

/* ---- deletion and citation registers (C-7.1, C-8.1) ---- */
console.log("\n--- deletion and citation registers ---");
await proves("C-7.1", "a deletions record lacks its required fields", "information",
  new Map([["bundle.md", baseMd("information")], ["data/deletions.json", JSON.stringify({ records: [{}] })]]));
await proves("C-8.1", "the citations register is not {claims:[...]}", "information",
  new Map([["bundle.md", baseMd("information")], ["data/citations.json", JSON.stringify({ nope: 1 })]]));

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

console.log(`\ncheck-firing: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
