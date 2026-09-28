/* consequences over the modules it uses, each the real one (record-core, membership, promotion, provenance, content,
   inquiry, strength), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage. Two stand-ins
   the test controls: `conformance` (not yet merged into this tranche; it answers `determinationRead` as conformance R9
   states it, gated on the project's sight) and the passage text of a content row (content provides no read of it yet;
   see the module's header). Every test drives `consequences` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { consequencesModule } from "../../../src/consequences/index.mjs";

export const sha = (s) => createHash("sha256").update(Buffer.from(s, "utf8")).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
  return {
    db, sql,
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const MACHINE = "class:ai";
export const NOW = "2026-09-28T01:00:00Z";
const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];

const BUNDLE_COLUMNS = ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"];
const EXTRACTION_JOINED = [
  `CREATE TABLE readings (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL, content_type TEXT, reading TEXT,
     at TEXT, capture_format TEXT)`,
  `CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL, ref_kind TEXT,
     ref_key TEXT, label TEXT, pos_kind TEXT, pos TEXT, pos_ref TEXT, occurrence TEXT NOT NULL DEFAULT '',
     seq INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (capture_sha, ref, occurrence))`,
  `CREATE TABLE reading_ref_terms (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
     src TEXT NOT NULL, term TEXT NOT NULL, PRIMARY KEY (capture_sha, ref, src, term))`,
  `CREATE TABLE reading_text_source (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL,
     transcribed INTEGER NOT NULL DEFAULT 0, terminal_step TEXT, engines TEXT, derivation_cap TEXT,
     steps INTEGER NOT NULL DEFAULT 0, chain TEXT, calibrations TEXT)`,
];

/** The world: `alice` owns and has joined project P; `bob` is a member who has not; `carol` is an administrator
 *  outside P (who sees it). `passages: false` leaves the passage-text read out (R4's "a form not read"). */
export function world({ passages = true, group = "test-group", superseded = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  for (const c of BUNDLE_COLUMNS) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "legacy-store", () => group);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  promotion.registerFact("publishedRegistry", "legacy-store", () => ({}));
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  for (const t of EXTRACTION_JOINED) st.db.exec(t);
  const ex = { readings: {}, units: {} };
  const extraction = {
    readingOf: (s) => (ex.readings[s] ? { reading: { page_boxes: null }, chain: null, pageCount: null,
      textContainer: null, captureFormat: null, ...ex.readings[s] } : null),
    unitsOf: (s) => ex.units[s] || { units: [], state: null },
    capturesReadFor: () => [],
    onReading: () => ({ ok: true }),
  };
  const content = contentOf(host, { record, membership, provenance: prov, extraction, now: () => clock.now });
  content.migrate();
  const connections = connectionsOf(host, { record, membership, promotion, content, extraction, capture: {} });
  const entities = connections.entities;
  entities.migrate();
  connections.migrate();
  const inquiry = inquiryOf(host, { record, membership, promotion, content, connections, entities,
    retrieval: { selectionResolve: () => ({ ok: false, reason: "NO_SUCH_SELECTION" }) }, provenance: prov,
    now: () => clock.now });
  inquiry.migrate();
  const basisVersions = basisVersionsOf(host, { record, membership, promotion, content,
    inquiry: { earned: (s, t) => inquiry.earned(s, t), legCapped, cyclePath: (id, t) => inquiry.cyclePath(id, t) },
    now: () => clock.now });
  basisVersions.migrate();
  const strength = strengthOf(host, { record, membership,
    inquiry: { basisFor: (id, o) => inquiry.basisFor(id, o), earned: (e, t) => inquiry.earned(e, t), legCapped,
               subjectEntityOf: (id) => inquiry.subjectEntityOf(id) },
    versions: basisVersions, producingGroup: () => group, now: () => clock.now });

  /* conformance R9, as far as R1 reads it. */
  const determinations = new Map();
  const conformance = {
    determinationRead: ({ id, viewer }) => {
      const d = determinations.get(id);
      if (!d || (viewer != null && membership.sight(d.project, viewer) !== "full"))
        return { ok: false, reason: "NO_SUCH_DETERMINATION", id };
      return { ok: true, id, project: d.project, outcomes: d.outcomes, superseded_by: d.superseded_by ?? null };
    },
  };
  const texts = new Map();
  /* inquiry as this module reads it; a test may state which inquiries are superseded (inquiry R16's index). */
  const inq = new Proxy(inquiry, { get: (t, p) => (p === "supersededBy" && superseded
    ? (id) => superseded.get(id) || [] : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const c = consequencesModule(host, { record, membership, promotion, conformance, content, provenance: prov, inquiry: inq,
    strength, now: () => clock.now, ...(passages ? { passageText: (id) => texts.get(id) ?? null } : {}) });

  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, content, inquiry, strength, c, clock, ex, texts, determinations,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
      return out;
    },
    member(id, { role = "member" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
    },
    project(title, owner) {
      const res = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
      if (!res.ok) throw new Error(`fixture project refused: ${JSON.stringify(res).slice(0, 400)}`);
      return res.bundleId;
    },
    /** An information bundle holding one capture of `text`; answers the capture's sha. */
    doc(id, text = `the text of ${id}`) {
      const cap = { path: `snapshots/${id}.txt`, text, sha: sha(text) };
      const files = [{ path: "bundle.md", text: infoMd(id) }, { path: cap.path, text },
        { path: "data/provenance.json", text: JSON.stringify({ documents: [provDoc(cap)] }, null, 2) }];
      const res = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: V("alice"), files,
        meta: { object_type: "information" },
        register: [{ sha256: cap.sha, path: cap.path, encoding: "utf8", bytes: Buffer.byteLength(text) }] });
      if (!res.ok) throw new Error(`fixture doc refused: ${JSON.stringify(res).slice(0, 400)}`);
      ex.readings[cap.sha] = { chain: LAYER, pageCount: 3 };
      return cap.sha;
    },
    /** A receipt of `capSha` from `address` (R2's route: `direct`, or `archive.org`). */
    receipt(capSha, address, { via = "direct", retrieved = "2026-09-27T00:00:00Z" } = {}) {
      prov.recordReceipt({ address: `https://${address}`, addressNorm: address, captureSha: capSha, retrieved, via });
    },
    /** A passage of a document's capture holding `text`, minted as content; answers its content id. */
    passage(bundleId, capSha, text, page = 1) {
      const m = content.mint({ bundleId, captureSha: capSha, extent: { kind: "pdf-page", page }, mintedBy: V("alice") });
      if (!m.ok) throw new Error(`fixture passage refused: ${JSON.stringify(m).slice(0, 300)}`);
      texts.set(m.content_id, text);
      return m.content_id;
    },
    /** A passage whose document was captured directly from `address` (grade B), holding `text`. */
    figure(id, text, address = `example.org/${id}`, via = "direct") {
      const s = w.doc(id, `${text} (${id})`);
      w.receipt(s, address, { via });
      return w.passage(id, s, text);
    },
    determination(id, project, outcomes, extra = {}) {
      determinations.set(id, { project, outcomes: Object.entries(outcomes).map(([standard, outcome]) => ({ standard, outcome })),
                               ...extra });
      return id;
    },
    /** An inquiry in `state`, resting on one document leg. */
    inquiryAt(id, state = "open", { target, prior = "null", extra = [] } = {}) {
      const head = record.head(id);
      const res = promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`,
        author: V("alice"), files: [{ path: "bundle.md", text: inquiryMd(id, { state, prior, target, extra }) }],
        meta: { object_type: "inquiry" } });
      if (!res.ok) throw new Error(`fixture inquiry refused: ${JSON.stringify(res).slice(0, 600)}`);
      return res;
    },
  };
  w.member("alice");
  w.member("bob");
  w.member("carol", { role: "admin" });
  w.P = w.project("Budget watch", "alice");
  w.Q = w.project("Other group", "bob");
  return w;
}

export function inquiryMd(id, { state = "open", prior = "null", target, extra = [] } = {}) {
  const concluded = state === "concluded";
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Does the cut follow from ${id}?"`,
    `current_state: ${state}`, `prior_state: ${prior}`, `created: "2026-09-27T00:00:00Z"`,
    `last_updated: "2026-09-27T00:00:00Z"`, "group: test-group",
    "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
    "state_history: []", "surfaced_by: human", 'disposition_reason: ""',
    "basis:", `  - target: ${target}`, "    role: supports",
    ...(concluded ? ['falsifier: "a budget line restoring the fund would falsify this"'] : []),
    ...extra,
    "---", "", "## Question", "", `Does the cut follow from ${id}?`, "", "## What It Rests On", "",
    "## Conclusion", "", concluded ? "The harm follows from the act." : "", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
}

function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
}

function projMd(title) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");
}

function provDoc(c) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
  };
}
