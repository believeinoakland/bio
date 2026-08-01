/* NEGATIVE CONTROL: (run 2026-07-31) neuter rowRefusal to always return null (admit every archive row) -> 12 assertions fail (the three measured refusals, the whole selection block, the derived instant) and the suite then throws TypeError at the considered-rows check; restored, 37 pass. */
/* Reading a CDX index, tested against the bytes archive.org actually returned.
 *
 * The fixture below is VERBATIM from the 2026-07-31 measurement through the
 * plane's own egress (MEASUREMENTS.md), not something written to make the code
 * pass. That matters: all three of this module's refusals exist because the
 * real response contradicted the design document, and a hand-written fixture
 * would have reproduced the document's assumptions rather than reality.
 *
 * Negative-control detail: neuter rowRefusal to always return null (admit every archive row) -> 12 assertions fail (the three measured refusals, the whole selection block, the derived instant) and the suite then throws TypeError at the considered-rows check; restored, 37 pass.
 */
import { parseCdx, selectCapture, replayLocator, cdxQuery, cdxTimestampToIso,
         rowRefusal, archiveHop, EMPTY_BODY_DIGEST } from "../src/cdx.mjs";
import { createHash } from "node:crypto";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* Exactly what the plane received for url=www.oaklandca.gov&limit=5. */
const REAL = `[["urlkey","timestamp","original","mimetype","statuscode","digest","length"],
["gov,oaklandca)/","20180427023914","http://www.oaklandca.gov:80/","text/html","200","3BCPSIHGOCJ7ZRCJRSF5DRI5AD7BDOR6","6093"],
["gov,oaklandca)/","20180427140108","http://oaklandca.gov/","unk","301","3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ","327"],
["gov,oaklandca)/","20180427140319","http://www.oaklandca.gov/","text/html","200","QSXRIRLNWMWOLQAQF2JYBFDQ7METVPMO","6249"],
["gov,oaklandca)/","20180427140438","https://www.oaklandca.gov/","text/html","200","363S4MF44CU6AKEZJEBRIG3ZQOXMPSWI","6255"],
["gov,oaklandca)/","20180428032017","http://oaklandca.gov/","unk","301","3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ","327"]]`;

console.log("\n--- the empty-body digest is what it claims to be ---");
{
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const d = createHash("sha1").update(Buffer.alloc(0)).digest();
  let bits = 0, val = 0, out = "";
  for (const b of d) { val = (val << 8) | b; bits += 8; while (bits >= 5) { out += A[(val >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += A[(val << (5 - bits)) & 31];
  t("the constant is base32(SHA-1(empty)), computed rather than copied", out, EMPTY_BODY_DIGEST);
}

console.log("\n--- parsing their actual shape ---");
const parsed = parseCdx(REAL);
t("the real response parses", parsed.ok, true);
t("five rows, header excluded", parsed.rows.length, 5);
t("read by header name, not column position", parsed.rows[0].digest, "3BCPSIHGOCJ7ZRCJRSF5DRI5AD7BDOR6");
t("an empty index is not an error", parseCdx("[]"), { ok: true, rows: [] });
t("garbage is refused by name", parseCdx("not json").reason, "CDX_UNPARSEABLE");
t("an array of objects is refused: their format is arrays with a header",
  parseCdx('[{"timestamp":"1"}]').reason, "CDX_NO_HEADER");
t("a 14-digit timestamp becomes an instant", cdxTimestampToIso("20180427140438"), "2018-04-27T14:04:38Z");
t("and a malformed one becomes null, never a guess", cdxTimestampToIso("2018"), null);

console.log("\n--- the three measured refusals ---");
const rows = parsed.rows;
t("a 301 is refused for its status", /statuscode 301/.test(rowRefusal(rows[1])), true);
t("and the empty-body digest is named as its own reason",
  rowRefusal({ timestamp: "20180427140438", original: "https://x.gov/", statuscode: "200", digest: EMPTY_BODY_DIGEST }),
  "digest is the empty-body digest: the capture holds nothing");
t("a usable row is not refused", rowRefusal(rows[3]), null);
t("a row with no digest is refused",
  rowRefusal({ timestamp: "20180427140438", original: "https://x.gov/", statuscode: "200" }), "no digest");

console.log("\n--- selection over the real five rows ---");
const sel = selectCapture(rows);
t("a capture is selected", sel.ok, true);
t("the NEWEST usable row wins, not the newest row", sel.chosen.timestamp, "20180427140438");
t("which is a 200", sel.chosen.statuscode, "200");
t("three of five were usable", sel.usable_count, 3);
t("and the two rejects are reported with reasons, not silently dropped", sel.rejected.length, 2);
t("the newest row overall was a 301 and was NOT chosen",
  rows[rows.length - 1].timestamp === "20180428032017" && sel.chosen.timestamp !== "20180428032017", true);
t("their length is carried as a WARC record size, never as a body length",
  sel.chosen.warc_record_length, "6255");
t("the archived instant is derived", sel.chosen.archived_at, "2018-04-27T14:04:38Z");

console.log("\n--- an index with nothing usable refuses, and says why per row ---");
const onlyBad = selectCapture(parseCdx(`[["urlkey","timestamp","original","mimetype","statuscode","digest","length"],
["gov,x)/","20200101000000","http://x.gov/","unk","301","${EMPTY_BODY_DIGEST}","327"],
["gov,x)/","20200102000000","http://x.gov/","text/html","404","ABC","500"]]`).rows);
t("refused", onlyBad.ok, false);
t("by name", onlyBad.reason, "NO_USABLE_CAPTURE");
t("with a reason for every row considered", onlyBad.considered.length, 2);
t("an empty index refuses too", selectCapture([]).reason, "NO_USABLE_CAPTURE");

console.log("\n--- the replay address and the query ---");
t("the id_ suffix is used, so no overlay or link rewriting is captured",
  replayLocator(sel.chosen), "https://web.archive.org/web/20180427140438id_/https://www.oaklandca.gov/");
t("a malformed choice yields no locator", replayLocator({ timestamp: "x" }), null);
{
  const q = new URL(cdxQuery("https://www.oaklandca.gov/agenda.pdf"));
  t("the query asks for json", q.searchParams.get("output"), "json");
  t("the scheme is stripped from the url parameter", q.searchParams.get("url"), "www.oaklandca.gov/agenda.pdf");
  t("the limit is NEGATIVE, so the newest rows come back without paging the index",
    q.searchParams.get("limit"), "-40");
}

console.log("\n--- the second hop is weaker, and says so ---");
const hop = archiveHop(sel.chosen, replayLocator(sel.chosen),
  { mementoDatetime: "Fri, 27 Apr 2018 14:04:38 GMT", warcSource: "ARCHIVEIT-10368-ONE_TIME-JOB568626-...warc.gz" });
t("the attestor is named", hop.who, "Internet Archive Wayback Machine");
t("it is NOT cryptographically bound", hop.bound, false);
t("and the chain says why in words rather than by omission",
  /no cryptographic attestation/.test(hop.unsigned_reason), true);
t("the hop is marked archive.org, which is what splits it from a direct capture", hop.via, "archive.org");
t("their length is disclosed AS their record size, so nobody reads it as ours",
  /not the length of what we received/.test(hop.evidence), true);
t("the Memento datetime is carried as evidence", /Memento-Datetime/.test(hop.evidence), true);
t("and the source WARC is named", /x-archive-src/.test(hop.evidence), true);

console.log(`\ncdx: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
