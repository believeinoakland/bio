/* public-read over the real `docket` (N520; K1278): R20 and R21 against `docket`'s own code, on `docket`'s own world
   (`../docket/fixture.mjs`, reused rather than copied, as this module's fixture reuses publication's): its tables, a
   case of a project published as publication's commit leaves it, and public entries prepared, signed with a member's
   registered key and posted through `docket`'s two-step signing. This module is reached as `publicReadOf(host)`, so its
   default wiring is the one tested: `docketOf(host)`, the same instance the docket's world holds (K61). Each claim has
   its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, post, CASE } from "../docket/fixture.mjs";
import { publicReadOf, publicReadOps } from "../../../src/public-read/index.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";
import { docketOf } from "../../../src/docket/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const doAnswer = async (res) => { const r = await res; const out = await r.json();
  return out.ok === true ? { answered: true, result: out.result } : { answered: false }; };
const HELPERS = { json, doAnswer, storeRefusal: (out) => json(out.reply.body, out.reply.status),
                  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
                  requiredArgument: (op, argument) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument }) };

function served() {
  const w = seeded();
  const pr = publicReadOf(w.host);
  const read = (name, query = {}) => {
    const url = new URL(`http://do/${name}`);
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
    return publicReadOps(pr, url)[name]();
  };
  const stub = { async fetch(req) {
    const url = new URL(typeof req === "string" ? req : req.url);
    const op = publicReadOps(pr, url)[url.pathname.slice(1)];
    return Response.json({ ok: true, result: await op() });
  } };
  const door = (op, q) => {
    const url = new URL(`https://plane/?op=${op}`);
    for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
    return publicReadDoorOp(op, url, {}, stub, HELPERS);
  };
  return { w, pr, read, door };
}

test("R20 R16 over the real docket: reached as docketOf(host); a posted withdrawal stamps its edition, and the last entry's date is the docket's", async () => {
  const { w, pr, read } = served();
  assert.equal(pr.docket, docketOf(w.host), "the default wiring is the docket on this host (K61)");
  /* negative control: before any public entry, nothing is withdrawn and the docket has no last date */
  const before = read("publishedcase", { caseId: CASE });
  assert.equal(before.ok, true, JSON.stringify(before).slice(0, 300));
  assert.deepEqual([before.edition, before.withdrawn, before.docket_last_entry], [1, null, null]);
  const posted = await post(w, { kind: "withdrawal", edition: 1, reason: "We no longer stand behind edition 1." });
  const w1 = w.docket.withdrawalOf({ case: CASE, edition: 1 });
  assert.equal(w1.seq, posted.seq);
  const c = read("publishedcase", { caseId: CASE });
  assert.deepEqual(c.withdrawn, { seq: w1.seq, date: w1.date, reason: "We no longer stand behind edition 1.",
                                  entry: { seq: w1.seq, id: w1.entry, digest: w1.digest, docket: `op=docketpublic&case=${CASE}` } });
  assert.deepEqual(Object.keys(c).slice(0, 4), ["ok", "caseId", "edition", "withdrawn"]);
  assert.deepEqual(c.edition_index.map((e) => [e.edition, e.withdrawn && e.withdrawn.seq]), [[1, w1.seq]]);
  const { withdrawn: _w, docket_last_entry: _d, edition_index: ei, ...rest } = c;
  const { withdrawn: _w0, docket_last_entry: _d0, edition_index: ei0, ...rest0 } = before;
  assert.deepEqual(rest, rest0, "the edition is answered whole, as before");
  assert.deepEqual(ei.map(({ withdrawn, ...e }) => e), ei0.map(({ withdrawn, ...e }) => e));
  /* the docket's last date: `lastEntryOf`, the same as its public read's `last_entry` */
  assert.equal(c.docket_last_entry, w.docket.lastEntryOf({ case: CASE }));
  assert.equal(c.docket_last_entry, (await w.docket.docketPublic({ case: CASE })).last_entry);
  assert.notEqual(c.docket_last_entry, null);
  /* nothing written by the reads */
  const snap = JSON.stringify(w.snapshot());
  read("publishedcase", { caseId: CASE });
  await read("docketpublic", { case: CASE });
  await read("docketfeed", { case: CASE });
  assert.equal(JSON.stringify(w.snapshot()), snap);
});

test("R21 over the real docket: op=docketpublic is the docket's own answer, op=docketfeed its Atom bytes as application/atom+xml; an unknown case is NOT_PUBLISHED", async () => {
  const { w, read, door } = served();
  await post(w, { kind: "withdrawal", edition: 1, reason: "Withdrawn." });
  const own = await w.docket.docketPublic({ case: CASE });
  assert.deepEqual(await read("docketpublic", { case: CASE }), { ...own, ok: true, case: CASE });
  const r = await door("docketpublic", { case: CASE, token: "t", viewer: "member:alice" });
  assert.deepEqual([r.status, await r.json()], [200, { ...own, ok: true, case: CASE }]);
  assert.equal(own.entries.length, 1);
  const f = await door("docketfeed", { case: CASE });
  assert.deepEqual([f.status, f.headers.get("content-type")], [200, "application/atom+xml"]);
  const feed = await f.text();
  assert.equal(feed, await w.docket.docketFeed({ case: CASE }));
  assert.match(feed, /^<\?xml version="1.0" encoding="utf-8"\?>\n<feed xmlns="http:\/\/www.w3.org\/2005\/Atom">/);
  /* negative control: a case the docket answers null for is publishedCase's own NOT_PUBLISHED, at 404, the same bytes */
  for (const op of ["docketpublic", "docketfeed"]) {
    const n = await door(op, { case: "CASE-2099-0404" });
    assert.equal(n.status, 404, op);
    assert.deepEqual(await n.json(), { ok: false, ...read("publishedcase", { caseId: "CASE-2099-0404" }) }, op);
  }
});
