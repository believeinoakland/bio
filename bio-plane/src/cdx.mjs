/* Reading a Wayback CDX index, and deciding which row (if any) may stand in for
 * a document we cannot reach directly.
 *
 * PURE ON PURPOSE. Every judgement the archive fallback makes lives here and
 * none of the plumbing does, so the rules can be asserted against fixtures in
 * milliseconds and the network path has nothing to decide.
 *
 * Everything below is written against MEASURED behaviour, 2026-07-31, through
 * the plane's own egress (MEASUREMENTS.md). Three of the assumptions the design
 * document carried were wrong, and each one is a refusal here rather than a
 * comment:
 *
 *   1. `length` is the COMPRESSED WARC RECORD SIZE, not the body length. A row
 *      declaring 6255 fetched at 32,564 bytes. It is never a fixity check and
 *      never a size check on our bytes, so nothing here compares it to anything.
 *   2. A shared digest can mean an EMPTY BODY. 3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ
 *      is base32(SHA-1(empty)) and appeared twice in a five-row sample, on two
 *      301s. Digest equality that costs nothing to produce is not evidence, so
 *      the empty digest is excluded by name.
 *   3. Most rows are not 200. Three of five sampled were usable. A fallback
 *      taking "the most recent row" records a redirect as the document.
 *
 * The through-line is the same one D-104 encodes for governed refusals: an
 * equality or an outcome that costs nothing to produce must never be read as
 * evidence.
 */

/** base32(SHA-1("")). Wayback computes its digest over the response BODY, so
 *  every empty-bodied capture in the index carries this exact value. Two rows
 *  agreeing on it agree on nothing. */
export const EMPTY_BODY_DIGEST = "3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ";

/** MEASURED: `output=json` returns an ARRAY OF ARRAYS whose first element is a
 *  header row, not an array of objects. Read by mapping the header rather than
 *  by column position, because the column set is theirs to change. */
export function parseCdx(text) {
  let raw;
  try { raw = JSON.parse(text); } catch (e) { return { ok: false, reason: "CDX_UNPARSEABLE", detail: String(e && e.message || e) }; }
  if (!Array.isArray(raw)) return { ok: false, reason: "CDX_NOT_AN_ARRAY" };
  if (raw.length === 0) return { ok: true, rows: [] };
  const header = raw[0];
  if (!Array.isArray(header) || !header.includes("timestamp") || !header.includes("original")) {
    return { ok: false, reason: "CDX_NO_HEADER", detail: "the first row does not name timestamp and original" };
  }
  const rows = [];
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i];
    if (!Array.isArray(r)) continue;
    const o = {};
    for (let c = 0; c < header.length; c++) o[header[c]] = r[c];
    rows.push(o);
  }
  return { ok: true, rows };
}

const TS_RE = /^\d{14}$/;

/** The 14-digit CDX timestamp as an ISO instant. Their format is
 *  YYYYMMDDhhmmss in UTC. */
export function cdxTimestampToIso(ts) {
  if (!TS_RE.test(String(ts || ""))) return null;
  const s = String(ts);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}Z`;
}

/** Is this row a capture that could stand in for the document?
 *
 *  Returns null when it is usable, or the reason it is not. Stated as reasons
 *  rather than a boolean because an operator asking "why did the fallback not
 *  fire" deserves an answer per row. */
export function rowRefusal(row) {
  if (!row || typeof row !== "object") return "not a row";
  if (!TS_RE.test(String(row.timestamp || ""))) return "timestamp is not 14 digits";
  if (typeof row.original !== "string" || !row.original) return "no original URL";
  /* MEASURED (3): most rows are not 200. A 301 is the archive faithfully
     recording a redirect, which is a true fact about that fetch and not a copy
     of the document. */
  if (String(row.statuscode) !== "200") return `statuscode ${row.statuscode}, not 200`;
  /* MEASURED (2): the empty-body digest. */
  if (!row.digest) return "no digest";
  if (String(row.digest) === EMPTY_BODY_DIGEST) return "digest is the empty-body digest: the capture holds nothing";
  return null;
}

/** Choose the capture to fall back to.
 *
 *  Newest usable row wins. "Newest" and not "closest to some target date":
 *  the fallback fires because we cannot reach the document NOW, so the most
 *  recent thing the archive holds is the best available answer to the question
 *  actually being asked.
 *
 *  Every rejected row is returned with its reason. A fallback that says only
 *  "nothing suitable" when the index holds forty redirects is unauditable. */
export function selectCapture(rows, { notAfter = null } = {}) {
  const considered = [], usable = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const why = rowRefusal(r);
    if (why) { considered.push({ timestamp: r && r.timestamp, refused: why }); continue; }
    if (notAfter && String(r.timestamp) > String(notAfter)) {
      considered.push({ timestamp: r.timestamp, refused: `later than the requested bound ${notAfter}` });
      continue;
    }
    usable.push(r);
  }
  if (!usable.length) {
    return { ok: false, reason: "NO_USABLE_CAPTURE",
             detail: "the index holds no 200 response with a non-empty body for this address",
             considered };
  }
  usable.sort((a, b) => (String(a.timestamp) < String(b.timestamp) ? 1 : -1));
  const chosen = usable[0];
  return {
    ok: true,
    chosen: {
      timestamp: chosen.timestamp,
      archived_at: cdxTimestampToIso(chosen.timestamp),
      original: chosen.original,
      mimetype: chosen.mimetype || null,
      statuscode: String(chosen.statuscode),
      digest: chosen.digest,
      /* Carried but explicitly NOT used as a size or fixity check. MEASURED:
         it is the compressed WARC record size. Recorded so the provenance hop
         can state their claim verbatim, never so anything can compare it. */
      warc_record_length: chosen.length === undefined ? null : String(chosen.length),
    },
    rejected: considered,
    usable_count: usable.length,
  };
}

/** The replay address that returns the archived bytes without the Wayback
 *  overlay or link rewriting. MEASURED: `id_` works and returns the raw body. */
export function replayLocator(chosen) {
  if (!chosen || !TS_RE.test(String(chosen.timestamp || ""))) return null;
  return `https://web.archive.org/web/${chosen.timestamp}id_/${chosen.original}`;
}

/** The CDX query for one document address. `limit` is negative on purpose:
 *  Wayback reads a negative limit as "the last N rows", so the newest captures
 *  arrive without paging the whole index of a URL that may have thousands. */
export function cdxQuery(address, { limit = 40 } = {}) {
  const u = new URL("https://web.archive.org/cdx/search/cdx");
  u.searchParams.set("url", String(address).replace(/^https?:\/\//, ""));
  u.searchParams.set("output", "json");
  u.searchParams.set("limit", String(-Math.abs(limit)));
  u.searchParams.set("fl", "urlkey,timestamp,original,mimetype,statuscode,digest,length");
  return u.toString();
}

/** The SECOND hop of the provenance chain, and it is deliberately weaker than
 *  the first.
 *
 *  What an archive gives us is a named party's dated, machine-readable,
 *  internally consistent claim. Nothing about it is signed: there is no
 *  attestation over a Wayback capture and no timestamp token. So `bound` is
 *  false and the honest word for what this is appears in the text. We are
 *  trusting the Archive's operational integrity, not verifying it, and the
 *  chain says so rather than implying otherwise by omission.
 *
 *  RULED: transitive trust is accepted where DISCLOSED in the chain, with grade
 *  and confidence adjusted, and what is inherited is the FACT OF PUBLICATION,
 *  never the credibility of the content. */
export function archiveHop(chosen, replay, { mementoDatetime = null, warcSource = null } = {}) {
  return {
    who: "Internet Archive Wayback Machine",
    asserts: `these bytes were served for ${chosen.original} at ${chosen.archived_at}, with HTTP status ${chosen.statuscode}`,
    evidence: [
      `CDX record: timestamp ${chosen.timestamp}, digest ${chosen.digest} (base32 SHA-1, over the body as they stored it)`,
      chosen.mimetype ? `mimetype ${chosen.mimetype}` : null,
      chosen.warc_record_length ? `WARC record length ${chosen.warc_record_length}, which is THEIR compressed record size and not the length of what we received` : null,
      mementoDatetime ? `Memento-Datetime: ${mementoDatetime}` : null,
      warcSource ? `x-archive-src: ${warcSource}` : null,
      `replayed from ${replay}`,
    ].filter(Boolean).join("; "),
    /* Not cryptographic, and said plainly. This is delegated attestation. */
    bound: false,
    unsigned_reason: "no cryptographic attestation exists over a Wayback capture; this is a dated third-party claim we are trusting, not verifying",
    via: "archive.org",
  };
}
