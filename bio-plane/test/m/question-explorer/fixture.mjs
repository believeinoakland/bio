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
import { legEarningOf } from "../../../src/leg-earning/index.mjs";
import { stepsOf } from "../../../src/steps/index.mjs";
import { aiUseOf } from "../../../src/ai-use/index.mjs";
import { runProductionsOf } from "../../../src/run-productions/index.mjs";
import { questionExplorerOf } from "../../../src/question-explorer/index.mjs";

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
/* A test set with one matter (Civicsmith's own holds none yet, so it opens nothing), and the records that hold its bar. */
export const TEST_SET = Object.freeze({ id: "civicsmith", version: 1, matters: [{ id: "m1", title: "a matter" }] });
export const bar = (part, over = {}) => ({ part, set: "civicsmith", set_version: 1, false_alarm_rate: 0.1, passed: true,
                                            graded_by: "harness", at: "2026-10-01T00:00:00Z", ...over });
export const VERIFIED_CHECK = { mode: "check", run: "RUN-0", verified_by: "member:dana", at: "2026-10-01T00:00:00Z", evidence: "seen" };
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
CREATE TABLE IF NOT EXISTS refs (bundle_id TEXT NOT NULL, target_id TEXT NOT NULL, kind TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (bundle_id, target_id, kind));
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

export function world({ gateOpen = true, testSet = TEST_SET } = {}) {
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
    subjects: {}, units: {}, asserted: {}, conns: [], captures: {}, held: new Set(),
    steps: [], runs: new Map(), bounds: new Map(),
    /* What the record holds for the deploy gate (run-rules R19, R75's records) over a test set with one matter. */
    testBars: [bar("investigate"), bar("explore")], verifications: [VERIFIED_CHECK],
    groupResults: [], openRefuse: null, stepRefuse: null,
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
  if (!gateOpen) w.testBars = [];

  /* What ai-runs does with a run's system step (its R73: created once the run is open, ended at its close), recorded
     here as the stand-in ai-runs' own calls; the real `steps` (merged, K2491) answers `findRecipients`. */
  const steps = {
    stepCreate(a) {
      note("stepCreate", a);
      if (w.stepRefuse) return w.stepRefuse;
      const step = `STP-2026-${String(w.steps.length + 1).padStart(5, "0")}`;
      w.steps.push({ step, ...a, state: "planned" });
      return { ok: true, step, place: a.place, at: clock.now };
    },
    stepEnd(a) { note("stepEnd", a); const s = w.steps.find((x) => x.step === a.step); if (s) s.state = a.end; return { ok: true }; },
  };
  const aiRuns = {
    /* R73 (K2490): the run opens first, then its system step is created through steps.stepCreate with `run` the open
       run; the answer names the step. */
    open(a) {
      note("open", a);
      if (w.openRefuse) return w.openRefuse;
      w.runs.set(a.run, { ...a, status: "running" });
      for (const b of a.bounds || []) w.bounds.set(`${a.run}|${b.bound}`, { allowed: b.allowed, consumed: 0 });
      const made = steps.stepCreate({ place: a.place, work: a.work, by: a.principalPlane, run: a.run,
                                      enabled_by: a.enabledBy && a.enabledBy.enabled_by });
      if (!made.ok) return made;
      w.runs.get(a.run).step = made.step;
      return { ok: true, run: a.run, status: "running", step: made.step };
    },
    /* R73: at close it ends the run's step as steps R5 allows a machine. */
    close(a) {
      note("close", a);
      const r = w.runs.get(a.run);
      if (r) {
        r.status = "stopped";
        steps.stepEnd({ step: r.step, end: a.stepEnd, ...(a.stepEnd === "set_aside" ? { reason: a.reason } : {}), by: r.principalPlane });
      }
      return { ok: true, run: a.run, actual: { usd: 0.42 } };
    },
    /* R28: the run as run-productions reads it (sight through membership, as ai-runs answers it). */
    runFor(run, viewer) {
      const r = typeof run === "string" ? w.runs.get(run.trim()) : null;
      if (!r || !membership.inSight(r.contextId, viewer)) return null;
      return { run: r.run, status: r.status === "running" ? "running" : "stopped", mode: r.mode, context_type: r.contextType,
               context_id: r.contextId, principal_plane: r.principalPlane, principal_claude: r.principalClaude };
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
    edgeSevered: () => false,
    /* R22 `citesInto`: the projects whose document cites the question, from the `refs` the test writes (`w.draw`). */
    citesInto: (id) => ({ confirmed: [...st.sql.exec(`SELECT bundle_id FROM refs WHERE target_id=? AND kind='cites' ORDER BY bundle_id`, id)]
      .map((r) => r.bundle_id), severed: [] }),
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
  /* leg-earning is the real module (merged, K2485): its R13 pages over connections' `refs` read contract (R58), with
     the stand-in's `edgeSevered` (R22) answering every edge live; its R4 `basisFor` over its own `inquiry_basis`. */
  const legEarning = legEarningOf(host, { record, membership, connections,
                                          promotion: { fact: () => ({ ok: false }) }, content: {} });
  const basisVersions = { currentOf: (p) => ({ current: `reading of ${p}` }) };
  /* steps is the real module (merged, K2491): R17 `findRecipients` over leg-earning's drawing projects and its own
     follows. Its registrations with promotion and observation-log are answered by stand-ins (neither is read here). */
  const realSteps = stepsOf(host, { record, membership, legEarning,
    promotion: { registerStep: () => ({ ok: true }) },
    observationLog: { registerAuthority: () => ({ ok: true }), onLookAnswered: () => ({ ok: true }) } });

  /* ai-use is the real module (merged, K2488): R6 `exploreAllowed` over the real credentials' switches and limits, R9
     `exploreAsk`, `exploreApprove`, `exploreAsksPending`, R10 `estimate`. Each call is recorded on its way through. */
  const realAiUse = aiUseOf(host, { record, membership, credentials, connections, zone: "UTC" });
  const aiUse = Object.fromEntries(["exploreAllowed", "exploreAsk", "estimate", "exploreApprove", "exploreAsksPending"]
    .map((k) => [k, (a) => { note(k, a); return realAiUse[k](a); }]));
  /* run-productions is the real module (merged, K2499): R24 `readPages` over the real credentials' limits and
     ai-runs' bounds (the stand-in's `runFor`, `boundOf`, `consumeBound`), a document's capture and its text units
     answered by content's and extraction's stand-ins (`w.units`). */
  const runProductions = runProductionsOf(host, {
    record, membership, connections, aiRuns, credentials, steps: realSteps, legEarning,
    content: { captureFor: (b) => Object.keys(w.captures).find((c) => w.captures[c] === b) ?? null },
    extraction: { unitsOf: (sha) => ({ units: w.units[sha] || [], state: "indexed" }) },
    strength: {}, citation: {}, basisVersions: { onCandidates: () => ({ ok: true }) }, now: () => Date.parse(clock.now) });
  runProductions.migrate();
  const p = questionExplorerOf(host, {
    record, membership, credentials, connections, retrieval, inquiry, legEarning, basisVersions, aiRuns, captureRequests,
    runProductions,
    steps: realSteps, aiUse,
    held: () => { note("held", {}); return { verifications: w.verifications, testBars: w.testBars }; },
    testSet,
    now: () => Date.parse(clock.now),
  });
  p.migrate();
  Object.assign(w, { p, legEarning, steps: w.steps, realSteps, stepsApi: steps, aiUse, realAiUse, aiRuns, captureRequests, connections, retrieval });

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
    w.follow(id, ...recipients);
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
  /* Members follow a question by their own act (steps R16), so steps R17 answers them as its recipients. */
  w.follow = (question, ...members) => {
    for (const m of members) {
      const r = realSteps.questionFollow({ question, on: true, by: `member:${m}` });
      if (!r || r.ok === false) throw new Error(`follow ${m}: ${JSON.stringify(r)}`);
    }
  };
  /* A project draws on a question: its document cites it (connections' `refs`, R58). */
  w.draw = (question, project) => st.sql.exec(`INSERT OR IGNORE INTO refs (bundle_id, target_id, kind) VALUES (?, ?, 'cites')`, project, question);
  w.doc = (id, cap, { project = null, pages = 3 } = {}) => {
    w.bundle(id, "information", null, { project });
    w.captures[cap] = id;
    w.units[cap] = Array.from({ length: pages }, (_, i) => ({ extent: { kind: "pdf-page", page: i }, ref: `page ${i + 1}`, text: `text of page ${i + 1}` }));
    return cap;
  };
  w.entity = (id, kind) => { st.sql.exec(`INSERT OR REPLACE INTO entities (entity_id, kind, at) VALUES (?, ?, 't')`, id, kind); return id; };
  w.resolve = (cap, bundleId, entity) =>
    st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, established) VALUES (?, ?, 'r', ?, 'B', 1)`,
                cap, bundleId, entity);
  w.content = (id, bundleId, cap) =>
    st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, stale, minted_by)
                 VALUES (?, ?, ?, 'pdf-page', '{}', 'page 1', 0, 'member:alice')`, id, cap, bundleId);
  /* The standard world: alice, bob and carol members; dana an administrator, who holds the group's key (credentials
     R33; its explore switch at its default, no); Q open with alice following it. */
  w.standard = async () => {
    for (const m of ["alice", "bob", "carol"]) w.member(m);
    w.member("dana", "admin");
    const k = await credentials.groupKeySet({ key: "sk-ant-group-test", by: "member:dana" });
    if (!k || k.ok === false) throw new Error(`group key: ${JSON.stringify(k)}`);
    w.doc(DOC, CAP);
    w.doc(DOC2, CAP2);
    w.question(Q, { recipients: ["alice"] });
    return w;
  };
  /* An account's `explore` switch set by its owner's own act (credentials R55); a project gets an account first (its
     key, R54, by its first owner, the first participant made one when it has none). */
  w.setExplore = async (owner, value) => {
    let by = "member:dana";
    if (owner.startsWith("project:")) {
      const id = owner.slice(8);
      let owners = membership.projectOwners(id);
      if (!owners.length) {
        st.sql.exec(`UPDATE project_participants SET owner=1 WHERE project_id=? AND member_id=(SELECT MIN(member_id) FROM project_participants WHERE project_id=?)`, id, id);
        owners = membership.projectOwners(id);
      }
      by = `member:${owners[0]}`;
      if (!credentials.projectAccountState({ project: id, viewer: by }).held) {
        const k = await credentials.projectKeySet({ project: id, key: `sk-ant-${id}`, by });
        if (!k || k.ok === false) throw new Error(`project key: ${JSON.stringify(k)}`);
      }
    } else if (owner.startsWith("member:")) by = owner;
    const r = credentials.accountUsesSet({ owner, switch: "explore", on: value, by });
    if (!r || r.ok === false) throw new Error(`explore ${owner}: ${JSON.stringify(r)}`);
  };
  /* One of the account's owners approves exploring for today (ai-use R9). */
  w.approve = (owner) => {
    const by = owner === "group" ? "member:dana" : owner.startsWith("project:") ? `member:${membership.projectOwners(owner.slice(8))[0]}` : owner;
    const r = realAiUse.exploreApprove({ owner, day: clock.now.slice(0, 10), by, at: clock.now });
    if (!r || r.ok === false) throw new Error(`approve ${owner}: ${JSON.stringify(r)}`);
  };
  /* One tick with `owner`'s exploring set to yes, answering the run it opened. */
  w.openRun = async (owner = "group", question = Q) => {
    await w.setExplore(owner, "yes");
    const t = p.exploreTick(clock.now);
    const o = t.opened.find((x) => x.question === question);
    if (!o) throw new Error(`no run opened: ${JSON.stringify(t)}`);
    return o;
  };
  return w;
}

export const CALLER = "class:ai";
