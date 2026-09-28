/* actions over the modules it uses, each the real one where it writes or reads the record (record-core, membership,
   promotion, provenance), on a real SQLite database (node:sqlite) standing in for a Durable Object's storage. What
   actions registers with retrieval, the capture content presents for a document (R11), connections' `refs` projection
   (R25's `responses`) and conformance's determinations (R8) are stand-ins the test controls. Every test drives
   `actions` at its interface. */
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
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
  for (const c of ["action_clock_next TEXT", "fm_json TEXT"]) st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c}`);
  /* connections' `refs` projection, as far as R25 joins it. */
  st.db.exec(`CREATE TABLE refs (bundle_id TEXT, target_id TEXT, kind TEXT)`);
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
