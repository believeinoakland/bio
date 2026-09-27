/* retrieval's test fixture: the module over the modules it uses, each the real one where it is extracted (record-core,
   membership, promotion, provenance), on a real SQLite database (node:sqlite, FTS5 included) standing in for a Durable
   Object's storage. Two providers are the test's own, as `retrievalOf`'s deps take them until their modules merge:
   extraction's drift obligations (its R38, `driftFor`) and observation-log's services and vocabulary (its R1, R9–R13,
   R18, R19, R21), written here to observation-log's Provides. The tables other modules own that the compiler and the
   frontier read (capture's `links`, extraction's `readings`/`capture_text`, content's `content`, and the legacy tables
   `observation_log`, `leads`, `lead_shares`, `entities`, `resolutions`, `inquiry_basis`) are created from their owners'
   schemas where one is exported, else from the schema text here. Every test drives `retrieval` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { EXTRACTION_SCHEMA } from "../../../src/extraction/schema.mjs";
import { CAPTURE_SCHEMA } from "../../../src/capture/schema.mjs";
import { CONTENT_SCHEMA } from "../../../src/content/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export const V = (id) => `member:${id}`;
export const MACHINE = "class:member";

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

const run = (db, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  db.exec(bare);
};

/* The legacy tables (legacy-store's `schema.mjs`, their owners not yet extracted), as that schema declares them. */
const LEGACY_TABLES = `
CREATE TABLE IF NOT EXISTS entities (entity_id TEXT PRIMARY KEY, kind TEXT NOT NULL, label TEXT NOT NULL, note TEXT,
  declared_by TEXT, at TEXT);
CREATE TABLE IF NOT EXISTS resolutions (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL,
  entity_id TEXT NOT NULL, grade TEXT NOT NULL, method TEXT NOT NULL, basis TEXT, established INTEGER NOT NULL DEFAULT 0,
  raised_from TEXT, resolved_by TEXT, at TEXT, PRIMARY KEY (capture_sha, ref, entity_id));
CREATE TABLE IF NOT EXISTS inquiry_basis (bundle_id TEXT NOT NULL, ord INTEGER NOT NULL, target_id TEXT NOT NULL,
  target_type TEXT NOT NULL, role TEXT NOT NULL, grade TEXT, grade_axis TEXT, grade_source TEXT, note TEXT, at TEXT,
  ground TEXT, content_id TEXT, PRIMARY KEY (bundle_id, ord));
CREATE TABLE IF NOT EXISTS inquiry_basis_version_legs (bundle_id TEXT NOT NULL, name TEXT NOT NULL, ord INTEGER NOT NULL,
  target_id TEXT NOT NULL, target_type TEXT NOT NULL, role TEXT NOT NULL, grade TEXT, grade_axis TEXT, grade_source TEXT,
  note TEXT, at TEXT, ground TEXT NOT NULL, content_id TEXT, PRIMARY KEY (bundle_id, name, ord));
CREATE TABLE IF NOT EXISTS observation_log (seq INTEGER PRIMARY KEY, at TEXT NOT NULL, actor_class TEXT NOT NULL,
  actor TEXT, authority_kind TEXT NOT NULL, authority TEXT, level TEXT NOT NULL, subject_kind TEXT NOT NULL, subject TEXT,
  state TEXT NOT NULL, governed INTEGER NOT NULL DEFAULT 0, condition TEXT, bound TEXT, terminal INTEGER NOT NULL DEFAULT 0,
  result_kind TEXT, result_ref TEXT, detail TEXT);
CREATE INDEX IF NOT EXISTS observation_log_frontier ON observation_log(level, subject_kind, subject, seq);
CREATE INDEX IF NOT EXISTS observation_log_authority ON observation_log(authority_kind, authority, seq);
CREATE INDEX IF NOT EXISTS observation_log_tally ON observation_log(level, state, seq);
CREATE TABLE IF NOT EXISTS leads (lead_id TEXT PRIMARY KEY, author TEXT NOT NULL, words TEXT NOT NULL, locator TEXT,
  at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS lead_shares (lead_id TEXT NOT NULL, bundle_id TEXT NOT NULL, sharer TEXT NOT NULL,
  at TEXT NOT NULL, PRIMARY KEY (lead_id, bundle_id));
`;

/* ---- observation-log's Provides (R1, R9–R13, R18, R19, R21), as the test's own provider ---- */

export const VOCAB = Object.freeze({
  OBSERVATION_STATES: { LOOKED_ABSENT: "we looked and it is not there", LOOKED_INDETERMINATE: "we looked and could not tell",
                        partial: "we looked and got part of it (a maintainer's note)", PRESENT: "we looked and it is there" },
  DEFINITIVE_STATES: new Set(["LOOKED_ABSENT", "PRESENT"]),
  CONTENT_AXIS_STATES: { indexed_full: "all indexed", indexed_partial: "part indexed", indexed_none: "none indexed",
                         not_extracted: "nobody tried to extract it" },
  CONTENT_AXIS_UNDETERMINED: "undetermined",
  MISSING_ROW_CAUSES: { pre_log: "read before the log", purged: "cannot tell", never_looked: "nobody looked",
                        watermark_band: "the second before the first row" },
  MEANING_MISSING_ROW_CAUSES: { pre_log: "looked before the log", purged: "cannot tell (meaning)",
                                never_looked: "nobody looked (meaning)", watermark_band: "the band (meaning)" },
  CONTENT_EVIDENCE_IS_ONE_SIDED: { capture: false },
  MEANING_EVIDENCE_IS_ONE_SIDED: { capture: false, reference: true, entity: true },
  INTERNET_EVIDENCE_IS_ONE_SIDED: { description: false },
  DOCUMENT_EVIDENCE_IS_ONE_SIDED: { address: true },
  INTERNET_FRONTIER_EMPTY_CAUSES: { no_member: "no member", no_leads_visible: "no lead you may read",
                                    never_followed: "nobody followed them" },
  LEAD_VOCABULARY: { states: { LOOKED_ABSENT: "we looked and it is not there", LOOKED_INDETERMINATE: "we looked and could not tell",
                               partial: "we looked and got part of it", PRESENT: "we looked and it is there" },
                     outcomes: ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial", "PRESENT"] },
});

const ALL = ["pre_log", "purged", "never_looked"];
export function causesNotRuledOut(cause, { evidenceOneSided } = {}) {
  if (cause === "pre_log") return ["pre_log"];
  if (cause === "never_looked") return ["never_looked"];
  if (cause !== "purged" && cause !== "watermark_band") return [...ALL];
  return evidenceOneSided === false ? ["purged", "never_looked"] : [...ALL];
}

export function missingCause({ hasArtifact = false, registeredAt = null, firstRowAt = null } = {}) {
  if (hasArtifact) return "pre_log";
  if (!firstRowAt || !registeredAt) return "purged";
  const e = Date.parse(registeredAt), f = Date.parse(firstRowAt);
  if (!Number.isFinite(e) || !Number.isFinite(f)) return "purged";
  if (e >= f) return "never_looked";
  if (e >= f - 1000) return "watermark_band";
  return "purged";
}

export function contentAxisFor({ observed = null, unitsComplete = null, reason = null, missingCause: cause = null,
                                 indexObserved = null, indexReason = null } = {}) {
  if (observed == null) {
    const c = ["pre_log", "purged", "never_looked", "watermark_band"].includes(cause) ? cause : "purged";
    return c === "never_looked"
      ? { state: "not_extracted", determined: true, missing_cause: c, why: "nobody tried" }
      : { state: "undetermined", determined: false, missing_cause: c, why: `no observation: ${c}` };
  }
  if (observed === "LOOKED_ABSENT" || observed === "LOOKED_INDETERMINATE")
    return { state: "indexed_none", determined: true, why: reason || "none" };
  if (indexObserved === "LOOKED_ABSENT" || indexObserved === "LOOKED_INDETERMINATE")
    return { state: "indexed_none", determined: true, why: indexReason || "none" };
  if (unitsComplete == null) return { state: "undetermined", determined: false, why: "no index observation" };
  return unitsComplete === true && observed === "PRESENT"
    ? { state: "indexed_full", determined: true, why: "full" }
    : { state: "indexed_partial", determined: true, why: "partial" };
}

export function observationCoverage({ state, resultRef } = {}) {
  if (resultRef != null && String(resultRef) !== "") return "backed";
  return state === "PRESENT" ? "undetermined" : "none_owed";
}

/** observation-log's services over the fixture's tables: R9 `latest`, R10 `verification`, R11 the rules, R13
 *  `rowVisible` (the capture referent and the bundle-or-capture authorities; `run` through `w.runs`, the runs a viewer
 *  may read), R18's referent rule, R19 `leadReach`. */
export function observation(w) {
  const one = (q, ...a) => w.st.sql.exec(q, ...a)[0] ?? null;
  const rows = (q, ...a) => w.st.sql.exec(q, ...a);
  const sees = (id, viewer) => w.retrieval.sight(viewer)(id);
  const viaRegister = (s) => one(`SELECT bundle_id FROM register WHERE capture_sha = ? LIMIT 1`, s)?.bundle_id ?? null;
  return {
    vocabulary: VOCAB,
    contentAxisFor, observationCoverage, causesNotRuledOut, missingCause,
    missingMeaningCause(kind, subject, entered) {
      const probe = { capture: `SELECT 1 x FROM readings WHERE capture_sha = ?`,
                      reference: `SELECT 1 x FROM resolutions WHERE ref = ? LIMIT 1`,
                      entity: null }[kind];
      if (probe === undefined) return "purged";
      if (probe && one(probe, subject)) return "pre_log";
      return missingCause({ hasArtifact: false, registeredAt: entered,
                            firstRowAt: one(`SELECT MIN(at) AS at FROM observation_log WHERE level = 'meaning'`)?.at ?? null });
    },
    firstRowAt: (level) => one(`SELECT MIN(at) AS at FROM observation_log WHERE level = ?`, level)?.at ?? null,
    latest: (level, { limit = 200, subjectKind = null } = {}) => rows(
      `SELECT o.* FROM observation_log o WHERE o.level = ? ${subjectKind ? "AND o.subject_kind = ?" : ""}
         AND o.seq = (SELECT MAX(i.seq) FROM observation_log i WHERE i.level = o.level AND i.subject_kind = o.subject_kind
                        AND i.subject IS o.subject)
       ORDER BY o.seq DESC LIMIT ?`, ...(subjectKind ? [level, subjectKind, limit] : [level, limit])),
    verification(level, kind, subject) {
      const p = one(`SELECT at, seq FROM observation_log WHERE level = ? AND subject_kind = ? AND subject IS ? AND state = 'PRESENT'
                      ORDER BY seq DESC LIMIT 1`, level, kind, subject);
      const u = p ? one(`SELECT at FROM observation_log WHERE level = ? AND subject_kind = ? AND subject IS ?
                           AND state = 'LOOKED_INDETERMINATE' AND seq > ? ORDER BY seq LIMIT 1`, level, kind, subject, p.seq) : null;
      return { last_verified: p ? p.at : null, unreachable_since: u ? u.at : null };
    },
    rowVisible(row, viewer) {
      if (viewer === MACHINE) return true;
      if (!/^member:/.test(String(viewer || "")) && viewer !== "admin") return false;
      const named = [];
      if (row.result_kind === "capture" && row.result_ref) { const b = viaRegister(row.result_ref); if (!b) return false; named.push(b); }
      if (row.authority != null && row.authority !== "") {
        const a = String(row.authority);
        if (row.authority_kind === "run") { if (!(w.runs[a] || []).includes(viewer)) return false; }
        else if (["ratify", "link", "acquire", "extract", "derive"].includes(row.authority_kind)) {
          const b = one(`SELECT 1 x FROM bundles WHERE bundle_id = ?`, a) ? a : viaRegister(a);
          if (!b) return false; named.push(b);
        } else return false;
      }
      return named.every((b) => sees(b, viewer));
    },
    leadReach(viewer, identity) {
      const who = w.membership.positionalMember(viewer, identity);
      if (who == null) return null;
      return { sql: `(l.author = ? OR EXISTS (SELECT 1 AS x FROM lead_shares s JOIN project_participants pp
                       ON pp.project_id = s.bundle_id WHERE s.lead_id = l.lead_id AND pp.member_id = ?
                       AND pp.state IN ('joined', 'leaving')))`, args: [who, who] };
    },
    leadReferentVisible(kind, ref, viewer) {
      const b = kind === "capture" ? viaRegister(ref) : one(`SELECT bundle_id FROM content WHERE content_id = ?`, ref)?.bundle_id;
      return !!b && sees(b, viewer);
    },
  };
}

/* ---- documents ---- */

export const T0 = "2026-09-27T00:00:00Z";

export function md(fields, body = "\n## Summary\n\nA document.\n") {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (v && typeof v === "object") { lines.push(`${k}:`); for (const [a, b] of Object.entries(v)) lines.push(`  ${a}: ${JSON.stringify(b)}`); continue; }
    lines.push(`${k}: ${v === null ? "null" : typeof v === "string" && /[:#"'\[\]{}]/.test(v) ? JSON.stringify(v) : v}`);
  }
  lines.push("---", body);
  return lines.join("\n");
}

export const infoMd = (id, extra = {}) => md({ id, object_type: "information", schema: "information@1", title: `Document ${id}`,
  current_state: "collected", prior_state: null, created: T0, last_updated: T0, group: "test-group",
  criticality: "supporting", ...extra });

export function provDoc(c) {
  return { file: c.path, locator: `https://example.org/${c.path}`, retrieved: T0, authority: "the publisher",
           authority_state: "determined", authority_basis: "named on the document",
           capture: { method: "acquire", grade: "B", actor_class: "session", sha256: c.sha, encoding: "utf8",
                      bytes: Buffer.byteLength(c.text) },
           origin: { kind: "named_request" } };
}

/** A world: the storage, the real record-core, membership, promotion and provenance, the test's extraction and
 *  observation providers, and `retrieval` over them. `members` are enrolled active; `admins` too, as administrators. */
export function world({ members = ["ann", "vera"], admins = [], now = Date.parse("2026-09-27T03:00:00Z") } = {}) {
  const st = storage();
  const host = { storage: st };
  run(st.db, RECORD_SCHEMA);
  const clock = { now, sel: now };
  const record = recordOf(host, { evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const iso = () => new Date(clock.now).toISOString().replace(/\.\d+Z$/, "Z");
  const promotion = promotionOf(host, { record, membership, now: iso });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("citedBy", "legacy-store", () => []);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: iso });
  prov.migrate();
  run(st.db, EXTRACTION_SCHEMA);
  /* extraction's text index over `capture_text`, as its migrate() creates it (external content, kept by triggers). */
  st.db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5(text, content='capture_text',
                content_rowid='rowid', tokenize='unicode61')`);
  st.db.exec(`CREATE TRIGGER IF NOT EXISTS capture_text_ai AFTER INSERT ON capture_text BEGIN
                INSERT INTO capture_text_fts(rowid, text) VALUES (new.rowid, new.text); END`);
  st.db.exec(`CREATE TRIGGER IF NOT EXISTS capture_text_ad AFTER DELETE ON capture_text BEGIN
                INSERT INTO capture_text_fts(capture_text_fts, rowid, text) VALUES ('delete', old.rowid, old.text); END`);
  run(st.db, CAPTURE_SCHEMA);
  run(st.db, CONTENT_SCHEMA);
  run(st.db, LEGACY_TABLES);
  /* The strength and inquiry columns legacy-store adds to `bundles` (their owners, layer 6, not yet extracted), which
     the compiler's fields read. */
  for (const [c, t] of [["inquiry_capture_strength", "TEXT"], ["inquiry_capture_state", "TEXT"],
                        ["inquiry_connection_strength", "TEXT"], ["inquiry_connection_state", "TEXT"],
                        ["inquiry_basis_count", "INTEGER"], ["inquiry_subject_entity", "TEXT"], ["inquiry_superseded_by", "TEXT"]])
    st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c} ${t}`);
  for (const m of [...members, ...admins])
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                 VALUES (?,?,?,?, 'active', ?, ?, ?)`,
      m, `cover ${m}`, m, admins.includes(m) ? "admin" : "member", JSON.stringify(["contribute", "create_projects"]), T0, T0);
  const w = { st, host, record, membership, promotion, prov, clock, runs: {}, drift: [],
              extraction: { driftFor: () => w.drift } };
  w.observation = observation(w);
  w.retrieval = retrievalOf(host, { record, membership, promotion, extraction: w.extraction, observation: w.observation,
                                    now: () => clock.now, selectionNow: () => clock.sel });
  w.retrieval.migrate();
  let k = 0;
  const snap = () => `k${++k}`;
  Object.assign(w, {
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    cap: (name, text = `bytes of ${name}`) => ({ path: `snapshots/${name}.txt`, text, sha: sha(text) }),
    /** Promotes a document (information unless `fields.object_type` says otherwise) with its extra `files` and the
     *  captures it registers. */
    doc(id, fields = {}, { files = [], captures = [], body, author = "member:ann" } = {}) {
      const text = infoMd(id, fields);
      const all = [{ path: "bundle.md", text: body !== undefined ? text.replace(/\n## Summary[\s\S]*$/, body) : text }, ...files];
      for (const c of captures) all.push({ path: c.path, text: c.text });
      if (captures.length)
        all.push({ path: "data/provenance.json", text: JSON.stringify({ documents: captures.map(provDoc) }, null, 2) });
      const head = st.sql.exec(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id)[0];
      const r = promotion.promote({ bundleId: id, base: head ? head.bundle_sha : null, snapKey: snap(), author, files: all,
        meta: { object_type: fields.object_type || "information" },
        register: captures.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!r.ok) throw new Error(`fixture promote refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r;
    },
    /** A project owned by `owner` (so hidden from everyone else), holding the captures it registers. */
    project(title, owner = "ann", { captures = [] } = {}) {
      const files = [{ path: "bundle.md", text: md({ object_type: "project", title, current_state: "forming", prior_state: null,
        created: T0, last_updated: T0, group: "test-group" }) }];
      for (const c of captures) files.push({ path: c.path, text: c.text });
      if (captures.length)
        files.push({ path: "data/provenance.json", text: JSON.stringify({ documents: captures.map(provDoc) }, null, 2) });
      const r = promotion.promote({ base: null, snapKey: snap(), author: V(owner), ownerMemberId: owner, files, meta: {},
        register: captures.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** One observation row, as observation-log's append site writes it. */
    observe(o) {
      st.sql.exec(`INSERT INTO observation_log (at, actor_class, actor, authority_kind, authority, level, subject_kind, subject,
                   state, governed, condition, bound, result_kind, result_ref, detail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        o.at || T0, o.actor_class || "plane", o.actor ?? null, o.authority_kind, o.authority ?? null, o.level,
        o.subject_kind, o.subject ?? null, o.state, o.governed ? 1 : 0, o.condition ?? null, o.bound ?? null,
        o.result_kind ?? null, o.result_ref ?? null, o.detail ?? null);
      return st.sql.exec(`SELECT MAX(seq) AS s FROM observation_log`)[0].s;
    },
    /** A reading row for a capture (its existence is the content level's pre-log evidence). */
    reading(capSha, bundleId) {
      st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, reading, at) VALUES (?,?,?,?)`, capSha, bundleId, "{}", T0);
    },
    /** One indexed unit of a capture's text, as extraction's index writes it. */
    unit(capSha, bundleId, seq, text, extent = { kind: "pdf-page", page: seq }) {
      const ex = JSON.stringify(extent);
      st.sql.exec(`INSERT INTO capture_text (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind)
                   VALUES (?,?,?,?,?,?,?,0,'layer')`, capSha, bundleId, extent.kind, ex, `p${seq}`, seq, text);
    },
  });
  return w;
}
