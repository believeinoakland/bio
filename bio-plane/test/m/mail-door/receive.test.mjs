/* mail-door R2, R8, R9, R10, R12, R14: the door, its rate bounds, its tally, automatic mail and nesting, off by default. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, addressFor, plain, countingStream, eml, STANDARD, withAttachments, rfc822Part, sha, T0, HOUR, DAY } from "./fixture.mjs";
import { MAIL_CHECKS } from "../../../src/mail-door/checks.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { readMessage } from "../../../src/mail-reader/index.mjs";

const BOUND = boundOf("mail", "message_bytes");
const tallyOf = (rows) => rows(`SELECT day, address, size_or_rate FROM mail_tally ORDER BY day`).map((r) => ({ ...r }));

test("R2 a message to a live address is accepted and waits for its owner", async () => {
  const { d, b } = fresh();
  const to = await addressFor(d, "ann");
  const bytes = plain("a tip");
  const r = await d.receiveMail({ raw: bytes, envelope_to: to, now: T0 });
  assert.deepEqual([r.ok, r.existed, r.sha256, r.bytes], [true, false, sha(bytes), bytes.length]);
  assert.match(r.id, /^MAIL-2026-10-06-[0-9a-f]{8}$/);
  assert.equal(d.mailWaiting({ viewer: "member:ann" }).mail[0].id, r.id);
  assert.ok(b.held.has(`bio/mail/${sha(bytes)}`));
});

test("R2 R9 an unknown local part, a switched-off address and the right address on a closed door are refused with their codes, nothing written but the tally", async () => {
  const { d, rows, everything, settings } = fresh();
  const to = await addressFor(d, "ann");
  const before = everything();
  const unknown = await d.receiveMail({ raw: plain(), envelope_to: to.replace(/^m-./, "m-0") === to ? to.replace(/^m-./, "m-1") : to.replace(/^m-./, "m-0"), now: T0 });
  assert.deepEqual([unknown.reason, unknown.check, unknown.translation], ["MAIL_NO_SUCH_ADDRESS", MAIL_CHECKS.MAIL_NO_SUCH_ADDRESS.check, MAIL_CHECKS.MAIL_NO_SUCH_ADDRESS.translation]);
  settings.mail_door = false;
  const closed = await d.receiveMail({ raw: plain(), envelope_to: to, now: T0 });
  assert.deepEqual([closed.reason, closed.check], ["MAIL_OFF", MAIL_CHECKS.MAIL_OFF.check]);
  settings.mail_door = true;
  assert.deepEqual(everything(), before, "nothing written but the tally");
  d.mailAddressOff({ by: "member:ann" });
  const off = await d.receiveMail({ raw: plain(), envelope_to: to, now: T0 });
  assert.deepEqual([off.reason, off.translation], [unknown.reason, unknown.translation], "one answer for unknown and switched off");
  assert.deepEqual(tallyOf(rows), [{ day: "2026-10-06", address: 3, size_or_rate: 0 }]);
});

test("R2 a declared size of the bound plus 1 is refused before a byte is read; a stream passing the bound is cancelled; zero bytes is MAIL_EMPTY", async () => {
  const { d, everything } = fresh();
  const to = await addressFor(d, "ann");
  const before = everything();
  const s1 = countingStream(plain("x"));
  const over = await d.receiveMail({ raw: s1.stream, envelope_to: to, size: BOUND + 1 });
  assert.deepEqual([over.reason, over.size, over.bound, over.key], ["MAIL_TOO_LARGE", BOUND + 1, BOUND, "limit.mail.message_bytes"]);
  assert.equal(s1.seen.pulled, 0, "judged before a byte is read");
  const big = new Uint8Array(BOUND + 64 * 1024).fill(0x61);
  const s2 = countingStream(big, 1 << 20);
  const passed = await d.receiveMail({ raw: s2.stream, envelope_to: to });
  assert.equal(passed.reason, "MAIL_TOO_LARGE");
  assert.equal(s2.seen.cancelled, true, "the stream was cancelled");
  assert.ok(s2.seen.pulled <= BOUND + (1 << 20) && s2.seen.pulled > BOUND, "it stopped as soon as the bound was passed");
  const empty = await d.receiveMail({ raw: new Uint8Array(0), envelope_to: to });
  assert.deepEqual([empty.reason, empty.check], ["MAIL_EMPTY", MAIL_CHECKS.MAIL_EMPTY.check]);
  assert.deepEqual(everything(), before);
});

test("R2 control: a message exactly at the bound is accepted", async () => {
  const { d } = fresh();
  const to = await addressFor(d, "ann");
  const head = plain("");
  const at = new Uint8Array(BOUND).fill(0x61);
  at.set(head, 0);
  const r = await d.receiveMail({ raw: countingStream(at, 1 << 20).stream, envelope_to: to, size: BOUND });
  assert.deepEqual([r.ok, r.bytes], [true, BOUND]);
});

test("R2 a member's own address given as envelope_from is held by no row, tally or answer and changes no decision", async () => {
  const { d, rows } = fresh();
  const to = await addressFor(d, "ann");
  const own = "ann.home@example.net";
  const a = await d.receiveMail({ raw: plain("one"), envelope_to: to, envelope_from: own, now: T0 });
  const b = await d.receiveMail({ raw: plain("two"), envelope_to: to, now: T0 });
  assert.deepEqual([a.ok, b.ok], [true, true]);
  await d.receiveMail({ raw: plain(), envelope_to: "nobody@x.org", envelope_from: own, now: T0 });
  const all = JSON.stringify(rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => rows(`SELECT * FROM ${t.name}`))) + JSON.stringify([a, b]);
  assert.equal(all.includes(own), false);
});

test("R8 the 21st message in an hour to one address is refused, the 20th accepted; a second member's address is counted apart", async () => {
  const { d, rows } = fresh();
  const ann = await addressFor(d, "ann"), bo = await addressFor(d, "bo");
  const n = boundOf("mail", "per_member_hour");
  assert.equal(n, 20);
  for (let i = 0; i < n; i++) assert.equal((await d.receiveMail({ raw: plain(`m${i}`), envelope_to: ann, now: T0 + i })).ok, true, `message ${i + 1}`);
  const over = await d.receiveMail({ raw: plain("m20"), envelope_to: ann, now: T0 + n });
  assert.deepEqual([over.reason, over.check, over.translation], ["MAIL_RATE_MEMBER", MAIL_CHECKS.MAIL_RATE_MEMBER.check, MAIL_CHECKS.MAIL_RATE_MEMBER.translation]);
  assert.ok(over.stated.includes(String(n)), "the figure is stated beside the sentence");
  assert.equal(MAIL_CHECKS.MAIL_RATE_MEMBER.translation.includes(String(n)), false, "the translation names no figure");
  assert.equal((await d.receiveMail({ raw: plain("bo"), envelope_to: bo, now: T0 + n })).ok, true, "a second member is counted apart");
  assert.equal(d.mailWaiting({ viewer: "member:ann" }).mail.length, n);
  /* no rate key holds an address */
  for (const r of rows(`SELECT bucket FROM mail_rate`)) { assert.equal(r.bucket.includes(ann), false); assert.equal(r.bucket.includes(ann.split("@")[0]), false); }
  /* control: after the window passes, acceptance resumes */
  assert.equal((await d.receiveMail({ raw: plain("later"), envelope_to: ann, now: T0 + 2 * HOUR })).ok, true);
});

test("R8 at the team's daily bound every address is refused", async () => {
  const { d } = fresh();
  const per = boundOf("mail", "per_member_hour"), team = boundOf("mail", "per_team_day");
  const members = Math.ceil(team / per);
  let sent = 0;
  for (let m = 0; m < members; m++) {
    const to = await addressFor(d, `m${m}`);
    for (let i = 0; i < per && sent < team; i++, sent++) assert.equal((await d.receiveMail({ raw: plain(`${m}-${i}`), envelope_to: to, now: T0 })).ok, true);
  }
  const fresh1 = await addressFor(d, "late");
  const r = await d.receiveMail({ raw: plain("late"), envelope_to: fresh1, now: T0 });
  assert.deepEqual([r.reason, r.check], ["MAIL_RATE_TEAM", MAIL_CHECKS.MAIL_RATE_TEAM.check]);
  assert.ok(r.stated.includes(String(team)));
  assert.equal((await d.receiveMail({ raw: plain("next day"), envelope_to: fresh1, now: T0 + 2 * DAY })).ok, true);
});

test("R9 three refusals of two kinds are counted; nothing else is stored; an accepted message changes no counter; the tally is an administrator's", async () => {
  const { d, rows, s } = fresh();
  const to = await addressFor(d, "ann");
  await d.receiveMail({ raw: plain(), envelope_to: "nobody@mail.example.org", now: T0 });
  await d.receiveMail({ raw: plain(), envelope_to: "nobody2@mail.example.org", now: T0 });
  await d.receiveMail({ raw: new Uint8Array(0), envelope_to: to, now: T0 });
  assert.deepEqual(tallyOf(rows), [{ day: "2026-10-06", address: 2, size_or_rate: 1 }]);
  assert.deepEqual(rows(`PRAGMA table_info(mail_tally)`).map((c) => c.name), ["day", "address", "size_or_rate"], "two counters and a date");
  await d.receiveMail({ raw: plain("ok"), envelope_to: to, now: T0 });
  assert.deepEqual(tallyOf(rows), [{ day: "2026-10-06", address: 2, size_or_rate: 1 }], "control: an accepted message changes no counter");
  /* read by a signed-in administrator alone */
  assert.equal(d.mailTally({ viewer: "member:ann" }).reason, "NOT_AN_ADMIN");
  s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('ada', 'Ada', 'admin', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')`);
  assert.deepEqual(d.mailTally({ viewer: "member:ada", now: T0 }), { ok: true, days: [{ day: "2026-10-06", address: 2, size_or_rate: 1 }] });
  /* 30 days kept */
  await d.receiveMail({ raw: plain(), envelope_to: "nobody@mail.example.org", now: T0 + 30 * DAY });
  assert.deepEqual(tallyOf(rows).map((r) => r.day), ["2026-11-05"]);
});

test("R10 a bulk, list or automatic message is accepted and flagged; control: a plain message is not", async () => {
  const { d } = fresh();
  const to = await addressFor(d, "ann");
  const flagged = [["Precedence: bulk"], ["Precedence: junk"], ["List-Id: <council.lists.example.org>"], ["Auto-Submitted: auto-replied"], ["Return-Path: <>"]];
  for (const extra of flagged) {
    const r = await d.receiveMail({ raw: eml([...STANDARD, ...extra], extra[0]), envelope_to: to, now: T0 });
    assert.deepEqual([r.ok, r.automatic], [true, true], extra[0]);
  }
  const no = await d.receiveMail({ raw: eml([...STANDARD, "Auto-Submitted: no"], "x"), envelope_to: to, now: T0 });
  assert.equal(no.automatic, false);
  const p = await d.receiveMail({ raw: plain("plain"), envelope_to: to, now: T0 });
  assert.equal(p.automatic, false);
  const listed = d.mailWaiting({ viewer: "member:ann" }).mail;
  assert.equal(listed.filter((m) => m.automatic).length, flagged.length);
});

test("R10 the same bytes sent twice leave one row, the second sighting stated", async () => {
  const { d } = fresh();
  const to = await addressFor(d, "ann");
  const a = await d.receiveMail({ raw: plain("same"), envelope_to: to, now: T0 });
  const b = await d.receiveMail({ raw: plain("same"), envelope_to: to, now: T0 + 1000 });
  assert.deepEqual([a.existed, b.existed, b.id], [false, true, a.id]);
  assert.equal(d.mailWaiting({ viewer: "member:ann" }).mail.length, 1);
});

test("R10 a message nested 4 deep is refused with mail-reader's own refusal, naming the depth, unchanged", async () => {
  const { d, everything } = fresh();
  const to = await addressFor(d, "ann");
  const holding = (inner, n) => withAttachments([rfc822Part(inner, `${n}.eml`)], `holds ${n}`, STANDARD, `b-${n}`);
  const four = holding(holding(holding(plain("leaf"), "c"), "b"), "a");
  const before = everything();
  const r = await d.receiveMail({ raw: four, envelope_to: to, now: T0 });
  assert.deepEqual(r, await readMessage(four, { route: "address" }), "relayed unchanged");
  assert.deepEqual([r.reason, r.depth], ["MAIL_TOO_NESTED", 4]);
  assert.deepEqual(everything(), before);
  assert.equal((await d.receiveMail({ raw: holding(holding(plain("leaf"), "b"), "a"), envelope_to: to, now: T0 })).ok, true, "3 deep is accepted");
});

test("R12 a fresh copy refuses all and lists nothing; control: with the switch on and a domain set, R2 accepts", async () => {
  const off = fresh({ on: false, domain: null });
  assert.equal((await off.d.mailAddressMake({ by: "member:ann" })).reason, "MAIL_NOT_SET_UP");
  assert.equal((await off.d.receiveMail({ raw: plain(), envelope_to: "m-0000000000000@mail.example.org" })).reason, "MAIL_OFF");
  assert.deepEqual(off.d.mailWaiting({ viewer: "member:ann" }).mail, []);
  const { d } = fresh();
  assert.equal((await d.receiveMail({ raw: plain(), envelope_to: await addressFor(d, "ann") })).ok, true);
});

test("R12 control: with the door off, uploading a saved .eml still files it (captureupload)", async () => {
  const { cap, d } = fresh({ on: false, domain: null });
  assert.equal((await d.mailAddressMake({ by: "member:ann" })).reason, "MAIL_NOT_SET_UP");
  const r = await cap.uploadCapture({ bytes: plain("saved"), statement: "forwarded to me by a neighbour", name: "tip.eml", by: "member:ann" });
  assert.equal(r.ok, true, JSON.stringify(r));
});

test("R14 with BIO_NOW_MS pinned, the received instant, days_left and the rate follow it; control: unpinned, the wall clock", async () => {
  const { d } = fresh({ env: { BIO_NOW_MS: String(T0) } });
  const to = await addressFor(d, "ann");
  const r = await d.receiveMail({ raw: plain("pinned"), envelope_to: to });
  assert.match(r.id, /^MAIL-2026-10-06-/);
  assert.equal(d.mailWaiting({ viewer: "member:ann" }).mail[0].received, new Date(T0).toISOString());
  assert.equal(d.mailWaiting({ viewer: "member:ann" }).mail[0].days_left, 14);
  assert.equal(d.nowMs(), T0);
  const free = fresh();
  const t = Date.now();
  assert.ok(Math.abs(free.d.nowMs() - t) < 5000);
});
