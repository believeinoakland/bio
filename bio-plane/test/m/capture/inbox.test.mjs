/* capture: the inbox's T22 folds at the module's interface (DEC-88, DEC-108; K1019): a resolve takes the member's own
   reason (R32, C-118.7), `inboxList` sorts (R32), the discard clearing waits on a litigation-hold reader (R32), and the
   doorbell keeps a count-only tally of the knocks it turns away (R80). The doorbell's op handler over a Durable Object
   stub answering through the module's own routes, and the store side beneath it (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha, register } from "./fixture.mjs";
import { captureOps, REASON_MAX, TALLY_DAYS, CAPTURE_READERS } from "../../../src/capture/index.mjs";
import { knockOp, KNOCK } from "../../../src/capture/doorbell.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const helpers = { json, requiredArgument, storeSilent, doAnswer };
const stubOf = (c) => ({ calls: [], async fetch(req) {
  const url = new URL(req.url); this.calls.push(url.pathname);
  const body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
  return json({ ok: true, result: await captureOps(c, url, body, c.env)[url.pathname.slice(1)]() });
} });
const knockReq = (payload, { ip = "203.0.113.1", raw = null } = {}) =>
  new Request("https://plane/?op=knock", { method: "POST", headers: { "cf-connecting-ip": ip }, body: raw ?? JSON.stringify(payload) });

function setup() {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst" } });
  const st = stubOf(f.c);
  return { ...f, b, st, prov: f.c.provenance, send: async (p, o) => { const r = await knockOp(knockReq(p, o), f.c.env, st, helpers); return { status: r.status, body: await r.json() }; } };
}
const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();
const W = KNOCK.windowMs;

/* ---- R32: the member's reason (DEC-88 (2); C-118.7) ---- */

test("R32 R37 (C-118.7): every resolve takes the member's own reason; absent, not a string, blank or over 2,000 characters is RESOLVE_NO_REASON, after BAD_STATUS and NO_SUCH_KNOCK and before anything is written", async () => {
  const { c, rows, prov } = setup();
  const k = await c.knock({ content: "a tip", sourceAddress: "1.1.1.1" });
  const row = CAPTURE_CHECKS.RESOLVE_NO_REASON;
  assert.deepEqual([row.check, row.where], ["C-118.7", "src/capture/index.mjs inboxResolve > is-resolve-reasoned"]);
  const before = everything(rows);
  for (const status of ["discarded", "new", "pulled"])
    for (const reason of [undefined, null, 42, {}, ["why"], "", "   ", "\n\t ", "x".repeat(REASON_MAX + 1)]) {
      const r = await c.inboxResolve({ knockId: k.knockId, status, by: "member:m", reason });
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.status, r.knockId],
                       [false, "RESOLVE_NO_REASON", "RESOLVE_NO_REASON", "C-118.7", row.translation, 400, k.knockId], `${status} ${JSON.stringify(reason)}`);
    }
  assert.deepEqual(everything(rows), before, "nothing written: the row, its status and its resolver stay as they were");
  assert.deepEqual(prov.receipts, [], "no pull was made");
  /* the order: a bad status and an unknown knock answer before the missing reason */
  assert.equal(c.inboxResolve({ knockId: k.knockId, status: "archived", by: "member:m" }).reason, "BAD_STATUS");
  assert.equal(c.inboxResolve({ knockId: "KNOCK-none", status: "discarded", by: "member:m" }).reason, "NO_SUCH_KNOCK");
  /* characters, not bytes: 2,000 characters of a two-unit character is within the bound */
  assert.equal(c.inboxResolve({ knockId: k.knockId, status: "discarded", by: "member:m", reason: "😀".repeat(REASON_MAX) }).ok, true);
  assert.equal(REASON_MAX, 2000);
});

test("R32: a reasoned discard, and a return to new, are recorded on the inbox row with the reason, who and when; the member reads carry them; the route takes the body's reason", async () => {
  const { c, rows } = setup();
  const k = await c.knock({ content: "a tip", sourceAddress: "1.1.1.1" });
  const d = c.inboxResolve({ knockId: k.knockId, status: "discarded", by: "member:m1", reason: "an advertisement, not a tip" });
  assert.deepEqual([d.ok, d.status, d.resolve_reason], [true, "discarded", "an advertisement, not a tip"]);
  let r = rows(`SELECT status, resolved_by, resolved, resolve_reason FROM inbox`)[0];
  assert.deepEqual([r.status, r.resolved_by, r.resolve_reason], ["discarded", "member:m1", "an advertisement, not a tip"]);
  assert.ok(Number.isFinite(Date.parse(r.resolved)), "when");
  const back = route(c, "inboxresolve", "", { knockId: k.knockId, status: "new", by: "member:m2", reason: "it named a real meeting" });
  assert.equal(back.ok, true);
  r = rows(`SELECT status, resolved_by, resolve_reason FROM inbox`)[0];
  assert.deepEqual([r.status, r.resolved_by, r.resolve_reason], ["new", "member:m2", "it named a real meeting"], "the latest change's reason, who and when");
  assert.deepEqual([c.inboxGet(k.knockId).item.resolve_reason, c.inboxList(null).inbox[0].resolve_reason], ["it named a real meeting", "it named a real meeting"]);
  /* negative control: the route with no reason is refused like the service */
  assert.equal(route(c, "inboxresolve", "", { knockId: k.knockId, status: "discarded", by: "member:m2" }).reason, "RESOLVE_NO_REASON");
});

test("R32 R65: inboxResolve to pulled is the pull once its reason is admitted, the reason recorded on the row with the pull; pullKnock asked directly takes no reason", async () => {
  const { c, rows, prov } = setup();
  const k = await c.knock({ content: "memo", sourceAddress: "1.1.1.1" });
  const p = await c.inboxResolve({ knockId: k.knockId, status: "pulled", by: "m1", reason: "the budget memo we asked for" });
  assert.deepEqual([p.ok, p.existed, p.capture.sha256], [true, false, sha("memo")]);
  assert.deepEqual({ ...rows(`SELECT status, resolved_by, pulled_by, resolve_reason FROM inbox`)[0] },
                   { status: "pulled", resolved_by: "m1", pulled_by: "m1", resolve_reason: "the budget memo we asked for" });
  assert.equal(prov.receipts.length, 1);
  /* direct: no reason taken, none recorded, the pull made as R65 states */
  const k2 = await c.knock({ content: "memo two", sourceAddress: "1.1.1.2" });
  const d = await c.pullKnock({ knockId: k2.knockId, by: "m1" });
  assert.deepEqual([d.ok, d.existed], [true, false]);
  assert.equal(rows(`SELECT resolve_reason FROM inbox WHERE knock_id = ?`, k2.knockId)[0].resolve_reason, null);
});

/* ---- R32: the inbox's sort (DEC-108 (2)) ---- */

/* Six knocks: two with a secret; three pulled into documents of projects B, A and none, one more pulled with its home
   gone. Received a minute apart, k0 oldest. */
async function sortWorld() {
  const w = setup();
  const ks = [];
  for (let i = 0; i < 6; i++)
    ks.push(await w.c.knock({ content: `k${i}`, sourceAddress: `s${i}`, now: W * 10 + i * 60000,
                              ...(i === 1 || i === 4 ? { knockerSecret: "a knocker secret of twenty-plus" } : {}) }));
  const pull = async (i, bundle, project) => {
    await w.c.pullKnock({ knockId: ks[i].knockId, by: "m1" });
    if (bundle) register(w.s, sha(`k${i}`), bundle, { project });
  };
  await pull(0, "INFO-0", "PROJ-B");
  await pull(2, "INFO-2", "PROJ-A");
  await pull(3, "INFO-3", null);
  await pull(5, null);
  w.c.inboxResolve({ knockId: ks[4].knockId, status: "discarded", by: "m1", reason: "duplicate" });
  return { ...w, ids: ks.map((k) => k.knockId) };
}
const order = (r, ids) => r.inbox.map((x) => ids.indexOf(x.knock_id));

test("R32 (DEC-108 (2)): inboxList sorts by received (the default, newest first), status, secret or project, either way, ties by received newest first; a knock with no project sorts last in either direction", async () => {
  const { c, ids } = await sortWorld();
  const list = (sort, dir) => c.inboxList(null, { sort, dir });
  assert.deepEqual(order(c.inboxList(null), ids), [5, 4, 3, 2, 1, 0], "today's order unchanged");
  assert.deepEqual([c.inboxList(null).sort, c.inboxList(null).dir], ["received", "desc"]);
  assert.deepEqual(order(list("received", "asc"), ids), [0, 1, 2, 3, 4, 5]);
  /* status: discarded < new < pulled; ties newest first */
  assert.deepEqual(order(list("status", "asc"), ids), [4, 1, 5, 3, 2, 0]);
  assert.deepEqual(order(list("status", "desc"), ids), [5, 3, 2, 0, 1, 4]);
  /* secret: whether a knocker secret was presented */
  assert.deepEqual(order(list("secret", "desc"), ids), [4, 1, 5, 3, 2, 0]);
  assert.deepEqual(order(list("secret", "asc"), ids), [5, 3, 2, 0, 4, 1]);
  /* project: the project of the document a pulled knock was brought into; none last both ways */
  const asc = list("project", "asc"), desc = list("project", "desc");
  assert.deepEqual(order(asc, ids), [2, 0, 5, 4, 3, 1]);
  assert.deepEqual(order(desc, ids), [0, 2, 5, 4, 3, 1]);
  assert.deepEqual(asc.inbox.map((x) => x.project), ["PROJ-A", "PROJ-B", null, null, null, null], "each row names its project, null until pulled into one");
  /* the route carries sort and dir */
  assert.deepEqual(order(route(c, "inboxlist", "sort=project&dir=desc"), ids), [0, 2, 5, 4, 3, 1]);
  assert.deepEqual(order(c.inboxList("pulled", { sort: "project", dir: "asc" }), ids), [2, 0, 5, 3], "with a status");
});

test("R32 (N90, DEC-108 (2)): a sorted list pages by `after` over every knock once, in its order; an unknown sort or dir is the required-argument refusal naming it, with nothing read", async () => {
  const { c, ids, rows } = await sortWorld();
  for (const [sort, dir] of [["received", "desc"], ["status", "asc"], ["secret", "desc"], ["project", "asc"], ["project", "desc"]]) {
    const whole = order(c.inboxList(null, { sort, dir }), ids);
    const seen = [];
    let after = null;
    for (let n = 0; n < 10; n++) {
      const p = c.inboxList(null, { sort, dir, limit: 2, after });
      seen.push(...order(p, ids));
      if (!p.truncated) break;
      after = p.next;
    }
    assert.deepEqual(seen, whole, `${sort} ${dir}: every knock once, in order`);
  }
  const before = everything(rows);
  for (const [sort, dir, arg] of [["size", null, "sort"], ["", "sideways", "dir"], ["received", "DESC", "dir"], ["Project", null, "sort"]]) {
    const r = c.inboxList(null, { sort, dir });
    assert.deepEqual([r.ok, r.reason, r.argument, r.op, r.status], [false, "REQUIRED_ARGUMENT_MISSING", arg, "inbox", 400], `${sort} ${dir}`);
    assert.equal(r.inbox, undefined, "no knock answered");
  }
  assert.equal(route(c, "inboxlist", "sort=size").argument, "sort");
  assert.deepEqual(everything(rows), before, "nothing written");
  assert.equal(c.inboxList(null, { sort: "project", after: "nope" }).reason, "BAD_CURSOR");
});

/* ---- R32: the litigation hold's pause of the discard clearing (DEC-108 (5)) ---- */

test("R32 (DEC-108 (5)): nothing discarded is cleared while a hold may be in place: no reader registered, one that fails or does not answer, or one that reports a hold, each pauses the clearing; only a reader answering no hold lets it run", () => {
  assert.deepEqual([...CAPTURE_READERS], ["litigation-hold", "batch-examination"]);
  const may = (fn) => { const { c } = fresh(); if (fn) assert.equal(c.registerReader("litigation-hold", "actions", fn).ok, true); return c.mayClearDiscarded().may; };
  assert.equal(may(null), false, "none registered: nothing is cleared");
  assert.equal(may(() => true), false, "a hold in place");
  assert.equal(may(() => { throw new Error("down"); }), false, "a reader that fails");
  assert.equal(may(() => undefined), false, "a reader that does not answer");
  assert.equal(may(() => "no"), false, "an answer that is not a yes or no");
  assert.equal(may(async () => false), false, "an answer that is not synchronous");
  assert.equal(may(() => false), true, "negative control: no hold in place, the clearing may run");
  const { c, rows } = fresh();
  const before = everything(rows);
  c.mayClearDiscarded();
  assert.deepEqual(everything(rows), before, "asking writes nothing");
  /* registered once at start, whoever registers it */
  assert.equal(c.registerReader("litigation-hold", "actions", () => false).ok, true);
  const again = c.registerReader("litigation-hold", "other", () => false);
  assert.deepEqual([again.ok, again.reason, again.module], [false, "LISTENER_DECLARED", "actions"]);
  assert.equal(c.registerReader("litigation-hold", "", () => false).reason, "LISTENER_MALFORMED");
  assert.equal(c.registerReader("nonsense", "actions", () => false).reason, "UNKNOWN_READER");
  assert.equal(c.mayClearDiscarded().may, true, "the first registration stands");
});

/* ---- R80: the doorbell's count-only tally (DEC-108 (6); BOB's privacy ruling) ---- */

const tallyRows = (rows) => rows(`SELECT day, refused, limit_reached FROM doorbell_tally ORDER BY day`).map((r) => ({ ...r }));

test("R80 R53 R71: every knock the doorbell turns away is counted by its UTC day, the envelope, a required argument, base64, empty, size, a weak secret and either rate limit, and every knockAttempt refusal; an admitted knock and a GET are not", async () => {
  const { send, c, rows } = setup();
  const day = new Date().toISOString().slice(0, 10);
  await send(null, { raw: "x".repeat(KNOCK.maxBytes + 4097) });
  await send(null, { raw: "not json" });
  await send({ contentB64: "!!!" });
  await send({ contentText: "" });
  await send({ contentText: "x".repeat(KNOCK.maxBytes + 1) });
  await send({ contentText: "tip", knockerSecret: "short" });
  assert.deepEqual(tallyRows(rows), [{ day, refused: 6, limit_reached: 0 }], "the six refusals made before the store");
  assert.equal(rows(`SELECT count(*) n FROM inbox`)[0].n, 0);
  /* the rates, counted by the store at the knock's own instant */
  const t0 = Date.parse("2026-03-04T12:00:00Z");
  for (let i = 0; i < 5; i++) await c.knock({ content: `a${i}`, sourceAddress: "1.1.1.1", now: t0 });
  assert.equal((await c.knock({ content: "a5", sourceAddress: "1.1.1.1", now: t0 })).reason, "RATE_IP");
  assert.equal((await c.knockAttempt({ sourceAddress: "1.1.1.1", now: t0 })).reason, "RATE_IP");
  assert.deepEqual(tallyRows(rows)[0], { day: "2026-03-04", refused: 2, limit_reached: 0 }, "a source at its own limit did not find the doorbell full");
  /* store-side refusals of a direct caller count too */
  await c.knock({ contentB64: "!!!", sourceAddress: "2.2.2.2", now: t0 });
  assert.equal(tallyRows(rows)[0].refused, 3);
  /* negative control: an admitted knock counts nothing */
  await c.knock({ content: "ok", sourceAddress: "3.3.3.3", now: t0 });
  assert.equal(tallyRows(rows)[0].refused, 3);
  /* a method other than POST is not a knock */
  const get = await knockOp(new Request("https://plane/?op=knock", { method: "GET" }), c.env, stubOf(c), helpers);
  assert.equal(get.status, 405);
  assert.equal(tallyRows(rows).reduce((n, r) => n + r.refused, 0), 9);
});

test("R80: the knocks that found the whole-doorbell limit reached are counted apart, a RATE_IP among them when the instance was full too, and the day it was last reached is kept as a date", async () => {
  const { c, rows } = setup();
  const t0 = Date.parse("2026-03-04T12:00:00Z"), t1 = Date.parse("2026-03-06T08:00:00Z");
  for (let i = 0; i < 10; i++) await c.knock({ content: `g${i}`, sourceAddress: i < 5 ? "10.0.0.1" : `10.0.1.${i}`, now: t0 });
  assert.equal((await c.knock({ content: "x", sourceAddress: "10.0.9.9", now: t0 })).reason, "RATE_GLOBAL");
  assert.equal((await c.knock({ content: "y", sourceAddress: "10.0.0.1", now: t0 })).reason, "RATE_IP", "over both");
  assert.equal((await c.knockAttempt({ sourceAddress: "10.0.9.8", now: t0 })).reason, "RATE_GLOBAL");
  assert.deepEqual(tallyRows(rows), [{ day: "2026-03-04", refused: 3, limit_reached: 3 }]);
  /* a refusal that did not find the doorbell full: counted, not as limit reached */
  await c.knock({ content: "z", knockerSecret: "short", sourceAddress: "10.9.9.9", now: t1 });
  assert.deepEqual(tallyRows(rows), [{ day: "2026-03-04", refused: 3, limit_reached: 3 }, { day: "2026-03-06", refused: 1, limit_reached: 0 }]);
  const read = c.doorbellTally({ viewer: "member:m1", now: t1 });
  assert.deepEqual(read, { ok: true, days: [{ day: "2026-03-06", refused: 1, limit_reached: 0 }, { day: "2026-03-04", refused: 3, limit_reached: 3 }],
                           last_limit_reached: "2026-03-04" }, "newest first; the date only");
  assert.deepEqual(fresh().c.doorbellTally({ viewer: "member:m1" }), { ok: true, days: [], last_limit_reached: null }, "never reached: null");
});

test("R80 (BOB's privacy ruling): the tally keeps 30 UTC days and drops any older, and holds no address, fingerprint, time, digest, pseudonym, note, contact or content", async () => {
  const { c, rows } = setup();
  const day0 = Date.parse("2026-01-01T10:00:00Z");
  for (let d = 0; d < 40; d++) await c.knock({ contentB64: "!!!", sourceAddress: "198.51.100.7", now: day0 + d * 86400000 });
  const kept = tallyRows(rows);
  assert.equal(TALLY_DAYS, 30);
  assert.equal(kept.length, 30);
  assert.deepEqual([kept[0].day, kept.at(-1).day], ["2026-01-11", "2026-02-09"], "the last 30 days, the oldest dropped");
  assert.equal(c.doorbellTally({ viewer: "member:m1", now: day0 + 39 * 86400000 }).days.length, 30);
  /* what it holds: two counters per day and a date, nothing else */
  assert.deepEqual(rows(`PRAGMA table_info(doorbell_tally)`).map((r) => r.name), ["day", "refused", "limit_reached"]);
  assert.deepEqual(rows(`PRAGMA table_info(doorbell_limit_last)`).map((r) => r.name), ["id", "day"]);
  const secret = "a knocker secret of twenty-plus";
  for (let i = 0; i < 6; i++) await c.knock({ content: `n${i}`, note: "a note", contact: "who@example.org", sourceAddress: "198.51.100.9",
                                              knockerSecret: secret, now: day0 + 40 * 86400000 });
  const fp = await c.sourceFingerprint("198.51.100.9");
  const text = JSON.stringify([rows(`SELECT * FROM doorbell_tally`), rows(`SELECT * FROM doorbell_limit_last`)]);
  for (const x of ["198.51", fp, "who@example", "a note", secret, (await c.knockerDigestOf(secret)).pseudonym, sha("n5"), "T10:"])
    assert.ok(!text.includes(x), `the tally holds no ${x}`);
});

test("R80: doorbellTally answers a member session only, writes nothing, decides nothing; a count that cannot be written never changes the refusal's answer", async () => {
  const { c, rows, send } = setup();
  await send({ contentText: "" });
  const before = everything(rows);
  for (const viewer of [null, "", "class:admin", "class:member", "admin", "junk", "token:member"]) {
    const r = c.doorbellTally({ viewer });
    assert.deepEqual([r.ok, r.reason, r.days], [false, "MEMBER_SESSION_REQUIRED", undefined], String(viewer));
  }
  assert.equal(c.doorbellTally({ viewer: "member:m1" }).days[0].refused, 1);
  assert.equal(route(c, "doorbelltally", "viewer=member:m1").ok, true, "the route reads the stamped viewer");
  assert.equal(route(c, "doorbelltally").reason, "MEMBER_SESSION_REQUIRED", "an unstamped call reads nothing");
  assert.deepEqual(everything(rows), before, "reading writes nothing");
  /* the tally cannot be written: every refusal answers exactly as before, and admissions are unaffected */
  const w = setup();
  const want = await send({ contentText: "" });
  w.s.db.exec(`DROP TABLE doorbell_tally`);
  const got = await w.send({ contentText: "" });
  assert.deepEqual([got.status, got.body], [want.status, want.body]);
  for (let i = 0; i < 5; i++) await w.c.knock({ content: `q${i}`, sourceAddress: "4.4.4.4" });
  assert.equal((await w.c.knock({ content: "q5", sourceAddress: "4.4.4.4" })).reason, "RATE_IP");
  /* a store that does not answer the count: the refusal still answers as it does */
  const silent = { calls: 0, async fetch() { this.calls++; throw new Error("down"); } };
  const r = await knockOp(knockReq({ contentText: "" }), w.c.env, silent, helpers);
  assert.deepEqual([r.status, (await r.json()).reason, silent.calls], [400, "KNOCK_EMPTY", 1]);
});
