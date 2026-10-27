/* store-assembly's copy of plane's test. reevaluation R14, R25 (fix round 6, G36; K4426-K4428, K4602; `build/plan/diagnosis-R6-2a.md`): THE SEAM TEST of C69's "newer version" item, with the
   real Durable Object the plane builds (every module real: capture, extraction, content, promotion, inquiry, reevaluation, the scheduler and its
   alarm, queue-producers' Queue) and the platform modelled as it was on the walker's day: an alarm left spent (the platform's retries gone) that no
   one re-set. The inputs are the member's own acts: a page captured and filed, read, a passage of it marked citable (`op=contentmint`), a question
   resting on that passage, the same address captured again. The object is then restarted over the same storage with the spent alarm and the alarm is
   fired as the platform fires it; the sweep must raise the notice and `op=queue` must hold the item. `reevaluation/sweep.test.mjs` drives the sweep on
   a stand-in host (the gap this closes); the order of the newer capture's reading and the sweep is not the platform's to promise, so both orders run. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./alarmed-store.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { reevaluationOf } from "../../../src/reevaluation/index.mjs";
import { inquiryMd, infoMd } from "../reevaluation/fixture.mjs";

const ADMIN = "class:admin";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const page = (text) => `<!doctype html><html><head><title>Budget</title></head><body><p>${text}</p></body></html>`;

/** The platform's alarm, as it runs a due one: fires `onAlarm` at the alarm's instant while one stands and work is left to find. */
async function platformFires(x, done, limit = 12) {
  const fired = [];
  for (let i = 0; i < limit && !done(); i++) {
    const at = await x.ctx.storage.getAlarm();
    if (at === null) break;
    fired.push(at);
    await x.s.onAlarm(Math.max(at, Date.now()) + 1);
  }
  return fired;
}

/** A page captured at `locator` as the member's acquire does, then filed as the promotion files it (a bundle holding the bytes, the provenance
 *  document the acquire answered, the register row), and read as the alarm's ledger reads it. */
async function held(x, locator, text, id) {
  const real = globalThis.fetch, body = page(text);
  globalThis.fetch = async () => new Response(body, { headers: { "content-type": "text/html" } });
  let a;
  try { a = await captureOf(x.ctx).acquire({ locator }, { cls: "member", member: true, sessMember: "member:ann", storeName: "bio" }); }
  finally { globalThis.fetch = real; }
  assert.equal(a.status, 200, JSON.stringify(a.body).slice(0, 300));
  const sha = a.body.document.capture.sha256, file = `${a.body.document.file}.html`;
  const filed = promotionOf(x.ctx).promote({ bundleId: id, base: null, snapKey: `k-${id}`, author: "member:ann",
    files: [{ path: "bundle.md", text: infoMd(id, ["group: test-group"]) }, { path: file, text: body },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [{ ...a.body.document, file }] }) }],
    meta: { object_type: "information" },
    register: [{ sha256: sha, path: file, encoding: "utf8", bytes: Buffer.byteLength(body) }] });
  assert.equal(filed.ok, true, JSON.stringify(filed).slice(0, 300));
  return { sha, id, read: () => extractionOf(x.ctx).readHeld({ sha, storeName: "bio", env: x.env }) };
}

/** The walker's items of the kind, read through the door as the Queue is. */
async function newerItems(x) {
  const res = await (await x.fetch(`/queue?viewer=${ADMIN}`)).json();
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
  return res.result.items.filter((i) => i.kind === "newer-capture-affects-reference");
}

/** The member's acts up to the second capture: capture, file, read, mark the passage, rest a question on it. */
async function cited(x, locator, text, tag) {
  const first = await held(x, locator, text, `INFO-2026-0001-${tag}`);
  assert.equal((await first.read()).read, true);
  const minted = await x.fetch(`/contentmint?viewer=member:ann&mintedBy=member:ann`, { method: "POST",
    body: JSON.stringify({ bundleId: first.id, extent: { kind: "document" } }) });
  const m = (await minted.json()).result;
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const Q = `INQ-2026-0001-${tag}`;
  const q = promotionOf(x.ctx).promote({ bundleId: Q, base: null, snapKey: `k-${Q}`, author: "member:ann",
    files: [{ path: "bundle.md", text: inquiryMd(Q, { legs: [{ target: first.id, content_id: m.content_id }] }) }],
    meta: { object_type: "inquiry" } });
  assert.equal(q.ok, true, JSON.stringify(q).slice(0, 300));
  return { first, Q, cid: m.content_id };
}

for (const newerReadFirst of [false, true]) {
  test(`R14 R25 seam (G36): capture, cite, capture again, the object restarted over a spent alarm: the alarm is set afresh, the sweep raises the notice and the Queue holds the newer-version item (the newer capture read ${newerReadFirst ? "before" : "after"} the sweep)`, async () => {
    const tag = newerReadFirst ? "rf" : "rl";
    const first = await store({ env: { CAPTURES: multipartBucket() } });
    const { Q, cid, first: one } = await cited(first, `https://city.example.org/budget-${tag}`, `The city budget was cut by ten percent (${tag}).`, tag);
    await sleep(1100);   /* the chain orders captures by their whole-second retrieval instants */
    const two = await held(first, `https://city.example.org/budget-${tag}`, `The city budget was restored in full (${tag}).`, `INFO-2026-0002-${tag}`);
    assert.notEqual(two.sha, one.sha);
    assert.notEqual(reevaluationOf(first.ctx).noticeSweepDue(Date.now()), null, "the sweep is pending: a leg rests on a passage");
    /* the platform left the alarm spent and the object is restarted over the same storage (a deploy's) */
    const spent = Date.now() - 48 * 3_600_000;   /* older than every wake the consumers want, so only a heal moves it (the platform never runs it) */
    const x = await store({ db: first.db, env: first.env, before: (ctx) => ctx.storage.setAlarm(spent) });
    const set = await x.ctx.storage.getAlarm();
    assert.ok(set !== null && set !== spent, `the restart set the alarm afresh: the platform runs an alarm it is given, never the spent one it was left (${set})`);
    const r = reevaluationOf(x.ctx);
    assert.equal(r.notices({ viewer: ADMIN }).count, 0, "no notice yet: nothing has run");
    if (newerReadFirst) assert.equal((await two.read()).read, true);
    const fired = await platformFires(x, () => r.notices({ viewer: ADMIN }).count > 0);
    assert.ok(fired.length >= 1, "the platform fired the alarm");
    const notices = r.notices({ viewer: ADMIN }).notices;
    assert.deepEqual(notices.map((n) => [n.holder, n.content_id, n.capture_sha, n.newer_capture, n.state]), [[Q, cid, one.sha, two.sha, "open"]]);
    if (!newerReadFirst) await two.read();
    const items = await newerItems(x);
    assert.equal(items.length, 1, JSON.stringify(items.map((i) => i.id)));
    assert.equal(items[0].id, `FINDING::newer-capture-affects-reference::${notices[0].notice}`);
    assert.deepEqual([items[0].subject.holder, items[0].subject.newer_capture, items[0].subject.capture_sha], [Q, two.sha, one.sha]);
    /* reevaluation R41 (G89, K4774): a notice raised before its copy was read keeps the sweep pending until one more tick
       re-grades it; then the pass is complete */
    r.noticeSweep(Date.now());
    assert.equal(r.noticeSweepDue(Date.now()), null, "the pass is complete: the sweep rests");
  });
}

test("R14 R25 seam (G36), control: a page captured again with no question resting on any passage of it raises no notice and the Queue holds no newer-version item, the sweep not pending", async () => {
  const x = await store({ env: { CAPTURES: multipartBucket() } });
  const a = await held(x, "https://city.example.org/budget-ctl", "The city budget was cut by ten percent (ctl).", "INFO-2026-0001-ctl");
  await a.read();
  await sleep(1100);
  const b = await held(x, "https://city.example.org/budget-ctl", "The city budget was restored in full (ctl).", "INFO-2026-0002-ctl");
  await b.read();
  const r = reevaluationOf(x.ctx);
  assert.equal(r.noticeSweepDue(Date.now()), null);
  await platformFires(x, () => false, 3);
  assert.equal(r.notices({ viewer: ADMIN }).count, 0);
  assert.deepEqual(await newerItems(x), []);
});
