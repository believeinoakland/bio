/* public-read — the docket beside a case (N520; DEC-116 items 7, 8, DEC-100 item 2): R20, the withdrawal stamp and the
   docket's last date on `publishedCase`; R21, `op=docketpublic` and `op=docketfeed` served with no credential; and the
   docket's share of R10 (its public answers only) and R16 (reached only through `withdrawalOf`, `docketPublic` and
   `docketFeed`; nothing written). Driven at the module's interface: `publishedCase`, `docketPublic`, `docketFeed` and
   their store ops over a real world, and the door (`publicReadDoorOp`) over the published store's stub, with the
   plane's helpers bound as `control-plane` R23 and R25 state them. The docket is the fixture's `docketOn`, on `docket`'s
   R12, R14 and R15 interface. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, docketOn, SIG } from "./fixture.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";
import { PUBLIC_READ_OWN_OPS, DOCKET_FEED_MEDIA_TYPE } from "../../../src/public-read/reads.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { bindPublishedPlane } from "../../../src/publication/worker.mjs";

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
bindPublishedPlane({ ...HELPERS, StoreSilent: class extends Error {}, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER",
                     STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio" });

/* What a stranger's request can carry that is no read's business: a credential, a session, every stamp. */
const CREDENTIALED = { token: "op-token-secret", viewer: "member:olive", by: "member:olive", identity: "olive",
                       author: "member:olive", secret: "s3cret", session: "sess-1", aiCred: "ai-1", principal: "p" };

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const T1 = "2026-09-28T01:00:00Z", T2 = "2026-09-29T01:00:00Z";
const D1 = "2026-10-01T09:00:00Z", D2 = "2026-10-02T09:00:00Z", D3 = "2026-10-03T09:00:00Z";
const DIGEST = (n) => String(n).repeat(64).slice(0, 64);

/* CASE editions 1 and 2 over F, each signed and published, and its docket held on `docketOn` (no entry yet). */
function twoEditions() {
  const docket = docketOn({ cases: [CASE] });
  const w = world({ docket });
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  for (const [ed, at] of [[1, T1], [2, T2]]) {
    if (ed > 1) w.inquiry(F, { question: "Is it answered, edition 2?" });
    const pin = w.head(F);
    w.prepare(CASE, ed, { project: proj, roles: [{ target: F, version_sha: pin, ...(ed > 1 ? { edition: ed } : {}) }] });
    assert.equal(w.signCase(CASE, ed, { project: proj, roster: [{ bundle_id: F, version_sha: pin }], sig: SIG(ed), at }).ok, true);
    const text = w.text(F);
    assert.equal(w.signFinding(F, { sig: SIG(10 + ed), at, shas: [{ sha256: pin, path: "bundle.md", kind: "bundle",
                                                                   bytes: Buffer.byteLength(text) }] }).ok, true);
  }
  const env = { PUBLISHED: bucket() };
  return { w, docket, env };
}
const door = (w, env, op, q = {}, stub = stubOf(w)) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publicReadDoorOp(op, url, env, stub, HELPERS);
};
const replying = (res) => ({ async fetch() { return res(); } });
/* `publishedCase`'s answer with R20's keys taken out, so "the edition is answered whole as before" can be compared. */
const withoutDocket = (c) => {
  const { withdrawn, docket_last_entry, ...rest } = c;
  return { ...rest, edition_index: rest.edition_index.map(({ withdrawn: _w, ...e }) => e) };
};

test("R20 a withdrawn edition answers `withdrawn` at the top, its stamp linked to the withdrawal entry; the edition is answered whole as before", async () => {
  const { w, docket, env } = twoEditions();
  const before1 = w.read("publishedcase", { id: CASE, edition: 1 });
  const before2 = w.read("publishedcase", { id: CASE });
  /* negative control: with no withdrawal, every edition answers `withdrawn: null`, stated and never omitted */
  assert.deepEqual([before1.withdrawn, before2.withdrawn], [null, null]);
  assert.deepEqual(before2.edition_index.map((e) => [e.edition, e.withdrawn]), [[1, null], [2, null]]);
  docket.place(CASE, { seq: 1, date: D1, kind: "withdrawal", shelf: "listed", edition: 1, reason: "The memo was forged.",
                       digest: DIGEST(1) });
  const STAMP1 = { seq: 1, date: D1, reason: "The memo was forged.",
                   entry: { seq: 1, digest: DIGEST(1), docket: `op=docketpublic&case=${CASE}` } };
  const c1 = w.read("publishedcase", { id: CASE, edition: 1 });
  assert.deepEqual(c1.withdrawn, STAMP1, "the stamp: the docket's seq, date and reason, and the link to the entry");
  assert.deepEqual(Object.keys(c1).slice(0, 4), ["ok", "caseId", "edition", "withdrawn"], "at the top of the answer");
  assert.deepEqual(withoutDocket(c1), withoutDocket(before1), "the withdrawn edition is answered whole, exactly as before");
  /* every edition's row says which stand withdrawn; edition 2 is not, and answers whole too */
  const c2 = w.read("publishedcase", { id: CASE });
  assert.deepEqual([c2.edition, c2.withdrawn], [2, null], "negative control: an edition no withdrawal names");
  assert.deepEqual(c2.edition_index.map((e) => [e.edition, e.withdrawn]), [[1, STAMP1], [2, null]]);
  assert.deepEqual(withoutDocket(c2), withoutDocket(before2));
  /* by hash, by finding and by case: one stamp; and through the Worker, the same */
  const pin1 = c1.findings[0].bundle_sha;
  assert.deepEqual(w.read("publishedcase", { sha256: pin1 }).withdrawn, STAMP1);
  assert.deepEqual(w.read("publishedcase", { id: F, edition: 1 }).withdrawn, STAMP1);
  const viaDoor = await (await door(w, env, "publishedcase", { id: CASE, edition: 1 })).json();
  assert.deepEqual([viaDoor.ok, viaDoor.edition, viaDoor.withdrawn], [true, 1, STAMP1]);
  /* a withdrawal of `all` names every edition ratified at its date (the docket decides which, its R12); each carries it */
  docket.place(CASE, { seq: 2, date: D2, kind: "withdrawal", shelf: "listed", edition: "all", covers: [2],
                       reason: "We no longer stand behind the case.", digest: DIGEST(2) });
  const all = w.read("publishedcase", { id: CASE });
  assert.deepEqual(all.withdrawn, { seq: 2, date: D2, reason: "We no longer stand behind the case.",
                                    entry: { seq: 2, digest: DIGEST(2), docket: `op=docketpublic&case=${CASE}` } });
  assert.deepEqual(all.edition_index.map((e) => [e.edition, e.withdrawn && e.withdrawn.seq]), [[1, 1], [2, 2]]);
  /* it is read, never composed: what `withdrawalOf` answers is what is stamped, for each edition asked */
  assert.ok(docket.calls.some(([m, c, ed]) => m === "withdrawalOf" && c === CASE && ed === 1));
  assert.ok(docket.calls.some(([m, c, ed]) => m === "withdrawalOf" && c === CASE && ed === 2));
});

test("R20 `docket_last_entry` is the docket's `last_entry` (its R14), null when the case has no public entry", async () => {
  const { w, docket, env } = twoEditions();
  /* negative control: a docket with no public entry */
  assert.equal(w.read("publishedcase", { id: CASE }).docket_last_entry, null);
  docket.place(CASE, { seq: 1, date: D1, kind: "response", shelf: "listed", edition: 1 });
  assert.equal(w.read("publishedcase", { id: CASE }).docket_last_entry, D1);
  docket.place(CASE, { seq: 2, date: D3, kind: "reaction", shelf: "reactions", edition: 2 });
  assert.equal(w.read("publishedcase", { id: CASE, edition: 1 }).docket_last_entry, D3, "the case's docket, whichever edition is read");
  assert.equal((await (await door(w, env, "publishedcase", { id: CASE })).json()).docket_last_entry, D3, "through the Worker");
  /* a docket that answers nothing for the case states no date */
  docket.held.delete(CASE);
  assert.equal(w.read("publishedcase", { id: CASE }).docket_last_entry, null);
});

test("R21 R10 op=docketpublic serves the case's docket with no credential, at the store op and through the door, forwarding only `case`", async () => {
  const { w, docket, env } = twoEditions();
  docket.place(CASE, { seq: 1, date: D1, kind: "response", shelf: "listed", edition: 1 });
  docket.place(CASE, { seq: 2, date: D2, kind: "withdrawal", shelf: "listed", edition: 1, reason: "r", digest: DIGEST(2) });
  const expected = { ...docket.docketPublic({ case: CASE }), ok: true, case: CASE };
  const s = w.read("docketpublic", { case: CASE, ...CREDENTIALED });
  assert.deepEqual(s, expected, "the docket's own answer, served as it answers it");
  assert.equal(s.last_entry, D2);
  const r = await door(w, env, "docketpublic", { case: CASE, ...CREDENTIALED });
  assert.deepEqual([r.status, await r.json()], [200, expected]);
  /* what the door asks the store: `case` and nothing else, and no header */
  const asked = [];
  const spy = { async fetch(req) { asked.push(req); return stubOf(w).fetch(req); } };
  await door(w, env, "docketpublic", { case: CASE, other: "x", ...CREDENTIALED }, spy);
  const sent = new URL(asked[0].url);
  assert.deepEqual([sent.pathname, [...sent.searchParams]], ["/docketpublic", [["case", CASE]]]);
  assert.deepEqual([...asked[0].headers], [], "no header reaches the store");
  /* the docket is asked with the case alone: nothing of the caller reaches it */
  const docketAsked = docket.calls.filter(([m]) => m === "docketPublic");
  assert.ok(docketAsked.every((c) => c.length === 2 && c[1] === CASE));
  for (const v of Object.values(CREDENTIALED)) assert.equal(JSON.stringify(docket.calls).includes(v), false, `${v} reached the docket`);
  /* its names are this module's own ops: no registered public read may take them (R18) */
  for (const own of ["docketpublic", "docketfeed"]) {
    assert.ok(PUBLIC_READ_OWN_OPS.includes(own));
    assert.equal(w.pr.registerPublicReads("m", { [own]: () => 1 }).reason, "PROVIDER_MALFORMED", own);
  }
});

test("R21 op=docketfeed serves the case's Atom feed, its own bytes, as application/atom+xml at one fixed address per case", async () => {
  const { w, docket, env } = twoEditions();
  docket.place(CASE, { seq: 1, date: D1, kind: "response", shelf: "listed", edition: 1 });
  docket.place(CASE, { seq: 2, date: D2, kind: "outcome", shelf: "listed", edition: 2 });
  const feed = docket.docketFeed({ case: CASE });
  assert.deepEqual(w.read("docketfeed", { case: CASE }), { ok: true, case: CASE, media_type: "application/atom+xml", feed });
  const r = await door(w, env, "docketfeed", { case: CASE, ...CREDENTIALED });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/atom+xml");
  assert.equal(DOCKET_FEED_MEDIA_TYPE, "application/atom+xml");
  assert.equal(r.headers.get("access-control-allow-origin"), "*", "a reader's own software pulls it from anywhere");
  assert.equal(await r.text(), feed, "the feed's bytes, exactly as the docket wrote them, never wrapped");
  /* one fixed address: the same request answers the same bytes; a new entry changes the feed, never its address */
  assert.equal(await (await door(w, env, "docketfeed", { case: CASE })).text(), feed);
  docket.place(CASE, { seq: 3, date: D3, kind: "reaction", shelf: "reactions", edition: 2 });
  const later = await (await door(w, env, "docketfeed", { case: CASE })).text();
  assert.notEqual(later, feed);
  assert.equal(later, docket.docketFeed({ case: CASE }));
  /* negative control: the docket read is JSON, never the feed's media type */
  assert.match((await door(w, env, "docketpublic", { case: CASE })).headers.get("content-type"), /application\/json/);
});

test("R21 R17 a case the docket answers null for is NOT_PUBLISHED (C-98.8), the same bytes as publishedcase's for an absent case; no case is the argument refusal", async () => {
  const { w, docket, env } = twoEditions();
  const absentCase = await door(w, env, "publishedcase", { id: "CASE-2099-0404" });
  const absentBody = await absentCase.text();
  assert.equal(absentCase.status, 404);
  assert.deepEqual((({ reason, code, check, translation }) => [reason, code, check, translation])(JSON.parse(absentBody)),
                   ["NOT_PUBLISHED", "NOT_PUBLISHED", "C-98.8", rowOf("NOT_PUBLISHED").translation]);
  for (const op of ["docketpublic", "docketfeed"]) {
    for (const c of ["CASE-2099-0404", "CASE-2026-0002"]) {
      const s = w.read(op, { case: c });
      assert.deepEqual(s, w.pr.publishedCase({ id: "CASE-2099-0404" }), `${op} ${c}: publishedCase's own answer`);
      const r = await door(w, env, op, { case: c });
      assert.deepEqual([r.status, await r.text()], [404, absentBody], `${op} ${c}: the same bytes through the door`);
    }
    /* a case the record holds but the docket answers null for (no ratified edition, its R14) is the same answer */
    docket.held.delete(CASE);
    assert.deepEqual([(await door(w, env, op, { case: CASE })).status, w.read(op, { case: CASE }).reason], [404, "NOT_PUBLISHED"]);
    docket.hold(CASE);
    /* negative control: the case the docket holds answers */
    assert.equal((await door(w, env, op, { case: CASE })).status, 200, op);
    /* no case: the argument refusal at 400, and the store is never asked */
    for (const q of [{}, { case: "" }, { case: "   " }]) {
      const asked = [];
      const b = await door(w, env, op, q, { async fetch(req) { asked.push(req); return stubOf(w).fetch(req); } });
      assert.equal(b.status, 400);
      assert.deepEqual((({ reason, op: o, argument }) => [reason, o, argument])(await b.json()), ["REQUIRED_ARGUMENT_MISSING", op, "case"]);
      assert.equal(asked.length, 0);
    }
    assert.equal(w.read(op, {}).reason, "NOT_PUBLISHED", `${op}: the store op with no case answers nothing published`);
  }
});

test("R21 R9 the docket reads relay the store's own refusal with its status and sentence, and a reply that is no answer as STORE_DID_NOT_ANSWER", async () => {
  const { w, env } = twoEditions();
  for (const op of ["docketpublic", "docketfeed"]) {
    const refused = await door(w, env, op, { case: CASE },
      replying(() => Response.json({ ok: false, reason: "STORE_BUSY", detail: "the store refused" }, { status: 429 })));
    assert.deepEqual([refused.status, (await refused.json()).reason], [429, "STORE_BUSY"], op);
    const silent = await door(w, env, op, { case: CASE },
      replying(() => Response.json({ ok: false, reason: "STORE_INTERNAL_ERROR", correlation: "0f0e0d0c-0b0a-4908-8706-050403020100" }, { status: 500 })));
    const sb = await silent.json();
    assert.deepEqual([silent.status, sb.reason, sb.op, sb.correlation], [502, "STORE_DID_NOT_ANSWER", op, "0f0e0d0c-0b0a-4908-8706-050403020100"]);
    /* an answer with nothing in it is a silence, never a claim */
    for (const result of [null, 7, { feed: "x" }]) {
      const empty = await door(w, env, op, { case: CASE }, replying(() => Response.json({ ok: true, result })));
      assert.deepEqual([empty.status, (await empty.json()).reason], [502, "STORE_DID_NOT_ANSWER"], `${op} ${JSON.stringify(result)}`);
    }
  }
  /* a feed answer carrying no feed is a silence too, never an empty feed */
  const noFeed = await door(w, env, "docketfeed", { case: CASE }, replying(() => Response.json({ ok: true, result: { ok: true, case: CASE } })));
  assert.equal(noFeed.status, 502);
});

test("R16 R10 the docket reads write nothing, and reach the docket only through its public answers", async () => {
  const { w, docket, env } = twoEditions();
  docket.place(CASE, { seq: 1, date: D1, kind: "withdrawal", shelf: "listed", edition: 1, reason: "r", digest: DIGEST(1) });
  const before = JSON.stringify(w.snapshot());
  const held = JSON.stringify([...docket.held]);
  w.read("docketpublic", { case: CASE });
  w.read("docketfeed", { case: CASE });
  w.read("publishedcase", { id: CASE, edition: 1 });
  await door(w, env, "docketpublic", { case: CASE });
  await door(w, env, "docketfeed", { case: CASE });
  await door(w, env, "docketfeed", { case: "CASE-2099-0404" });
  assert.equal(JSON.stringify(w.snapshot()), before, "no read writes the record");
  assert.equal(JSON.stringify([...docket.held]), held, "nor the docket");
  assert.deepEqual([...new Set(docket.calls.map(([m]) => m))].sort(), ["docketFeed", "docketPublic", "withdrawalOf"],
                   "only the docket's public answers are read (its R12, R14, R15)");
});
