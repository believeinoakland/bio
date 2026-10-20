/* capture-sources' ops tests' world (R66, R67): record-core, membership, sign-in credentials and capture-sources' credentials over one
   SQLite database (node:sqlite, the engine a Durable Object runs), as credentials.test.mjs builds its own. Members `ann` (owner of
   P1), `bob` (joined P1), `dee` (owner of P2), a second administrator `second`; the founder is `admin`. */
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf as signInCredentialsOf } from "../../../src/credentials/index.mjs";
import { credentialsOf, CREDENTIALS_TABLE } from "../../../src/capture-sources/credentials.mjs";

export const KEY = "test-instance-secret-not-a-real-one";
export const SECRET = "s3cret-Pa55word-for-the-source";
export const HOST = "records.example.gov";
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

export async function world({ key = KEY, ownHosts = undefined } = {}) {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...args) { const st = db.prepare(q);
    return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []); } };
  let n = 0;
  const storage = { sql, transactionSync(fn) { const sp = `sp${n++}`; db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; } catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; } } };
  for (const st of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (st.trim()) db.exec(st);
  const ctx = { storage };
  const rc = recordOf(ctx);
  rc.migrate();
  const m = membershipOf(ctx);
  m.migrate();
  const signIn = signInCredentialsOf(ctx);
  signIn.migrate();
  let t = Date.parse("2026-09-28T00:00:00Z");
  const c = credentialsOf(ctx, { key, now: () => (t += 1000), ownHosts });
  await signIn.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
  const enrol = async (id, role = "member") => {
    const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, by: "admin" });
    await m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
  };
  await enrol("second", "admin");
  for (const id of ["ann", "bob", "dee"]) await enrol(id);
  const bundle = (id, type, project = null) => rc.commit({ bundleId: id, type, title: id, project, snapKey: `s-${id}`,
    files: [{ path: "bundle.md", text: `# ${id}`, sha256: createHash("sha256").update(`# ${id}`).digest("hex") }], state: "forming", group: "g" });
  bundle("P1", "project"); m.projectCreated({ projectId: "P1", ownerId: "ann", by: "ann" });
  bundle("P2", "project"); m.projectCreated({ projectId: "P2", ownerId: "dee", by: "dee" });
  m.projectInvite({ projectId: "P1", handle: "bob", by: "ann", viewer: "member:ann" });
  m.projectJoin({ projectId: "P1", by: "bob", viewer: "member:bob" });
  const raw = () => db.prepare(`SELECT * FROM ${CREDENTIALS_TABLE}`).all();
  return { db, rc, m, c, raw, ctx };
}
