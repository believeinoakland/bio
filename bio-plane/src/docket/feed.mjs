/* docket's Atom feed (requirements: `build/requirements/docket.md` R15, R23; DEC-116 item 8). Pure: it renders the
 * entries `docketPublic` answers as an Atom 1.0 feed (RFC 4287), newest first, and reads, writes and records nothing.
 * Each entry links to the case's docket at its fixed address on the group's public path (`public-read` R21). */

/** R23: the docket's public address for a case, in the house form of the public read path (`public-read` R20, R21):
 *  the query alone, no leading `?`. */
export const docketAddress = (caseId) => `op=docketpublic&case=${encodeURIComponent(caseId)}`;
/** R23: the feed's own fixed address, in the same form. */
export const feedAddress = (caseId) => `op=docketfeed&case=${encodeURIComponent(caseId)}`;
/** R23: an address as an `href` inside the feed: a query-only relative reference (RFC 3986 §4.2), which resolves
 *  against the feed's own address. */
export const feedHref = (address) => `?${address}`;
export const ATOM_MEDIA_TYPE = "application/atom+xml";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/* RFC 3339 for a stored instant; a bare date is read as its UTC midnight. */
const instant = (v) => {
  const s = String(v ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00Z` : s;
};

/** R15: `pub` is `docketPublic`'s answer; `updatedFallback` the instant the feed answers as `updated` when the case has
 *  no public entry yet (its latest edition's ratification). */
export function renderFeed(pub, updatedFallback) {
  const entries = [...pub.entries].sort((a, b) => b.seq - a.seq);
  const last = entries[0];
  const updated = instant(last ? last.published_at : updatedFallback);
  const group = pub.group || "";
  const lines = [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<feed xmlns="http://www.w3.org/2005/Atom">`,
    `  <id>urn:civicos:docket:${esc(group)}:${esc(pub.case)}</id>`,
    `  <title>${esc(`${group} docket: ${pub.case}`)}</title>`,
    `  <updated>${esc(updated)}</updated>`,
    `  <author><name>${esc(group)}</name></author>`,
    `  <link rel="self" type="${ATOM_MEDIA_TYPE}" href="${esc(feedHref(feedAddress(pub.case)))}"/>`,
    `  <link rel="alternate" type="application/json" href="${esc(feedHref(docketAddress(pub.case)))}"/>`,
  ];
  for (const e of entries) {
    const j = e.fields || {};
    const title = [j.kind, j.edition != null ? `edition ${j.edition}` : null, e.taken_back ? "taken back" : null]
      .filter(Boolean).join(", ");
    lines.push(
      `  <entry>`,
      `    <id>urn:civicos:docket:${esc(group)}:${esc(pub.case)}:${e.seq}</id>`,
      `    <title>${esc(`#${e.seq} ${title}`)}</title>`,
      `    <updated>${esc(instant(e.published_at))}</updated>`,
      `    <published>${esc(instant(e.published_at))}</published>`,
      `    <link rel="alternate" type="application/json" href="${esc(feedHref(docketAddress(pub.case)))}"/>`,
      `    <category term="${esc(j.shelf)}"/>`,
      `    <content type="text">${esc(e.json)}</content>`,
      `  </entry>`);
  }
  lines.push(`</feed>`, "");
  return lines.join("\n");
}
