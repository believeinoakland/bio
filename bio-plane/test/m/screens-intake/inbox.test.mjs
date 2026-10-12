/* screens-intake R7: the `inbox` screen on the real served page, its reads and three acts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, html, text, main, btn, fill, press, ok, refused, rawKeys } from "./page.mjs";

const K1 = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3 * 1048576, note: "The inspection sheets they don't publish.",
             received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd" };
const K2 = { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "2".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z",
             status: "discarded", resolve_reason: "Spam.", pseudonym: "P-1", knocker_digest: "dd" };
const K3 = { knock_id: "KNOCK-2026-09-01-33cc44dd", sha256: "3".repeat(64), bytes: 2048, note: "", received: "2026-09-01T10:00:00Z",
             status: "pulled", pseudonym: null, knocker_digest: null, capture_sha: "3".repeat(64) };
const LIST = ok({ inbox: [K1, K2, K3] });
const knock = (k, plane = {}) => open(`/app/inbox/${k.knock_id}`, { plane: { inbox: LIST, inboxget: ok({ ok: true, item: k }), ...plane } });

test("R7 reads inbox always and inboxget for the knock the address names", async () => {
  const p = await open("/app/inbox", { plane: { inbox: LIST } });
  assert.equal(p.byOp("inbox").length, 1);
  assert.equal(p.byOp("inboxget").length, 0);
  const q = await knock(K1);
  assert.equal(q.byOp("inboxget")[0].query.id, K1.knock_id);
  const e = await open("/app/inbox", { plane: { inbox: ok({ inbox: [] }) } });
  assert.match(text(e), /Nothing has been handed in/);
});

test("R7 each knock: what was handed in, its note, the same-knocker mark and, opened, the identification ladder", async () => {
  const p = await knock(K1);
  const t = text(p);
  assert.match(t, /3\.0 MB handed in on 3 October 2026/);
  assert.match(t, /Their note: “The inspection sheets they don't publish\.”/);
  assert.match(t, /Same knocker as 1 other knocks here/);
  assert.match(t, /No note came with it\./);
  assert.match(t, /Discarded: “Spam\.”/);
  assert.equal(main(p).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent, "Same knocker");
  assert.ok(main(p).querySelector(`a[href="/app/inbox/${K3.knock_id}"][data-nav]`));
  assert.deepEqual(rawKeys(p), []);
  /* control: a knock with no secret stands at Unknown */
  assert.equal(main(await knock(K3)).querySelector('[data-ladder="ident"] [aria-current="step"]').textContent, "Unknown");
});

test("R7 a new knock offers inboxpull and inboxresolve; one already pulled offers neither; the list alone draws no act", async () => {
  const p = await knock(K1);
  assert.ok(btn(p, "inboxpull"));
  assert.ok(btn(p, "inboxresolve"));
  assert.ok(btn(p, "sourcelink"));
  const q = await knock(K3);
  assert.equal(btn(q, "inboxpull"), null);
  assert.equal(btn(q, "inboxresolve"), null);
  assert.equal(main(await open("/app/inbox", { plane: { inbox: LIST } })).querySelector("button[data-act]"), null);
});

test("R7 inboxpull moves the knock into the record", async () => {
  const p = await knock(K1, { inboxpull: ok({ ok: true, document: {} }) });
  await press(p, "inboxpull", { reason: "It bears on our question." });
  assert.equal(p.byOp("inboxpull")[0].body.knockId, K1.knock_id);
  assert.match(text(p), /Moved into the record/);
  const q = await knock(K1, { inboxpull: ok({ ok: true, existed: true }) });
  await press(q, "inboxpull", { reason: "again" });
  assert.match(text(q), /Already in the record/);
});

test("R7 inboxresolve to discarded with the member's reason asked first; RESOLVE_NO_REASON drawn by its words, the knock left as it was", async () => {
  const p = await knock(K1, { inboxresolve: ok({ ok: true, status: "discarded" }) });
  const r0 = await press(p, "inboxresolve");
  assert.equal(p.byOp("inboxresolve").length, 0, "the reason is asked first");
  assert.ok(r0.slot().querySelector("textarea"));
  await press(p, "inboxresolve", { reason: "Nothing in it bears on our questions." });
  assert.deepEqual(p.byOp("inboxresolve")[0].body, { knockId: K1.knock_id, status: "discarded", reason: "Nothing in it bears on our questions." });
  assert.match(text(p), /Discarded, with your reason\./);
  const q = await knock(K1, { inboxresolve: refused("RESOLVE_NO_REASON", "the owner's words") });
  const r = await press(q, "inboxresolve", { reason: "x" });
  assert.match(r.slot().textContent, /Say why you are discarding it.*The knock is left as it was\./);
  assert.doesNotMatch(text(q), /Discarded, with your reason/);
});

test("R7 sourcelink records this knock's source as the same person as another, with what shows it", async () => {
  const p = await knock({ ...K1, source_id: "SRC-2026-AAAA" }, { sourcelink: ok({ ok: true }) });
  assert.equal(p.doc.getElementById("cx-source").value, "SRC-2026-AAAA");
  fill(p, { "cx-to": "SRC-2026-BBBB", "cx-evidence": "Same secret phrase." });
  await press(p, "sourcelink");
  assert.deepEqual(p.byOp("sourcelink")[0].body, { source: "SRC-2026-AAAA", to: "SRC-2026-BBBB", evidence: "Same secret phrase." });
  assert.match(text(p), /Recorded with the source/);
  const q = await knock(K1);
  fill(q, { "cx-to": "SRC-2026-BBBB", "cx-evidence": "x" });
  assert.match((await press(q, "sourcelink")).slot().textContent, /Move it into the record first/);
  fill(q, { "cx-source": "SRC-1", "cx-to": "", "cx-evidence": "x" });
  assert.match((await press(q, "sourcelink")).slot().textContent, /say: The same person as source\./);
  assert.equal(q.byOp("sourcelink").length, 0);
});
