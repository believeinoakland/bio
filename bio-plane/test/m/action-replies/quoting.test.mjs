/* action-replies' T48 requirements at its interface (T48-49; N880; Actions D13, H17): a reply that asks not to be quoted
   (R10), each open-request row answering `quotable` (R11), a machine recording none (R4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, M, BOB, MACHINE, INQ, RFC, REQ, WINDOW, leg } from "./fixture.mjs";
import { ACTION_REPLY_CHECKS, ACTION_REPLIES_TABLES, actionRepliesOps } from "../../../src/action-replies/index.mjs";

const WORDS = "Please do not quote this reply in any public document.";
const members = [{ bundle_id: INQ, version_sha: "a".repeat(64) }];
const url = (q) => new URL(`https://x/?${new URLSearchParams(q)}`);
const quote = (w, o) => w.r.actionReplyQuoting({ author: M, viewer: M, ...o });

/* A request for comment, sent and answered once; the reply's position. */
function answered() {
  const w = world({ signing: true });
  w.rfc(RFC);
  w.say(RFC, "sent", "2026-09-10");
  return { w, got: w.say(RFC, "received", "2026-09-20") };
}

test("R10 control: quotable false with the reply's own words lands on a received reply and bearingsOf answers it, who and when; a later quotable true reads true again; appended, never edited", () => {
  const { w, got } = answered();
  const entry = () => w.r.bearingsOf({ target: RFC, viewer: M }).entries[0];
  assert.deepEqual([entry().quotable, entry().quoting], [true, null], "true with nothing recorded");
  const r = quote(w, { target: RFC, ord: got, quotable: false, words: `  ${WORDS} ` });
  assert.deepEqual([r.ok, r.quotable, r.words, r.by], [true, false, WORDS, M]);
  assert.deepEqual([entry().quotable, entry().quoting], [false, { quotable: false, words: WORDS, by: M, at: r.at }]);
  w.clock.ms += 1000;
  const back = quote(w, { target: RFC, ord: got, quotable: true, author: BOB, viewer: BOB });
  assert.deepEqual([back.ok, back.quotable, back.words], [true, true, null]);
  assert.deepEqual([entry().quotable, entry().quoting.by, entry().quoting.words], [true, BOB, null]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reply_quoting`)[0].n, 2, "two appended rows, none edited");
  assert.equal(quote(w, { target: RFC, ord: String(got), quotable: false, words: WORDS }).ok, true, "a position given as digits");
  assert.equal(w.r.bearingsOf({ target: RFC, ord: got, viewer: M }).entries[0].quotable, false);
});

test("R10 control: the same on a sent entry, another kind, or an absent entry is refused QUOTING_NOT_RFC, writing nothing", () => {
  const w = world();
  w.rfc(RFC);
  const sent = w.say(RFC, "sent");
  w.action(REQ, ["action_basis:", ...leg(INQ, "advances")]);
  const rec = w.say(REQ, "received");
  const before = w.counts();
  for (const [target, ord] of [[RFC, sent], [REQ, rec], [RFC, 99], [RFC, null]]) {
    const r = quote(w, { target, ord, quotable: false, words: WORDS });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "QUOTING_NOT_RFC", "C-150.9"], `${target} ${ord}`);
    assert.equal(r.translation, ACTION_REPLY_CHECKS.QUOTING_NOT_RFC.translation);
  }
  assert.deepEqual(w.counts(), before);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reply_quoting`)[0].n, 0);
});

test("R10 control: every refusal in order, each with its control, writing nothing", () => {
  const { w, got } = answered();
  const ok = { target: RFC, ord: got, quotable: false, words: WORDS };
  const none = () => assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reply_quoting`)[0].n, 0);
  /* 1 MACHINE_CANNOT_RECORD_QUOTING: empty and machine authors, ahead of every later refusal */
  for (const author of [MACHINE, "", null, "  "]) {
    const r = quote(w, { ...ok, author, target: "nope", quotable: "x" });
    assert.deepEqual([r.reason, r.check], ["MACHINE_CANNOT_RECORD_QUOTING", "C-150.8"], String(author));
    assert.equal(r.translation, ACTION_REPLY_CHECKS.MACHINE_CANNOT_RECORD_QUOTING.translation);
  }
  /* 2 NO_TARGET; 3 NO_SUCH_BUNDLE (absent and unseen alike); 4 NOT_AN_ACTION */
  assert.equal(quote(w, { ...ok, target: null, quotable: "x" }).reason, "NO_TARGET");
  assert.equal(quote(w, { ...ok, target: "ACTN-2026-9999-none", quotable: "x" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(quote(w, { ...ok, viewer: "nobody", quotable: "x" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(quote(w, { ...ok, target: INQ, quotable: "x" }).reason, "NOT_AN_ACTION");
  /* 5 QUOTING_NOT_RFC is ahead of 6 */
  assert.equal(quote(w, { ...ok, ord: 99, quotable: "x" }).reason, "QUOTING_NOT_RFC");
  /* 6 QUOTING_REFUSED: a quotable that is not a boolean, words missing with false, malformed words */
  const bad = [{ quotable: "false" }, { quotable: null }, { quotable: 0 }, { quotable: undefined },
    { words: undefined }, { words: null }, { words: "" }, { words: "   " }, { words: 5 },
    { words: "x".repeat(501) }, { words: 'says "no"' }, { words: "back\\slash" }, { words: "two\nlines" }, { words: "two\rlines" },
    { quotable: true, words: 'says "no"' }, { quotable: true, words: "" }];
  for (const b of bad) {
    const r = quote(w, { ...ok, ...b });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "QUOTING_REFUSED", "C-150.10"], JSON.stringify(b));
    assert.equal(r.translation, ACTION_REPLY_CHECKS.QUOTING_REFUSED.translation);
  }
  none();
  /* controls: the bound is 500, and withdrawing needs no words */
  assert.equal(quote(w, { ...ok, words: "x".repeat(500) }).ok, true);
  assert.equal(quote(w, { ...ok, quotable: true, words: undefined }).ok, true);
});

test("R10 the rows C-150.8 to C-150.10 are this module's, in BOB's drafted words; the op reads the control plane's stamps; the act refuses no act of any module", () => {
  const { w, got } = answered();
  assert.deepEqual(Object.values(ACTION_REPLY_CHECKS).map((r) => r.check).slice(-3), ["C-150.8", "C-150.9", "C-150.10"]);
  assert.equal(ACTION_REPLY_CHECKS.MACHINE_CANNOT_RECORD_QUOTING.translation,
    "Only a member records what a reply says about being quoted. Nothing was written.");
  assert.equal(ACTION_REPLY_CHECKS.QUOTING_NOT_RFC.translation,
    "Only a reply received to a request for comment can ask not to be quoted. Nothing was written.");
  assert.equal(ACTION_REPLY_CHECKS.QUOTING_REFUSED.translation, "Say whether the reply may be quoted, and when it may not, give the "
    + "reply's own words that say so, on one line of at most 500 characters. Nothing was written.");
  const ops = (q, b) => actionRepliesOps(w.r, url(q), b);
  assert.ok("actionreplyquoting" in ops({}, {}));
  /* a body's own author never wins over the stamp */
  assert.equal(ops({ target: RFC, ord: got, viewer: M }, { quotable: false, words: WORDS, author: M }).actionreplyquoting().reason,
    "MACHINE_CANNOT_RECORD_QUOTING");
  assert.equal(ops({ target: RFC, ord: got, viewer: M, author: M }, { quotable: false, words: WORDS }).actionreplyquoting().ok, true);
  assert.equal(ops({ target: RFC, ord: got, viewer: M, author: M, quotable: "true" }, {}).actionreplyquoting().quotable, true);
  assert.equal(ops({ target: RFC, ord: got, viewer: M, author: M, quotable: "maybe" }, {}).actionreplyquoting().reason, "QUOTING_REFUSED");
  /* a declaration: the reply can still be laid out, linked and answered after the record */
  quote(w, { target: RFC, ord: got, quotable: false, words: WORDS });
  assert.equal(w.r.actionReplyBearing({ target: RFC, ord: got, author: M, viewer: M, claims: [{ claim: INQ, bearing: "new_evidence" }] }).ok, true);
});

test("R11 control: a request whose reply asks not to be quoted answers quotable false; one with no record, or whose record was withdrawn, answers true; a later reply's record counts, and the latest per reply stands", () => {
  const { w, got } = answered();
  const row = () => { const r = w.r.openRequestsOn({ case: "c", members, viewer: M }); assert.equal(r.length, 1); return r[0]; };
  assert.equal(row().quotable, true, "no record");
  const before = w.counts();
  quote(w, { target: RFC, ord: got, quotable: false, words: WORDS });
  assert.equal(row().quotable, false);
  assert.equal(row().replied, true, "beside replied, as R8 has it");
  /* a second reply with no record: the first's record still stands for the request */
  const second = w.say(RFC, "received", "2026-09-25");
  assert.equal(row().quotable, false);
  /* withdrawn on the first: true again */
  w.clock.ms += 1000;
  quote(w, { target: RFC, ord: got, quotable: true });
  assert.equal(row().quotable, true);
  /* the second reply asks not to be quoted: false */
  quote(w, { target: RFC, ord: second, quotable: false, words: WORDS });
  assert.equal(row().quotable, false);
  /* through the seam, as case-inputs R8 reads it */
  assert.equal(w.ci.openRequestsOn({ case: "c", members, viewer: M }).rows[0].quotable, false);
  void before;
  /* a request with no reply recorded answers true */
  const w2 = world(); w2.rfc(RFC); w2.say(RFC, "sent");
  assert.deepEqual(w2.r.openRequestsOn({ case: "c", members, viewer: M }).map((r) => [r.replied, r.quotable]), [[false, true]]);
});

test("R4 control: a machine records no quoting; the table is this module's, declared to purge, and no reader of a record sees an invisible action's", () => {
  const { w, got } = answered();
  assert.equal(quote(w, { target: RFC, ord: got, quotable: false, words: WORDS, author: MACHINE, viewer: MACHINE }).reason,
    "MACHINE_CANNOT_RECORD_QUOTING");
  assert.ok(ACTION_REPLIES_TABLES.includes("action_reply_quoting"));
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_reply_quoting`)[0].n, 0);
  quote(w, { target: RFC, ord: got, quotable: false, words: WORDS });
  assert.equal(w.r.bearingsOf({ target: RFC, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "an invisible action reads as an absent one");
  void WINDOW;
});
