/* doorbell: its routes (`doorbellOps`, the nine `captureOps` carried, the map's §2), the public door's dispatch
   (`doorbellPublicOp`, moved from capture's `ops.test.mjs`), and R13's over-strictness arm: a pull changes nothing of a
   plain capture's, byte for byte. At the module's interface; the control plane's helpers are stand-ins. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { doorbellOps, READ_LIMIT } from "../../../src/doorbell/index.mjs";
import { doorbellPublicOp } from "../../../src/doorbell/door.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const h = { json, doAnswer, storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
            requiredArgument: (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }) };
const stubOf = (c) => ({ calls: [], async fetch(req) {
  const url = new URL(req.url); this.calls.push(url.pathname + url.search);
  const body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
  return json({ ok: true, result: await doorbellOps(c, url, body)[url.pathname.slice(1)]() });
} });
const route = (c, name, qs = "", body = null) => doorbellOps(c, new URL(`http://x/${name}?${qs}`), body)[name]();

test("R1 R3 R13 R15 R18 R19: the module's routes are the nine the doorbell's ops reach, each answering what its service answers, its stamps from the query", async () => {
  const { c, rows } = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  assert.deepEqual(Object.keys(doorbellOps(c, new URL("http://x/"), null)).sort(),
                   ["doorbellrefused", "doorbelltally", "inboxget", "inboxlist", "inboxpull", "inboxresolve", "knock", "knocksof", "pulledknocks"]);
  /* knock: the source and the country are the control plane's stamps, never the body's */
  const k = await route(c, "knock", "source=198.51.100.1&country=NZ", { content: "a tip", sourceAddress: "forged", country: "XX",
                                                                        knockerSecret: "a knocker secret of twenty-plus" });
  assert.equal(k.ok, true);
  const fp = await c.sourceFingerprint("198.51.100.1");
  assert.ok(rows(`SELECT bucket FROM knock_rate`).some((x) => x.bucket.includes(fp)), "counted under the stamped source");
  assert.deepEqual(rows(`SELECT country, sum(count) n FROM security_counts GROUP BY country`).map((x) => x.country), [], "an accepted knock is not counted");
  assert.deepEqual(route(c, "inboxget", `id=${k.knockId}`), c.inboxGet(k.knockId));
  assert.deepEqual(route(c, "inboxlist", "status=new"), c.inboxList("new"));
  assert.equal(route(c, "inboxlist").limit, READ_LIMIT.default, "a route that names no limit is bounded");
  assert.deepEqual(route(c, "knocksof", `pseudonym=${encodeURIComponent(k.pseudonym)}`).knocks.map((x) => x.knock_id), [k.knockId]);
  const pulled = await route(c, "inboxpull", "by=m1", { knockId: k.knockId, by: "forged" });
  assert.deepEqual([pulled.ok, pulled.pulled_by], [true, "m1"], "the stamp wins over the body's by");
  assert.deepEqual(route(c, "pulledknocks", `capture=${sha("a tip")}`).map((x) => x.knock_id), [k.knockId]);
  assert.deepEqual(route(c, "doorbellrefused", "country=FR", { now: Date.parse("2026-10-11T00:00:00Z"), country: "XX" }), { counted: true });
  const tally = route(c, "doorbelltally", "viewer=member:m1");
  assert.equal(tally.ok, true);
  assert.equal(route(c, "doorbelltally").reason, "MEMBER_SESSION_REQUIRED", "no stamped viewer reads nothing");
  const k2 = await route(c, "knock", "source=198.51.100.2", { content: "second" });
  assert.equal(route(c, "inboxresolve", "", { knockId: k2.knockId, status: "discarded", by: "m1", reason: "spam" }).ok, true);
});

test("R1 R10 R11: doorbellPublicOp dispatches the one public op, knock, with no token and no session, and answers null for any other op", async () => {
  const f = fresh({ evidence: bucket() });
  const st = stubOf(f.c);
  const k = await doorbellPublicOp("knock", new Request("https://p/?op=knock", { method: "POST", headers: { "cf-connecting-ip": "203.0.113.4" },
                                                                               body: JSON.stringify({ contentText: "a tip" }) }), f.c.env, st, h);
  assert.deepEqual([k.status, (await k.json()).sha256], [200, sha("a tip")]);
  assert.deepEqual(st.calls, ["/knock?source=203.0.113.4"]);
  for (const op of ["inboxlist", "inboxpull", "doorbelltally", "capture", "acquire", "", undefined])
    assert.equal(doorbellPublicOp(op, new Request("https://p/", { method: "POST", body: "{}" }), f.c.env, st, h), null, String(op));
  assert.equal(st.calls.length, 1, "no other op reached the store");
  const get = await doorbellPublicOp("knock", new Request("https://p/?op=knock"), f.c.env, st, h);
  assert.equal(get.status, 405);
});

test("R13 (over-strictness): a pull changes nothing of a plain capture's, byte for byte; only the pulled capture gains its actor and receipt", async () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  /* a plain capture: its bytes held, its actor recorded, its receipt written, as an acquire leaves them */
  const plain = "a page fetched directly", P = sha(plain);
  b.held.set(`bio/captures/${P}`, new TextEncoder().encode(plain));
  f.cap.recordCaptureActor({ captureSha: P, actor: "m9", at: "2026-01-01T00:00:00Z" });
  f.c.provenance.recordReceipt({ address: "https://a.example/p", addressNorm: "https://a.example/p", captureSha: P, retrieved: "2026-01-01T00:00:00Z", via: "direct" });
  const plainRows = () => JSON.stringify([f.rows(`SELECT * FROM capture_actors WHERE capture_sha = ?`, P), f.rows(`SELECT * FROM captured_locators WHERE capture_sha = ?`, P),
                                          [...b.held.get(`bio/captures/${P}`)]]);
  const before = plainRows();
  const k = await f.c.knock({ content: "a knocked memo", sourceAddress: "5.5.5.5" });
  const r = await f.c.pullKnock({ knockId: k.knockId, by: "m1" });
  assert.equal(r.ok, true);
  assert.equal(plainRows(), before, "the plain capture unchanged, byte for byte");
  assert.deepEqual(f.rows(`SELECT actor FROM capture_actors WHERE capture_sha = ?`, sha("a knocked memo")).map((x) => x.actor), ["m1"]);
  /* and the same knock's bytes pulled twice change nothing further */
  const after = JSON.stringify(f.rows(`SELECT * FROM capture_actors`));
  await f.c.pullKnock({ knockId: k.knockId, by: "m2" });
  assert.equal(JSON.stringify(f.rows(`SELECT * FROM capture_actors`)), after);
});
