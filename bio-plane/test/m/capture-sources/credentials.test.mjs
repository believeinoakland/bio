/* capture-sources: the credentials members supply for a refused capture (`capture-sources/credentials.mjs`),
 * tested at the module's interface (build/requirements/capture-sources.md R55–R63, the amended Purpose and
 * R47). Each test names the requirement id it checks in its title.
 *
 * THE WORLD IS REAL BELOW THIS MODULE: record-core and membership over one SQLite database (node:sqlite, the
 * engine a Durable Object runs), a storage whose `transactionSync` rolls back as a Durable Object's does. The
 * members, projects and inquiries below are this file's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import {
  credentialsOf, CAPTURE_CREDENTIAL_CHECKS, CREDENTIAL_KINDS, CREDENTIAL_SCOPES, REVOCATION, CREDENTIALS_TABLE,
  hostNameOf, principalMember,
} from "../../../src/capture-sources/credentials.mjs";

const KEY = "test-instance-secret-not-a-real-one";
const SECRET = "s3cret-Pa55word-for-the-source";
const HOST = "records.example.gov";
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/* A group: the founder, a second administrator, members `ann` (owner of P1), `bob` (joined P1), `cy` (invited to
   P1, not joined), `dee` (no project); project P1 and P2 (owned by dee); inquiries Q1 in P1 and Q0 in none. */
async function world({ key = KEY, clock = null } = {}) {
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
  let t = Date.parse("2026-09-28T00:00:00Z");
  const now = clock || (() => (t += 1000));
  const c = credentialsOf(ctx, { key, now });
  await m.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
  const enrol = async (id, role = "member") => {
    const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, by: "admin" });
    await m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
  };
  await enrol("second", "admin");
  for (const id of ["ann", "bob", "cy", "dee"]) await enrol(id);
  const bundle = (id, type, project = null) => rc.commit({ bundleId: id, type, title: id, project, snapKey: `s-${id}`,
    files: [{ path: "bundle.md", text: `# ${id}`, sha256: createHash("sha256").update(`# ${id}`).digest("hex") }], state: "forming", group: "g" });
  bundle("P1", "project"); m.projectCreated({ projectId: "P1", ownerId: "ann", by: "ann" });
  bundle("P2", "project"); m.projectCreated({ projectId: "P2", ownerId: "dee", by: "dee" });
  m.projectInvite({ projectId: "P1", handle: "bob", by: "ann", viewer: "member:ann" });
  m.projectJoin({ projectId: "P1", by: "bob", viewer: "member:bob" });
  m.projectInvite({ projectId: "P1", handle: "cy", by: "ann", viewer: "member:ann" });
  bundle("Q1", "inquiry", "P1");
  bundle("Q0", "inquiry");
  const raw = () => db.prepare(`SELECT * FROM ${CREDENTIALS_TABLE}`).all();
  return { db, rc, m, c, raw, storage, supply: (o) => c.credentialSupply({ kind: "login", host: HOST, secret: SECRET, scope: "member", by: "ann", ...o }) };
}

const codeOf = (a) => a && a.code;
const CODES = Object.keys(CAPTURE_CREDENTIAL_CHECKS);
const ENTRY_KEYS = ["credential", "host", "kind", "project", "scope", "supplied_at", "supplied_by", "withdrawn_at", "withdrawn_by"];

/* Every form a secret could leak in: itself, its UTF-8 bytes as base64 and hex, its SHA-256. */
const leaks = (s) => { const b = Buffer.from(s, "utf8");
  return [s, b.toString("base64"), b.toString("hex"), createHash("sha256").update(b).digest("hex"), createHash("sha256").update(b).digest("base64")]; };
const noLeak = (value, secret, where) => {
  const text = JSON.stringify(value);
  for (const f of leaks(secret)) assert.ok(!text.includes(f), `${where}: ${f.slice(0, 12)}…`);
};

test("R55: supply stores under the declared scope and answers the listing entry, never the secret; its host exact and lower-cased", async () => {
  const w = await world();
  const a = await w.supply({ host: "Records.Example.GOV" });
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a.credential).sort(), ENTRY_KEYS);
  assert.deepEqual({ ...a.credential, credential: typeof a.credential.credential, supplied_at: typeof a.credential.supplied_at },
    { credential: "string", kind: "login", host: HOST, scope: "member", project: null, supplied_by: "ann", supplied_at: "string",
      withdrawn_at: null, withdrawn_by: null });
  noLeak(a, SECRET, "the supply's answer");
  const p = await w.supply({ scope: "project", project: "P1", kind: "user-agent", by: "bob" });
  assert.deepEqual([p.ok, p.credential.scope, p.credential.project, p.credential.kind], [true, "project", "P1", "user-agent"]);
  const g = await w.supply({ scope: "group", kind: "other", by: "dee" });
  assert.deepEqual([g.ok, g.credential.scope, g.credential.project], [true, "group", null]);
  assert.equal(w.raw().length, 3);
});

test("R55: each refusal, in order, writes nothing and carries its check and translation", async () => {
  const w = await world();
  const cases = [
    [{ by: "nobody" }, "CAPTURE_CREDENTIAL_NOT_A_MEMBER"],
    [{ by: "admin" }, "CAPTURE_CREDENTIAL_NOT_A_MEMBER"],                   /* the founder is not a member row */
    [{ by: "nobody", kind: "bad", host: "x/y", scope: "bad", secret: "" }, "CAPTURE_CREDENTIAL_NOT_A_MEMBER"],
    [{ kind: "cookie" }, "CAPTURE_CREDENTIAL_BAD_KIND"],
    [{ kind: "cookie", host: "https://x" }, "CAPTURE_CREDENTIAL_BAD_KIND"],
    ...["https://records.example.gov", "records.example.gov/login", "records.example.gov:443", "user@records.example.gov",
        "", " records.example.gov", null, 7, "-bad.example", "a..b"].map((host) => [{ host }, "CAPTURE_CREDENTIAL_BAD_HOST"]),
    [{ scope: "team" }, "CAPTURE_CREDENTIAL_BAD_SCOPE"],
    [{ scope: "member", project: "P1" }, "CAPTURE_CREDENTIAL_BAD_SCOPE"],
    [{ scope: "group", project: "P1" }, "CAPTURE_CREDENTIAL_BAD_SCOPE"],
    [{ scope: "project" }, "CAPTURE_CREDENTIAL_NO_PROJECT"],
    [{ scope: "project", project: "P9" }, "CAPTURE_CREDENTIAL_NO_PROJECT"],
    [{ scope: "project", project: "Q1" }, "CAPTURE_CREDENTIAL_NO_PROJECT"],   /* a bundle, not a project */
    [{ scope: "project", project: "P9", secret: "" }, "CAPTURE_CREDENTIAL_NO_PROJECT"],
    [{ secret: "" }, "CAPTURE_CREDENTIAL_NO_SECRET"],
    [{ secret: 12345 }, "CAPTURE_CREDENTIAL_NO_SECRET"],
    [{ secret: undefined }, "CAPTURE_CREDENTIAL_NO_SECRET"],
    [{ scope: "project", project: "P1", by: "dee" }, "CAPTURE_CREDENTIAL_NOT_PERMITTED"],
    [{ scope: "project", project: "P1", by: "cy" }, "CAPTURE_CREDENTIAL_NOT_PERMITTED"],   /* invited, not joined */
  ];
  for (const [over, code] of cases) {
    const a = await w.supply(over);
    assert.equal(a.ok, false, JSON.stringify(over));
    assert.equal(codeOf(a), code, JSON.stringify(over));
    assert.deepEqual([a.reason, a.check, a.translation], [code, CAPTURE_CREDENTIAL_CHECKS[code].check, CAPTURE_CREDENTIAL_CHECKS[code].translation]);
    assert.equal(typeof a.detail, "string");
  }
  for (const v of [undefined, null, 5]) assert.equal(codeOf(await w.c.credentialSupply(v)), "CAPTURE_CREDENTIAL_NOT_A_MEMBER");
  assert.equal(w.raw().length, 0);
  /* No key bound: refused last, nothing stored in the clear or at all. */
  const k = await world({ key: null });
  assert.equal(codeOf(await k.supply({ kind: "cookie" })), "CAPTURE_CREDENTIAL_BAD_KIND");
  assert.equal(codeOf(await k.supply({})), "CAPTURE_CREDENTIAL_NO_KEY");
  assert.equal(codeOf(await (await world({ key: "" })).supply({})), "CAPTURE_CREDENTIAL_NO_KEY");
  assert.equal(k.raw().length, 0);
  /* The catalogue rows: nine, one family, each with a translation. */
  assert.deepEqual(CODES.map((c) => CAPTURE_CREDENTIAL_CHECKS[c].check), Array.from({ length: 9 }, (_, i) => `C-105.${i + 1}`));
  assert.deepEqual([...CREDENTIAL_KINDS], ["login", "user-agent", "other"]);
  assert.deepEqual([...CREDENTIAL_SCOPES], ["member", "project", "group"]);
});

test("R56: one admitted credential per fetch: member for its supplier's requests, project for its project's, group for any; exact host", async () => {
  const w = await world();
  const mem = (await w.supply({ scope: "member", by: "bob", secret: "bob-own" })).credential;
  const prj = (await w.supply({ scope: "project", project: "P1", by: "bob", secret: "p1-shared" })).credential;
  const grp = (await w.supply({ scope: "group", by: "dee", secret: "group-shared" })).credential;
  const ask = (o) => w.c.credentialsForFetch({ host: HOST, principalPlane: "member:ann", target: "Q0", ...o });
  const pick = async (o) => { const a = await ask(o); return a.credentials.length ? a.credentials[0].credential : null; };
  /* member: admitted only for its supplier, and narrowest wins. */
  assert.equal(await pick({ principalPlane: "member:bob", target: "Q1" }), mem.credential);
  assert.equal(await pick({ principalPlane: "bob", target: "Q0" }), mem.credential);
  assert.equal(await pick({ principalPlane: "member:bob/tok-1", target: "Q0" }), mem.credential);
  /* project: admitted only when the target inquiry is in its project. */
  assert.equal(await pick({ principalPlane: "member:ann", target: "Q1" }), prj.credential);
  assert.equal(await pick({ principalPlane: "class:daemon", target: "Q1" }), prj.credential);
  /* group: any request. */
  assert.equal(await pick({ principalPlane: "member:ann", target: "Q0" }), grp.credential);
  assert.equal(await pick({ principalPlane: "class:daemon", target: null }), grp.credential);
  assert.equal(await pick({ principalPlane: "organisation/tok-9", target: "Q0" }), grp.credential);
  /* The entry: what provenance records, and the secret. */
  const e = await ask({ principalPlane: "member:bob" });
  assert.deepEqual(e, { credentials: [{ credential: mem.credential, kind: "login", secret: "bob-own", supplied_by: "bob",
                                        scope: "member", project: null }], reason: null });
  /* Exact host only: never a subdomain, a parent, or another host; case-insensitively the same host. */
  assert.equal(await pick({ host: "RECORDS.EXAMPLE.GOV", principalPlane: "member:bob" }), mem.credential);
  for (const host of ["sub.records.example.gov", "example.gov", "records.example.gov.evil.example", "other.example", "", null]) {
    const a = await ask({ host, principalPlane: "member:bob", target: "Q1" });
    assert.deepEqual(a.credentials, [], String(host));
    assert.equal(typeof a.reason, "string");
  }
});

test("R56: narrowest scope, then the newest; none admitted, no key, or no decrypt answer [] with a reason naming no secret", async () => {
  const w = await world();
  const g1 = (await w.supply({ scope: "group", by: "dee", secret: "g-old" })).credential;
  const g2 = (await w.supply({ scope: "group", by: "ann", secret: "g-new" })).credential;
  const ask = (o) => w.c.credentialsForFetch({ host: HOST, principalPlane: "member:cy", target: "Q1", ...o });
  assert.equal((await ask()).credentials[0].credential, g2.credential);
  const p = (await w.supply({ scope: "project", project: "P1", by: "ann", secret: "p-one" })).credential;
  assert.equal((await ask()).credentials[0].credential, p.credential);
  const m = (await w.supply({ scope: "member", by: "cy", secret: "cy-own" })).credential;
  const got = await ask();
  assert.deepEqual([got.credentials.length, got.credentials[0].credential, got.reason], [1, m.credential, null]);
  /* None admitted. */
  const none = await ask({ host: "other.example" });
  assert.deepEqual(none.credentials, []);
  assert.match(none.reason, /no credential supplied for other\.example is admitted/);
  /* A ciphertext that will not decrypt: the reason names the credential, never its secret, and no other is tried. */
  w.db.prepare(`UPDATE ${CREDENTIALS_TABLE} SET ciphertext=(SELECT ciphertext FROM ${CREDENTIALS_TABLE} WHERE credential_id=?) WHERE credential_id=?`)
    .run(g1.credential, m.credential);
  const bad = await ask();
  assert.deepEqual(bad.credentials, []);
  assert.ok(bad.reason.includes(m.credential));
  for (const s of ["cy-own", "g-old", "g-new", "p-one"]) noLeak(bad, s, "the reason");
  /* No key bound to the instance that reads them. */
  const k = await world({ key: null });
  k.db.exec(`INSERT INTO ${CREDENTIALS_TABLE} (credential_id, kind, host, scope, project, supplied_by, supplied_at, iv, ciphertext)
             VALUES ('CRED-x','login','${HOST}','group',NULL,'dee','2026-09-28T00:00:00Z','AAAAAAAAAAAAAAAA','AAAA')`);
  const nk = await k.c.credentialsForFetch({ host: HOST, principalPlane: "member:dee", target: "Q0" });
  assert.deepEqual(nk.credentials, []);
  assert.match(nk.reason, /CAPTURE_CREDENTIAL_NO_KEY/);
  /* Never throws, whatever it is given. */
  for (const v of [undefined, null, {}, { host: 5 }]) assert.deepEqual((await w.c.credentialsForFetch(v)).credentials, []);
});

test("R57: withdrawal ends a credential for fetches, destroys its ciphertext, keeps its entry; twice is already", async () => {
  const w = await world();
  const a = (await w.supply({ scope: "group", by: "dee" })).credential;
  const r = await w.c.credentialWithdraw({ credential: a.credential, by: "dee" });
  assert.equal(r.ok, true);
  assert.equal(r.already, false);
  assert.deepEqual([r.withdrawn.credential, r.withdrawn.withdrawn_by, typeof r.withdrawn.withdrawn_at], [a.credential, "dee", "string"]);
  const row = w.raw().find((x) => x.credential_id === a.credential);
  assert.deepEqual([row.ciphertext, row.iv], [null, null]);
  assert.deepEqual((await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:dee", target: "Q0" })).credentials, []);
  const listed = w.c.credentialList({ viewer: "member:dee" }).find((e) => e.credential === a.credential);
  assert.deepEqual([listed.withdrawn_by, listed.withdrawn_at], ["dee", r.withdrawn.withdrawn_at]);
  const before = JSON.stringify(w.raw());
  const again = await w.c.credentialWithdraw({ credential: a.credential, by: "dee" });
  assert.deepEqual([again.ok, again.already, again.withdrawn.withdrawn_at], [true, true, r.withdrawn.withdrawn_at]);
  assert.equal(JSON.stringify(w.raw()), before);
  /* Unknown, and one `by` may not see: the same answer. */
  const mine = (await w.supply({ scope: "member", by: "ann" })).credential;
  const unknown = await w.c.credentialWithdraw({ credential: "CRED-nothere", by: "bob" });
  const unseen = await w.c.credentialWithdraw({ credential: mine.credential, by: "bob" });
  assert.equal(unknown.code, "CAPTURE_CREDENTIAL_NO_SUCH");
  assert.deepEqual(unseen, unknown);
  for (const v of [undefined, null, {}, { credential: 5, by: "ann" }]) assert.equal((await w.c.credentialWithdraw(v)).code, "CAPTURE_CREDENTIAL_NO_SUCH");
  /* Seen but not permitted. */
  const g = (await w.supply({ scope: "group", by: "ann" })).credential;
  assert.equal((await w.c.credentialWithdraw({ credential: g.credential, by: "bob" })).code, "CAPTURE_CREDENTIAL_NOT_PERMITTED");
  /* No expiry of its own: a credential supplied long ago is still answered. */
  const old = await world({ clock: () => Date.parse("2020-01-01T00:00:00Z") });
  await old.supply({ scope: "group", by: "dee" });
  assert.equal((await old.c.credentialsForFetch({ host: HOST, principalPlane: "member:ann", target: "Q0" })).credentials.length, 1);
});

test("R58: the listing shows each viewer what they may see, filtered, and never the secret", async () => {
  const w = await world();
  const annOwn = (await w.supply({ scope: "member", by: "ann", secret: "ann-secret" })).credential;
  const deeOwn = (await w.supply({ scope: "member", by: "dee", secret: "dee-secret" })).credential;
  const p1 = (await w.supply({ scope: "project", project: "P1", by: "bob", secret: "p1-secret" })).credential;
  const p2 = (await w.supply({ scope: "project", project: "P2", by: "dee", secret: "p2-secret" })).credential;
  const grp = (await w.supply({ scope: "group", by: "bob", secret: "grp-secret" })).credential;
  const ids = (viewer, o = {}) => w.c.credentialList({ viewer, ...o }).map((e) => e.credential).sort();
  const s = (...xs) => xs.map((x) => x.credential).sort();
  assert.deepEqual(ids("member:ann"), s(annOwn, p1, grp));
  assert.deepEqual(ids("member:bob"), s(p1, grp));
  assert.deepEqual(ids("member:cy"), s(p1, grp));                   /* invited: a participant, at FULL sight */
  assert.deepEqual(ids("member:dee"), s(deeOwn, p2, grp));
  assert.deepEqual(ids("member:second"), s(annOwn, deeOwn, p1, p2, grp));   /* an administrator sees all */
  assert.deepEqual(ids("admin"), s(annOwn, deeOwn, p1, p2, grp));
  for (const v of [undefined, null, "", "member:nobody", "class:daemon", "class:admin", "ann", 5]) assert.deepEqual(ids(v), [], String(v));
  assert.deepEqual(ids("admin", { scope: "project" }), s(p1, p2));
  assert.deepEqual(ids("admin", { project: "P2" }), s(p2));
  assert.deepEqual(ids("admin", { scope: "group", project: "P2" }), []);
  assert.deepEqual(ids("admin", { scope: "nonsense" }), []);
  const all = w.c.credentialList({ viewer: "admin" });
  for (const e of all) assert.deepEqual(Object.keys(e).sort(), ENTRY_KEYS);
  for (const secret of ["ann-secret", "dee-secret", "p1-secret", "p2-secret", "grp-secret"]) noLeak(all, secret, "the listing");
  /* No length of the secret, in any field. */
  assert.ok(all.every((e) => Object.values(e).every((v) => typeof v !== "number")));
  assert.deepEqual(w.c.credentialList(), []);
  assert.deepEqual(w.c.credentialList(null), []);
});

test("R59: a known secret is never found in the tables read raw", async () => {
  const w = await world();
  const secrets = ["Plain-Known-Secret-0001", "üñíçødé-sëcret-✓", "user-agent: Mozilla/5.0 (member browser)"];
  for (const [i, secret] of secrets.entries())
    await w.supply({ secret, scope: CREDENTIAL_SCOPES[i], project: i === 1 ? "P1" : undefined, by: "ann" });
  const dump = [];
  for (const { name } of w.db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all())
    dump.push(...w.db.prepare(`SELECT * FROM "${name}"`).all());
  for (const secret of secrets) noLeak(dump, secret, "the raw tables");
  /* And the table holds ciphertext for each: something is there, and it is not the secret. */
  assert.ok(w.raw().every((r) => typeof r.ciphertext === "string" && r.ciphertext.length > 0 && typeof r.iv === "string"));
});

test("R60: no answer of the module shows a secret back, save R56's, even a secret given in the wrong field", async () => {
  const w = await world();
  const answers = [];
  answers.push(await w.supply({}));
  answers.push(await w.supply({ scope: "project", project: "P1", by: "bob" }));
  answers.push(await w.supply({ scope: "group", by: "dee" }));
  /* Refusals, the secret placed in every field a caller controls. */
  for (const over of [{ by: SECRET }, { kind: SECRET }, { host: SECRET }, { scope: SECRET }, { scope: "member", project: SECRET },
                      { scope: "project", project: SECRET }, { scope: "project", project: "P1", by: "dee" }])
    answers.push(await w.supply(over));
  answers.push(await (await world({ key: null })).supply({}));
  answers.push(w.c.credentialList({ viewer: "admin" }), w.c.credentialList({ viewer: "member:ann" }));
  answers.push(await w.c.credentialWithdraw({ credential: SECRET, by: "ann" }));
  answers.push(await w.c.credentialWithdraw({ credential: answers[0].credential.credential, by: "bob" }));
  answers.push(await w.c.credentialWithdraw({ credential: answers[2].credential.credential, by: "bob" }));
  answers.push(await w.c.credentialWithdraw({ credential: answers[0].credential.credential, by: "ann" }));
  answers.push(await w.c.credentialsForFetch({ host: "other.example", principalPlane: "member:ann", target: "Q0" }));
  answers.push(await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:ann", target: "Q0" }));
  noLeak(answers.slice(0, -1), SECRET, "every answer but R56's");
  /* R56 alone answers it. */
  assert.equal(answers.at(-1).credentials[0].secret, SECRET);
  /* R56 is not an op: the module exports no op map. */
  const mod = await import("../../../src/capture-sources/credentials.mjs");
  assert.ok(!Object.keys(mod).some((k) => /ops?$/i.test(k)));
});

test("R61: credentials never enter a bundle, a manifest, a snapshot or the record's image", async () => {
  const w = await world();
  await w.supply({ scope: "project", project: "P1", by: "ann" });
  await w.supply({ scope: "group", by: "ann" });
  await w.supply({ scope: "member", by: "ann" });
  for (const b of ["P1", "P2", "Q1", "Q0"]) {
    const image = w.rc.readImage(b);
    noLeak(image, SECRET, `readImage(${b})`);
    assert.ok(!JSON.stringify(image).includes("CRED-"), b);
  }
  const bundleTables = ["files", "history", "manifest", "bundles"].flatMap((t) => w.db.prepare(`SELECT * FROM ${t}`).all());
  assert.ok(!JSON.stringify(bundleTables).includes("CRED-"));
  assert.equal(w.rc.bundleInfo(w.raw()[0].credential_id), null);
});

test("R62: host, scope and project are fixed at supply; the ciphertext is bound to its row, scope and project", async () => {
  const w = await world();
  await w.supply({ scope: "member", by: "bob", secret: "bob-own" });
  const p = (await w.supply({ scope: "project", project: "P1", by: "bob", secret: "p1-shared" })).credential;
  const g = (await w.supply({ scope: "group", by: "bob", secret: "group-shared" })).credential;
  const fixed = () => w.raw().map((r) => [r.credential_id, r.host, r.scope, r.project]);
  const before = fixed();
  w.c.credentialList({ viewer: "admin" });
  await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:bob", target: "Q1" });
  await w.c.credentialWithdraw({ credential: g.credential, by: "bob" });
  assert.deepEqual(fixed(), before);
  /* Moving a row to another scope (as a changed row would be) does not make it usable there: it will not decrypt. */
  w.db.prepare(`UPDATE ${CREDENTIALS_TABLE} SET scope='group', project=NULL WHERE credential_id=?`).run(p.credential);
  const moved = await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:ann", target: "Q0" });
  assert.deepEqual(moved.credentials, []);
  assert.ok(moved.reason.includes(p.credential));
  /* R56 is the only read that answers one for use, and only within its scope: the listing and withdrawal never do. */
  assert.ok(!("secret" in w.c.credentialList({ viewer: "admin" })[0]));
  const m = await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:bob", target: "Q0" });
  assert.equal(m.credentials[0].secret, "bob-own");
  assert.deepEqual((await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:ann", target: "Q1" })).credentials, []);
});

test("R63: who may supply and withdraw at each scope", async () => {
  const w = await world();
  /* Supply: a member's own for anyone active; a project's only by its editors; the group's by any active member. */
  assert.equal((await w.supply({ scope: "member", by: "cy" })).ok, true);
  assert.equal((await w.supply({ scope: "project", project: "P1", by: "ann" })).ok, true);   /* owner */
  assert.equal((await w.supply({ scope: "project", project: "P1", by: "bob" })).ok, true);   /* joined */
  assert.equal(codeOf(await w.supply({ scope: "project", project: "P1", by: "cy" })), "CAPTURE_CREDENTIAL_NOT_PERMITTED");
  assert.equal(codeOf(await w.supply({ scope: "project", project: "P1", by: "second" })), "CAPTURE_CREDENTIAL_NOT_PERMITTED");
  assert.equal((await w.supply({ scope: "group", by: "cy" })).ok, true);
  /* The supplier is always `by`. */
  assert.ok(w.raw().every((r) => ["cy", "ann", "bob"].includes(r.supplied_by)));
  const W = async (credential, by) => codeOf(await w.c.credentialWithdraw({ credential, by })) || "ok";
  const fresh = async (o) => (await w.supply(o)).credential.credential;
  /* member: its supplier or an administrator; never another member. */
  assert.equal(await W(await fresh({ scope: "member", by: "bob" }), "bob"), "ok");
  assert.equal(await W(await fresh({ scope: "member", by: "bob" }), "second"), "ok");
  assert.equal(await W(await fresh({ scope: "member", by: "bob" }), "admin"), "ok");
  assert.equal(await W(await fresh({ scope: "member", by: "bob" }), "ann"), "CAPTURE_CREDENTIAL_NO_SUCH");
  /* project: its supplier or any owner of the project; not another editor, not an administrator. */
  assert.equal(await W(await fresh({ scope: "project", project: "P1", by: "bob" }), "bob"), "ok");
  assert.equal(await W(await fresh({ scope: "project", project: "P1", by: "bob" }), "ann"), "ok");
  assert.equal(await W(await fresh({ scope: "project", project: "P1", by: "ann" }), "bob"), "CAPTURE_CREDENTIAL_NOT_PERMITTED");
  assert.equal(await W(await fresh({ scope: "project", project: "P1", by: "bob" }), "second"), "CAPTURE_CREDENTIAL_NOT_PERMITTED");
  assert.equal(await W(await fresh({ scope: "project", project: "P1", by: "bob" }), "dee"), "CAPTURE_CREDENTIAL_NO_SUCH");
  /* group: its supplier or any administrator. */
  assert.equal(await W(await fresh({ scope: "group", by: "bob" }), "bob"), "ok");
  assert.equal(await W(await fresh({ scope: "group", by: "bob" }), "second"), "ok");
  assert.equal(await W(await fresh({ scope: "group", by: "bob" }), "dee"), "CAPTURE_CREDENTIAL_NOT_PERMITTED");
});

test("R63: a revocation withdraws the member's own credentials at the first read that meets them, and keeps project and group ones", async () => {
  for (const firstRead of ["fetch", "list", "withdraw"]) {
    const w = await world();
    const own = (await w.supply({ scope: "member", by: "bob", secret: "bob-own" })).credential;
    const prj = (await w.supply({ scope: "project", project: "P1", by: "bob", secret: "bob-for-p1" })).credential;
    const grp = (await w.supply({ scope: "group", by: "bob", secret: "bob-for-group" })).credential;
    w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
    if (firstRead === "fetch") {
      const a = await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:bob", target: "Q1" });
      assert.equal(a.credentials[0].credential, prj.credential, firstRead);   /* never the member's own */
    } else if (firstRead === "list") w.c.credentialList({ viewer: "admin" });
    else assert.equal((await w.c.credentialWithdraw({ credential: own.credential, by: "admin" })).already, true);
    const row = w.raw().find((r) => r.credential_id === own.credential);
    assert.deepEqual([row.ciphertext, row.iv, row.withdrawn_by, typeof row.withdrawn_at], [null, null, REVOCATION, "string"], firstRead);
    const kept = w.raw().filter((r) => r.credential_id !== own.credential);
    assert.ok(kept.every((r) => r.withdrawn_at === null && typeof r.ciphertext === "string"), firstRead);
    assert.equal((await w.c.credentialsForFetch({ host: HOST, principalPlane: "member:ann", target: "Q0" })).credentials[0].credential, grp.credential);
  }
  /* REVOCATION is a string no member id can be. */
  assert.equal(principalMember(REVOCATION), null);
});

test("R63: purge clears project credentials with their project and never member or group ones", async () => {
  const w = await world();
  const p1 = (await w.supply({ scope: "project", project: "P1", by: "ann" })).credential;
  const p2 = (await w.supply({ scope: "project", project: "P2", by: "dee" })).credential;
  const m = (await w.supply({ scope: "member", by: "ann" })).credential;
  const g = (await w.supply({ scope: "group", by: "ann" })).credential;
  const held = () => w.raw().map((r) => r.credential_id).sort();
  const one = w.rc.purge({ bundleId: "P1" });
  assert.equal(one.removed[CREDENTIALS_TABLE], 1);
  assert.deepEqual(held(), [p2.credential, m.credential, g.credential].sort());
  const all = w.rc.purge({});
  assert.equal(all.removed[CREDENTIALS_TABLE], 1);
  assert.deepEqual(held(), [m.credential, g.credential].sort());
  void p1;
});

test("R47: the credentials are the one store this module has, declared to record-core's purge as its own", async () => {
  const w = await world();
  /* A second declaration of the table by anyone is refused: capture-sources declared it. */
  const again = w.rc.declarePurge("someone-else", [CREDENTIALS_TABLE]);
  assert.deepEqual([again.ok, again.reason, again.declaredBy], [false, "TABLE_DECLARED", "capture-sources"]);
  /* One store per storage: a second call answers the same instance, whatever it passes. */
  assert.equal(credentialsOf({ storage: w.storage }, { key: "another" }), w.c);
});

test("R55, R56: the host and principal readers", () => {
  assert.equal(hostNameOf("Records.Example.GOV"), HOST);
  for (const h of ["", "a b", "x:1", "x/y", "u@x", "-x.example", "x..y", ".x", "x.", null, 5, "a".repeat(64) + ".example"]) assert.equal(hostNameOf(h), null, String(h));
  assert.deepEqual(["member:ann", "ann", "member:ann/tok", "class:daemon", "organisation/tok", "", null, "member:", "Member:ann"].map(principalMember),
    ["ann", "ann", "ann", null, null, null, null, null, null]);
});
