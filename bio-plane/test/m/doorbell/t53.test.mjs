/* doorbell R29 and R30 (T53; DEC-459, K5519; N824, DEC-108 (5)), at the module's interface: a pulled knock's document carries the
   knocker's file name as the knocker's word, and discarded knocks are cleared a week after receipt, never under a hold. Over
   fixture.mjs; the litigation-hold reader is registered as `actions` registers it (R3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { DISCARD_DAYS } from "../../../src/doorbell/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { fileSafetyOf } from "../../../src/file-safety/index.mjs";
import { scanner, pdf as fsPdf, enc } from "../file-safety/fixture.mjs";

const setup = (opts = {}) => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", ...opts } });
  return { ...f, b };
};
const DAY = 86400000, MIN = 60000, HOUR = 3600000;
const NOW = Date.parse("2026-11-20T12:00:00Z");
const reason = "kept for the test";
const gone = (rows, id) => rows(`SELECT 1 AS x FROM inbox WHERE knock_id = ?`, id).length === 0;
const discard = (c, id) => assert.equal(c.inboxResolve({ knockId: id, status: "discarded", by: "member:m1", reason }).ok, true);
/* a knock received `ago` ms before NOW, then discarded */
async function discardedAgo(c, content, ago, extra = {}) {
  const k = await c.knock({ content, sourceAddress: `9.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`, now: NOW - ago, ...extra });
  assert.equal(k.ok, true, JSON.stringify(k));
  discard(c, k.knockId);
  return k;
}
const holdReader = (c, fn) => assert.equal(c.registerReader("litigation-hold", "actions", fn).ok, true);

test("R29: a pulled knock's document carries the file name the knocker sent as the knocker's word, null when none was sent", async () => {
  const { c } = setup();
  const named = await c.knock({ content: "with a name", fileName: "notice.pdf", mediaType: "application/pdf", sourceAddress: "1.1.1.1" });
  const bare = await c.knock({ content: "without a name", sourceAddress: "1.1.1.2" });
  const a = await c.pullKnock({ knockId: named.knockId, by: "m1", at: "2026-11-01T10:00:00Z" });
  const b = await c.pullKnock({ knockId: bare.knockId, by: "m1", at: "2026-11-01T10:00:00Z" });
  assert.equal(a.ok, true); assert.equal(b.ok, true);
  assert.deepEqual(a.document.knocker_file_name, { text: "notice.pdf", words_of: "the knocker", evidence_of_truth: false });
  assert.equal(b.document.knocker_file_name, null);
});

test("R29 control: the other fields of the document are as before, the contact is never carried and a repeat pull answers the stored document", async () => {
  const { c } = setup();
  const k = await c.knock({ content: "control", note: "a note", contact: "tipster@example.org", fileName: "notice.pdf", sourceAddress: "1.1.1.1" });
  const r = await c.pullKnock({ knockId: k.knockId, by: "m1", at: "2026-11-01T10:00:00Z" });
  assert.deepEqual(r.document.knocker_note, { text: "a note", words_of: "the knocker", evidence_of_truth: false });
  assert.equal(r.document.source.kind, "knocker");
  assert.ok(!JSON.stringify(r).includes("tipster"), "no contact");
  const again = await c.pullKnock({ knockId: k.knockId, by: "m2" });
  assert.equal(again.existed, true);
  assert.deepEqual(again.document.knocker_file_name, { text: "notice.pdf", words_of: "the knocker", evidence_of_truth: false });
  assert.ok(!JSON.stringify(again).includes("tipster"), "no contact on the repeat");
});

test("R30: the week is runtime-limits' figure, and a discarded knock received a week and a minute ago is cleared with its bytes while one received 6 days 23 hours ago stays", async () => {
  assert.equal(DISCARD_DAYS, boundOf("doorbell", "discard_days"));
  assert.equal(DISCARD_DAYS, 7);
  const { c, rows, b } = setup();
  holdReader(c, () => false);
  const due = await discardedAgo(c, "old enough", DISCARD_DAYS * DAY + MIN);
  const young = await discardedAgo(c, "too young", 6 * DAY + 23 * HOUR);
  const key = (d) => `bio/inbox/${d.sha256}`;
  assert.ok(b.held.has(key(due)) && b.held.has(key(young)));
  const r = await c.clearDiscarded({ now: NOW });
  assert.deepEqual([r.ok, r.cleared, r.truncated, r.held], [true, 1, false, false]);
  assert.equal(gone(rows, due.knockId), true);
  assert.equal(b.held.has(key(due)), false, "its bytes are gone");
  assert.equal(gone(rows, young.knockId), false);
  assert.equal(b.held.has(key(young)), true);
  assert.equal(c.discardClearDue(NOW), new Date(NOW - 6 * DAY - 23 * HOUR + DISCARD_DAYS * DAY).toISOString(), "the earliest instant a discarded knock becomes due");
  assert.equal(c.discardClearWake(NOW), c.discardClearDue(NOW));
  const second = await c.clearDiscarded({ now: NOW });
  assert.deepEqual([second.ok, second.cleared], [true, 0], "a second call over the same instant clears nothing more");
  assert.equal((await c.clearDiscarded({ now: NOW + DAY })).cleared, 1, "the young one is due a day later");
  assert.equal(c.discardClearDue(NOW), null, "none left");
  assert.equal(c.discardClearWake(NOW), null);
});

test("R30: only a discarded knock is ever cleared: new and pulled knocks received 30 days ago stay, and a knock put back to new before the clearing is not cleared", async () => {
  const { c, rows } = setup();
  holdReader(c, () => false);
  const fresh30 = await c.knock({ content: "still new", sourceAddress: "2.2.2.2", now: NOW - 30 * DAY });
  const pulled = await c.knock({ content: "pulled in", sourceAddress: "2.2.2.3", now: NOW - 30 * DAY });
  assert.equal((await c.pullKnock({ knockId: pulled.knockId, by: "m1", at: "2026-10-01T10:00:00Z" })).ok, true);
  const back = await discardedAgo(c, "put back", 30 * DAY);
  assert.equal(c.inboxResolve({ knockId: back.knockId, status: "new", by: "member:m1", reason }).ok, true);
  const r = await c.clearDiscarded({ now: NOW });
  assert.deepEqual([r.cleared, r.held], [0, false]);
  for (const k of [fresh30, pulled, back]) assert.equal(gone(rows, k.knockId), false, k.knockId);
  assert.equal(c.discardClearDue(NOW), null);
});

test("R30: with the reader answering true, throwing, answering a promise or not registered, nothing is cleared and the answer says held", async () => {
  for (const fn of [() => true, () => { throw new Error("no"); }, () => Promise.resolve(false), undefined]) {
    const { c, rows, b } = setup();
    if (fn) holdReader(c, fn);
    const k = await discardedAgo(c, "held back", 8 * DAY);
    const r = await c.clearDiscarded({ now: NOW });
    assert.deepEqual([r.ok, r.cleared, r.held], [true, 0, true], String(fn));
    assert.equal(typeof r.basis, "string");
    assert.equal(gone(rows, k.knockId), false);
    assert.equal(b.held.has(`bio/inbox/${k.sha256}`), true);
  }
});

test("R30: a hold placed between two calls stops the second", async () => {
  const { c, rows } = setup();
  let held = false;
  holdReader(c, () => held);
  const a = await discardedAgo(c, "first", 9 * DAY), z = await discardedAgo(c, "second", 8 * DAY);
  assert.equal((await c.clearDiscarded({ now: NOW, limit: 1 })).cleared, 1);
  assert.equal(gone(rows, a.knockId), true, "oldest received first");
  held = true;
  const r = await c.clearDiscarded({ now: NOW });
  assert.deepEqual([r.cleared, r.held], [0, true]);
  assert.equal(gone(rows, z.knockId), false);
});

test("R30: bytes also held by the record survive, and a digest another knock still names keeps its bytes", async () => {
  const { c, rows, b } = setup();
  holdReader(c, () => false);
  const d = await discardedAgo(c, "shared bytes", 8 * DAY, { sourceAddress: "3.3.3.1" });
  const other = await c.knock({ content: "shared bytes", sourceAddress: "3.3.3.2", now: NOW });
  assert.equal(other.sha256, d.sha256);
  b.held.set(`bio/captures/${d.sha256}`, new TextEncoder().encode("shared bytes"));
  assert.equal((await c.clearDiscarded({ now: NOW })).cleared, 1);
  assert.equal(gone(rows, d.knockId), true);
  assert.equal(b.held.has(`bio/inbox/${d.sha256}`), true, "the other knock's row still names the digest");
  assert.equal(b.held.has(`bio/captures/${d.sha256}`), true, "the record's own key is untouched");
});

test("R30: limit 1 over three due knocks clears one and states truncated", async () => {
  const { c, rows } = setup();
  holdReader(c, () => false);
  const ks = [];
  for (const [i, ago] of [[1, 10 * DAY], [2, 9 * DAY], [3, 8 * DAY]]) ks.push(await discardedAgo(c, `due ${i}`, ago));
  const r = await c.clearDiscarded({ now: NOW, limit: 1 });
  assert.deepEqual([r.ok, r.cleared, r.truncated], [true, 1, true]);
  assert.deepEqual(ks.map((k) => gone(rows, k.knockId)), [true, false, false]);
  const rest = await c.clearDiscarded({ now: NOW });
  assert.deepEqual([rest.cleared, rest.truncated], [2, false]);
});

test("R30: a failed removal of the bytes keeps the row, and the next call finishes it; the clearing writes no tally and leaves the others' reads as before", async () => {
  const { c, rows, b } = setup();
  holdReader(c, () => false);
  const k = await discardedAgo(c, "stubborn", 8 * DAY);
  const tally = () => JSON.stringify(rows(`SELECT * FROM doorbell_tally`));
  const before = tally();
  const del = b.delete;
  b.delete = async () => { throw new Error("killed"); };
  const r = await c.clearDiscarded({ now: NOW });
  assert.deepEqual([r.ok, r.cleared], [true, 0]);
  assert.equal(gone(rows, k.knockId), false);
  b.delete = del;
  assert.equal((await c.clearDiscarded({ now: NOW })).cleared, 1);
  assert.equal(gone(rows, k.knockId), true);
  assert.equal(b.held.has(`bio/inbox/${k.sha256}`), false);
  assert.equal(tally(), before, "R19's tally is the same after a clearing");
  assert.equal(c.inboxList(null).inbox.length, 0);
});

test("R30: a knock stored inline (no evidence store) is cleared by its row alone, and the clearing is never done at read time", async () => {
  const f = fresh({ env: { INSTANCE_NAME: "inst" } });
  const { c, rows } = f;
  holdReader(c, () => false);
  const k = await discardedAgo(c, "inline", 8 * DAY);
  c.inboxList(null); c.inboxGet(k.knockId);
  assert.equal(gone(rows, k.knockId), false, "a read clears nothing");
  assert.equal((await c.clearDiscarded({ now: NOW })).cleared, 1);
  assert.equal(gone(rows, k.knockId), true);
});

/* ---- R31 (DEC-479 (45)): `inboxView`. The refusals that come before the scan are this module's own and are tested here with a
   file-safety that fails the test if it is asked; the safe view itself and the scan's refusals wait on file-safety's R71 (todo). ---- */
const MEMBER = "member:alice";
const untouched = () => ({ safeViewOfBytes() { throw new Error("file-safety must not be asked"); } });
const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name).map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);

test("R31: only a signed-in member looks at a knock, a knock no knock answers to is NO_SUCH_KNOCK, and nothing is written", async () => {
  const { c, rows } = setup();
  c.fileSafety = untouched();
  const k = await c.knock({ content: "a tip", sourceAddress: "4.4.4.1" });
  const before = everything(rows);
  for (const viewer of [null, undefined, "", "nonsense", "machine:probe"]) {
    const r = await c.inboxView({ knockId: k.knockId, viewer });
    assert.deepEqual([r.ok, r.reason, r.status], [false, "MEMBER_SESSION_REQUIRED", 403], String(viewer));
  }
  const none = await c.inboxView({ knockId: "KNOCK-none", viewer: MEMBER });
  assert.deepEqual([none.ok, none.reason, none.code, none.check], [false, "NO_SUCH_KNOCK", "NO_SUCH_KNOCK", "C-118.2"]);
  assert.deepEqual(everything(rows), before);
});

test("R31: bytes altered in storage are KNOCK_BYTES_CHANGED, in the words of screen.inbox.view.changed, and file-safety is not asked; bytes gone are EVIDENCE_NOT_HELD", async () => {
  const { c, rows, b } = setup();
  c.fileSafety = untouched();
  const k = await c.knock({ content: "what was handed in", sourceAddress: "4.4.4.2" });
  const key = `bio/inbox/${k.sha256}`;
  const before = everything(rows);
  b.held.set(key, new TextEncoder().encode("something else"));
  const changed = await c.inboxView({ knockId: k.knockId, viewer: MEMBER });
  assert.deepEqual([changed.ok, changed.reason, changed.code, changed.check, changed.translation],
                   [false, "KNOCK_BYTES_CHANGED", "KNOCK_BYTES_CHANGED", "C-85.6", word("screen.inbox.view.changed")]);
  b.held.delete(key);
  const absent = await c.inboxView({ knockId: k.knockId, viewer: MEMBER });
  assert.deepEqual([absent.ok, absent.reason], [false, "EVIDENCE_NOT_HELD"]);
  assert.deepEqual(everything(rows), before, "the inbox row and every other table as they were");
});

test("R31 control: a refused look leaves the knock pullable as R13 states", async () => {
  const { c, rows, b } = setup();
  c.fileSafety = untouched();
  const k = await c.knock({ content: "still pullable", sourceAddress: "4.4.4.3" });
  b.held.set(`bio/inbox/${k.sha256}`, new TextEncoder().encode("altered"));
  assert.equal((await c.inboxView({ knockId: k.knockId, viewer: MEMBER })).reason, "KNOCK_BYTES_CHANGED");
  assert.equal(rows(`SELECT status FROM inbox WHERE knock_id = ?`, k.knockId)[0].status, "new");
});

/* the seam, over file-safety's real code (R71) on the same storage, its scripted scanner and its own fixtures (K4990) */
function seamed() {
  const w = setup();
  const scanBinding = scanner({});
  const fs = fileSafetyOf(w.ctx, { record: w.core, env: { CAPTURES: w.b, FILE_SCANNER: scanBinding }, now: () => NOW });
  fs.migrate();
  w.c.fileSafety = fs;
  return { ...w, fs };
}
const knockWith = (c, bytes, extra = {}) => c.knock({ contentB64: Buffer.from(bytes).toString("base64"), sourceAddress: `5.5.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`, ...extra });
const withoutFileSafety = (rows) => everything(rows).filter(([t]) => !t.startsWith("fs_"));

test("R31: a knock holding a PDF answers the safe view's pages, and afterwards the inbox row is unchanged (status new, no receipt, no capture) and no row names the member", async () => {
  const { c, rows, b } = seamed();
  const bytes = fsPdf(false, "knock");
  const k = await knockWith(c, bytes, { fileName: "notice.pdf", mediaType: "application/pdf" });
  assert.equal(k.ok, true, JSON.stringify(k));
  const before = JSON.stringify(rows(`SELECT * FROM inbox WHERE knock_id = ?`, k.knockId));
  const others = withoutFileSafety(rows).filter(([t]) => t !== "inbox");
  const heldBefore = new Set(b.held.keys());
  const v = await c.inboxView({ knockId: k.knockId, viewer: MEMBER });
  assert.deepEqual([v.ok, v.kind, v.knockId], [true, "pdf", k.knockId], JSON.stringify({ ...v, bytes: undefined }));
  assert.ok(v.pages >= 0 && v.statement && v.statement.key, "stated as a view");
  assert.equal(JSON.stringify(rows(`SELECT * FROM inbox WHERE knock_id = ?`, k.knockId)), before, "the inbox row is as it was");
  assert.equal(rows(`SELECT status FROM inbox WHERE knock_id = ?`, k.knockId)[0].status, "new");
  assert.deepEqual(withoutFileSafety(rows).filter(([t]) => t !== "inbox"), others, "no receipt, capture, bundle, actor or job row");
  assert.deepEqual(new Set(b.held.keys()), heldBefore, "no bytes left behind");
  assert.ok(!JSON.stringify(everything(rows)).includes(MEMBER), "no row names the member");
  assert.equal((await c.pullKnock({ knockId: k.knockId, by: "m1", at: "2026-11-01T10:00:00Z" })).ok, true, "control: R13 still files the knock");
});

test("R31: a CSV answers its figures as data", async () => {
  const { c } = seamed();
  const k = await knockWith(c, enc("n,label\n1,one\n2,two\n"));
  const v = await c.inboxView({ knockId: k.knockId, viewer: MEMBER });
  assert.deepEqual([v.ok, v.kind], [true, "data"]);
  assert.ok(v.sheets[0].cells.length >= 6);
});

test("R31: an encrypted file, a kind with no safe view and bytes altered in storage each refuse as stated, in the words by key, and write nothing", async () => {
  const { c, rows, b } = seamed();
  const locked = await knockWith(c, enc("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R/Encrypt 2 0 R>>\n%%EOF"));
  const tiff = await knockWith(c, new Uint8Array([0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0, 9]));
  const plain = await knockWith(c, enc("what was handed in"));
  const before = everything(rows);
  const e = await c.inboxView({ knockId: locked.knockId, viewer: MEMBER });
  assert.deepEqual([e.ok, e.reason, e.renderer_reason, e.translation], [false, "SAFE_VIEW_FAILED", "ENCRYPTED", word("file-safety.index.the_file_is_encrypted_so_no_safe_view")]);
  const n = await c.inboxView({ knockId: tiff.knockId, viewer: MEMBER });
  assert.deepEqual([n.ok, n.reason, n.translation], [false, "NO_SAFE_VIEW", word("screen.inbox.view.nokind")]);
  b.held.set(`bio/inbox/${plain.sha256}`, enc("something else"));
  const ch = await c.inboxView({ knockId: plain.knockId, viewer: MEMBER });
  assert.deepEqual([ch.ok, ch.reason, ch.check, ch.translation], [false, "KNOCK_BYTES_CHANGED", "C-85.6", word("screen.inbox.view.changed")]);
  assert.deepEqual(everything(rows), before);
});
