/* ai-runs over the real modules it uses — record-core, membership, promotion, connections, bias, observation-log,
   retrieval and contradiction — over node:sqlite (the engine a Durable Object runs). Each world is its own storage, so
   `aiRunsOf` answers a fresh instance. Tests drive the module at its interface; the helpers below set the record up
   through the used modules' own acts (a member enrolled, a project owned and joined, a bias set promoted and adopted). */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { biasOf, BIAS_SCHEMA } from "../../../src/bias/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";
import { connectionsOf } from "../../../src/connections/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { aiRunsOf, aiRunsOps } from "../../../src/ai-runs/index.mjs";

export const sha = (s) => createHash("sha256").update(Buffer.from(String(s), "utf8")).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const run = (sql, text) => {
  const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const st of bare.split(";")) if (st.trim()) sql.exec(st);
};
export const T0 = "2026-07-01T00:00:00Z";
export const INQ = "INQ-2026-0001";
export const PROJ = "PROJ-2026-0001";
/** The principals the control plane stamps: a member's session, and an organisation `ai` credential. */
export const ANN = "member:ann", BOB = "member:bob", ORG = "class:ai/tok-org";
export const TABLES = ["ai_runs", "ai_run_bounds", "inquiry_run_surfacings"];

/** A bias statement and set, in the catalogue's grammar (bias's own test world's shape). */
const S = (id) => ({ id, kind: "scrutiny", subject: "ENT-2026-0007",
  text: `Statement ${id}: claims from this office need a second, independent record before they bear load.`,
  justification: `Why ${id} is held: the office is a party to matters this group examines.`, citations: [], locked: false });
const scalar = (v) => v === null ? "null" : typeof v === "string" ? JSON.stringify(v)
  : typeof v === "boolean" || typeof v === "number" ? String(v) : JSON.stringify(v);
function yaml(fm) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v) && v.length && v[0] && typeof v[0] === "object") {
      lines.push(`${k}:`);
      for (const row of v) {
        const keys = Object.entries(row);
        lines.push(`  - ${keys[0][0]}: ${scalar(keys[0][1])}`);
        for (const [rk, rv] of keys.slice(1)) lines.push(`    ${rk}: ${Array.isArray(rv) ? JSON.stringify(rv) : scalar(rv)}`);
      }
    } else lines.push(`${k}: ${scalar(v)}`);
  }
  lines.push("---");
  return lines.join("\n");
}
const biasMd = (fm) => [yaml(fm), "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "It does NOT check whether a second source was independent.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
/** An inquiry's bundle.md, as an assistant would create one. */
export const inquiryMd = (id) => `---\nid: ${id}\nobject_type: inquiry\ntitle: Q\ncurrent_state: open\nsurfaced_by: agent\n`
  + `created: ${T0}\nlast_updated: ${T0}\ngroup: test-group\n---\n\n## Question\n\nWhy did the fee rise?\n`;

export function world({ env = {} } = {}) {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...args) {
    const st = db.prepare(q);
    return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
  } };
  let n = 0;
  const storage = { sql, transactionSync(fn) {
    const sp = `sp${n++}`;
    db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
    catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
  } };
  run(sql, RECORD_SCHEMA);
  run(sql, BIAS_SCHEMA);
  const ctx = { storage };
  const record = recordOf(ctx); record.migrate();
  const membership = membershipOf(ctx, { record }); membership.migrate();
  const promotion = promotionOf(ctx, { record, membership });
  for (const f of ["producingGroup", "citedBy", "caseMember"]) promotion.registerFact(f, "legacy-store", () => (f === "citedBy" ? [] : f === "producingGroup" ? "test-group" : false));
  /* provenance's `register` (its read contract), which a promotion's steps read: empty here, as a record with no
     registered capture holds it. provenance is not among this module's uses, so the table stands alone. */
  sql.exec(`CREATE TABLE IF NOT EXISTS register (bundle_id TEXT, capture_sha TEXT, registered TEXT, authored INTEGER NOT NULL DEFAULT 0)`);
  observationLogOf(ctx, { extraction: null, provenance: null }).migrate();
  connectionsOf(ctx, { env }).migrate();
  const bias = biasOf(ctx, { env });
  retrievalOf(ctx).migrate();
  const runs = aiRunsOf(ctx, env);
  runs.migrate();
  let k = 0;
  const w = {
    db, sql, ctx, record, membership, promotion, bias, runs,
    row: (q, ...a) => sql.exec(q, ...a)[0] ?? null, rows: (q, ...a) => sql.exec(q, ...a),
    count: (t) => sql.exec(`SELECT count(*) AS n FROM ${t}`)[0].n,
    /** Every row of this module's tables and of the observation log, for "nothing was written". */
    dump: () => [...TABLES, "observation_log"].map((t) => JSON.stringify(sql.exec(`SELECT * FROM ${t} ORDER BY rowid`))).join("\n"),
    /** A bundle of a type, committed through record-core (a context for a run). */
    bundle(id, type = "inquiry", text = null) {
      const t = text ?? `---\nid: ${id}\n---\n`;
      record.transact(() => record.commit({ bundleId: id, type, title: id, project: null, snapKey: `c${k++}`, kind: "promotion",
        base: sha(""), author: "x", writer: null, operation: null, files: [{ path: "bundle.md", text: t, sha256: sha(t), bytes: t.length }],
        state: type === "project" ? "forming" : "open", priorState: null, group: "test-group", created: T0, lastUpdated: T0,
        criticality: null, at: T0 }));
      if (type === "project") membership.reindexProjectSight(id);
      return id;
    },
    /* Members: the founder claims (viewer `admin`), a second administrator, then members enrolled to active. */
    async group(...members) {
      await membership.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
      for (const [id, role] of [["second", "admin"], ...members.map((m) => [m, "member"])]) {
        const a = await membership.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: null, by: "admin" });
        if (!a.ok) throw new Error(`memberAdd ${id}: ${JSON.stringify(a)}`);
        await membership.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
      }
      return w;
    },
    /** A project owned by `owner`, with `joined` members joined and `invited` ones only invited. */
    project(id, owner, { joined = [], invited = [], discoverable = false } = {}) {
      w.bundle(id, "project");
      membership.projectClaimOwner({ projectId: id, memberId: owner });
      for (const m of [...joined, ...invited]) membership.projectInvite({ projectId: id, handle: m, by: owner });
      for (const m of joined) membership.projectJoin({ projectId: id, by: m });
      if (discoverable) membership.projectVisibilitySet({ projectId: id, setting: "discoverable", by: owner, reason: "open" });
      membership.reindexProjectSight(id);
      return id;
    },
    /** A `cites` edge from `from` to `to` (connections' projection of `references[]`). */
    cites(from, to) { sql.exec(`INSERT OR REPLACE INTO refs (bundle_id, target_id, kind) VALUES (?, ?, 'cites')`, from, to); },
    /** A bias set promoted to `adopted` and adopted for `scope` by the founder, putting a lens in force. */
    lens(id, { scope = "instance", scopeId = "", statement = "s1" } = {}) {
      let prior = null, r;
      for (const st of ["draft", "proposed", "adopted"]) {
        const head = record.head(id);
        const fm = { id, object_type: "bias", title: `Lens ${id}`, current_state: st, prior_state: prior, created: T0,
                     last_updated: T0, group: "test-group", statements: [S(statement)] };
        r = promotion.promote({ bundleId: id, base: head ? head.bundleSha : null, snapKey: `b${k++}`, author: "member:ann",
                                files: [{ path: "bundle.md", text: biasMd(fm) }], meta: {} });
        if (!r.ok) throw new Error(`bias ${id} ${st}: ${JSON.stringify(r)}`);
        prior = st;
      }
      const a = bias.biasAdopt({ bundleId: id, scope, scopeId, author: "admin", identity: "member:admin", viewer: "admin" });
      if (!a.ok) throw new Error(`adopt ${id}: ${JSON.stringify(a)}`);
      return a;
    },
    /** record-core's purge over this world. Modules this one reaches (contradiction, and through it content, extraction
     *  and provenance) declare tables this world never creates; each is stood in as an empty table on first mention, so
     *  the purge runs over every declaration as it would in the store. */
    purge(args = {}) {
      for (let i = 0; i < 200; i++) {
        try { return record.purge(args); } catch (e) {
          const t = /no such table: (\w+)/.exec(String(e && e.message));
          const c = /no such column: (\w+)/.exec(String(e && e.message));
          if (t) sql.exec(`CREATE TABLE ${t[1]} (bundle_id TEXT)`);
          else if (c) { const holder = /FROM (\w+)/.exec(String(e.message)); throw new Error(`purge: ${e.message} ${holder || ""}`); }
          else throw e;
        }
      }
      throw new Error("purge: too many absent tables");
    },
    /** A creation of an inquiry by an assistant, through promotion (R25–R26 are asked there). */
    surface(id, { run: r = "R1", caller = ORG, viewer = "admin" } = {}) {
      return promotion.promote({ bundleId: id, base: null, files: [{ path: "bundle.md", text: inquiryMd(id) }], meta: {},
        snapKey: `s${k++}`, author: caller, assistantPrincipal: caller, run: r, actorViewer: viewer });
    },
    /** The control plane's dispatch of one op, with its stamps in the query. */
    op(name, query = {}, body = null) {
      const url = new URL(`http://do/${name}?${new URLSearchParams(query)}`);
      return aiRunsOps(runs, url, body)[name]();
    },
  };
  return w;
}

/** An open's arguments, well formed unless overridden: an organisation credential's run over `INQ`. */
export const OPEN = (over = {}) => ({ run: "R1", contextType: "inquiry", contextId: INQ, principalPlane: ORG,
  principalClaude: "instance", skillVersion: "bio@1", viewer: "admin", at: T0, ...over });

/** An `agent-worker` binding that counts its calls and answers as told. */
export function agentWorker(answer = { status: 200, body: { ok: true } }) {
  const calls = [];
  return { calls, fetch: async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    if (answer === "hang") return new Promise(() => {});
    if (answer === "throw") throw new Error("network down");
    return new Response(JSON.stringify(answer.body), { status: answer.status });
  } };
}
