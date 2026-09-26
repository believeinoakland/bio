/* promotion R18 — every refusal the catalogue assigns to the promote act is enforced at the write. Driven through the
 * whole write path as the plane runs it: the store (`legacy-store`), which reaches promotion and registers its share
 * of the checks (R39). The catalogue is read for its rows whose site is this write path; each is either probed with a
 * package that meets it, or (for a catalogue function the write runs and relays whole) shown relayed finding for
 * finding. A row sited here that this suite does not name fails it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import * as C from "../../../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../../../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
const mf = new Miniflare({ modules: true, script: readFileSync(SRC("store.mjs"), "utf8"), modulesRoot: "/",
  scriptPath: SRC("store.mjs"), compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } } });
test.after(() => mf.dispose());
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

const NOW = "2026-07-01T00:00:00Z";
let seq = 0;
const promote = (id, text, { base = null, meta = {}, ...extra } = {}) => call("/promote", {
  ...(id ? { bundleId: id } : {}), base, snapKey: `k${++seq}`, author: "member:ruth",
  files: [{ path: "bundle.md", text }], meta, ...extra });
const common = (id, type, schema, title, state, extra = []) => ["---", ...(id ? [`id: ${id}`] : []),
  `object_type: ${type}`, `schema: ${schema}`, `title: "${title}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`, "produced_by:", "  mode: human", "  capability_tier: member",
  "group: test-group", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", ...extra];
const info = (id, extra = []) => [...common(id, "information", "information@1", `Info ${id}`, "collected", ["references: []", ...extra]),
  "---", "", "## Summary", "", "x", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiry = (id, extra = [], surfaced = "surfaced_by: human") => [...common(id, "inquiry", "inquiry@1", `Question ${id}`, "open",
  [surfaced, 'disposition_reason: ""', ...extra]), "---", "", "## Question", "", `Question ${id}`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const action = (id, extra = []) => [...common(id, "action", "action@1", "Records request", "planned",
  ["references: []", "action_kind: other", ...extra, "counterparty:", "  state: named", "  name: The clerk"]),
  "---", "", "## Plan", "", "Ask.", "", "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const bias = (id, state, statements) => [...common(id, "bias", "bias@1", "House lens", state,
  ["references: []", "statements:", ...statements]), "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "BIO checks that each statement below names a registered subject and carries a justification. "
  + "It does NOT check whether a second source was independent of the first, whether a source was in a position to have direct "
  + "knowledge, or whether the subject was contacted.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const STATEMENT = ["  - id: s1", "    kind: scrutiny", "    subject: ENT-2026-0007",
  '    text: "Claims from the office need a second, independent record."', '    justification: "The office is a party."',
  "    citations: []", "    locked: false"];
const legs = (targets) => ["basis:", ...targets.flatMap((t) => [`  - target: ${t}`, "    role: supports"])];
const refs = (targets) => targets.length ? ["references:", ...targets.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const versions = (v) => ["basis_versions:", ...v];

/* The probes: each row sited at this write path, the package that meets it, and what the write answers. */
const PROBES = {};
const probe = (code, fn) => { PROBES[code] = fn; };

const INFO1 = "INFO-2026-0101-a";
const held = await promote(INFO1, info(INFO1));
assert.equal(held.ok, true, JSON.stringify(held));
probe("CAS_STALE", () => promote(INFO1, info(INFO1), { base: "0".repeat(64) }));
probe("SNAP_KEY_TAKEN", async () => {
  const a = await promote("INFO-2026-0102-b", info("INFO-2026-0102-b"));
  return call("/promote", { bundleId: "INFO-2026-0102-b", base: a.bundleSha, snapKey: `k${seq}`, author: "member:ruth",
    files: [{ path: "bundle.md", text: info("INFO-2026-0102-b").replace("x", "y") }], meta: {} });
});
probe("FILES_DROPPED", async () => {
  const id = "INFO-2026-0103-c";
  const a = await call("/promote", { bundleId: id, base: null, snapKey: `k${++seq}`, author: "member:ruth", meta: {},
    files: [{ path: "bundle.md", text: info(id) }, { path: "notes.txt", text: "n" }] });
  return promote(id, info(id), { base: a.bundleSha });
});
probe("FILE_DIGEST_MISMATCH", () => call("/promote", { bundleId: "INFO-2026-0104-d", base: null, snapKey: `k${++seq}`,
  meta: {}, files: [{ path: "bundle.md", text: info("INFO-2026-0104-d"), sha256: "f".repeat(64) }] }));
probe("SELF_BASIS", () => promote("INQ-2026-0105-e", inquiry("INQ-2026-0105-e", [...refs(["INQ-2026-0105-e"]), ...legs(["INQ-2026-0105-e"])])));
probe("BASIS_CYCLE", async () => {
  const a = "INQ-2026-0106-f", b = "INQ-2026-0107-g";
  const ra = await promote(a, inquiry(a, refs([])));
  await promote(b, inquiry(b, [...refs([a]), ...legs([a])]));
  return promote(a, inquiry(a, [...refs([b]), ...legs([b])]), { base: ra.bundleSha });
});
probe("PROJECT_ID_SUPPLIED", () => promote("PROJ-2026-0108-h", common(null, "project", "project@1", "P1", "forming").concat("---", "").join("\n")));
probe("PROJECT_ID_IN_BYTES", () => promote(null, common("PROJ-2026-0109-i", "project", "project@1", "P2", "forming").concat("---", "").join("\n")));
probe("PROJECT_DOCUMENT_UNREADABLE", () => promote(null, "no front matter", { meta: { object_type: "project" } }));
probe("PROJECT_VISIBILITY_NO_OWNER", () => promote(null, common(null, "project", "project@1", "P3", "forming").concat("---", "").join("\n"),
  { visibility: "discoverable" }));
probe("PROJECT_VISIBILITY_NOT_A_CREATION", () => promote("INFO-2026-0110-j", info("INFO-2026-0110-j"), { visibility: "hidden" }));
probe("ENVELOPE_TYPE_DISAGREES", () => promote("INFO-2026-0111-k", info("INFO-2026-0111-k"), { meta: { object_type: "action" } }));
probe("ENVELOPE_TITLE_DISAGREES", () => promote("INFO-2026-0112-l", info("INFO-2026-0112-l"), { meta: { title: "Other" } }));
probe("ENVELOPE_STATE_DISAGREES", () => promote("INFO-2026-0113-m", info("INFO-2026-0113-m"), { meta: { current_state: "verified" } }));
probe("REVISION_RETYPES_BUNDLE", () => promote(INFO1, inquiry(INFO1), { base: held.bundleSha }));
probe("BIAS_ILLEGAL_TRANSITION", async () => {
  const id = "BIAS-2026-0114-n";
  const a = await promote(id, bias(id, "adopted", STATEMENT), { replay: true });
  assert.equal(a.ok, true, JSON.stringify(a));
  return promote(id, bias(id, "proposed", STATEMENT), { base: a.bundleSha });
});
probe("BIAS_REFUSED", () => promote("BIAS-2026-0115-o", bias("BIAS-2026-0115-o", "draft",
  STATEMENT.map((l) => l.replace("ENT-2026-0007", "the city attorney")))));
probe("GOVERNING_LAWS_REWRITTEN", () => promote("ACTN-2026-0116-p", action("ACTN-2026-0116-p",
  ["governing_laws:", "  - level: state", '    citation: "A statute"'])));
probe("RISK_TIER_REWRITTEN", async () => {
  const id = "ACTN-2026-0117-q";
  const a = await promote(id, action(id, ["risk_tier: 3"]));
  assert.equal(a.ok, true, JSON.stringify(a));
  return promote(id, action(id, ["risk_tier: 1"]), { base: a.bundleSha });
});
probe("SURFACED_BY_REWRITTEN", async () => {
  const id = "INQ-2026-0118-r";
  const a = await promote(id, inquiry(id, refs([])));
  return promote(id, inquiry(id, refs([]), "surfaced_by: agent"), { base: a.bundleSha });
});
const V1 = (desc) => [...versions(['  - name: "v1"', `    description: "${desc}"`, '    relationship: "and"',
  '    state: "suggested"', "    derived_from: null", "    hidden: false", '    author: "ruth"', `    at: "${NOW}"`]),
  "basis_version_grounds:", '  - version: "v1"', '    ground: "g1"', '    asserted_by: "ruth"', `    at: "${NOW}"`, '    statement: "one ground"'];
const VLEG = (target, role = "supports") => ["basis_version_legs:", '  - version: "v1"', `    target: "${target}"`, `    role: "${role}"`, '    ground: "g1"'];
probe("VERSION_LEG_UNRESOLVED", () => promote("INQ-2026-0119-s", inquiry("INQ-2026-0119-s", [...refs([]), ...V1("one reading of the ledger"),
  ...VLEG("INFO-2026-0999-nothing")])));
probe("VERSION_FROZEN", async () => {
  const id = "INQ-2026-0120-t";
  const a = await promote(id, inquiry(id, [...refs([INFO1]), ...V1("the first reading of the ledger"), ...VLEG(INFO1)]));
  assert.equal(a.ok, true, JSON.stringify(a));
  return promote(id, inquiry(id, [...refs([INFO1]), ...V1("the first reading of the ledger"), ...VLEG(INFO1, "cuts_against")]), { base: a.bundleSha });
});

/* The answer each probe must meet: its reason, or the envelope that relays it (with the row's check among findings). */
const ENVELOPE = { SELF_BASIS: null, BASIS_CYCLE: null, VERSION_LEG_UNRESOLVED: null, VERSION_FROZEN: null };

/* The catalogue functions the write runs and relays whole, and the envelope that carries their findings. */
const RELAYED = [
  { site: /basisVersionFindings, called from checkInquiryBasis and from store\.mjs promote/, envelope: "BASIS_VERSION_REFUSED",
    fn: (fm) => { const f = []; C.basisVersionFindings(fm, f); return f; },
    docs: [inquiry("INQ-2026-0130-u", [...refs([]), ...versions(['  - name: "v1"', '    relationship: "alternative"',
             '    state: "suggested"', "    derived_from: null", "    hidden: false", '    author: "ruth"', `    at: "${NOW}"`])]),
           inquiry("INQ-2026-0131-v", [...refs([]), ...versions(['  - name: "v1"', '    description: "d"', '    relationship: "alternative"',
             '    state: "nonsense"', '    derived_from: "v9"', "    hidden: maybe", '    author: "ruth"', `    at: "${NOW}"`, '    kind: "odd"'])])] },
  { site: /checkBiasExtension, run at op=promote and at the gate/, envelope: "BIAS_REFUSED",
    fn: (fm, text) => { const f = []; C.checkBiasExtension({ fm, files: new Map([["bundle.md", text]]) }, f); return f; },
    docs: [bias("BIAS-2026-0132-w", "draft", STATEMENT.map((l) => l.replace("scrutiny", "standard"))),
           bias("BIAS-2026-0133-x", "draft", STATEMENT.map((l) => l.replace(/justification: .*/, 'justification: ""')))] },
];

test("R18: every refusal the catalogue sites at the promote write is enforced there — each row is met by name", async () => {
  const rows = [];
  for (const [family, table] of Object.entries(C)) {
    if (!table || typeof table !== "object" || Array.isArray(table)) continue;
    for (const [code, row] of Object.entries(table))
      if (row && typeof row === "object" && typeof row.where === "string" && /promote\b/.test(row.where)
          && !/src\/index\.mjs/.test(row.where)) rows.push({ family, code, ...row });
  }
  assert.ok(rows.length >= 40, `the catalogue's rows sited at the promote write: ${rows.length}`);
  for (const row of rows) {
    const relay = RELAYED.find((r) => r.site.test(row.where));
    if (relay) continue;                       // shown whole by the relay test below
    assert.ok(PROBES[row.code], `no probe for ${row.family}.${row.code} (${row.check}, ${row.where})`);
    const r = await PROBES[row.code]();
    assert.equal(r.ok, false, `${row.code}: ${JSON.stringify(r)}`);
    if (row.code in ENVELOPE && r.reason !== row.code)
      assert.ok((r.findings || []).some((f) => f.check === row.check), `${row.code} relayed: ${JSON.stringify(r)}`);
    else assert.equal(r.reason, row.code, `${row.code}: ${JSON.stringify(r).slice(0, 300)}`);
  }
});

test("R18: a catalogue function the write runs is relayed whole: the write's findings are the function's errors, finding for finding", async () => {
  for (const relay of RELAYED) {
    const arms = new Set();
    for (const text of relay.docs) {
      const fm = C.parseFrontmatter(text).data;
      const want = relay.fn(fm, text).filter((x) => x.severity === "error").map((x) => x.check).sort();
      assert.ok(want.length, "the fixture meets at least one arm");
      want.forEach((c) => arms.add(c));
      const r = await promote(fm.id, text);
      assert.equal(r.reason, relay.envelope, JSON.stringify(r).slice(0, 300));
      assert.deepEqual(r.findings.map((x) => x.check).sort(), want);
    }
    assert.ok(arms.size >= 2, `${relay.envelope}: more than one arm relayed (${[...arms]})`);
  }
});
