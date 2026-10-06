/* local-facts over the modules it uses, each the real one (record-core, membership), on a real SQLite database
   (node:sqlite) standing in for a Durable Object's storage, at the plane's shape (K313, K316): `sql.exec` answers a
   cursor, as workerd's does, never an array. Jurisdiction profiles are the real ones: the test profile
   (`test-port-ellery`), and profile objects a test writes (never the first profile's, `layers.md` rule 3). Every
   test drives `local-facts` at its interface. */
import { DatabaseSync } from "node:sqlite";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
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
export const MACHINE = "class:ai";
export const NOW = "2026-09-28T01:00:00.000Z";
export const TP = "test-port-ellery";
/** The test profile's seven facts, by their paths (R6). */
export const P = Object.freeze({
  tz: `${TP}/time_zone`,
  y2026: `${TP}/holidays/2026`,
  y2026clerk: `${TP}/holidays/2026/role=Town%20Clerk`,
  y2026court: `${TP}/holidays/2026/venue=commitment_claim`,
  y2027: `${TP}/holidays/2027`,
  clerkHours: `${TP}/hours/role=Town%20Clerk,body=City%20of%20Port%20Ellery`,
  venueHours: `${TP}/hours/venue=records_request`,
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
  if (profiles !== null) record.setSetting("jurisdiction_profiles", profiles, "admin");
  const byId = new Map(own.map((p) => [p.id, p]));
  const lf = localFactsOf(host, {
    record, membership, now: () => clock.now, validate, lines, officeOf,
    get: (id) => byId.get(id) ?? get(id),
    combine: (ids) => combine(ids.map((id) => byId.get(id) ?? id)),
  });
  const w = {
    st, host, record, membership, lf, clock,
    rows: (q, ...a) => st.rows(q, ...a),
    count: () => st.rows(`SELECT COUNT(*) AS n FROM local_fact_acts`)[0].n,
    at(iso) { clock.now = iso; return w; },
    /** bob's act on a fact, with the defaults over his fields. */
    act(path, act, fields = {}) {
      return lf.factConfirm({ path, act, how: "checked the office's own page", by: V("bob"), viewer: V("bob"), ...fields });
    },
    status: (path, viewer = V("bob")) => lf.factStatus({ path, viewer }),
  };
  return w;
}
