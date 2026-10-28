/* mail-door R3, R4, R6: the waiting list, read by its owner alone, the headers as the message states them, and removal. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, addressFor, plain, eml, STANDARD, withAttachments, attachmentPart, sha, T0, DAY, HOUR } from "./fixture.mjs";
import { MAIL_CHECKS } from "../../../src/mail-door/checks.mjs";
import { CLEAR_LIMIT, WAITING_PAGE_MAX } from "../../../src/mail-door/index.mjs";

async function two() {
  const env = fresh();
  const ann = await addressFor(env.d, "ann"), bo = await addressFor(env.d, "bo");
  return { ...env, ann, bo };
}

test("R3 a member lists only her own mail, newest first; another member's id answers NO_SUCH_MAIL, one answer for absent and not hers", async () => {
  const { d, ann, bo } = await two();
  const a1 = await d.receiveMail({ raw: plain("a1"), envelope_to: ann, now: T0 });
  const a2 = await d.receiveMail({ raw: plain("a2"), envelope_to: ann, now: T0 + 1000 });
  const b1 = await d.receiveMail({ raw: plain("b1"), envelope_to: bo, now: T0 });
  assert.deepEqual(d.mailWaiting({ viewer: "member:ann" }).mail.map((m) => m.id), [a2.id, a1.id]);
  assert.deepEqual(d.mailWaiting({ viewer: "member:bo" }).mail.map((m) => m.id), [b1.id]);
  const notHers = await d.mailRead({ id: b1.id, viewer: "member:ann" });
  const absent = await d.mailRead({ id: "MAIL-2026-10-06-00000000", viewer: "member:ann" });
  assert.deepEqual([notHers.reason, notHers.check, notHers.translation], ["NO_SUCH_MAIL", MAIL_CHECKS.NO_SUCH_MAIL.check, MAIL_CHECKS.NO_SUCH_MAIL.translation]);
  assert.deepEqual([absent.reason, absent.translation], [notHers.reason, notHers.translation]);
  assert.equal(d.mailWaiting({ viewer: "token:member" }).reason, "MEMBER_SESSION_REQUIRED");
});

test("R3 the bytes are under the private key bio/mail/<sha256>, outside the record: no bundle, register row or receipt names them", async () => {
  const { d, b, rows, ann, cap } = await two();
  const bytes = plain("private");
  await d.receiveMail({ raw: bytes, envelope_to: ann, now: T0 });
  assert.deepEqual([...b.held.keys()], [`bio/mail/${sha(bytes)}`]);
  assert.equal(rows(`SELECT COUNT(*) AS n FROM bundles`)[0].n, 0);
  assert.equal(rows(`SELECT COUNT(*) AS n FROM register`)[0].n, 0);
  assert.deepEqual(cap.provenance.receipts, []);
});

test("R3 the list pages at most 200 rows with `next`", async () => {
  const { d, ann } = await two();
  /* rows beyond what the rate admits in one hour: sent over many hours */
  for (let i = 0; i < 5; i++) await d.receiveMail({ raw: plain(`p${i}`), envelope_to: ann, now: T0 + i * HOUR });
  const p1 = d.mailWaiting({ viewer: "member:ann", limit: 2 });
  assert.deepEqual([p1.mail.length, p1.truncated], [2, true]);
  const p2 = d.mailWaiting({ viewer: "member:ann", limit: 2, after: p1.next });
  const p3 = d.mailWaiting({ viewer: "member:ann", limit: 2, after: p2.next });
  assert.deepEqual([p3.mail.length, p3.truncated, p3.next], [1, false, null]);
  assert.equal(new Set([...p1.mail, ...p2.mail, ...p3.mail].map((m) => m.id)).size, 5);
  assert.equal(d.mailWaiting({ viewer: "member:ann", limit: 5000 }).limit, WAITING_PAGE_MAX);
  assert.equal(d.mailWaiting({ viewer: "member:ann", after: "not-a-cursor" }).reason, "BAD_CURSOR");
});

test("R4 a message whose From names someone shows that name as stated, the receiving member is the owner, and nothing is graded", async () => {
  const { d, ann } = await two();
  const r = await d.receiveMail({ raw: eml(["From: Bo Member <bo@example.org>", ...STANDARD.slice(1)], "text"), envelope_to: ann, now: T0 });
  const m = (await d.mailRead({ id: r.id, viewer: "member:ann" })).mail;
  assert.equal(m.headers.from, "Bo Member <bo@example.org>");
  assert.equal(typeof m.stated_by, "string");
  assert.equal(d.mailWaiting({ viewer: "member:bo" }).mail.length, 0, "the sender is not the owner");
  assert.equal(d.mailWaiting({ viewer: "member:ann" }).mail[0].id, r.id);
  assert.equal("grade" in m, false);
});

test("R4 a malformed Date answers null with its reason; control: a well-formed message answers every field", async () => {
  const { d, ann } = await two();
  const bad = await d.receiveMail({ raw: eml([...STANDARD.filter((h) => !h.startsWith("Date:")), "Date: not a date"], "x"), envelope_to: ann, now: T0 });
  const mb = (await d.mailRead({ id: bad.id, viewer: "member:ann" })).mail;
  assert.equal(mb.headers.date, null);
  assert.equal(typeof mb.unreadable.date, "string");
  const good = await d.receiveMail({ raw: eml([...STANDARD, "Received: from relay.example.org by mx.example.org", "Authentication-Results: mx.example.org; spf=pass"], "body"), envelope_to: ann, now: T0 });
  const mg = (await d.mailRead({ id: good.id, viewer: "member:ann" })).mail;
  for (const k of ["from", "to", "cc", "date", "subject", "message_id", "received", "authentication_results"]) assert.notEqual(mg.headers[k], null, k);
  assert.equal(mg.text.trim(), "body");
  assert.deepEqual(mg.unreadable, {});
});

test("R3 mailRead lists the attachments by name and size as stated, never opened", async () => {
  const { d, ann } = await two();
  const r = await d.receiveMail({ raw: withAttachments([attachmentPart("minutes.pdf", "application/pdf", "%PDF-1.4 x"), attachmentPart("budget.csv", "text/csv", "a,b\n1,2\n")]), envelope_to: ann, now: T0 });
  const m = (await d.mailRead({ id: r.id, viewer: "member:ann" })).mail;
  assert.deepEqual(m.attachments.map((a) => a.name_stated), ["minutes.pdf", "budget.csv"]);
  assert.ok(m.attachments.every((a) => Number.isInteger(a.size) && Object.keys(a).sort().join() === "index,name_stated,size"));
});

test("R6 a row received 14 days and 1 minute before the instance clock is gone after the tick, with its bytes; one 13 days old stays", async () => {
  const { d, b, ann } = await two();
  const old = await d.receiveMail({ raw: plain("old"), envelope_to: ann, now: T0 });
  const young = await d.receiveMail({ raw: plain("young"), envelope_to: ann, now: T0 + DAY });
  const now = T0 + 14 * DAY + 60000;
  assert.equal(d.mailClearDue(now), true);
  assert.equal(d.mailClearWake(now), T0 + 14 * DAY);
  const r = await d.clearWaitingMail({ now });
  assert.deepEqual([r.ok, r.cleared, r.truncated], [true, 1, false]);
  assert.deepEqual(d.mailWaiting({ viewer: "member:ann", now }).mail.map((m) => m.id), [young.id]);
  assert.equal(b.held.has(`bio/mail/${old.sha256}`), false);
  assert.equal(b.held.has(`bio/mail/${young.sha256}`), true);
  assert.equal(d.mailClearDue(now), false);
  assert.equal(d.mailWaiting({ viewer: "member:ann", now }).mail[0].days_left, 1);
});

test("R6 the answer names each owner of a removed row with its count and received dates and no header; an owner with nothing removed is not named", async () => {
  const { d, ann, bo } = await two();
  await d.receiveMail({ raw: eml(STANDARD, "secret subject body"), envelope_to: ann, now: T0 });
  await d.receiveMail({ raw: plain("a2"), envelope_to: ann, now: T0 + 1000 });
  await d.receiveMail({ raw: plain("bo"), envelope_to: bo, now: T0 + 5 * DAY });
  const r = await d.clearWaitingMail({ now: T0 + 15 * DAY });
  assert.deepEqual(r.owners, [{ owner: "ann", count: 2, received: [new Date(T0).toISOString(), new Date(T0 + 1000).toISOString()] }]);
  const text = JSON.stringify(r);
  for (const h of ["Ada Lane", "ada@example.org", "Records request", "secret"]) assert.equal(text.includes(h), false, h);
});

test("R6 `limit: 1` over three due rows clears one and states `truncated`; the limit is clamped 1 to 1000", async () => {
  const { d, ann } = await two();
  for (let i = 0; i < 3; i++) await d.receiveMail({ raw: plain(`d${i}`), envelope_to: ann, now: T0 + i });
  const r = await d.clearWaitingMail({ now: T0 + 20 * DAY, limit: 1 });
  assert.deepEqual([r.cleared, r.truncated], [1, true]);
  assert.deepEqual([(await d.clearWaitingMail({ now: T0 + 20 * DAY, limit: 0 })).cleared, CLEAR_LIMIT.max, CLEAR_LIMIT.default], [1, 1000, 200]);
  assert.deepEqual(await d.clearWaitingMail({ now: T0 + 20 * DAY }), { ok: true, cleared: 1, truncated: false, owners: [{ owner: "ann", count: 1, received: [new Date(T0 + 2).toISOString()] }] });
  assert.equal(d.mailClearWake(T0), null);
});

test("R6 mailDelete removes the member's own row and its bytes at once, with no reason; another member's id answers NO_SUCH_MAIL", async () => {
  const { d, b, ann } = await two();
  const r = await d.receiveMail({ raw: plain("bye"), envelope_to: ann, now: T0 });
  assert.equal((await d.mailDelete({ id: r.id, by: "member:bo" })).reason, "NO_SUCH_MAIL");
  assert.equal((await d.mailDelete({ id: r.id, by: "class:member" })).reason, "MEMBER_SESSION_REQUIRED");
  assert.deepEqual(await d.mailDelete({ id: r.id, by: "member:ann" }), { ok: true, id: r.id, deleted: true });
  assert.equal(b.held.has(`bio/mail/${r.sha256}`), false);
  assert.deepEqual(d.mailWaiting({ viewer: "member:ann" }).mail, []);
});

test("R6 the bytes two members' rows share stay until the last waiting row naming them is gone", async () => {
  const { d, b, ann, bo } = await two();
  const x = await d.receiveMail({ raw: plain("shared"), envelope_to: ann, now: T0 });
  const y = await d.receiveMail({ raw: plain("shared"), envelope_to: bo, now: T0 });
  assert.notEqual(x.id, y.id, "each owner has her own row");
  await d.mailDelete({ id: x.id, by: "member:ann" });
  assert.equal(b.held.has(`bio/mail/${x.sha256}`), true);
  await d.mailDelete({ id: y.id, by: "member:bo" });
  assert.equal(b.held.has(`bio/mail/${x.sha256}`), false);
});
