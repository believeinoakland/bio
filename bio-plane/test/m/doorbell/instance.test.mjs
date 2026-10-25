/* doorbell: the one instance per storage and its tables (R25), the purge exemption of the inbox and the two keys (R12,
   R14, moved from capture's `figures.test.mjs`), and the bounded inbox read (R3 with N90, moved from capture's
   `reads.test.mjs`), at the module's interface: `doorbellOf` over a fresh store with record-core, membership,
   credentials and capture as the host builds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, provenance, fresh, bucket, H } from "./fixture.mjs";
import { doorbellOf, doorbellOps, Doorbell, DOORBELL_EXEMPT_TABLES, READ_LIMIT } from "../../../src/doorbell/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { CAPTURE_EXEMPT_TABLES, CAPTURE_PURGED_TABLES } from "../../../src/capture/schema.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { tableDeclarationRefusals } from "../record-core/fixtures.mjs";

const SIX = ["inbox", "knock_rate", "knock_key", "knocker_key", "doorbell_tally", "doorbell_limit_last"];

/* A host as the plane builds one: record-core, membership and credentials migrated; capture made by its factory. */
function host({ migrateCapture = true, env = null } = {}) {
  const ctx = { storage: storage() };
  const record = recordOf(ctx);
  record.migrate();
  membershipOf(ctx, { record }).migrate();
  credentialsOf(ctx, { record }).migrate();
  const cap = captureOf(ctx, { record, governor: {}, provenance: provenance(ctx.storage), env });
  if (migrateCapture) cap.migrate();
  return { ctx, record, cap, s: ctx.storage, tables: () => ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name) };
}
const declared = (record) => Object.fromEntries(record.declaredTables().filter((d) => SIX.includes(d.name)).map((d) => [d.name, [d.module, d.purge]]));

test("R25 (K61): doorbellOf answers one instance per storage, whoever asks and however often; another storage gets its own", () => {
  const h = host();
  const d = doorbellOf(h.ctx);
  assert.ok(d instanceof Doorbell);
  assert.equal(doorbellOf(h.ctx), d, "the same ctx");
  assert.equal(doorbellOf(h.s), d, "the storage itself");
  assert.equal(doorbellOf({ storage: h.s }, { capture: {} }), d, "a later caller's deps change nothing: the instance stands");
  assert.notEqual(doorbellOf(host().ctx), d, "negative control: another storage, another instance");
});

/* T43 (N851, N864; K2689, K2710): this module owns its six tables; since capture's delete no other module declares them. */
test("R25: at its creation it creates its six tables with capture's DDL and declares them exempt from purge, as their owner", () => {
  /* capture migrated first, as the plane migrates it: the six are this module's, every one exempt */
  const h = host();
  const d = doorbellOf(h.ctx);
  for (const t of SIX) assert.ok(h.tables().includes(t), t);
  assert.deepEqual([...DOORBELL_EXEMPT_TABLES].sort(), [...SIX].sort());
  assert.deepEqual(declared(h.record), Object.fromEntries(SIX.map((t) => [t, ["doorbell", "exempt"]])), "held by doorbell, every one exempt");
  assert.equal(d.declareTables(), false, "asked again, nothing more is declared");
  /* doorbell made before capture's migrate (the plane builds both before it migrates): capture's own migrate after it
     declares capture's own tables without throwing, and the six stay this module's */
  const early = host({ migrateCapture: false });
  doorbellOf(early.ctx);
  for (const t of SIX) assert.ok(early.tables().includes(t), `${t}, made at doorbell's creation`);
  assert.doesNotThrow(() => early.cap.migrate(), "capture's migrate after doorbell's creation");
  assert.deepEqual(declared(early.record), Object.fromEntries(SIX.map((t) => [t, ["doorbell", "exempt"]])));
  const captures = early.record.declaredTables().filter((x) => x.module === "capture").map((x) => x.name).sort();
  assert.deepEqual(captures, [...CAPTURE_EXEMPT_TABLES, ...CAPTURE_PURGED_TABLES].sort(), "capture declared its own tables, every one");
  assert.ok(!captures.some((t) => SIX.includes(t)), "and none of the six");
  /* with no copy declaring them (capture's delete, T43): doorbell holds them itself, exempt */
  const alone = host({ migrateCapture: false });
  const bare = new Doorbell(alone.s, { capture: { env: {} }, record: alone.record });
  bare.migrate();
  assert.deepEqual(declared(alone.record), Object.fromEntries(SIX.map((t) => [t, ["doorbell", "exempt"]])));
});

test("R25: any other refusal of the declaration throws, naming the table, before the caller gets an instance", () => {
  const h = host({ migrateCapture: false });
  /* another module (not capture) already holds the inbox: TABLE_DECLARED by someone else is a defect of the wiring */
  assert.notEqual(h.record.declarePurge("someone-else", ["inbox"])?.ok, false, "another module holds the inbox");
  const lone = { env: {}, core: h.record };
  assert.throws(() => doorbellOf(h.ctx, { capture: lone }), /doorbell: record-core refused its purge declaration: TABLE_DECLARED \(inbox\)/);
  /* nothing was handed out: the next caller is refused alike, never given a half-made instance */
  assert.throws(() => doorbellOf(h.ctx, { capture: lone }), /TABLE_DECLARED \(inbox\)/);
  /* any other refusal of record-core's, by its reason */
  const s = storage();
  /* record-core's own refusals, as its published fixture makes them (K5044) */
  const refusals = tableDeclarationRefusals("inbox", { by: "capture" });
  const refusing = { declarePurge: () => refusals.invalidName, transact: (fn) => fn() };
  assert.throws(() => new Doorbell(s, { capture: { env: {} }, record: refusing }).migrate(), new RegExp(`${refusals.invalidName.reason} \\(${refusals.invalidName.table}\\)`));
  /* T43 (N864): no held arm: a TABLE_DECLARED naming capture throws alike */
  assert.equal(refusals.declaredAgainByPurge.declaredBy, "capture");
  const held = { declarePurge: () => refusals.declaredAgainByPurge, transact: (fn) => fn() };
  assert.throws(() => new Doorbell(storage(), { capture: { env: {} }, record: held }).migrate(), /TABLE_DECLARED \(inbox\)/);
  /* negative control: an admitted declaration makes the instance */
  const admits = { declarePurge: () => ({ ok: true }), transact: (fn) => fn() };
  assert.doesNotThrow(() => new Doorbell(storage(), { capture: { env: {} }, record: admits }).migrate());
});

/* The six tables' columns as `capture` created them before T43 (its `schema.mjs` at T42's close): name, type, not null,
   default, primary key. A running store holds them so; this module's DDL must read the same. */
const AS_CAPTURE_MADE_THEM = {
  inbox: [["knock_id","TEXT",0,null,1],["sha256","TEXT",1,null,0],["bytes","INTEGER",1,null,0],["content","TEXT",0,null,0],["in_r2","INTEGER",1,"0",0],
          ["note","TEXT",0,null,0],["contact","TEXT",0,null,0],["received","TEXT",1,null,0],["status","TEXT",1,"'new'",0],["resolved","TEXT",0,null,0],
          ["resolved_by","TEXT",0,null,0],["resolve_reason","TEXT",0,null,0],["knocker_digest","TEXT",0,null,0],["pseudonym","TEXT",0,null,0],
          ["capture_sha","TEXT",0,null,0],["pulled_by","TEXT",0,null,0],["pulled_at","TEXT",0,null,0],["pulled_document","TEXT",0,null,0],
          ["content_b64","TEXT",0,null,0],
          /* R27 (T51): the two columns a knock's stated name and type gained, additive and null on every older row */
          ["file_name","TEXT",0,null,0],["media_type","TEXT",0,null,0]],
  knock_rate: [["bucket","TEXT",0,null,1],["count","INTEGER",1,null,0]],
  knock_key: [["id","INTEGER",0,null,1],["key_hex","TEXT",1,null,0],["created","TEXT",1,null,0]],
  knocker_key: [["id","INTEGER",0,null,1],["key_hex","TEXT",1,null,0],["created","TEXT",1,null,0]],
  doorbell_tally: [["day","TEXT",0,null,1],["refused","INTEGER",1,"0",0],["limit_reached","INTEGER",1,"0",0]],
  doorbell_limit_last: [["id","INTEGER",0,null,1],["day","TEXT",1,null,0]],
};
const columns = (s, t) => s.sql.exec(`PRAGMA table_info(${t})`).map((r) => [r.name, r.type, r.notnull, r.dflt_value, r.pk]);

test("R25: a running store's inbox, keys and tally are kept as they are, with no data move: the rows a store already holds are doorbell's rows", async () => {
  /* a running store: rows written before this instance (a doorbell over it before a restart, or capture's copy before
     T43, by the same DDL), then a fresh instance over the same storage */
  const h = host({ env: { CAPTURES: bucket() } });
  const SECRET = "a knocker secret of twenty-plus";
  const first = new Doorbell(h.s, { capture: h.cap, record: null }); /* the earlier instance: its own isolate, no declaration here */
  first.migrate();
  const before = await first.knock({ content: "an old knock", sourceAddress: "198.51.100.1", knockerSecret: SECRET });
  assert.equal(before.ok, true);
  first.doorbellRefused({ country: "NZ" });
  const fp = await first.sourceFingerprint("198.51.100.1");
  const rows = () => SIX.map((t) => [t, JSON.stringify(h.s.sql.exec(`SELECT * FROM ${t}`))]);
  const held = rows();
  const d = doorbellOf(h.ctx);
  assert.notEqual(d, first);
  assert.deepEqual(rows(), held, "creation moved, cleared or re-wrote nothing");
  assert.equal(d.inboxGet(before.knockId).item.sha256, before.sha256, "the same row, read by the doorbell");
  assert.equal(await d.sourceFingerprint("198.51.100.1"), fp, "the same instance key");
  assert.equal((await d.knockerDigestOf(SECRET)).pseudonym, before.pseudonym, "the same knocker key");
  assert.equal(d.doorbellTally({ viewer: "member:m1" }).days[0].refused, 1, "the same tally");
  /* an older store whose inbox lacks the additive columns gains them, keeping its rows */
  const old = storage();
  old.db.exec(`CREATE TABLE inbox (knock_id TEXT PRIMARY KEY, sha256 TEXT NOT NULL, bytes INTEGER NOT NULL, content TEXT,
               in_r2 INTEGER NOT NULL DEFAULT 0, note TEXT, contact TEXT, received TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
               resolved TEXT, resolved_by TEXT)`);
  old.db.exec(`INSERT INTO inbox (knock_id, sha256, bytes, received) VALUES ('KNOCK-old', '${H("1")}', 1, '2026-01-01T00:00:00Z')`);
  new Doorbell(old, { capture: { env: {} }, record: null }).migrate();
  const cols = old.sql.exec(`PRAGMA table_info(inbox)`).map((r) => r.name);
  for (const c of ["knocker_digest", "pseudonym", "capture_sha", "pulled_by", "pulled_at", "pulled_document", "content_b64", "resolve_reason", "file_name", "media_type"])
    assert.ok(cols.includes(c), c);
  assert.equal(old.sql.exec(`SELECT count(*) n FROM inbox`)[0].n, 1, "the row kept");
  /* the DDL is capture's, with R27's two additive columns on the inbox: each of the six tables' columns read as capture made them */
  const viaDoorbell = storage();
  new Doorbell(viaDoorbell, { capture: { env: {} }, record: null }).migrate();
  for (const t of SIX) assert.deepEqual(columns(viaDoorbell, t), AS_CAPTURE_MADE_THEM[t], t);
  /* negative control: a table made otherwise reads otherwise */
  const other = storage();
  other.db.exec(`CREATE TABLE knock_rate (bucket TEXT PRIMARY KEY, count INTEGER)`);
  assert.notDeepEqual(columns(other, "knock_rate"), AS_CAPTURE_MADE_THEM.knock_rate);
});

test("R25 (the map's doubt 5): its env is capture's for the same storage, read at each use; it takes no env of its own", async () => {
  const h = host();
  const d = doorbellOf(h.ctx, { env: { KNOCK_FINGERPRINT_KEY: "ignored" } });
  assert.equal(d.env, h.cap.env, "capture's env");
  /* an env capture adopts later (capture R58) is the doorbell's at its next use */
  captureOf(h.ctx, { env: { KNOCK_FINGERPRINT_KEY: "operator-secret", INSTANCE_NAME: "inst" } });
  assert.equal(d.env.KNOCK_FINGERPRINT_KEY, "operator-secret");
  const { createHmac } = await import("node:crypto");
  assert.equal(await d.sourceFingerprint("203.0.113.1"), createHmac("sha256", "operator-secret").update("203.0.113.1").digest("hex").slice(0, 32),
               "the bound key, read from capture's env at the use");
  assert.equal(h.tables().includes("knock_key") && h.s.sql.exec(`SELECT count(*) n FROM knock_key`)[0].n, 0, "no instance key made");
});

test("R12 R14 R25: the doorbell's two keys and the inbox are exempt from purge: a whole-store purge leaves them, so a source's fingerprint and a knocker's pseudonym read the same after it", async () => {
  const h = host();
  const d = doorbellOf(h.ctx);
  const SECRET = "a knocker secret long enough to keep";
  const k = await d.knock({ content: "kept", sourceAddress: "198.51.100.7", knockerSecret: SECRET });
  assert.equal(k.ok, true);
  const fp = await d.sourceFingerprint("198.51.100.7");
  await h.cap.taskEnqueue({ captureSha: H("5"), subject: "s" });
  d.doorbellRefused({ country: "NZ" });
  const keys = () => h.s.sql.exec(`SELECT (SELECT key_hex FROM knock_key) a, (SELECT key_hex FROM knocker_key) b`)[0];
  const before = { ...keys() };
  assert.ok(before.a && before.b, "both keys were generated at first use");
  const kept = () => SIX.map((t) => [t, JSON.stringify(h.s.sql.exec(`SELECT * FROM ${t}`))]);
  const rows = kept();
  h.record.purge({});
  assert.equal(h.s.sql.exec(`SELECT count(*) n FROM task_queue`)[0].n, 0, "negative control: a purged table is cleared");
  assert.deepEqual({ ...keys() }, before, "neither key is purged");
  assert.deepEqual(kept(), rows, "the inbox, the rate, the tally and the keys kept whole");
  assert.equal(await d.sourceFingerprint("198.51.100.7"), fp, "the same source, the same fingerprint");
  assert.equal((await d.knockerDigestOf(SECRET)).pseudonym, k.pseudonym, "the same secret, the same pseudonym");
});

/* Every row once, in order, by following `next` from the first page; each page at most `limit` and flagged. */
function pages(read, limit) {
  const seen = [];
  let after = null;
  for (let n = 0; n < 1000; n++) {
    const p = read({ limit, after });
    assert.equal(p.limit, limit);
    seen.push(p);
    if (!p.truncated) { assert.equal(p.next, null); break; }
    after = p.next;
  }
  return seen;
}
const route = (c, name, qs = "", body = null) => doorbellOps(c, new URL(`http://x/${name}?${qs}`), body)[name]();

test("R3 (N90): inboxList lists at most `limit` knocks newest first, paged by `after` over every knock once, by status too; a route that names no limit is bounded", async () => {
  const { c } = fresh({ evidence: bucket() });
  const W = 600000;
  for (let i = 0; i < 205; i++)
    await c.knock({ content: `k${i}`, sourceAddress: `s${i}`, perIpLimit: 1e9, globalLimit: 1e9, now: W * 10 + i * 1000 });
  const first = route(c, "inboxlist");
  assert.deepEqual([first.inbox.length, first.limit, first.truncated], [READ_LIMIT.default, READ_LIMIT.default, true]);
  const rest = route(c, "inboxlist", `after=${encodeURIComponent(first.next)}`);
  assert.deepEqual([rest.inbox.length, rest.truncated, rest.next], [5, false, null]);
  const ids = [...first.inbox, ...rest.inbox].map((k) => k.knock_id);
  assert.equal(new Set(ids).size, 205, "every knock once");
  const received = [...first.inbox, ...rest.inbox].map((k) => k.received);
  assert.deepEqual(received, [...received].sort().reverse(), "newest first");
  const k0 = c.inboxList(null, { limit: 205 }).inbox.at(-1);
  await c.inboxResolve({ knockId: k0.knock_id, status: "pulled", by: "member:m", reason: "brought in" });
  const pulled = pages((p) => c.inboxList("pulled", p), 1);
  assert.deepEqual(pulled.flatMap((p) => p.inbox.map((k) => k.knock_id)), [k0.knock_id]);
  assert.equal(c.inboxList("new", { limit: 1000 }).inbox.length, 204);
  assert.equal(c.inboxList(null, { limit: 5000 }).limit, READ_LIMIT.max, "a limit past the bound is clamped");
  assert.equal(c.inboxList(null, { after: "nope" }).reason, "BAD_CURSOR");
});
