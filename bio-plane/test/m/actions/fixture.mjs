/* actions over the modules it uses, each the real one where it writes or reads the record (record-core, membership,
   promotion, provenance), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage. What
   actions registers with retrieval, the capture content presents for a document (R11), connections' `refs` projection
   (R25's `responses`) are stand-ins the test controls; conformance is the real module (it brings reevaluation and
   inquiry, whose columns on `bundles` are added here), or a stand-in in its R9 shape where a test passes one (R8). Every test drives
   `actions` at its interface. */
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { inquiryOf } from "../../../src/inquiry/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";
import { DatabaseSync } from "node:sqlite";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
/** A Durable Object's storage over an in-memory SQLite database. */
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

export const sha = (s) => createHash("sha256").update(typeof s === "string" ? Buffer.from(s, "utf8") : s).digest("hex");
export const V = (id) => `member:${id}`;
export const ALICE = "alice";
export const MACHINE = "class:daemon";
export const NOW_MS = Date.parse("2026-09-28T12:00:00Z");

/** An action's bundle.md; `fm` lines are joined into its front matter. */
export function actionMd(id, lines = [], { state = "planned" } = {}) {
  return ["---", `id: ${id}`, "object_type: action", `title: ${id}`, `current_state: ${state}`,
          'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', ...lines, "---", "", "An action.", ""]
    .join("\n");
}
export const CP = ["counterparty:", "  state: named", "  role: Town Clerk", "  body: Town of Port Ellery"];

export function world({ profiles = ["test-port-ellery"], retrieval = true, conformance = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  /* retrieval's projection columns this module reads for R31 (retrieval writes them from R12's facts). */
  for (const c of ["action_clock_next TEXT", "fm_json TEXT", "inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT",
                   "inquiry_superseded_by TEXT"]) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  /* connections' `refs` projection, as far as R25 joins it. */
  if (conformance) st.db.exec(`CREATE TABLE refs (bundle_id TEXT, target_id TEXT, kind TEXT)`);
  const clock = { ms: NOW_MS };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", profiles, V("admin"));
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => new Date(clock.ms).toISOString() });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  const prov = provenanceOf(host, { record, membership, promotion, now: () => new Date(clock.ms).toISOString() });
  prov.migrate();
  const captures = new Map();
  const reg = { facts: [], decorations: [] };
  const retrievalStub = retrieval ? {
    registerActionFacts: (m, fn) => { reg.facts.push({ m, fn }); return { ok: true }; },
    registerProjectionDecoration: (m, fn) => { reg.decorations.push({ m, fn }); return { ok: true }; },
  } : null;
  /* retrieval's projection as far as R31 reads it: the clock column, written after each promotion from R12's facts. */
  promotion.registerStep("retrieval", { project: (c) => {
    const md = (c.files || []).find((f) => f.path === "bundle.md");
    const f = reg.facts[0] ? reg.facts[0].fn(md && md.text, clock.ms) : null;
    st.sql.exec(`UPDATE bundles SET action_clock_next=? WHERE bundle_id=?`, f ? f.clock_next : null, c.bundleId);
    return null;
  } });
  const a = actionsOf(host, { record, membership, promotion, retrieval: retrievalStub, conformance,
                              content: { captureFor: (id) => captures.get(id) ?? null }, now: () => clock.ms });
  /* the real conformance (the default dep) brings inquiry onto this host through reevaluation: its tables, as the
     store's boot migrates them. */
  if (!conformance) {
    /* extraction's tables as far as content, entities and connections join them; what a reading holds is empty. */
    for (const q of [
      `CREATE TABLE readings (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL, content_type TEXT, reading TEXT, at TEXT, capture_format TEXT)`,
      `CREATE TABLE reading_refs (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL, ref_kind TEXT, ref_key TEXT,
         label TEXT, pos_kind TEXT, pos TEXT, pos_ref TEXT, occurrence TEXT NOT NULL DEFAULT '', seq INTEGER NOT NULL DEFAULT 0,
         PRIMARY KEY (capture_sha, ref, occurrence))`,
      `CREATE TABLE reading_ref_terms (capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, ref TEXT NOT NULL, src TEXT NOT NULL,
         term TEXT NOT NULL, PRIMARY KEY (capture_sha, ref, src, term))`,
      `CREATE TABLE reading_text_source (capture_sha TEXT PRIMARY KEY, bundle_id TEXT NOT NULL, transcribed INTEGER NOT NULL DEFAULT 0,
         terminal_step TEXT, engines TEXT, derivation_cap TEXT, steps INTEGER NOT NULL DEFAULT 0, chain TEXT, calibrations TEXT)`]) st.db.exec(q);
    const extraction = { readingOf: () => null, unitsOf: () => ({ units: [], state: null }), capturesReadFor: () => [],
                         onReading: () => ({ ok: true }) };
    const content = contentOf(host, { record, membership, provenance: prov, extraction });
    content.migrate();
    const connections = connectionsOf(host, { record, membership, promotion, content, extraction, capture: {} });
    connections.entities.migrate();
    connections.migrate();
    inquiryOf(host, { record, membership, promotion, content, connections, entities: connections.entities, provenance: prov }).migrate();
  }
  let n = 0;
  const w = {
    st, host, record, membership, promotion, prov, a, clock, reg, captures,
    rows: (q, ...x) => st.sql.exec(q, ...x),
    row: (q, ...x) => st.sql.exec(q, ...x)[0] ?? null,
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    fm: (id) => { const t = w.text(id); return t ? parseFrontmatter(t).data : null; },
    /** A promotion of `id` with `text` as its bundle.md, by `author` (default a member). */
    promote(id, text, { author = V(ALICE), extra = {}, files = [], register = [] } = {}) {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`, author,
        files: [{ path: "bundle.md", text }, ...files], meta: { object_type: text.includes("object_type: action") ? "action" : "information" },
        register, ...extra });
    },
    /** An action created by a member; throws when refused. */
    action(id, lines = [], opts = {}) {
      const r = w.promote(id, actionMd(id, [...CP, "action_kind: records_request", ...lines], opts), opts);
      if (!r.ok) throw new Error(`fixture action refused: ${JSON.stringify(r).slice(0, 500)}`);
      return r;
    },
    /** An information bundle registering one capture of its own; answers the capture's sha. */
    doc(id, words = `the text of ${id}`) {
      const s = sha(words);
      const text = ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected",
                    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A document.", ""].join("\n");
      const r = w.promote(id, text, { files: [{ path: `snapshots/${id}.txt`, text: words }],
        register: [{ sha256: s, path: `snapshots/${id}.txt`, encoding: "utf8", bytes: Buffer.byteLength(words) }] });
      if (!r.ok) throw new Error(`fixture doc refused: ${JSON.stringify(r).slice(0, 400)}`);
      captures.set(id, s);
      return s;
    },
    decorate: (id, nowMs = clock.ms) => reg.decorations[0].fn({ bundle_id: id, object_type: "action" }, { nowMs }),
  };
  return w;
}
