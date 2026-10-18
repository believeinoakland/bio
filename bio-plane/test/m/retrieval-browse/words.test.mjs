/* retrieval-browse's words (T51-29; N1116, N1212, K3366, K3632, K3854; DEC-334; plan rule 6; `setup-words` R11-R13): the
   module holds keys and reads each sentence through `setup-words`' `word`. Its key list is the design stream's declaration for
   `retrieval-browse` (`words-reads.json`, split from retrieval's by DEC-334), every key is one the list holds, and the
   sentences it answers are the list's word for the key, so a change of the list's English reaches an answer with no edit
   here. Each test names its ids. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasWord, word as WORD } from "../../../src/setup-words/index.mjs";
import { WORD_KEYS, say, keysRead } from "../../../src/retrieval-browse/words.mjs";
import { RECORDED_NONE_REGISTERED, FIND_MATCHERS, matchDates, extentOfSource } from "../../../src/retrieval-browse/index.mjs";
import { world, V } from "./fixture.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules["retrieval-browse"].reads;
const para = (n) => ({ kind: "doc-para", para: n });
const kindOf = (ans, k) => ans.kinds.find((x) => x.kind === k);

test("R1, R2, R4, R10 (plan rule 6; DEC-334): the module's keys are the owner's declared list for retrieval-browse, every one held by the word list; a key outside it is refused, a placeholder with no value is refused", () => {
  assert.deepEqual([...WORD_KEYS].sort(), [...READS].sort());
  assert.equal(WORD_KEYS.length, 15);
  for (const k of WORD_KEYS) assert.equal(hasWord(k), true, k);
  assert.throws(() => say("not.a.key"), /not one of this module's word keys/);
  assert.throws(() => say("retrieval.why.read_threw"), /WORD_VAR_MISSING/);
  assert.equal(say("retrieval.why.read_threw", { e: "boom" }), WORD("retrieval.why.read_threw", { e: "boom" }));
});

test("R1, R2, R3, R4 (plan rule 6): the sentences the module answers are the list's words — the no-later-module line, the date matcher's whys, 'Nothing here', the recorded reads' whys, the column and extent whys, the unread-people whys — and each of the 15 keys is read", () => {
  const dates = matchDates("On 2026-02-31, 3/4/2026 and June 2026.", FIND_MATCHERS.en);
  assert.deepEqual(dates.map((d) => d.date_why), [WORD("retrieval.why.names_day_calendar", { date: "2026-02-31" }),
    WORD("retrieval.why.words_write_day"), WORD("retrieval.why.words_name_month")]);
  assert.equal(RECORDED_NONE_REGISTERED, WORD("retrieval.recorded_none_registered"));
  assert.equal(extentOfSource(null).extent_why, WORD("retrieval.extent_why"));

  /* The four reads: one offers no recordedBy, one is not reachable, then three kinds of failing read on the registered ones. */
  const recorders = { events: { recordedBy: () => ({ ok: true, items: [], truncated: false }) }, standards: {}, money: null,
                      people: { recordedBy: () => ({ ok: true, items: [], truncated: false }) } };
  const w = world({ deps: { recorders, entities: null } });
  const c = w.cap("a.pdf", "a bytes");
  w.doc("INFO-A", {}, { captures: [c] });
  w.st.sql.exec(`INSERT INTO readings (capture_sha, bundle_id, content_type, reader_version, found, entity_count, reading, at)
                 VALUES (?,?,'generic',1,0,0,?,'t')`, c.sha, "INFO-A", JSON.stringify({ content_type: "generic", entities: [] }));
  w.unit(c.sha, "INFO-A", 0, "Fee: $5 on March 5, 2026.", para(0));
  w.unit(c.sha, "INFO-A", 1, "Cost\n$9", { kind: "doc-table", table: 0 });
  w.rb.registerRecordedBy("citation", () => { throw new Error("boom"); });
  w.rb.registerRecordedBy("queue", () => Promise.resolve({ ok: true, items: [] }));
  w.rb.registerRecordedBy("answers", () => ({ ok: false }));
  const ans = w.rb.findIn({ viewer: V("vera"), scope: { capture: c.sha }, kinds: ["money", "dates", "people"] });
  const why = (m) => ans.recorded_not_read.find((x) => x.module === m).why;
  assert.equal(why("standards"), WORD("retrieval.why.offers_recordedby_read", { m: "standards" }));
  assert.equal(why("money"), WORD("retrieval.why.reachable", { m: "money" }));
  assert.equal(why("citation"), WORD("retrieval.why.read_threw", { e: "boom" }));
  assert.equal(why("queue"), WORD("retrieval.why.read_answered_promise"));
  assert.equal(why("answers"), WORD("retrieval.why.read_refused", { given: WORD("monitoring.reason_given") }));
  /* A table of a document whose cells the reading does not hold names no column. */
  const table = kindOf(ans, "money").items.find((m) => m.table);
  assert.equal(table.table.column_why, WORD("retrieval.column_why"));
  /* The followed people cannot be read: no entities were handed. */
  assert.deepEqual(kindOf(ans, "people").not_read.map((n) => n.why), [WORD("retrieval.unread.read_followed_people")]);
  const broken = world({ deps: { recorders, entities: { namingIn: () => ({ ok: false, reason: "BROKEN" }) } } });
  const d = broken.cap("b.pdf", "b bytes");
  broken.doc("INFO-B", {}, { captures: [d] });
  broken.reading(d.sha, "INFO-B");
  broken.unit(d.sha, "INFO-B", 0, "Text.", para(0));
  const refused = broken.rb.findIn({ viewer: V("vera"), scope: { capture: d.sha }, kinds: ["people"] });
  assert.deepEqual(kindOf(refused, "people").not_read.map((n) => n.why), [WORD("retrieval.unread.read_followed_people_offices", { ans: " (BROKEN)" })]);
  /* "Nothing here": every capture read, none matched. */
  const nothing = broken.rb.findIn({ viewer: V("vera"), scope: { capture: d.sha }, kinds: ["money"] });
  assert.deepEqual([kindOf(nothing, "money").nothing, kindOf(nothing, "money").says], [true, WORD("state.empty")]);
  assert.equal(WORD("state.empty"), "Nothing here");
  assert.deepEqual([...WORD_KEYS].filter((k) => !keysRead().has(k)), [], "every key the module holds is read by a behaviour above");
});
