/* capture-requests over the modules it uses, the record's own ones real (record-core, membership, provenance,
   observation-log, host-governor, capture-sources' credentials) on a real SQLite database (node:sqlite) standing in
   for a Durable Object's storage. `capture`'s in-process arm is a stand-in the test scripts (K61: a test may pass its
   own instance), recording exactly what it was handed; ai-runs' run sight (`runFor`) is a table of runs the test
   writes. Every test drives `capture-requests` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { observationLogOf } from "../../../src/observation-log/index.mjs";
import { governorOf } from "../../../src/host-governor/index.mjs";
import { credentialsOf } from "../../../src/capture-sources/credentials.mjs";
import { captureRequestsOf } from "../../../src/capture-requests/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
export const V = (id) => `member:${id}`;
export const MACHINE = "class:member";
export const T0 = Date.parse("2026-09-28T01:00:00Z");
export const KEY = "k".repeat(43);
export const ENV = { DAEMON_TOKEN: "daemon-token-for-tests", VERSION: "9.9.9", INSTANCE_NAME: "testbed",
                     CAPTURE_CREDENTIALS_KEY: KEY };

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

/** `capture`'s in-process arm as a script: each call is recorded; the answer is the next scripted one for the address,
 *  else a filed capture of the address's bytes. */
export function fakeCapture() {
  const calls = [], script = new Map();
  let throwing = false;
  return {
    calls, script,
    throwNext() { throwing = true; },
    async acquire(body, opts) {
      calls.push({ body, opts });
      if (throwing) { throwing = false; throw new Error("boom https://x.example/?token=SECRET"); }
      const loc = opts && opts.captureRequest ? opts.captureRequest.locator : body.locator;
      const q = script.get(loc);
      const next = Array.isArray(q) ? q.shift() : q;
      if (next) return typeof next === "function" ? next(body, opts) : next;
      return { status: 200, body: { ok: true, existed: false, document: { capture: { sha256: sha(loc), grade: "B" } } } };
    },
  };
}

export const refused = (status) => ({ status: 502, body: { ok: false, reason: "SOURCE_REFUSED", status } });
export const renderRefusal = (code, state) => ({ status: 409, body: { ok: false, reason: code, detail: `${code} said so`,
                                                                     ...(state ? { render: { state } } : {}) } });

/** A world: the record's modules, the capture stand-in, a table of runs, and capture-requests over them. */
export function world({ env = ENV, configured, credentials = true } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { ms: T0 };
  const now = () => clock.ms;
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const prov = provenanceOf(host, { record, membership, now: () => new Date(clock.ms).toISOString() });
  prov.migrate();
  const ex = { onReading: () => ({ ok: true }), readingOf: () => null, unitsOf: () => ({ units: [], state: null }),
               capturesReadFor: () => [] };
  const obs = observationLogOf(host, { record, membership, provenance: prov, extraction: ex, now });
  obs.migrate();
  const governor = governorOf(host, { env, now, record });
  governor.migrate();
  const creds = credentials ? credentialsOf(host, { key: env.CAPTURE_CREDENTIALS_KEY ?? null, record, membership,
                                                     now: () => clock.ms }) : null;
  if (creds && typeof creds.migrate === "function") creds.migrate();
  const capture = fakeCapture();
  const runs = new Map();
  const runSight = { runFor: (run, viewer) => {
    const r = runs.get(run);
    if (!r || typeof viewer !== "string" || !/^(member:.+|class:\w+)$/.test(viewer)) return null;
    if (r.hiddenFrom && r.hiddenFrom.includes(viewer)) return null;
    return { run: r.run, status: r.status, principal_plane: r.principal_plane, principal_claude: r.principal_claude,
             context_type: "inquiry", context_id: r.context };
  } };
  const waitRegs = [];
  const aiRuns = { registerWaitSource: (module, source) => { waitRegs.push({ module, source }); return { ok: true }; } };
  const cr = captureRequestsOf(host, { record, observations: obs, governor, capture, credentials: creds, runs: runSight,
                                       env, now, storeName: "bio", aiRuns,
                                       ...(configured !== undefined ? { configured } : {}) });
  cr.migrate();
  const w = {
    st, host, record, membership, prov, obs, governor, creds, capture, runs, cr, clock, waitRegs,
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    req: (id) => st.sql.exec(`SELECT * FROM capture_requests WHERE request=?`, id)[0] ?? null,
    log: () => st.sql.exec(`SELECT * FROM observation_log ORDER BY seq`),
    /** A bundle in record-core's `bundles` read contract. */
    bundle(id, type = "inquiry", { md = null } = {}) {
      st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                   VALUES (?, ?, 'g', ?, 'open', 't', 't', 'sha')`, id, type, id);
      if (md !== null)
        st.sql.exec(`INSERT INTO files (bundle_id, path, content, sha256, bytes) VALUES (?, 'bundle.md', ?, ?, ?)`,
                    id, md, sha(md), Buffer.byteLength(md));
      membership.reindexProjectSight(id);
      return id;
    },
    project(id) { return w.bundle(id, "project"); },
    participant(projectId, memberId, state = "joined") {
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, ?, 0, 't', 't')`, projectId, memberId, state);
      membership.reindexProjectSight(projectId);
    },
    /** A run in ai-runs' sight, with its principals. */
    run(id, { status = "running", plane = "member:ann/tok1", claude = "instance", context = "INQ-1", hiddenFrom = [] } = {}) {
      runs.set(id, { run: id, status, principal_plane: plane, principal_claude: claude, context, hiddenFrom });
      return id;
    },
    /** A standard scene: inquiry INQ-1 and INQ-2, run R-1 held by member ann. */
    scene() {
      w.bundle("INQ-1"); w.bundle("INQ-2"); w.bundle("DOC-1", "information");
      w.run("R-1");
      return w;
    },
    ask(over = {}, stamps = {}) {
      return cr.captureRequest({ run: "R-1", address: "https://example.org/a", target: "INQ-1", purpose: "investigate",
                                 ...over }, { viewer: V("ann"), caller: "member:ann/tok1", ...stamps });
    },
    tick(ms = 60_000) { clock.ms += ms; },
  };
  return w;
}
