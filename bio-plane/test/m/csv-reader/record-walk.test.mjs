/* csv-reader R28: the record walk is a service (`walkRecords`, `createRecordWalk`) that register-readers uses. Checked at
   the exported interface, with texts built here: a whole-text walk against the expected records written by hand, and the
   same texts fed in pieces split at every position. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { walkRecords, createRecordWalk } from "../../../src/csv-reader/index.mjs";

const feedSplit = (text, delimiter, cut, limits) => {
  const got = [], infos = [];
  const w = createRecordWalk(delimiter, (r, i) => { got.push(r); infos.push(i); }, limits);
  if (cut === null) w.feed(text); else { w.feed(text.slice(0, cut)); w.feed(text.slice(cut)); }
  w.end();
  return { got, ends: infos.map((i) => i.end), infos };
};

const TEXTS = [
  ['a,b,c\r\n1,2,3\r\n', ",", [["a", "b", "c"], ["1", "2", "3"]]],
  ['a,"b ""q"" c",d\nx,"line1\nline2\r\nline3",z\n', ",", [["a", 'b "q" c', "d"], ["x", "line1\nline2\r\nline3", "z"]]],
  ["a;b\rc;d\re;f", ";", [["a", "b"], ["c", "d"], ["e", "f"]]],
  ['12" pipe,1\n', ",", [['12" pipe', "1"]]],
  ["P100,,100\r\n", ",", [["P100", "", "100"]]],
  ["a\tb\n\tc", "\t", [["a", "b"], ["", "c"]]],
];

test("R28 walkRecords splits RFC 4180 records: quotes only at the start of a field, CR, LF and CRLF end a record", () => {
  for (const [text, delimiter, want] of TEXTS) assert.deepEqual(walkRecords(text, delimiter), want, JSON.stringify(text));
});

test("R28 walkRecords: a null delimiter yields one field per record", () => {
  assert.deepEqual(walkRecords("a,b\nc;d\r\ne", null), [["a,b"], ["c;d"], ["e"]]);
});

test("R28 createRecordWalk: one piece then end() is walkRecords; any split gives the same records and info.end", () => {
  for (const [text, delimiter] of TEXTS) {
    const whole = feedSplit(text, delimiter, null);
    assert.deepEqual(whole.got, walkRecords(text, delimiter));
    for (let cut = 0; cut <= text.length; cut++) {
      const split = feedSplit(text, delimiter, cut);
      assert.deepEqual(split.got, whole.got, `${JSON.stringify(text)} cut ${cut}`);
      /* A record whose CR is the last character of the first piece ends at that CR (`skipLF`); its LF comes with the
         next piece, so its `end` is one short of the whole walk's. Every other `end` is the same. */
      split.infos.forEach((info, k) => {
        if (info.skipLF && info.end === cut && whole.ends[k] === cut + 1) return;
        assert.equal(info.end, whole.ends[k], `${JSON.stringify(text)} cut ${cut} record ${k}`);
      });
    }
  }
});

test("R28 info.end counts characters up to the terminator; skipLF says a CR ended the piece's record", () => {
  const { infos } = feedSplit("ab,c\r\nd,e\n", ",", null);
  assert.deepEqual(infos.map((i) => i.end), [6, 10]);
  assert.deepEqual(infos.map((i) => i.cols), [2, 2]);
  const got = [], w = createRecordWalk(",", (r, i) => got.push([r, i.skipLF, i.end]));
  w.feed("a,b\r");
  assert.deepEqual(got, [[["a", "b"], true, 4]]);
  w.feed("\nc,d\n");
  w.end();
  assert.deepEqual(got.map((g) => g[0]), [["a", "b"], ["c", "d"]]);
});

test("R28 resumeAfterCR resumes after a record whose CR ended the previous piece", () => {
  const got = [], w = createRecordWalk(",", (r) => got.push(r));
  w.resumeAfterCR();
  w.feed("\nx,y\n");
  w.end();
  assert.deepEqual(got, [["x", "y"]]);
});

test("R28 setDelimiter decides the delimiter late; wide counts the fields under each candidate while none is decided", () => {
  const infos = [], got = [];
  const w = createRecordWalk(null, (r, i) => { got.push(r); infos.push(i); });
  w.feed("a;b;c\n");
  assert.deepEqual(got, [["a;b;c"]]);
  assert.equal(infos[0].wide, 3);
  w.setDelimiter(";");
  w.feed("d;e\n");
  w.end();
  assert.deepEqual(got.at(-1), ["d", "e"]);
  assert.equal(infos.at(-1).wide, 0);
});

test("R28 an open quote at the end is stated in info.open and that field is empty", () => {
  const got = [], infos = [];
  const w = createRecordWalk(",", (r, i) => { got.push(r); infos.push(i); });
  w.feed('a,b\nc,"never closed\nmore');
  w.end();
  assert.deepEqual(got, [["a", "b"], ["c", ""]]);
  assert.equal(infos[0].open, null);
  assert.equal(infos[1].open.col, 2);
  assert.ok(infos[1].open.chars > 0);
});

test("R28 limits.maxColumns keeps that many fields while cols counts them all; an over-long field is listed in over", () => {
  const fields = Array.from({ length: 16385 }, (_, i) => `f${i}`);
  const infos = [], got = [];
  const w = createRecordWalk(",", (r, i) => { got.push(r); infos.push(i); }, { maxColumns: 16384 });
  w.feed(fields.join(",") + "\n");
  w.end();
  assert.equal(got[0].length, 16384);
  assert.equal(infos[0].cols, 16385);
  const big = "x".repeat(40000);
  const o = [];
  const w2 = createRecordWalk(",", (r, i) => o.push([r, i]));
  w2.feed(`a,${big},c\n`);
  w2.end();
  assert.deepEqual(o[0][1].over, [[2, 40000]]);
  assert.equal(o[0][0].length, 3);
  assert.equal(o[0][0][1].length, 40000); /* kept to 1 MiB, so this one is kept whole */
});

test("R28 never throws on a string", () => {
  for (const s of ["", '"', '""', '"\r', "\r", ",", '"a"b"c', '\u0000,\ud800']) {
    assert.doesNotThrow(() => walkRecords(s, ","));
    assert.doesNotThrow(() => walkRecords(s, null));
  }
});
