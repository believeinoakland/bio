/* actions' T51 entry at its interface: R108 (N880 (U4); DEC-340, U366; K3935; `filings` R64) a reply on a public comment can
   carry the minutes' passage; and R9 R25 (K3997; `lines` R11, R24) the holder of an addressed office is undetermined with
   `lines`' reason passed on by its key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP, sha } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const PC = "ACTN-2026-0101-pc", RR = "ACTN-2026-0102-rr", INFO = "INFO-2026-0101-minutes";
const M = V("alice");
/* the public comment kind is a profile's; the capture's context is a read capture's (a chain, three pages), as content answers it */
const READ = { chain: [{ step: "layer", tier: 1 }], pageCount: 3, pageBoxes: null, container: {} };
const OPEN = { profiles: ["oakland-alameda"], deps: { content: { captureFor: () => null, contentContextFor: () => READ } } };

/** A public comment with one sending, and a document holding the minutes' capture. */
function comment(w, id = PC) {
  const r = w.promote(id, actionMd(id, [...CP, "action_kind: public_comment"]));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(w.a.actionCorrespond({ target: id, direction: "sent", at: "2026-09-02", account: "read out at the meeting", viewer: M, author: M }).ok, true);
  return w.doc(INFO, "Item 4: the council heard public comment and moved on.");
}
const given = (captureSha, extent = { kind: "document" }) => ({ meeting: "Council regular meeting", date: "2026-09-16",
  passage: { captureSha, extent } });
const reply = (w, minutes, over = {}) => w.a.actionCorrespond({ target: PC, direction: "received", at: "2026-09-20",
  account: "the minutes were posted", minutes, viewer: M, author: M, ...over });

test("R108 a received entry of a public comment holds the minutes' passage, kept on the entry and read as it stands; its other bytes are unchanged", () => {
  const w = world(OPEN);
  const s = comment(w);
  const r = reply(w, given(s, { kind: "pdf-page", page: 2, rect: [10, 20, 300, 400] }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const kept = { meeting: "Council regular meeting", date: "2026-09-16",
    passage: { captureSha: s, extent: { kind: "pdf-page", page: 2, rect: [10, 20, 300, 400] } } };
  assert.deepEqual(r.minutes, kept);
  const e = w.fm(PC).correspondence[1];
  assert.deepEqual([e.direction, e.account, e.author, e.minutes_meeting, e.minutes_date, e.minutes_capture, e.minutes_extent_kind],
    ["received", "the minutes were posted", M, "Council regular meeting", "2026-09-16", s, "pdf-page"]);
  const read = w.a.actionRead({ id: PC, viewer: M });
  assert.deepEqual(read.entries.find((x) => x.ord === 1).minutes, kept);
  assert.equal(read.entries.find((x) => x.ord === 0), undefined, "the sending holds none");
  /* a reply without minutes writes exactly the bytes it wrote before */
  assert.equal(reply(w, null, { at: "2026-09-21" }).ok, true);
  assert.equal(Object.keys(w.fm(PC).correspondence[2]).some((k) => k.startsWith("minutes_")), false);
  /* the decoration answers the same */
  assert.deepEqual(w.decorate(PC, undefined, M).action.entries.find((x) => x.ord === 1).minutes, kept);
});

test("R108 a sent entry, or a received one of any other kind, is refused MINUTES_NOT_PUBLIC_COMMENT; nothing is written", () => {
  const w = world(OPEN);
  const s = comment(w);
  const before = w.text(PC);
  const sent = reply(w, given(s), { direction: "sent" });
  assert.deepEqual([sent.ok, sent.reason, sent.detail], [false, "MINUTES_NOT_PUBLIC_COMMENT", word("screen.action.minutes.notpublic")]);
  const none = reply(w, given(s), { direction: "no_response" });
  assert.equal(none.reason, "MINUTES_NOT_PUBLIC_COMMENT");
  w.action(RR);
  const other = reply(w, given(s), { target: RR });
  assert.equal(other.reason, "MINUTES_NOT_PUBLIC_COMMENT");
  assert.equal(w.text(PC), before);
  assert.equal(Object.keys(w.fm(RR).correspondence ?? []).length, 0);
  /* the write refuses it too: an entry carrying minutes keys on a record's revision, whatever its direction */
  const sneaked = before.replace(/(  - direction: sent\n)/, "$1    minutes_meeting: \"Council regular meeting\"\n    minutes_date: 2026-09-16\n");
  assert.notEqual(sneaked, before);
  assert.equal(w.promote(PC, sneaked).reason, "MINUTES_NOT_PUBLIC_COMMENT");
  /* control: the same minutes on a received entry of the public comment land */
  assert.equal(reply(w, given(s)).ok, true);
});

test("R108 the minutes' shape, date and passage are judged: BAD_MINUTES, BAD_DATE, an unseen capture as an absent one, content's extent refusals", () => {
  const w = world(OPEN);
  const s = comment(w);
  const before = w.text(PC);
  const long = "x".repeat(201);
  for (const bad of [{ ...given(s), meeting: "" }, { ...given(s), meeting: long }, { ...given(s), meeting: 'a "quoted" meeting' },
                     { ...given(s), meeting: "two\nlines" }, { ...given(s), date: undefined }, "not json", [], { ...given(s), passage: null },
                     given("zz"), given(s, null)]) {
    const r = reply(w, bad);
    assert.deepEqual([r.ok, r.reason], [false, "BAD_MINUTES"], JSON.stringify(bad));
  }
  assert.equal(reply(w, { ...given(s), date: "2026-02-31" }).reason, "BAD_DATE");
  assert.equal(reply(w, { ...given(s), date: "16 Sept" }).reason, "BAD_DATE");
  /* a capture the record does not hold */
  const absent = reply(w, given(sha("never captured")));
  assert.deepEqual([absent.ok, absent.reason, absent.target], [false, "NO_SUCH_BUNDLE", sha("never captured")]);
  /* an extent content's grammar refuses (a kind it does not know), as content answers it */
  const unknown = reply(w, given(s, { kind: "paragraph-ish" }));
  assert.deepEqual([unknown.ok, unknown.code], [false, "CONTENT_EXTENT_UNREADABLE"]);
  /* an extent kind whose parts an entry cannot hold flat (an envelope item) is refused by content's grammar, never kept as the document */
  const nested = reply(w, given(s, { kind: "envelope", item: "comment", at: { kind: "pdf-page", page: 1 } }));
  assert.equal(nested.code, "CONTENT_EXTENT_UNREADABLE");
  assert.equal(w.text(PC), before, "nothing was written");
  /* control: a well-formed passage lands */
  assert.equal(reply(w, given(s, { kind: "doc-para", para: 1 })).ok, true);
  assert.equal(reply(w, given(s), { target: PC, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "an unseen action is answered as an absent one");
});

test("R9 R25 the holder of an addressed office with no line is undetermined: `why` is lines' key with its fills, `undetermined` is true, never text", () => {
  const w = world();
  w.action("ACTN-2026-0103-h");
  const h = w.a.actionRead({ id: "ACTN-2026-0103-h", viewer: M }).addressee.holder_on_date;
  assert.deepEqual([h.holder, h.undetermined, typeof h.why.key, typeof h.why.vars], [null, true, "string", "object"]);
  assert.equal(h.why.key, "actions.office_entity_held_addressee");
});
