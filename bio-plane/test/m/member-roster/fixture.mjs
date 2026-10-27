/* A member-roster module over a real SQLite database (node:sqlite) holding only its own tables: no `bundles` table, no
   project table, no record-core (R74). Every test drives the module at its interface. The three stand-ins stand for what
   `credentials` registers at its start (its R16, R17, R20), since a test of this module imports no later one. */
import { DatabaseSync } from "node:sqlite";
import { membersOf, membersOps, notAnAdmin } from "../../../src/member-roster/index.mjs";

const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export function sqlOver(db) {
  return {
    exec(q, ...args) {
      const st = db.prepare(q);
      return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []);
    },
  };
}

/* `omit` leaves named stand-ins ("claimed", "setter", "revoked") to the test, for a test of that registration itself. */
export function world({ omit = [] } = {}) {
  const db = new DatabaseSync(":memory:");
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };                  // a Durable Object's storage, as membersOf reads it
  const m = membersOf(ctx);
  if (membersOf(ctx) !== m) throw new Error("membersOf answers one instance per storage");
  m.migrate();
  const creds = { claimed: false, passwords: new Map(), revoked: [] };
  if (!omit.includes("claimed")) m.registerClaimed("credentials", () => creds.claimed);
  if (!omit.includes("setter"))
    m.registerPasswordSetter(({ role, password }) => { creds.passwords.set(role, password); return { ok: true, role }; });
  if (!omit.includes("revoked")) m.onRevoked("credentials", (notice) => { creds.revoked.push(notice); });
  const w = {
    db, sql, m, creds,
    row(q, ...a) { return sql.exec(q, ...a)[0] ?? null; },
    rows(q, ...a) { return sql.exec(q, ...a); },
    /* The founder claims the instance: the fact `credentials` states (its R17). */
    // fixtures-own: harness a world helper named like the op `claim`: it records the test's fact, and no store answers it
    async claim() { creds.claimed = true; return { ok: true, role: "admin" }; },
    /* Invite and enrol a member all the way to active; returns the enrol answer. */
    async enrol(id, role = "member", by = "admin", caps = null) {
      const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: caps, by });
      if (!a.ok) return a;   /* a refusal, CONSENSUS_REQUIRED included, is answered as it came */
      return m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
    },
    /* The founder plus a second administrator, so ordinary members may be added. */
    async group(...members) {
      await w.claim();
      await w.enrol("second", "admin");
      for (const id of members) await w.enrol(id);
      return w;
    },
    ops(query = "", body = null) {
      const url = new URL(`http://x/?${query}`);
      return membersOps(m, url, body, { VERSION: "test-build" });
    },
  };
  return w;
}

export const V = (id) => `member:${id}`;

/* Every table, read whole, to show an answer wrote nothing. */
export const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

/* The act a NOT_AN_ADMIN detail names: the fixed sentence around it is read from the helper itself (a marker phrase splits it). */
const MARK = "\u0001act\u0001";
const [, TAIL] = notAnAdmin(null, MARK).detail.split(MARK);
export const actOf = (detail) => detail.slice(0, detail.length - TAIL.length);

/* The founder plus a second and a third administrator (the third proposed, endorsed by the second, then enrolled), and the
   members named: a group of three administrators, in which one more is a proposal needing every endorsement (R3, R11). */
export async function threeAdmins(...members) {
  const w = await world().group();
  await w.m.memberAdd({ memberId: "third", cover: "cover of third", role: "admin", by: "admin" });
  const done = await w.m.adminEndorse({ memberId: "third", by: "second" });
  await w.m.enroll({ invite: done.invite, handle: "third", password: "third-passphrase-x" });
  for (const id of members) await w.enrol(id);
  return w;
}
