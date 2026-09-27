/* capture-sources: the web archive (`cdx.mjs`), tested at the module's interface
 * (build/requirements/capture-sources.md R27–R37, R51, R52). Each test names the
 * requirement id it checks in its title. The CDX answers below are this file's, in the
 * shape measured 2026-07-31 (an array of arrays whose first row is the header). */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_BODY_DIGEST, parseCdx, cdxTimestampToIso, rowRefusal, selectCapture, replayLocator, cdxQuery, archiveHop,
} from "../../../src/cdx.mjs";

const ORIG = "https://records.example.gov/minutes/2026-03.pdf";
const KEY = "gov,example,records)/minutes/2026-03.pdf";
const HEADER = ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"];
const row = (ts, over = {}) => ({ urlkey: KEY, timestamp: ts, original: ORIG, mimetype: "application/pdf",
  statuscode: "200", digest: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", length: "6255", ...over });

test("R27: parseCdx reads an output=json answer by its header, and refuses by name", () => {
  const text = JSON.stringify([HEADER, [KEY, "20260301120000", ORIG, "application/pdf", "200", "D1", "10"], "junk", null,
                                     [KEY, "20260302120000", ORIG]]);
  const p = parseCdx(text);
  assert.equal(p.ok, true);
  assert.deepEqual(p.rows, [
    { urlkey: KEY, timestamp: "20260301120000", original: ORIG, mimetype: "application/pdf", statuscode: "200", digest: "D1", length: "10" },
    { urlkey: KEY, timestamp: "20260302120000", original: ORIG, mimetype: undefined, statuscode: undefined, digest: undefined, length: undefined },
  ]);
  /* Keyed by the header's names, not by position. */
  const moved = parseCdx(JSON.stringify([["original", "timestamp"], [ORIG, "20260301120000"]]));
  assert.deepEqual(moved.rows, [{ original: ORIG, timestamp: "20260301120000" }]);
  assert.deepEqual(parseCdx("[]"), { ok: true, rows: [] });
  const bad = parseCdx("{not json");
  assert.equal(bad.reason, "CDX_UNPARSEABLE");
  assert.equal(typeof bad.detail, "string");
  assert.deepEqual(parseCdx('{"a":1}'), { ok: false, reason: "CDX_NOT_AN_ARRAY" });
  for (const t of ['[["urlkey","original"]]', '[["timestamp"]]', '["timestamp","original"]', "[5]"])
    assert.equal(parseCdx(t).reason, "CDX_NO_HEADER", t);
  for (const v of [undefined, null, 5, {}]) assert.equal(parseCdx(v).ok, false);
});

test("R28: cdxTimestampToIso reads 14 digits as a UTC instant, else null", () => {
  assert.equal(cdxTimestampToIso("20260301120509"), "2026-03-01T12:05:09Z");
  assert.equal(cdxTimestampToIso(20260301120509), "2026-03-01T12:05:09Z");
  for (const v of ["2026030112050", "202603011205090", "2026-03-01", "abcdefghijklmn", "", null, undefined])
    assert.equal(cdxTimestampToIso(v), null, String(v));
});

test("R29: rowRefusal gives each reason in order, null for a row that may stand in", () => {
  assert.equal(EMPTY_BODY_DIGEST, "3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ");
  assert.equal(rowRefusal(row("20260301120000")), null);
  assert.equal(rowRefusal(row("20260301120000", { statuscode: 200 })), null);
  assert.equal(rowRefusal(null), "not a row");
  assert.equal(rowRefusal("x"), "not a row");
  assert.equal(rowRefusal(row("2026", { original: "" })), "timestamp is not 14 digits");
  assert.equal(rowRefusal(row("20260301120000", { original: "", statuscode: "301" })), "no original URL");
  assert.equal(rowRefusal(row("20260301120000", { statuscode: "301", digest: "" })), "statuscode 301, not 200");
  assert.equal(rowRefusal(row("20260301120000", { statuscode: "-" })), "statuscode -, not 200");
  assert.equal(rowRefusal(row("20260301120000", { digest: "" })), "no digest");
  assert.equal(rowRefusal(row("20260301120000", { digest: EMPTY_BODY_DIGEST })), "digest is the empty-body digest: the capture holds nothing");
});

test("R30: every refused or too-late row is listed with its reason; none usable is NO_USABLE_CAPTURE", () => {
  const rows = [row("20260301120000", { statuscode: "301" }), row("20260302120000", { digest: EMPTY_BODY_DIGEST }),
                row("20260305120000"), null];
  const s = selectCapture(rows, { notAfter: "20260304000000" });
  assert.equal(s.ok, false);
  assert.equal(s.reason, "NO_USABLE_CAPTURE");
  assert.equal(typeof s.detail, "string");
  assert.deepEqual(s.considered, [
    { timestamp: "20260301120000", refused: "statuscode 301, not 200" },
    { timestamp: "20260302120000", refused: "digest is the empty-body digest: the capture holds nothing" },
    { timestamp: "20260305120000", refused: "later than the requested bound 20260304000000" },
    { timestamp: null, refused: "not a row" },
  ]);
  assert.equal(selectCapture(null).reason, "NO_USABLE_CAPTURE");
  assert.deepEqual(selectCapture([]).considered, []);
});

test("R31: the newest usable row is chosen, whole, and the record length is carried verbatim", () => {
  const rows = [row("20260301120000", { length: 111 }), row("20260310120000", { statuscode: "302" }),
                row("20260303120000", { length: 333, digest: "NEWESTUSABLE" }), row("20260302120000")];
  const s = selectCapture(rows);
  assert.equal(s.ok, true);
  assert.deepEqual(s.chosen, { urlkey: KEY, timestamp: "20260303120000", archived_at: "2026-03-03T12:00:00Z", original: ORIG,
    mimetype: "application/pdf", statuscode: "200", digest: "NEWESTUSABLE", warc_record_length: "333" });
  assert.deepEqual(s.rejected, [{ timestamp: "20260310120000", refused: "statuscode 302, not 200" }]);
  assert.equal(s.usable_count, 3);
  const bare = selectCapture([row("20260301120000", { mimetype: undefined, length: undefined })]).chosen;
  assert.deepEqual([bare.mimetype, bare.warc_record_length], [null, null]);
  /* notAfter keeps the newest row at or before the bound. */
  assert.equal(selectCapture(rows, { notAfter: "20260302120000" }).chosen.timestamp, "20260302120000");
});

test("R32: replayLocator is the raw id_ replay of the chosen row, or null", () => {
  assert.equal(replayLocator({ timestamp: "20260303120000", original: ORIG }), `https://web.archive.org/web/20260303120000id_/${ORIG}`);
  for (const c of [null, {}, { timestamp: "2026", original: ORIG }]) assert.equal(replayLocator(c), null);
});

test("R33: cdxQuery asks for the newest rows of the address, with the named fields", () => {
  const u = new URL(cdxQuery("https://records.example.gov/a?b=1"));
  assert.equal(`${u.origin}${u.pathname}`, "https://web.archive.org/cdx/search/cdx");
  assert.equal(u.searchParams.get("url"), "records.example.gov/a?b=1");
  assert.equal(u.searchParams.get("output"), "json");
  assert.equal(u.searchParams.get("limit"), "-40");
  assert.equal(u.searchParams.get("fl"), "urlkey,timestamp,original,mimetype,statuscode,digest,length");
  assert.equal(new URL(cdxQuery("http://x.example/", { limit: 5 })).searchParams.get("limit"), "-5");
  assert.equal(new URL(cdxQuery("x.example/", { limit: -7 })).searchParams.get("limit"), "-7");
  assert.equal(new URL(cdxQuery("http://x.example/")).searchParams.get("url"), "x.example/");
});

const chosen = () => selectCapture([row("20260303120000")]).chosen;
const REPLAY = `https://web.archive.org/web/20260303120000id_/${ORIG}`;

test("R34: archiveHop states the archive's dated claim, unsigned and saying why", () => {
  const h = archiveHop(chosen(), REPLAY, { mementoDatetime: "Tue, 03 Mar 2026 12:00:00 GMT", warcSource: "ia-crawl-1.warc.gz" });
  assert.deepEqual(Object.keys(h).sort(), ["asserts", "bound", "document_address", "evidence", "unsigned_reason", "via", "who"]);
  assert.equal(h.who, "Internet Archive Wayback Machine");
  assert.equal(h.asserts, `these bytes were served for ${ORIG} at 2026-03-03T12:00:00Z, with HTTP status 200`);
  for (const part of ["timestamp 20260303120000", "digest ABCDEFGHIJKLMNOPQRSTUVWXYZ234567 (base32 SHA-1, over the body as they stored it)",
    "mimetype application/pdf", "WARC record length 6255, which is THEIR compressed record size and not the length of what we received",
    "Memento-Datetime: Tue, 03 Mar 2026 12:00:00 GMT", "x-archive-src: ia-crawl-1.warc.gz", `replayed from ${REPLAY}`])
    assert.ok(h.evidence.includes(part), part);
  assert.equal(h.bound, false);
  assert.match(h.unsigned_reason, /no cryptographic attestation.*dated third-party claim we are trusting, not verifying/);
  assert.equal(h.via, "archive.org");
  assert.equal(h.document_address, ORIG);
  const plain = archiveHop(selectCapture([row("20260303120000", { mimetype: undefined, length: undefined })]).chosen, REPLAY);
  assert.ok(!/Memento|x-archive-src|mimetype|WARC/.test(plain.evidence));
});

test("R35: every fact in the hop comes from the CDX record and the replay, never from a request", () => {
  const c = chosen();
  const h = archiveHop(c, REPLAY);
  /* The same record gives the same hop whatever else the caller holds; and a change in the
     record is a change in the hop. The function takes no request at all. */
  assert.equal(archiveHop.length, 2);
  assert.deepEqual(archiveHop({ ...c }, REPLAY), h);
  const other = archiveHop({ ...c, original: "https://elsewhere.example.org/x" }, REPLAY);
  assert.equal(other.document_address, "https://elsewhere.example.org/x");
  assert.ok(other.asserts.includes("https://elsewhere.example.org/x"));
});

test("R36: the chosen capture keeps the CDX urlkey and the hop's evidence names it", () => {
  const c = chosen();
  assert.equal(c.urlkey, KEY);
  assert.ok(archiveHop(c, REPLAY).evidence.includes(`CDX urlkey ${KEY}`));
  /* Through a parsed index, as the caller reads one. */
  const p = parseCdx(JSON.stringify([HEADER, [KEY, "20260303120000", ORIG, "text/html", "200", "D9", "99"]]));
  assert.ok(archiveHop(selectCapture(p.rows).chosen, REPLAY).evidence.includes(`CDX urlkey ${KEY}`));
  /* An index row with no urlkey: stated, never invented. */
  const none = selectCapture([row("20260303120000", { urlkey: undefined })]).chosen;
  assert.equal(none.urlkey, null);
  assert.ok(archiveHop(none, REPLAY).evidence.includes("the CDX record carried no urlkey"));
});

/* R37 (Memento, RFC 7089) is not yet met and unscheduled (K48): the lookup speaks the
   Wayback CDX only. It is named here so the coverage check sees it, and left as a todo
   rather than a test of the current state, which would pin the gap. */
test.todo("R37: the archive lookup speaks Memento (RFC 7089); not yet met, unscheduled (K48)");

test("R52: equality that costs nothing is not evidence: length never compared, empty digest and non-200 never chosen", () => {
  /* Two rows that differ only in length: the newer wins whatever the lengths say. */
  const s = selectCapture([row("20260301120000", { length: "1" }), row("20260302120000", { length: "999999" })]);
  assert.equal(s.chosen.timestamp, "20260302120000");
  const t = selectCapture([row("20260301120000", { length: "999999" }), row("20260302120000", { length: "1" })]);
  assert.equal(t.chosen.timestamp, "20260302120000");
  const only = selectCapture([row("20260309120000", { digest: EMPTY_BODY_DIGEST }), row("20260308120000", { statuscode: "404" }),
                              row("20260301120000")]);
  assert.equal(only.chosen.timestamp, "20260301120000");
});
