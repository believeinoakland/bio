/* action-clocks over the modules it uses, each the real one where it writes or reads the record (record-core,
   membership, promotion, actions), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage,
   answering as workerd's does (a cursor, and its LIKE/GLOB cap; K313, K316). Copied from `actions`' fixture for the
   split (K624 (1)), the share the moved tests need: retrieval's projection table is made by retrieval's own `migrate()`
   (its R61, K354) and its clock column written after each promotion from `actions`' registered facts (its R12), as
   retrieval's step would; conformance is a stand-in answering `determinationRead` (its R9 shape) from `w.determinations`
   (id → {project, sees: [viewers]}), and content a stand-in presenting no capture; local-facts is the real one (R10, R11). Every test drives `action-clocks` at its interface. */
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { actionClocksOf } from "../../../src/action-clocks/index.mjs";
import { localFactsOf } from "../../../src/local-facts/index.mjs";
import { Retrieval, PROJECTION_TABLE } from "../../../src/retrieval/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/frontmatter.mjs";
import { DatabaseSync } from "node:sqlite";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
/* workerd's `sql.exec` answers a cursor, never an array, and refuses a LIKE or GLOB pattern over 50 bytes (K313). */
export const WORKERD_PATTERN_CAP = 50;
function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
    one() {
      const rest = c.toArray();
      if (rest.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${rest.length}`);
      return rest[0];
    },
  };
  return c;
}
/** A Durable Object's storage over an in-memory SQLite database. */
export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
      const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
      if ([...literal, ...bound].some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP))
        throw new Error("LIKE or GLOB pattern too complex");
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
/** One clock entry's lines. */
export const CLK = (d, st = "pending", text = "t") => [`  - text: "${text}"`, '    description: "d"', `    date: ${d}`,
  "    basis: Act s.2", `    status: ${st}`];

export function world({ profiles = ["test-port-ellery"] } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  /* provenance's `register`, as far as actions' check joins it (no capture is registered here). */
  st.db.exec(`CREATE TABLE register (capture_sha TEXT PRIMARY KEY, bundle_id TEXT)`);
  /* connections' `refs` projection, as far as actions' read (its R25) joins it. */
  st.db.exec(`CREATE TABLE refs (bundle_id TEXT, target_id TEXT, kind TEXT)`);
  const clock = { ms: NOW_MS };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  if (profiles) record.setSetting("jurisdiction_profiles", profiles, V("admin"));
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = promotionOf(host, { record, membership, now: () => new Date(clock.ms).toISOString() });
  new Retrieval({ storage: st, record, membership, promotion, extraction: {}, observation: {} }).migrate();
  /* the group fact, registered as its owner instance-setup does (its R1; promotion R40). */
  promotion.registerFact("producingGroup", "instance-setup", () => "test-group");
  const reg = { facts: [] };
  const retrievalStub = {
    registerActionFacts: (m, fn) => { reg.facts.push({ m, fn }); return { ok: true }; },
    registerProjectionDecoration: () => ({ ok: true }),
  };
  /* retrieval's projection as far as R1 reads it: the clock column of its row, from actions' R12 facts. */
  promotion.registerStep("retrieval", { project: (c) => {
    const md = (c.files || []).find((f) => f.path === "bundle.md");
    const f = reg.facts[0] ? reg.facts[0].fn(md && md.text, clock.ms) : null;
    st.sql.exec(`INSERT INTO ${PROJECTION_TABLE} (bundle_id, action_clock_next) VALUES (?, ?)
      ON CONFLICT(bundle_id) DO UPDATE SET action_clock_next=excluded.action_clock_next`, c.bundleId, f ? f.clock_next : null);
    return null;
  } });
  const actions = actionsOf(host, { record, membership, promotion, retrieval: retrievalStub, conformance: {},
                                    content: { captureFor: () => null }, now: () => clock.ms });
  const determinations = new Map();
  const conformance = { determinationRead: ({ id, viewer }) => {
    const d = determinations.get(id);
    return d && d.sees.includes(viewer) ? { ok: true, id, project: d.project } : { ok: false, reason: "NO_SUCH_DETERMINATION" };
  } };
  /* local-facts, the real one (R10, R11): a member's confirmations are recorded through its `factConfirm`. */
  const localFacts = localFactsOf(host, { record, membership, now: () => new Date(clock.ms).toISOString() });
  const c = actionClocksOf(host, { record, membership, actions, conformance, localFacts, now: () => clock.ms });
  let n = 0;
  const w = {
    st, host, record, membership, promotion, actions, localFacts, c, clock, determinations,
    rows: (q, ...x) => st.sql.exec(q, ...x).toArray(),
    text: (id) => record.readFile(id, "bundle.md")?.text ?? null,
    fm: (id) => { const t = w.text(id); return t ? parseFrontmatter(t).data : null; },
    /** A promotion of `id` with `text` as its bundle.md, by `author` (default a member). */
    promote(id, text, { author = V(ALICE), extra = {}, project = null } = {}) {
      const head = record.head(id);
      return promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `k${++n}`, author,
        files: [{ path: "bundle.md", text }], meta: { object_type: text.includes("object_type: action") ? "action" : "information",
                                                       ...(project ? { project } : {}) },
        ...(project ? { project } : {}), ...extra });
    },
    /** An action created by a member; throws when refused. */
    action(id, lines = [], opts = {}) {
      const r = w.promote(id, actionMd(id, [...CP, "action_kind: records_request", ...lines], opts), opts);
      if (!r.ok) throw new Error(`fixture action refused: ${JSON.stringify(r).slice(0, 500)}`);
      return r;
    },
    doc(id) {
      const text = ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected",
                    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A document.", ""].join("\n");
      const r = w.promote(id, text);
      if (!r.ok) throw new Error(`fixture doc refused: ${JSON.stringify(r).slice(0, 400)}`);
      return r;
    },
  };
  return w;
}
