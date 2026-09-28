/* intent over the modules it uses, each the real one (record-core, membership, promotion, entities, progressions,
   inquiry, with the modules inquiry itself uses), on a real SQLite database (node:sqlite) standing in for a Durable
   Object's storage. Three are stand-ins in the shape of their Provides, which the test controls and records:
   retrieval's selections (`selectionCreate`, R18; `selectionResolve`, R19, which inquiry's dispose reads), ai-runs'
   `open` (R9–R10) and capture-requests' read (`captureRequests`, R23). Every test drives `intent` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { inquiryOf } from "../../../src/inquiry/index.mjs";
import { intentOf } from "../../../src/intent/index.mjs";
import { parseFrontmatter } from "../../../checks/bio-checks.mjs";

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
export const MACHINE = "class:ai";
export const NOW = "2026-09-28T01:00:00Z";
export const DAY = 86400000;

export function world({ now = NOW } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  /* the columns inquiry writes on record-core's `bundles` (its R40), which the store's additive list creates */
  for (const c of ["inquiry_basis_count INTEGER", "inquiry_subject_entity TEXT", "inquiry_superseded_by TEXT"])
    st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  const clock = { now };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("caseMember", "legacy-store", () => false);
  promotion.registerFact("publishedRegistry", "legacy-store", () => null);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  const extraction = extractionOf(host, { record, membership, calibration: { onCalibration() { return { ok: true }; } } });
  extraction.migrate();
  const content = contentOf(host, { record, membership, provenance: prov, extraction, now: () => clock.now });
  content.migrate();
  const entities = entitiesOf(host, { record, membership, provenance: prov, now: () => clock.now });
  entities.migrate();
  const connections = connectionsOf(host, { record, membership, promotion, content, extraction, capture: {}, entities });
  connections.migrate();
  const progressions = progressionsOf(host, { record, entities, extraction: { readingOf: () => null },
                                              provenance: { homeOf: () => null }, now: () => clock.now });
  progressions.migrate();
  const calls = { selections: [], open: [], requests: [] };
  const selections = new Map();
  const retrieval = {
    async selectionCreate(a) {
      calls.selections.push(a);
      if (!a.owner) return { ok: false, reason: "NO_OWNER" };
      const handle = `sel-${calls.selections.length}`;
      selections.set(handle, { owner: a.owner, members: [...a.ids] });
      return { ok: true, handle, kind: "enumerated", n: a.ids.length };
    },
    selectionResolve({ handle, owner }) {
      const s = selections.get(handle);
      if (!s) return { ok: false, reason: "NO_SUCH_SELECTION", check: "C-33.20" };
      if (owner !== s.owner) return { ok: false, reason: "NOT_YOURS" };
      return { ok: true, members: s.members, drift: null };
    },
  };
  const inquiry = inquiryOf(host, { record, membership, promotion, content, connections, entities, retrieval,
                                    provenance: prov, now: () => clock.now });
  inquiry.migrate();
  const aiRuns = { open: async (a) => { calls.open.push(a); return { run: a.run ?? null, started: true, status: "running" }; } };
  /* capture-requests' read (its R23): the rows the viewer may see, oldest first, bounded */
  const requests = [];
  const captureRequests = { captureRequests: (a) => { calls.requests.push(a); return { count: requests.length, limit: a.limit, truncated: false, requests: [...requests] }; } };
  const i = intentOf(host, { record, membership, promotion, entities, progressions, inquiry, retrieval, aiRuns,
                             captureRequests, now: () => clock.now });
  i.migrate();
  let n = 0;
  const w = {
    st, host, record, membership, promotion, entities, progressions, inquiry, i, clock, calls, requests,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    fm: (id) => { const t = record.readFile(id, "bundle.md")?.text; return t ? parseFrontmatter(t).data : null; },
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM ${name}`));
      return out;
    },
    member(id, { role = "member", status = "active" } = {}) {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?, ?, ?, ?, ?, '["contribute"]', 't', 't')`, id, `Cover ${id}`, `h_${id}`, role, status);
    },
    /** A project created through promotion, `owner` its joined sole owner; `objective` its text (null for none). */
    project(title, owner, { objective = "Find out what happened.", visibility = null } = {}) {
      const r = promotion.promote({ base: null, snapKey: `k${++n}`, author: V(owner), ownerMemberId: owner,
        ...(visibility ? { visibility } : {}),
        files: [{ path: "bundle.md", text: projMd(title, objective) }], meta: { object_type: "project" } });
      if (!r.ok) throw new Error(`fixture project refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r.bundleId;
    },
    /** A participant of a project, at a state (`joined`, `invited`, `leaving`). */
    join(projectId, memberId, state = "joined") {
      st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, 0, 't', 't')`, projectId, memberId, state);
    },
    entity(id, kind = "body", label = id) {
      st.sql.exec(`INSERT OR IGNORE INTO entities (entity_id, kind, label, at) VALUES (?, ?, ?, ?)`, id, kind, label, clock.now);
    },
    relate(from, to, relation) {
      const r = entities.declareRelation({ fromEntity: from, toEntity: to, relation, justification: "declared in the test",
                                           citation: "the test", declaredBy: V("alice") });
      if (!r.ok) throw new Error(`fixture relation refused: ${JSON.stringify(r)}`);
      return r.relation_id;
    },
    /** A capture resolving to an entity at a grade, in an information bundle row. */
    resolve(capSha, bundleId, entityId, grade) {
      if (!record.head(bundleId))
        st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                     VALUES (?, 'information', 'test-group', ?, 'collected', ?, ?, 'x')`, bundleId, bundleId, clock.now, clock.now);
      st.sql.exec(`INSERT OR REPLACE INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, established, at)
                   VALUES (?, ?, 'r', ?, ?, 'test', ?, ?)`, capSha, bundleId, entityId, grade,
                  grade === "A" || grade === "B" ? 1 : 0, clock.now);
    },
    /** The three-stage flow most tests use. */
    define(key = "proc") {
      const r = progressions.defineProgression({ progressionKey: key, label: "Procurement", declaredBy: V("alice"), stages: [
        { key: "need", cardinality: "1", required: "always" },
        { key: "award", after: "need", cardinality: "1", required: "always" },
        { key: "contract", after: "award", cardinality: "0..n", required: "usually" },
      ] });
      if (!r.ok) throw new Error(`fixture progression refused: ${JSON.stringify(r)}`);
      return r;
    },
    /** Thread `entityId` through `proc`, one capture per named stage at the given grades. */
    async thread(entityId, stages, key = "proc") {
      const placements = [];
      for (const [stage, grade] of Object.entries(stages)) {
        const sha = `${entityId}-${stage}`.toLowerCase();
        w.resolve(sha, `INFO-${entityId}-${stage}`, entityId, grade);
        placements.push({ stage, captureSha: sha });
      }
      const r = await progressions.threadInstance({ progressionKey: key, entityId, placements, threadedBy: V("alice") });
      if (!r.ok) throw new Error(`fixture thread refused: ${JSON.stringify(r).slice(0, 300)}`);
      return r;
    },
    /** An inquiry bundle created through promotion (the fixture's own author), for R17. */
    inquiry(id, { state = "surfaced", surfacedBy = "agent", author = MACHINE, created = clock.now } = {}) {
      const text = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}?"`,
        `current_state: ${state}`, "prior_state: null", `created: "${created}"`, `last_updated: "${created}"`,
        "references: []", "state_history: []", `surfaced_by: ${surfacedBy}`, 'disposition_reason: ""', "---", "",
        "## Question", "", `Question ${id}?`, ""].join("\n");
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author, files: [{ path: "bundle.md", text }],
                                    meta: { object_type: "inquiry" } });
      if (!r.ok) throw new Error(`fixture inquiry refused: ${JSON.stringify(r).slice(0, 300)}`);
      st.sql.exec(`UPDATE manifest SET created=? WHERE bundle_id=?`, created, id);
      return r;
    },
    /** A raw revision of `id`'s bundle.md, through promotion, as `author`. */
    revise(id, text, author, extra = {}) {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head.bundleSha, snapKey: `k${++n}`, author,
                                 files: [{ path: "bundle.md", text }], meta: {}, actorIdentity: author,
                                 actorViewer: author, ...extra });
    },
    /** A raw creation through promotion. */
    create(id, text, author, extra = {}) {
      return promotion.promote({ bundleId: id, base: null, snapKey: `k${++n}`, author, files: [{ path: "bundle.md", text }],
                                 meta: {}, ...extra });
    },
  };
  return w;
}

/** alice (an administrator), bob and carol (members); project P owned by alice, bob joined, carol invited only. */
export function seeded(opts) {
  const w = world(opts);
  w.member("alice", { role: "admin" });
  w.member("bob");
  w.member("carol");
  w.member("dave");
  const P = w.project("Contracts review", "alice");
  w.join(P, "bob");
  w.join(P, "carol", "invited");
  w.P = P;
  return w;
}

export function projMd(title, objective = "Find out what happened.") {
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
          "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
          ...(objective === null ? [] : [`objective: "${objective}"`]), "references: []", "state_history: []", "---", "",
          "## Objective", "", "Find out.", ""].join("\n");
}

/** The condition most tests set: ENT-1's `proc` instances, need and award placed, grade B or better, 50%. */
export const COND = { progression: "proc", entity: "ENT-1", required: { grade: "B", stages: ["need", "award"] },
                      satisfied: { share: 50 } };
