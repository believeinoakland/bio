/* local-facts over the modules it uses, each the real one (record-core, membership), on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage, at the plane's shape (K313, K316): `sql.exec` answers a
   cursor, as workerd's does, never an array. Jurisdiction profiles are the real ones: the test profile
   (`test-port-ellery`), and profile objects a test writes (never the first profile's, `layers.md` rule 3). A group
   rule's primary source (R10) is a capture the real `provenance` and `content` hold on the same storage: `held` homes
   one in a bundle with a reading, `project` makes a hidden project to home one out of a viewer's sight. Every test
   drives `local-facts` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { contentOf } from "../../../src/content/index.mjs";
import { localFactsOf } from "../../../src/local-facts/index.mjs";
import { combine, get, validate } from "../../../../jurisdictions/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

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
    db, sql, rows: (q, ...args) => [...sql.exec(q, ...args)],
    transactionSync(fn) {
      const sp = `sp${n++}`;
      db.exec(`SAVEPOINT ${sp}`);
      try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; }
      catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; }
    },
  };
}

export const V = (id) => `member:${id}`;
export const sha = (x) => createHash("sha256").update(String(x)).digest("hex");
export const MACHINE = "class:ai";
export const NOW = "2026-09-28T01:00:00.000Z";
export const TP = "test-port-ellery";
/** The test profile's eleven facts, by their paths (R6): two of them a named closure list's year (jurisdictions R47), two
 *  an office's own time zone (jurisdictions R74, T45). */
export const P = Object.freeze({
  tz: `${TP}/time_zone`,
  y2026: `${TP}/holidays/2026`,
  y2026clerk: `${TP}/holidays/2026/role=Town%20Clerk`,
  y2026court: `${TP}/holidays/2026/venue=commitment_claim`,
  y2027: `${TP}/holidays/2027`,
  y2026courtList: `${TP}/holidays/2026/list=court`,
  y2026townList: `${TP}/holidays/2026/list=town`,
  clerkHours: `${TP}/hours/role=Town%20Clerk,body=City%20of%20Port%20Ellery`,
  venueHours: `${TP}/hours/venue=records_request`,
  examinerTz: `${TP}/time_zone/role=Examiner%20of%20Accounts,body=Marlow%20County%20Audit%20Office`,
  venueTz: `${TP}/time_zone/venue=commitment_claim`,
});

/** A profile object of the test's own, valid under `jurisdictions.validate`. */
export const written = (id, extra = {}) => ({ id, name: `Profile ${id}`, covers: [`Place ${id}`], test: true, ...extra });

/** `profiles`: the instance's active profile ids; `own`: profile objects the test wrote, resolved by id. */
/** `lines` and `officeOf`: R6's readers (`lines.structureAt`, the profile-office bridge), as a test writes them. */
export function world({ now = NOW, profiles = [TP], own = [], lines = null, officeOf = null } = {}) {
  const st = storage();
  const host = { storage: st };
  const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const t of bare.split(";")) if (t.trim()) st.db.exec(t);
  const clock = { now };
  const record = recordOf(host, { evidence: null, evidencePrefix: "bio/captures/" });
  record.migrate();
  const membership = membershipOf(host, { record });
  membership.migrate();
  const promotion = { registerStep() { return { ok: true }; }, registerFact() { return { ok: true }; }, onCommitted() { return { ok: true }; } };
  const provenance = provenanceOf(host, { record, membership, promotion, now: () => "2026-09-27T00:00:00Z" });
  provenance.migrate();
  const content = contentOf(host, { record, membership, provenance });
  content.extraction.migrate();
  content.migrate();
  for (const m of ["bob", "carol", "dan"])
    st.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status) VALUES (?, 'c', 'member', 'active')`, m);
  if (profiles !== null) record.setSetting("jurisdiction_profiles", profiles, "admin");
  const byId = new Map(own.map((p) => [p.id, p]));
  const lf = localFactsOf(host, {
    record, membership, now: () => clock.now, validate, lines, officeOf, content, provenance,
    get: (id) => byId.get(id) ?? get(id),
    combine: (ids) => combine(ids.map((id) => byId.get(id) ?? id)),
  });
  const w = {
    st, host, record, membership, provenance, content, lf, clock,
    rows: (q, ...a) => st.rows(q, ...a),
    count: () => st.rows(`SELECT COUNT(*) AS n FROM local_fact_acts`)[0].n,
    at(iso) { clock.now = iso; return w; },
    /** bob's act on a fact, with the defaults over his fields. */
    act(path, act, fields = {}) {
      return lf.factConfirm({ path, act, how: "checked the office's own page", by: V("bob"), viewer: V("bob"), ...fields });
    },
    status: (path, viewer = V("bob")) => lf.factStatus({ path, viewer }),
    bundle(id, { type = "information", project = "" } = {}) {
      st.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                   VALUES (?, ?, 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1, ?)`, id, type, project ?? "");
      return id;
    },
    /** A captured document homed in `bundleId` (provenance's register) with a reading (an HTML page, no pages). */
    held(bundleId, captureSha, { project = "" } = {}) {
      w.bundle(bundleId, { project });
      st.sql.exec(`INSERT OR REPLACE INTO register (capture_sha, bundle_id, path, encoding, bytes, registered)
                   VALUES (?, ?, 'snapshots/x', 'utf8', 1, '2026-09-27T00:00:00Z')`, captureSha, bundleId);
      content.extraction.writeReading({ bundleId, captureSha, composed: true,
        reading: { content_type: "text/html", reader_version: 1, found: true, at: "2026-09-27T00:00:00Z", entities: [] } });
      return captureSha;
    },
    /** A hidden project with one participant. */
    project(id, participant) {
      w.bundle(id, { type: "project" });
      st.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, owner, created, updated)
                   VALUES (?, ?, 'joined', 1, '2026-01-01', '2026-01-01')`, id, participant);
      return id;
    },
  };
  return w;
}
