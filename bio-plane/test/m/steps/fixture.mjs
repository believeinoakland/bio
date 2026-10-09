/* steps over the modules it uses, each the real one (record-core, membership, promotion, observation-log), on a real
   SQLite database (node:sqlite) standing in for a Durable Object's storage, at the plane's shape (`sql.exec` answers a
   cursor). `leg-earning` is the real one too (its R13 and R14, merged K2485), over the real `connections`, with the
   modules it is made over; a project draws on a question when its document holds a `cites` reference to it
   (`connections`' `refs`, written here as its projection writes them). Every test drives `steps` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { legEarningOf } from "../../../src/leg-earning/index.mjs";
import { stepsOf, STEPS_TABLES, FOLLOWS_TABLE } from "../../../src/steps/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
  };
  return c;
}
function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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

export const ANN = "member:ann", BOB = "member:bob", CAT = "member:cat", DAN = "member:dan", OUT = "member:out", BOSS = "member:boss";
export const AI = "class:ai/tok1";
export const NOW = "2026-10-09T18:00:00.000Z";
/* P1: Ann owns, Bob joined; P2: Bob owns; PH: hidden, Cat owns; PD: discoverable, Dan owns. */
export const P1 = "PROJ-2026-0001", P2 = "PROJ-2026-0002", PH = "PROJ-2026-0003", PD = "PROJ-2026-0004";
/* Q: a question outside every project; QP1: inside P1; QH: inside PH. */
export const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r", QP1 = "INQ-2026-0003-p", QH = "INQ-2026-0004-h";

/** The world. `opts.zone` false holds no time zone; `opts.legEarning` replaces the stand-in (null: none at all). */
export function world(opts = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => NOW });
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  promotion.registerFact("citedBy", "connections", () => []);
  promotion.registerFact("caseMember", "publication", () => false);
  const observationLog = observationLogOf(host, { record, membership, provenance: null, extraction: null, now: () => Date.parse(clockNow()) });
  observationLog.migrate();
  const prov = provenanceOf(host, { record, membership, promotion, now: () => NOW });
  prov.migrate();
  const extraction = extractionOf(host, { record, membership, calibration: { onCalibration() { return { ok: true }; } } });
  extraction.migrate();
  const content = contentOf(host, { record, membership, provenance: prov, extraction, now: () => NOW });
  content.migrate();
  const entities = entitiesOf(host, { record, membership, provenance: prov, now: () => NOW });
  entities.migrate();
  const connections = connectionsOf(host, { record, membership, promotion, content, extraction, capture: {}, entities });
  connections.migrate();
  const legEarning = opts.legEarning !== undefined ? opts.legEarning
    : legEarningOf(host, { record, membership, promotion, content, connections, entities, provenance: prov, now: () => NOW });
  let tick = 0;
  function clockNow() { return w ? w.clock : NOW; }
  const w = {
    st, host, record, membership, promotion, observationLog, legEarning, clock: NOW,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    tick() { tick++; },
  };
  const now = () => { const t = Date.parse(w.clock) + 1000 * tick++; return new Date(t).toISOString(); };
  const view = opts.zone === false ? () => null : () => ({ time_zone: { value: "America/Los_Angeles" } });
  w.s = stepsOf(host, { record, membership, promotion, observationLog, legEarning, view, now });
  for (const [m, role] of [["ann", "member"], ["bob", "member"], ["cat", "member"], ["dan", "member"], ["out", "member"], ["boss", "admin"]])
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated) VALUES (?, 'c', ?, ?, 'active', '2026-01-01', '2026-01-01')`, m, `${m}-h`, role);
  w.bundle = (id, { type = "inquiry", project = "", title = `t ${id}` } = {}) => {
    st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                 VALUES (?, ?, 'g', ?, 'open', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, title, project ?? "");
    return id;
  };
  w.participant = (project, member, { owner = false, state = "joined" } = {}) =>
    st.sql.exec(`INSERT OR REPLACE INTO project_participants (project_id, member_id, state, owner, created, updated, joined_at)
                 VALUES (?, ?, ?, ?, '2026-01-01', '2026-01-01', '2026-01-01')`, project, member, state, owner ? 1 : 0);
  w.project = (id, setting, owner, title) => {
    w.bundle(id, { type: "project", title });
    st.sql.exec(`INSERT OR REPLACE INTO project_sight (project_id, setting) VALUES (?, ?)`, id, setting);
    w.participant(id, owner, { owner: true });
  };
  w.project(P1, "discoverable", "ann", "Project One");
  w.participant(P1, "bob");
  w.project(P2, "discoverable", "bob", "Project Two");
  w.project(PH, "hidden", "cat", "Hidden Project");
  w.project(PD, "discoverable", "dan", "Project Dee");
  w.bundle(Q); w.bundle(Q2); w.bundle(QP1, { project: P1 }); w.bundle(QH, { project: PH });
  /** Projects drawing on a question: each project's document cites it (connections' `refs`, R19's projection). */
  w.draw = (q, ...ps) => { for (const p of ps) st.sql.exec(`INSERT OR IGNORE INTO refs (bundle_id, target_id, kind) VALUES (?, ?, 'cites')`, p, q); };
  /* a machine holding run R1 for Ann */
  w.runs = () => w.s.registerRunHolder("ai-runs", (by, run) => (by === AI && run === "RUN-1" ? { enabled_by: "ann-h's assistant", principal: ANN } : null));
  /** A step, created by `by` (Ann by default), its id; throws when refused. */
  w.step = (args = {}) => {
    const r = w.s.stepCreate({ place: { questions: [Q] }, work: "Ask the clerk for the 2025 contract file", by: ANN, ...args });
    if (!r.ok) throw new Error(`fixture stepCreate refused: ${JSON.stringify(r)}`);
    return r.step;
  };
  w.promote = (id, legs) => promotion.promote({ bundleId: id, base: null, snapKey: `k-${id}`, author: ANN,
    files: [{ path: "bundle.md", text: inquiryMd(id, legs) }], meta: { object_type: "inquiry" } });
  /** A capture filed in a bundle (provenance's `register`, R48), and a passage of it (content's `content`, R45), as
   *  their owners write them. */
  w.capture = (sha, bundle) => st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                                            VALUES (?, ?, 'd.pdf', 'binary', 1, ?)`, sha, bundle, NOW);
  w.passage = (id, sha, bundle) => st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at)
                                                VALUES (?, ?, ?, 'document', '{}', 'whole', 'plane', ?)`, id, sha, bundle, NOW);
  w.tables = () => [...STEPS_TABLES.map((t) => t.name), FOLLOWS_TABLE];
  /** Every row of every steps table, for "nothing was written". */
  w.snapshot = () => JSON.stringify(w.tables().map((t) => w.rows(`SELECT * FROM ${t}`)));
  return w;
}

/** An inquiry document whose basis is `legs`. */
export function inquiryMd(id, legs = []) {
  const scalar = (v) => (typeof v === "string" ? JSON.stringify(v) : String(v));
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Is ${id} answered?"`,
    "current_state: open", "prior_state: null", `created: "2026-10-03T00:00:00Z"`,
    `last_updated: "2026-10-03T00:00:00Z"`, "group: test-group", "references: []", "state_history: []",
    "surfaced_by: human", 'disposition_reason: ""',
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => {
      const { target, ...rest } = l;
      return [`  - target: ${target}`, ...Object.entries({ role: "supports", ...rest }).map(([k, v]) => `    ${k}: ${scalar(v)}`)];
    })] : []),
    "---", "", "## Question", "", `Is ${id} answered?`, "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
}
