/* capture-sources: the archive lookup over Memento (RFC 7089), tested at the module's
 * interface (build/requirements/capture-sources.md R37). Each test names R37 in its
 * title and carries its negative control. The archive's answers are the recorded
 * fixtures under `fixtures/memento/` (their README says how they were made); nothing
 * here reaches the network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  WAYBACK_MEMENTO, mementoEndpoints, readHttpDate, acceptDatetime, parseLinkFormat, parseTimeMap, timeMapCandidates,
  readMementoAnswer, mementoRow, mementoHop,
} from "../../../src/capture-sources/memento.mjs";
import { EMPTY_BODY_DIGEST, selectCapture } from "../../../src/cdx.mjs";

const fx = (name) => readFileSync(new URL(`./fixtures/memento/${name}`, import.meta.url), "utf8");
const fxj = (name) => JSON.parse(fx(name));
const ORIG = "https://records.example.gov/minutes/2026-03.pdf";
const WB = "https://web.archive.org/web";
const SHA = "a".repeat(64);
const OTHER = Object.freeze({ name: "Example Archive", via: "arxiv.example.net",
  timegate: "https://arxiv.example.net/timegate/", timemap: "https://arxiv.example.net/timemap/" });

test("R37: an archive is a descriptor naming its TimeGate and TimeMap; the Wayback Machine is one such archive", () => {
  assert.ok(Object.isFrozen(WAYBACK_MEMENTO));
  assert.deepEqual(mementoEndpoints(WAYBACK_MEMENTO, ORIG),
    { timegate: `${WB}/${ORIG}`, timemap: `${WB}/timemap/link/${ORIG}` });
  assert.deepEqual(mementoEndpoints(OTHER, "http://a.example.org"),
    { timegate: "https://arxiv.example.net/timegate/http://a.example.org", timemap: "https://arxiv.example.net/timemap/http://a.example.org" });
  /* The raw form of a Wayback memento is its id_ replay, as R32's; another flag is replaced, not stacked. */
  assert.equal(WAYBACK_MEMENTO.raw(`${WB}/20260303120000/${ORIG}`), `${WB}/20260303120000id_/${ORIG}`);
  assert.equal(WAYBACK_MEMENTO.raw(`${WB}/20260303120000im_/${ORIG}`), `${WB}/20260303120000id_/${ORIG}`);
  assert.equal(WAYBACK_MEMENTO.raw(`${WB}/20260303120000id_/${ORIG}`), `${WB}/20260303120000id_/${ORIG}`);
  /* Negative controls: a descriptor without both https endpoints, an address that is not http(s). */
  for (const a of [null, {}, { timegate: WB + "/" }, { timegate: "http://x.example/", timemap: "https://x.example/" }, "x"])
    assert.equal(mementoEndpoints(a, ORIG), null, JSON.stringify(a));
  for (const addr of ["records.example.gov/x", "ftp://x.example/", "", null, 5]) assert.equal(mementoEndpoints(WAYBACK_MEMENTO, addr), null, String(addr));
});

test("R37: Accept-Datetime and Memento-Datetime are RFC 1123 dates, read and written exactly", () => {
  for (const at of ["20260303120000", "2026-03-03T12:00:00Z", "2026-03-03T12:00:00.000Z", Date.UTC(2026, 2, 3, 12)])
    assert.equal(acceptDatetime(at), "Tue, 03 Mar 2026 12:00:00 GMT", String(at));
  assert.deepEqual(readHttpDate("Tue, 03 Mar 2026 12:00:00 GMT"), { timestamp: "20260303120000", archived_at: "2026-03-03T12:00:00Z" });
  assert.deepEqual(readHttpDate(acceptDatetime("20000620180259")), { timestamp: "20000620180259", archived_at: "2000-06-20T18:02:59Z" });
  /* Negative controls: not an instant; not RFC 1123; a wrong weekday; a day that does not exist. */
  for (const at of [null, undefined, "", "yesterday", "2026", NaN, Infinity, {}]) assert.equal(acceptDatetime(at), null, String(at));
  for (const s of ["2026-03-03T12:00:00Z", "Tue, 3 Mar 2026 12:00:00 GMT", "Tue, 03 Mar 2026 12:00:00 UTC", "Wed, 03 Mar 2026 12:00:00 GMT",
                   "Sun, 31 Feb 2026 12:00:00 GMT", "Tue, 03 Mar 2026 24:00:00 GMT", null, 5])
    assert.equal(readHttpDate(s), null, String(s));
});

test("R37: link-format (RFC 6690, RFC 7089 §5) is read entry by entry, and one malformed entry refuses the whole text", () => {
  const p = parseLinkFormat('<https://a.example/x>; rel="original first", <https://b.example/y>;rel=memento;datetime="Tue, 03 Mar 2026 12:00:00 GMT";title="a, \\"quoted\\"; one"');
  assert.equal(p.ok, true);
  assert.deepEqual(p.links, [
    { uri: "https://a.example/x", rel: ["original", "first"] },
    { uri: "https://b.example/y", rel: ["memento"], datetime: "Tue, 03 Mar 2026 12:00:00 GMT", title: 'a, "quoted"; one' },
  ]);
  assert.deepEqual(parseLinkFormat("  \n "), { ok: true, links: [] });
  /* Negative controls, each naming the entry that failed. */
  const m = parseLinkFormat(fx("timemap-malformed.txt"));
  assert.equal(m.ok, false);
  assert.equal(m.reason, "MEMENTO_LINK_MALFORMED");
  assert.equal(m.entry, 1);
  assert.match(m.detail, /entry 1 does not begin with "<"/);
  for (const [t, entry] of [["<https://a.example/x", 0], ["<>; rel=original", 0], ['<https://a.example/>; rel="original', 0],
                            ["<https://a.example/>; =x", 0], ["<https://a.example/> junk", 0], ["<https://a.example/>, <https://b.example/>; rel=", 1]]) {
    const r = parseLinkFormat(t);
    assert.deepEqual([r.ok, r.reason, r.entry], [false, "MEMENTO_LINK_MALFORMED", entry], t);
  }
  assert.equal(parseLinkFormat(null).reason, "MEMENTO_LINK_MALFORMED");
  assert.equal(parseTimeMap(fx("timemap-malformed.txt")).reason, "MEMENTO_LINK_MALFORMED");
});

test("R37: a TimeMap gives its original, TimeGate and TimeMap, and every memento placed by its own datetime, newest first", () => {
  const w = parseTimeMap(fx("wayback-timemap.txt"));
  assert.equal(w.ok, true);
  assert.equal(w.original, ORIG);
  assert.equal(w.timegate, "https://web.archive.org");
  assert.equal(w.timemap, null, "rel=self is not rel=timemap");
  assert.deepEqual(w.mementos.map((m) => [m.timestamp, m.archived_at]),
    [["20260310093000", "2026-03-10T09:30:00Z"], ["20260303120000", "2026-03-03T12:00:00Z"], ["20260301120000", "2026-03-01T12:00:00Z"]]);
  assert.equal(w.mementos[0].uri, `${WB}/20260310093000/${ORIG}`);
  assert.equal(w.mementos[0].datetime, "Tue, 10 Mar 2026 09:30:00 GMT");
  /* Negative control: the memento with no datetime is refused, never placed (its URI's digits are not read as its time). */
  assert.deepEqual(w.refused, [{ uri: `${WB}/20260305000000/${ORIG}`, refused: "no datetime" }]);
  /* Another archive, in the RFC's own example form. */
  const o = parseTimeMap(fx("rfc7089-timemap.txt"));
  assert.equal(o.ok, true);
  assert.equal(o.original, "http://a.example.org");
  assert.equal(o.timegate, "http://arxiv.example.net/timegate/http://a.example.org");
  assert.deepEqual(o.mementos.map((m) => m.timestamp), ["20091027204954", "20000621011731", "20000620180259"]);
  assert.deepEqual(o.refused, []);
  /* Negative controls: no original; a datetime that is not RFC 1123. */
  const none = parseTimeMap('<https://web.archive.org/web/20260303120000/x>; rel="memento"; datetime="Tue, 03 Mar 2026 12:00:00 GMT"');
  assert.equal(none.reason, "MEMENTO_NO_ORIGINAL");
  const odd = parseTimeMap(`<${ORIG}>; rel=original, <${WB}/1/x>; rel=memento; datetime="2026-03-03"`);
  assert.deepEqual(odd.refused, [{ uri: `${WB}/1/x`, refused: 'datetime "2026-03-03" is not an RFC 1123 date' }]);
  assert.deepEqual(odd.mementos, []);
});

test("R37: the candidates are the mementos at or before the bound, newest first; one outside the window is listed, never tried", () => {
  const w = parseTimeMap(fx("wayback-timemap.txt"));
  const all = timeMapCandidates(w);
  assert.equal(all.ok, true);
  assert.deepEqual(all.candidates.map((m) => m.timestamp), ["20260310093000", "20260303120000", "20260301120000"]);
  assert.deepEqual(all.considered, [{ timestamp: null, uri: `${WB}/20260305000000/${ORIG}`, refused: "no datetime" }]);
  /* Negative control: a memento outside the window. */
  const win = timeMapCandidates(w, { notAfter: "20260304000000" });
  assert.deepEqual(win.candidates.map((m) => m.timestamp), ["20260303120000", "20260301120000"]);
  assert.ok(win.considered.some((c) => c.timestamp === "20260310093000" && c.refused === "later than the requested bound 20260304000000"));
  const empty = timeMapCandidates(w, { notAfter: "20260201000000" });
  assert.equal(empty.ok, false);
  assert.equal(empty.reason, "NO_USABLE_CAPTURE");
  assert.equal(empty.considered.length, 4);
  assert.equal(timeMapCandidates(null).reason, "NO_USABLE_CAPTURE");
});

test("R37: a TimeGate's negotiated redirect is read as where it sends, and a memento as its datetime and its Link relations", () => {
  const g = readMementoAnswer(fxj("timegate-302.json"));
  assert.deepEqual(g, { ok: true, kind: "redirect", status: 302, location: `${WB}/20260303120000/${ORIG}`, vary_accept_datetime: true,
    original: ORIG, timegate: null, timemap: `${WB}/timemap/link/${ORIG}` });
  const m = readMementoAnswer(fxj("memento-200.json"));
  assert.deepEqual(m, { ok: true, kind: "memento", status: 200, memento_uri: `${WB}/20260303120000id_/${ORIG}`,
    memento_datetime: "Tue, 03 Mar 2026 12:00:00 GMT", timestamp: "20260303120000", archived_at: "2026-03-03T12:00:00Z",
    mimetype: "application/pdf", original: ORIG, timegate: `${WB}/${ORIG}`, timemap: `${WB}/timemap/link/${ORIG}` });
  /* Headers as a Headers object read the same. */
  const h = fxj("memento-200.json");
  assert.deepEqual(readMementoAnswer({ ...h, headers: new Headers(h.headers) }), m);
  /* An archived redirect is a memento with its own status. */
  const r = readMementoAnswer(fxj("memento-301.json"));
  assert.deepEqual([r.ok, r.kind, r.status, r.timestamp], [true, "memento", 301, "20260310093000"]);
  /* A relative Location is resolved against the TimeGate's address. */
  assert.equal(readMementoAnswer({ url: `${WB}/${ORIG}`, status: 302, headers: { location: "/web/20260303120000/x" } }).location, `${WB}/20260303120000/x`);
  /* Negative controls: a TimeGate answer with no Memento-Datetime that is not a redirect; a redirect with no Location;
     a Memento-Datetime that is not a date; a memento that names no original; a malformed Link header. */
  const nd = readMementoAnswer(fxj("memento-no-datetime.json"));
  assert.deepEqual([nd.ok, nd.reason], [false, "MEMENTO_NO_DATETIME"]);
  assert.match(nd.detail, /HTTP 200.*no Memento-Datetime/);
  assert.equal(readMementoAnswer({ url: "x", status: 302, headers: {} }).reason, "MEMENTO_NOT_NEGOTIATED");
  assert.equal(readMementoAnswer({ status: 200, headers: { "Memento-Datetime": "2026-03-03", Link: `<${ORIG}>; rel=original` } }).reason, "MEMENTO_BAD_DATETIME");
  assert.equal(readMementoAnswer({ status: 200, headers: { "Memento-Datetime": "Tue, 03 Mar 2026 12:00:00 GMT" } }).reason, "MEMENTO_NO_ORIGINAL");
  assert.equal(readMementoAnswer({ status: 200, headers: { "Memento-Datetime": "Tue, 03 Mar 2026 12:00:00 GMT", Link: "nope" } }).reason, "MEMENTO_LINK_MALFORMED");
  assert.equal(readMementoAnswer().reason, "MEMENTO_NO_DATETIME");
});

test("R37: a fetched memento feeds the same selection as a CDX row: 200 only, non-empty only, within the bound", () => {
  const ok = mementoRow(readMementoAnswer(fxj("memento-200.json")), { sha256: SHA.toUpperCase(), bytes: 6255 });
  assert.deepEqual(ok, { urlkey: null, timestamp: "20260303120000", original: ORIG, mimetype: "application/pdf", statuscode: "200", digest: SHA });
  const redirect = mementoRow(readMementoAnswer(fxj("memento-301.json")), { sha256: SHA, bytes: 0 });
  const s = selectCapture([redirect, ok]);
  assert.equal(s.ok, true);
  assert.deepEqual(s.chosen, { urlkey: null, timestamp: "20260303120000", archived_at: "2026-03-03T12:00:00Z", original: ORIG,
    mimetype: "application/pdf", statuscode: "200", digest: SHA, warc_record_length: null });
  assert.deepEqual(s.rejected, [{ timestamp: "20260310093000", refused: "statuscode 301, not 200" }]);
  /* Negative controls: an empty memento is refused by R29's own reason; one outside the window by R30's. */
  const emptyRow = mementoRow(readMementoAnswer(fxj("memento-200.json")), { sha256: SHA, bytes: 0 });
  assert.equal(emptyRow.digest, EMPTY_BODY_DIGEST);
  assert.deepEqual(selectCapture([emptyRow]).considered, [{ timestamp: "20260303120000", refused: "digest is the empty-body digest: the capture holds nothing" }]);
  assert.deepEqual(selectCapture([ok], { notAfter: "20260302000000" }).considered,
    [{ timestamp: "20260303120000", refused: "later than the requested bound 20260302000000" }]);
  /* Not a memento, or no digest of the plane's: no row. */
  for (const a of [readMementoAnswer(fxj("timegate-302.json")), readMementoAnswer(fxj("memento-no-datetime.json")), null])
    assert.equal(mementoRow(a, { sha256: SHA, bytes: 1 }), null);
  for (const sha256 of [undefined, "", "abc", "z".repeat(64), "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"])
    assert.equal(mementoRow(readMementoAnswer(fxj("memento-200.json")), { sha256, bytes: 1 }), null, String(sha256));
});

test("R37: the memento's hop is R34's shape for any archive, every fact from what the archive answered, never from the request", () => {
  const answer = readMementoAnswer(fxj("memento-200.json"));
  const chosen = selectCapture([mementoRow(answer, { sha256: SHA, bytes: 6255 })]).chosen;
  const h = mementoHop(chosen, answer.memento_uri, { archive: WAYBACK_MEMENTO, answer });
  assert.deepEqual(Object.keys(h).sort(), ["asserts", "bound", "document_address", "evidence", "unsigned_reason", "via", "who"]);
  assert.equal(h.who, "Internet Archive Wayback Machine");
  assert.equal(h.via, "archive.org");
  assert.equal(h.asserts, `these bytes were served for ${ORIG} at 2026-03-03T12:00:00Z, with HTTP status 200`);
  for (const part of ["Memento-Datetime: Tue, 03 Mar 2026 12:00:00 GMT", `memento ${WB}/20260303120000id_/${ORIG}`, `rel="original" ${ORIG}`,
    `rel="timegate" ${WB}/${ORIG}`, `rel="timemap" ${WB}/timemap/link/${ORIG}`, "mimetype application/pdf",
    `SHA-256 ${SHA}, computed by your group's Civicsmith over the bytes it received, not a digest the archive stated`])
    assert.ok(h.evidence.includes(part), part);
  assert.equal(h.bound, false);
  assert.match(h.unsigned_reason, /no cryptographic attestation exists over a Internet Archive Wayback Machine memento; this is a dated third-party claim we are trusting, not verifying/);
  assert.equal(h.document_address, ORIG);
  /* Another archive names itself. */
  const o = mementoHop(chosen, "https://arxiv.example.net/web/x", { archive: OTHER, answer });
  assert.deepEqual([o.who, o.via], ["Example Archive", "arxiv.example.net"]);
  /* Negative control: the address the caller asked about is not the document address; the archive's rel="original" is.
     A TimeGate asked for one address that answers a memento of another records the other. */
  const asked = "https://records.example.gov/asked-for.pdf";
  const moved = readMementoAnswer({ url: `${WB}/20260303120000id_/${asked}`, status: 200,
    headers: { "Memento-Datetime": "Tue, 03 Mar 2026 12:00:00 GMT", Link: `<${ORIG}>; rel="original"` } });
  assert.equal(moved.original, ORIG);
  const mh = mementoHop(selectCapture([mementoRow(moved, { sha256: SHA, bytes: 1 })]).chosen, moved.memento_uri, { answer: moved });
  assert.equal(mh.document_address, ORIG);
  assert.ok(!mh.asserts.includes(asked));
  /* With no answer recorded, the hop says so rather than inventing a datetime. */
  assert.ok(mementoHop(chosen, answer.memento_uri).evidence.includes("no Memento-Datetime was recorded with this hop"));
});
