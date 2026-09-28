/* reevaluation over the modules it uses, each the real one (record-core, membership, promotion, provenance, content,
   entities, connections, inquiry, basis-versions, strength), on a real SQLite database (node:sqlite) standing in for a
   Durable Object's storage. What a later module registers (legacy-store's facts `caseMember` and `publishedRegistry`),
   the readings content reads through extraction (its R30 `readingOf`, R36 `unitsOf`) and retrieval's selections are
   stand-ins the test controls. Every test drives `reevaluation` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf, canonicalExtent } from "../../../src/content/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";
import { basisVersionsOf } from "../../../src/basis-versions/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function storage() {
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
export const MACHINE = "class:daemon";
export const NOW = "2026-09-28T01:00:00Z";
/** A text layer's chain, unscoped. */
export const LAYER = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];
/** A text unit of one page, as extraction's index holds it. */
export const U = (page, text, truncated = false) =>
  ({ extent: canonicalExtent({ kind: "pdf-page", page }), ref: `page ${page + 1}`, text, truncated });

/* The columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates today. */
const BUNDLE_COLUMNS = ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"];

/* The columns of extraction's four tables that inquiry, content, entities, connections and basis-versions join. */
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

/** The readings extraction would provide: `readings[sha] = {chain, pageCount, …}`, `units[sha] = {units, state}`. */
function readings() {
  const r = { readings: {}, units: {}, readFor: {} };
  r.provider = {
    readingOf: (s) => (r.readings[s] ? { reading: { page_boxes: null }, chain: null, pageCount: null,
      textContainer: null, captureFormat: null, ...r.readings[s] } : null),
    unitsOf: (s) => r.units[s] || { units: [], state: null },
    capturesReadFor: (b) => (r.readFor[b] || []).map((capture_sha) => ({ capture_sha, at: null })),
    onReading: () => ({ ok: true }),
  };
  return r;
}

export function world({ caseMembers = new Set(), group = "test-group", earnedOverride = null } = {}) {
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
  const published = { value: {} };
  promotion.registerFact("producingGroup", "legacy-store", () => group);
  promotion.registerFact("caseMember", "legacy-store", (id) => caseMembers.has(id));
  promotion.registerFact("publishedRegistry", "legacy-store", (id, targets) => {
    const out = {};
    for (const t of [id, ...(targets || [])]) if (t && published.value[t]) out[t] = published.value[t];
    return out;
  });
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  /* extraction's tables, as far as the modules below join them (reevaluation does not use extraction); what each
     reading holds is the stand-in below. */
  for (const t of EXTRACTION_JOINED) st.db.exec(t);
  const ex = readings();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: ex.provider, now: () => clock.now });
  content.migrate();
  /* entities is the one connections reaches on this host (reevaluation does not use it directly). */
  const connections = connectionsOf(host, { record, membership, promotion, content, extraction: ex.provider, capture: {} });
  const entities = connections.entities;
  entities.migrate();
  connections.migrate();
  const selections = new Map();
  const retrieval = {
    selectionResolve: ({ handle }) => {
      const s = selections.get(handle);
      return s ? { ok: true, members: s, drift: null } : { ok: false, reason: "NO_SUCH_SELECTION", check: "C-33.20" };
    },
  };
  const k = inquiryOf(host, { record, membership, promotion, content, connections, entities, retrieval, provenance: prov,
                              now: () => clock.now });
  k.migrate();
  const basisVersions = basisVersionsOf(host, { record, membership, promotion, content,
    inquiry: { earned: (s, t) => k.earned(s, t), legCapped, cyclePath: (id, t) => k.cyclePath(id, t) },
    now: () => clock.now });
  basisVersions.migrate();
  const strength = strengthOf(host, { record, membership,
    inquiry: { basisFor: (id, o) => k.basisFor(id, o), earned: (e, t) => k.earned(e, t), legCapped,
               subjectEntityOf: (id) => k.subjectEntityOf(id) },
    versions: basisVersions, producingGroup: () => group, now: () => clock.now });
  /* inquiry as this module reads it; a test may bound what the record earns (R5). */
  const inquiry = new Proxy(k, { get: (t, p) => (p === "earned" && earnedOverride
    ? earnedOverride : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const r = reevaluationOf(host, { record, membership, promotion, inquiry, content, provenance: prov, strength,
                                   basisVersions, now: () => clock.now });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, content, entities, connections, k, basisVersions, strength, r, clock,
    ex, selections, caseMembers, published,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
      return out;
    },
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
    /** An information bundle holding `captures` (default: one of its own), registered in that order. `extra` lines
     *  join its front matter. */
    doc(id, captures = null, { extra = [], files: more = [], body = "A document." } = {}) {
      const caps = captures || [w.cap(`${id}-0`, `the text of ${id}`)];
      const files = [{ path: "bundle.md", text: infoMd(id, extra, body) }, ...more];
      for (const c of caps) files.push({ path: c.path, text: c.text });
      files.push({ path: "data/provenance.json", text: JSON.stringify({ documents: caps.map((c) => provDoc(c)) }, null, 2) });
      const res = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author: "member:alice", files,
        meta: { object_type: "information" },
        register: caps.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!res.ok) throw new Error(`fixture doc refused: ${JSON.stringify(res).slice(0, 400)}`);
      return caps;
    },
    /** A document's revision (its bundle.md with `extra` front-matter lines). */
    redoc(id, extra = [], files = []) {
      const res = promotion.promote({ bundleId: id, base: record.head(id).bundleSha, snapKey: `k${++n}`,
        author: "member:alice", files: [{ path: "bundle.md", text: infoMd(id, extra) }, ...files],
        meta: { object_type: "information" }, replay: true });
      if (!res.ok) throw new Error(`fixture redoc refused: ${JSON.stringify(res).slice(0, 400)}`);
      return res;
    },
    /** A capture read, with its text units; and retrieved from `address` at `at`. */
    read(capSha, units = null, { pageCount = 3, state = "whole" } = {}) {
      ex.readings[capSha] = { chain: LAYER, pageCount };
      if (units) ex.units[capSha] = { units: units.map((u, i) => ({ extent: u.extent, ref: u.ref ?? `u${i}`, text: u.text,
                                                                      truncated: !!u.truncated })), state };
    },
    at(capSha, address, retrieved) {
      prov.recordReceipt({ address: `https://${address}`, addressNorm: address, captureSha: capSha, retrieved });
    },
    /** A passage of a capture, minted as content. */
    passage(bundleId, capSha, extent = { kind: "pdf-page", page: 1 }) {
      const m = content.mint({ bundleId, captureSha: capSha, extent, mintedBy: V("bo") });
      if (!m.ok) throw new Error(`fixture passage refused: ${JSON.stringify(m).slice(0, 300)}`);
      return m.content_id;
    },
    /** An inquiry, created through promotion (so inquiry's check and projection run). */
    inquiry(id, opts = {}) {
      const res = w.promote(id, inquiryMd(id, opts));
      if (!res.ok) throw new Error(`fixture inquiry refused: ${JSON.stringify(res).slice(0, 600)}`);
      return res;
    },
    promote(id, text) {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`,
        author: "member:alice", files: [{ path: "bundle.md", text }], meta: { object_type: "inquiry" } });
    },
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    fm: (id) => { const t = w.text(id); return t ? parseFrontmatter(t).data : null; },
    project(title, owner, cites = []) {
      const res = promotion.promote({ base: null, snapKey: `k${++n}`, author: `member:${owner}`, ownerMemberId: owner,
        files: [{ path: "bundle.md", text: projMd(title, cites) }], meta: { object_type: "project" } });
      if (!res.ok) throw new Error(`fixture project refused: ${JSON.stringify(res).slice(0, 400)}`);
      return res.bundleId;
    },
    member(id, { role = "member" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, 'active', '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role);
    },
    /** A published edition of `id` in the registry the store provides (promotion's fact). */
    publish(id, edition, { capture = null, connection = null, testimony = null, at = "2026-09-27T12:00:00Z" } = {}) {
      const e = published.value[id] || (published.value[id] = { object_type: "inquiry", latest: 0, editions: {} });
      e.editions[String(edition)] = { edition, ratified_at: at, capture, connection, ...(testimony ? { testimony } : {}) };
      e.latest = Math.max(e.latest, edition);
    },
  };
  return w;
}

/** An inquiry document. `legs`: [{target, role?, grade?, grade_axis?, grade_source?, ground?, target_edition?,
 *  content_id?, note?}]; `refs` defaults to a confirmed `cites` entry per leg target. */
export function inquiryMd(id, { question = `Is ${id} answered?`, legs = [], refs = null, state = "open",
                               prior = "null", extra = [], grounds = null, disposition = '""' } = {}) {
  const references = refs ?? [...new Set(legs.map((l) => l.target))].map((t) => ({ target: t, rel: "cites" }));
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
    `current_state: ${state}`, `prior_state: ${prior}`, `created: "2026-09-27T00:00:00Z"`,
    `last_updated: "2026-09-27T00:00:00Z"`, "group: test-group",
    ...(references.length
      ? ["references:", ...references.flatMap((r) => [`  - target: ${r.target}`, `    rel: ${r.rel || "cites"}`,
          `    status: ${r.status || "confirmed"}`, ...(r.reason ? [`    reason: "${r.reason}"`] : [])])]
      : ["references: []"]),
    "state_history: []", "surfaced_by: human", `disposition_reason: ${disposition}`,
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role || "supports"}`,
      ...(l.grade ? [`    grade: ${l.grade}`] : []), ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []),
      ...(l.grade_source ? [`    grade_source: ${l.grade_source}`] : []), ...(l.ground ? [`    ground: ${l.ground}`] : []),
      ...(l.target_edition != null ? [`    target_edition: ${l.target_edition}`] : []),
      ...(l.content_id ? [`    content_id: ${l.content_id}`] : []), ...(l.note ? [`    note: "${l.note}"`] : [])])] : []),
    ...(grounds ? ["grounds:", ...grounds.flatMap((g) => [`  - ground: ${g.ground}`, `    asserted_by: ${g.asserted_by}`,
      `    at: "${g.at}"`])] : []),
    ...extra,
    "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
}

export function infoMd(id, extra = [], body = "A document.") {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          ...extra, "---", "", "## Summary", "", body, ""].join("\n");
}

export function projMd(title, cites = []) {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          ...(cites.length ? ["references:", ...cites.flatMap((c) => [`  - target: ${c.target || c}`, "    rel: cites",
            `    status: ${c.status || "confirmed"}`])] : ["references: []"]),
          "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");
}

export function provDoc(c) {
  return {
    file: c.path, locator: `https://example.org/${c.path}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
               bytes: Buffer.byteLength(c.text) },
    origin: { kind: "named_request" },
  };
}
