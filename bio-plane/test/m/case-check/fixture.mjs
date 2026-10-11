/* case-check over record-core and membership (the real ones) on a real SQLite database (node:sqlite) standing in for a
   Durable Object's storage, at the plane's shape (`sql.exec` answers a one-pass cursor, K316). What it uses of
   `case-authoring` (`publishPreflight`, `publishCase`, `calculationsAtPublication`: its R34, R14, R56), `publication`
   (`hasCaseStanding`, its R1, and its `cases`, `published_cases` and `case_documents` read contract, R40) and
   `case-carriage` (`sourcesLapsed`, `acceptedWorkLapsed`, `marksLapsed`: its R5, R4, R13) are providers the test
   controls, in the shapes of those modules' Provides. Every test drives the module at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../../../src/membership/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { caseCheckOf } from "../../../src/case-check/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const statements = (ddl) => ddl.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n")
  .split(";").map((t) => t.trim()).filter(Boolean);

export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const V = (id) => `member:${id}`;
export const NOW = "2026-10-11T12:00:00Z";
export const P = "PROJ-2026-0001-p", P2 = "PROJ-2026-0002-q";
export const F1 = "INQ-2026-0001-a", F2 = "INQ-2026-0002-b", F3 = "INQ-2026-0003-c";

function cursor(rows) {
  const it = rows[Symbol.iterator]();
  return { [Symbol.iterator]() { return this; }, next: () => it.next(), toArray: () => [...it],
           one() { const all = [...it]; if (all.length !== 1) throw new Error(`Expected exactly one result, got ${all.length}.`); return all[0]; } };
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

/* publication's read contract (its R40): only the columns this module reads. */
const PUBLICATION_DDL = `
CREATE TABLE cases (case_id TEXT PRIMARY KEY, project_id TEXT);
CREATE TABLE published_cases (case_id TEXT NOT NULL, edition INTEGER NOT NULL, PRIMARY KEY (case_id, edition));
CREATE TABLE case_documents (case_id TEXT NOT NULL, edition INTEGER NOT NULL, text TEXT, doc_sha TEXT, sig_armored TEXT,
                             ratified_at TEXT, PRIMARY KEY (case_id, edition));
`;

/** One world: the store, the controlled providers, and helpers that write what they read. */
export function world() {
  const st = storage();
  const host = { storage: st };
  for (const t of statements(RECORD_SCHEMA)) st.db.exec(t);
  for (const t of statements(PUBLICATION_DDL)) st.db.exec(t);
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const clock = { now: NOW };
  const calls = { preflight: [], publish: [], gathered: [], standing: [], sources: [], accepted: [], marks: [] };
  let prepared = 0;

  /* case-authoring's side. `pre` is the pre-flight's answer (R34's shape); `gate(args)` answers publishCase's identity
     or a refusal; every run that is not refused stores a preparation (a new text, so a new doc_sha), as R14 does
     through publication's store, and `throws` makes the act throw after storing. */
  const ca = {
    pre: { ok: true, wrote: false, ready: true, first: null, blockers: [], steps: [] },
    gate: (a) => ({ caseId: a.caseId || "CASE-2026-0001", edition: 1 }),
    throws: null,
  };
  const caseAuthoring = {
    publishPreflight(args, facts) {
      calls.preflight.push({ args, facts });
      return typeof ca.pre === "function" ? ca.pre(args) : ca.pre;
    },
    publishCase(args, facts) {
      calls.publish.push({ args, facts });
      return record.transact(() => {
        const g = ca.gate(args);
        if (g.ok === false) return g;
        const targets = Array.isArray(args.targets) ? args.targets : [args.target].filter(Boolean);
        const text = w.docText(g.caseId, g.edition, args.project, ++prepared);
        st.sql.exec(`INSERT OR REPLACE INTO case_documents (case_id, edition, text, doc_sha) VALUES (?,?,?,?)`,
                    g.caseId, g.edition, text, sha(text));
        if (ca.throws) throw ca.throws;
        const roles = args.roles || {};
        return { ok: true, caseId: g.caseId, minted: false, edition: g.edition, project: args.project,
                 caseDocument: { case_id: g.caseId, edition: g.edition, doc_sha: sha(text), bytes: text.length,
                                 read: `op=casedocument&case=${g.caseId}&edition=${g.edition}` },
                 findings: targets.map((t) => ({ target: t, bundleSha: w.head(t), promoted: false, role: roles[t] })),
                 roles };
      });
    },
    async calculationsAtPublication(args) { calls.gathered.push(args); return { calculations: [], workbooks: [], marker: "facts" }; },
  };

  /* publication's side: `hasCaseStanding` (its R1) as publication states it: a member-scope stamp stands; else
     standing in every project the document's `case_project` and the case's `cases` row name. */
  const publication = {
    hasCaseStanding(doc, viewer) {
      calls.standing.push({ doc, viewer });
      const gate = viewerPredicate(viewer);
      if (gate.scope === "DENY") return false;
      if (gate.scope === "member") return true;
      const named = String((parseFrontmatter(doc.text).data || {}).case_project ?? "").trim();
      const row = w.row(`SELECT project_id FROM cases WHERE case_id=?`, doc.case_id);
      const projects = [...new Set([named, row?.project_id ?? ""].filter(Boolean))];
      if (!projects.length) return false;
      return projects.every((p) => !!w.row(
        `SELECT 1 AS seen FROM bundles b WHERE b.bundle_id=? AND b.object_type='project' AND ${gate.sql}`, p, ...gate.args));
    },
  };

  /* case-carriage's side: each read answers what the test sets (a function of its arguments, or a value); `null`
     settings answer "nothing lapsed". */
  const cc = { sources: [], accepted: null, marks: [] };
  const answer = (v, ...a) => (typeof v === "function" ? v(...a) : v);
  const caseCarriage = {
    sourcesLapsed(text, at) { calls.sources.push({ text, at }); return answer(cc.sources, text, at); },
    acceptedWorkLapsed(fm, signer) { calls.accepted.push({ fm, signer }); return answer(cc.accepted, fm, signer); },
    marksLapsed(fm) { calls.marks.push({ fm }); return answer(cc.marks, fm); },
  };

  const c = caseCheckOf(host, { record, caseAuthoring, publication, caseCarriage, now: () => clock.now });
  let bundles = 0;
  const w = {
    st, host, record, membership, c, clock, calls, ca, cc, caseAuthoring, publication, caseCarriage,
    rows: (q, ...a) => st.sql.exec(q, ...a).toArray(),
    row: (q, ...a) => st.sql.exec(q, ...a).toArray()[0] ?? null,
    count: (t) => st.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`).one().n,
    snapshot() {
      const out = {};
      for (const { name } of st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`))
        out[name] = JSON.stringify(st.sql.exec(`SELECT * FROM "${name}"`).toArray());
      return out;
    },
    docText: (caseId, edition, project, n) => ["---", "format: bio-case-document/7", `case_id: ${caseId}`,
      `case_edition: ${edition}`, `case_project: ${project}`, `prepared: ${n}`, "---", "", "The case.", ""].join("\n"),
    /** A bundle row (record-core's `bundles`, its R37) at a fresh sha. */
    bundle(id, type = "inquiry") {
      bundles++;
      st.sql.exec(`INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,created,last_updated,bundle_sha)
                   VALUES (?,?,?,?,?,?,?,?)`, id, type, "g", id, type === "project" ? "forming" : "concluded",
                  NOW, NOW, `sha-${id}-${bundles}`);
    },
    head: (id) => w.row(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, id)?.bundle_sha ?? null,
    /** A new version of a finding: its current sha moves (record-core's commit, as far as `bundles` shows it). */
    move(id, to = null) {
      bundles++;
      st.sql.exec(`UPDATE bundles SET bundle_sha=?, row_version=row_version+1 WHERE bundle_id=?`, to ?? `sha-${id}-${bundles}`, id);
    },
    member(id, role = "member") {
      st.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                   VALUES (?,?,?,?,?,?,?,?)`, id, `Cover ${id}`, `h_${id}`, role, "active", '["contribute","publish"]', NOW, NOW);
    },
    project(id, owners = [], joined = []) {
      w.bundle(id, "project");
      owners.forEach((m, i) => st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner,
        owner_order, created, updated) VALUES (?,?,?,?,?,?,?)`, id, m, "joined", 1, i + 1, NOW, NOW));
      for (const m of joined)
        st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                     VALUES (?,?,?,?,?,?)`, id, m, "joined", 0, NOW, NOW);
    },
    /** The stored preparation re-authored in place (publication R21's `reauthorSection`: an acknowledgement list), so
     *  its doc_sha moves. */
    reauthor(caseId, edition) {
      const d = w.row(`SELECT text FROM case_documents WHERE case_id=? AND edition=?`, caseId, edition);
      const text = `${d.text}acknowledged: 1\n`;
      st.sql.exec(`UPDATE case_documents SET text=?, doc_sha=? WHERE case_id=? AND edition=?`, text, sha(text), caseId, edition);
    },
    /** A case edition ratified (publication's commit: its `cases` and `published_cases` rows; the document signed). */
    ratify(caseId, edition, project = P) {
      st.sql.exec(`INSERT OR IGNORE INTO cases (case_id, project_id) VALUES (?,?)`, caseId, project);
      st.sql.exec(`INSERT INTO published_cases (case_id, edition) VALUES (?,?)`, caseId, edition);
      st.sql.exec(`UPDATE case_documents SET sig_armored='sig', ratified_at=? WHERE case_id=? AND edition=?`, NOW, caseId, edition);
    },
  };
  return w;
}

/** The standard world: members ann (owner of P), ed (joined to P), quinn (owner of P2) and out (in no project); the
 *  findings F1–F3 at their first versions. */
export function standard() {
  const w = world();
  for (const m of ["ann", "ed", "quinn", "out"]) w.member(m);
  w.project(P, ["ann"], ["ed"]);
  w.project(P2, ["quinn"]);
  for (const f of [F1, F2, F3]) w.bundle(f);
  return w;
}

/** op=publish's arguments for `targets` in `project`, by `author`. */
export const args = (targets, { project = P, author = "ann", ...over } = {}) => ({
  project, targets, roles: Object.fromEntries(targets.map((t, i) => [t, i ? "supporting" : "load_bearing"])),
  scope: "s", statement: "It does not cover the amendments.", subjectPosition: "not_sought",
  subjectJustification: "A public record.", biasAcknowledgement: "Ours.", excluded: [], viewer: V(author), author, ...over });
