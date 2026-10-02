/* public-read — R18 (DEC-111; `network-notices` R10, R20, R21): a later module registers once at start a set of named,
   credential-free reads served on the public path (K31's pattern, as R8); each is served under R10's terms; a second
   registration of one name is refused, the first standing; an unregistered name says that it is not registered.
   Driven at the module's interface: `registerPublicReads`, `publicRead` and its store op `publicread` (`publicReadOps`)
   over a real world, and the door (`publicReadDoorOp`, `publicReadDoorRead`) over the published store's stub, with the
   plane's helpers bound as `control-plane` R23 and R25 state them. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket } from "./fixture.mjs";
import { publicReadDoorOp, publicReadDoorRead } from "../../../src/public-read/door.mjs";
import { PUBLIC_READ_RESERVED_PARAMS, PUBLIC_READ_OWN_OPS } from "../../../src/public-read/reads.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
async function doAnswer(res) {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  const correlation = out.reason === "STORE_INTERNAL_ERROR" && typeof out.correlation === "string" && UUID.test(out.correlation)
    ? out.correlation : undefined;
  return correlation ? { answered: false, result: undefined, correlation } : { answered: false, result: undefined };
}
const storeRefusal = (out, extra = {}) => json({ ...out.reply.body, ...extra }, out.reply.status);
const storeSilent = (op, correlation = undefined) =>
  json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op, detail: "the store did not answer", correlation }, 502);
const requiredArgument = (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const HELPERS = { json, requiredArgument, storeSilent, storeRefusal, doAnswer };

/* What a stranger's request can carry that is no read's business: a credential, a session, every stamp. */
const CREDENTIALED = { token: "op-token-secret", viewer: "member:olive", by: "member:olive", identity: "olive",
                       author: "member:olive", secret: "s3cret", session: "sess-1", aiCred: "ai-1", principal: "p" };

/* A world with a published case on it, and a read that reports exactly what it was handed. */
function served() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry("INQ-2026-0001");
  const pin = w.head("INQ-2026-0001");
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: "INQ-2026-0001", version_sha: pin }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: "INQ-2026-0001", version_sha: pin }] });
  w.signFinding("INQ-2026-0001");
  const handed = [];
  const reg = w.pr.registerPublicReads("network-notices", {
    noticespublic: { params: ["after", "limit"], read: (args) => { handed.push(args); return { items: [], args: { ...args } }; } },
    groupkeyspublic: () => ({ slug: "parks-group", owners: [], copy: [] }),
    activitymethod: { read: async () => ({ version: 1, text: "the method" }) },
  });
  return { w, reg, handed, env: { PUBLISHED: bucket() } };
}
/* The door is handed the URL, never the request's headers, so nothing of them can reach the store. */
const door = (w, env, op, q = {}, helpers = HELPERS) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publicReadDoorOp(op, url, env, stubOf(w), helpers);
};

test("R18 R10 a registered read is served on the public path with no credential: at the store op and through the door, handed only the parameters it declared", async () => {
  const { w, reg, handed, env } = served();
  assert.deepEqual(reg, { ok: true, module: "network-notices", names: ["noticespublic", "groupkeyspublic", "activitymethod"] });
  assert.deepEqual(w.pr.publicReads(), [
    { name: "activitymethod", module: "network-notices", params: [] },
    { name: "groupkeyspublic", module: "network-notices", params: [] },
    { name: "noticespublic", module: "network-notices", params: ["after", "limit"] }]);
  /* the store op: every credential and stamp the caller sent is dropped; an undeclared parameter is dropped too */
  const a = w.read("publicread", { name: "noticespublic", after: "3", limit: "50", other: "x", ...CREDENTIALED });
  assert.deepEqual(a, { ok: true, read: "noticespublic", module: "network-notices", result: { items: [], args: { after: "3", limit: "50" } } });
  assert.equal(Object.isFrozen(handed[0]), true, "the read is handed a frozen copy");
  /* negative control: a declared parameter the caller did not send is absent, never filled */
  assert.deepEqual(w.read("publicread", { name: "noticespublic" }).result.args, {});
  /* through the door, with no credential, the answer at 200 */
  const r = await door(w, env, "publicread", { name: "noticespublic", after: "7", ...CREDENTIALED });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, read: "noticespublic", module: "network-notices", result: { items: [], args: { after: "7" } } });
  const text = JSON.stringify(handed);
  for (const v of Object.values(CREDENTIALED)) assert.equal(text.includes(v), false, `${v} reached a read`);
  /* a read with no parameters, and one answering a promise, are served too */
  assert.deepEqual(await (await door(w, env, "publicread", { name: "groupkeyspublic", token: "t" })).json(),
                   { ok: true, read: "groupkeyspublic", module: "network-notices", result: { slug: "parks-group", owners: [], copy: [] } });
  assert.deepEqual((await (await door(w, env, "publicread", { name: "activitymethod" })).json()).result, { version: 1, text: "the method" });
  /* by its own op where the door names it (op-declarations declares it `classes: null`; control-plane R45 routes it) */
  const own = await door(w, env, "noticespublic", { after: "9", viewer: "member:olive" }, { ...HELPERS, publicReads: ["noticespublic"] });
  assert.deepEqual([own.status, (await own.json()).result.args], [200, { after: "9" }]);
  /* negative control: a name the door is not told of is not its own op */
  assert.equal(await door(w, env, "noticespublic", {}, HELPERS), null);
  assert.equal(await door(w, env, "verify", { sha256: "0".repeat(64) }, { ...HELPERS, publicReads: ["verify"] }).then((x) => x.status), 200,
               "the module's own op is never shadowed by a read's name");
  /* the store's working record is untouched by registering and serving (R16) */
  const before = JSON.stringify(w.snapshot());
  w.read("publicread", { name: "noticespublic" });
  await door(w, env, "publicread", { name: "groupkeyspublic" });
  assert.equal(JSON.stringify(w.snapshot()), before);
});

test("R18 R10 no registered read can declare a credential or a stamp, and the door forwards none: the store is asked with only the read's own query and no header", async () => {
  const { w } = served();
  for (const p of ["token", "viewer", "by", "secret", "session", "aiCred", "name", "op"]) {
    const r = w.pr.registerPublicReads("network-notices", { [`x${p.toLowerCase()}`]: { params: [p], read: () => ({}) } });
    assert.equal(r.reason, "PROVIDER_MALFORMED", p);
    assert.match(r.problems.join(" "), new RegExp(`declares ${p}`), p);
  }
  assert.ok(PUBLIC_READ_RESERVED_PARAMS.includes("token") && PUBLIC_READ_RESERVED_PARAMS.includes("viewer"));
  /* what the door asks the store: the read's name and the caller's own parameters, never a reserved one, no header */
  const asked = [];
  const spy = { async fetch(req) { asked.push(req); return Response.json({ ok: true, result: { ok: true, read: "noticespublic", module: "m", result: 1 } }); } };
  const url = new URL("https://plane/?op=publicread&name=noticespublic&after=2");
  for (const [k, v] of Object.entries(CREDENTIALED)) url.searchParams.set(k, v);
  const r = await publicReadDoorOp("publicread", url, {}, spy, HELPERS);
  assert.equal(r.status, 200);
  const sent = new URL(asked[0].url);
  assert.deepEqual([sent.pathname, [...sent.searchParams]], ["/publicread", [["name", "noticespublic"], ["after", "2"]]]);
  assert.deepEqual([...asked[0].headers], [], "no header reaches the store");
  /* the published store only: the door reads the store it is handed (the plane hands `bio`'s, R10), and nothing else */
  assert.equal(asked.length, 1);
});

test("R18 a second registration of one name is refused, naming who holds it; the first stands and nothing of the second is registered", async () => {
  const { w, env, handed } = served();
  const second = w.pr.registerPublicReads("impostor", { noticespublic: () => ({ items: ["forged"] }), freshname: () => ({}) });
  assert.deepEqual([second.ok, second.reason, second.taken], [false, "PROVIDER_DECLARED", [{ name: "noticespublic", module: "network-notices" }]]);
  assert.match(second.detail, /noticespublic is already registered by network-notices/);
  /* the first stands: the same read answers, the forgery never */
  const a = w.read("publicread", { name: "noticespublic", after: "1" });
  assert.deepEqual([a.module, a.result.items, handed.length], ["network-notices", [], 1]);
  /* all or nothing: the fresh name in the refused registration is not registered */
  assert.equal(w.read("publicread", { name: "freshname" }).reason, "PUBLIC_READ_NOT_REGISTERED");
  assert.deepEqual(w.pr.publicReads().map((r) => r.name), ["activitymethod", "groupkeyspublic", "noticespublic"]);
  /* the same module registering the name again is refused alike */
  assert.equal(w.pr.registerPublicReads("network-notices", { noticespublic: () => 1 }).reason, "PROVIDER_DECLARED");
  /* through the door, still the first */
  assert.deepEqual((await (await door(w, env, "publicread", { name: "noticespublic" })).json()).module, "network-notices");
  /* negative control: a fresh name, alone, registers */
  assert.deepEqual(w.pr.registerPublicReads("impostor", { freshname: () => 2 }), { ok: true, module: "impostor", names: ["freshname"] });
  assert.equal(w.read("publicread", { name: "freshname" }).result, 2);
});

test("R18 a malformed registration is refused whole, naming what is wrong, and registers nothing", () => {
  const w = world();
  const bad = [
    ["", { okname: () => 1 }, /names no module/],
    ["m", {}, /names no read/],
    ["m", null, /names no read/],
    ["m", { "Bad-Name": () => 1 }, /is not a read's name/],
    ["m", { verify: () => 1 }, /this module's own op/],
    ["m", { publicread: () => 1 }, /this module's own op/],
    ["m", { okname: null }, /has no read function/],
    ["m", { okname: { params: "after", read: () => 1 } }, /params is not a list/],
    ["m", { okname: { params: ["after", "after"], read: () => 1 } }, /a parameter twice/],
    ["m", { okname: { params: ["1x"], read: () => 1 } }, /a malformed parameter/],
  ];
  for (const [mod, reads, why] of bad) {
    const r = w.pr.registerPublicReads(mod, reads);
    assert.equal(r.reason, "PROVIDER_MALFORMED", String(why));
    assert.match(r.problems.join("; "), why);
  }
  /* all or nothing: one good read beside a bad one is not registered */
  assert.equal(w.pr.registerPublicReads("m", { goodread: () => 1, "BAD": () => 1 }).reason, "PROVIDER_MALFORMED");
  assert.deepEqual(w.pr.publicReads(), []);
  for (const own of PUBLIC_READ_OWN_OPS) assert.equal(w.pr.registerPublicReads("m", { [own]: () => 1 }).reason, "PROVIDER_MALFORMED", own);
});

test("R18 R17 an unregistered name says that it is not registered, with its row C-98.10, at the store and through the door (404); a malformed name is the argument refusal (400)", async () => {
  const { w, env } = served();
  const none = w.read("publicread", { name: "nosuchread" });
  assert.deepEqual([none.ok, none.reason, none.code, none.check, none.name], [false, "PUBLIC_READ_NOT_REGISTERED", "PUBLIC_READ_NOT_REGISTERED", "C-98.10", "nosuchread"]);
  assert.equal(none.translation, "This copy of the record offers no public read by that name. Nothing was changed.");
  assert.match(none.detail, /no public read named "nosuchread" is registered/);
  const r = await door(w, env, "publicread", { name: "nosuchread" });
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), none);
  /* a fresh world, with nothing registered, says the same of every name */
  const fresh = world();
  assert.equal(fresh.read("publicread", { name: "noticespublic" }).reason, "PUBLIC_READ_NOT_REGISTERED");
  assert.equal(fresh.read("publicread", {}).reason, "PUBLIC_READ_NOT_REGISTERED");
  /* negative control: the registered name, beside it, answers */
  assert.equal((await door(w, env, "publicread", { name: "noticespublic" })).status, 200);
  for (const bad of ["", "Notices", "notices-public", "x".repeat(65)]) {
    const b = await door(w, env, "publicread", { name: bad });
    assert.equal(b.status, 400, bad);
    assert.deepEqual((({ reason, op, argument }) => [reason, op, argument])(await b.json()), ["REQUIRED_ARGUMENT_MISSING", "publicread", "name"], bad);
  }
  /* the read's own direct entry agrees */
  assert.equal((await publicReadDoorRead("nosuchread", new URL("https://plane/"), env, stubOf(w), HELPERS)).status, 404);
});

test("R18 R9 a read's own refusal is relayed as its refusal (400), naming the read; a read that throws is never answered as an absence", async () => {
  const { w, env } = served();
  w.pr.registerPublicReads("m", { refuses: { params: ["limit"], read: ({ limit }) => ({ ok: false, reason: "LIMIT_OUT_OF_RANGE", limit }) },
                                  throws: () => { throw new Error("boom at index.mjs:1"); } });
  const s = w.read("publicread", { name: "refuses", limit: "5000" });
  assert.deepEqual(s, { ok: false, reason: "LIMIT_OUT_OF_RANGE", limit: "5000", read: "refuses", module: "m" });
  const d = await door(w, env, "publicread", { name: "refuses", limit: "5000" });
  assert.deepEqual([d.status, await d.json()], [400, s]);
  /* a throw is not caught as "not registered": it reaches the store's own internal-error answer (control-plane R25) */
  assert.throws(() => w.pr.publicRead("throws", {}), /boom/);
  const silent = await publicReadDoorOp("publicread", new URL("https://plane/?op=publicread&name=throws"), env,
    { async fetch() { return Response.json({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: "0f0e0d0c-0b0a-4908-8706-050403020100" }, { status: 500 }); } },
    HELPERS);
  const sb = await silent.json();
  assert.deepEqual([silent.status, sb.reason, sb.op, sb.correlation], [502, "STORE_DID_NOT_ANSWER", "publicread", "0f0e0d0c-0b0a-4908-8706-050403020100"]);
  assert.doesNotMatch(JSON.stringify(sb), /boom/);
  /* an answer with nothing in it is a silence, never a claim */
  const empty = await publicReadDoorOp("publicread", new URL("https://plane/?op=publicread&name=refuses"), env,
    { async fetch() { return Response.json({ ok: true, result: null }); } }, HELPERS);
  assert.deepEqual([empty.status, (await empty.json()).reason], [502, "STORE_DID_NOT_ANSWER"]);
  /* a read answering nothing is stated as a null result, never as an absence of the read */
  w.pr.registerPublicReads("m", { nothing: () => undefined });
  assert.deepEqual(w.read("publicread", { name: "nothing" }), { ok: true, read: "nothing", module: "m", result: null });
});
