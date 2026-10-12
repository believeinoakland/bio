/* screens-intake R7: the `inbox` screen, its reads and three acts, over the stand-in kit. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { pageScreen, kit, viewOf, press, ok } from "./kit.mjs";

const S = pageScreen(SCREENS.find((s) => s.id === "inbox"));
const draw = (view, opts) => S.render(kit(S, view, opts).cs, view);
const K1 = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3 * 1048576, note: "The inspection sheets they don't publish.",
             received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd" };
const K2 = { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "2".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z",
             status: "discarded", resolve_reason: "Spam.", pseudonym: "P-1", knocker_digest: "dd" };
const K3 = { knock_id: "KNOCK-2026-09-01-33cc44dd", sha256: "3".repeat(64), bytes: 2048, note: "", received: "2026-09-01T10:00:00Z",
             status: "pulled", pseudonym: null, knocker_digest: null, capture_sha: "3".repeat(64) };
const LIST = ok({ inbox: [K1, K2, K3] });

test("R7 reads inbox always and inboxget for the knock the address names", () => {
  const reads = S.reads(viewOf(S));
  assert.deepEqual(Object.keys(reads), ["list"]);
  assert.equal(reads.list.op, "inbox");
  assert.equal(reads.list.empty({ inbox: [] }), true);
  const one = S.reads(viewOf(S, { subject: K1.knock_id }));
  assert.equal(one.knock.op, "inboxget");
  assert.deepEqual({ ...one.knock.query }, { id: K1.knock_id });
  assert.match(draw(viewOf(S, { data: { list: { state: "empty" } } })), /Nothing has been handed in/);
});

test("R7 each knock: what was handed in, its note, the same-knocker mark and, opened, the identification ladder", () => {
  const html = draw(viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K1 }) } }));
  assert.match(html, /3\.0 MB handed in on <time data-iso="2026-10-03T10:00:00Z">/);
  assert.match(html, /Their note: “The inspection sheets they don&#39;t publish\.”/);
  assert.match(html, /Same knocker as 1 other knocks here/);
  assert.match(html, /No note came with it\./);
  assert.match(html, /Discarded: “Spam\.”/);
  assert.match(html, /data-ladder="ident"[\s\S]*aria-current="step">Same knocker</);
  assert.match(html, new RegExp(`data-ref="inbox:${K3.knock_id}"`));
  /* control: a knock with no secret stands at Unknown */
  const k3 = draw(viewOf(S, { subject: K3.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K3 }) } }));
  assert.match(k3, /aria-current="step">Unknown</);
});

test("R7 a new knock offers inboxpull and inboxresolve; one already pulled or discarded offers neither", () => {
  const html = draw(viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K1 }) } }));
  assert.match(html, /data-act="inboxpull"/);
  assert.match(html, /data-act="inboxresolve"/);
  assert.match(html, /data-act="sourcelink"/);
  const pulled = draw(viewOf(S, { subject: K3.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K3 }) } }));
  assert.doesNotMatch(pulled, /data-act="inboxpull"/);
  assert.doesNotMatch(pulled, /data-act="inboxresolve"/);
  /* the list alone draws no act */
  assert.doesNotMatch(draw(viewOf(S, { data: { list: LIST } })), /data-act=/);
});

test("R7 inboxpull moves the knock into the record", async () => {
  const v = viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K1 }) } });
  const r = await press(S, v, "inboxpull", { answers: { inboxpull: { ok: true, document: {} } } });
  assert.deepEqual(r.request.body, { knockId: K1.knock_id });
  assert.match(draw(v), /Moved into the record/);
  const v2 = viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K1 }) } });
  await press(S, v2, "inboxpull", { answers: { inboxpull: { ok: true, existed: true } } });
  assert.match(draw(v2), /Already in the record/);
});

test("R7 inboxresolve to discarded with the member's reason; RESOLVE_NO_REASON drawn by its words, the knock left as it was", async () => {
  const v = viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K1 }) } });
  const r = await press(S, v, "inboxresolve", { reason: "Nothing in it bears on our questions." });
  assert.deepEqual(r.request.body, { knockId: K1.knock_id, status: "discarded", reason: "Nothing in it bears on our questions." });
  assert.match(draw(v), /Discarded, with your reason\./);
  const v2 = viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: K1 }) } });
  const no = await press(S, v2, "inboxresolve", { reason: " ", answers: { inboxresolve: { ok: false, reason: "RESOLVE_NO_REASON" } } });
  assert.equal(no.refused.key, "screen.inbox.refusal.RESOLVE_NO_REASON");
  assert.match(no.refused.text, /The knock is left as it was\./);
  assert.doesNotMatch(draw(v2), /Discarded, with your reason/);
});

test("R7 sourcelink records this knock's source as the same person as another, with what shows it", async () => {
  const v = viewOf(S, { subject: K1.knock_id, data: { list: LIST, knock: ok({ ok: true, item: { ...K1, source_id: "SRC-2026-AAAA" } }) } });
  assert.match(draw(v), /id="cx-source" value="SRC-2026-AAAA"/);
  const r = await press(S, v, "sourcelink", { values: { "cx-source": "SRC-2026-AAAA", "cx-to": "SRC-2026-BBBB", "cx-evidence": "Same secret phrase." } });
  assert.deepEqual(r.request.body, { source: "SRC-2026-AAAA", to: "SRC-2026-BBBB", evidence: "Same secret phrase." });
  assert.match(draw(v), /Recorded with the source/);
  const nos = await press(S, v, "sourcelink", { values: { "cx-to": "SRC-2026-BBBB", "cx-evidence": "x" } });
  assert.equal(nos.refused.key, "screen.inbox.link.nosource");
  const miss = await press(S, v, "sourcelink", { values: { "cx-source": "SRC-2026-AAAA" } });
  assert.match(miss.refused.text, /The same person as source, What shows it is the same person/);
});
