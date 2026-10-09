/* question-explorer over the modules it uses: the real record-core, membership and credentials on a real SQLite
   database (node:sqlite) standing in for a Durable Object's storage, and stand-ins the test controls for the rest, each
   written to its requirements' Provides as `questionExplorerOf`'s deps take them (K61, K120): `steps` (R1 `stepCreate`,
   R5 `stepEnd`, R6 `stepDelete`, R9 `recordProduct`, R17 `findRecipients`), `ai-use` (R6 `exploreAllowed`, R9
   `exploreAsk`, R10 `estimate`), `ai-runs` (R9 `open` with T41's `step` and `origin`, R13 `close` answering R76's
   actual cost, R29 `boundOf`/`consumeBound`, R75's test bar and group results), `run-rules` R19's deploy gate,
   `capture-requests` (its door, R49's refusal, R55's `step`), `connections` (R4 `read`, R54 `asserted`), `retrieval`
   (R23 `contentAxis`, R69 `zone`), `inquiry` (R43 `subjectEntityOf`), `leg-earning` (R4 `basisFor`, R13
   `projectsDrawingOnPaged`) and `basis-versions` (`currentOf`). Every stand-in records the calls made to it. Bundles,
   files, and the read contracts this module joins (`entities` R35's `entities` and `resolutions`, `content` R45's
   `content`) are written in their stated columns. Every test drives question-explorer at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { questionExplorerOf } from "../../../src/question-explorer/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export const NOW = "2026-10-10T09:00:00Z";
export const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-r", Q3 = "INQ-2026-0003-s";
export const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", HDOC = "INFO-2026-0009-h";
export const PROJ = "PROJ-2026-0001-p", HPROJ = "PROJ-2026-0009-h";
export const ENT = "ENT-2026-10001", PERSON = "ENT-2026-10002", PERSON2 = "ENT-2026-10003";
export const CAP = sha("capture of a"), CAP2 = sha("capture of b"), HCAP = sha("capture of h");

function cursor(rows) {
  let i = 0;
  const c = {
    next() { return i < rows.length ? { done: false, value: rows[i++] } : { done: true, value: undefined }; },
    [Symbol.iterator]() { return c; },
    toArray() { const out = rows.slice(i); i = rows.length; return out; },
  };
  return c;
}

export function storage() {
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

/* The read contracts of earlier modules this one joins, in their stated columns. */
const CONTRACT_TABLES = `
CREATE TABLE IF NOT EXISTS entities (entity_id TEXT PRIMARY KEY, kind TEXT NOT NULL, at TEXT);
CREATE TABLE IF NOT EXISTS resolutions (capture_sha TEXT, bundle_id TEXT, ref TEXT, entity_id TEXT, grade TEXT, established INTEGER);
CREATE TABLE IF NOT EXISTS content (content_id TEXT PRIMARY KEY, capture_sha TEXT, bundle_id TEXT, extent_kind TEXT, extent TEXT,
  ref TEXT, stale INTEGER, minted_by TEXT, cited_as TEXT, chain_kind TEXT);
`;

export function questionMd(id, { subject = null, surfacedBy = "human", state = "open" } = {}) {
  return ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Question ${id}"`,
          `current_state: ${state}`, "prior_state: null", `surfaced_by: ${surfacedBy}`,
          ...(subject ? [`subject_entity: ${subject}`] : []),
          `created: "2026-10-01T00:00:00Z"`, `last_updated: "2026-10-01T00:00:00Z"`, "references: []",
          "state_history: []", "---", "", "## Question", "", "What happened?", ""].join("\n");
}

export function world({ gateOpen = true, steps: withSteps = true, aiUse: withAiUse = true } = {}) {
  const st = storage();
  const host = { storage: st };
  for (const t of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";"))
    if (t.trim()) st.db.exec(t);
  st.db.exec(CONTRACT_TABLES);
  const clock = { now: NOW };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const credentials = credentialsOf(host, { record, membership, sealSecret: "test-seal-secret-0123456789" });
  credentials.migrate();

  const calls = [];
  const note = (name, a) => calls.push({ name, a });
  const w = {
    st, host, record, membership, credentials, clock, calls,
    recipients: {}, drawing: {}, subjects: {}, asserted: {}, conns: [], captures: {}, held: new Set(),
    explore: {}, approved: new Set(), steps: [], runs: new Map(), bounds: new Map(),
    testBar: { part: "explore", set: "civicsmith", set_version: "1", false_alarm_rate: 0.1, passed: true, graded_by: "harness" },
    deployed: new Set(["investigate", "explore"]), groupResults: [], openRefuse: null, stepRefuse: null,
    row: (q, ...a) => [...st.sql.exec(q, ...a)][0] ?? null,
    rows: (q, ...a) => [...st.sql.exec(q, ...a)],
    count: (t) => [...st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)][0].n,
    calledAs: (name) => calls.filter((c) => c.name === name).map((c) => c.a),
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify([...st.sql.exec(`SELECT * FROM ${name}`)]);
      return out;
    },
  };
  if (!gateOpen) w.testBar = null;

  const steps = {
    stepCreate(a) {
      note("stepCreate", a);
      if (w.stepRefuse) return w.stepRefuse;
      const step = `STP-2026-${String(w.steps.length + 1).padStart(5, "0")}`;
      w.steps.push({ step, ...a, state: "planned" });
      return { ok: true, step, place: a.place, at: clock.now };
    },
    stepDelete(a) { note("stepDelete", a); w.steps = w.steps.filter((s) => s.step !== a.step); return { ok: true }; },
    stepEnd(a) { note("stepEnd", a); const s = w.steps.find((x) => x.step === a.step); if (s) s.state = a.end; return { ok: true }; },
    recordProduct(a) { note("recordProduct", a); return { ok: true }; },
    findRecipients(a) { note("findRecipients", a); return { recipients: w.recipients[a.question] || [], next: null }; },
  };
  const aiUse = {
    exploreAllowed(a) {
      note("exploreAllowed", a);
      const v = w.explore[a.owner] || "no";
      if (v === "no") return { ok: false, code: "EXPLORE_NOT_ENABLED" };
      if (v === "ask" && !w.approved.has(a.owner)) return { ask: true };
      return null;
    },
    estimate(a) { note("estimate", a); return { low: 0.1, high: 0.3, unit: "usd" }; },
    exploreAsk(a) { note("exploreAsk", a); return { ok: true, key: `ask:${a.owner}` }; },
  };
  const aiRuns = {
    open(a) {
      note("open", a);
      if (w.openRefuse) return w.openRefuse;
      w.runs.set(a.run, { ...a, status: "running" });
      for (const b of a.bounds || []) w.bounds.set(`${a.run}|${b.bound}`, { allowed: b.allowed, consumed: 0 });
      return { ok: true, run: a.run, status: "running" };
    },
    close(a) {
      note("close", a);
      const r = w.runs.get(a.run);
      if (r) r.status = "stopped";
      return { ok: true, run: a.run, actual: { usd: 0.42 } };
    },
    boundOf(run, bound) { const b = w.bounds.get(`${run}|${bound}`); return b ? { ...b } : null; },
    consumeBound(run, bound, n) {
      note("consumeBound", { run, bound, n });
      const k = `${run}|${bound}`;
      const b = w.bounds.get(k) || { allowed: 0, consumed: 0 };
      w.bounds.set(k, { ...b, consumed: b.consumed + n });
      return null;
    },
    groupTestResults(a) { note("groupTestResults", a); return { ok: true, part: a.part, results: w.groupResults }; },
  };
  const captureRequests = {
    captureRequest(args, ctx) {
      note("captureRequest", { args, ctx });
      if (!w.held.has(args.address))
        return { ok: false, code: "CAPTURE_REQUEST_ADDRESS_NOT_HELD", reason: "CAPTURE_REQUEST_ADDRESS_NOT_HELD" };
      return { ok: true, request: "CR-1", requested: true, already: false, step: args.step };
    },
  };
  const connections = {
    asserted(a) { note("asserted", a); return { ok: true, member: w.asserted[a.bundleId] || [], source: [], containment: [] }; },
    read(a) {
      note("connRead", a);
      return { connections: w.conns.filter((c) => c.a_capture_sha === a.captureSha || c.b_capture_sha === a.captureSha)
        .map((c) => ({ connection: c })) };
    },
  };
  const retrieval = {
    zone: () => "UTC",
    contentAxis(a) {
      note("contentAxis", a);
      const b = w.captures[a.captureSha];
      return b ? { found: true, capture_held: true, bundle_id: b } : { found: false, capture_held: false };
    },
  };
  const inquiry = { subjectEntityOf: (id) => w.subjects[id] ?? null };
  const legEarning = {
    projectsDrawingOnPaged(a) { return { projects: (w.drawing[a.id] || []).map((id) => ({ id })), cursor: null }; },
    projectsDrawingOn(id) { return { projects: (w.drawing[id] || []).map((x) => ({ id: x })) }; },
    basisFor(id) { return { ok: true, bundleId: id, legs: [{ target: DOC }] }; },
  };
  const basisVersions = { currentOf: (p) => ({ current: `reading of ${p}` }) };

  const p = questionExplorerOf(host, {
    record, membership, credentials, connections, retrieval, inquiry, legEarning, basisVersions, aiRuns, captureRequests,
    steps: withSteps ? steps : null, aiUse: withAiUse ? aiUse : null,
    testBar: (part) => { note("testBar", { part }); return w.testBar && w.testBar.part === part ? { ...w.testBar } : null; },
    deployable: (part) => w.deployed.has(part),
    now: () => Date.parse(clock.now),
  });
  p.migrate();
  Object.assign(w, { p, stepsApi: steps, aiUse, aiRuns, captureRequests, connections, retrieval });

  let rev = 0;
  w.bundle = (id, type, text, { project = null, state = null } = {}) => {
    st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, project)
                 VALUES (?, ?, 'g', ?, ?, 't', 't', ?, ?)
                 ON CONFLICT(bundle_id) DO UPDATE SET current_state=excluded.current_state, bundle_sha=excluded.bundle_sha`,
                id, type, id, state || (type === "inquiry" ? "open" : "collected"), sha(`${id}#${++rev}`), project);
    if (text != null)
      st.sql.exec(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?, 'bundle.md', ?, ?, ?)
                   ON CONFLICT(bundle_id, path) DO UPDATE SET content=excluded.content`, id, text, Buffer.byteLength(text), sha(text));
    membership.reindexProjectSight(id);
    return id;
  };
  w.member = (id, role = "member") => {
    st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated) VALUES (?, ?, ?, ?, 'active', 't', 't')`,
                id, `cover ${id}`, id, role);
    return id;
  };
  w.question = (id, { subject = null, surfacedBy = "human", state = "open", recipients = ["alice"] } = {}) => {
    w.bundle(id, "inquiry", questionMd(id, { subject, surfacedBy, state }), { state });
    w.subjects[id] = subject;
    w.recipients[id] = recipients;
    return id;
  };
  w.project = (id, participants = [], { owners = [], setting = "hidden" } = {}) => {
    w.bundle(id, "project", null);
    for (const m of participants)
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, 'joined', ?, 't', 't')`, id, m, owners.includes(m) ? 1 : 0);
    st.sql.exec(`INSERT INTO project_sight (project_id, setting) VALUES (?, ?)
                 ON CONFLICT(project_id) DO UPDATE SET setting=excluded.setting`, id, setting);
    return id;
  };
  w.doc = (id, cap, { project = null } = {}) => { w.bundle(id, "information", null, { project }); w.captures[cap] = id; return cap; };
  w.entity = (id, kind) => { st.sql.exec(`INSERT OR REPLACE INTO entities (entity_id, kind, at) VALUES (?, ?, 't')`, id, kind); return id; };
  w.resolve = (cap, bundleId, entity) =>
    st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, established) VALUES (?, ?, 'r', ?, 'B', 1)`,
                cap, bundleId, entity);
  w.content = (id, bundleId, cap) =>
    st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, stale, minted_by)
                 VALUES (?, ?, ?, 'pdf-page', '{}', 'page 1', 0, 'member:alice')`, id, cap, bundleId);
  /* The standard world: alice, bob and carol members; dana an administrator; Q open with alice following it. */
  w.standard = () => {
    for (const m of ["alice", "bob", "carol"]) w.member(m);
    w.member("dana", "admin");
    w.doc(DOC, CAP);
    w.doc(DOC2, CAP2);
    w.question(Q, { recipients: ["alice"] });
    return w;
  };
  /* One tick with `owner`'s exploring set to yes, answering the run it opened. */
  w.openRun = (owner = "group", question = Q) => {
    w.explore[owner] = "yes";
    const t = p.exploreTick(clock.now);
    const o = t.opened.find((x) => x.question === question);
    if (!o) throw new Error(`no run opened: ${JSON.stringify(t)}`);
    return o;
  };
  return w;
}

export const CALLER = "class:ai";
