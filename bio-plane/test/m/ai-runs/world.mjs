/* ai-runs over the real modules it uses — record-core, membership, credentials, promotion, connections, bias, observation-log,
   retrieval and contradiction — over node:sqlite (the engine a Durable Object runs), at the Durable Object's shape:
   `sql.exec` answers a cursor, never an array, and refuses a LIKE or GLOB pattern over 50 bytes (K313, K316). Each world is its own storage, so
   `aiRunsOf` answers a fresh instance. Tests drive the module at its interface; the helpers below set the record up
   through the used modules' own acts (a member enrolled, a project owned and joined, a bias set promoted and adopted). */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
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

/* workerd's cursor: rows are read by iterating it (or its `toArray()`/`one()`); `[0]` and `.length` of it are undefined. */
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

export const SEAL = "test-seal-secret-for-ai-runs";

/** inquiry's R49 as this module reaches it (K674): a stub at the interface, answering from `migrated` by question id,
 *  null otherwise; inquiry builds the real one in this layer. */
export const inquiryStub = (migrated = {}) => ({ migratedSurfacing: (id) => migrated[id] ?? null });

export function world({ env = {}, inquiry = inquiryStub(), deployedModes = undefined, zone = null } = {}) {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...args) {
    const literal = [...q.matchAll(/\b(?:GLOB|LIKE)\s+'((?:[^']|'')*)'/gi)].map((m) => m[1].replace(/''/g, "'"));
    const bound = /\b(?:GLOB|LIKE)\s+\?|\b(?:glob|like)\s*\(/i.test(q) ? args.filter((a) => typeof a === "string") : [];
    if ([...literal, ...bound].some((p) => Buffer.byteLength(p) > WORKERD_PATTERN_CAP)) throw new Error("LIKE or GLOB pattern too complex");
    const st = db.prepare(q);
    return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []));
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
  /* credentials (K789): the founder's claim, members' passwords and the AI credentials R18 reads are its (its R1–R15). */
  const credentials = credentialsOf(ctx, { record, membership, sealSecret: SEAL }); credentials.migrate();
  const promotion = promotionOf(ctx, { record, membership });
  /* each fact by the module that registers it in the plane, answering as an empty record does */
  for (const [f, m, v] of [["producingGroup", "instance-setup", "test-group"], ["citedBy", "connections", []], ["caseMember", "publication", false]])
    promotion.registerFact(f, m, () => v);
  /* provenance's `register` (its read contract), which a promotion's steps read: empty here, as a record with no
     registered capture holds it. provenance is not among this module's uses, so the table stands alone. */
  sql.exec(`CREATE TABLE IF NOT EXISTS register (bundle_id TEXT, capture_sha TEXT, registered TEXT, authored INTEGER NOT NULL DEFAULT 0)`);
  observationLogOf(ctx, { extraction: null, provenance: null }).migrate();
  connectionsOf(ctx, { env }).migrate();
  const bias = biasOf(ctx, { env });
  /* `zone`: the group's governing time zone as retrieval answers it (its R69), from an active profile's `time_zone`. */
  if (zone) record.setSetting("jurisdiction_profiles", ["zone-profile"], "admin");
  retrievalOf(ctx, zone ? { combine: () => ({ ok: true, view: { time_zone: { value: zone } } }), localFacts: null } : undefined).migrate();
  const runs = aiRunsOf(ctx, env, { inquiry, ...(deployedModes ? { deployedModes } : {}) });
  runs.migrate();
  let k = 0;
  const w = {
    db, sql, ctx, record, membership, credentials, promotion, bias, runs,
    row: (q, ...a) => [...sql.exec(q, ...a)][0] ?? null, rows: (q, ...a) => [...sql.exec(q, ...a)],
    count: (t) => [...sql.exec(`SELECT count(*) AS n FROM ${t}`)][0].n,
    /** Every row of this module's tables and of the observation log, for "nothing was written". */
    dump: () => [...TABLES, "observation_log"].map((t) => JSON.stringify([...sql.exec(`SELECT * FROM ${t} ORDER BY rowid`)])).join("\n"),
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
    /* Members: the founder claims (viewer `admin`), a second administrator, then members enrolled to active, each
       connecting their own account by their own act (credentials R22), unless listed in `noAccount`. */
    async group(...members) {
      const opts = members.length && typeof members[members.length - 1] === "object" ? members.pop() : {};
      await credentials.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
      for (const [id, role] of [["second", "admin"], ...members.map((m) => [m, "member"])]) {
        const a = await membership.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: null, by: "admin" });
        if (!a.ok) throw new Error(`memberAdd ${id}: ${JSON.stringify(a)}`);
        await membership.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
        if (!(opts.noAccount || []).includes(id)) await w.account(id);
      }
      return w;
    },
    /** A member connects their own account (credentials R22): an API key unless `kind` says otherwise. */
    async account(id, kind = "apikey", secret = `secret-of-${id}`) {
      const r = await credentials.accountReferenceSet({ member: `member:${id}`, kind, secret, by: `member:${id}` });
      if (!r.ok) throw new Error(`account ${id}: ${JSON.stringify(r)}`);
      return r;
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
      /* bias R11 (DEC-88): the adopter's words on why this lens is adopted. */
      const a = bias.biasAdopt({ bundleId: id, scope, scopeId, author: "admin", identity: "member:admin", viewer: "admin",
                                 reason: `The group reads evidence on ENT-2026-0007 through ${id}, adopted for the ${scope} scope.` });
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

/** An open's arguments, well formed unless overridden: an organisation credential's run over `INQ`, started by ann's
 *  act and carried by her account (R52). */
export const OPEN = (over = {}) => ({ run: "R1", contextType: "inquiry", contextId: INQ, principalPlane: ORG,
  principalClaude: ANN, skillVersion: "bio@1", viewer: "admin", at: T0, ...over });

/** One model call's figures, as `agent-model` R5 states them. */
export const USAGE = (over = {}) => ({ input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 0,
  cache_creation_input_tokens: 0, total_cost_usd: 0.012, ...over });

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
