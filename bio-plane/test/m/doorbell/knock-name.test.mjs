/* doorbell R27 (proposed, T51 fix round 2; K4328): a knock records the file name and media type its sender stated, bounded and
   never trusted as a type check, and the inbox reads (list and get) answer both; a knock that stated neither answers them null.
   Tested through the door's handler over a stub answering through the module's own routes, and the store side beneath it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { doorbellOps } from "../../../src/doorbell/index.mjs";
import { knockOp } from "../../../src/doorbell/door.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
// fixtures-contract: answer-envelope door-helpers
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const helpers = { json, requiredArgument, storeSilent, doAnswer };
const stubOf = (c) => ({ async fetch(req) {
  const url = new URL(req.url);
  const body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
  return json({ ok: true, result: await doorbellOps(c, url, body)[url.pathname.slice(1)]() });
} });
const setup = () => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst" } });
  const st = stubOf(f.c);
  let n = 0;
  /* a fresh source address per knock keeps the rate out of the way */
  const send = async (payload) => knockOp(new Request("https://plane/?op=knock", { method: "POST",
    headers: { "cf-connecting-ip": `203.0.113.${++n}` }, body: JSON.stringify(payload) }), f.c.env, st, helpers);
  return { ...f, send };
};
const listed = (c, id) => c.inboxList(null).inbox.find((r) => r.knock_id === id);

test("R27: a knock that states a file name and a media type is recorded with both, and the inbox list and get answer them", async () => {
  const { c, send } = setup();
  const r = await send({ contentText: "tip", fileName: "memo-2026.pdf", mediaType: "application/pdf" });
  const a = await r.json();
  assert.equal(a.ok, true, JSON.stringify(a));
  const row = listed(c, a.knockId);
  assert.equal(row.file_name, "memo-2026.pdf");
  assert.equal(row.media_type, "application/pdf");
  const got = c.inboxGet(a.knockId);
  assert.equal(got.item.file_name, "memo-2026.pdf");
  assert.equal(got.item.media_type, "application/pdf");
});

test("R27 control: a knock that states neither answers both absent (null), and so does one that states them as non-strings or blank", async () => {
  const { c, send } = setup();
  for (const extra of [{}, { fileName: 7, mediaType: { a: 1 } }, { fileName: "   ", mediaType: "" }, { fileName: null, mediaType: null }]) {
    const a = await (await send({ contentText: "tip", ...extra })).json();
    assert.equal(a.ok, true, JSON.stringify(a));
    const row = listed(c, a.knockId);
    assert.equal(row.file_name, null, JSON.stringify(extra));
    assert.equal(row.media_type, null, JSON.stringify(extra));
    const got = c.inboxGet(a.knockId).item;
    assert.equal(got.file_name, null);
    assert.equal(got.media_type, null);
  }
});

test("R27: the stated name and type are bounded (255 and 127 characters) and a name carries no control character; the stated type decides nothing", async () => {
  const { c, send } = setup();
  const a = await (await send({ contentText: "tip", fileName: `a\u0000b\nc${"x".repeat(400)}`, mediaType: `text/${"y".repeat(400)}` })).json();
  assert.equal(a.ok, true, JSON.stringify(a));
  const row = listed(c, a.knockId);
  assert.equal([...row.file_name].length, 255);
  assert.equal(/[\u0000-\u001f\u007f]/.test(row.file_name), false);
  assert.equal(row.file_name.startsWith("abcxxx"), true);
  assert.equal([...row.media_type].length, 127);
  /* never a type check: a type that lies about the bytes is recorded as stated and the knock is accepted all the same */
  const lie = await (await send({ contentText: "plain words", fileName: "x.png", mediaType: "image/png" })).json();
  assert.equal(lie.ok, true);
  assert.equal(listed(c, lie.knockId).media_type, "image/png");
  assert.equal(c.inboxGet(lie.knockId).item.sha256, lie.sha256);
});

test("R27: the name and type are never in the knock's answer to the sender and are not the bytes' digest's business; a knock sent straight to the store side records them the same", async () => {
  const { c } = setup();
  const k = await c.knock({ content: "direct", sourceAddress: "198.51.100.5", fileName: "d.txt", mediaType: "text/plain" });
  assert.equal(k.ok, true);
  assert.equal("file_name" in k, false);
  assert.equal(listed(c, k.knockId).file_name, "d.txt");
  assert.equal(listed(c, k.knockId).media_type, "text/plain");
});

/* fix round 3, C28 (K4356): the knock reads `knocksof` and `inboxget` both carry the name and type the sender stated. */
const knocksOfRow = (c, pseudonym, id) => c.knocksOf({ pseudonym }).knocks.find((r) => r.knock_id === id);
const SECRET = "a-knocker-secret-of-enough-length";

test("R27 R15: knocksof answers the file name and media type a knock stated, and inboxget answers the same pair", async () => {
  const { c, send } = setup();
  const a = await (await send({ contentText: "tip", knockerSecret: SECRET, fileName: "memo-2026.pdf", mediaType: "application/pdf" })).json();
  assert.equal(a.ok, true, JSON.stringify(a));
  const row = knocksOfRow(c, a.pseudonym, a.knockId);
  assert.equal(row.file_name, "memo-2026.pdf");
  assert.equal(row.media_type, "application/pdf");
  const got = c.inboxGet(a.knockId).item;
  assert.deepEqual([got.file_name, got.media_type], [row.file_name, row.media_type]);
  /* each read answers the sender's pair as the list does, bounded the same way */
  assert.deepEqual([listed(c, a.knockId).file_name, listed(c, a.knockId).media_type], [row.file_name, row.media_type]);
});

test("R27 R15 control: a knock that stated neither answers both absent (null) through knocksof as through inboxget", async () => {
  const { c, send } = setup();
  const a = await (await send({ contentText: "tip", knockerSecret: SECRET })).json();
  assert.equal(a.ok, true, JSON.stringify(a));
  const row = knocksOfRow(c, a.pseudonym, a.knockId);
  assert.equal("file_name" in row && "media_type" in row, true);
  assert.equal(row.file_name, null);
  assert.equal(row.media_type, null);
  assert.equal(c.inboxGet(a.knockId).item.file_name, null);
  assert.equal(c.inboxGet(a.knockId).item.media_type, null);
});
