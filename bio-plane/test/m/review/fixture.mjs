/* review over record-core, membership and strength (the real ones) on a real SQLite database (node:sqlite) standing in
   for a Durable Object's storage, at the plane's shape: `sql.exec` answers a one-pass cursor as workerd does (K316),
   never an array, so code that indexes or measures an answer instead of iterating it fails here as it would there. What it reads from `publication` (its `cases` and `published_cases` read contract,
   R3 and R5, its R40, and its `case_documents`, R31 and R33), `ratification` (`registerApprovalReader`, R32),
   `case-grammar` (`reviewCommentsOf`, R33), `case-tensions` (`attributionInForce`, R16, its R6), `case-authoring` (`publishCase` run dry, R13),
   `case-inputs` (`statementAcknowledgements` with its `withheld_stated`, R15, its R2), `case-account` (`registerReviewComments`, R33, its R7) and `basis-versions` (`testimonyReach`, R16) are providers the test controls, in the
   shapes of those modules' Provides, as `reviewOf`'s `deps` take them. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { reviewCommentsRegistrar } from "../case-account/fixtures.mjs";
import { approvalSubjectSha, reviewCommentsOf } from "../../../src/case-grammar/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const statements = (ddl) => ddl.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
  .split(";").map((t) => t.trim()).filter(Boolean);

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const V = (id) => `member:${id}`;
export const NOW = "2026-09-28T01:00:00.000Z";

/* workerd's SqlStorageCursor, as far as the plane reads it: iterable once, `next`, `toArray`, `one`. */
function cursor(rows) {
  const it = rows[Symbol.iterator]();
  return {
    [Symbol.iterator]() { return this; },
    next: () => it.next(),
    toArray: () => [...it],
    one() {
      const all = [...it];
      if (all.length !== 1) throw new Error(`Expected exactly one result from SQL query, but got ${all.length}.`);
      return all[0];
    },
  };
}

export function storage() {
  const db = new DatabaseSync(":memory:");
  let n = 0;
  const sql = {
    exec(q, ...args) {
      const st = db.prepare(q);
      return cursor(st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r }))
                                        : (st.run(...args.map(bind)), []));
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

/* publication's read contract (R3, R5): only the columns this module reads, and a table the dry run writes. */
const PUBLICATION_DDL = `
CREATE TABLE cases (case_id TEXT PRIMARY KEY, project_id TEXT);
CREATE TABLE published_cases (case_id TEXT NOT NULL, edition INTEGER NOT NULL, scope TEXT, ratified_at TEXT, PRIMARY KEY (case_id, edition));
CREATE TABLE published_case_members (case_id TEXT NOT NULL, edition INTEGER NOT NULL, ord INTEGER NOT NULL, bundle_id TEXT NOT NULL,
                                     version_sha TEXT, role TEXT, PRIMARY KEY (case_id, edition, bundle_id));
CREATE TABLE case_documents (case_id TEXT NOT NULL, edition INTEGER NOT NULL, text TEXT, doc_sha TEXT, draft_id TEXT,
                             sig_armored TEXT, PRIMARY KEY (case_id, edition));
`;

/** One world: the store, the controlled providers, and helpers that write what they read. */
export function world({ now = NOW, injectClock = true, localFacts, combine = () => null } = {}) {
  const st = storage();
  const host = { storage: st };
  for (const t of statements(RECORD_SCHEMA)) st.db.exec(t);
  for (const t of statements(PUBLICATION_DDL)) st.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const strength = strengthOf(host, { record, membership, inquiry: {}, versions: {}, producingGroup: () => "grp" });
  const clock = { now };
  /* case-authoring's side: `publishCase` answers what `gate` returns for the arguments, and writes a case document
     first (so a dry run that did not roll back would leave a row). */
  const calls = { publish: [], acks: [], acksViaCaseAuthoring: [], reach: [], attribution: [],
                  attributionViaPublication: [], editions: [] };
  /* `editions`: a scripted double of case-authoring's `draftEditions` (its R83, K4363) until that module merges. */
  const ca = { gate: () => ({ ok: true, caseId: "CASE-2026-0001" }), acks: [], throws: null,
               editions: () => ({ prepared: null, published: null }) };
  const caseAuthoring = {
    /* its pass-through to case-account until T43 (N850): R33 registers with case-account, never here, so this list
       stays empty (the negative control) */
    reviewComments: [],
    registerReviewComments(fn) { this.reviewComments.push(fn); return { ok: true }; },
    draftEditions(args) { calls.editions.push(args); return ca.editions(args); },
    publishCase(args) {
      calls.publish.push(args);
      st.sql.exec(`INSERT INTO case_documents (case_id, edition, text) VALUES (?, ?, ?)`,
                  `DRY-${calls.publish.length}`, 1, "prepared");
      if (ca.throws) throw ca.throws;
      return ca.gate(args);
    },
    /* its list before T47 (N908), moved to case-inputs: R15 reads case-inputs, never here, so this stays uncalled
       (the negative control) */
    statementAcknowledgements(...args) {
      calls.acksViaCaseAuthoring.push(args);
      return caseInputs.statementAcknowledgements(...args);
    },
  };
  /* case-inputs' side (its R2): the acknowledgement list is `ca.acks`. */
  const caseInputs = {
    statementAcknowledgements(project, caseId, edition, statement, exceptAuthor, writer, draftId) {
      calls.acks.push({ project, caseId, edition, statement, exceptAuthor, writer, draftId });
      const rows = ca.acks.filter((r) => r.project === project && r.statement === statement);
      const byWriter = rows.filter((r) => r.kind === "participant" && writer && writer.by && r.by === writer.by).length;
      const undetermined = writer && writer.by === null ? rows.filter((r) => r.kind === "participant").length : 0;
      const listed = rows.filter((r) => !(r.kind === "participant" && (writer.by === null || r.by === writer.by)));
      return { statementSha: sha(statement), truncated: false, byWriter, withheldWriterUndetermined: undetermined,
               withheld_stated: `withheld ${byWriter + undetermined} by ${writer && writer.by ? writer.by : "UNDETERMINED"}`,
               /* case-inputs R1, R2 (DEC-88): each row carries the acknowledger's `reason` as stored, null for a
                  reading recorded before the reason was required. */
               rows: listed.map((r) => ({ kind: r.kind, by: r.by, recipient: r.recipient ?? null, at: r.at,
                                          reason: r.reason ?? null })) };
    },
  };
  /* case-account's side: the one review-comments reader (its R7), taken once; the three answers are case-account's own
     published fixture (`reviewCommentsRegistrar`, made by its real code), never written here. */
  const registrar = reviewCommentsRegistrar();
  const caseAccount = {
    reviewComments: [],
    registerReviewComments(fn) {
      if (typeof fn !== "function") return registrar.malformed;
      if (this.reviewComments.length) return registrar.declared;
      this.reviewComments.push(fn);
      return registrar.register(fn);
    },
  };
  /* case-tensions' side: the attribution level in force (its R6). */
  const chosen = new Set();          // `${case}|${edition}|${observation}`
  const caseTensions = {
    attributionInForce(caseId, edition, observation) {
      calls.attribution.push([caseId, edition, observation]);
      return chosen.has(`${caseId}|${edition}|${observation}`) ? { level: "group", edition } : null;
    },
  };
  /* publication's side: the review provider this module fills (its R23). Its old delegate `attributionInForce` (its
     R61 drops it, T35-54) answers the same as case-tensions here and records each call, so a read through it is seen. */
  const providers = [];
  const publication = {
    registerReviewProvider(module, provider) { providers.push({ module, provider }); return { ok: true, module }; },
    attributionInForce(caseId, edition, observation) {
      calls.attributionViaPublication.push([caseId, edition, observation]);
      return caseTensions.attributionInForce(caseId, edition, observation);
    },
  };
  /* basis-versions' side: which observations the findings reach (its R39). */
  const reach = new Map();           // finding → [{observation, self?}]
  const basisVersions = {
    testimonyReach(ids) {
      calls.reach.push(ids);
      const self = [], via = [];
      for (const id of ids) for (const r of reach.get(id) || [])
        if (r === id) self.push(id); else via.push({ finding: id, observation: r });
      return { self, via };
    },
  };
  /* ratification's side: the approval reader this module fills at start (its R50; R32). */
  /* `caseConclusionFor` (its R1): the project's conclusions the test sets, `${project}|${inquiry}` → {at, by}. */
  const concluded = new Map();
  const ratification = { readers: [], registerApprovalReader(reader) { this.readers.push(reader); return { ok: true }; },
    caseConclusionFor(project, inquiry, viewer, state) {
      const c = concluded.get(`${project}|${inquiry}`);
      return c && ["open", "surfaced", "concluded"].includes(state)
        ? { state: "concluded", relationship: "project", project, inquiry, at: c.at, by: c.by }
        : { state: "not_concluded", relationship: "project", project, inquiry, why: "project_has_never_concluded" };
    } };
  /* case-grammar's side, its own (pure): the comments a signed document's `review_comments:` block carries (its R25)
     and the approval digest (its R26, K2528). */
  const caseGrammar = { reviewCommentsOf, approvalSubjectSha };
  /* `injectClock: false` leaves the module on its own default clock (R17's stamps as the module writes them). */
  const r = reviewOf(host, { record, membership, strength, basisVersions, publication, caseTensions, caseAuthoring,
                             caseInputs, caseAccount, ratification, caseGrammar, localFacts, combine, ...(injectClock ? { now: () => clock.now } : {}) });
  let bundles = 0;
  const w = {
    st, host, record, membership, strength, r, clock, calls, ca, chosen, reach, concluded, providers, ratification, caseAuthoring,
    caseInputs, caseAccount, caseGrammar,
    rows: (q, ...a) => st.sql.exec(q, ...a).toArray(),
    row: (q, ...a) => st.sql.exec(q, ...a).toArray()[0] ?? null,
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n,
    /** Every table's rows, to prove a read wrote nothing. */
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`).toArray());
      return out;
    },
    /** A bundle row (record-core's `bundles`, its R37) and, when given, its bundle.md (`files.content`). */
    bundle(id, type = "inquiry", text = null, state = "concluded") {
      bundles++;
      st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
                   VALUES (?,?,?,?,?,?,?,?)`, id, type, "g", id, state, now, now, `sha${bundles}`);
      if (text != null)
        st.sql.exec(`INSERT INTO files (bundle_id,path,content,sha256,bytes) VALUES (?,?,?,?,?)`,
                    id, "bundle.md", text, sha(text), text.length);
    },
    /** A member of the group. */
    member(id, role = "member", status = "active") {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?,?,?,?,?,?,?,?)`, id, `Cover ${id}`, `h_${id}`, role, status, '["contribute"]', now, now);
    },
    /** A project: `owners` joined with the owner flag (in order), `joined`, `invited` and `leaving` participants. */
    project(id, { owners = [], joined = [], invited = [], leaving = [], bar = null } = {}) {
      const md = ["---", "object_type: project", `title: "${id}"`,
                  ...(bar ? ["required_strength:", `  capture: ${bar.capture}`, `  connection: ${bar.connection}`] : []),
                  "---", "", "## Objective", ""].join("\n");
      w.bundle(id, "project", md, "forming");
      owners.forEach((m, i) => st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner,
        owner_order, created, updated) VALUES (?,?,?,?,?,?,?)`, id, m, "joined", 1, i + 1, now, now));
      for (const [list, state] of [[joined, "joined"], [invited, "invited"], [leaving, "leaving"]])
        for (const m of list)
          st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                       VALUES (?,?,?,?,?,?)`, id, m, state, 0, now, now);
    },
    /** A project set discoverable by its first owner (membership R45). */
    discoverable(id, owner) {
      const res = membership.projectVisibilitySet({ projectId: id, setting: "discoverable", reason: "open",
                                                    by: owner, viewer: V(owner) });
      if (!res.ok) throw new Error(`fixture discoverable refused: ${JSON.stringify(res)}`);
    },
    /** A case document (publication's `case_documents`, its R40): `signed` sets `sig_armored`. Answers its approval
     *  digest (case-grammar R26's `approvalSubjectSha`, K2528), which R31 names. */
    caseDocument(caseId, edition, { text = `---\ncase: ${caseId}\n---\ndoc`, draft = null, signed = false } = {}) {
      st.sql.exec(`INSERT OR REPLACE INTO case_documents (case_id, edition, text, doc_sha, draft_id, sig_armored)
                   VALUES (?,?,?,?,?,?)`, caseId, edition, text, sha(text), draft, signed ? "-----BEGIN SSH SIGNATURE-----" : null);
      return approvalSubjectSha(text);
    },
    /** A case owned by `project`, published at editions 1..`editions` (publication's rows). */
    publishedCase(caseId, project, editions = 1, { scope = null, members = [] } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO cases (case_id, project_id) VALUES (?, ?)`, caseId, project);
      for (let e = 1; e <= editions; e++) {
        st.sql.exec(`INSERT OR IGNORE INTO published_cases (case_id, edition, scope, ratified_at) VALUES (?, ?, ?, ?)`, caseId, e, scope, clock.now);
        members.forEach(([id, role], i) => st.sql.exec(`INSERT OR IGNORE INTO published_case_members
          (case_id, edition, ord, bundle_id, role) VALUES (?, ?, ?, ?, ?)`, caseId, e, i + 1, id, role ?? null));
      }
    },
  };
  return w;
}

/** The standard world: members, a project P with owners ann (and bea), a joined editor ed, an invited ivy, a leaving
 *  lee; an administrator adm; an outsider out; a second project Q owned by quinn. */
export function standard(opts = {}) {
  const w = world(opts);
  for (const m of ["ann", "bea", "ed", "ivy", "lee", "out", "quinn"]) w.member(m);
  w.member("adm", "admin");
  w.project("PROJ-2026-0001-p", { owners: ["ann", "bea"], joined: ["ed"], invited: ["ivy"], leaving: ["lee"] });
  w.project("PROJ-2026-0002-q", { owners: ["quinn"] });
  return w;
}
export const P = "PROJ-2026-0001-p", Q = "PROJ-2026-0002-q";
export const SECRET = (n) => sha(`secret-${n}`);
