/* observation-log over the modules it uses, each the real one (record-core, membership, promotion, provenance, content's
   table), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage. Extraction's reading notice
   (its R24) is a provider the test controls, as `observationLogOf`'s `deps.extraction` takes it: `w.ex.fire(e)` runs
   every registered listener, as extraction does after a write. Every test drives `observation-log` at its interface;
   the setup writes bundles, participants and content rows through their owners' read contracts. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
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

/** Extraction's reading notice, as its R24 states it: `onReading(module, fn)` once per module; `fire` runs them. */
export function extractionNotice() {
  const listeners = [];
  return {
    listeners,
    onReading(module, fn) {
      if (listeners.some((l) => l.module === module)) return { ok: false, reason: "LISTENER_DECLARED" };
      listeners.push({ module, fn }); return { ok: true };
    },
    fire(e) { return listeners.map((l) => ({ module: l.module, answer: l.fn(e) })); },
    readingOf: () => null, unitsOf: () => ({ units: [], state: null }), capturesReadFor: () => [],
  };
}

export function world({ now = "2026-09-27T03:00:00Z" } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => clock.now });
  promotion.registerFact("producingGroup", "legacy-store", () => "test-group");
  promotion.registerFact("citedBy", "legacy-store", () => []);
  promotion.registerFact("caseMember", "legacy-store", () => false);
  const prov = provenanceOf(host, { record, membership, promotion, now: () => clock.now });
  prov.migrate();
  const ex = extractionNotice();
  const content = contentOf(host, { record, membership, provenance: prov, extraction: ex, now: () => clock.now });
  content.migrate();
  const obs = observationLogOf(host, { record, membership, provenance: prov, extraction: ex, now: () => Date.parse(clock.now) });
  obs.migrate();
  let k = 0;
  const w = {
    st, host, record, membership, promotion, prov, content, obs, clock, ex,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    log: () => st.sql.exec(`SELECT * FROM observation_log ORDER BY seq`),
    /** An information bundle holding one capture per text, registered through a promotion (provenance's register). */
    doc(id, texts = []) {
      const caps = texts.map((t, i) => ({ path: `snapshots/c${i}.txt`, text: t, sha: sha(t) }));
      const files = [{ path: "bundle.md", text: infoMd(id) }];
      for (const c of caps) files.push({ path: c.path, text: c.text });
      files.push({ path: "data/provenance.json", text: JSON.stringify({ documents: caps.map((c) => provDoc(c)) }, null, 2) });
      const r = promotion.promote({ bundleId: id, base: null, snapKey: `k${k++}`, author: "member:alice", files,
        meta: { object_type: "information" },
        register: caps.map((c) => ({ sha256: c.sha, path: c.path, encoding: "utf8", bytes: Buffer.byteLength(c.text) })) });
      if (!r.ok) throw new Error(`fixture promote refused: ${JSON.stringify(r).slice(0, 400)}`);
      return caps.map((c) => c.sha);
    },
    /** A project (record-core's bundles read contract), its sight indexed by membership. */
    project(id) {
      st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                   VALUES (?, 'project', 'g', ?, 'forming', 't', 't', 'sha')`, id, id);
      membership.reindexProjectSight(id);
      return id;
    },
    /** A participant of a project, in a state (membership's roster). */
    participant(projectId, memberId, state = "joined") {
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, 0, 't', 't')`, projectId, memberId, state);
      membership.reindexProjectSight(projectId);
    },
    /** A content row over a capture filed in a bundle (content's R45 read contract). */
    contentRow(id, captureSha, bundleId) {
      st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at)
                   VALUES (?, ?, ?, 'document', '{"kind":"document"}', 'the whole document', 'plane', 't')`, id, captureSha, bundleId);
      return id;
    },
    /** A project holding one captured document: the capture is registered to the project bundle itself. */
    projectDoc(projectId, text) {
      w.project(projectId);
      const s = sha(text);
      st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'x', 'utf8', 1, 't')`,
                  s, projectId);
      return s;
    },
  };
  return w;
}

export const entry = (over = {}) => ({
  actor_class: "plane", actor: null, authority_kind: "acquire", authority: "INFO-2026-0001", level: "document",
  subject_kind: "address", subject: "https://example.org/a", state: "LOOKED_ABSENT", governed: false, condition: null,
  bound: null, result_kind: null, result_ref: null, detail: null, ...over,
});

export function infoMd(id) {
  return ["---", `id: ${id}`, "object_type: information", "schema: information@1", `title: "Document ${id}"`,
          "current_state: collected", "prior_state: null", `created: "2026-09-27T00:00:00Z"`,
          `last_updated: "2026-09-27T00:00:00Z"`, "references: []", "state_history: []", "criticality: supporting",
          "---", "", "## Summary", "", "A document.", ""].join("\n");
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
