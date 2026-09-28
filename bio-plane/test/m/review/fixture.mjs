/* review over record-core, membership and strength (the real ones) on a real SQLite database (node:sqlite) standing in
   for a Durable Object's storage. What it reads from `publication` (its `cases` and `published_cases` read contract,
   R3 and R5; `attributionInForce`, R16), `case-authoring` (`publishCase` run dry, R13; `statementAcknowledgements`
   and `withheldWriterStated`, R15) and `basis-versions` (`testimonyReach`, R16) are providers the test controls, in the
   shapes of those modules' Provides, as `reviewOf`'s `deps` take them. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { strengthOf } from "../../../src/strength/index.mjs";
import { reviewOf } from "../../../src/review/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const statements = (ddl) => ddl.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
  .split(";").map((t) => t.trim()).filter(Boolean);

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const V = (id) => `member:${id}`;
export const NOW = "2026-09-28T01:00:00.000Z";

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

/* publication's read contract (R3, R5): only the columns this module reads, and a table the dry run writes. */
const PUBLICATION_DDL = `
CREATE TABLE cases (case_id TEXT PRIMARY KEY, project_id TEXT);
CREATE TABLE published_cases (case_id TEXT NOT NULL, edition INTEGER NOT NULL, PRIMARY KEY (case_id, edition));
CREATE TABLE case_documents (case_id TEXT NOT NULL, edition INTEGER NOT NULL, text TEXT, PRIMARY KEY (case_id, edition));
`;

/** One world: the store, the controlled providers, and helpers that write what they read. */
export function world({ now = NOW } = {}) {
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
     first (so a dry run that did not roll back would leave a row); the acknowledgement list is `acks`. */
  const calls = { publish: [], acks: [], reach: [], attribution: [] };
  const ca = { gate: () => ({ ok: true, caseId: "CASE-2026-0001" }), acks: [], throws: null };
  const caseAuthoring = {
    publishCase(args) {
      calls.publish.push(args);
      st.sql.exec(`INSERT INTO case_documents (case_id, edition, text) VALUES (?, ?, ?)`,
                  `DRY-${calls.publish.length}`, 1, "prepared");
      if (ca.throws) throw ca.throws;
      return ca.gate(args);
    },
    statementAcknowledgements(project, caseId, edition, statement, exceptAuthor, writer, draftId) {
      calls.acks.push({ project, caseId, edition, statement, exceptAuthor, writer, draftId });
      const rows = ca.acks.filter((r) => r.project === project && r.statement === statement);
      const byWriter = rows.filter((r) => r.kind === "participant" && writer && writer.by && r.by === writer.by).length;
      const undetermined = writer && writer.by === null ? rows.filter((r) => r.kind === "participant").length : 0;
      const listed = rows.filter((r) => !(r.kind === "participant" && (writer.by === null || r.by === writer.by)));
      return { statementSha: sha(statement), truncated: false, byWriter, withheldWriterUndetermined: undetermined,
               rows: listed.map((r) => ({ kind: r.kind, by: r.by, recipient: r.recipient ?? null, at: r.at })) };
    },
    withheldWriterStated: (n, by) => `withheld ${n} by ${by ?? "UNDETERMINED"}`,
  };
  /* publication's side: the attribution level in force (its R17). */
  const chosen = new Set();          // `${case}|${edition}|${observation}`
  const publication = {
    attributionInForce(caseId, edition, observation) {
      calls.attribution.push([caseId, edition, observation]);
      return chosen.has(`${caseId}|${edition}|${observation}`) ? { level: "group", edition } : null;
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
  const r = reviewOf(host, { record, membership, strength, basisVersions, publication, caseAuthoring,
                             now: () => clock.now });
  let bundles = 0;
  const w = {
    st, host, record, membership, strength, r, clock, calls, ca, chosen, reach,
    rows: (q, ...a) => st.sql.exec(q, ...a),
    row: (q, ...a) => st.sql.exec(q, ...a)[0] ?? null,
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)[0].n,
    /** Every table's rows, to prove a read wrote nothing. */
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`));
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
    /** A case owned by `project`, published at editions 1..`editions` (publication's rows). */
    publishedCase(caseId, project, editions = 1) {
      st.sql.exec(`INSERT OR IGNORE INTO cases (case_id, project_id) VALUES (?, ?)`, caseId, project);
      for (let e = 1; e <= editions; e++)
        st.sql.exec(`INSERT OR IGNORE INTO published_cases (case_id, edition) VALUES (?, ?)`, caseId, e);
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
