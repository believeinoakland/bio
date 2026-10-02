/* promotion R18 — every refusal the catalogue assigns to the promote act is enforced at the write. Driven through the
 * whole write path as the plane runs it: its composition root (`src/plane/index.mjs`), whose modules reach promotion
 * and register their shares of the checks (R39; `legacy-store`'s until T19). The catalogue is read for its rows whose site is this write path; each is either probed with a
 * package that meets it, or (for a catalogue function the write runs and relays whole) shown relayed finding for
 * finding. A row sited here that this suite does not name fails it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as P from "../../../src/promotion/index.mjs";

const SRC = (f) => fileURLToPath(new URL("../../../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
/* The plane's exported Store (`src/plane/index.mjs`, the composition root; K867: not the `src/index.mjs` re-export, which
   plane's T20 job deleted), which starts instance-setup's registrations (the fact `producingGroup`, K414); a probe beside
   it relays each request to that Store, as the deleted `store.mjs`'s default fetch did. */
const PROBE = 'export { Store } from "./plane/index.mjs";\n'
  + 'export default { fetch: (req, env) => env.STORE.get(env.STORE.idFromName("bio")).fetch(req) };\n';
const mf = new Miniflare({ modules: true, script: PROBE, modulesRoot: "/",
  scriptPath: SRC("write-path-probe.mjs"), compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
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
  ["references: []", "action_kind: other", ...extra, "counterparty:", "  state: named", "  role: Town Clerk",
   "  body: Town of Port Ellery"]),
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
probe("ABSENT", () => promote("INFO-2026-0121-u", info("INFO-2026-0121-u"), { base: "0".repeat(64) }));
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
/* R13: a creation naming no group, on a store that records none (this probe's store was never given one). */
probe("GROUP_UNDETERMINED", () => promote("INFO-2026-0122-v", info("INFO-2026-0122-v").replace("group: test-group\n", "")));
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

/* The checks the write runs through a registered step and relays whole, the envelope that carries their findings, and
   each fixture's error findings as the version grammar (C-25, C-27.15) answers them, stated at this module's interface
   rather than read from the catalogue's function (re-anchored in T19: basis-versions takes the grammar in layer 6). */
const RELAYED = [
  { envelope: "BASIS_VERSION_REFUSED",
    want: [["C-25.1", "C-25.3"], ["C-25.1", "C-25.12", "C-25.13", "C-25.3", "C-25.7", "C-27.15"]],
    docs: [inquiry("INQ-2026-0130-u", [...refs([]), ...versions(['  - name: "v1"', '    relationship: "alternative"',
             '    state: "suggested"', "    derived_from: null", "    hidden: false", '    author: "ruth"', `    at: "${NOW}"`])]),
           inquiry("INQ-2026-0131-v", [...refs([]), ...versions(['  - name: "v1"', '    description: "d"', '    relationship: "alternative"',
             '    state: "nonsense"', '    derived_from: "v9"', "    hidden: maybe", '    author: "ruth"', `    at: "${NOW}"`, '    kind: "odd"'])])] },
];

test("R18: every refusal sited at the promote write is enforced there — each row is met by name", async () => {
  /* This module's own rows sited at this write (C-86, C-97 whole since T18; the act-shape, machine-fence, C-59, C-26.12
     and C-64.1 rows since T19), read from its tables. */
  const own = { PROMOTED_TYPE_CHECKS: P.PROMOTED_TYPE_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS: P.PROJECT_CREATION_VISIBILITY_CHECKS,
                PROMOTION_ROW_CHECKS: P.PROMOTION_ROW_CHECKS, PROJECT_MINT_CHECKS: P.PROJECT_MINT_CHECKS };
  const rows = [];
  for (const [family, table] of Object.entries(own))
    for (const [code, row] of Object.entries(table))
      if (/promote\b/.test(row.where)) rows.push({ family, code, ...row });
  /* The rows later modules hold and enforce at this write through the steps they register (R39), stated here: this
     module cannot import a later one's table (P4), and the catalogue that held them left at T19's close (K785). The version
     grammar's document findings (C-25, C-27.15) are relayed whole (RELAYED, below). */
  const LATER = [["SELF_BASIS", "C-33.22", "inquiry"], ["BASIS_CYCLE", "C-33.23", "inquiry"],
                 ["VERSION_FROZEN", "C-25.11", "basis-versions"], ["VERSION_LEG_UNRESOLVED", "C-25.16", "basis-versions"],
                 ["SURFACED_BY_REWRITTEN", "C-66.5", "inquiry"]];
  for (const [code, check, family] of LATER) rows.push({ family, code, check, where: "" });
  assert.equal(rows.length, 21, `the rows sited at the promote write: ${rows.length}`);
  /* A code is probed once, should two of these tables ever hold it (C-26.12 and C-64.1 were held twice in T19). */
  const probed = new Set();
  for (const row of rows) {
    if (probed.has(row.code)) continue;
    probed.add(row.code);
    assert.ok(PROBES[row.code], `no probe for ${row.family}.${row.code} (${row.check}, ${row.where})`);
    const r = await PROBES[row.code]();
    assert.equal(r.ok, false, `${row.code}: ${JSON.stringify(r)}`);
    if (row.code in ENVELOPE && r.reason !== row.code)
      assert.ok((r.findings || []).some((f) => f.check === row.check), `${row.code} relayed: ${JSON.stringify(r)}`);
    else assert.equal(r.reason, row.code, `${row.code}: ${JSON.stringify(r).slice(0, 300)}`);
  }
});

test("R18: a check the write runs through a registered step is relayed whole: the write's findings are its errors, finding for finding", async () => {
  for (const relay of RELAYED) {
    const arms = new Set();
    for (const [i, text] of relay.docs.entries()) {
      const fm = parseFrontmatter(text).data;
      const want = [...relay.want[i]].sort();
      assert.ok(want.length, "the fixture meets at least one arm");
      want.forEach((c) => arms.add(c));
      const r = await promote(fm.id, text);
      assert.equal(r.reason, relay.envelope, JSON.stringify(r).slice(0, 300));
      assert.deepEqual(r.findings.map((x) => x.check).sort(), want);
    }
    assert.ok(arms.size >= 2, `${relay.envelope}: more than one arm relayed (${[...arms]})`);
  }
});

test("R17: through the whole write path, an unreadable revision gets the readability refusal before any registered fence reads the document (D-741)", async () => {
  const id = "ACTN-2026-0140-y";
  const a = await promote(id, action(id, ["risk_tier: 3"]));
  assert.equal(a.ok, true, JSON.stringify(a));
  const rev = (files) => call("/promote", { bundleId: id, base: a.bundleSha, snapKey: `k${++seq}`, author: "member:ruth",
    files, meta: { object_type: "action" } });
  assert.equal((await rev([])).reason, "NO_BUNDLE_MD");
  assert.equal((await rev([{ path: "n.txt", text: "x" }])).reason, "NO_BUNDLE_MD");
  const blob = await rev([{ path: "bundle.md", blobSha: "a".repeat(64), bytes: 3 }]);
  assert.deepEqual([blob.reason, blob.why], ["BUNDLE_MD_UNREADABLE", "blob"]);
  const nofm = await rev([{ path: "bundle.md", text: "no front matter here" }]);
  assert.deepEqual([nofm.reason, nofm.why], ["BUNDLE_MD_UNREADABLE", "front_matter"]);
});

test("R16 (rec-181): through the whole write path, an item a live edge cites is refused its retirement CITED, naming the citer and `to: retired`; with no edge it retires", async () => {
  const verified = (id) => info(id).replace("current_state: collected", "current_state: verified");
  const retired = (id) => info(id).replace("current_state: collected", "current_state: retired")
    .replace("prior_state: null", "prior_state: verified");
  const cited = "INFO-2026-0150-z", free = "INFO-2026-0151-z", citer = "INQ-2026-0152-z";
  const c = await promote(cited, verified(cited), { replay: true });
  const f = await promote(free, verified(free), { replay: true });
  assert.deepEqual([c.ok, f.ok], [true, true], JSON.stringify([c, f]));
  const q = await promote(citer, inquiry(citer, refs([cited])));
  assert.equal(q.ok, true, JSON.stringify(q));
  const r = await promote(cited, retired(cited), { base: c.bundleSha });
  assert.deepEqual([r.ok, r.reason, r.to], [false, "CITED", "retired"], JSON.stringify(r));
  assert.deepEqual(r.offenders, [{ id: cited, citedBy: [citer] }]);
  const g = await promote(free, retired(free), { base: f.bundleSha });
  assert.equal(g.ok, true, JSON.stringify(g));
});

test("R53 (N426): through the whole write path, a plan's and an escalation's bundles are committed with the project their documents state, so a member outside the project does not see them on the record-wide read; the project's participant does", async () => {
  const proj = await promote(null, common(null, "project", "project@1", "Harbor Works", "forming", ['objective: "Learn where the harbor money went."']).concat("---", "").join("\n"),
    { ownerMemberId: "ruth" });
  assert.equal(proj.ok, true, JSON.stringify(proj));
  const P1 = proj.bundleId;
  const pln = "PLN-2026-0160-a", esc = "ESC-2026-0161-b", free = "INFO-2026-0162-c";
  const stated = (id, type, schema, title, state) => [...common(id, type, schema, title, state, [`project: ${P1}`, "references: []"]),
    "---", "", "## Session Log", ""].join("\n");
  /* A plan and an escalation change only through their own acts, which promote them; filed here as replays (a migrated
     record), the path those modules' steps admit, since the column is written the same way for every writer. */
  const a = await promote(pln, stated(pln, "action_plan", "action_plan@1", "A plan", "open"), { replay: true });
  const b = await promote(esc, stated(esc, "escalation", "escalation@1", "An escalation", "drafted"), { replay: true });
  const c = await promote(free, info(free));
  assert.deepEqual([a.ok, b.ok, c.ok], [true, true, true], JSON.stringify([a, b, c]));
  const listed = async (viewer) => {
    const r = await call(`/list?viewer=${encodeURIComponent(viewer)}`);
    return new Set((r.bundles || r.items || r).map((x) => x.bundle_id ?? x.id));
  };
  const outsider = await listed("member:zed"), insider = await listed("member:ruth");
  for (const id of [pln, esc, P1]) {
    assert.equal(outsider.has(id), false, `${id} is fenced by its project's sight`);
    assert.equal(insider.has(id), true, `${id} is seen by the project's participant`);
  }
  assert.equal(outsider.has(free), true, "a bundle stating no project is fenced by nothing");
});
